// ─── Enums ──────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'user' | 'approver'
export type UserStatus = 'active' | 'inactive'
export type BriefLevel = 'new_project' | 'fast_forward'
export type BriefStatus = 'draft' | 'finalized' | 'archived'
export type AgentType = 'competitor' | 'client_data' | 'media' | 'social' | 'market'
export type AgentStatus = 'active' | 'paused' | 'complete'
export type SignalPriority = 'high' | 'medium' | 'low'
export type SignalStatus = 'new' | 'reviewed' | 'converted'

// ─── Core entities ──────────────────────────────────────────────────────────

export interface Organisation {
  id: string
  name: string
  domain: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  organisation_id: string | null
  role: UserRole
  full_name: string | null
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  organisation_id: string
  name: string
  industry: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface Practice {
  id: string
  organisation_id: string
  name: string
  color: string | null
  icon: string | null
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SectionTemplate {
  id: string
  organisation_id: string | null
  name: string
  description: string | null
  category: string | null
  ai_evaluation_criteria: string | null
  created_at: string
  updated_at: string
}

export interface PracticeTemplate {
  id: string
  practice_id: string
  brief_level: BriefLevel
  sections: Array<{ section_template_id: string; required: boolean }>
  created_at: string
  updated_at: string
}

// ─── Briefs ─────────────────────────────────────────────────────────────────

export interface Brief {
  id: string
  organisation_id: string
  client_id: string | null
  created_by: string
  job_to_be_done: string | null
  budget: string | null
  due_date: string | null
  live_date: string | null
  campaign_duration: string | null
  brief_level: BriefLevel
  lead_practice_id: string | null
  supporting_practice_ids: string[]
  status: BriefStatus
  archived: boolean
  created_at: string
  updated_at: string
}

export interface BriefSection {
  id: string
  brief_id: string
  section_template_id: string | null
  title: string
  content: string | null
  missing_info: unknown | null
  enhancements: unknown | null
  questions: unknown | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BriefFile {
  id: string
  brief_id: string
  file_name: string
  file_path: string
  file_type: string | null
  file_size: number | null
  gemini_file_uri: string | null
  uploaded_by: string | null
  created_at: string
}

export interface BriefComment {
  id: string
  brief_id: string
  section_id: string | null
  user_id: string
  comment: string
  actioned: boolean
  created_at: string
}

// ─── Knowledge Base ─────────────────────────────────────────────────────────

export interface ClientSource {
  id: string
  client_id: string
  file_name: string
  file_path: string
  file_type: string | null
  file_size: number | null
  uploaded_by: string | null
  created_at: string
  deleted_at: string | null
}

export interface KbConversation {
  id: string
  client_id: string
  created_by: string
  title: string | null
  source_ids: string[]
  created_at: string
  updated_at: string
}

export interface KbMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// ─── Signals ────────────────────────────────────────────────────────────────

export interface Agent {
  id: string
  organisation_id: string
  client_id: string | null
  name: string
  agent_type: AgentType
  status: AgentStatus
  description: string | null
  config: Record<string, unknown>
  last_run_at: string | null
  signals_generated: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Signal {
  id: string
  agent_id: string
  client_id: string | null
  title: string
  priority: SignalPriority
  findings: unknown | null
  opportunity: string | null
  size_of_prize: string | null
  lead_practice_ids: string[]
  confidence: number | null
  status: SignalStatus
  converted_brief_id: string | null
  created_at: string
  updated_at: string
}

// ─── Prompts ───────────────────────────────────────────────────────────────

export interface Prompt {
  id: string
  key: string
  display_name: string
  category: string
  content: string
  created_at: string
  updated_at: string
}

// ─── API ────────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number
  error: string
  message: string
}
