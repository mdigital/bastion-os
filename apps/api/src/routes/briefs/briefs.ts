import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'
import { supabaseAdmin } from '../../lib/supabase.js'
import { analyzeBrief, parseJSON } from '../../lib/brief-analyzer.js'
import { gemini } from '../../lib/gemini.js'
import { getPrompt } from '../../lib/prompts.js'
import { withRetry } from '../../lib/retry.js'

const briefRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/briefs — create brief + upload file + fire-and-forget analysis
  fastify.post(
    '/api/briefs',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      // Parse multipart file
      const file = await request.file()
      if (!file) return reply.badRequest('File is required')

      const buffer = await file.toBuffer()
      const fileId = randomUUID()
      const storagePath = `${request.organisationId}/${fileId}_${file.filename}`

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabaseAdmin.storage
        .from('brief-documents')
        .upload(storagePath, buffer, {
          contentType: file.mimetype,
        })

      if (uploadErr) return reply.internalServerError(uploadErr.message)

      // Create brief row
      const { data: brief, error: briefErr } = await supabaseAdmin
        .from('briefs')
        .insert({
          organisation_id: request.organisationId,
          created_by: request.userId,
          analysis_status: 'pending',
        })
        .select()
        .single()

      if (briefErr || !brief) {
        return reply.internalServerError(briefErr?.message ?? 'Failed to create brief')
      }

      // Insert brief_files row
      const { error: fileErr } = await supabaseAdmin
        .from('brief_files')
        .insert({
          brief_id: brief.id,
          file_name: file.filename,
          file_path: storagePath,
          file_type: file.mimetype,
          file_size: buffer.length,
          uploaded_by: request.userId,
        })

      if (fileErr) {
        fastify.log.error({ fileErr, briefId: brief.id }, 'Failed to insert brief_files row')
      }

      // Fire-and-forget analysis
      analyzeBrief(
        brief.id,
        buffer,
        file.mimetype || 'application/octet-stream',
        file.filename,
        request.organisationId,
        fastify.log,
      ).catch((err) => {
        fastify.log.error({ err, briefId: brief.id }, 'Background brief analysis threw')
      })

      return reply.code(201).send(brief)
    },
  )

  // GET /api/briefs — list briefs for org
  fastify.get<{ Querystring: { include_archived?: string } }>(
    '/api/briefs',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      let query = supabaseAdmin
        .from('briefs')
        .select('*, brief_files(*), clients(id, name)')
        .eq('organisation_id', request.organisationId)
        .order('created_at', { ascending: false })

      if (request.query.include_archived !== 'true') {
        query = query.eq('archived', false)
      }

      const { data, error } = await query

      if (error) return reply.internalServerError(error.message)
      return data
    },
  )

  // GET /api/briefs/:id — fetch brief + sections + files (polling endpoint)
  fastify.get<{ Params: { id: string } }>(
    '/api/briefs/:id',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params

      const { data: brief, error } = await supabaseAdmin
        .from('briefs')
        .select('*, brief_files(*), brief_sections(*)')
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .single()

      if (error || !brief) return reply.notFound('Brief not found')

      // Sort sections by sort_order
      if (brief.brief_sections) {
        brief.brief_sections.sort(
          (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
        )
      }

      return brief
    },
  )

  // PATCH /api/briefs/:id — update brief fields
  fastify.patch<{
    Params: { id: string }
    Body: {
      job_to_be_done?: string
      budget?: string
      due_date?: string | null
      live_date?: string | null
      campaign_duration?: string
      brief_level?: 'new_project' | 'fast_forward'
      lead_practice_id?: string | null
      supporting_practice_ids?: string[]
      client_id?: string | null
      status?: 'draft' | 'finalized' | 'archived'
      archived?: boolean
    }
  }>(
    '/api/briefs/:id',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params
      const updates = request.body

      const { data, error } = await supabaseAdmin
        .from('briefs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Brief not found')

      return data
    },
  )

  // PATCH /api/briefs/:id/sections/:sectionId — update section content
  fastify.patch<{
    Params: { id: string; sectionId: string }
    Body: { title?: string; content?: string }
  }>(
    '/api/briefs/:id/sections/:sectionId',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id, sectionId } = request.params

      // Verify brief belongs to org
      const { data: brief, error: briefErr } = await supabaseAdmin
        .from('briefs')
        .select('id')
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .single()

      if (briefErr || !brief) return reply.notFound('Brief not found')

      const updates = request.body

      const { data, error } = await supabaseAdmin
        .from('brief_sections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sectionId)
        .eq('brief_id', id)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Section not found')

      return data
    },
  )

  // POST /api/briefs/:id/retry — retry failed analysis
  fastify.post<{ Params: { id: string } }>(
    '/api/briefs/:id/retry',
    { config: { requiredRoles: ['admin', 'manager'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params

      // Fetch the brief + its file
      const { data: brief, error: briefErr } = await supabaseAdmin
        .from('briefs')
        .select('id, organisation_id, brief_files(file_name, file_path, file_type)')
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .single()

      if (briefErr || !brief) return reply.notFound('Brief not found')

      const briefFile = (brief.brief_files as Array<{
        file_name: string
        file_path: string
        file_type: string | null
      }>)?.[0]

      if (!briefFile) return reply.badRequest('No file associated with this brief')

      // Download file from storage
      const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
        .from('brief-documents')
        .download(briefFile.file_path)

      if (downloadErr || !fileData) {
        return reply.internalServerError(`Failed to download file: ${downloadErr?.message}`)
      }

      const arrayBuffer = await fileData.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Fire-and-forget re-analysis
      analyzeBrief(
        brief.id,
        buffer,
        briefFile.file_type || 'application/octet-stream',
        briefFile.file_name || 'unknown',
        request.organisationId,
        fastify.log,
      ).catch((err) => {
        fastify.log.error({ err, briefId: brief.id }, 'Background brief analysis retry threw')
      })

      return reply.code(202).send({ message: 'Brief analysis restarted' })
    },
  )

  // POST /api/briefs/:id/sections/:sectionId/analyze — re-analyze a single section
  fastify.post<{ Params: { id: string; sectionId: string } }>(
    '/api/briefs/:id/sections/:sectionId/analyze',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id, sectionId } = request.params

      // Fetch brief with extracted text and key info
      const { data: brief, error: briefErr } = await supabaseAdmin
        .from('briefs')
        .select('id, extracted_text, job_to_be_done, budget, due_date, live_date, campaign_duration, brief_level, client_id, lead_practice_id')
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .single()

      if (briefErr || !brief) return reply.notFound('Brief not found')

      // Fetch the section with its template info
      const { data: section, error: sectionErr } = await supabaseAdmin
        .from('brief_sections')
        .select('id, content, section_template_id, title')
        .eq('id', sectionId)
        .eq('brief_id', id)
        .single()

      if (sectionErr || !section) return reply.notFound('Section not found')

      // Fetch the section template for name, description, evaluation criteria
      let templateName = section.title
      let templateDescription = ''
      let evaluationCriteria = ''

      if (section.section_template_id) {
        const { data: template } = await supabaseAdmin
          .from('section_templates')
          .select('name, description, ai_evaluation_criteria, practice_prompts')
          .eq('id', section.section_template_id)
          .single()

        if (template) {
          templateName = template.name
          templateDescription = template.description ?? ''

          // Use practice-specific criteria if available
          let practiceName: string | undefined
          if (brief.lead_practice_id) {
            const { data: practice } = await supabaseAdmin
              .from('practices')
              .select('name')
              .eq('id', brief.lead_practice_id)
              .single()
            practiceName = practice?.name
          }

          evaluationCriteria =
            (practiceName && (template.practice_prompts as Record<string, string> | null)?.[practiceName])
            ?? template.ai_evaluation_criteria
            ?? ''
        }
      }

      // Fetch KB context if client_id is set
      let kbContext = ''
      if (brief.client_id) {
        const { data: kbSources } = await supabaseAdmin
          .from('client_sources')
          .select('file_name, digest_summary')
          .eq('client_id', brief.client_id)
          .eq('digest_status', 'ready')
          .is('deleted_at', null)

        if (kbSources?.length) {
          const kbDocuments = kbSources
            .map((s) => `### ${s.file_name}\n${s.digest_summary ?? '(no summary)'}`)
            .join('\n\n')

          const kbPromptTemplate = await getPrompt(
            'brief-kb-context',
            'The following documents from the client\'s knowledge base are provided as supporting material. Use them to enrich section content, identify brand guidelines, rules, tone of voice, and any relevant constraints. Do not fabricate information beyond what these documents contain.\n\n{{kb_documents}}',
          )

          kbContext = kbPromptTemplate.replace('{{kb_documents}}', kbDocuments)
        }
      }

      const keyInfoSummary = JSON.stringify({
        job_to_be_done: brief.job_to_be_done,
        budget: brief.budget,
        due_date: brief.due_date,
        live_date: brief.live_date,
        campaign_duration: brief.campaign_duration,
        brief_level: brief.brief_level,
      }, null, 2)

      const promptTemplate = await getPrompt(
        'brief-reanalyze-section',
        'You are a senior strategist reviewing a client brief section that has been edited.\n\nBrief text:\n{{brief_text}}\n\nKey information:\n{{key_info}}\n\n{{knowledge_base}}\n\nSection: {{section_name}}\nDescription: {{section_description}}\nEvaluation Criteria: {{evaluation_criteria}}\n\nCurrent section content:\n{{section_content}}\n\nAnalyse the current content against the brief, key info, knowledge base, and evaluation criteria. Return a JSON object:\n{\n  "missing_info": ["items that should be in this section but are missing or incomplete"],\n  "enhancements": [{"text": "suggestion for improvement", "source": "basis for suggestion"}],\n  "questions": ["questions to ask the client to improve this section"]\n}\n\nReturn ONLY the JSON object, no preamble.',
      )

      const prompt = promptTemplate
        .replace('{{brief_text}}', brief.extracted_text ?? '')
        .replace('{{key_info}}', keyInfoSummary)
        .replace('{{knowledge_base}}', kbContext)
        .replace('{{section_name}}', templateName)
        .replace('{{section_description}}', templateDescription)
        .replace('{{evaluation_criteria}}', evaluationCriteria)
        .replace('{{section_content}}', section.content ?? '')

      const result = await withRetry(
        () => gemini.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { responseMimeType: 'application/json' },
        }),
        { logger: fastify.log, label: 'reanalyze-section' },
      )

      const analysis = parseJSON<{
        missing_info: string[]
        enhancements: Array<{ text: string; source: string }>
        questions: string[]
      }>(result.text ?? '{}')

      // Update the section with new analysis
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('brief_sections')
        .update({
          missing_info: analysis.missing_info,
          enhancements: analysis.enhancements,
          questions: analysis.questions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sectionId)
        .eq('brief_id', id)
        .select()
        .single()

      if (updateErr) return reply.internalServerError(updateErr.message)

      fastify.log.info({ briefId: id, sectionId }, 'Section re-analysis complete')
      return updated
    },
  )

  // POST /api/briefs/:id/archive — archive a brief
  fastify.post<{ Params: { id: string } }>(
    '/api/briefs/:id/archive',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { id } = request.params

      const { data, error } = await supabaseAdmin
        .from('briefs')
        .update({ archived: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('organisation_id', request.organisationId)
        .select()
        .single()

      if (error) return reply.internalServerError(error.message)
      if (!data) return reply.notFound('Brief not found')

      return data
    },
  )
}

export default briefRoutes
