-- =============================================================================
-- bastion-os: Initial Database Schema
-- =============================================================================

-- ─── Enums ──────────────────────────────────────────────────────────────────

CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'user', 'approver');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive');
CREATE TYPE public.brief_level AS ENUM ('new_project', 'fast_forward');
CREATE TYPE public.brief_status AS ENUM ('draft', 'finalized', 'archived');
CREATE TYPE public.agent_type AS ENUM ('competitor', 'client_data', 'media', 'social', 'market');
CREATE TYPE public.agent_status AS ENUM ('active', 'paused', 'complete');
CREATE TYPE public.signal_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.signal_status AS ENUM ('new', 'reviewed', 'converted');

-- ═════════════════════════════════════════════════════════════════════════════
-- TABLES (created first, no RLS yet)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.organisations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  domain     text,
  settings   jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id uuid REFERENCES public.organisations(id) ON DELETE SET NULL,
  role            public.user_role NOT NULL DEFAULT 'user',
  full_name       text,
  status          public.user_status NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.clients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  industry        text,
  description     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.practices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  color           text,
  icon            text,
  description     text,
  sort_order      int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.section_templates (
  id                      text PRIMARY KEY,
  organisation_id         uuid REFERENCES public.organisations(id) ON DELETE CASCADE,
  name                    text NOT NULL,
  description             text,
  category                text,
  ai_evaluation_criteria  text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.practice_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  brief_level public.brief_level NOT NULL,
  sections    jsonb NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.briefs (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id         uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  client_id               uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  created_by              uuid NOT NULL REFERENCES public.profiles(id),
  job_to_be_done          text,
  budget                  text,
  due_date                date,
  live_date               date,
  campaign_duration       text,
  brief_level             public.brief_level NOT NULL DEFAULT 'new_project',
  lead_practice_id        uuid REFERENCES public.practices(id) ON DELETE SET NULL,
  supporting_practice_ids uuid[],
  status                  public.brief_status NOT NULL DEFAULT 'draft',
  archived                boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.brief_sections (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id            uuid NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  section_template_id text REFERENCES public.section_templates(id) ON DELETE SET NULL,
  title               text NOT NULL,
  content             text,
  missing_info        jsonb,
  enhancements        jsonb,
  questions           jsonb,
  sort_order          int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.brief_files (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id       uuid NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  file_name      text NOT NULL,
  file_path      text NOT NULL,
  file_type      text,
  file_size      bigint,
  gemini_file_uri text,
  uploaded_by    uuid REFERENCES public.profiles(id),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.brief_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id   uuid NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.brief_sections(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id),
  comment    text NOT NULL,
  actioned   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.client_sources (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  file_name   text NOT NULL,
  file_path   text NOT NULL,
  file_type   text,
  file_size   bigint,
  uploaded_by uuid REFERENCES public.profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE TABLE public.agents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  client_id         uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  name              text NOT NULL,
  agent_type        public.agent_type NOT NULL,
  status            public.agent_status NOT NULL DEFAULT 'active',
  description       text,
  config            jsonb NOT NULL DEFAULT '{}',
  last_run_at       timestamptz,
  signals_generated int NOT NULL DEFAULT 0,
  created_by        uuid REFERENCES public.profiles(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.signals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id           uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  client_id          uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  title              text NOT NULL,
  priority           public.signal_priority NOT NULL DEFAULT 'medium',
  findings           jsonb,
  opportunity        text,
  size_of_prize      text,
  lead_practice_ids  uuid[],
  confidence         int,
  status             public.signal_status NOT NULL DEFAULT 'new',
  converted_brief_id uuid REFERENCES public.briefs(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ═════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTION (after all tables exist)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE FUNCTION public.user_org_id() RETURNS uuid AS $$
  SELECT organisation_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═════════════════════════════════════════════════════════════════════════════

-- Organisations
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select" ON public.organisations
  FOR SELECT USING (id = public.user_org_id());

CREATE POLICY "org_update" ON public.organisations
  FOR UPDATE USING (
    id = public.user_org_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (organisation_id = public.user_org_id());

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid())
         OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (
    organisation_id = public.user_org_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_org" ON public.clients
  FOR ALL USING (organisation_id = public.user_org_id());

-- Practices
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "practices_org" ON public.practices
  FOR ALL USING (organisation_id = public.user_org_id());

-- Section Templates
ALTER TABLE public.section_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "section_templates_select" ON public.section_templates
  FOR SELECT USING (
    organisation_id IS NULL
    OR organisation_id = public.user_org_id()
  );

CREATE POLICY "section_templates_modify" ON public.section_templates
  FOR ALL USING (organisation_id = public.user_org_id())
  WITH CHECK (organisation_id = public.user_org_id());

-- Practice Templates
ALTER TABLE public.practice_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "practice_templates_org" ON public.practice_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.practices
      WHERE practices.id = practice_templates.practice_id
        AND practices.organisation_id = public.user_org_id()
    )
  );

-- Briefs
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "briefs_select" ON public.briefs
  FOR SELECT USING (organisation_id = public.user_org_id());

CREATE POLICY "briefs_update_creator" ON public.briefs
  FOR UPDATE USING (
    organisation_id = public.user_org_id()
    AND created_by = auth.uid()
  );

CREATE POLICY "briefs_update_managers" ON public.briefs
  FOR UPDATE USING (
    organisation_id = public.user_org_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "briefs_insert" ON public.briefs
  FOR INSERT WITH CHECK (organisation_id = public.user_org_id());

-- Brief Sections
ALTER TABLE public.brief_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brief_sections_org" ON public.brief_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.briefs
      WHERE briefs.id = brief_sections.brief_id
        AND briefs.organisation_id = public.user_org_id()
    )
  );

-- Brief Files
ALTER TABLE public.brief_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brief_files_org" ON public.brief_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.briefs
      WHERE briefs.id = brief_files.brief_id
        AND briefs.organisation_id = public.user_org_id()
    )
  );

-- Brief Comments
ALTER TABLE public.brief_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brief_comments_org" ON public.brief_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.briefs
      WHERE briefs.id = brief_comments.brief_id
        AND briefs.organisation_id = public.user_org_id()
    )
  );

-- Client Sources
ALTER TABLE public.client_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_sources_org" ON public.client_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_sources.client_id
        AND clients.organisation_id = public.user_org_id()
    )
  );

-- Agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_org" ON public.agents
  FOR ALL USING (organisation_id = public.user_org_id());

-- Signals
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signals_org" ON public.signals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = signals.agent_id
        AND agents.organisation_id = public.user_org_id()
    )
  );

-- ═════════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═════════════════════════════════════════════════════════════════════════════

-- Auto-create profile on auth.users insert
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.organisations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.practices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.section_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.practice_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.briefs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.brief_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.signals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═════════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_profiles_org ON public.profiles(organisation_id);
CREATE INDEX idx_clients_org ON public.clients(organisation_id);
CREATE INDEX idx_practices_org ON public.practices(organisation_id);
CREATE INDEX idx_briefs_org ON public.briefs(organisation_id);
CREATE INDEX idx_briefs_client ON public.briefs(client_id);
CREATE INDEX idx_briefs_created_by ON public.briefs(created_by);
CREATE INDEX idx_brief_sections_brief ON public.brief_sections(brief_id);
CREATE INDEX idx_brief_files_brief ON public.brief_files(brief_id);
CREATE INDEX idx_brief_comments_brief ON public.brief_comments(brief_id);
CREATE INDEX idx_client_sources_client ON public.client_sources(client_id);
CREATE INDEX idx_agents_org ON public.agents(organisation_id);
CREATE INDEX idx_signals_agent ON public.signals(agent_id);
CREATE INDEX idx_signals_client ON public.signals(client_id);
