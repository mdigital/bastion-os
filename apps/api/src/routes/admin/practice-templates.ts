import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../../lib/supabase.js'

const practiceTemplateRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/practice-templates?practice_id=X
  fastify.get<{ Querystring: { practice_id?: string } }>(
    '/api/admin/practice-templates',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      let query = supabaseAdmin
        .from('practice_templates')
        .select('*, practices!inner(organisation_id)')
        .eq('practices.organisation_id', request.organisationId)

      if (request.query.practice_id) {
        query = query.eq('practice_id', request.query.practice_id)
      }

      const { data, error } = await query.order('brief_level', {
        ascending: true,
      })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // POST /api/admin/practice-templates
  fastify.post<{
    Body: {
      practice_id: string
      brief_level: 'new_project' | 'fast_forward'
      sections: Array<{ section_template_id: string; required: boolean }>
    }
  }>(
    '/api/admin/practice-templates',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { practice_id, brief_level, sections } = request.body
      if (!practice_id || !brief_level)
        return reply.badRequest('practice_id and brief_level are required')

      // Verify practice belongs to user's org
      const { data: practice } = await supabaseAdmin
        .from('practices')
        .select('id')
        .eq('id', practice_id)
        .eq('organisation_id', request.organisationId)
        .single()

      if (!practice)
        return reply.notFound('Practice not found in this organisation')

      const { data, error } = await supabaseAdmin
        .from('practice_templates')
        .insert({
          practice_id,
          brief_level,
          sections: sections ?? [],
        })
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return reply.code(201).send(data)
    },
  )

  // PATCH /api/admin/practice-templates/:id
  fastify.patch<{
    Params: { id: string }
    Body: {
      brief_level?: 'new_project' | 'fast_forward'
      sections?: Array<{ section_template_id: string; required: boolean }>
    }
  }>(
    '/api/admin/practice-templates/:id',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params
      const { brief_level, sections } = request.body

      const update: Record<string, unknown> = {}
      if (brief_level !== undefined) update.brief_level = brief_level
      if (sections !== undefined) update.sections = sections

      // Verify ownership via practice → org join
      const { data: existing } = await supabaseAdmin
        .from('practice_templates')
        .select('*, practices!inner(organisation_id)')
        .eq('id', id)
        .eq('practices.organisation_id', request.organisationId)
        .single()

      if (!existing)
        return reply.notFound('Practice template not found')

      const { data, error } = await supabaseAdmin
        .from('practice_templates')
        .update(update)
        .eq('id', id)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // DELETE /api/admin/practice-templates/:id
  fastify.delete<{ Params: { id: string } }>(
    '/api/admin/practice-templates/:id',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      // Verify ownership
      const { data: existing } = await supabaseAdmin
        .from('practice_templates')
        .select('*, practices!inner(organisation_id)')
        .eq('id', request.params.id)
        .eq('practices.organisation_id', request.organisationId)
        .single()

      if (!existing)
        return reply.notFound('Practice template not found')

      const { error } = await supabaseAdmin
        .from('practice_templates')
        .delete()
        .eq('id', request.params.id)

      if (error) return reply.internalServerError(error.message)
      return reply.code(204).send()
    },
  )
}

export default practiceTemplateRoutes
