import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../../lib/supabase.js'

const sectionTemplateRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/section-templates — global + org-specific
  fastify.get(
    '/api/admin/section-templates',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { data, error } = await supabaseAdmin
        .from('section_templates')
        .select('*')
        .or(
          `organisation_id.is.null,organisation_id.eq.${request.organisationId}`,
        )
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // POST /api/admin/section-templates — create org-specific
  fastify.post<{
    Body: {
      id: string
      name: string
      description?: string
      category?: string
      ai_evaluation_criteria?: string
    }
  }>(
    '/api/admin/section-templates',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id, name, description, category, ai_evaluation_criteria } =
        request.body
      if (!id || !name) return reply.badRequest('id and name are required')

      const { data, error } = await supabaseAdmin
        .from('section_templates')
        .insert({
          id,
          organisation_id: request.organisationId,
          name,
          description: description ?? null,
          category: category ?? null,
          ai_evaluation_criteria: ai_evaluation_criteria ?? null,
        })
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return reply.code(201).send(data)
    },
  )

  // PATCH /api/admin/section-templates/:id
  fastify.patch<{
    Params: { id: string }
    Body: {
      name?: string
      description?: string
      category?: string
      ai_evaluation_criteria?: string
    }
  }>(
    '/api/admin/section-templates/:id',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params
      const { name, description, category, ai_evaluation_criteria } =
        request.body

      const update: Record<string, unknown> = {}
      if (name !== undefined) update.name = name
      if (description !== undefined) update.description = description
      if (category !== undefined) update.category = category
      if (ai_evaluation_criteria !== undefined)
        update.ai_evaluation_criteria = ai_evaluation_criteria

      // Only allow editing org-specific templates
      const { data, error } = await supabaseAdmin
        .from('section_templates')
        .update(update)
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Template not found or is a global template')
      return data
    },
  )

  // DELETE /api/admin/section-templates/:id
  fastify.delete<{ Params: { id: string } }>(
    '/api/admin/section-templates/:id',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      // Only allow deleting org-specific templates
      const { error } = await supabaseAdmin
        .from('section_templates')
        .delete()
        .eq('id', request.params.id)
        .eq('organisation_id', request.organisationId)

      if (error) return reply.internalServerError(error.message)
      return reply.code(204).send()
    },
  )
}

export default sectionTemplateRoutes
