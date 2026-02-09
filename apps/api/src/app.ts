import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import auth from './plugins/auth.js'
import healthRoutes from './routes/health.js'

export async function buildApp() {
  const app = Fastify({
    logger: true,
  })

  // Plugins
  await app.register(cors, {
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
    credentials: true,
  })
  await app.register(helmet)
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

  // Routes
  await app.register(healthRoutes)

  return app
}
