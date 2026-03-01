-- ─── Document digests: store extracted text + summary per source ────────────

ALTER TABLE public.client_sources
  ADD COLUMN digest_status text NOT NULL DEFAULT 'pending'
    CHECK (digest_status IN ('pending', 'processing', 'ready', 'failed')),
  ADD COLUMN digest_full_text text,
  ADD COLUMN digest_summary text,
  ADD COLUMN digest_error text,
  ADD COLUMN digested_at timestamptz;

-- Seed digest prompts
INSERT INTO public.prompts (key, display_name, category, content) VALUES
  ('kb-digest-extract', 'KB Digest: Full Text Extraction', 'Knowledge Base',
   'Extract the complete text content from this document and convert it to well-structured Markdown. Preserve all headings, lists, tables, and formatting. Include all text content — do not summarise or omit anything. Output only the Markdown content, no preamble.'),
  ('kb-digest-summary', 'KB Digest: Summary', 'Knowledge Base',
   'Create a structured Markdown summary of this document that captures: 1) Document type and purpose, 2) Key topics and themes, 3) Important facts, figures, and data points, 4) Key conclusions or recommendations, 5) Any dates, deadlines, or timelines. Target 500-1000 words. Be comprehensive but concise. Output only the Markdown summary, no preamble.'),
  ('kb-chat-system-deep', 'KB Chat System (Deep Dive)', 'Knowledge Base',
   'You are a knowledge base assistant. You have the full extracted text of the client documents. Answer questions thoroughly using all available detail. If you cannot find the answer in the documents, say so clearly.');

-- Update the existing kb-chat-system prompt to mention summaries
UPDATE public.prompts SET content =
  'You are a knowledge base assistant. You have summaries of the client documents. Answer questions based on these summaries. If you need more detail than the summaries provide, suggest the user try "Deep dive" mode. If you cannot find the answer, say so clearly.'
WHERE key = 'kb-chat-system';
