-- =============================================================================
-- Brief Analysis Pipeline — columns + prompts
-- =============================================================================

-- ─── New columns on briefs ──────────────────────────────────────────────────

ALTER TABLE public.briefs
  ADD COLUMN IF NOT EXISTS analysis_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS analysis_error  text,
  ADD COLUMN IF NOT EXISTS extracted_text   text,
  ADD COLUMN IF NOT EXISTS triage_rationale text;

COMMENT ON COLUMN public.briefs.analysis_status IS
  'Pipeline progress: pending → extracting → extracted → triaging → triaged → generating → ready (or *_failed)';

-- ─── Seed brief-expander prompts ────────────────────────────────────────────

INSERT INTO public.prompts (key, display_name, category, content) VALUES
(
  'brief-extract-text',
  'Brief: Extract Text',
  'Brief Expander',
  'Extract the complete text content from this document and convert it to well-structured Markdown. Preserve all headings, lists, tables, and formatting. Include all text content — do not summarise or omit anything. Output only the Markdown content, no preamble.'
),
(
  'brief-extract-keyinfo',
  'Brief: Extract Key Info',
  'Brief Expander',
  E'Analyse the following brief text and extract structured key information.\n\nReturn ONLY a JSON object with these fields (use null for any field you cannot determine):\n{\n  "job_to_be_done": "string — the core objective or job to be done",\n  "budget": "string — the budget amount with currency",\n  "due_date": "string — YYYY-MM-DD format or null",\n  "live_date": "string — YYYY-MM-DD format or null",\n  "campaign_duration": "string — e.g. ''6 months''",\n  "brief_level": "new_project or fast_forward"\n}\n\nBrief text:\n{{brief_text}}'
),
(
  'brief-triage-practice',
  'Brief: Triage Practice Area',
  'Brief Expander',
  E'You are a marketing agency strategist. Given a client brief and the list of available practice areas, recommend which practice area should LEAD this brief.\n\nAvailable practice areas:\n{{practices}}\n\nBrief text:\n{{brief_text}}\n\nKey information:\n{{key_info}}\n\nReturn ONLY a JSON object:\n{\n  "lead_practice": "exact practice name from the list above",\n  "supporting_practices": ["array of supporting practice names"],\n  "rationale": "2-3 paragraph explanation of why this practice should lead and how supporting practices contribute"\n}'
),
(
  'brief-generate-sections',
  'Brief: Generate Enriched Sections',
  'Brief Expander',
  E'You are a senior strategist reviewing a client brief. For each section template provided, generate enriched content based on the brief text.\n\nBrief text:\n{{brief_text}}\n\nKey information:\n{{key_info}}\n\nSection templates to generate (with evaluation criteria):\n{{sections}}\n\nFor EACH section, return a JSON array where each element has:\n{\n  "section_template_id": "the template id",\n  "title": "section title",\n  "content": "HTML-formatted content extracted/expanded from the brief for this section",\n  "missing_info": ["array of missing information items that would strengthen this section"],\n  "enhancements": [{"text": "enhancement suggestion", "source": "knowledge source or reasoning"}],\n  "questions": ["array of clarifying questions for the brief author"]\n}\n\nIf the brief has no relevant content for a section, still include it with minimal content and note what is missing.\n\nReturn ONLY the JSON array, no preamble.'
)
ON CONFLICT (key) DO UPDATE SET
  content = EXCLUDED.content,
  display_name = EXCLUDED.display_name,
  category = EXCLUDED.category,
  updated_at = now();
