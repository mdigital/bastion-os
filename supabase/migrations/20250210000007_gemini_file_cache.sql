ALTER TABLE public.client_sources
  ADD COLUMN gemini_file_uri text,
  ADD COLUMN gemini_file_uploaded_at timestamptz;
