import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../../lib/supabase.js'

const kbSuggestionRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/kb/suggestions — list KB suggestion prompts
  fastify.get(
    '/api/kb/suggestions',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (_request, reply) => {
      const { data, error } = await supabaseAdmin
        .from('prompts')
        .select('id, key, display_name, content')
        .eq('category', 'Knowledge Base')
        .like('key', 'kb-suggest-%')
        .order('display_name', { ascending: true })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )
}

export default kbSuggestionRoutes
