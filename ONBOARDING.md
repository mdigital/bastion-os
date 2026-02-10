# Bastion OS — Developer Onboarding

Welcome to the Bastion OS project. This guide will get you from zero to running the full stack locally.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 22 | `brew install node` or [nodejs.org](https://nodejs.org) |
| pnpm | >= 10 | `corepack enable && corepack prepare pnpm@10.14.0 --activate` |
| Supabase CLI | latest | `brew install supabase/tap/supabase` |
| Fly.io CLI | latest | `brew install flyctl` (only needed for backend deploys) |
| Docker | latest | [docker.com](https://www.docker.com) (needed for `supabase start`) |

---

## 1. Clone & install

```bash
git clone git@github.com:mdigital/bastion-os.git
cd bastion-os
pnpm install
```

---

## 2. Set up environment variables

Copy the example files and fill in the values (ask Robin for the real keys):

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### API (`apps/api/.env`)

```
PORT=3000
HOST=0.0.0.0

SUPABASE_URL=https://ndqinjdingrpuwqqytln.supabase.co
SUPABASE_ANON_KEY=<ask Robin>
SUPABASE_SERVICE_ROLE_KEY=<ask Robin>

GEMINI_API_KEY=<ask Robin>

CORS_ORIGIN=http://localhost:5173
```

### Web (`apps/web/.env`)

```
VITE_SUPABASE_URL=https://ndqinjdingrpuwqqytln.supabase.co
VITE_SUPABASE_ANON_KEY=<ask Robin — same anon key as API>
VITE_API_URL=http://localhost:3000
```

> The `SUPABASE_ANON_KEY` is a publishable key (safe for the browser). The `SUPABASE_SERVICE_ROLE_KEY` is secret and only used server-side.

---

## 3. Start the dev servers

Open two terminals:

```bash
# Terminal 1 — API (Fastify on port 3000)
pnpm dev:api

# Terminal 2 — Web (Vite on port 5173)
pnpm dev:web
```

The Vite dev server proxies `/api/*` requests to `localhost:3000`, so the frontend talks to the API seamlessly.

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Authentication

We use Supabase magic link auth. In production, users receive an email with a login link. For local development:

1. Enter your email on the login page
2. Check the Supabase dashboard > Authentication > Users for the OTP, or use [Inbucket](http://127.0.0.1:54324) if running Supabase locally
3. You'll need a `profiles` row with your user ID and an `organisation_id` — the `handle_new_user()` trigger creates the profile automatically on signup

> **Important:** Your profile must have `role: 'admin'` to access admin endpoints. Ask Robin to set this in the Supabase dashboard, or update it directly in the `profiles` table.

---

## 5. (Optional) Run Supabase locally

If you want a fully local database instead of hitting the remote Supabase:

```bash
supabase start          # Starts Postgres, Auth, Storage, Studio via Docker
supabase db reset       # Runs all migrations + seed data
```

Local Supabase services:

| Service | URL |
|---------|-----|
| API | http://127.0.0.1:54321 |
| Studio | http://127.0.0.1:54323 |
| Inbucket (email) | http://127.0.0.1:54324 |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

When running locally, update your `.env` files to point to the local URLs and keys (printed by `supabase start`).

---

## Project structure

```
bastion-os/
├── apps/
│   ├── api/                  # Fastify 5 backend (deployed to Fly.io)
│   │   ├── src/
│   │   │   ├── server.ts     # Entry point
│   │   │   ├── app.ts        # Fastify app factory + plugin registration
│   │   │   ├── plugins/      # Auth JWT validation, role-based access
│   │   │   ├── routes/
│   │   │   │   ├── health.ts
│   │   │   │   ├── admin/    # CRUD: clients, users, practices, templates, orgs
│   │   │   │   └── kb/       # Knowledge base: sources (upload), chat (Gemini)
│   │   │   ├── lib/          # Supabase + Gemini client init
│   │   │   └── __tests__/    # Vitest tests
│   │   └── .env              # Local env vars (git-ignored)
│   │
│   └── web/                  # React 19 + Vite 7 frontend (deployed to Netlify)
│       ├── src/
│       │   ├── App.tsx       # Routes
│       │   ├── components/   # Login, ProtectedRoute
│       │   ├── contexts/     # AuthContext (Supabase session)
│       │   ├── pages/        # ClientsPage, ClientKBPage
│       │   └── lib/          # supabase client, apiFetch helper
│       └── .env              # Local env vars (git-ignored)
│
├── packages/
│   └── shared/               # TypeScript types (no build step, raw .ts exports)
│       └── src/index.ts
│
├── supabase/
│   ├── config.toml           # Local Supabase config
│   └── migrations/           # SQL migrations (pushed with `supabase db push`)
│
├── Dockerfile                # Multi-stage build for API → Fly.io
├── fly.toml                  # Fly.io config (region: syd)
├── netlify.toml              # Netlify build config + API proxy redirects
└── pnpm-workspace.yaml
```

---

## Common commands

| Command | What it does |
|---------|-------------|
| `pnpm dev:web` | Start frontend dev server (port 5173) |
| `pnpm dev:api` | Start backend dev server (port 3000) |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm --filter @bastion-os/api test` | Run API tests (Vitest) |
| `npx supabase db push` | Push pending migrations to remote Supabase |
| `npx supabase migration list` | Check local vs remote migration status |

---

## The app flow

1. **Login** — Magic link email via Supabase Auth
2. **Clients list** (`/`) — Shows all clients in your organisation
3. **Client KB** (`/clients/:id`) — Two-panel view:
   - **Sources panel** — Upload documents (PDF, etc.) to the client's knowledge base
   - **Chat panel** — Start conversations with the uploaded documents via Gemini AI

---

## Key API endpoints

All endpoints require `Authorization: Bearer <supabase_jwt>` header.

### Admin

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/admin/clients` | admin, manager | List clients |
| POST | `/api/admin/clients` | admin | Create client |
| PATCH | `/api/admin/clients/:id` | admin | Update client |
| DELETE | `/api/admin/clients/:id` | admin | Delete client |

### Knowledge Base

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/kb/clients/:clientId/sources` | any | List sources |
| POST | `/api/kb/clients/:clientId/sources` | admin, manager | Upload file (multipart) |
| DELETE | `/api/kb/clients/:clientId/sources/:sourceId` | admin, manager | Soft-delete source |
| GET | `/api/kb/clients/:clientId/conversations` | any | List conversations |
| POST | `/api/kb/clients/:clientId/conversations` | any | Create conversation (body: `{ source_ids }`) |
| GET | `/api/kb/clients/:clientId/conversations/:id` | any | Get conversation + messages |
| POST | `/api/kb/clients/:clientId/conversations/:id/messages` | any | Send message, get AI response |

---

## Deployment

| Target | Branch | Platform | URL |
|--------|--------|----------|-----|
| Frontend | `main` | Netlify | https://bastion-os.netlify.app |
| Backend | `production` | Fly.io (via GitHub Actions) | https://bastion-os-api.fly.dev |

- Push to `main` auto-deploys the frontend on Netlify
- Push to `production` triggers the GitHub Actions workflow that deploys to Fly.io
- Database migrations are pushed manually with `npx supabase db push`

### To deploy everything:

```bash
git push origin main                # Frontend → Netlify
git push origin main:production     # Backend → Fly.io
npx supabase db push                # Migrations → Supabase
```

---

## Tech stack

- **Frontend:** React 19, Vite 7, React Router 7, TypeScript
- **Backend:** Fastify 5, TypeScript, Pino logging
- **Database:** Supabase (PostgreSQL + Row Level Security + Storage)
- **AI:** Google Gemini 2.0 Flash
- **Auth:** Supabase magic link (OTP via email)
- **Hosting:** Netlify (web), Fly.io (API, Sydney region)
- **Package manager:** pnpm 10 with workspaces
- **Module system:** ESM throughout

---

## Gotchas

- The shared package (`packages/shared`) exports raw `.ts` files — no build step. The API uses `tsx` to run them directly; Vite handles them natively.
- `pnpm-workspace.yaml` has `onlyBuiltDependencies: [esbuild]` — needed for Vite builds to work.
- `netlify.toml` must live at the repo root (not in `apps/web/`).
- The API `tsconfig.json` uses `moduleResolution: "bundler"` (not `Node16`) so it can import from the shared package.
- Rate limiting is set to 100 requests/minute globally on the API.
- File uploads are capped at 50MB.

---

## Admin: Granting access to a new developer

### Required (can't dev without these)

1. **GitHub** — Add as collaborator on [`mdigital/bastion-os`](https://github.com/mdigital/bastion-os) (Settings > Collaborators)
2. **Supabase** — Invite to the `bastion-os` org so they can view the dashboard and grab API keys themselves (Supabase Dashboard > Org Settings > Members)
3. **Env keys** — Share the `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `GEMINI_API_KEY` values directly (or they can copy from the Supabase dashboard once invited)
4. **Set their profile role** — After they sign up via magic link, update their `profiles` row in the Supabase dashboard: set `role` to `admin` so they can access all API endpoints

### Only if they'll deploy

5. **Fly.io** — Invite to the Fly.io org (`flyctl orgs invite <email>`) — only needed for direct backend deploys
6. **Netlify** — Add as team member on the `mdigital` team (Netlify Dashboard > Team Settings > Members) — only needed for frontend deploy management

> **TL;DR minimum:** GitHub repo access + env keys + set their profile role = 3 things to get them running locally.

---

## Questions?

Ping Robin on Slack or open an issue on [GitHub](https://github.com/mdigital/bastion-os).
