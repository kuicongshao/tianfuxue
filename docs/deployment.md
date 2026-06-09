# Deployment Guide

This guide prepares Tianfu Studies AI Platform for GitHub, public frontend deployment, backend deployment, and PostgreSQL + pgvector hosting.

## 1. GitHub

```bash
git init
git add .
git commit -m "Initial Tianfu Studies AI Platform"
git branch -M main
git remote add origin https://github.com/<your-org>/<your-repo>.git
git push -u origin main
```

Do not commit `.env`, private documents, paid API keys, model caches, or large raw files.

## 2. Vercel Frontend

1. Import the GitHub repository in Vercel.
2. Framework preset: Next.js.
3. Build command: `npm run build`.
4. Environment variables:
   - `NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com`
5. Deploy.

## 3. Cloudflare Pages Frontend

1. Connect the GitHub repository.
2. Build command: `npm run build`.
3. Output directory: `.next` for Next.js Pages integration, or deploy through Cloudflare's Next.js adapter if required by your plan.
4. Environment variables:
   - `NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com`

## 4. Railway Backend

1. Create a Railway project from GitHub.
2. Set root directory to `backend`.
3. Use `backend/Dockerfile`.
4. Configure variables:
   - `DATABASE_MODE=json` for demo mode, or `DATABASE_MODE=postgres` after implementing PostgreSQL repositories.
   - `DATABASE_URL=...`
   - `EMBEDDING_PROVIDER=local`
   - `EMBEDDING_MODEL=BAAI/bge-m3`
   - `LLM_PROVIDER=fallback`
   - `ENABLE_PAID_API=false`
   - `NEWS_CACHE_WEEKS=12`
5. Expose port `8000`.

## 5. Render Backend

1. Create a new Web Service from GitHub.
2. Runtime: Docker.
3. Dockerfile path: `backend/Dockerfile`.
4. Environment variables: same as Railway.
5. Health check path: `/health`.

## 6. Supabase PostgreSQL + pgvector

1. Create a Supabase project.
2. Open SQL Editor.
3. Enable vector extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

4. Run `docs/database.sql`.
5. Copy the connection string into `DATABASE_URL`.

Current MVP uses `DATABASE_MODE=json` by default. PostgreSQL schema is ready; repository adapters can be implemented without changing API contracts.

## 7. Local Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Services:

- `frontend`: http://localhost:3000
- `backend`: http://localhost:8000
- `postgres-pgvector`: localhost:5432

## 8. API Address

Frontend reads all backend calls from:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

For production, set it to your deployed backend URL.

## 9. Security Defaults

- `ENABLE_PAID_API=false` disables paid model calls even if API keys are present.
- News collection only fetches public pages and RSS feeds.
- Uploaded files are size-limited and temporary upload files are removed after ingestion.
- News cache stores metadata only, not raw HTML or full articles.
