import type { FastifyBaseLogger } from 'fastify'
import { gemini } from './gemini.js'
import { getPrompt } from './prompts.js'
import { supabaseAdmin } from './supabase.js'

/** Strip markdown code fences that Gemini sometimes wraps around JSON output. */
function parseJSON<T>(text: string): T {
  const stripped = text
    .replace(/^```(?:json)?\s*\n?/, '')
    .replace(/\n?```\s*$/, '')
    .trim()
  return JSON.parse(stripped) as T
}

interface KeyInfoResult {
  job_to_be_done: string | null
  budget: string | null
  due_date: string | null
  live_date: string | null
  campaign_duration: string | null
  brief_level: 'new_project' | 'fast_forward'
}

interface TriageResult {
  lead_practice: string
  supporting_practices: string[]
  rationale: string
}

interface SectionResult {
  section_template_id: string
  title: string
  content: string
  missing_info: string[]
  enhancements: Array<{ text: string; source: string }>
  questions: string[]
}

/**
 * Three-step AI analysis pipeline for a brief document.
 * Runs in the background — caller should fire-and-forget.
 */
export async function analyzeBrief(
  briefId: string,
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  organisationId: string,
  logger: FastifyBaseLogger,
): Promise<void> {
  let geminiFileName: string | undefined

  try {
    // ── Step 1: Extract text + key info ────────────────────────────────────
    await supabaseAdmin
      .from('briefs')
      .update({ analysis_status: 'extracting', analysis_error: null })
      .eq('id', briefId)

    // Upload file to Gemini Files API
    const geminiFile = await gemini.files.upload({
      file: new Blob([fileBuffer], { type: mimeType }),
      config: { mimeType },
    })

    if (!geminiFile.uri || !geminiFile.name) {
      throw new Error('Gemini file upload returned no URI/name')
    }
    geminiFileName = geminiFile.name

    // Extract full text
    const extractPrompt = await getPrompt(
      'brief-extract-text',
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

    // Delete temporary Gemini file (fire-and-forget)
    gemini.files.delete({ name: geminiFile.name }).catch((err) => {
      logger.warn({ err, briefId }, 'Failed to delete temporary Gemini file')
    })
    geminiFileName = undefined

    // Parse key info from extracted text
    const keyInfoPromptTemplate = await getPrompt(
      'brief-extract-keyinfo',
      'Analyse the following brief text and extract structured key information.\n\nReturn ONLY a JSON object with these fields (use null for any field you cannot determine):\n{\n  "job_to_be_done": "string",\n  "budget": "string",\n  "due_date": "YYYY-MM-DD or null",\n  "live_date": "YYYY-MM-DD or null",\n  "campaign_duration": "string",\n  "brief_level": "new_project or fast_forward"\n}\n\nBrief text:\n{{brief_text}}',
    )

    const keyInfoPrompt = keyInfoPromptTemplate.replace('{{brief_text}}', fullText)

    const keyInfoResult = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: keyInfoPrompt }] }],
    })

    const keyInfo = parseJSON<KeyInfoResult>(keyInfoResult.text ?? '{}')

    // Update brief with extracted data
    await supabaseAdmin
      .from('briefs')
      .update({
        analysis_status: 'extracted',
        extracted_text: fullText,
        job_to_be_done: keyInfo.job_to_be_done,
        budget: keyInfo.budget,
        due_date: keyInfo.due_date,
        live_date: keyInfo.live_date,
        campaign_duration: keyInfo.campaign_duration,
        brief_level: keyInfo.brief_level ?? 'new_project',
      })
      .eq('id', briefId)

    logger.info({ briefId, fileName, textLen: fullText.length }, 'Step 1 complete: text + key info extracted')

    // ── Step 2: Triage practice area ───────────────────────────────────────
    await supabaseAdmin
      .from('briefs')
      .update({ analysis_status: 'triaging' })
      .eq('id', briefId)

    // Fetch org practices
    const { data: practices, error: practicesErr } = await supabaseAdmin
      .from('practices')
      .select('id, name')
      .eq('organisation_id', organisationId)
      .order('sort_order')

    if (practicesErr || !practices?.length) {
      throw new Error(`Failed to fetch practices: ${practicesErr?.message ?? 'none found'}`)
    }

    const practiceList = practices.map((p) => `- ${p.name}`).join('\n')
    const keyInfoSummary = JSON.stringify(keyInfo, null, 2)

    const triagePromptTemplate = await getPrompt(
      'brief-triage-practice',
      'You are a marketing agency strategist. Given a client brief and the list of available practice areas, recommend which practice area should LEAD this brief.\n\nAvailable practice areas:\n{{practices}}\n\nBrief text:\n{{brief_text}}\n\nKey information:\n{{key_info}}\n\nReturn ONLY a JSON object:\n{\n  "lead_practice": "exact practice name",\n  "supporting_practices": ["array of names"],\n  "rationale": "explanation"\n}',
    )

    const triagePrompt = triagePromptTemplate
      .replace('{{practices}}', practiceList)
      .replace('{{brief_text}}', fullText)
      .replace('{{key_info}}', keyInfoSummary)

    const triageResult = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: triagePrompt }] }],
    })

    const triage = parseJSON<TriageResult>(triageResult.text ?? '{}')

    // Resolve practice names to IDs
    const leadPractice = practices.find(
      (p) => p.name.toLowerCase() === triage.lead_practice.toLowerCase(),
    )
    const supportingPracticeIds = triage.supporting_practices
      .map((name) => practices.find((p) => p.name.toLowerCase() === name.toLowerCase())?.id)
      .filter((id): id is string => !!id)

    await supabaseAdmin
      .from('briefs')
      .update({
        analysis_status: 'triaged',
        lead_practice_id: leadPractice?.id ?? null,
        supporting_practice_ids: supportingPracticeIds,
        triage_rationale: triage.rationale,
      })
      .eq('id', briefId)

    logger.info({ briefId, leadPractice: triage.lead_practice }, 'Step 2 complete: practice triaged')

    // ── Step 3: Generate enriched sections ─────────────────────────────────
    await supabaseAdmin
      .from('briefs')
      .update({ analysis_status: 'generating' })
      .eq('id', briefId)

    // Fetch the practice template for the lead practice + brief level
    const { data: brief } = await supabaseAdmin
      .from('briefs')
      .select('brief_level')
      .eq('id', briefId)
      .single()

    const briefLevel = brief?.brief_level ?? 'new_project'

    let sectionTemplateIds: string[] = []

    if (leadPractice?.id) {
      const { data: practiceTemplate } = await supabaseAdmin
        .from('practice_templates')
        .select('sections')
        .eq('practice_id', leadPractice.id)
        .eq('brief_level', briefLevel)
        .single()

      if (practiceTemplate?.sections) {
        const sections = practiceTemplate.sections as Array<{ section_template_id: string }>
        sectionTemplateIds = sections.map((s) => s.section_template_id)
      }
    }

    // If no practice template found, fall back to all global section templates
    let sectionTemplates: Array<{ id: string; name: string; description: string | null; ai_evaluation_criteria: string | null }>

    if (sectionTemplateIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('section_templates')
        .select('id, name, description, ai_evaluation_criteria')
        .in('id', sectionTemplateIds)

      sectionTemplates = data ?? []
      // Sort to match practice template order
      sectionTemplates.sort(
        (a, b) => sectionTemplateIds.indexOf(a.id) - sectionTemplateIds.indexOf(b.id),
      )
    } else {
      const { data } = await supabaseAdmin
        .from('section_templates')
        .select('id, name, description, ai_evaluation_criteria')
        .or(`organisation_id.is.null,organisation_id.eq.${organisationId}`)
        .limit(20)

      sectionTemplates = data ?? []
    }

    if (!sectionTemplates.length) {
      throw new Error('No section templates found for section generation')
    }

    const sectionsDesc = sectionTemplates
      .map(
        (s, i) =>
          `${i + 1}. ID: ${s.id}\n   Name: ${s.name}\n   Description: ${s.description ?? 'N/A'}\n   Evaluation Criteria: ${s.ai_evaluation_criteria ?? 'N/A'}`,
      )
      .join('\n\n')

    const genPromptTemplate = await getPrompt(
      'brief-generate-sections',
      'You are a senior strategist reviewing a client brief. For each section template provided, generate enriched content based on the brief text.\n\nBrief text:\n{{brief_text}}\n\nKey information:\n{{key_info}}\n\nSection templates to generate (with evaluation criteria):\n{{sections}}\n\nFor EACH section, return a JSON array where each element has:\n{\n  "section_template_id": "the template id",\n  "title": "section title",\n  "content": "HTML-formatted content",\n  "missing_info": ["array of missing items"],\n  "enhancements": [{"text": "suggestion", "source": "source"}],\n  "questions": ["array of questions"]\n}\n\nReturn ONLY the JSON array, no preamble.',
    )

    const genPrompt = genPromptTemplate
      .replace('{{brief_text}}', fullText)
      .replace('{{key_info}}', keyInfoSummary)
      .replace('{{sections}}', sectionsDesc)

    const genResult = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: genPrompt }] }],
    })

    const generatedSections = parseJSON<SectionResult[]>(genResult.text ?? '[]')

    // Delete existing sections for this brief (in case of retry)
    await supabaseAdmin.from('brief_sections').delete().eq('brief_id', briefId)

    // Insert generated sections
    const sectionRows = generatedSections.map((s, i) => ({
      brief_id: briefId,
      section_template_id: s.section_template_id,
      title: s.title,
      content: s.content,
      missing_info: s.missing_info,
      enhancements: s.enhancements,
      questions: s.questions,
      sort_order: i,
    }))

    if (sectionRows.length > 0) {
      const { error: insertErr } = await supabaseAdmin
        .from('brief_sections')
        .insert(sectionRows)

      if (insertErr) {
        throw new Error(`Failed to insert sections: ${insertErr.message}`)
      }
    }

    await supabaseAdmin
      .from('briefs')
      .update({ analysis_status: 'ready' })
      .eq('id', briefId)

    logger.info(
      { briefId, fileName, sectionCount: generatedSections.length },
      'Step 3 complete: sections generated — analysis ready',
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error({ err, briefId, fileName }, 'Brief analysis failed')

    // Determine which step failed based on current status
    const { data: current } = await supabaseAdmin
      .from('briefs')
      .select('analysis_status')
      .eq('id', briefId)
      .single()

    let failedStatus: string
    switch (current?.analysis_status) {
      case 'extracting':
        failedStatus = 'extract_failed'
        break
      case 'triaging':
        failedStatus = 'triage_failed'
        break
      case 'generating':
        failedStatus = 'sections_failed'
        break
      default:
        failedStatus = 'extract_failed'
    }

    const { error: dbErr } = await supabaseAdmin
      .from('briefs')
      .update({ analysis_status: failedStatus, analysis_error: message })
      .eq('id', briefId)

    if (dbErr) {
      logger.error({ dbErr, briefId }, 'Failed to update analysis_status to failed')
    }

    // Clean up Gemini file if it exists
    if (geminiFileName) {
      gemini.files.delete({ name: geminiFileName }).catch((cleanupErr) => {
        logger.warn({ cleanupErr, briefId }, 'Failed to clean up Gemini file after error')
      })
    }
  }
}
