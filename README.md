# Bastion OS

AI-powered brief expansion tool for agencies.

## Architecture

```
apps/web        React 19 + Vite          → Netlify
apps/api        Fastify 5                → Fly.io (Docker)
packages/shared Raw TypeScript types       (no build step)
supabase/       Database migrations + RLS
```

- **Web** — SPA with brief wizard, knowledge base chat, and admin panel
- **API** — REST + SSE endpoints; uses Gemini for AI analysis and KB chat
- **Database** — Supabase (Postgres) with row-level security scoped per organisation
- **Shared** — TypeScript interfaces consumed by both web and API

## Local Development

```sh
pnpm install
# Start API (needs .env with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY)
pnpm --filter @bastion-os/api dev
# Start web (needs .env with VITE_API_BASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
pnpm --filter @bastion-os/web dev
```

## Deployment

### Frontend (Netlify)

Push to `main` triggers automatic deploy via Netlify GitHub integration.

### Backend (Fly.io)

Push to `production` triggers GitHub Actions → Docker build → deploy to `bastion-os-api.fly.dev`.

```sh
# Merge latest into production and push
git checkout production && git merge main && git push origin production
git checkout main
```

### Database (Supabase)

```sh
npx supabase db push   # Apply pending migrations to remote
```

### Environment Secrets

- **Fly.io**: `flyctl secrets set GEMINI_API_KEY=... -a bastion-os-api`
- **Netlify**: Set via dashboard (Site settings → Environment variables)
- **GitHub**: `FLY_API_TOKEN` secret for CI deploy
