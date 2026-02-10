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
  const { default: routes } = await import('../routes/admin/practice-templates.js')
  await a.register(routes)
}

beforeEach(() => resetSupabaseMock(sbMock))
afterEach(async () => { await app?.close() })

// ─── GET /api/admin/practice-templates ──────────────────────────────────────

describe('GET /api/admin/practice-templates', () => {
  it('lists practice templates for the org', async () => {
    const templates = [
      { id: 'pt1', practice_id: 'p1', brief_level: 'new_project', sections: [] },
    ]
    sbMock.chain._data = templates

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/practice-templates' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(templates)
    expect(sbMock.from).toHaveBeenCalledWith('practice_templates')
  })

  it('filters by practice_id querystring', async () => {
    sbMock.chain._data = []

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    await app.inject({ method: 'GET', url: '/api/admin/practice-templates?practice_id=p1' })

    expect(sbMock.chain.eq).toHaveBeenCalledWith('practice_id', 'p1')
  })

  it('allows manager role', async () => {
    sbMock.chain._data = []
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/practice-templates' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 403 for regular user', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({ method: 'GET', url: '/api/admin/practice-templates' })
    expect(res.statusCode).toBe(403)
  })
})

// ─── POST /api/admin/practice-templates ─────────────────────────────────────

describe('POST /api/admin/practice-templates', () => {
  it('creates a practice template', async () => {
    const created = { id: 'pt1', practice_id: 'p1', brief_level: 'new_project', sections: [] }
    // First await: verify practice exists; second await: insert result
    sbMock.chain._results = [
      { data: { id: 'p1' }, error: null },
      { data: created, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/practice-templates',
      payload: {
        practice_id: 'p1',
        brief_level: 'new_project',
        sections: [{ section_template_id: 'sec-1', required: true }],
      },
    })

    expect(res.statusCode).toBe(201)
    expect(sbMock.chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ practice_id: 'p1', brief_level: 'new_project' }),
    )
  })

  it('returns 400 if practice_id is missing', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/practice-templates',
      payload: { brief_level: 'new_project', sections: [] },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 if brief_level is missing', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/practice-templates',
      payload: { practice_id: 'p1', sections: [] },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 if practice not in org', async () => {
    sbMock.chain._results = [{ data: null, error: null }]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/practice-templates',
      payload: { practice_id: 'not-mine', brief_level: 'new_project', sections: [] },
    })
    expect(res.statusCode).toBe(404)
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({
      method: 'POST',
      url: '/api/admin/practice-templates',
      payload: { practice_id: 'p1', brief_level: 'new_project', sections: [] },
    })
    expect(res.statusCode).toBe(403)
  })
})

// ─── PATCH /api/admin/practice-templates/:id ────────────────────────────────

describe('PATCH /api/admin/practice-templates/:id', () => {
  it('updates sections list', async () => {
    const updated = { id: 'pt1', sections: [{ section_template_id: 'sec-2', required: false }] }
    // First await: verify ownership; second await: update result
    sbMock.chain._results = [
      { data: { id: 'pt1' }, error: null },
      { data: updated, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/practice-templates/pt1',
      payload: { sections: [{ section_template_id: 'sec-2', required: false }] },
    })

    expect(res.statusCode).toBe(200)
    expect(sbMock.chain.update).toHaveBeenCalledWith({
      sections: [{ section_template_id: 'sec-2', required: false }],
    })
  })

  it('returns 404 if not found in org', async () => {
    sbMock.chain._results = [{ data: null, error: null }]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/practice-templates/bad-id',
      payload: { sections: [] },
    })
    expect(res.statusCode).toBe(404)
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'user' })
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/practice-templates/pt1',
      payload: { sections: [] },
    })
    expect(res.statusCode).toBe(403)
  })
})

// ─── DELETE /api/admin/practice-templates/:id ───────────────────────────────

describe('DELETE /api/admin/practice-templates/:id', () => {
  it('deletes a practice template', async () => {
    // First await: verify ownership; second await: delete
    sbMock.chain._results = [
      { data: { id: 'pt1' }, error: null },
      { data: null, error: null },
    ]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'DELETE', url: '/api/admin/practice-templates/pt1' })

    expect(res.statusCode).toBe(204)
    expect(sbMock.chain.delete).toHaveBeenCalled()
  })

  it('returns 404 if not in org', async () => {
    sbMock.chain._results = [{ data: null, error: null }]

    app = await buildTestApp(registerRoutes, { userRole: 'admin' })
    const res = await app.inject({ method: 'DELETE', url: '/api/admin/practice-templates/bad-id' })
    expect(res.statusCode).toBe(404)
  })

  it('returns 403 for non-admin', async () => {
    app = await buildTestApp(registerRoutes, { userRole: 'manager' })
    const res = await app.inject({ method: 'DELETE', url: '/api/admin/practice-templates/pt1' })
    expect(res.statusCode).toBe(403)
  })
})
