export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  category: string; // For grouping sections
  aiEvaluationCriteria?: string; // Criteria for AI to evaluate this section
}

export const sectionCatalog: SectionTemplate[] = [
  // Strategic Sections
  { 
    id: 'sec-campaign-objectives', 
    name: 'Campaign Objectives', 
    description: 'Primary goals, KPIs, and success metrics for the campaign',
    category: 'Strategy',
    aiEvaluationCriteria: 'Check for specific, measurable objectives. Verify KPIs are quantifiable with clear targets. Ensure success metrics align with business goals.'
  },
  { 
    id: 'sec-business-challenge', 
    name: 'Business Challenge', 
    description: 'The problem or opportunity to address',
    category: 'Strategy',
    aiEvaluationCriteria: 'Verify clear articulation of the problem. Check for context about why this matters now. Ensure the challenge is specific and actionable.'
  },
  { 
    id: 'sec-strategic-objectives', 
    name: 'Strategic Objectives', 
    description: 'Desired outcomes and success criteria',
    category: 'Strategy',
    aiEvaluationCriteria: 'Confirm objectives are SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Check alignment with business strategy.'
  },
  { 
    id: 'sec-target-audience', 
    name: 'Target Audience', 
    description: 'Demographics, psychographics, and audience segments',
    category: 'Strategy',
    aiEvaluationCriteria: 'Verify demographic details (age, location, income). Check for psychographic insights (values, behaviours, pain points). Ensure audience is specific enough to be actionable.'
  },
  { 
    id: 'sec-research-objectives', 
    name: 'Research Objectives', 
    description: 'What insights are needed and why',
    category: 'Strategy',
    aiEvaluationCriteria: 'Check clarity of research questions. Verify alignment with business objectives. Ensure insights sought are actionable and specific.'
  },
  
  // Creative Sections
  { 
    id: 'sec-creative-concept', 
    name: 'Creative Concept', 
    description: 'Big idea and creative direction',
    category: 'Creative'
  },
  { 
    id: 'sec-brand-guidelines', 
    name: 'Brand Guidelines', 
    description: 'Brand standards and visual identity requirements',
    category: 'Creative'
  },
  { 
    id: 'sec-key-messaging', 
    name: 'Key Messaging', 
    description: 'Core messages and tone of voice',
    category: 'Creative'
  },
  { 
    id: 'sec-brand-identity', 
    name: 'Brand Identity', 
    description: 'Brand guidelines and visual language',
    category: 'Creative'
  },
  { 
    id: 'sec-design-objectives', 
    name: 'Design Objectives', 
    description: 'What the design should achieve',
    category: 'Creative'
  },
  
  // Execution & Deliverables
  { 
    id: 'sec-asset-requirements', 
    name: 'Asset Requirements', 
    description: 'Specific deliverables and formats needed',
    category: 'Execution'
  },
  { 
    id: 'sec-design-requirements', 
    name: 'Design Requirements', 
    description: 'Specific design deliverables needed',
    category: 'Execution'
  },
  { 
    id: 'sec-technical-specifications', 
    name: 'Technical Specifications', 
    description: 'Formats, sizes, and technical requirements',
    category: 'Execution'
  },
  { 
    id: 'sec-technical-requirements', 
    name: 'Technical Requirements', 
    description: 'Platform, integrations, and technical needs',
    category: 'Execution'
  },
  { 
    id: 'sec-content-requirements', 
    name: 'Content Requirements', 
    description: 'Deliverables, formats, and creative guidelines',
    category: 'Execution'
  },
  { 
    id: 'sec-deliverables', 
    name: 'Deliverables', 
    description: 'Report format and presentation requirements',
    category: 'Execution'
  },
  
  // Media & Channels
  { 
    id: 'sec-platform-strategy', 
    name: 'Platform Strategy', 
    description: 'Which platforms to use and why',
    category: 'Media & Channels'
  },
  { 
    id: 'sec-channel-mix', 
    name: 'Channel Mix', 
    description: 'TV, digital, radio, print, OOH mix',
    category: 'Media & Channels'
  },
  { 
    id: 'sec-digital-channels', 
    name: 'Digital Channels', 
    description: 'Platforms and touchpoints for activation',
    category: 'Media & Channels'
  },
  { 
    id: 'sec-platform-distribution', 
    name: 'Platform & Distribution', 
    description: 'Where content will be published',
    category: 'Media & Channels'
  },
  { 
    id: 'sec-content-types', 
    name: 'Content Types', 
    description: 'Video, static, carousel, stories format mix',
    category: 'Media & Channels'
  },
  { 
    id: 'sec-media-objectives', 
    name: 'Media Objectives', 
    description: 'Reach, frequency, and impact goals',
    category: 'Media & Channels'
  },
  { 
    id: 'sec-target-media', 
    name: 'Target Media', 
    description: 'Publications, journalists, and outlets',
    category: 'Media & Channels'
  },
  
  // Budget & Timeline
  { 
    id: 'sec-budget-timing', 
    name: 'Budget & Timing', 
    description: 'Financial allocation and key dates',
    category: 'Budget & Timeline'
  },
  { 
    id: 'sec-budget-timeline', 
    name: 'Budget & Timeline', 
    description: 'Spend allocation and campaign duration',
    category: 'Budget & Timeline'
  },
  { 
    id: 'sec-budget-compensation', 
    name: 'Budget & Compensation', 
    description: 'Payment structure and deliverable fees',
    category: 'Budget & Timeline'
  },
  { 
    id: 'sec-timeline-budget', 
    name: 'Timeline & Budget', 
    description: 'Research timeframe and resources',
    category: 'Budget & Timeline'
  },
  { 
    id: 'sec-timeline-milestones', 
    name: 'Timeline & Milestones', 
    description: 'Outreach schedule and key dates',
    category: 'Budget & Timeline'
  },
  
  // Measurement & Analytics
  { 
    id: 'sec-performance-metrics', 
    name: 'Performance Metrics', 
    description: 'How success will be measured',
    category: 'Measurement'
  },
  { 
    id: 'sec-success-metrics', 
    name: 'Success Metrics', 
    description: 'How success will be measured',
    category: 'Measurement'
  },
  { 
    id: 'sec-kpis-metrics', 
    name: 'KPIs & Metrics', 
    description: 'Key performance indicators to track',
    category: 'Measurement'
  },
  { 
    id: 'sec-analytics-objectives', 
    name: 'Analytics Objectives', 
    description: 'What insights are needed from the data',
    category: 'Measurement'
  },
  { 
    id: 'sec-performance-tracking', 
    name: 'Performance Tracking', 
    description: 'Measurement and optimisation approach',
    category: 'Measurement'
  },
  
  // Audience & Targeting
  { 
    id: 'sec-targeting', 
    name: 'Targeting', 
    description: 'Audience segments and demographics',
    category: 'Audience'
  },
  { 
    id: 'sec-influencer-criteria', 
    name: 'Influencer Criteria', 
    description: 'Type, tier, niche, and audience requirements',
    category: 'Audience'
  },
  { 
    id: 'sec-stakeholders', 
    name: 'Stakeholders', 
    description: 'Key people involved in the process',
    category: 'Audience'
  },
  { 
    id: 'sec-stakeholder-mapping', 
    name: 'Stakeholder Mapping', 
    description: 'Affected parties and priority audiences',
    category: 'Audience'
  },
  
  // PR & Communications
  { 
    id: 'sec-key-messages', 
    name: 'Key Messages', 
    description: 'Core narrative and story angles',
    category: 'Communications'
  },
  { 
    id: 'sec-news-hook', 
    name: 'News Hook', 
    description: 'What makes this newsworthy',
    category: 'Communications'
  },
  { 
    id: 'sec-pr-objectives', 
    name: 'PR Objectives', 
    description: 'Media coverage and reputation goals',
    category: 'Communications'
  },
  { 
    id: 'sec-communication-channels', 
    name: 'Communication Channels', 
    description: 'Where and how to communicate',
    category: 'Communications'
  },
  { 
    id: 'sec-response-protocol', 
    name: 'Response Protocol', 
    description: 'Approval process and timeline',
    category: 'Communications'
  },
  { 
    id: 'sec-situation-analysis', 
    name: 'Situation Analysis', 
    description: 'Nature and severity of the issue',
    category: 'Communications'
  },
  
  // Community & Engagement
  { 
    id: 'sec-community-management', 
    name: 'Community Management', 
    description: 'Response strategy and moderation guidelines',
    category: 'Engagement'
  },
  { 
    id: 'sec-user-experience', 
    name: 'User Experience', 
    description: 'Journey from awareness to conversion',
    category: 'Engagement'
  },
  { 
    id: 'sec-customer-journey', 
    name: 'Customer Journey', 
    description: 'Touchpoints and triggers for automation',
    category: 'Engagement'
  },
  
  // Partnership & Collaboration
  { 
    id: 'sec-partnership-goals', 
    name: 'Partnership Goals', 
    description: 'Objectives and expected outcomes',
    category: 'Partnership'
  },
  { 
    id: 'sec-partner-details', 
    name: 'Partner Details', 
    description: 'Who the partner is and their value',
    category: 'Partnership'
  },
  { 
    id: 'sec-activation-strategy', 
    name: 'Activation Strategy', 
    description: 'How to bring the partnership to life',
    category: 'Partnership'
  },
  { 
    id: 'sec-rights-benefits', 
    name: 'Rights & Benefits', 
    description: 'What each party brings and receives',
    category: 'Partnership'
  },
  { 
    id: 'sec-legal-contracts', 
    name: 'Legal & Contracts', 
    description: 'Agreement terms and obligations',
    category: 'Partnership'
  },
  
  // Experience & Events
  { 
    id: 'sec-experience-objectives', 
    name: 'Experience Objectives', 
    description: 'What the experience should achieve',
    category: 'Experience'
  },
  { 
    id: 'sec-experience-design', 
    name: 'Experience Design', 
    description: 'Concept and key moments',
    category: 'Experience'
  },
  { 
    id: 'sec-logistics', 
    name: 'Logistics', 
    description: 'Venue, date, production requirements',
    category: 'Experience'
  },
  { 
    id: 'sec-safety-risk', 
    name: 'Safety & Risk', 
    description: 'Risk assessment and mitigation',
    category: 'Experience'
  },
  
  // Research & Insights
  { 
    id: 'sec-methodology', 
    name: 'Methodology', 
    description: 'Qualitative, quantitative, or mixed approach',
    category: 'Research'
  },
  { 
    id: 'sec-key-questions', 
    name: 'Key Questions', 
    description: 'Specific questions to be answered',
    category: 'Research'
  },
  { 
    id: 'sec-data-sources', 
    name: 'Data Sources', 
    description: 'Platforms, tools, and data inputs',
    category: 'Research'
  },
  { 
    id: 'sec-analysis-insights', 
    name: 'Analysis & Insights', 
    description: 'Types of analysis and insights needed',
    category: 'Research'
  },
  
  // Digital Specific
  { 
    id: 'sec-current-state-assessment', 
    name: 'Current State Assessment', 
    description: 'Existing digital capabilities and gaps',
    category: 'Digital'
  },
  { 
    id: 'sec-scope-focus-areas', 
    name: 'Scope & Focus Areas', 
    description: 'Which areas of digital transformation to prioritise',
    category: 'Digital'
  },
  { 
    id: 'sec-constraints-dependencies', 
    name: 'Constraints & Dependencies', 
    description: 'Limitations, risks, and interdependencies',
    category: 'Digital'
  },
  { 
    id: 'sec-reporting-requirements', 
    name: 'Reporting Requirements', 
    description: 'Dashboard format, frequency, and audience',
    category: 'Digital'
  },
  { 
    id: 'sec-technical-setup', 
    name: 'Technical Setup', 
    description: 'Tracking implementation and tool configuration',
    category: 'Digital'
  },
  { 
    id: 'sec-current-workflow', 
    name: 'Current Workflow', 
    description: 'Existing manual processes and pain points',
    category: 'Digital'
  },
  { 
    id: 'sec-automation-strategy', 
    name: 'Automation Strategy', 
    description: 'Tools, platforms, and approach',
    category: 'Digital'
  },
  { 
    id: 'sec-integration-requirements', 
    name: 'Integration Requirements', 
    description: 'Systems and data connections needed',
    category: 'Digital'
  },
  { 
    id: 'sec-testing-optimisation', 
    name: 'Testing & Optimisation', 
    description: 'Testing approach and ongoing improvement',
    category: 'Digital'
  },
  { 
    id: 'sec-activation-objectives', 
    name: 'Activation Objectives', 
    description: 'Campaign goals and desired actions',
    category: 'Digital'
  },
  { 
    id: 'sec-campaign-mechanics', 
    name: 'Campaign Mechanics', 
    description: 'How the activation will work',
    category: 'Digital'
  },
  { 
    id: 'sec-automation-goals', 
    name: 'Automation Goals', 
    description: 'What processes to automate and why',
    category: 'Digital'
  },
  
  // Additional Common Sections
  { 
    id: 'sec-references-inspiration', 
    name: 'References & Inspiration', 
    description: 'Visual references and competitive examples',
    category: 'Creative'
  },
  { 
    id: 'sec-style-references', 
    name: 'Style References', 
    description: 'Visual inspiration and examples',
    category: 'Creative'
  },
  { 
    id: 'sec-monitoring-plan', 
    name: 'Monitoring Plan', 
    description: 'Tracking sentiment and media coverage',
    category: 'Measurement'
  },
  { 
    id: 'sec-buying-strategy', 
    name: 'Buying Strategy', 
    description: 'Direct, programmatic, or agency approach',
    category: 'Media & Channels'
  },
  { 
    id: 'sec-campaign-goals', 
    name: 'Campaign Goals', 
    description: 'Awareness, engagement, or conversion objectives',
    category: 'Strategy'
  }
];

// Helper function to get sections by category
export function getSectionsByCategory(category: string): SectionTemplate[] {
  return sectionCatalog.filter(section => section.category === category);
}

// Helper function to get all categories
export function getAllCategories(): string[] {
  const categories = new Set(sectionCatalog.map(section => section.category));
  return Array.from(categories).sort();
}

// Helper function to get section by ID
export function getSectionById(id: string): SectionTemplate | undefined {
  return sectionCatalog.find(section => section.id === id);
}

// Helper function to get template by practice name and brief type
export function getTemplateByPracticeAndType(
  practiceName: string,
  briefType: 'New Project Brief' | 'Fast Forward Brief'
): SectionTemplate[] {
  // In production, this would query the database
  // For now, return sections from the catalog
  return [];
}