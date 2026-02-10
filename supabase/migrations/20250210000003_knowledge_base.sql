-- =============================================================================
-- bastion-os: Knowledge Base (conversations & messages)
-- =============================================================================

-- ─── Tables ─────────────────────────────────────────────────────────────────

CREATE TABLE public.kb_conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_by  uuid NOT NULL REFERENCES public.profiles(id),
  title       text,
  source_ids  uuid[] NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.kb_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.kb_conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant')),
  content         text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.kb_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kb_conversations_org" ON public.kb_conversations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = kb_conversations.client_id
        AND clients.organisation_id = public.user_org_id()
    )
  );

ALTER TABLE public.kb_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kb_messages_org" ON public.kb_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kb_conversations
      JOIN public.clients ON clients.id = kb_conversations.client_id
      WHERE kb_conversations.id = kb_messages.conversation_id
        AND clients.organisation_id = public.user_org_id()
    )
  );

-- ─── Triggers ───────────────────────────────────────────────────────────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.kb_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX idx_kb_conversations_client ON public.kb_conversations(client_id);
CREATE INDEX idx_kb_messages_conversation ON public.kb_messages(conversation_id);
