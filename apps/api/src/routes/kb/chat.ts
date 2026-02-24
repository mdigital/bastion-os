import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../../lib/supabase.js'
import { gemini } from '../../lib/gemini.js'
import { getPrompt } from '../../lib/prompts.js'

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

      // Build Gemini file parts, reusing cached URIs where possible
      const sourceIds = conversation.source_ids as string[]
      const GEMINI_TTL_MS = 47 * 60 * 60 * 1000 // 47 hours (Gemini files expire at 48h)

      type SourceRow = { id: string; file_name: string | null; file_path: string; file_type: string | null; gemini_file_uri: string | null; gemini_file_uploaded_at: string | null }

      async function buildFileParts(sources: SourceRow[], skipCache: boolean) {
        const parts: Array<{ fileData: { fileUri: string; mimeType: string } }> = []
        for (const source of sources) {
          const mimeType = source.file_type || 'application/octet-stream'

          // Check if cached URI is still valid
          if (!skipCache) {
            const isCacheValid =
              source.gemini_file_uri &&
              source.gemini_file_uploaded_at &&
              Date.now() - new Date(source.gemini_file_uploaded_at).getTime() < GEMINI_TTL_MS

            if (isCacheValid) {
              parts.push({ fileData: { fileUri: source.gemini_file_uri!, mimeType } })
              continue
            }
          }

          // Cache miss or forced refresh — download from Supabase and upload to Gemini
          try {
            const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
              .from('client-documents')
              .download(source.file_path)

            if (downloadErr || !fileData) continue

            const arrayBuffer = await fileData.arrayBuffer()
            const geminiFile = await gemini.files.upload({
              file: new Blob([arrayBuffer], { type: mimeType }),
              config: { mimeType },
            })

            if (geminiFile.uri) {
              parts.push({ fileData: { fileUri: geminiFile.uri, mimeType } })

              // Update cache in DB and local row
              source.gemini_file_uri = geminiFile.uri
              source.gemini_file_uploaded_at = new Date().toISOString()
              supabaseAdmin
                .from('client_sources')
                .update({
                  gemini_file_uri: geminiFile.uri,
                  gemini_file_uploaded_at: source.gemini_file_uploaded_at,
                })
                .eq('id', source.id)
                .then(({ error }) => {
                  if (error) fastify.log.warn({ error, sourceId: source.id }, 'Failed to cache Gemini file URI')
                })
            }
          } catch (err) {
            fastify.log.warn({ err, sourceId: source.id }, 'Failed to upload source to Gemini')
          }
        }
        return parts
      }

      let fileParts: Array<{ fileData: { fileUri: string; mimeType: string } }> = []
      let sources: SourceRow[] = []
      let usedCache = false

      if (sourceIds.length > 0) {
        const { data } = await supabaseAdmin
          .from('client_sources')
          .select('id, file_name, file_path, file_type, gemini_file_uri, gemini_file_uploaded_at')
          .in('id', sourceIds)
          .is('deleted_at', null)

        sources = (data ?? []) as SourceRow[]
        if (sources.length > 0) {
          usedCache = sources.some((s) => s.gemini_file_uri != null)
          fileParts = await buildFileParts(sources, false)
          const sourceNames = sources.map((s) => s.file_name || s.file_path.split('/').pop() || 'unknown')
          fastify.log.info({ fileCount: fileParts.length, sourceNames }, 'KB chat: built file parts for Gemini')
        }
      }

      // Build a dedicated file context message so Gemini treats files as grounding context
      function buildFileMessage(parts: typeof fileParts) {
        if (parts.length === 0) return []
        const names = sources.map((s) => s.file_name || s.file_path.split('/').pop() || 'unknown')
        return [{
          role: 'user' as const,
          parts: [
            { text: `Reference documents:\n${names.map((n, i) => `${i + 1}. ${n}`).join('\n')}` },
            ...parts,
          ],
        }]
      }

      // Build conversation history for Gemini
      const historyMessages = (history || []).slice(0, -1).map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }))

      // Call Gemini — retry once with fresh uploads if cached URIs cause a failure
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
        if (!usedCache) throw err
        // Cached URIs may be stale — re-upload all files and retry
        fastify.log.warn({ err }, 'Gemini generateContent failed with cached URIs, retrying with fresh uploads')
        fileParts = await buildFileParts(sources, true)
        response = await gemini.models.generateContent({
          model: 'gemini-2.0-flash',
          config: { systemInstruction },
          contents: [
            ...buildFileMessage(fileParts),
            ...historyMessages,
            { role: 'user', parts: [{ text: content }] },
          ],
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
