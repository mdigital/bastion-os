INSERT INTO public.prompts (key, display_name, category, content)
VALUES (
  'brief-kb-context',
  'Knowledge Base Context for Brief Expansion',
  'Brief Expander',
  'The following documents from the client''s knowledge base are provided as supporting material. Use them to enrich section content, identify brand guidelines, rules, tone of voice, and any relevant constraints. Do not fabricate information beyond what these documents contain.

{{kb_documents}}'
)
ON CONFLICT (key) DO NOTHING;
