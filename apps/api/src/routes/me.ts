import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../lib/supabase.js'

const meRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/me — current user's profile
  fastify.get('/api/me', async (request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, organisation_id, role, full_name, status')
      .eq('id', request.userId)
      .single()

    if (error || !data) return reply.notFound('Profile not found')
    return data
  })
}

export default meRoutes
