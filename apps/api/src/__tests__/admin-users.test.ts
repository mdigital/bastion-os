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
  const { default: routes } = await import('../routes/admin/users.js')
  await a.register(routes)
}

beforeEach(() => resetSupabaseMock(sbMock))
afterEach(async () => { await app?.close() })

// ─── GET /api/admin/users ───────────────────────────────────────────────────

describe('GET /api/admin/users', () => {
  it('lists org users', async () => {
    const profiles = [
      { id: 'u1', full_name: 'Alice', role: 'admin' },
      { id: 'u2', full_name: 'Bob', role: 'user' },
    ]
    sbMock.chain._data = profiles

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/users' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(profiles)
    expect(sbMock.from).toHaveBeenCalledWith('profiles')
  })

  it('allows manager role', async () => {
    sbMock.chain._data = []
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/users' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 403 for regular user', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/users' })
    expect(res.statusCode).toBe(403)
  })
})

// ─── POST /api/admin/users/invite ───────────────────────────────────────────

describe('POST /api/admin/users/invite', () => {
  it('invites a user by email', async () => {
    sbMock.auth.admin.inviteUserByEmail.mockResolvedValue({
      data: { user: { id: 'new-user-id' } },
      error: null,
    })

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/users/invite',
      payload: { email: 'new@acme.com', role: 'manager' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ id: 'new-user-id', email: 'new@acme.com' })
    expect(sbMock.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      'new@acme.com',
      expect.objectContaining({
        data: { organisation_id: 'org-1', role: 'manager' },
      }),
    )
  })

  it('returns 400 if email is missing', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/users/invite',
      payload: {},
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/users/invite',
      payload: { email: 'x@y.com' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('defaults role to user when not specified', async () => {
    sbMock.auth.admin.inviteUserByEmail.mockResolvedValue({
      data: { user: { id: 'u99' } },
      error: null,
    })

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    await app.inject({
      method: 'POST',
      url: '/api/admin/users/invite',
      payload: { email: 'default@acme.com' },
    })

    expect(sbMock.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      'default@acme.com',
      expect.objectContaining({
        data: { organisation_id: 'org-1', role: 'user' },
      }),
    )
  })
})

// ─── PATCH /api/admin/users/:id ─────────────────────────────────────────────

describe('PATCH /api/admin/users/:id', () => {
  it('updates a user role', async () => {
    const updated = { id: 'u2', full_name: 'Bob', role: 'manager', status: 'active' }
    sbMock.chain._data = updated

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/users/u2',
      payload: { role: 'manager' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(updated)
    expect(sbMock.chain.update).toHaveBeenCalledWith({ role: 'manager' })
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/users/u2',
      payload: { role: 'user' },
    })
    expect(res.statusCode).toBe(403)
  })
})
