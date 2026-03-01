import type { FastifyBaseLogger } from 'fastify'
import { gemini } from './gemini.js'
import { getPrompt } from './prompts.js'
import { supabaseAdmin } from './supabase.js'

/**
 * Generate full-text extraction and summary digests for a client source document.
 * Runs in the background after upload — caller should fire-and-forget.
 */
export async function generateDigest(
  sourceId: string,
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  logger: FastifyBaseLogger,
): Promise<void> {
  try {
    // Mark as processing
    await supabaseAdmin
      .from('client_sources')
      .update({ digest_status: 'processing', digest_error: null })
      .eq('id', sourceId)

    // Upload file to Gemini Files API (temporary, for extraction only)
    const geminiFile = await gemini.files.upload({
      file: new Blob([fileBuffer], { type: mimeType }),
      config: { mimeType },
    })

    if (!geminiFile.uri || !geminiFile.name) {
      throw new Error('Gemini file upload returned no URI/name')
    }

    // Step 1: Extract full text
    const extractPrompt = await getPrompt(
      'kb-digest-extract',
      'Extract the complete text content from this document and convert it to well-structured Markdown. Preserve all headings, lists, tables, and formatting. Include all text content — do not summarise or omit anything. Output only the Markdown content, no preamble.',
    )

    const extractResult = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { fileData: { fileUri: geminiFile.uri, mimeType } },
            { text: extractPrompt },
          ],
        },
      ],
    })

    const fullText = extractResult.text ?? ''

    // Delete the temporary Gemini file (fire-and-forget)
    gemini.files.delete({ name: geminiFile.name }).catch((err) => {
      logger.warn({ err, sourceId }, 'Failed to delete temporary Gemini file')
    })

    // Step 2: Summarise the extracted text (no file needed)
    const summaryPrompt = await getPrompt(
      'kb-digest-summary',
      'Create a structured Markdown summary of this document that captures: 1) Document type and purpose, 2) Key topics and themes, 3) Important facts, figures, and data points, 4) Key conclusions or recommendations, 5) Any dates, deadlines, or timelines. Target 500-1000 words. Be comprehensive but concise. Output only the Markdown summary, no preamble.',
    )

    const summaryResult = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${summaryPrompt}\n\n---\n\n${fullText}` }],
        },
      ],
    })

    const summary = summaryResult.text ?? ''

    // Store digests
    await supabaseAdmin
      .from('client_sources')
      .update({
        digest_status: 'ready',
        digest_full_text: fullText,
        digest_summary: summary,
        digest_error: null,
        digested_at: new Date().toISOString(),
      })
      .eq('id', sourceId)

    logger.info({ sourceId, fileName, fullTextLen: fullText.length, summaryLen: summary.length }, 'Digest generation complete')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error({ err, sourceId, fileName }, 'Digest generation failed')

    const { error: dbErr } = await supabaseAdmin
      .from('client_sources')
      .update({ digest_status: 'failed', digest_error: message })
      .eq('id', sourceId)

    if (dbErr) {
      logger.error({ dbErr, sourceId }, 'Failed to update digest_status to failed')
    }
  }
}
