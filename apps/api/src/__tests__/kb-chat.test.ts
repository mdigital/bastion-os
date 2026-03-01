import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { FastifyInstance } from 'fastify'

const sbMock = vi.hoisted(() => {
  const chain: Record<string, unknown> = {
    _data: null,
    _error: null,
    _results: [] as Array<{ data: unknown; error: unknown }>,
  }
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'is', 'in', 'or', 'order', 'single']) {
    chain[m] = vi.fn(() => chain)
  }
  chain.then = function (resolve: (v: unknown) => void) {
    const results = chain._results as Array<{ data: unknown; error: unknown }>
    const result = results.length > 0 ? results.shift()! : { data: chain._data, error: chain._error }
    resolve(result)
  }

  const download = vi.fn().mockResolvedValue({ data: new Blob(['file-content']), error: null })
  const storage = { from: vi.fn(() => ({ download })) }

  return {
    from: vi.fn(() => chain),
    auth: { admin: { inviteUserByEmail: vi.fn() } },
    storage,
    chain,
    _download: download,
  }
})

const geminiMock = vi.hoisted(() => {
  // generateContentStream returns an async iterable
  const generateContentStream = vi.fn().mockResolvedValue({
    async *[Symbol.asyncIterator]() {
      yield { text: 'AI response here' }
    },
  })
  return {
    models: { generateContentStream },
    files: { upload: vi.fn(), get: vi.fn(), delete: vi.fn() },
    _generateContentStream: generateContentStream,
  }
})

vi.mock('../lib/supabase.js', () => ({ supabaseAdmin: sbMock }))
vi.mock('../lib/gemini.js', () => ({ gemini: geminiMock }))

import { buildTestApp } from './helpers.js'

let app: FastifyInstance

async function registerRoutes(a: FastifyInstance) {
  const { default: routes } = await import('../routes/kb/chat.js')
  await a.register(routes)
}

function resetMock() {
  sbMock.from.mockClear()
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'is', 'in', 'or', 'order', 'single']) {
    (sbMock.chain as Record<string, ReturnType<typeof vi.fn>>)[m]!.mockClear()
  }
  sbMock.chain._data = null
  sbMock.chain._error = null
  sbMock.chain._results = []
  sbMock._download.mockClear()
  sbMock._download.mockResolvedValue({ data: new Blob(['file-content']), error: null })
  sbMock.storage.from.mockClear()
  geminiMock._generateContentStream.mockClear()
  geminiMock._generateContentStream.mockResolvedValue({
    async *[Symbol.asyncIterator]() {
      yield { text: 'AI response here' }
    },
  })
}

beforeEach(() => resetMock())
afterEach(async () => { await app?.close() })

// ─── GET /api/kb/clients/:clientId/conversations ────────────────────────────

describe('GET /api/kb/clients/:clientId/conversations', () => {
  it('lists conversations for a client', async () => {
    const conversations = [
      { id: 'conv1', client_id: 'c1', title: 'Chat 1' },
      { id: 'conv2', client_id: 'c1', title: 'Chat 2' },
    ]
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      { data: conversations, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/kb/clients/c1/conversations' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(conversations)
  })

  it('allows user role', async () => {
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      { data: [], error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({ method: 'GET', url: '/api/kb/clients/c1/conversations' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 404 if client not found', async () => {
    sbMock.chain._results = [
      { data: null, error: { message: 'not found' } },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/kb/clients/bad-id/conversations' })
    expect(res.statusCode).toBe(404)
  })
})

// ─── GET /api/kb/clients/:clientId/conversations/:conversationId ────────────

describe('GET /api/kb/clients/:clientId/conversations/:conversationId', () => {
  it('returns conversation with messages', async () => {
    const conversation = { id: 'conv1', client_id: 'c1', title: 'Chat', source_ids: ['s1'] }
    const messages = [
      { id: 'm1', role: 'user', content: 'Hello' },
      { id: 'm2', role: 'assistant', content: 'Hi!' },
    ]
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      { data: conversation, error: null },
      { data: messages, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/kb/clients/c1/conversations/conv1' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ ...conversation, messages })
  })

  it('returns 404 if conversation not found', async () => {
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      { data: null, error: { message: 'not found' } },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/kb/clients/c1/conversations/bad-id' })
    expect(res.statusCode).toBe(404)
  })
})

// ─── POST /api/kb/clients/:clientId/conversations ───────────────────────────

describe('POST /api/kb/clients/:clientId/conversations', () => {
  it('creates a conversation and returns 201', async () => {
    const created = { id: 'conv3', client_id: 'c1', title: 'New Chat', source_ids: ['s1', 's2'] }
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      { data: created, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/c1/conversations',
      payload: { title: 'New Chat', source_ids: ['s1', 's2'] },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json()).toEqual(created)
    expect(sbMock.chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: 'c1', title: 'New Chat', source_ids: ['s1', 's2'] }),
    )
  })

  it('returns 400 if source_ids is missing', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/c1/conversations',
      payload: { title: 'No sources' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 if source_ids is empty', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/c1/conversations',
      payload: { title: 'Empty', source_ids: [] },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 if client not found', async () => {
    sbMock.chain._results = [
      { data: null, error: { message: 'not found' } },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/bad-id/conversations',
      payload: { source_ids: ['s1'] },
    })
    expect(res.statusCode).toBe(404)
  })
})

// ─── POST .../messages (SSE streaming) ──────────────────────────────────────

describe('POST /api/kb/clients/:clientId/conversations/:conversationId/messages', () => {
  it('returns 400 if content is missing', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/c1/conversations/conv1/messages',
      payload: {},
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 if client not found', async () => {
    sbMock.chain._results = [
      { data: null, error: { message: 'not found' } },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/bad-id/conversations/conv1/messages',
      payload: { content: 'hello' },
    })
    expect(res.statusCode).toBe(404)
  })

  it('returns 404 if conversation not found', async () => {
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      { data: null, error: { message: 'not found' } },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/c1/conversations/bad-id/messages',
      payload: { content: 'hello' },
    })
    expect(res.statusCode).toBe(404)
  })

  it('streams a response using digest context', async () => {
    const userMsg = { id: 'm1', conversation_id: 'conv1', role: 'user', content: 'What is X?' }
    const assistantMsg = { id: 'm2', conversation_id: 'conv1', role: 'assistant', content: 'AI response here' }

    sbMock.chain._results = [
      // 1. client lookup
      { data: { id: 'c1' }, error: null },
      // 2. conversation lookup
      { data: { id: 'conv1', client_id: 'c1', source_ids: ['s1'] }, error: null },
      // 3. insert user message
      { data: userMsg, error: null },
      // 4. fetch history
      { data: [{ role: 'user', content: 'What is X?' }], error: null },
      // 5. fetch source digests
      { data: [{ file_name: 'doc.pdf', file_path: 'org-1/c1/doc.pdf', digest_summary: 'A summary', digest_full_text: 'Full text', digest_status: 'ready' }], error: null },
      // 6. getPrompt (prompts table lookup — falls back to default)
      { data: null, error: null },
      // 7. insert assistant message
      { data: assistantMsg, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/c1/conversations/conv1/messages',
      payload: { content: 'What is X?' },
    })

    // SSE endpoint returns 200 with text/event-stream
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toBe('text/event-stream')
    expect(res.payload).toContain('event: delta')
    expect(res.payload).toContain('event: done')
    expect(geminiMock._generateContentStream).toHaveBeenCalledTimes(1)
  })

  it('works with no source files (empty source_ids)', async () => {
    const userMsg = { id: 'm1', conversation_id: 'conv1', role: 'user', content: 'Hello' }
    const assistantMsg = { id: 'm2', conversation_id: 'conv1', role: 'assistant', content: 'AI response here' }

    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      { data: { id: 'conv1', client_id: 'c1', source_ids: [] }, error: null },
      { data: userMsg, error: null },
      { data: [{ role: 'user', content: 'Hello' }], error: null },
      // getPrompt
      { data: null, error: null },
      { data: assistantMsg, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/c1/conversations/conv1/messages',
      payload: { content: 'Hello' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.payload).toContain('event: done')
    expect(geminiMock._generateContentStream).toHaveBeenCalledTimes(1)
  })
})
