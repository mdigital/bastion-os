import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'
import { supabaseAdmin } from '../../lib/supabase.js'
import { analyzeBrief } from '../../lib/brief-analyzer.js'

const briefRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/briefs — create brief + upload file + fire-and-forget analysis
  fastify.post(
    '/api/briefs',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      // Parse multipart file
      const file = await request.file()
      if (!file) return reply.badRequest('File is required')

      const buffer = await file.toBuffer()
      const fileId = randomUUID()
      const storagePath = `${request.organisationId}/${fileId}_${file.filename}`

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabaseAdmin.storage
        .from('brief-documents')
        .upload(storagePath, buffer, {
          contentType: file.mimetype,
        })

      if (uploadErr) return reply.internalServerError(uploadErr.message)

      // Create brief row
      const { data: brief, error: briefErr } = await supabaseAdmin
        .from('briefs')
        .insert({
          organisation_id: request.organisationId,
          created_by: request.userId,
          analysis_status: 'pending',
        })
        .select()
        .single()

      if (briefErr || !brief) {
        return reply.internalServerError(briefErr?.message ?? 'Failed to create brief')
      }

      // Insert brief_files row
      const { error: fileErr } = await supabaseAdmin
        .from('brief_files')
        .insert({
          brief_id: brief.id,
          file_name: file.filename,
          file_path: storagePath,
          file_type: file.mimetype,
          file_size: buffer.length,
          uploaded_by: request.userId,
        })

      if (fileErr) {
        fastify.log.error({ fileErr, briefId: brief.id }, 'Failed to insert brief_files row')
      }

      // Fire-and-forget analysis
      analyzeBrief(
        brief.id,
        buffer,
        file.mimetype || 'application/octet-stream',
        file.filename,
        request.organisationId,
        fastify.log,
      ).catch((err) => {
        fastify.log.error({ err, briefId: brief.id }, 'Background brief analysis threw')
      })

      return reply.code(201).send(brief)
    },
  )

  // GET /api/briefs — list briefs for org
  fastify.get(
    '/api/briefs',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { data, error } = await supabaseAdmin
        .from('briefs')
        .select('*, brief_files(*)')
        .eq('organisation_id', request.organisationId)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // GET /api/briefs/:id — fetch brief + sections + files (polling endpoint)
  fastify.get<{ Params: { id: string } }>(
    '/api/briefs/:id',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params

      const { data: brief, error } = await supabaseAdmin
        .from('briefs')
        .select('*, brief_files(*), brief_sections(*)')
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .single()

      if (error || !brief) return reply.notFound('Brief not found')

      // Sort sections by sort_order
      if (brief.brief_sections) {
        brief.brief_sections.sort(
          (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
        )
      }

      return brief
    },
  )

  // PATCH /api/briefs/:id — update brief fields
  fastify.patch<{
    Params: { id: string }
    Body: {
      job_to_be_done?: string
      budget?: string
      due_date?: string | null
      live_date?: string | null
      campaign_duration?: string
      brief_level?: 'new_project' | 'fast_forward'
      lead_practice_id?: string | null
      supporting_practice_ids?: string[]
    }
  }>(
    '/api/briefs/:id',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params
      const updates = request.body

      const { data, error } = await supabaseAdmin
        .from('briefs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Brief not found')

      return data
    },
  )

  // PATCH /api/briefs/:id/sections/:sectionId — update section content
  fastify.patch<{
    Params: { id: string; sectionId: string }
    Body: { title?: string; content?: string }
  }>(
    '/api/briefs/:id/sections/:sectionId',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id, sectionId } = request.params

      // Verify brief belongs to org
      const { data: brief, error: briefErr } = await supabaseAdmin
        .from('briefs')
        .select('id')
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .single()

      if (briefErr || !brief) return reply.notFound('Brief not found')

      const updates = request.body

      const { data, error } = await supabaseAdmin
        .from('brief_sections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sectionId)
        .eq('brief_id', id)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Section not found')

      return data
    },
  )

  // POST /api/briefs/:id/retry — retry failed analysis
  fastify.post<{ Params: { id: string } }>(
    '/api/briefs/:id/retry',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params

      // Fetch the brief + its file
      const { data: brief, error: briefErr } = await supabaseAdmin
        .from('briefs')
        .select('id, organisation_id, brief_files(file_name, file_path, file_type)')
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .single()

      if (briefErr || !brief) return reply.notFound('Brief not found')

      const briefFile = (brief.brief_files as Array<{
        file_name: string
        file_path: string
        file_type: string | null
      }>)?.[0]

      if (!briefFile) return reply.badRequest('No file associated with this brief')

      // Download file from storage
      const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
        .from('brief-documents')
        .download(briefFile.file_path)

      if (downloadErr || !fileData) {
        return reply.internalServerError(`Failed to download file: ${downloadErr?.message}`)
      }

      const arrayBuffer = await fileData.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Fire-and-forget re-analysis
      analyzeBrief(
        brief.id,
        buffer,
        briefFile.file_type || 'application/octet-stream',
        briefFile.file_name || 'unknown',
        request.organisationId,
        fastify.log,
      ).catch((err) => {
        fastify.log.error({ err, briefId: brief.id }, 'Background brief analysis retry threw')
      })

      return reply.code(202).send({ message: 'Brief analysis restarted' })
    },
  )
}

export default briefRoutes
