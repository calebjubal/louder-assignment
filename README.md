# AI Event Concierge

Full stack application for generating offsite venue proposals from natural language prompts.

Stack:
- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: FastAPI, Pydantic Settings
- Persistence: Supabase (sessions + proposals tables)
- LLM: Groq

## Repository Requirement

For submission, this repository should be public on GitHub.

Suggested verification before sharing:
1. Open repository Settings on GitHub.
2. Confirm visibility is set to Public.
3. Confirm this README, backend README, and frontend README are present.

## Project Structure

- frontend: Next.js client app
- backend: FastAPI API and Supabase integration

## Run Locally (Full Stack)

Prerequisites:
- Node.js 20+
- pnpm 9+
- Python 3.12+
- uv
- Supabase project
- Groq API key

1. Backend setup:

	- Open a terminal in backend.
	- Install dependencies:

	  uv sync

	- Create backend/.env from backend/.env.example and fill required values.
	- Create database tables in Supabase (see backend README for SQL).

2. Start backend:

	uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

3. Frontend setup:

	- Open a second terminal in frontend.
	- Install dependencies:

	  pnpm install

4. Start frontend:

	pnpm dev

5. Open application:

	- Frontend UI: http://localhost:3000
	- Backend API docs: http://127.0.0.1:8000/docs

## Run Locally (Backend Only)

See [backend/README.md](backend/README.md) for full setup and endpoint docs.

Quick start:
1. cd backend
2. uv sync
3. Create .env from .env.example
4. Run:

	uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

## Run Locally (Frontend Only)

See [frontend/README.md](frontend/README.md) for frontend specific details.

Quick start:
1. cd frontend
2. pnpm install
3. Run:

	pnpm dev

4. Open http://localhost:3000

Notes:
- Frontend rewrites API calls to http://127.0.0.1:8000.
- If backend is not running, proposal generation/history requests will fail.