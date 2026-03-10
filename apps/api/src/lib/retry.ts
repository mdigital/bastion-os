import { ApiError } from '@google/genai'
import type { FastifyBaseLogger } from 'fastify'

interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  jitterMs?: number
  logger?: FastifyBaseLogger
  label?: string
}

/**
 * Wrap an async function with truncated exponential backoff retry on 429 errors.
 * Only retries on rate-limit (429) — all other errors are re-thrown immediately.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30_000,
    jitterMs = 1000,
    logger,
    label,
  } = opts

  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (!is429(err) || attempt >= maxRetries) throw err

      const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs) +
        Math.random() * jitterMs

      if (logger) {
        logger.warn(
          { attempt: attempt + 1, maxRetries, delayMs: Math.round(delay), label },
          'Gemini 429 rate-limited — retrying %s (%d/%d)',
          label ?? 'call',
          attempt + 1,
          maxRetries,
        )
      }

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

function is429(err: unknown): boolean {
  if (err instanceof ApiError) return err.status === 429
  // Duck-type fallback for edge cases
  if (err && typeof err === 'object' && 'status' in err) {
    return (err as { status: unknown }).status === 429
  }
  return false
}
