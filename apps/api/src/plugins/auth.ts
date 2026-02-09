import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { supabaseAdmin } from '../lib/supabase.js'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('userId', '')

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
  })
}

export default fp(authPlugin, { name: 'auth' })
