import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../lib/supabase.js'

const clientLookupRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/clients — lightweight client list for any authenticated user
  fastify.get(
    '/api/clients',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { data, error } = await supabaseAdmin
        .from('clients')
        .select('id, name')
        .eq('organisation_id', request.organisationId)
        .order('name', { ascending: true })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )
}

export default clientLookupRoutes
