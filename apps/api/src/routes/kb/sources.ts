import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'
import { supabaseAdmin } from '../../lib/supabase.js'
import { generateDigest } from '../../lib/digest.js'

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

      // Insert metadata row (digest_status defaults to 'pending')
      const { data, error } = await supabaseAdmin
        .from('client_sources')
        .insert({
          client_id: clientId,
          file_name: file.filename,
          file_path: storagePath,
          file_type: file.mimetype,
          file_size: buffer.length,
          uploaded_by: request.userId,
        })
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)

      // Fire-and-forget: generate digest in background
      generateDigest(
        data.id,
        buffer,
        file.mimetype || 'application/octet-stream',
        file.filename,
        fastify.log,
      ).catch((err) => {
        fastify.log.error({ err, sourceId: data.id }, 'Background digest generation threw')
      })

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

  // POST /api/kb/clients/:clientId/sources/:sourceId/retry-digest
  fastify.post<{ Params: { clientId: string; sourceId: string } }>(
    '/api/kb/clients/:clientId/sources/:sourceId/retry-digest',
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

      // Fetch the source
      const { data: source, error: sourceErr } = await supabaseAdmin
        .from('client_sources')
        .select('id, file_name, file_path, file_type')
        .eq('id', sourceId)
        .eq('client_id', clientId)
        .is('deleted_at', null)
        .single()

      if (sourceErr || !source) return reply.notFound('Source not found')

      // Download file from Supabase Storage
      const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
        .from('client-documents')
        .download(source.file_path)

      if (downloadErr || !fileData) {
        return reply.internalServerError(`Failed to download file: ${downloadErr?.message}`)
      }

      const arrayBuffer = await fileData.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Fire-and-forget: re-generate digest
      generateDigest(
        source.id,
        buffer,
        source.file_type || 'application/octet-stream',
        source.file_name || 'unknown',
        fastify.log,
      ).catch((err) => {
        fastify.log.error({ err, sourceId: source.id }, 'Background digest retry threw')
      })

      return reply.code(202).send({ message: 'Digest generation restarted' })
    },
  )
}

export default kbSourceRoutes
