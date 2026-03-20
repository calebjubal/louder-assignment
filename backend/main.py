from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import UTC, datetime
import json
import logging
import re
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware

from db.supabase import SupabaseRepository
from models import ProposalRecord, ProposalRequest, VenueProposal
from services.proposal_llm import ProposalLlmService
from settings import settings


logger = logging.getLogger("event-concierge")


def _to_record(row: dict[str, Any]) -> ProposalRecord:
    return ProposalRecord(
        _id=row["id"],
        user_id=row["user_id"],
        session_id=row["session_id"],
        request=row["request"],
        proposal=VenueProposal(**row["proposal"]),
        created_at=row["created_at"],
    )


def _fallback_proposal(prompt: str) -> VenueProposal:
    budget_match = re.search(r"\$?([\d,]+)\s*(k|K)?", prompt)
    location_match = re.search(r"in\s+([A-Za-z\s]+)", prompt)
    people_match = re.search(r"(\d+)\s*-?\s*person", prompt)
    days_match = re.search(r"(\d+)\s*-?\s*day", prompt)

    budget_raw = budget_match.group(1).replace(",", "") if budget_match else "4000"
    if budget_match and budget_match.group(2):
        budget_raw = str(int(budget_raw) * 1000)
    budget_display = f"${int(budget_raw):,}"

    location = location_match.group(1).strip() if location_match else "a central business district"
    people = people_match.group(1) if people_match else "10"
    days = days_match.group(1) if days_match else "2"

    return VenueProposal(
        venue_name="Summit Ridge Conference Lodge",
        location=location,
        estimated_cost=budget_display,
        why_it_fits=(
            f"Designed for {people}-person teams over {days} days with meeting rooms, "
            "onsite dining, and team activities while staying within the stated budget."
        ),
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. "
            "Add them to backend/.env or environment variables."
        )

    repository = SupabaseRepository(
        base_url=settings.supabase_url,
        service_key=settings.supabase_service_role_key,
        sessions_table=settings.supabase_sessions_table,
        proposals_table=settings.supabase_proposals_table,
    )
    llm_service = None
    if settings.groq_api_key:
        llm_service = ProposalLlmService(api_key=settings.groq_api_key, model_name=settings.groq_model)
        logger.info("Groq LLM configured with model '%s'", settings.groq_model)
    else:
        logger.warning("GROQ_API_KEY not set; proposal generation will use fallback logic")

    await repository.ping()
    app.state.repository = repository
    app.state.llm_service = llm_service
    logger.info(
        "Connected to Supabase tables sessions='%s', proposals='%s'",
        settings.supabase_sessions_table,
        settings.supabase_proposals_table,
    )

    try:
        yield
    finally:
        await repository.close()
        logger.info("Supabase connection closed")


app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_repository(request: Request) -> SupabaseRepository:
    return request.app.state.repository


def get_llm_service(request: Request) -> ProposalLlmService | None:
    return request.app.state.llm_service


async def _generate_proposal_with_llm_or_fallback(prompt: str, request: Request) -> tuple[VenueProposal, str]:
    llm_service = get_llm_service(request)
    if not llm_service:
        return _fallback_proposal(prompt), "Fallback proposal generated without LLM."

    llm_output = await llm_service.generate(prompt)
    logger.info("LLM reasoning: %s", llm_output.reasoning)
    logger.info(
        "LLM JSON output:\n%s",
        json.dumps(
            {
                "venue_name": llm_output.venue_name,
                "location": llm_output.location,
                "estimated_cost": llm_output.estimated_cost,
                "why_it_fits": llm_output.why_it_fits,
            },
            indent=2,
        ),
    )

    return VenueProposal(
        venue_name=llm_output.venue_name,
        location=llm_output.location,
        estimated_cost=llm_output.estimated_cost,
        why_it_fits=llm_output.why_it_fits,
    ), llm_output.reasoning


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "message": "API is running",
    }


@app.get("/health")
async def health(request: Request) -> dict[str, str]:
    repository = get_repository(request)
    try:
        await repository.ping()
    except Exception as exc:  # pragma: no cover
        logger.exception("Health check failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database unavailable: {exc}",
        ) from exc

    return {"status": "ok", "database": "connected"}


@app.post("/api/v1/proposals", response_model=ProposalRecord, status_code=status.HTTP_201_CREATED)
async def create_proposal(payload: ProposalRequest, request: Request, response: Response) -> ProposalRecord:
    repository = get_repository(request)

    try:
        existing = await repository.get_by_user_session(payload.user_id, payload.session_id)
    except httpx.HTTPError as exc:
        logger.exception("Supabase lookup failed")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    if existing:
        response.status_code = status.HTTP_200_OK
        return _to_record(existing)

    proposal, reasoning = await _generate_proposal_with_llm_or_fallback(payload.prompt, request)

    try:
        await repository.create_session_if_missing(
            user_id=payload.user_id,
            session_id=payload.session_id,
        )
        await repository.insert_proposal(
            session_id=payload.session_id,
            prompt=payload.prompt,
            proposal=proposal.model_dump(),
            reasoning=reasoning,
        )
        created = await repository.get_by_user_session(payload.user_id, payload.session_id)
        if not created:
            raise RuntimeError("Failed to load created proposal record")
    except httpx.HTTPError as exc:
        logger.exception("Supabase insert failed")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    return _to_record(created)


@app.post("/api/v1/proposals/llm", response_model=ProposalRecord, status_code=status.HTTP_201_CREATED)
async def create_proposal_llm(payload: ProposalRequest, request: Request, response: Response) -> ProposalRecord:
    repository = get_repository(request)

    try:
        existing = await repository.get_by_user_session(payload.user_id, payload.session_id)
    except httpx.HTTPError as exc:
        logger.exception("Supabase lookup failed")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    if existing:
        response.status_code = status.HTTP_200_OK
        return _to_record(existing)

    try:
        proposal, reasoning = await _generate_proposal_with_llm_or_fallback(payload.prompt, request)
    except Exception as exc:
        logger.exception("LLM generation failed")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"LLM generation failed: {exc}") from exc

    try:
        await repository.create_session_if_missing(
            user_id=payload.user_id,
            session_id=payload.session_id,
        )
        await repository.insert_proposal(
            session_id=payload.session_id,
            prompt=payload.prompt,
            proposal=proposal.model_dump(),
            reasoning=reasoning,
        )
        created = await repository.get_by_user_session(payload.user_id, payload.session_id)
        if not created:
            raise RuntimeError("Failed to load created proposal record")
    except httpx.HTTPError as exc:
        logger.exception("Supabase insert failed")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    return _to_record(created)


@app.get("/api/v1/proposals", response_model=list[ProposalRecord])
async def list_proposals(request: Request, user_id: str, limit: int = 20) -> list[ProposalRecord]:
    repository = get_repository(request)
    safe_limit = min(max(limit, 1), 100)

    try:
        rows = await repository.list_for_user(user_id=user_id, limit=safe_limit)
    except httpx.HTTPError as exc:
        logger.exception("Supabase list failed")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    return [_to_record(row) for row in rows]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=settings.environment == "development")
