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

  const upload = vi.fn().mockResolvedValue({ error: null })
  const storage = { from: vi.fn(() => ({ upload })) }

  return {
    from: vi.fn(() => chain),
    auth: { admin: { inviteUserByEmail: vi.fn() } },
    storage,
    chain,
    _upload: upload,
  }
})

const geminiMock = vi.hoisted(() => {
  const upload = vi.fn().mockResolvedValue({ uri: 'https://genai.example.com/files/abc', name: 'files/abc', mimeType: 'application/pdf' })
  const get = vi.fn().mockResolvedValue({ state: 'ACTIVE' })
  const del = vi.fn().mockResolvedValue({})
  return {
    models: { generateContent: vi.fn() },
    files: { upload, get, delete: del },
    _upload: upload,
    _get: get,
    _delete: del,
  }
})

vi.mock('../lib/supabase.js', () => ({ supabaseAdmin: sbMock }))
vi.mock('../lib/gemini.js', () => ({ gemini: geminiMock }))

import { buildTestApp } from './helpers.js'
import multipart from '@fastify/multipart'

let app: FastifyInstance

async function registerRoutes(a: FastifyInstance) {
  await a.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } })
  const { default: routes } = await import('../routes/kb/sources.js')
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
  sbMock._upload.mockClear()
  sbMock._upload.mockResolvedValue({ error: null })
  sbMock.storage.from.mockClear()
  geminiMock._upload.mockClear()
  geminiMock._upload.mockResolvedValue({ uri: 'https://genai.example.com/files/abc', name: 'files/abc', mimeType: 'application/pdf' })
  geminiMock._delete.mockClear()
  geminiMock._delete.mockResolvedValue({})
}

beforeEach(() => resetMock())
afterEach(async () => { await app?.close() })

// ─── GET /api/kb/clients/:clientId/sources ──────────────────────────────────

describe('GET /api/kb/clients/:clientId/sources', () => {
  it('lists active sources for a client', async () => {
    const sources = [
      { id: 's1', file_name: 'report.pdf', deleted_at: null },
      { id: 's2', file_name: 'brief.docx', deleted_at: null },
    ]
    // First call: client lookup, second call: sources list
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      { data: sources, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/kb/clients/c1/sources' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(sources)
  })

  it('allows user role', async () => {
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      { data: [], error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({ method: 'GET', url: '/api/kb/clients/c1/sources' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 404 if client not found', async () => {
    sbMock.chain._results = [
      { data: null, error: { message: 'not found' } },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/kb/clients/bad-id/sources' })
    expect(res.statusCode).toBe(404)
  })

  it('returns 403 if no organisation', async () => {
    app = await buildTestApp(registerRoutes, { organisationId: null, userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/kb/clients/c1/sources' })
    expect(res.statusCode).toBe(403)
  })
})

// ─── POST /api/kb/clients/:clientId/sources ─────────────────────────────────

describe('POST /api/kb/clients/:clientId/sources', () => {
  it('uploads a file and returns 201', async () => {
    const created = { id: 's3', file_name: 'test.pdf', file_path: 'org-1/c1/uuid_test.pdf' }
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      { data: created, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })

    // Use raw injection with multipart boundary
    const body =
      `------FormBoundary\r\nContent-Disposition: form-data; name="file"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\nfake-pdf-content\r\n------FormBoundary--\r\n`

    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/c1/sources',
      headers: { 'content-type': `multipart/form-data; boundary=----FormBoundary` },
      payload: body,
    })

    expect(res.statusCode).toBe(201)
    expect(res.json()).toEqual(created)
    expect(sbMock.storage.from).toHaveBeenCalledWith('client-documents')
  })

  it('returns 403 for user role', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/c1/sources',
      headers: { 'content-type': 'multipart/form-data; boundary=----FormBoundary' },
      payload: '------FormBoundary\r\nContent-Disposition: form-data; name="file"; filename="x.pdf"\r\nContent-Type: application/pdf\r\n\r\ndata\r\n------FormBoundary--\r\n',
    })
    expect(res.statusCode).toBe(403)
  })

  it('returns 404 if client not found', async () => {
    sbMock.chain._results = [
      { data: null, error: { message: 'not found' } },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/kb/clients/bad-id/sources',
      headers: { 'content-type': 'multipart/form-data; boundary=----FormBoundary' },
      payload: '------FormBoundary\r\nContent-Disposition: form-data; name="file"; filename="x.pdf"\r\nContent-Type: application/pdf\r\n\r\ndata\r\n------FormBoundary--\r\n',
    })
    expect(res.statusCode).toBe(404)
  })
})

// ─── DELETE /api/kb/clients/:clientId/sources/:sourceId ─────────────────────

describe('DELETE /api/kb/clients/:clientId/sources/:sourceId', () => {
  it('soft-deletes a source and returns 204', async () => {
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      // fetch source to get gemini_file_name
      { data: { gemini_file_name: 'files/abc' }, error: null },
      // soft-delete
      { data: { id: 's1', deleted_at: '2025-01-01' }, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'DELETE', url: '/api/kb/clients/c1/sources/s1' })

    expect(res.statusCode).toBe(204)
    expect(sbMock.chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ deleted_at: expect.any(String) }),
    )
  })

  it('returns 404 if source not found', async () => {
    sbMock.chain._results = [
      { data: { id: 'c1' }, error: null },
      // fetch source (not found)
      { data: null, error: null },
      // soft-delete (not found)
      { data: null, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'DELETE', url: '/api/kb/clients/c1/sources/bad-id' })
    expect(res.statusCode).toBe(404)
  })

  it('returns 403 for user role', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({ method: 'DELETE', url: '/api/kb/clients/c1/sources/s1' })
    expect(res.statusCode).toBe(403)
  })
})
