import type { FastifyPluginAsync } from 'fastify'
import type { UserRole, UserStatus } from '@bastion-os/shared'
import { supabaseAdmin } from '../../lib/supabase.js'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/users — list org users
  fastify.get(
    '/api/admin/users',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('organisation_id', request.organisationId)
        .order('created_at', { ascending: true })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // POST /api/admin/users/invite — invite user via magic link
  fastify.post<{ Body: { email: string; role?: UserRole } }>(
    '/api/admin/users/invite',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { email, role } = request.body
      if (!email) return reply.badRequest('email is required')

      const { data, error } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: {
            organisation_id: request.organisationId,
            role: role ?? 'user',
          },
        })

      if (error) return reply.internalServerError(error.message)

      // Update the auto-created profile with org + role
      if (data.user) {
        await supabaseAdmin
          .from('profiles')
          .update({
            organisation_id: request.organisationId,
            role: role ?? 'user',
          })
          .eq('id', data.user.id)
      }

      return { id: data.user.id, email }
    },
  )

  // PATCH /api/admin/users/:id — update role/status
  fastify.patch<{
    Params: { id: string }
    Body: { role?: UserRole; status?: UserStatus; full_name?: string }
  }>(
    '/api/admin/users/:id',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params
      const { role, status, full_name } = request.body

      const update: Record<string, unknown> = {}
      if (role !== undefined) update.role = role
      if (status !== undefined) update.status = status
      if (full_name !== undefined) update.full_name = full_name

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(update)
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('User not found in this organisation')
      return data
    },
  )
}

export default userRoutes
