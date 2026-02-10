import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../../lib/supabase.js'

const organisationRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/organisation — current user's org
  fastify.get(
    '/api/admin/organisation',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { data, error } = await supabaseAdmin
        .from('organisations')
        .select('*')
        .eq('id', request.organisationId)
        .single()

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // PATCH /api/admin/organisation — update org settings
  fastify.patch<{ Body: { name?: string; domain?: string; settings?: Record<string, unknown> } }>(
    '/api/admin/organisation',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { name, domain, settings } = request.body

      const update: Record<string, unknown> = {}
      if (name !== undefined) update.name = name
      if (domain !== undefined) update.domain = domain
      if (settings !== undefined) update.settings = settings

      const { data, error } = await supabaseAdmin
        .from('organisations')
        .update(update)
        .eq('id', request.organisationId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )
}

export default organisationRoutes
