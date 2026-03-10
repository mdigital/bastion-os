import type { Step, Practice } from '@bastion-os/shared'
import { useCallback, useEffect, useState } from 'react'
import ClientBriefCard from '../components/ClientBriefCard'
import DepartmentTriageStep from '../components/DepartmentTriageStep'
import KeyInformationStep from '../components/KeyInformationStep'
import KnowledgeBaseCard from '../components/KnowledgeBaseCard'
import Layout from '../components/Layout'
import ProgressSteps from '../components/ProgressSteps'
import UploadStep from '../components/UploadStep'
import { useAppState } from '../contexts/useAppState'
import type { KeyInfo } from '../types/KeyInfo'
import type { SectionData } from '../types/SectionData'
import BriefSectionsStep from '../components/BriefSectionsStep'
import { apiUploadFile, apiFetch } from '../lib/api'
import { useBriefPolling } from '../hooks/useBriefPolling'
import type { BriefWithRelations } from '../hooks/useBriefPolling'

/** Map DB brief to frontend KeyInfo shape */
function briefToKeyInfo(brief: BriefWithRelations): KeyInfo {
  return {
    client: '', // client name resolved separately if needed
    jobToBeDone: brief.job_to_be_done ?? '',
    budget: brief.budget ?? '',
    dueDate: brief.due_date ?? '',
    liveDate: brief.live_date ?? '',
    campaignDuration: brief.campaign_duration ?? '',
    briefLevel: brief.brief_level === 'fast_forward' ? 'Fast Forward Brief' : 'New Project Brief',
  }
}

/** Map DB brief_sections to frontend SectionData shape */
function sectionsToSectionData(brief: BriefWithRelations): SectionData[] {
  return (brief.brief_sections ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    content: s.content ?? '',
    missing: (s.missing_info as string[]) ?? [],
    enhancements: (s.enhancements as Array<{ text: string; source: string }>) ?? [],
    questions: (s.questions as string[]) ?? [],
  }))
}

export default function HomePage() {
  const [keyInfo, setKeyInfo] = useState<KeyInfo>({
    client: '',
    jobToBeDone: '',
    budget: '',
    dueDate: '',
    liveDate: '',
    campaignDuration: '',
    briefLevel: 'New Project Brief',
  })
  const [sections, setSections] = useState<SectionData[]>([])
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const { currentView, setCurrentView } = useAppState()
  const [briefId, setBriefId] = useState<string | null>(null)
  const [leadDepartment, setLeadDepartment] = useState('')
  const [supportingDepartments, setSupportingDepartments] = useState<string[]>([])
  const [triageRationale, setTriageRationale] = useState('')
  const [showComparison] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [practices, setPractices] = useState<Practice[]>([])
  const [approverComments, setApproverComments] = useState<{
    [key: number]: { comment: string; approverName: string; actioned: boolean }
  }>({})

  const { brief, retry } = useBriefPolling(briefId)

  // Fetch practices on mount
  useEffect(() => {
    apiFetch<Practice[]>('/api/admin/practices')
      .then(setPractices)
      .catch(() => {}) // silently fail — practices will be empty
  }, [])

  // Drive step transitions from brief analysis_status
  // Only auto-advance: upload → keyInfo. All other transitions require user clicking "Continue".
  useEffect(() => {
    if (!brief) return

    // Statuses that mean extraction is done (at least)
    const pastExtraction =
      brief.analysis_status === 'extracted' ||
      brief.analysis_status === 'triaging' ||
      brief.analysis_status === 'triaged' ||
      brief.analysis_status === 'generating' ||
      brief.analysis_status === 'ready'

    // Statuses that mean triage is done (at least)
    const pastTriage =
      brief.analysis_status === 'triaged' ||
      brief.analysis_status === 'generating' ||
      brief.analysis_status === 'ready'

    // Update key info whenever extraction data is available
    if (pastExtraction) {
      setKeyInfo(briefToKeyInfo(brief))
    }

    // Update triage data in the background
    if (pastTriage) {
      if (brief.lead_practice_id && practices.length > 0) {
        const lead = practices.find((p) => p.id === brief.lead_practice_id)
        if (lead) setLeadDepartment(lead.name)
      }
      if (brief.supporting_practice_ids?.length && practices.length > 0) {
        const names = brief.supporting_practice_ids
          .map((id) => practices.find((p) => p.id === id)?.name)
          .filter((n): n is string => !!n)
        setSupportingDepartments(names)
      }
      setTriageRationale(brief.triage_rationale ?? '')
    }

    // Update sections data in the background
    if (brief.analysis_status === 'ready') {
      setSections(sectionsToSectionData(brief))
    }

    // Only auto-advance from upload → keyInfo once extraction completes
    if (pastExtraction && currentStep === 'upload') {
      setCurrentStep('keyInfo')
    }
  }, [brief, practices, currentStep])

  const handleNewBrief = () => {
    setBriefId(null)
    setKeyInfo({
      client: '',
      jobToBeDone: '',
      budget: '',
      dueDate: '',
      liveDate: '',
      campaignDuration: '',
      briefLevel: 'New Project Brief',
    })
    setSections([])
    setLeadDepartment('')
    setSupportingDepartments([])
    setTriageRationale('')
    setApproverComments({})
    setCurrentStep('upload')
    setCurrentView('brief')
    setUploadError(null)
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)
    try {
      const created = await apiUploadFile<{ id: string }>('/api/briefs', file)
      setBriefId(created.id)
      // Polling will auto-advance steps
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleKeyInfoEdit = useCallback(
    (field: keyof KeyInfo, value: string) => {
      setKeyInfo((prev) => ({ ...prev, [field]: value }))

      // Persist to API (debounce not needed — save happens on field blur or "Continue")
      if (briefId) {
        // Map frontend field names to DB column names
        const fieldMap: Record<string, string> = {
          jobToBeDone: 'job_to_be_done',
          budget: 'budget',
          dueDate: 'due_date',
          liveDate: 'live_date',
          campaignDuration: 'campaign_duration',
        }
        const dbField = fieldMap[field]
        if (dbField) {
          apiFetch(`/api/briefs/${briefId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [dbField]: value || null }),
          }).catch(() => {}) // silent
        }
      }
    },
    [briefId],
  )

  const handleSectionUpdate = useCallback(
    (index: number, content: string) => {
      setSections((prev) => {
        const newSections = [...prev]
        newSections[index] = { ...newSections[index], content }
        return newSections
      })

      // Persist to API
      const section = sections[index]
      if (briefId && section?.id) {
        apiFetch(`/api/briefs/${briefId}/sections/${section.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }).catch(() => {}) // silent
      }
    },
    [briefId, sections],
  )

  const handleLeadDepartmentChange = useCallback(
    (dept: string) => {
      setLeadDepartment(dept)
      if (briefId && practices.length > 0) {
        const practice = practices.find((p) => p.name === dept)
        if (practice) {
          apiFetch(`/api/briefs/${briefId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lead_practice_id: practice.id }),
          }).catch(() => {})
        }
      }
    },
    [briefId, practices],
  )

  const handleMarkCommentActioned = (sectionIndex: number) => {
    setApproverComments((prev) => ({
      ...prev,
      [sectionIndex]: {
        ...prev[sectionIndex],
        actioned: true,
      },
    }))
  }

  return (
    <Layout>
      <>
        {/* Home View */}
        {currentView === 'home' && (
          <div className="max-w-screen-2xl mx-auto px-8 py-12 grid grid-cols-12 gap-6 items-stretch">
            <div className="col-span-12 md:col-span-6 flex">
              <KnowledgeBaseCard />
            </div>
            <div className="col-span-12 md:col-span-6 flex">
              <ClientBriefCard onNewBrief={handleNewBrief} />
            </div>
          </div>
        )}

        {/* Brief View */}
        {currentView === 'brief' && (
          <>
            <ProgressSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />

            {currentStep === 'upload' && (
              <UploadStep
                onUpload={handleFileUpload}
                isUploading={isUploading}
                uploadError={uploadError}
                analysisStatus={brief?.analysis_status ?? null}
                briefId={briefId}
                analysisError={brief?.analysis_error ?? null}
                onRetry={retry}
              />
            )}
            {currentStep === 'keyInfo' && keyInfo && (
              <KeyInformationStep
                keyInfo={keyInfo}
                onNext={() => {
                  // If triage is already done, skip ahead
                  if (brief && (brief.analysis_status === 'triaged' || brief.analysis_status === 'generating' || brief.analysis_status === 'ready')) {
                    setCurrentStep('triage')
                  } else {
                    setCurrentStep('triage')
                  }
                }}
                onEdit={handleKeyInfoEdit}
                onBack={() => setCurrentStep('upload')}
              />
            )}
            {currentStep === 'triage' && (
              <DepartmentTriageStep
                leadDepartment={leadDepartment}
                rationale={triageRationale}
                practices={practices}
                onLeadDepartmentChange={handleLeadDepartmentChange}
                onSupportingDepartmentsChange={setSupportingDepartments}
                onNext={() => {
                  if (brief?.analysis_status === 'ready') {
                    setCurrentStep('sections')
                  } else {
                    setCurrentStep('sections')
                  }
                }}
                onBack={() => setCurrentStep('keyInfo')}
              />
            )}
            {currentStep === 'sections' && !showComparison && (
              <BriefSectionsStep
                onKeyInfoChange={handleKeyInfoEdit}
                keyInfo={keyInfo}
                onLeadDepartmentChange={handleLeadDepartmentChange}
                leadDepartment={leadDepartment}
                sections={sections}
                onSectionUpdate={handleSectionUpdate}
                approverComments={approverComments}
                onMarkCommentActioned={handleMarkCommentActioned}
                supportingDepartments={supportingDepartments}
                onSupportingDepartmentsChange={setSupportingDepartments}
              />
            )}
          </>
        )}
      </>
    </Layout>
  )
}
