import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'
import { supabaseAdmin } from '../lib/supabase.js'
import { gemini } from '../lib/gemini.js'

const briefRoutes: FastifyPluginAsync = async (fastify) => {
  // ─── Brief CRUD ──────────────────────────────────────────────────────────

  // GET /api/briefs?client_id=&status=
  fastify.get<{ Querystring: { client_id?: string; status?: string } }>(
    '/api/briefs',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      let query = supabaseAdmin
        .from('briefs')
        .select('*')
        .eq('organisation_id', request.organisationId)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (request.query.client_id) {
        query = query.eq('client_id', request.query.client_id)
      }
      if (request.query.status) {
        query = query.eq('status', request.query.status)
      }

      const { data, error } = await query
      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // GET /api/briefs/:briefId
  fastify.get<{ Params: { briefId: string } }>(
    '/api/briefs/:briefId',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { briefId } = request.params

      const { data: brief, error: briefErr } = await supabaseAdmin
        .from('briefs')
        .select('*')
        .eq('id', briefId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (briefErr || !brief) return reply.notFound('Brief not found')

      // Fetch sections and files in parallel
      const [sectionsRes, filesRes] = await Promise.all([
        supabaseAdmin
          .from('brief_sections')
          .select('*')
          .eq('brief_id', briefId)
          .order('sort_order', { ascending: true }),
        supabaseAdmin
          .from('brief_files')
          .select('*')
          .eq('brief_id', briefId)
          .order('created_at', { ascending: false }),
      ])

      return {
        ...brief,
        sections: sectionsRes.data ?? [],
        files: filesRes.data ?? [],
      }
    },
  )

  // POST /api/briefs
  fastify.post<{
    Body: {
      client_id?: string
      job_to_be_done?: string
      budget?: string
      due_date?: string
      live_date?: string
      campaign_duration?: string
      brief_level?: 'new_project' | 'fast_forward'
      lead_practice_id?: string
      supporting_practice_ids?: string[]
    }
  }>(
    '/api/briefs',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const {
        client_id,
        job_to_be_done,
        budget,
        due_date,
        live_date,
        campaign_duration,
        brief_level,
        lead_practice_id,
        supporting_practice_ids,
      } = request.body

      const { data, error } = await supabaseAdmin
        .from('briefs')
        .insert({
          organisation_id: request.organisationId,
          created_by: request.userId,
          client_id: client_id ?? null,
          job_to_be_done: job_to_be_done ?? null,
          budget: budget ?? null,
          due_date: due_date ?? null,
          live_date: live_date ?? null,
          campaign_duration: campaign_duration ?? null,
          brief_level: brief_level ?? 'new_project',
          lead_practice_id: lead_practice_id ?? null,
          supporting_practice_ids: supporting_practice_ids ?? [],
          status: 'draft',
        })
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return reply.code(201).send(data)
    },
  )

  // PATCH /api/briefs/:briefId
  fastify.patch<{
    Params: { briefId: string }
    Body: {
      client_id?: string
      job_to_be_done?: string
      budget?: string
      due_date?: string
      live_date?: string
      campaign_duration?: string
      brief_level?: 'new_project' | 'fast_forward'
      lead_practice_id?: string
      supporting_practice_ids?: string[]
      status?: 'draft' | 'finalized' | 'archived'
    }
  }>(
    '/api/briefs/:briefId',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { briefId } = request.params
      const update: Record<string, unknown> = {}
      const fields = [
        'client_id',
        'job_to_be_done',
        'budget',
        'due_date',
        'live_date',
        'campaign_duration',
        'brief_level',
        'lead_practice_id',
        'supporting_practice_ids',
        'status',
      ] as const

      for (const field of fields) {
        if (request.body[field] !== undefined) {
          update[field] = request.body[field]
        }
      }

      const { data, error } = await supabaseAdmin
        .from('briefs')
        .update(update)
        .eq('id', briefId)
        .eq('organisation_id', request.organisationId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Brief not found')
      return data
    },
  )

  // DELETE /api/briefs/:briefId (soft delete — archive)
  fastify.delete<{ Params: { briefId: string } }>(
    '/api/briefs/:briefId',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { data, error } = await supabaseAdmin
        .from('briefs')
        .update({ archived: true })
        .eq('id', request.params.briefId)
        .eq('organisation_id', request.organisationId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Brief not found')
      return reply.code(204).send()
    },
  )

  // ─── Brief Sections ──────────────────────────────────────────────────────

  // POST /api/briefs/:briefId/sections
  fastify.post<{
    Params: { briefId: string }
    Body: {
      section_template_id?: string
      title: string
      content?: string
      sort_order?: number
    }
  }>(
    '/api/briefs/:briefId/sections',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { briefId } = request.params

      // Verify brief belongs to org
      const { data: brief } = await supabaseAdmin
        .from('briefs')
        .select('id')
        .eq('id', briefId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (!brief) return reply.notFound('Brief not found')

      const { title, section_template_id, content, sort_order } = request.body
      if (!title) return reply.badRequest('title is required')

      const { data, error } = await supabaseAdmin
        .from('brief_sections')
        .insert({
          brief_id: briefId,
          section_template_id: section_template_id ?? null,
          title,
          content: content ?? null,
          sort_order: sort_order ?? 0,
        })
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return reply.code(201).send(data)
    },
  )

  // PATCH /api/briefs/:briefId/sections/:sectionId
  fastify.patch<{
    Params: { briefId: string; sectionId: string }
    Body: {
      title?: string
      content?: string
      missing_info?: unknown
      enhancements?: unknown
      questions?: unknown
      sort_order?: number
    }
  }>(
    '/api/briefs/:briefId/sections/:sectionId',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { briefId, sectionId } = request.params

      // Verify brief belongs to org
      const { data: brief } = await supabaseAdmin
        .from('briefs')
        .select('id')
        .eq('id', briefId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (!brief) return reply.notFound('Brief not found')

      const update: Record<string, unknown> = {}
      const fields = ['title', 'content', 'missing_info', 'enhancements', 'questions', 'sort_order'] as const
      for (const field of fields) {
        if (request.body[field] !== undefined) {
          update[field] = request.body[field]
        }
      }

      const { data, error } = await supabaseAdmin
        .from('brief_sections')
        .update(update)
        .eq('id', sectionId)
        .eq('brief_id', briefId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Section not found')
      return data
    },
  )

  // DELETE /api/briefs/:briefId/sections/:sectionId
  fastify.delete<{ Params: { briefId: string; sectionId: string } }>(
    '/api/briefs/:briefId/sections/:sectionId',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { briefId, sectionId } = request.params

      // Verify brief belongs to org
      const { data: brief } = await supabaseAdmin
        .from('briefs')
        .select('id')
        .eq('id', briefId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (!brief) return reply.notFound('Brief not found')

      const { error } = await supabaseAdmin
        .from('brief_sections')
        .delete()
        .eq('id', sectionId)
        .eq('brief_id', briefId)

      if (error) return reply.internalServerError(error.message)
      return reply.code(204).send()
    },
  )

  // ─── Brief Files ─────────────────────────────────────────────────────────

  // GET /api/briefs/:briefId/files
  fastify.get<{ Params: { briefId: string } }>(
    '/api/briefs/:briefId/files',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { briefId } = request.params

      // Verify brief belongs to org
      const { data: brief } = await supabaseAdmin
        .from('briefs')
        .select('id')
        .eq('id', briefId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (!brief) return reply.notFound('Brief not found')

      const { data, error } = await supabaseAdmin
        .from('brief_files')
        .select('*')
        .eq('brief_id', briefId)
        .order('created_at', { ascending: false })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // POST /api/briefs/:briefId/files (multipart upload)
  fastify.post<{ Params: { briefId: string } }>(
    '/api/briefs/:briefId/files',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { briefId } = request.params

      // Verify brief belongs to org
      const { data: brief } = await supabaseAdmin
        .from('briefs')
        .select('id')
        .eq('id', briefId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (!brief) return reply.notFound('Brief not found')

      const file = await request.file()
      if (!file) return reply.badRequest('File is required')

      const buffer = await file.toBuffer()
      const fileId = randomUUID()
      const storagePath = `${request.organisationId}/briefs/${briefId}/${fileId}_${file.filename}`

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabaseAdmin.storage
        .from('brief-documents')
        .upload(storagePath, buffer, {
          contentType: file.mimetype,
        })

      if (uploadErr) return reply.internalServerError(uploadErr.message)

      // Upload to Gemini Files API for later expansion
      let geminiFileUri: string | null = null
      try {
        const geminiFile = await gemini.files.upload({
          file: new Blob([buffer], { type: file.mimetype || 'application/octet-stream' }),
          config: { mimeType: file.mimetype || 'application/octet-stream' },
        })
        geminiFileUri = geminiFile.uri ?? null
      } catch (err) {
        // Non-fatal: we can re-upload at expansion time
        fastify.log.warn({ err }, 'Gemini file upload failed, will retry at expansion time')
      }

      // Insert metadata row
      const { data, error } = await supabaseAdmin
        .from('brief_files')
        .insert({
          brief_id: briefId,
          file_name: file.filename,
          file_path: storagePath,
          file_type: file.mimetype,
          file_size: buffer.length,
          gemini_file_uri: geminiFileUri,
          uploaded_by: request.userId,
        })
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return reply.code(201).send(data)
    },
  )

  // DELETE /api/briefs/:briefId/files/:fileId
  fastify.delete<{ Params: { briefId: string; fileId: string } }>(
    '/api/briefs/:briefId/files/:fileId',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { briefId, fileId } = request.params

      // Verify brief belongs to org
      const { data: brief } = await supabaseAdmin
        .from('briefs')
        .select('id')
        .eq('id', briefId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (!brief) return reply.notFound('Brief not found')

      // Get file path for storage cleanup
      const { data: fileRow } = await supabaseAdmin
        .from('brief_files')
        .select('file_path')
        .eq('id', fileId)
        .eq('brief_id', briefId)
        .single()

      if (!fileRow) return reply.notFound('File not found')

      // Delete from storage
      await supabaseAdmin.storage.from('brief-documents').remove([fileRow.file_path])

      // Delete metadata row
      const { error } = await supabaseAdmin
        .from('brief_files')
        .delete()
        .eq('id', fileId)
        .eq('brief_id', briefId)

      if (error) return reply.internalServerError(error.message)
      return reply.code(204).send()
    },
  )
}

export default briefRoutes
