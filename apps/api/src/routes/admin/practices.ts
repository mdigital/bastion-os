import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../../lib/supabase.js'

const practiceRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/practices
  fastify.get(
    '/api/admin/practices',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { data, error } = await supabaseAdmin
        .from('practices')
        .select('*')
        .eq('organisation_id', request.organisationId)
        .order('sort_order', { ascending: true })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // POST /api/admin/practices
  fastify.post<{
    Body: {
      name: string
      color?: string
      icon?: string
      description?: string
      sort_order?: number
    }
  }>(
    '/api/admin/practices',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { name, color, icon, description, sort_order } = request.body
      if (!name) return reply.badRequest('name is required')

      const { data, error } = await supabaseAdmin
        .from('practices')
        .insert({
          organisation_id: request.organisationId,
          name,
          color: color ?? null,
          icon: icon ?? null,
          description: description ?? null,
          sort_order: sort_order ?? 0,
        })
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return reply.code(201).send(data)
    },
  )

  // PATCH /api/admin/practices/:id
  fastify.patch<{
    Params: { id: string }
    Body: {
      name?: string
      color?: string
      icon?: string
      description?: string
      sort_order?: number
    }
  }>(
    '/api/admin/practices/:id',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params
      const { name, color, icon, description, sort_order } = request.body

      const update: Record<string, unknown> = {}
      if (name !== undefined) update.name = name
      if (color !== undefined) update.color = color
      if (icon !== undefined) update.icon = icon
      if (description !== undefined) update.description = description
      if (sort_order !== undefined) update.sort_order = sort_order

      const { data, error } = await supabaseAdmin
        .from('practices')
        .update(update)
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Practice not found')
      return data
    },
  )

  // DELETE /api/admin/practices/:id
  fastify.delete<{ Params: { id: string } }>(
    '/api/admin/practices/:id',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { error } = await supabaseAdmin
        .from('practices')
        .delete()
        .eq('id', request.params.id)
        .eq('organisation_id', request.organisationId)

      if (error) return reply.internalServerError(error.message)
      return reply.code(204).send()
    },
  )
}

export default practiceRoutes
