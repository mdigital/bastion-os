# TODOs

- [ ] `apps/api/src/routes/auth/check-email.ts` — Replace `listUsers()` + JS filter with `getUserByEmail` admin method; current approach fetches all users on every request and won't scale
