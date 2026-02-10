-- =============================================================================
-- bastion-os: Global Section Templates Seed Data
-- =============================================================================
-- These are platform-wide templates (organisation_id IS NULL).
-- Organisations can create their own custom templates via the admin UI.

INSERT INTO public.section_templates (id, name, description, category, ai_evaluation_criteria) VALUES
-- Strategy
('sec-campaign-objectives', 'Campaign Objectives', 'Primary goals, KPIs, and success metrics for the campaign', 'Strategy', 'Check for specific, measurable objectives. Verify KPIs are quantifiable with clear targets. Ensure success metrics align with business goals.'),
('sec-business-challenge', 'Business Challenge', 'The problem or opportunity to address', 'Strategy', 'Verify clear articulation of the problem. Check for context about why this matters now. Ensure the challenge is specific and actionable.'),
('sec-strategic-objectives', 'Strategic Objectives', 'Desired outcomes and success criteria', 'Strategy', 'Confirm objectives are SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Check alignment with business strategy.'),
('sec-target-audience', 'Target Audience', 'Demographics, psychographics, and audience segments', 'Strategy', 'Verify demographic details (age, location, income). Check for psychographic insights (values, behaviours, pain points). Ensure audience is specific enough to be actionable.'),
('sec-research-objectives', 'Research Objectives', 'What insights are needed and why', 'Strategy', 'Check clarity of research questions. Verify alignment with business objectives. Ensure insights sought are actionable and specific.'),
('sec-campaign-goals', 'Campaign Goals', 'Awareness, engagement, or conversion objectives', 'Strategy', NULL),

-- Creative
('sec-creative-concept', 'Creative Concept', 'Big idea and creative direction', 'Creative', NULL),
('sec-brand-guidelines', 'Brand Guidelines', 'Brand standards and visual identity requirements', 'Creative', NULL),
('sec-key-messaging', 'Key Messaging', 'Core messages and tone of voice', 'Creative', NULL),
('sec-brand-identity', 'Brand Identity', 'Brand guidelines and visual language', 'Creative', NULL),
('sec-design-objectives', 'Design Objectives', 'What the design should achieve', 'Creative', NULL),
('sec-references-inspiration', 'References & Inspiration', 'Visual references and competitive examples', 'Creative', NULL),
('sec-style-references', 'Style References', 'Visual inspiration and examples', 'Creative', NULL),

-- Execution
('sec-asset-requirements', 'Asset Requirements', 'Specific deliverables and formats needed', 'Execution', NULL),
('sec-design-requirements', 'Design Requirements', 'Specific design deliverables needed', 'Execution', NULL),
('sec-technical-specifications', 'Technical Specifications', 'Formats, sizes, and technical requirements', 'Execution', NULL),
('sec-technical-requirements', 'Technical Requirements', 'Platform, integrations, and technical needs', 'Execution', NULL),
('sec-content-requirements', 'Content Requirements', 'Deliverables, formats, and creative guidelines', 'Execution', NULL),
('sec-deliverables', 'Deliverables', 'Report format and presentation requirements', 'Execution', NULL),

-- Media & Channels
('sec-platform-strategy', 'Platform Strategy', 'Which platforms to use and why', 'Media & Channels', NULL),
('sec-channel-mix', 'Channel Mix', 'TV, digital, radio, print, OOH mix', 'Media & Channels', NULL),
('sec-digital-channels', 'Digital Channels', 'Platforms and touchpoints for activation', 'Media & Channels', NULL),
('sec-platform-distribution', 'Platform & Distribution', 'Where content will be published', 'Media & Channels', NULL),
('sec-content-types', 'Content Types', 'Video, static, carousel, stories format mix', 'Media & Channels', NULL),
('sec-media-objectives', 'Media Objectives', 'Reach, frequency, and impact goals', 'Media & Channels', NULL),
('sec-target-media', 'Target Media', 'Publications, journalists, and outlets', 'Media & Channels', NULL),
('sec-buying-strategy', 'Buying Strategy', 'Direct, programmatic, or agency approach', 'Media & Channels', NULL),

-- Budget & Timeline
('sec-budget-timing', 'Budget & Timing', 'Financial allocation and key dates', 'Budget & Timeline', NULL),
('sec-budget-timeline', 'Budget & Timeline', 'Spend allocation and campaign duration', 'Budget & Timeline', NULL),
('sec-budget-compensation', 'Budget & Compensation', 'Payment structure and deliverable fees', 'Budget & Timeline', NULL),
('sec-timeline-budget', 'Timeline & Budget', 'Research timeframe and resources', 'Budget & Timeline', NULL),
('sec-timeline-milestones', 'Timeline & Milestones', 'Outreach schedule and key dates', 'Budget & Timeline', NULL),

-- Measurement
('sec-performance-metrics', 'Performance Metrics', 'How success will be measured', 'Measurement', NULL),
('sec-success-metrics', 'Success Metrics', 'How success will be measured', 'Measurement', NULL),
('sec-kpis-metrics', 'KPIs & Metrics', 'Key performance indicators to track', 'Measurement', NULL),
('sec-analytics-objectives', 'Analytics Objectives', 'What insights are needed from the data', 'Measurement', NULL),
('sec-performance-tracking', 'Performance Tracking', 'Measurement and optimisation approach', 'Measurement', NULL),
('sec-monitoring-plan', 'Monitoring Plan', 'Tracking sentiment and media coverage', 'Measurement', NULL),

-- Audience
('sec-targeting', 'Targeting', 'Audience segments and demographics', 'Audience', NULL),
('sec-influencer-criteria', 'Influencer Criteria', 'Type, tier, niche, and audience requirements', 'Audience', NULL),
('sec-stakeholders', 'Stakeholders', 'Key people involved in the process', 'Audience', NULL),
('sec-stakeholder-mapping', 'Stakeholder Mapping', 'Affected parties and priority audiences', 'Audience', NULL),

-- Communications
('sec-key-messages', 'Key Messages', 'Core narrative and story angles', 'Communications', NULL),
('sec-news-hook', 'News Hook', 'What makes this newsworthy', 'Communications', NULL),
('sec-pr-objectives', 'PR Objectives', 'Media coverage and reputation goals', 'Communications', NULL),
('sec-communication-channels', 'Communication Channels', 'Where and how to communicate', 'Communications', NULL),
('sec-response-protocol', 'Response Protocol', 'Approval process and timeline', 'Communications', NULL),
('sec-situation-analysis', 'Situation Analysis', 'Nature and severity of the issue', 'Communications', NULL),

-- Engagement
('sec-community-management', 'Community Management', 'Response strategy and moderation guidelines', 'Engagement', NULL),
('sec-user-experience', 'User Experience', 'Journey from awareness to conversion', 'Engagement', NULL),
('sec-customer-journey', 'Customer Journey', 'Touchpoints and triggers for automation', 'Engagement', NULL),

-- Partnership
('sec-partnership-goals', 'Partnership Goals', 'Objectives and expected outcomes', 'Partnership', NULL),
('sec-partner-details', 'Partner Details', 'Who the partner is and their value', 'Partnership', NULL),
('sec-activation-strategy', 'Activation Strategy', 'How to bring the partnership to life', 'Partnership', NULL),
('sec-rights-benefits', 'Rights & Benefits', 'What each party brings and receives', 'Partnership', NULL),
('sec-legal-contracts', 'Legal & Contracts', 'Agreement terms and obligations', 'Partnership', NULL),

-- Experience
('sec-experience-objectives', 'Experience Objectives', 'What the experience should achieve', 'Experience', NULL),
('sec-experience-design', 'Experience Design', 'Concept and key moments', 'Experience', NULL),
('sec-logistics', 'Logistics', 'Venue, date, production requirements', 'Experience', NULL),
('sec-safety-risk', 'Safety & Risk', 'Risk assessment and mitigation', 'Experience', NULL),

-- Research
('sec-methodology', 'Methodology', 'Qualitative, quantitative, or mixed approach', 'Research', NULL),
('sec-key-questions', 'Key Questions', 'Specific questions to be answered', 'Research', NULL),
('sec-data-sources', 'Data Sources', 'Platforms, tools, and data inputs', 'Research', NULL),
('sec-analysis-insights', 'Analysis & Insights', 'Types of analysis and insights needed', 'Research', NULL),

-- Digital
('sec-current-state-assessment', 'Current State Assessment', 'Existing digital capabilities and gaps', 'Digital', NULL),
('sec-scope-focus-areas', 'Scope & Focus Areas', 'Which areas of digital transformation to prioritise', 'Digital', NULL),
('sec-constraints-dependencies', 'Constraints & Dependencies', 'Limitations, risks, and interdependencies', 'Digital', NULL),
('sec-reporting-requirements', 'Reporting Requirements', 'Dashboard format, frequency, and audience', 'Digital', NULL),
('sec-technical-setup', 'Technical Setup', 'Tracking implementation and tool configuration', 'Digital', NULL),
('sec-current-workflow', 'Current Workflow', 'Existing manual processes and pain points', 'Digital', NULL),
('sec-automation-strategy', 'Automation Strategy', 'Tools, platforms, and approach', 'Digital', NULL),
('sec-integration-requirements', 'Integration Requirements', 'Systems and data connections needed', 'Digital', NULL),
('sec-testing-optimisation', 'Testing & Optimisation', 'Testing approach and ongoing improvement', 'Digital', NULL),
('sec-activation-objectives', 'Activation Objectives', 'Campaign goals and desired actions', 'Digital', NULL),
('sec-campaign-mechanics', 'Campaign Mechanics', 'How the activation will work', 'Digital', NULL),
('sec-automation-goals', 'Automation Goals', 'What processes to automate and why', 'Digital', NULL);
