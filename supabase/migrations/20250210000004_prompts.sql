-- ─── Prompts table ──────────────────────────────────────────────────────────

create table public.prompts (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  display_name text not null,
  category    text not null default 'general',
  content     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.prompts is 'System-wide LLM prompt templates managed by admins';

-- Trigger reuses set_updated_at() from migration 000001
create trigger set_prompts_updated_at
  before update on public.prompts
  for each row execute function public.set_updated_at();

-- RLS: authenticated users can read; mutations done via supabaseAdmin
alter table public.prompts enable row level security;

create policy "Authenticated users can read prompts"
  on public.prompts for select
  to authenticated
  using (true);

-- ─── Seed: existing KB chat system prompt ───────────────────────────────────

insert into public.prompts (key, display_name, category, content)
values (
  'kb-chat-system',
  'KB Chat System Instruction',
  'Knowledge Base',
  'You are a knowledge base assistant. Answer questions based on the provided documents. If you cannot find the answer in the documents, say so clearly.'
);
