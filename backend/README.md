# Backend API

Production-style FastAPI backend for the AI Event Concierge assignment.

## Features

- FastAPI service with versioned endpoints.
- Supabase persistence for request/proposal history.
- Session deduplication so one session triggers one AI output.
- Environment-based configuration via `.env`.

## Prerequisites

- Python 3.12+
- A Supabase project

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
uv sync
```

3. Create a `.env` file in the backend folder from `.env.example`.
4. Create these tables in Supabase SQL editor:

```sql
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
```

5. Start the API:

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

- `GET /` - service metadata
- `GET /health` - service and Supabase connectivity check
- `POST /api/v1/proposals` - create and store a proposal for a user/session
- `POST /api/v1/proposals/llm` - force Groq LLM proposal generation (still deduped by session)
- `GET /api/v1/proposals?user_id=<id>` - list recent stored proposals for one user

## Example Request

```http
POST /api/v1/proposals
Content-Type: application/json

{
	"prompt": "A 10-person leadership retreat in the mountains for 3 days with a $4k budget",
	"user_id": "user-abc123",
	"session_id": "session-001"
}
```

## Example Response

```json
{
	"_id": "0bcb8e8c-27b1-4df8-b0ca-87132d3d696f",
	"user_id": "user-abc123",
	"session_id": "session-001",
	"request": "A 10-person leadership retreat in the mountains for 3 days with a $4k budget",
	"proposal": {
		"venue_name": "Summit Ridge Conference Lodge",
		"location": "the mountains",
		"estimated_cost": "$4,000",
		"why_it_fits": "Designed for 10-person teams over 3 days with meeting rooms, onsite dining, and team activities while staying within the stated budget."
	},
	"created_at": "2026-03-19T14:20:10.908000+00:00"
}
```
