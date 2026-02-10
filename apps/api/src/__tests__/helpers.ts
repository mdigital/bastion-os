import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import sensible from '@fastify/sensible'
import type { UserRole } from '@bastion-os/shared'
import fp from 'fastify-plugin'
import type { Mock } from 'vitest'
import { vi } from 'vitest'

// ─── Supabase mock (call from vi.hoisted) ───────────────────────────────────

export function createSupabaseMockInHoisted(): {
  from: Mock
  auth: { admin: { inviteUserByEmail: Mock } }
  chain: Record<string, unknown>
} {
  const chain: Record<string, unknown> = {
    _data: null as unknown,
    _error: null as { message: string } | null,
    _results: [] as Array<{ data: unknown; error: unknown }>,
  }

  // Every chained method returns the chain for fluent API
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'or', 'order', 'single']) {
    (chain as Record<string, unknown>)[m] = vi.fn(() => chain)
  }

  // Make chain thenable — `await chain` resolves to { data, error }
  chain.then = function (resolve: (v: unknown) => void) {
    const result =
      (chain._results as Array<{ data: unknown; error: unknown }>).length > 0
        ? (chain._results as Array<{ data: unknown; error: unknown }>).shift()!
        : { data: chain._data, error: chain._error }
    resolve(result)
  }

  const from = vi.fn(() => chain)
  const auth = { admin: { inviteUserByEmail: vi.fn() } }

  return { from, auth, chain }
}

export type SupabaseMock = ReturnType<typeof createSupabaseMockInHoisted>

/** Reset mock state between tests. Clears call history without wiping implementations. */
export function resetSupabaseMock(mock: SupabaseMock) {
  mock.from.mockClear()
  mock.auth.admin.inviteUserByEmail.mockClear()
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'or', 'order', 'single']) {
    (mock.chain as Record<string, ReturnType<typeof vi.fn>>)[m]!.mockClear()
  }
  mock.chain._data = null
  mock.chain._error = null
  mock.chain._results = []
}

// ─── Build test app ─────────────────────────────────────────────────────────

interface TestUser {
  userId?: string
  organisationId?: string | null
  userRole?: UserRole
}

export async function buildTestApp(
  registerRoutes: (app: FastifyInstance) => Promise<void>,
  user: TestUser = {},
): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  await app.register(sensible)

  // Stub auth
  await app.register(
    fp(
      async (f) => {
        f.decorateRequest('userId', '')
        f.decorateRequest('organisationId', null)
        f.decorateRequest('userRole', 'user')

        f.addHook('onRequest', async (request) => {
          request.userId = user.userId ?? 'user-1'
          request.organisationId = user.organisationId !== undefined ? user.organisationId : 'org-1'
          request.userRole = user.userRole ?? 'admin'
        })
      },
      { name: 'auth' },
    ),
  )

  // Real require-role plugin
  const { default: requireRole } = await import('../plugins/require-role.js')
  await app.register(requireRole)

  await registerRoutes(app)

  return app
}
