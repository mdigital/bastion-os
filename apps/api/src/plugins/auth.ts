import type { FastifyPluginAsync } from 'fastify'
import type { UserRole } from '@bastion-os/shared'
import fp from 'fastify-plugin'
import { supabaseAdmin } from '../lib/supabase.js'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
    organisationId: string | null
    userRole: UserRole
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('userId', '')
  fastify.decorateRequest('organisationId', null)
  fastify.decorateRequest('userRole', 'user')

  fastify.addHook('onRequest', async (request, reply) => {
    // Skip auth for health check
    if (request.url === '/api/health') return

    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.unauthorized('Missing or invalid authorization header')
    }

    const token = authHeader.slice(7)
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return reply.unauthorized('Invalid or expired token')
    }

    request.userId = user.id

    // Fetch profile for org and role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('organisation_id, role')
      .eq('id', user.id)
      .single()

    if (profile) {
      request.organisationId = profile.organisation_id
      request.userRole = profile.role as UserRole
    }
  })
}

export default fp(authPlugin, { name: 'auth' })
