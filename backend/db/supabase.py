from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import httpx


class SupabaseRepository:
    def __init__(self, base_url: str, service_key: str, sessions_table: str, proposals_table: str) -> None:
        root = base_url.rstrip("/")
        self._sessions_url = f"{root}/rest/v1/{sessions_table}"
        self._proposals_url = f"{root}/rest/v1/{proposals_table}"
        self._headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        self._client = httpx.AsyncClient(timeout=12.0)

    async def close(self) -> None:
        await self._client.aclose()

    async def ping(self) -> None:
        sessions_response = await self._client.get(
            self._sessions_url,
            headers=self._headers,
            params={"select": "id", "limit": 1},
        )
        sessions_response.raise_for_status()

        proposals_response = await self._client.get(
            self._proposals_url,
            headers=self._headers,
            params={"select": "id", "limit": 1},
        )
        proposals_response.raise_for_status()

    async def get_by_user_session(self, user_id: str, session_id: str) -> dict[str, Any] | None:
        session_row = await self._get_session(user_id=user_id, session_id=session_id)
        if not session_row:
            return None

        proposal_row = await self._get_latest_proposal(session_id=session_id)
        if not proposal_row:
            return None

        return self._to_record_row(session_row=session_row, proposal_row=proposal_row)

    async def list_for_user(self, user_id: str, limit: int) -> list[dict[str, Any]]:
        sessions_response = await self._client.get(
            self._sessions_url,
            headers=self._headers,
            params={
                "select": "id,user_id,created_at",
                "user_id": f"eq.{user_id}",
                "order": "created_at.desc",
                "limit": limit,
            },
        )
        sessions_response.raise_for_status()
        sessions = sessions_response.json()
        if not sessions:
            return []

        session_ids = [row["id"] for row in sessions]
        proposal_rows = await self._list_proposals_for_sessions(session_ids)
        latest_by_session: dict[str, dict[str, Any]] = {}
        for proposal in proposal_rows:
            current = latest_by_session.get(proposal["session_id"])
            if not current or proposal["created_at"] > current["created_at"]:
                latest_by_session[proposal["session_id"]] = proposal

        records: list[dict[str, Any]] = []
        for session in sessions:
            proposal = latest_by_session.get(session["id"])
            if proposal:
                records.append(self._to_record_row(session_row=session, proposal_row=proposal))

        records.sort(key=lambda row: row["created_at"], reverse=True)
        return records[:limit]

    async def create_session_if_missing(self, user_id: str, session_id: str) -> dict[str, Any]:
        existing = await self._get_session(user_id=user_id, session_id=session_id)
        if existing:
            return existing

        created_at = datetime.now(UTC).isoformat()
        response = await self._client.post(
            self._sessions_url,
            headers=self._headers,
            json={
                "id": session_id,
                "user_id": user_id,
                "created_at": created_at,
            },
        )
        response.raise_for_status()
        rows = response.json()
        if not rows:
            raise RuntimeError("Supabase did not return inserted session row")
        return rows[0]

    async def insert_proposal(
        self,
        session_id: str,
        prompt: str,
        proposal: dict[str, str],
        reasoning: str = "",
    ) -> dict[str, Any]:
        response_payload = {
            "venue_name": proposal["venue_name"],
            "location": proposal["location"],
            "estimated_cost": proposal["estimated_cost"],
            "why_it_fits": proposal["why_it_fits"],
            "reasoning": reasoning,
        }
        response = await self._client.post(
            self._proposals_url,
            headers=self._headers,
            json={
                "session_id": session_id,
                "query": prompt,
                "response": response_payload,
                "created_at": datetime.now(UTC).isoformat(),
            },
        )
        response.raise_for_status()
        rows = response.json()
        if not rows:
            raise RuntimeError("Supabase did not return inserted proposal row")
        return rows[0]

    async def _get_session(self, user_id: str, session_id: str) -> dict[str, Any] | None:
        response = await self._client.get(
            self._sessions_url,
            headers=self._headers,
            params={
                "select": "id,user_id,created_at",
                "id": f"eq.{session_id}",
                "user_id": f"eq.{user_id}",
                "limit": 1,
            },
        )
        response.raise_for_status()
        rows = response.json()
        return rows[0] if rows else None

    async def _get_latest_proposal(self, session_id: str) -> dict[str, Any] | None:
        response = await self._client.get(
            self._proposals_url,
            headers=self._headers,
            params={
                "select": "id,session_id,query,response,created_at",
                "session_id": f"eq.{session_id}",
                "order": "created_at.desc",
                "limit": 1,
            },
        )
        response.raise_for_status()
        rows = response.json()
        return rows[0] if rows else None

    async def _list_proposals_for_sessions(self, session_ids: list[str]) -> list[dict[str, Any]]:
        escaped_ids = ",".join([f'"{session_id}"' for session_id in session_ids])
        response = await self._client.get(
            self._proposals_url,
            headers=self._headers,
            params={
                "select": "id,session_id,query,response,created_at",
                "session_id": f"in.({escaped_ids})",
                "order": "created_at.desc",
                "limit": len(session_ids) * 3,
            },
        )
        response.raise_for_status()
        return response.json()

    def _to_record_row(self, session_row: dict[str, Any], proposal_row: dict[str, Any]) -> dict[str, Any]:
        response_payload = proposal_row.get("response") or {}
        return {
            "id": proposal_row["id"],
            "user_id": session_row["user_id"],
            "session_id": session_row["id"],
            "request": proposal_row.get("query", ""),
            "proposal": {
                "venue_name": response_payload.get("venue_name", ""),
                "location": response_payload.get("location", ""),
                "estimated_cost": response_payload.get("estimated_cost", ""),
                "why_it_fits": response_payload.get("why_it_fits", ""),
            },
            "reasoning": response_payload.get("reasoning", ""),
            "created_at": proposal_row["created_at"],
        }
