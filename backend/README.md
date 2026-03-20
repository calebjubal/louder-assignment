# Backend API

FastAPI backend for the AI Event Concierge project.

## Live Deployment

- Backend URL: https://louder-backend.vercel.app
- Frontend URL: https://louder-concierge-frontend.vercel.app
- Live API docs: https://louder-backend.vercel.app/docs

## Features

- Versioned API endpoints for proposal generation and history retrieval
- Supabase persistence for sessions and proposals
- Groq-powered LLM generation with structured output
- Session-level deduplication (one generated result per session id)

## Prerequisites

- Python 3.12+
- uv
- Supabase project
- Groq API key

## Local Setup

1. Move into backend directory:

	 cd backend

2. Install dependencies:

	 uv sync

3. Create environment file:

	 - Copy .env.example to .env
	 - Fill these values:
		 - SUPABASE_URL
		 - SUPABASE_SERVICE_ROLE_KEY
		 - SUPABASE_SESSIONS_TABLE (default: sessions)
		 - SUPABASE_PROPOSALS_TABLE (default: proposals)
		 - GROQ_API_KEY
		 - GROQ_MODEL (default: llama-3.3-70b-versatile)

4. Create tables in Supabase SQL editor:

	 create extension if not exists pgcrypto;

	 create table if not exists public.sessions (
		 id uuid primary key,
		 user_id text not null,
		 created_at timestamptz not null default now()
	 );

	 create table if not exists public.proposals (
		 id uuid primary key default gen_random_uuid(),
		 session_id uuid not null references public.sessions(id) on delete cascade,
		 query text not null,
		 response jsonb not null,
		 created_at timestamptz not null default now()
	 );

	 create index if not exists idx_sessions_user_id on public.sessions(user_id);
	 create index if not exists idx_proposals_session_id on public.proposals(session_id);

## Run Backend

From backend directory:

uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

API base URL:
- http://127.0.0.1:8000

Deployed API base URL:
- https://louder-backend.vercel.app

Interactive docs:
- http://127.0.0.1:8000/docs

Deployed interactive docs:
- https://louder-backend.vercel.app/docs

## Endpoints

- GET /: service metadata
- GET /health: service and Supabase connectivity check
- POST /api/v1/proposals: create and store a proposal for a user/session
- POST /api/v1/proposals/llm: generate using Groq (still deduped by session)
- GET /api/v1/proposals?user_id=<id>: list recent stored proposals for one user

## Example Request

POST /api/v1/proposals
Content-Type: application/json

{
	"prompt": "A 10-person leadership retreat in the mountains for 3 days with a $4k budget",
	"user_id": "user-abc123",
	"session_id": "session-001"
}
