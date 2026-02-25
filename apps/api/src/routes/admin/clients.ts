import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../../lib/supabase.js'

const clientRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/clients
  fastify.get(
    '/api/admin/clients',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { data, error } = await supabaseAdmin
        .from('clients')
        .select('*, source_count:client_sources(count)')
        .eq('organisation_id', request.organisationId)
        .is('client_sources.deleted_at', null)
        .order('name', { ascending: true })

      if (error) return reply.internalServerError(error.message)

      // Flatten the count: [{count: N}] → N
      const clients = (data ?? []).map((c) => ({
        ...c,
        source_count: (c.source_count as unknown as { count: number }[])?.[0]?.count ?? 0,
      }))
      return clients
    },
  )

  // POST /api/admin/clients
  fastify.post<{
    Body: {
      name: string
      industry?: string
      description?: string
    }
  }>(
    '/api/admin/clients',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { name, industry, description } = request.body
      if (!name) return reply.badRequest('name is required')

      const { data, error } = await supabaseAdmin
        .from('clients')
        .insert({
          organisation_id: request.organisationId,
          name,
          industry: industry ?? null,
          description: description ?? null,
        })
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return reply.code(201).send(data)
    },
  )

  // PATCH /api/admin/clients/:id
  fastify.patch<{
    Params: { id: string }
    Body: {
      name?: string
      industry?: string
      description?: string
    }
  }>(
    '/api/admin/clients/:id',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params
      const { name, industry, description } = request.body

      const update: Record<string, unknown> = {}
      if (name !== undefined) update.name = name
      if (industry !== undefined) update.industry = industry
      if (description !== undefined) update.description = description

      const { data, error } = await supabaseAdmin
        .from('clients')
        .update(update)
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Client not found')
      return data
    },
  )

  // DELETE /api/admin/clients/:id
  fastify.delete<{ Params: { id: string } }>(
    '/api/admin/clients/:id',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { error } = await supabaseAdmin
        .from('clients')
        .delete()
        .eq('id', request.params.id)
        .eq('organisation_id', request.organisationId)

      if (error) return reply.internalServerError(error.message)
      return reply.code(204).send()
    },
  )
}

export default clientRoutes
