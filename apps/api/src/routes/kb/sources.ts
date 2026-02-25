import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'
import { supabaseAdmin } from '../../lib/supabase.js'
import { gemini } from '../../lib/gemini.js'

const kbSourceRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/kb/clients/:clientId/sources
  fastify.get<{ Params: { clientId: string } }>(
    '/api/kb/clients/:clientId/sources',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { clientId } = request.params

      // Verify client belongs to user's org
      const { data: client, error: clientErr } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (clientErr || !client) return reply.notFound('Client not found')

      const { data, error } = await supabaseAdmin
        .from('client_sources')
        .select('*')
        .eq('client_id', clientId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // POST /api/kb/clients/:clientId/sources
  fastify.post<{ Params: { clientId: string } }>(
    '/api/kb/clients/:clientId/sources',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { clientId } = request.params

      // Verify client belongs to user's org
      const { data: client, error: clientErr } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (clientErr || !client) return reply.notFound('Client not found')

      // Parse multipart file
      const file = await request.file()
      if (!file) return reply.badRequest('File is required')

      const buffer = await file.toBuffer()
      const fileId = randomUUID()
      const storagePath = `${request.organisationId}/${clientId}/${fileId}_${file.filename}`

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabaseAdmin.storage
        .from('client-documents')
        .upload(storagePath, buffer, {
          contentType: file.mimetype,
        })

      if (uploadErr) return reply.internalServerError(uploadErr.message)

      // Upload to Gemini Files API (non-fatal — will be retried on first chat use)
      let geminiFileUri: string | null = null
      let geminiFileUploadedAt: string | null = null
      try {
        const geminiFile = await gemini.files.upload({
          file: new Blob([buffer], { type: file.mimetype || 'application/octet-stream' }),
          config: { mimeType: file.mimetype || 'application/octet-stream' },
        })
        if (geminiFile.uri) {
          geminiFileUri = geminiFile.uri
          geminiFileUploadedAt = new Date().toISOString()
        }
      } catch (err) {
        fastify.log.warn({ err }, 'Gemini file upload failed at source creation — will retry on first chat use')
      }

      // Insert metadata row
      const { data, error } = await supabaseAdmin
        .from('client_sources')
        .insert({
          client_id: clientId,
          file_name: file.filename,
          file_path: storagePath,
          file_type: file.mimetype,
          file_size: buffer.length,
          uploaded_by: request.userId,
          gemini_file_uri: geminiFileUri,
          gemini_file_uploaded_at: geminiFileUploadedAt,
        })
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return reply.code(201).send(data)
    },
  )

  // DELETE /api/kb/clients/:clientId/sources/:sourceId
  fastify.delete<{ Params: { clientId: string; sourceId: string } }>(
    '/api/kb/clients/:clientId/sources/:sourceId',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { clientId, sourceId } = request.params

      // Verify client belongs to user's org
      const { data: client, error: clientErr } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (clientErr || !client) return reply.notFound('Client not found')

      // Soft-delete by setting deleted_at
      const { data, error } = await supabaseAdmin
        .from('client_sources')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sourceId)
        .eq('client_id', clientId)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Source not found')
      return reply.code(204).send()
    },
  )
}

export default kbSourceRoutes
