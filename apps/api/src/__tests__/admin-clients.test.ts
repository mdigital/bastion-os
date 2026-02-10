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
  const { default: routes } = await import('../routes/admin/clients.js')
  await a.register(routes)
}

beforeEach(() => resetSupabaseMock(sbMock))
afterEach(async () => { await app?.close() })

// ─── GET /api/admin/clients ─────────────────────────────────────────────────

describe('GET /api/admin/clients', () => {
  it('lists org clients ordered by name', async () => {
    const clients = [
      { id: 'c1', name: 'Acme Corp' },
      { id: 'c2', name: 'Beta Inc' },
    ]
    sbMock.chain._data = clients

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/clients' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(clients)
    expect(sbMock.from).toHaveBeenCalledWith('clients')
    expect(sbMock.chain.order).toHaveBeenCalledWith('name', { ascending: true })
  })

  it('allows manager role', async () => {
    sbMock.chain._data = []
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/clients' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 403 for regular user', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/clients' })
    expect(res.statusCode).toBe(403)
  })

  it('returns 403 if user has no organisation', async () => {
    app = await buildTestApp(registerRoutes, { organisationId: null, userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/clients' })
    expect(res.statusCode).toBe(403)
  })
})

// ─── POST /api/admin/clients ────────────────────────────────────────────────

describe('POST /api/admin/clients', () => {
  it('creates a client and returns 201', async () => {
    const created = { id: 'c3', organisation_id: 'org-1', name: 'New Client', industry: 'Tech' }
    sbMock.chain._data = created

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/clients',
      payload: { name: 'New Client', industry: 'Tech' },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json()).toEqual(created)
    expect(sbMock.chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ organisation_id: 'org-1', name: 'New Client', industry: 'Tech' }),
    )
  })

  it('returns 400 if name is missing', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/clients',
      payload: { industry: 'Tech' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/clients',
      payload: { name: 'X' },
    })
    expect(res.statusCode).toBe(403)
  })
})

// ─── PATCH /api/admin/clients/:id ───────────────────────────────────────────

describe('PATCH /api/admin/clients/:id', () => {
  it('updates a client', async () => {
    const updated = { id: 'c1', name: 'Updated Corp', industry: 'Finance' }
    sbMock.chain._data = updated

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/clients/c1',
      payload: { name: 'Updated Corp', industry: 'Finance' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(updated)
    expect(sbMock.chain.update).toHaveBeenCalledWith({ name: 'Updated Corp', industry: 'Finance' })
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/clients/c1',
      payload: { name: 'X' },
    })
    expect(res.statusCode).toBe(403)
  })
})

// ─── DELETE /api/admin/clients/:id ──────────────────────────────────────────

describe('DELETE /api/admin/clients/:id', () => {
  it('deletes a client and returns 204', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'DELETE', url: '/api/admin/clients/c1' })

    expect(res.statusCode).toBe(204)
    expect(sbMock.from).toHaveBeenCalledWith('clients')
    expect(sbMock.chain.delete).toHaveBeenCalled()
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({ method: 'DELETE', url: '/api/admin/clients/c1' })
    expect(res.statusCode).toBe(403)
  })
})
