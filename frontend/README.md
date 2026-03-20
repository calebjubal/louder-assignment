# Frontend

Next.js frontend for the AI Event Concierge project.

## Live Deployment

- Frontend URL: https://louder-concierge-frontend.vercel.app
- Backend URL: https://louder-backend.vercel.app

## Prerequisites

- Node.js 20+
- pnpm 9+

## Local Setup

1. Move into frontend directory:

	cd frontend

2. Install dependencies:

	pnpm install

## Run Frontend

From frontend directory:

pnpm dev

Open:
- http://localhost:3000

## Build for Production

pnpm build
pnpm start

## Notes

- The frontend proxies API requests to https://louder-backend.vercel.app by default.
- For local backend testing, set NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000 before running pnpm dev.
- For full functionality (proposal generation and history), run backend service as well.
- Backend setup is documented in [../backend/README.md](../backend/README.md).
