# Architecture — bastion-os

## System Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Netlify    │────▶│   Fly.io     │────▶│   Supabase   │
│  React SPA   │     │  Fastify API │     │  PostgreSQL  │
│  (frontend)  │     │  (backend)   │     │  + Auth      │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │   Google     │
                     │   Gemini AI  │
                     │  + Files API │
                     └──────────────┘
```

## Components

### Frontend (`apps/web`)
- React 19 SPA with Vite 7
- Supabase client for auth (magic link)
- API calls to backend via `/api/*` proxy (dev) or Netlify redirect (prod)

### Backend (`apps/api`)
- Fastify 5 with TypeScript
- JWT validation via Supabase auth
- Gemini integration for brief expansion
- File upload handling via `@fastify/multipart`
- Rate limiting, CORS, helmet security headers

### Shared (`packages/shared`)
- TypeScript type definitions (`Brief`, `BriefFile`, `ApiError`)
- Consumed directly as `.ts` by both apps (no build step)

### Database (Supabase)
- PostgreSQL with Row Level Security (RLS)
- Tables: `briefs`, `brief_files` (to be created)
- Magic link authentication

## Environment Variables

### Frontend (`apps/web`)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_API_URL` | API base URL (dev only) |

### Backend (`apps/api`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CORS_ORIGIN` | Allowed CORS origin |

## Deployment Pipeline

### Frontend (Netlify)
1. Push to `main` branch
2. Netlify detects change, runs `pnpm build`
3. Deploys `apps/web/dist` as static site
4. API calls proxied via Netlify redirects to Fly.io

### Backend (Fly.io)
1. Push to `production` branch
2. GitHub Actions triggers deploy workflow
3. Fly.io builds Docker image (multi-stage)
4. Deploys to `syd` region with health check
5. Auto-stop/start machines for cost efficiency
