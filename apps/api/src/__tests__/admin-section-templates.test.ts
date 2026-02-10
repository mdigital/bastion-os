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
  const { default: routes } = await import('../routes/admin/section-templates.js')
  await a.register(routes)
}

beforeEach(() => resetSupabaseMock(sbMock))
afterEach(async () => { await app?.close() })

// ─── GET /api/admin/section-templates ───────────────────────────────────────

describe('GET /api/admin/section-templates', () => {
  it('lists global + org-specific templates', async () => {
    const templates = [
      { id: 'sec-1', name: 'Global Section', organisation_id: null },
      { id: 'sec-org-1', name: 'Org Section', organisation_id: 'org-1' },
    ]
    sbMock.chain._data = templates

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/section-templates' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(templates)
    expect(sbMock.from).toHaveBeenCalledWith('section_templates')
    expect(sbMock.chain.or).toHaveBeenCalled()
  })

  it('allows manager role', async () => {
    sbMock.chain._data = []
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/section-templates' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 403 for regular user', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/section-templates' })
    expect(res.statusCode).toBe(403)
  })
})

// ─── POST /api/admin/section-templates ──────────────────────────────────────

describe('POST /api/admin/section-templates', () => {
  it('creates an org-specific template', async () => {
    const created = {
      id: 'sec-custom',
      organisation_id: 'org-1',
      name: 'Custom Section',
      category: 'Custom',
    }
    sbMock.chain._data = created

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/section-templates',
      payload: { id: 'sec-custom', name: 'Custom Section', category: 'Custom' },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json()).toEqual(created)
    expect(sbMock.chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'sec-custom',
        organisation_id: 'org-1',
        name: 'Custom Section',
      }),
    )
  })

  it('returns 400 if id is missing', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/section-templates',
      payload: { name: 'X' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 if name is missing', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/section-templates',
      payload: { id: 'sec-x' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/section-templates',
      payload: { id: 'sec-x', name: 'X' },
    })
    expect(res.statusCode).toBe(403)
  })
})

// ─── PATCH /api/admin/section-templates/:id ─────────────────────────────────

describe('PATCH /api/admin/section-templates/:id', () => {
  it('updates an org-specific template', async () => {
    const updated = { id: 'sec-custom', name: 'Updated Name', organisation_id: 'org-1' }
    sbMock.chain._data = updated

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/section-templates/sec-custom',
      payload: { name: 'Updated Name' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(updated)
    expect(sbMock.chain.update).toHaveBeenCalledWith({ name: 'Updated Name' })
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/section-templates/sec-custom',
      payload: { name: 'X' },
    })
    expect(res.statusCode).toBe(403)
  })
})

// ─── DELETE /api/admin/section-templates/:id ────────────────────────────────

describe('DELETE /api/admin/section-templates/:id', () => {
  it('deletes an org template and returns 204', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/admin/section-templates/sec-custom',
    })

    expect(res.statusCode).toBe(204)
    expect(sbMock.from).toHaveBeenCalledWith('section_templates')
    expect(sbMock.chain.delete).toHaveBeenCalled()
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/admin/section-templates/sec-custom',
    })
    expect(res.statusCode).toBe(403)
  })
})
