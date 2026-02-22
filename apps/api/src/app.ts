import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import auth from './plugins/auth.js'
import requireRole from './plugins/require-role.js'
import healthRoutes from './routes/health.js'
import organisationRoutes from './routes/admin/organisations.js'
import userRoutes from './routes/admin/users.js'
import practiceRoutes from './routes/admin/practices.js'
import sectionTemplateRoutes from './routes/admin/section-templates.js'
import practiceTemplateRoutes from './routes/admin/practice-templates.js'
import clientRoutes from './routes/admin/clients.js'
import meRoutes from './routes/me.js'
import kbSourceRoutes from './routes/kb/sources.js'
import kbChatRoutes from './routes/kb/chat.js'
import kbSuggestionRoutes from './routes/kb/suggestions.js'
import promptRoutes from './routes/admin/prompts.js'
import checkEmailRoute from './routes/auth/check-email.js'

export async function buildApp() {
  const app = Fastify({
    logger: true,
  })

  // Plugins
  await app.register(cors, {
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
    credentials: true,
  })
  await app.register(helmet, {
    contentSecurityPolicy: false,
  })
  await app.register(sensible)
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })
  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  })

  // Auth
  await app.register(auth)
  await app.register(requireRole)

  // Routes
  await app.register(healthRoutes)
  await app.register(meRoutes)
  await app.register(organisationRoutes)
  await app.register(userRoutes)
  await app.register(practiceRoutes)
  await app.register(sectionTemplateRoutes)
  await app.register(practiceTemplateRoutes)
  await app.register(clientRoutes)
  await app.register(kbSourceRoutes)
  await app.register(kbChatRoutes)
  await app.register(kbSuggestionRoutes)

  await app.register(promptRoutes)
  await app.register(checkEmailRoute)

  return app
}
