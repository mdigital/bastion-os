import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import type { UserRole } from '@bastion-os/shared'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyContextConfig {
    requiredRoles?: UserRole[]
  }
}

const requireRolePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook(
    'onRequest',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const roles = request.routeOptions.config?.requiredRoles
      if (!roles || roles.length === 0) return

      if (!request.organisationId) {
        return reply.forbidden('User is not associated with an organisation')
      }

      if (!roles.includes(request.userRole)) {
        return reply.forbidden('Insufficient permissions')
      }
    },
  )
}

export default fp(requireRolePlugin, {
  name: 'require-role',
  dependencies: ['auth'],
})
