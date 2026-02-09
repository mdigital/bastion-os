export interface Brief {
  id: string
  user_id: string
  title: string
  raw_input: string
  expanded_output: string | null
  status: 'draft' | 'processing' | 'completed' | 'error'
  created_at: string
  updated_at: string
}

export interface BriefFile {
  id: string
  brief_id: string
  file_name: string
  file_type: string
  file_url: string
  gemini_file_uri: string | null
  created_at: string
}

export interface ApiError {
  statusCode: number
  error: string
  message: string
}
