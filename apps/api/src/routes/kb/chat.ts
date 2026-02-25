import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../../lib/supabase.js'
import { gemini } from '../../lib/gemini.js'
import { getPrompt } from '../../lib/prompts.js'
import { prepareFiles, type SourceRow } from '../../lib/gemini-files.js'

const kbChatRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/kb/clients/:clientId/conversations
  fastify.get<{ Params: { clientId: string } }>(
    '/api/kb/clients/:clientId/conversations',
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
        .from('kb_conversations')
        .select('*')
        .eq('client_id', clientId)
        .order('updated_at', { ascending: false })

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // GET /api/kb/clients/:clientId/conversations/:conversationId
  fastify.get<{ Params: { clientId: string; conversationId: string } }>(
    '/api/kb/clients/:clientId/conversations/:conversationId',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { clientId, conversationId } = request.params

      // Verify client belongs to user's org
      const { data: client, error: clientErr } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (clientErr || !client) return reply.notFound('Client not found')

      // Fetch conversation
      const { data: conversation, error: convErr } = await supabaseAdmin
        .from('kb_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('client_id', clientId)
        .single()

      if (convErr || !conversation) return reply.notFound('Conversation not found')

      // Fetch messages
      const { data: messages, error: msgErr } = await supabaseAdmin
        .from('kb_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgErr) return reply.internalServerError(msgErr.message)

      return { ...conversation, messages }
    },
  )

  // POST /api/kb/clients/:clientId/conversations
  fastify.post<{
    Params: { clientId: string }
    Body: { title?: string; source_ids: string[] }
  }>(
    '/api/kb/clients/:clientId/conversations',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { clientId } = request.params
      const { title, source_ids } = request.body

      if (!source_ids || !Array.isArray(source_ids) || source_ids.length === 0) {
        return reply.badRequest('source_ids is required and must be a non-empty array')
      }

      // Verify client belongs to user's org
      const { data: client, error: clientErr } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (clientErr || !client) return reply.notFound('Client not found')

      const { data, error } = await supabaseAdmin
        .from('kb_conversations')
        .insert({
          client_id: clientId,
          created_by: request.userId,
          title: title ?? null,
          source_ids,
        })
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      return reply.code(201).send(data)
    },
  )

  // POST /api/kb/clients/:clientId/conversations/:conversationId/prepare-files
  // SSE endpoint — streams progress events as files are verified/re-uploaded
  fastify.post<{ Params: { clientId: string; conversationId: string } }>(
    '/api/kb/clients/:clientId/conversations/:conversationId/prepare-files',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { clientId, conversationId } = request.params

      // Verify client belongs to user's org
      const { data: client, error: clientErr } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (clientErr || !client) return reply.notFound('Client not found')

      // Fetch conversation
      const { data: conversation, error: convErr } = await supabaseAdmin
        .from('kb_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('client_id', clientId)
        .single()

      if (convErr || !conversation) return reply.notFound('Conversation not found')

      const sourceIds = conversation.source_ids as string[]

      // Set SSE headers
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })

      function writeSSE(event: string, data: unknown) {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      }

      if (sourceIds.length === 0) {
        writeSSE('ready', { fileCount: 0, refreshed: 0 })
        reply.raw.end()
        return reply
      }

      const { data: sources } = await supabaseAdmin
        .from('client_sources')
        .select('id, file_name, file_path, file_type, gemini_file_uri, gemini_file_name, gemini_file_uploaded_at')
        .in('id', sourceIds)
        .is('deleted_at', null)

      const sourceRows = (sources ?? []) as SourceRow[]

      if (sourceRows.length === 0) {
        writeSSE('ready', { fileCount: 0, refreshed: 0 })
        reply.raw.end()
        return reply
      }

      let refreshed = 0

      try {
        const parts = await prepareFiles(
          sourceRows,
          supabaseAdmin,
          gemini,
          fastify.log,
          (progress) => {
            if (progress.status === 'uploading') refreshed++
            writeSSE('progress', progress)
          },
        )

        writeSSE('ready', { fileCount: parts.length, refreshed })
      } catch (err) {
        fastify.log.error({ err }, 'prepare-files failed')
        writeSSE('error', { message: 'Failed to prepare files' })
      }

      reply.raw.end()
      return reply
    },
  )

  // POST /api/kb/clients/:clientId/conversations/:conversationId/messages
  fastify.post<{
    Params: { clientId: string; conversationId: string }
    Body: { content: string }
  }>(
    '/api/kb/clients/:clientId/conversations/:conversationId/messages',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { clientId, conversationId } = request.params
      const { content } = request.body

      if (!content) return reply.badRequest('content is required')

      // Verify client belongs to user's org
      const { data: client, error: clientErr } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (clientErr || !client) return reply.notFound('Client not found')

      // Fetch conversation
      const { data: conversation, error: convErr } = await supabaseAdmin
        .from('kb_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('client_id', clientId)
        .single()

      if (convErr || !conversation) return reply.notFound('Conversation not found')

      // Save user message
      const { error: userMsgErr } = await supabaseAdmin
        .from('kb_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content,
        })
        .select()
        .single()

      if (userMsgErr) return reply.internalServerError(userMsgErr.message)

      // Fetch prior messages for context
      const { data: history } = await supabaseAdmin
        .from('kb_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      // Build file parts from cached URIs (prepare-files should have been called first)
      const sourceIds = conversation.source_ids as string[]
      type CachedSource = { id: string; file_name: string | null; file_path: string; file_type: string | null; gemini_file_uri: string | null }

      let fileParts: Array<{ fileData: { fileUri: string; mimeType: string } }> = []
      let sourceNames: string[] = []

      if (sourceIds.length > 0) {
        const { data } = await supabaseAdmin
          .from('client_sources')
          .select('id, file_name, file_path, file_type, gemini_file_uri')
          .in('id', sourceIds)
          .is('deleted_at', null)

        const sources = (data ?? []) as CachedSource[]
        sourceNames = sources.map((s) => s.file_name || s.file_path.split('/').pop() || 'unknown')

        // Use only sources with cached URIs — no inline uploads
        fileParts = sources
          .filter((s) => s.gemini_file_uri)
          .map((s) => ({
            fileData: {
              fileUri: s.gemini_file_uri!,
              mimeType: s.file_type || 'application/octet-stream',
            },
          }))

        fastify.log.info({ fileCount: fileParts.length, sourceNames }, 'KB chat: using cached file parts')
      }

      // Build a dedicated file context message so Gemini treats files as grounding context
      function buildFileMessage(parts: typeof fileParts) {
        if (parts.length === 0) return []
        return [{
          role: 'user' as const,
          parts: [
            { text: `Reference documents:\n${sourceNames.map((n, i) => `${i + 1}. ${n}`).join('\n')}` },
            ...parts,
          ],
        }]
      }

      // Build conversation history for Gemini
      const historyMessages = (history || []).slice(0, -1).map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }))

      const systemInstruction = await getPrompt(
        'kb-chat-system',
        'You are a knowledge base assistant. Answer questions based on the provided documents. If you cannot find the answer in the documents, say so clearly.',
      )

      let response
      try {
        response = await gemini.models.generateContent({
          model: 'gemini-2.0-flash',
          config: { systemInstruction },
          contents: [
            ...buildFileMessage(fileParts),
            ...historyMessages,
            { role: 'user', parts: [{ text: content }] },
          ],
        })
      } catch (err) {
        // If Gemini rejects stale URIs, tell user to retry (files need re-preparation)
        fastify.log.warn({ err }, 'Gemini generateContent failed — files may need re-preparation')
        return reply.code(422).send({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Document files may have expired. Please reopen the conversation to refresh them.',
        })
      }

      const assistantContent = response.text ?? 'I was unable to generate a response.'

      // Save assistant message
      const { data: assistantMsg, error: assistantMsgErr } = await supabaseAdmin
        .from('kb_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent,
        })
        .select()
        .single()

      if (assistantMsgErr) return reply.internalServerError(assistantMsgErr.message)

      return reply.code(201).send(assistantMsg)
    },
  )
}

export default kbChatRoutes
