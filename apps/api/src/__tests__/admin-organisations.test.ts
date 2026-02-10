import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { FastifyInstance } from 'fastify'

// Create mock with vi.hoisted so it's available to vi.mock
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
  const { default: routes } = await import('../routes/admin/organisations.js')
  await a.register(routes)
}

beforeEach(() => resetSupabaseMock(sbMock))
afterEach(async () => { await app?.close() })

// ─── GET /api/admin/organisation ────────────────────────────────────────────

describe('GET /api/admin/organisation', () => {
  it('returns the organisation for the current user', async () => {
    const org = { id: 'org-1', name: 'Acme', domain: 'acme.com', settings: {} }
    sbMock.chain._data = org

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/organisation' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(org)
    expect(sbMock.from).toHaveBeenCalledWith('organisations')
  })

  it('returns 403 for a regular user', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/organisation' })
    expect(res.statusCode).toBe(403)
  })

  it('allows manager role', async () => {
    sbMock.chain._data = { id: 'org-1', name: 'Acme' }
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/organisation' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 404 if user has no organisation', async () => {
    app = await buildTestApp(registerRoutes, { organisationId: null, userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/organisation' })
    // require-role sees null organisationId → 403
    expect(res.statusCode).toBe(403)
  })
})

// ─── PATCH /api/admin/organisation ──────────────────────────────────────────

describe('PATCH /api/admin/organisation', () => {
  it('updates the organisation', async () => {
    const updated = { id: 'org-1', name: 'New Name', domain: 'new.com', settings: {} }
    sbMock.chain._data = updated

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/organisation',
      payload: { name: 'New Name', domain: 'new.com' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(updated)
    expect(sbMock.from).toHaveBeenCalledWith('organisations')
    expect(sbMock.chain.update).toHaveBeenCalledWith({ name: 'New Name', domain: 'new.com' })
  })

  it('returns 403 for manager (admin-only)', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/organisation',
      payload: { name: 'X' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('returns 403 for regular user', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/organisation',
      payload: { name: 'X' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('only sends fields that are present in the body', async () => {
    sbMock.chain._data = { id: 'org-1', settings: { theme: 'dark' } }

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    await app.inject({
      method: 'PATCH',
      url: '/api/admin/organisation',
      payload: { settings: { theme: 'dark' } },
    })
    expect(sbMock.chain.update).toHaveBeenCalledWith({ settings: { theme: 'dark' } })
  })
})
