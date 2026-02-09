# AGENTS.md — bastion-os

## Project Overview

bastion-os is an AI-powered brief expansion tool. Users upload creative briefs (with optional file attachments), and the system uses Google Gemini to expand them into comprehensive project briefs.

## Tech Stack

- **Frontend**: React 19 + Vite 7 + TypeScript (hosted on Netlify)
- **Backend**: Fastify 5 + TypeScript (hosted on Fly.io via Docker)
- **Database & Auth**: Supabase (PostgreSQL + magic link auth)
- **AI**: Google Gemini via `@google/genai` SDK (Files API for attachments)

## Monorepo Structure

- `apps/web/` — React frontend (SPA)
- `apps/api/` — Fastify backend API
- `packages/shared/` — Shared TypeScript types (raw .ts, no build step)

## Conventions

- **Package manager**: pnpm 10 with workspaces
- **Module system**: ESM only (`"type": "module"`)
- **TypeScript**: Strict mode, ES2022 target
- **Formatting**: Prettier (no semicolons, single quotes, trailing commas)
- **Linting**: ESLint flat config at root
- **Import paths**: Use `.js` extensions in API imports (Node16 module resolution)
- **Environment variables**: Never commit `.env` files; use `.env.example` as templates

## Auth Flow

1. Frontend calls Supabase magic link auth
2. Supabase returns JWT on successful auth
3. Frontend sends JWT in `Authorization: Bearer <token>` header to API
4. API validates JWT via Supabase `auth.getUser()` and decorates `request.userId`
5. API uses user-scoped Supabase client for RLS-respecting queries

## Key Patterns

- Two Supabase clients on backend: `supabaseAdmin` (service role, bypasses RLS) and `createUserClient(token)` (respects RLS)
- Gemini client initialized in `apps/api/src/lib/gemini.ts`
- Auth plugin at `apps/api/src/plugins/auth.ts` — skips `/api/health`
- All API routes prefixed with `/api/`

## Development

```bash
pnpm dev:web   # Frontend on localhost:5173
pnpm dev:api   # Backend on localhost:3000
pnpm typecheck # Type check all packages
pnpm build     # Build all packages
```

## Deployment

- **Frontend**: Push to `main` → Netlify auto-deploys
- **Backend**: Push to `production` → GitHub Actions → Fly.io deploy
