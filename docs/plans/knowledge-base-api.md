# Knowledge Base API — Clients, Document Ingestion & Chat

## Context

The admin API (organisations, users, practices, section/practice templates) is complete with 54 passing tests. The next feature is the **Knowledge Base** — the Figma prototype shows a per-client document management system with AI-powered chat. Users upload documents (PDFs, etc.) to a client's knowledge base, then ask questions against selected sources via a chat interface with preset prompt suggestions.

**What we're building:**
1. Clients CRUD endpoints (no client management endpoints exist yet)
2. Document ingestion endpoints (upload/list/delete per client)
3. Chat with documents endpoints (conversations + AI-powered Q&A)
4. Database migration for new tables (conversations, messages)
5. Supabase Storage bucket for client documents
6. Tests for all new endpoints

**Key design decisions:**
- Chat history persisted server-side (kb_conversations + kb_messages tables)
- Gemini files uploaded at chat-time (avoids 48h TTL expiry complexity)
- Documents stored in Supabase Storage, metadata in `client_sources` table (already exists)

---

## Step 1: Database Migration

New migration: `supabase/migrations/20250210000003_knowledge_base.sql`

### New Tables

**`kb_conversations`** — Chat sessions within a client's knowledge base
```sql
CREATE TABLE public.kb_conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_by  uuid NOT NULL REFERENCES public.profiles(id),
  title       text,  -- auto-generated or user-set
  source_ids  uuid[] NOT NULL DEFAULT '{}',  -- snapshot of selected sources
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

**`kb_messages`** — Individual messages in a conversation
```sql
CREATE TABLE public.kb_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.kb_conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant')),
  content         text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

### RLS Policies
- Both tables scoped to org via `clients` join (same pattern as `client_sources`)
- Users can only access conversations for clients in their org

### Indexes
- `idx_kb_conversations_client ON kb_conversations(client_id)`
- `idx_kb_messages_conversation ON kb_messages(conversation_id)`

### Storage Bucket
- Create `client-documents` bucket via Supabase CLI or config
- Add bucket config to `supabase/config.toml` for local dev

---

## Step 2: Clients CRUD

New file: `apps/api/src/routes/admin/clients.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/admin/clients` | admin, manager | List org clients |
| POST | `/api/admin/clients` | admin | Create client |
| PATCH | `/api/admin/clients/:id` | admin | Update client |
| DELETE | `/api/admin/clients/:id` | admin | Delete client |

Follows the exact same pattern as `practices.ts`. Scoped to `request.organisationId`.

**Modify:** `apps/api/src/app.ts` — register client routes

---

## Step 3: Document Ingestion Endpoints

New file: `apps/api/src/routes/kb/sources.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/kb/clients/:clientId/sources` | admin, manager, user | List active sources for client (exclude soft-deleted) |
| POST | `/api/kb/clients/:clientId/sources` | admin, manager | Upload document to client's knowledge base |
| DELETE | `/api/kb/clients/:clientId/sources/:sourceId` | admin, manager | Soft-delete a source (set `deleted_at`) |

### Upload Flow (POST)
1. Validate client belongs to user's org (join `clients` table)
2. Parse multipart file from request (`request.file()` via `@fastify/multipart`)
3. Upload file to Supabase Storage bucket `client-documents` at path `{orgId}/{clientId}/{uuid}_{filename}`
4. Insert metadata row into `client_sources` table
5. Return created source record

### Key Files
- `apps/api/src/lib/supabase.ts` — `supabaseAdmin` already available, has `.storage` API
- Multipart already registered in `app.ts` (50MB limit)

**Modify:** `apps/api/src/app.ts` — register KB source routes

---

## Step 4: Chat Endpoints

New file: `apps/api/src/routes/kb/chat.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/kb/clients/:clientId/conversations` | admin, manager, user | List conversations for a client |
| GET | `/api/kb/clients/:clientId/conversations/:conversationId` | admin, manager, user | Get conversation with messages |
| POST | `/api/kb/clients/:clientId/conversations` | admin, manager, user | Create new conversation (with selected source_ids) |
| POST | `/api/kb/clients/:clientId/conversations/:conversationId/messages` | admin, manager, user | Send message & get AI response |

### Chat Message Flow (POST .../messages)
1. Validate client + conversation belong to user's org
2. Save user message to `kb_messages`
3. Fetch prior messages for context (conversation history)
4. Download selected source files from Supabase Storage
5. Upload files to Gemini Files API (`gemini.files.upload()`)
6. Call Gemini `generateContent` with:
   - System prompt: "You are a knowledge base assistant. Answer based on the provided documents."
   - File references for selected sources
   - Conversation history
   - User's new message
7. Save assistant response to `kb_messages`
8. Return the assistant message

### Gemini Integration
- Uses existing `apps/api/src/lib/gemini.ts` (`@google/genai` v1.4.0)
- Files uploaded at chat-time — no caching, no TTL concerns
- For subsequent messages in same conversation, re-upload source files (simple, stateless)
- Model: `gemini-2.0-flash` (fast, good for document Q&A)

### Performance Note
- First message has upload latency (~2-5s depending on file sizes)
- Could optimize later with Gemini file URI caching per conversation session
- Source file downloads from Supabase Storage are fast (same region)

**Modify:** `apps/api/src/app.ts` — register KB chat routes

---

## Step 5: Shared Types

**Modify:** `packages/shared/src/index.ts`

Add:
```typescript
export interface KbConversation {
  id: string
  client_id: string
  created_by: string
  title: string | null
  source_ids: string[]
  created_at: string
  updated_at: string
}

export interface KbMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
```

---

## Step 6: Tests

New test files following existing pattern (`vi.hoisted` mock, `buildTestApp` helper):

- `apps/api/src/__tests__/admin-clients.test.ts` — Clients CRUD (~11 tests)
- `apps/api/src/__tests__/kb-sources.test.ts` — Document ingestion (~10 tests)
- `apps/api/src/__tests__/kb-chat.test.ts` — Chat endpoints (~12 tests, mock Gemini)

Chat tests will need an additional mock for the Gemini SDK (`vi.mock('../../lib/gemini.js')`).

---

## Files Summary

**New files:**
- `supabase/migrations/20250210000003_knowledge_base.sql`
- `apps/api/src/routes/admin/clients.ts`
- `apps/api/src/routes/kb/sources.ts`
- `apps/api/src/routes/kb/chat.ts`
- `apps/api/src/__tests__/admin-clients.test.ts`
- `apps/api/src/__tests__/kb-sources.test.ts`
- `apps/api/src/__tests__/kb-chat.test.ts`

**Modified files:**
- `apps/api/src/app.ts` — register 3 new route modules
- `packages/shared/src/index.ts` — add KbConversation + KbMessage types
- `supabase/config.toml` — add client-documents storage bucket config

**Existing files to reuse:**
- `apps/api/src/lib/supabase.ts` — supabaseAdmin (storage + DB)
- `apps/api/src/lib/gemini.ts` — Gemini client
- `apps/api/src/plugins/require-role.ts` — role-based access
- `apps/api/src/__tests__/helpers.ts` — buildTestApp, resetSupabaseMock

---

## Verification

1. `npx supabase db push` applies new migration without errors
2. `pnpm --filter @bastion-os/api test` — all tests pass (existing 54 + new ~33)
3. `pnpm typecheck` passes
4. `pnpm build` succeeds
5. Manual test: upload a PDF via POST, list sources, create conversation, send message and receive AI response
