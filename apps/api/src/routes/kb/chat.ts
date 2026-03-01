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
    Body: { content: string; deep_dive?: boolean }
  }>(
    '/api/kb/clients/:clientId/conversations/:conversationId/messages',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { clientId, conversationId } = request.params
      const { content, deep_dive } = request.body

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

      // Build digest-based context from sources
      const sourceIds = conversation.source_ids as string[]
      let documentContext = ''

      if (sourceIds.length > 0) {
        const { data: sources } = await supabaseAdmin
          .from('client_sources')
          .select('file_name, file_path, digest_summary, digest_full_text, digest_status')
          .in('id', sourceIds)
          .is('deleted_at', null)

        const readySources = (sources ?? []).filter(
          (s: { digest_status: string }) => s.digest_status === 'ready',
        )

        if (readySources.length > 0) {
          const sections = readySources.map(
            (s: { file_name: string | null; file_path: string; digest_summary: string | null; digest_full_text: string | null }, i: number) => {
              const name = s.file_name || s.file_path.split('/').pop() || 'unknown'
              const digestText = deep_dive ? s.digest_full_text : s.digest_summary
              return `## Document ${i + 1}: ${name}\n\n${digestText || '(no content extracted)'}`
            },
          )
          documentContext = sections.join('\n\n---\n\n')
        }

        fastify.log.info(
          { sourceCount: readySources.length, deep_dive: !!deep_dive },
          'KB chat: using digest context',
        )
      }

      // Build conversation history for Gemini
      const historyMessages = (history || []).slice(0, -1).map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }))

      // Select system prompt based on mode
      const systemInstruction = deep_dive
        ? await getPrompt(
            'kb-chat-system-deep',
            'You are a knowledge base assistant. You have the full extracted text of the client documents. Answer questions thoroughly using all available detail. If you cannot find the answer in the documents, say so clearly.',
          )
        : await getPrompt(
            'kb-chat-system',
            'You are a knowledge base assistant. You have summaries of the client documents. Answer questions based on these summaries. If you need more detail than the summaries provide, suggest the user try "Deep dive" mode. If you cannot find the answer, say so clearly.',
          )

      // Build document context message
      const contextMessages = documentContext
        ? [{ role: 'user' as const, parts: [{ text: `Here are the client documents:\n\n${documentContext}` }] }]
        : []

      // Switch to SSE for streaming response
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })

      function writeSSE(event: string, data: unknown) {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      }

      let fullText = ''

      try {
        const stream = await gemini.models.generateContentStream({
          model: 'gemini-2.0-flash',
          config: { systemInstruction },
          contents: [
            ...contextMessages,
            ...historyMessages,
            { role: 'user', parts: [{ text: content }] },
          ],
        })

        for await (const chunk of stream) {
          const text = chunk.text ?? ''
          if (text) {
            fullText += text
            writeSSE('delta', { text })
          }
        }
      } catch (err: unknown) {
        fastify.log.warn({ err }, 'Gemini generateContentStream failed')
        const status = (err as { status?: number }).status
        const message = status === 429
          ? 'AI service is busy. Please wait a moment and try again.'
          : 'Failed to generate a response. Please try again.'
        writeSSE('error', { message })
        reply.raw.end()
        return reply
      }

      const assistantContent = fullText || 'I was unable to generate a response.'

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

      if (assistantMsgErr) {
        writeSSE('error', { message: 'Failed to save response' })
        reply.raw.end()
        return reply
      }

      writeSSE('done', { id: assistantMsg.id, content: assistantMsg.content, created_at: assistantMsg.created_at })
      reply.raw.end()
      return reply
    },
  )
}

export default kbChatRoutes
