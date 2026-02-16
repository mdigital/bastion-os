import { supabaseAdmin } from './supabase.js'

/** Fetch a prompt's content from the database by key, falling back to the provided default. */
export async function getPrompt(key: string, fallback: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .select('content')
    .eq('key', key)
    .single()

  if (error || !data) return fallback
  return data.content || fallback
}
