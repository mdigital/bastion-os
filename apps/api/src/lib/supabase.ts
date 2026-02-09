import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env['SUPABASE_URL']!
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY']!

/** Admin client — bypasses RLS. Use for server-side operations. */
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey)

/** Create a user-scoped client that respects RLS using the user's JWT. */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}
