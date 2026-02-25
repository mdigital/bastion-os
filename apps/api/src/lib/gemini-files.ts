import type { GoogleGenAI } from '@google/genai'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { FastifyBaseLogger } from 'fastify'

export interface SourceRow {
  id: string
  file_name: string | null
  file_path: string
  file_type: string | null
  gemini_file_uri: string | null
  gemini_file_name: string | null
  gemini_file_uploaded_at: string | null
}

export interface PrepareProgress {
  current: number
  total: number
  fileName: string
  status: 'checking' | 'uploading' | 'ready' | 'failed'
}

export interface FilePart {
  fileData: { fileUri: string; mimeType: string }
}

/**
 * Prepare Gemini file parts for a set of sources.
 * Checks cached file state via Gemini API, re-uploads stale/missing files in parallel,
 * and reports progress via the onProgress callback.
 */
export async function prepareFiles(
  sources: SourceRow[],
  supabaseAdmin: SupabaseClient,
  gemini: GoogleGenAI,
  logger: FastifyBaseLogger,
  onProgress: (progress: PrepareProgress) => void,
): Promise<FilePart[]> {
  const total = sources.length
  const parts: FilePart[] = []

  const results = await Promise.allSettled(
    sources.map(async (source, index) => {
      const fileName = source.file_name || source.file_path.split('/').pop() || 'unknown'
      const mimeType = source.file_type || 'application/octet-stream'
      const current = index + 1

      // 1. If we have a cached gemini_file_name, verify it's still ACTIVE
      if (source.gemini_file_name) {
        onProgress({ current, total, fileName, status: 'checking' })
        try {
          const fileInfo = await gemini.files.get({ name: source.gemini_file_name })
          if (fileInfo.state === 'ACTIVE' && source.gemini_file_uri) {
            onProgress({ current, total, fileName, status: 'ready' })
            return { fileData: { fileUri: source.gemini_file_uri, mimeType } } as FilePart
          }
          // Not active — fall through to re-upload
        } catch {
          // File not found or other error — fall through to re-upload
        }
      }

      // 2. Re-upload: download from Supabase, upload to Gemini
      onProgress({ current, total, fileName, status: 'uploading' })

      const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
        .from('client-documents')
        .download(source.file_path)

      if (downloadErr || !fileData) {
        throw new Error(`Failed to download ${source.file_path}: ${downloadErr?.message}`)
      }

      const arrayBuffer = await fileData.arrayBuffer()
      const geminiFile = await gemini.files.upload({
        file: new Blob([arrayBuffer], { type: mimeType }),
        config: { mimeType },
      })

      if (!geminiFile.uri) {
        throw new Error(`Gemini upload returned no URI for ${fileName}`)
      }

      // Update cache in DB (fire-and-forget)
      const now = new Date().toISOString()
      supabaseAdmin
        .from('client_sources')
        .update({
          gemini_file_uri: geminiFile.uri,
          gemini_file_name: geminiFile.name ?? null,
          gemini_file_uploaded_at: now,
        })
        .eq('id', source.id)
        .then(({ error }) => {
          if (error) logger.warn({ error, sourceId: source.id }, 'Failed to cache Gemini file URI')
        })

      onProgress({ current, total, fileName, status: 'ready' })
      return { fileData: { fileUri: geminiFile.uri, mimeType } } as FilePart
    }),
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      parts.push(result.value)
    } else {
      logger.warn({ err: result.reason }, 'Failed to prepare file — skipping')
    }
  }

  return parts
}
