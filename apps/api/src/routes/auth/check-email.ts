import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../../lib/supabase.js'

const checkEmailRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: { email: string } }>('/api/auth/check-email', async (request, reply) => {
    const { email } = request.body

    if (!email || typeof email !== 'string' || !email.trim()) {
      return reply.badRequest('A valid email is required')
    }

    let usersData
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers()
      if (error) {
        request.log.error({ err: error }, 'Supabase listUsers error')
        return reply.internalServerError('Failed to query users')
      }
      usersData = data
    } catch (err) {
      request.log.error({ err }, 'Unexpected error querying Supabase users')
      return reply.internalServerError('Unexpected error')
    }

    if (!usersData?.users || !Array.isArray(usersData.users)) {
      request.log.error('Supabase returned invalid users data')
      return reply.internalServerError('Invalid user data from Supabase')
    }

    const found = usersData.users.some(
      (user) => typeof user.email === 'string' && user.email.toLowerCase() === email.toLowerCase()
    )

    return { found }
  })
}

export default checkEmailRoute
