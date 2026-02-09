export interface BriefSectionTemplate {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export interface BriefTemplate {
  id: string;
  name: string;
  description: string;
  briefType: 'New Project Brief' | 'Fast Forward Brief';
  sections: BriefSectionTemplate[];
}

export interface PracticeArea {
  id: string;
  name: string;
  color: string;
  icon: string;
  briefTemplates: BriefTemplate[];
}

export const practiceAreas: PracticeArea[] = [
  {
    id: '1',
    name: 'Creative',
    color: '#EF4444',
    icon: '🎨',
    briefTemplates: [
      {
        id: 'creative-new',
        name: 'Creative',
        description: 'Creative campaigns and brand communications',
        briefType: 'New Project Brief',
        sections: [
          { id: 'sec-campaign-objectives', name: 'Campaign Objectives', description: 'Primary creative goals and KPIs', required: true },
          { id: 'sec-creative-concept', name: 'Creative Concept', description: 'Big idea and creative direction', required: true },
          { id: 'sec-brand-guidelines', name: 'Brand Guidelines', description: 'Brand standards and visual identity requirements', required: true },
          { id: 'sec-key-messaging', name: 'Key Messaging', description: 'Core messages and tone of voice', required: true },
          { id: 'sec-asset-requirements', name: 'Asset Requirements', description: 'Specific deliverables and formats needed', required: true },
          { id: 'sec-references-inspiration', name: 'References & Inspiration', description: 'Visual references and competitive examples', required: false }
        ]
      },
      {
        id: 'creative-fast',
        name: 'Creative',
        description: 'Creative campaigns and brand communications',
        briefType: 'Fast Forward Brief',
        sections: [
          { id: 'sec-campaign-objectives', name: 'Campaign Objectives', description: 'Primary creative goals and KPIs', required: true },
          { id: 'sec-creative-concept', name: 'Creative Concept', description: 'Big idea and creative direction', required: true },
          { id: 'sec-key-messaging', name: 'Key Messaging', description: 'Core messages and tone of voice', required: true },
          { id: 'sec-asset-requirements', name: 'Asset Requirements', description: 'Specific deliverables and formats needed', required: true }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Design',
    color: '#F59E0B',
    icon: '✏️',
    briefTemplates: [
      {
        id: 'design-t1',
        name: 'Design',
        description: 'Design projects and brand identity work',
        sections: [
          { id: 'sec-design-objectives', name: 'Design Objectives', description: 'What the design should achieve', required: true },
          { id: 'sec-brand-identity', name: 'Brand Identity', description: 'Brand guidelines and visual language', required: true },
          { id: 'sec-design-requirements', name: 'Design Requirements', description: 'Specific design deliverables needed', required: true },
          { id: 'sec-target-audience', name: 'Target Audience', description: 'Who the design is for', required: true },
          { id: 'sec-technical-specifications', name: 'Technical Specifications', description: 'Formats, sizes, and technical requirements', required: true },
          { id: 'sec-style-references', name: 'Style References', description: 'Visual inspiration and examples', required: false }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Social',
    color: '#3B82F6',
    icon: '📱',
    briefTemplates: [
      {
        id: 'social-t1',
        name: 'Social',
        description: 'Social media campaigns and content',
        sections: [
          { id: 'sec-campaign-goals', name: 'Campaign Goals', description: 'Awareness, engagement, or conversion objectives', required: true },
          { id: 'sec-platform-strategy', name: 'Platform Strategy', description: 'Which social platforms and why', required: true },
          { id: 'sec-content-types', name: 'Content Types', description: 'Video, static, carousel, stories format mix', required: true },
          { id: 'sec-targeting', name: 'Targeting', description: 'Audience segments and demographics', required: true },
          { id: 'sec-budget-timeline', name: 'Budget & Timeline', description: 'Spend allocation and campaign duration', required: true },
          { id: 'sec-community-management', name: 'Community Management', description: 'Response strategy and moderation guidelines', required: false }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Influencer',
    color: '#8B5CF6',
    icon: '⭐',
    briefTemplates: [
      {
        id: 'influencer-t1',
        name: 'Influencer',
        description: 'Influencer marketing campaigns and partnerships',
        sections: [
          { id: 'sec-campaign-objectives', name: 'Campaign Objectives', description: 'What the influencer campaign should achieve', required: true },
          { id: 'sec-influencer-criteria', name: 'Influencer Criteria', description: 'Type, tier, niche, and audience requirements', required: true },
          { id: 'sec-content-requirements', name: 'Content Requirements', description: 'Deliverables, formats, and creative guidelines', required: true },
          { id: 'sec-platform-distribution', name: 'Platform & Distribution', description: 'Where content will be published', required: true },
          { id: 'sec-budget-compensation', name: 'Budget & Compensation', description: 'Payment structure and deliverable fees', required: true },
          { id: 'sec-performance-metrics', name: 'Performance Metrics', description: 'How success will be measured', required: false }
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Earned PR',
    color: '#10B981',
    icon: '📰',
    briefTemplates: [
      {
        id: 'earnedpr-t1',
        name: 'Earned PR',
        description: 'Public relations and earned media campaigns',
        sections: [
          { id: 'sec-pr-objectives', name: 'PR Objectives', description: 'Media coverage and reputation goals', required: true },
          { id: 'sec-target-media', name: 'Target Media', description: 'Publications, journalists, and outlets', required: true },
          { id: 'sec-key-messages', name: 'Key Messages', description: 'Core narrative and story angles', required: true },
          { id: 'sec-news-hook', name: 'News Hook', description: 'What makes this newsworthy', required: true },
          { id: 'sec-stakeholders', name: 'Stakeholders', description: 'Spokespeople and interview subjects', required: true },
          { id: 'sec-timeline-milestones', name: 'Timeline & Milestones', description: 'Outreach schedule and key dates', required: false }
        ]
      }
    ]
  },
  {
    id: '6',
    name: 'Crisis and Corporate Communications',
    color: '#DC2626',
    icon: '🚨',
    briefTemplates: [
      {
        id: 'crisis-t1',
        name: 'Crisis and Corporate Communications',
        description: 'Crisis management and corporate communications',
        sections: [
          { id: 'sec-situation-analysis', name: 'Situation Analysis', description: 'Nature and severity of the issue', required: true },
          { id: 'sec-stakeholder-mapping', name: 'Stakeholder Mapping', description: 'Affected parties and priority audiences', required: true },
          { id: 'sec-key-messages', name: 'Key Messages', description: 'Holding statements and responses', required: true },
          { id: 'sec-response-protocol', name: 'Response Protocol', description: 'Approval process and timeline', required: true },
          { id: 'sec-communication-channels', name: 'Communication Channels', description: 'Where and how to communicate', required: true },
          { id: 'sec-monitoring-plan', name: 'Monitoring Plan', description: 'Tracking sentiment and media coverage', required: false }
        ]
      }
    ]
  },
  {
    id: '7',
    name: 'Partnership',
    color: '#EC4899',
    icon: '🤝',
    briefTemplates: [
      {
        id: 'partnership-t1',
        name: 'Partnership',
        description: 'Partnership activations and collaborations',
        sections: [
          { id: 'sec-partnership-goals', name: 'Partnership Goals', description: 'Objectives and expected outcomes', required: true },
          { id: 'sec-partner-details', name: 'Partner Details', description: 'Who the partner is and their value', required: true },
          { id: 'sec-activation-strategy', name: 'Activation Strategy', description: 'How to bring the partnership to life', required: true },
          { id: 'sec-rights-benefits', name: 'Rights & Benefits', description: 'What each party brings and receives', required: true },
          { id: 'sec-success-metrics', name: 'Success Metrics', description: 'How partnership success will be measured', required: true },
          { id: 'sec-legal-contracts', name: 'Legal & Contracts', description: 'Agreement terms and obligations', required: false }
        ]
      }
    ]
  },
  {
    id: '8',
    name: 'Experiential',
    color: '#7C3AED',
    icon: '✨',
    briefTemplates: [
      {
        id: 'experiential-t1',
        name: 'Experiential',
        description: 'Experiential events and brand experiences',
        sections: [
          { id: 'sec-experience-objectives', name: 'Experience Objectives', description: 'What the experience should achieve', required: true },
          { id: 'sec-target-audience', name: 'Target Audience', description: 'Who will participate', required: true },
          { id: 'sec-experience-design', name: 'Experience Design', description: 'Concept and key moments', required: true },
          { id: 'sec-logistics', name: 'Logistics', description: 'Venue, date, production requirements', required: true },
          { id: 'sec-success-metrics', name: 'Success Metrics', description: 'How success will be measured', required: true },
          { id: 'sec-safety-risk', name: 'Safety & Risk', description: 'Risk assessment and mitigation', required: false }
        ]
      }
    ]
  },
  {
    id: '9',
    name: 'Insights',
    color: '#0891B2',
    icon: '📊',
    briefTemplates: [
      {
        id: 'insights-t1',
        name: 'Insights',
        description: 'Market research and insights projects',
        sections: [
          { id: 'sec-research-objectives', name: 'Research Objectives', description: 'What insights are needed and why', required: true },
          { id: 'sec-target-audience', name: 'Target Audience', description: 'Who will be researched', required: true },
          { id: 'sec-methodology', name: 'Methodology', description: 'Qualitative, quantitative, or mixed', required: true },
          { id: 'sec-key-questions', name: 'Key Questions', description: 'Specific questions to be answered', required: true },
          { id: 'sec-timeline-budget', name: 'Timeline & Budget', description: 'Research timeframe and resources', required: true },
          { id: 'sec-deliverables', name: 'Deliverables', description: 'Report format and presentation requirements', required: false }
        ]
      }
    ]
  },
  {
    id: '10',
    name: 'Media Planning and Buying',
    color: '#EA580C',
    icon: '📡',
    briefTemplates: [
      {
        id: 'media-t1',
        name: 'Media Planning and Buying',
        description: 'Strategic media planning and buying',
        sections: [
          { id: 'sec-media-objectives', name: 'Media Objectives', description: 'Reach, frequency, and impact goals', required: true },
          { id: 'sec-target-audience', name: 'Target Audience', description: 'Demographics and media consumption', required: true },
          { id: 'sec-channel-mix', name: 'Channel Mix', description: 'TV, digital, radio, print, OOH mix', required: true },
          { id: 'sec-budget-timing', name: 'Budget & Timing', description: 'Media budget and flight dates', required: true },
          { id: 'sec-performance-metrics', name: 'Performance Metrics', description: 'How effectiveness will be measured', required: true },
          { id: 'sec-buying-strategy', name: 'Buying Strategy', description: 'Direct, programmatic, or agency approach', required: false }
        ]
      }
    ]
  },
  {
    id: '11',
    name: 'Advisory (Digital)',
    color: '#6366F1',
    icon: '💡',
    briefTemplates: [
      {
        id: 'advisory-t1',
        name: 'Advisory (Digital)',
        description: 'Digital strategy and consulting services',
        sections: [
          { id: 'sec-business-challenge', name: 'Business Challenge', description: 'The problem or opportunity to address', required: true },
          { id: 'sec-current-state-assessment', name: 'Current State Assessment', description: 'Existing digital capabilities and gaps', required: true },
          { id: 'sec-strategic-objectives', name: 'Strategic Objectives', description: 'Desired outcomes and success criteria', required: true },
          { id: 'sec-scope-focus-areas', name: 'Scope & Focus Areas', description: 'Which areas of digital transformation to prioritise', required: true },
          { id: 'sec-stakeholders', name: 'Stakeholders & Decision Makers', description: 'Key people involved in the process', required: true },
          { id: 'sec-constraints-dependencies', name: 'Constraints & Dependencies', description: 'Limitations, risks, and interdependencies', required: false }
        ]
      }
    ]
  },
  {
    id: '12',
    name: 'Analytics (Digital)',
    color: '#14B8A6',
    icon: '📈',
    briefTemplates: [
      {
        id: 'analytics-t1',
        name: 'Analytics (Digital)',
        description: 'Digital analytics and measurement',
        sections: [
          { id: 'sec-analytics-objectives', name: 'Analytics Objectives', description: 'What insights are needed from the data', required: true },
          { id: 'sec-data-sources', name: 'Data Sources', description: 'Platforms, tools, and data inputs', required: true },
          { id: 'sec-kpis-metrics', name: 'KPIs & Metrics', description: 'Key performance indicators to track', required: true },
          { id: 'sec-reporting-requirements', name: 'Reporting Requirements', description: 'Dashboard format, frequency, and audience', required: true },
          { id: 'sec-analysis-insights', name: 'Analysis & Insights', description: 'Types of analysis and insights needed', required: true },
          { id: 'sec-technical-setup', name: 'Technical Setup', description: 'Tracking implementation and tool configuration', required: false }
        ]
      }
    ]
  },
  {
    id: '13',
    name: 'Automation (Digital)',
    color: '#8B5CF6',
    icon: '⚙️',
    briefTemplates: [
      {
        id: 'automation-t1',
        name: 'Automation (Digital)',
        description: 'Marketing automation and workflow optimisation',
        sections: [
          { id: 'sec-automation-goals', name: 'Automation Goals', description: 'What processes to automate and why', required: true },
          { id: 'sec-current-workflow', name: 'Current Workflow', description: 'Existing manual processes and pain points', required: true },
          { id: 'sec-automation-strategy', name: 'Automation Strategy', description: 'Tools, platforms, and approach', required: true },
          { id: 'sec-customer-journey', name: 'Customer Journey', description: 'Touchpoints and triggers for automation', required: true },
          { id: 'sec-integration-requirements', name: 'Integration Requirements', description: 'Systems and data connections needed', required: true },
          { id: 'sec-testing-optimisation', name: 'Testing & Optimisation', description: 'Testing approach and ongoing improvement', required: false }
        ]
      }
    ]
  },
  {
    id: '14',
    name: 'Activation (Digital)',
    color: '#F97316',
    icon: '🚀',
    briefTemplates: [
      {
        id: 'activation-t1',
        name: 'Activation (Digital)',
        description: 'Digital campaign activation and execution',
        sections: [
          { id: 'sec-activation-objectives', name: 'Activation Objectives', description: 'Campaign goals and desired actions', required: true },
          { id: 'sec-campaign-mechanics', name: 'Campaign Mechanics', description: 'How the activation will work', required: true },
          { id: 'sec-digital-channels', name: 'Digital Channels', description: 'Platforms and touchpoints for activation', required: true },
          { id: 'sec-user-experience', name: 'User Experience', description: 'Journey from awareness to conversion', required: true },
          { id: 'sec-technical-requirements', name: 'Technical Requirements', description: 'Tools, platforms, and integrations needed', required: true },
          { id: 'sec-performance-tracking', name: 'Performance Tracking', description: 'Measurement and optimisation approach', required: false }
        ]
      }
    ]
  }
];