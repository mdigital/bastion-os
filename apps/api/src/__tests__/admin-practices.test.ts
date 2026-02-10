import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { FastifyInstance } from 'fastify'

const sbMock = vi.hoisted(() => {
  const chain: Record<string, unknown> = {
    _data: null,
    _error: null,
    _results: [] as Array<{ data: unknown; error: unknown }>,
  }
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'or', 'order', 'single']) {
    chain[m] = vi.fn(() => chain)
  }
  chain.then = function (resolve: (v: unknown) => void) {
    const results = chain._results as Array<{ data: unknown; error: unknown }>
    const result = results.length > 0 ? results.shift()! : { data: chain._data, error: chain._error }
    resolve(result)
  }
  return {
    from: vi.fn(() => chain),
    auth: { admin: { inviteUserByEmail: vi.fn() } },
    chain,
  }
})

vi.mock('../lib/supabase.js', () => ({ supabaseAdmin: sbMock }))

import { buildTestApp, resetSupabaseMock } from './helpers.js'

let app: FastifyInstance

async function registerRoutes(a: FastifyInstance) {
  const { default: routes } = await import('../routes/admin/practices.js')
  await a.register(routes)
}

beforeEach(() => resetSupabaseMock(sbMock))
afterEach(async () => { await app?.close() })

// ─── GET /api/admin/practices ───────────────────────────────────────────────

describe('GET /api/admin/practices', () => {
  it('lists org practices ordered by sort_order', async () => {
    const practices = [
      { id: 'p1', name: 'Creative', sort_order: 0 },
      { id: 'p2', name: 'Social', sort_order: 1 },
    ]
    sbMock.chain._data = practices

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/practices' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(practices)
    expect(sbMock.from).toHaveBeenCalledWith('practices')
    expect(sbMock.chain.order).toHaveBeenCalledWith('sort_order', { ascending: true })
  })

  it('allows manager role', async () => {
    sbMock.chain._data = []
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/practices' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 403 for regular user', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/practices' })
    expect(res.statusCode).toBe(403)
  })

  it('returns 403 if user has no organisation', async () => {
    app = await buildTestApp(registerRoutes, { organisationId: null, userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/practices' })
    expect(res.statusCode).toBe(403)
  })
})

// ─── POST /api/admin/practices ──────────────────────────────────────────────

describe('POST /api/admin/practices', () => {
  it('creates a practice and returns 201', async () => {
    const created = { id: 'p3', organisation_id: 'org-1', name: 'Media', color: '#ff0', sort_order: 2 }
    sbMock.chain._data = created

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/practices',
      payload: { name: 'Media', color: '#ff0', sort_order: 2 },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json()).toEqual(created)
    expect(sbMock.chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ organisation_id: 'org-1', name: 'Media', color: '#ff0' }),
    )
  })

  it('returns 400 if name is missing', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/practices',
      payload: { color: '#000' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/practices',
      payload: { name: 'X' },
    })
    expect(res.statusCode).toBe(403)
  })
})

// ─── PATCH /api/admin/practices/:id ─────────────────────────────────────────

describe('PATCH /api/admin/practices/:id', () => {
  it('updates a practice', async () => {
    const updated = { id: 'p1', name: 'Creative Studio', color: '#00f' }
    sbMock.chain._data = updated

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/practices/p1',
      payload: { name: 'Creative Studio', color: '#00f' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(updated)
    expect(sbMock.chain.update).toHaveBeenCalledWith({ name: 'Creative Studio', color: '#00f' })
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/practices/p1',
      payload: { name: 'X' },
    })
    expect(res.statusCode).toBe(403)
  })
})

// ─── DELETE /api/admin/practices/:id ────────────────────────────────────────

describe('DELETE /api/admin/practices/:id', () => {
  it('deletes a practice and returns 204', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'DELETE', url: '/api/admin/practices/p1' })

    expect(res.statusCode).toBe(204)
    expect(sbMock.from).toHaveBeenCalledWith('practices')
    expect(sbMock.chain.delete).toHaveBeenCalled()
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({ method: 'DELETE', url: '/api/admin/practices/p1' })
    expect(res.statusCode).toBe(403)
  })
})
