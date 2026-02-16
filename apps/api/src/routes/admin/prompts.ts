import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../../lib/supabase.js'

const promptRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/prompts — list all prompts
  fastify.get(
    '/api/admin/prompts',
    { config: { requiredRoles: ['admin'] } },
    async (_request, reply) => {
      const { data, error } = await supabaseAdmin
        .from('prompts')
        .select('*')
        .order('category', { ascending: true })
        .order('display_name', { ascending: true })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // PATCH /api/admin/prompts/:id — update prompt
  fastify.patch<{
    Params: { id: string }
    Body: {
      content?: string
      display_name?: string
      category?: string
    }
  }>(
    '/api/admin/prompts/:id',
    { config: { requiredRoles: ['admin'] } },
    async (request, reply) => {
      const { id } = request.params
      const { content, display_name, category } = request.body

      const update: Record<string, unknown> = {}
      if (content !== undefined) update.content = content
      if (display_name !== undefined) update.display_name = display_name
      if (category !== undefined) update.category = category

      if (Object.keys(update).length === 0) {
        return reply.badRequest('No fields to update')
      }

      const { data, error } = await supabaseAdmin
        .from('prompts')
        .update(update)
        .eq('id', id)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Prompt not found')
      return data
    },
  )
}

export default promptRoutes
