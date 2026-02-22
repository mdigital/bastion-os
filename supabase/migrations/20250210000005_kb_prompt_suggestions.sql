-- ─── Seed: Knowledge Base suggestion prompts ─────────────────────────────────

insert into public.prompts (key, display_name, category, content)
values
  ('kb-suggest-summary', 'Summarise key goals', 'Knowledge Base',
   'Can you summarise the key goals and objectives for this client based on the selected sources?'),

  ('kb-suggest-competitors', 'Competitor analysis', 'Knowledge Base',
   'Provide a detailed competitor analysis for this client, including market positioning and key differentiators based on the available documents.'),

  ('kb-suggest-audience', 'Target audience', 'Knowledge Base',
   'What are the target audience insights and demographics for this client? Include psychographic and behavioural characteristics.'),

  ('kb-suggest-timeline', 'Campaign timeline', 'Knowledge Base',
   'Extract and organise all key dates, milestones, and campaign timelines mentioned in the client documents.'),

  ('kb-suggest-challenges', 'Key challenges', 'Knowledge Base',
   'What are the main challenges and pain points facing this client based on the available information?'),

  ('kb-suggest-strategy', 'Strategy ideas', 'Knowledge Base',
   'Based on the client documents, provide strategic recommendations for campaign approaches and creative directions.'),

  ('kb-suggest-brand', 'Brand positioning', 'Knowledge Base',
   'Analyse the brand positioning, tone of voice, and brand guidelines from the selected sources.'),

  ('kb-suggest-budget', 'Budget info', 'Knowledge Base',
   'Extract budget information, resource allocations, and financial constraints mentioned in the client materials.');
