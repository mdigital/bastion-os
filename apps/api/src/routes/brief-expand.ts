import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../lib/supabase.js'
import { gemini } from '../lib/gemini.js'
import { getPrompt } from '../lib/prompts.js'

interface ExpandedSection {
  section_template_id: string
  title: string
  content: string
  missing_info: string[]
  enhancements: string[]
  questions: string[]
}

interface ExpansionResult {
  key_info: {
    job_to_be_done: string | null
    budget: string | null
    due_date: string | null
    live_date: string | null
    campaign_duration: string | null
  }
  sections: ExpandedSection[]
}

const briefExpandRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/briefs/:briefId/expand
  fastify.post<{ Params: { briefId: string } }>(
    '/api/briefs/:briefId/expand',
    { config: { requiredRoles: ['admin', 'manager', 'user'] } },
    async (request, reply) => {
      if (!request.organisationId) {
        return reply.notFound('User has no organisation')
      }

      const { briefId } = request.params

      // 1. Load brief and verify org ownership
      const { data: brief, error: briefErr } = await supabaseAdmin
        .from('briefs')
        .select('*')
        .eq('id', briefId)
        .eq('organisation_id', request.organisationId)
        .single()

      if (briefErr || !brief) return reply.notFound('Brief not found')

      if (!brief.lead_practice_id) {
        return reply.badRequest('Brief must have a lead_practice_id set before expansion')
      }

      // 2. Load practice template for this practice + brief_level
      const { data: practiceTemplate } = await supabaseAdmin
        .from('practice_templates')
        .select('*')
        .eq('practice_id', brief.lead_practice_id)
        .eq('brief_level', brief.brief_level)
        .single()

      if (!practiceTemplate) {
        return reply.badRequest(
          'No practice template found for this practice and brief level. Configure one in Admin > Practice Templates.',
        )
      }

      const templateSections = practiceTemplate.sections as Array<{
        section_template_id: string
        required: boolean
      }>

      if (templateSections.length === 0) {
        return reply.badRequest('Practice template has no sections configured')
      }

      // 3. Load referenced section templates
      const sectionTemplateIds = templateSections.map((s) => s.section_template_id)
      const { data: sectionTemplates } = await supabaseAdmin
        .from('section_templates')
        .select('id, name, description, ai_evaluation_criteria')
        .in('id', sectionTemplateIds)

      if (!sectionTemplates || sectionTemplates.length === 0) {
        return reply.badRequest('Section templates not found')
      }

      // Build a map for quick lookup
      const templateMap = new Map(sectionTemplates.map((t) => [t.id, t]))

      // 4. Load brief files and build Gemini file parts
      const { data: briefFiles } = await supabaseAdmin
        .from('brief_files')
        .select('*')
        .eq('brief_id', briefId)

      const fileParts: Array<{ fileData: { fileUri: string; mimeType: string } }> = []

      if (briefFiles && briefFiles.length > 0) {
        for (const bf of briefFiles) {
          let fileUri = bf.gemini_file_uri as string | null

          // Re-upload to Gemini if URI is missing (expired or failed initially)
          if (!fileUri) {
            try {
              const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
                .from('brief-documents')
                .download(bf.file_path)

              if (downloadErr || !fileData) continue

              const arrayBuffer = await fileData.arrayBuffer()
              const geminiFile = await gemini.files.upload({
                file: new Blob([arrayBuffer], { type: bf.file_type || 'application/octet-stream' }),
                config: { mimeType: bf.file_type || 'application/octet-stream' },
              })

              fileUri = geminiFile.uri ?? null

              // Persist the new URI
              if (fileUri) {
                await supabaseAdmin
                  .from('brief_files')
                  .update({ gemini_file_uri: fileUri })
                  .eq('id', bf.id)
              }
            } catch (err) {
              fastify.log.warn({ err, fileId: bf.id }, 'Failed to re-upload file to Gemini')
              continue
            }
          }

          if (fileUri) {
            fileParts.push({
              fileData: {
                fileUri,
                mimeType: bf.file_type || 'application/octet-stream',
              },
            })
          }
        }
      }

      // 5. Build user prompt with section details
      const sectionInstructions = templateSections
        .map((ts, i) => {
          const tmpl = templateMap.get(ts.section_template_id)
          if (!tmpl) return null
          return [
            `### Section ${i + 1}: ${tmpl.name}`,
            `- section_template_id: "${tmpl.id}"`,
            tmpl.description ? `- Description: ${tmpl.description}` : null,
            tmpl.ai_evaluation_criteria ? `- Evaluation Criteria: ${tmpl.ai_evaluation_criteria}` : null,
            `- Required: ${ts.required}`,
          ]
            .filter(Boolean)
            .join('\n')
        })
        .filter(Boolean)
        .join('\n\n')

      const briefContext = [
        brief.job_to_be_done ? `Job to be done: ${brief.job_to_be_done}` : null,
        brief.budget ? `Budget: ${brief.budget}` : null,
        brief.due_date ? `Due date: ${brief.due_date}` : null,
        brief.live_date ? `Live date: ${brief.live_date}` : null,
        brief.campaign_duration ? `Campaign duration: ${brief.campaign_duration}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      const userPrompt = [
        'Expand the following brief using the attached documents.',
        '',
        briefContext ? `## Existing Brief Info\n${briefContext}` : null,
        '',
        `## Sections to Expand\n\n${sectionInstructions}`,
        '',
        'Return structured JSON as specified in the system instructions.',
      ]
        .filter((line) => line !== null)
        .join('\n')

      // 6. Call Gemini with structured JSON output
      const systemInstruction = await getPrompt(
        'brief-expansion-system',
        'You are a senior advertising strategist. Expand each section of the brief. Return valid JSON with key_info and sections arrays.',
      )

      const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
        contents: [
          {
            role: 'user',
            parts: [...fileParts, { text: userPrompt }],
          },
        ],
      })

      const rawText = response.text ?? '{}'
      let result: ExpansionResult
      try {
        result = JSON.parse(rawText) as ExpansionResult
      } catch {
        fastify.log.error({ rawText }, 'Failed to parse Gemini expansion response')
        return reply.internalServerError('AI returned invalid JSON. Please try again.')
      }

      // 7. Update brief key_info (non-destructive: only fill empty fields)
      if (result.key_info) {
        const keyInfoUpdate: Record<string, unknown> = {}
        if (!brief.job_to_be_done && result.key_info.job_to_be_done) {
          keyInfoUpdate.job_to_be_done = result.key_info.job_to_be_done
        }
        if (!brief.budget && result.key_info.budget) {
          keyInfoUpdate.budget = result.key_info.budget
        }
        if (!brief.due_date && result.key_info.due_date) {
          keyInfoUpdate.due_date = result.key_info.due_date
        }
        if (!brief.live_date && result.key_info.live_date) {
          keyInfoUpdate.live_date = result.key_info.live_date
        }
        if (!brief.campaign_duration && result.key_info.campaign_duration) {
          keyInfoUpdate.campaign_duration = result.key_info.campaign_duration
        }

        if (Object.keys(keyInfoUpdate).length > 0) {
          await supabaseAdmin.from('briefs').update(keyInfoUpdate).eq('id', briefId)
        }
      }

      // 8. Delete existing sections and insert new ones from AI response
      await supabaseAdmin.from('brief_sections').delete().eq('brief_id', briefId)

      if (result.sections && result.sections.length > 0) {
        const rows = result.sections.map((s, i) => ({
          brief_id: briefId,
          section_template_id: s.section_template_id || null,
          title: s.title,
          content: s.content || null,
          missing_info: s.missing_info || [],
          enhancements: s.enhancements || [],
          questions: s.questions || [],
          sort_order: i,
        }))

        const { error: insertErr } = await supabaseAdmin.from('brief_sections').insert(rows)
        if (insertErr) {
          fastify.log.error({ insertErr }, 'Failed to insert expanded sections')
          return reply.internalServerError('Failed to save expanded sections')
        }
      }

      // 9. Return the expanded brief with sections
      const { data: expandedBrief } = await supabaseAdmin
        .from('briefs')
        .select('*')
        .eq('id', briefId)
        .single()

      const { data: expandedSections } = await supabaseAdmin
        .from('brief_sections')
        .select('*')
        .eq('brief_id', briefId)
        .order('sort_order', { ascending: true })

      return {
        ...expandedBrief,
        sections: expandedSections ?? [],
      }
    },
  )
}

export default briefExpandRoutes
