# Project Plan — bastion-os

## Phase 1: Foundation (current)
- [x] Monorepo setup (pnpm workspaces, TypeScript, ESLint, Prettier)
- [x] Frontend scaffold (React 19 + Vite 7)
- [x] Backend scaffold (Fastify 5 + plugins)
- [x] Shared types package
- [x] Docker + Fly.io config
- [x] GitHub Actions CI/CD
- [x] Supabase, Netlify, Fly.io service setup
- [x] Documentation (AGENTS.md, ARCHITECTURE.md)

## Phase 2: Authentication
- [ ] Supabase magic link auth flow (frontend)
- [ ] Protected routes / auth context
- [ ] JWT validation middleware (backend — plugin exists, needs testing)
- [ ] User session management

## Phase 3: Brief Management
- [ ] Supabase schema: `briefs` table with RLS policies
- [ ] CRUD API routes for briefs
- [ ] Brief list + detail views (frontend)
- [ ] Brief creation form

## Phase 4: AI Brief Expansion
- [ ] Gemini prompt engineering for brief expansion
- [ ] Expansion API route (streaming or polling)
- [ ] Expansion status tracking
- [ ] Result display in frontend

## Phase 5: File Attachments
- [ ] Supabase storage bucket for brief files
- [ ] `brief_files` table with RLS policies
- [ ] File upload via `@fastify/multipart`
- [ ] Gemini Files API integration
- [ ] File preview in frontend

## Phase 6: Polish
- [ ] Error handling + user feedback
- [ ] Rate limiting tuning
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Analytics / monitoring
