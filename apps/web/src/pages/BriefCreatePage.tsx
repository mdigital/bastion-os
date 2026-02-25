import type { Brief, BriefSection, Practice, Step } from '@bastion-os/shared'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BriefSectionsStep from '../components/BriefSectionsStep'
import DepartmentTriageStep from '../components/DepartmentTriageStep'
import KeyInformationStep from '../components/KeyInformationStep'
import Layout from '../components/Layout'
import ProgressSteps from '../components/ProgressSteps'
import UploadStep from '../components/UploadStep'
import { apiFetch } from '../lib/api.ts'
import { supabase } from '../lib/supabase.ts'
import type { KeyInfo } from '../types/KeyInfo'
import type { SectionData } from '../types/SectionData'

interface ExpandResponse extends Brief {
  sections: BriefSection[]
}

function briefToKeyInfo(brief: Brief, clientName: string): KeyInfo {
  return {
    client: clientName,
    jobToBeDone: brief.job_to_be_done ?? '',
    budget: brief.budget ?? '',
    dueDate: brief.due_date ?? '',
    liveDate: brief.live_date ?? '',
    campaignDuration: brief.campaign_duration ?? '',
    briefLevel: brief.brief_level === 'fast_forward' ? 'Fast Forward Brief' : 'New Project Brief',
  }
}

function apiSectionToSectionData(s: BriefSection): SectionData {
  return {
    title: s.title,
    content: s.content ?? '',
    missing: Array.isArray(s.missing_info) ? (s.missing_info as string[]) : [],
    enhancements: Array.isArray(s.enhancements) ? (s.enhancements as string[]) : [],
    questions: Array.isArray(s.questions) ? (s.questions as string[]) : [],
  }
}

export default function BriefCreatePage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [briefId, setBriefId] = useState<string | null>(null)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [clientName, setClientName] = useState('')
  const [practices, setPractices] = useState<Practice[]>([])
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null)
  const [sections, setSections] = useState<SectionData[]>([])
  const [sectionIds, setSectionIds] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [expanding, setExpanding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch client name and practices on mount
  useEffect(() => {
    if (!clientId) return

    apiFetch<Practice[]>('/api/admin/practices')
      .then(setPractices)
      .catch((e) => console.error('Failed to fetch practices:', e.message))

    // Fetch client name for display
    apiFetch<{ id: string; name: string }>(`/api/admin/clients/${clientId}`)
      .then((c) => setClientName(c.name))
      .catch(() => {
        // Fallback: fetch all clients and find the one we need
        apiFetch<Array<{ id: string; name: string }>>('/api/admin/clients')
          .then((clients) => {
            const client = clients.find((c) => c.id === clientId)
            if (client) setClientName(client.name)
          })
          .catch((e) => console.error('Failed to fetch client:', e.message))
      })
  }, [clientId])

  const keyInfo: KeyInfo = brief
    ? briefToKeyInfo(brief, clientName)
    : {
        client: clientName,
        jobToBeDone: '',
        budget: '',
        dueDate: '',
        liveDate: '',
        campaignDuration: '',
        briefLevel: 'New Project Brief',
      }

  // Step 1: Upload
  async function handleFileUpload(file: File) {
    if (!clientId) return
    setIsUploading(true)
    setError(null)

    try {
      // Create the brief
      const created = await apiFetch<Brief>('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId }),
      })
      setBriefId(created.id)
      setBrief(created)

      // Upload the file via multipart form data
      const formData = new FormData()
      formData.append('file', file)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch(`/api/briefs/${created.id}/files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Upload failed: ${body}`)
      }

      setCurrentStep('keyInfo')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  // Step 2: Key Info
  function handleKeyInfoEdit(field: keyof KeyInfo, value: string) {
    if (!brief) return
    // Update local state optimistically
    const fieldMap: Record<keyof KeyInfo, string> = {
      client: 'client_id',
      jobToBeDone: 'job_to_be_done',
      budget: 'budget',
      dueDate: 'due_date',
      liveDate: 'live_date',
      campaignDuration: 'campaign_duration',
      briefLevel: 'brief_level',
    }

    const apiField = fieldMap[field]
    if (apiField === 'client_id') return // don't change client

    setBrief((prev) => {
      if (!prev) return prev
      return { ...prev, [apiField]: value }
    })
  }

  async function handleKeyInfoNext() {
    if (!briefId || !brief) return
    setError(null)

    try {
      const updated = await apiFetch<Brief>(`/api/briefs/${briefId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_to_be_done: brief.job_to_be_done,
          budget: brief.budget,
          due_date: brief.due_date,
          live_date: brief.live_date,
          campaign_duration: brief.campaign_duration,
        }),
      })
      setBrief(updated)
      setCurrentStep('triage')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save key info')
    }
  }

  // Step 3: Triage — select practice, then expand
  async function handleTriageNext() {
    if (!briefId || !selectedPracticeId) return
    setError(null)

    try {
      // Save selected practice
      const updated = await apiFetch<Brief>(`/api/briefs/${briefId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_practice_id: selectedPracticeId }),
      })
      setBrief(updated)
      setCurrentStep('sections')

      // Start expansion
      setExpanding(true)
      const expanded = await apiFetch<ExpandResponse>(`/api/briefs/${briefId}/expand`, {
        method: 'POST',
      })
      setBrief(expanded)
      setSections(expanded.sections.map(apiSectionToSectionData))
      setSectionIds(expanded.sections.map((s) => s.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Expansion failed')
    } finally {
      setExpanding(false)
    }
  }

  // Step 4: Section editing
  function handleSectionUpdate(index: number, content: string) {
    setSections((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], content }
      return updated
    })

    // Save to API in background
    const sectionId = sectionIds[index]
    if (sectionId && briefId) {
      apiFetch(`/api/briefs/${briefId}/sections/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }).catch((e) => console.error('Failed to save section:', e.message))
    }
  }

  const selectedPracticeName =
    practices.find((p) => p.id === selectedPracticeId)?.name ?? ''

  return (
    <Layout>
      <>
        <ProgressSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />

        {error && (
          <div className="max-w-2xl mx-auto px-8 mt-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700 font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {currentStep === 'upload' && (
          <UploadStep onUpload={handleFileUpload} isUploading={isUploading} />
        )}

        {currentStep === 'keyInfo' && (
          <KeyInformationStep
            keyInfo={keyInfo}
            onNext={handleKeyInfoNext}
            onEdit={handleKeyInfoEdit}
            onBack={() => setCurrentStep('upload')}
          />
        )}

        {currentStep === 'triage' && (
          <DepartmentTriageStep
            practices={practices.map((p) => ({ id: p.id, name: p.name }))}
            selectedPracticeId={selectedPracticeId}
            rationale="Select the practice area that best matches this brief. The AI will use the practice's section template to expand the brief."
            onPracticeSelect={setSelectedPracticeId}
            onNext={handleTriageNext}
            onBack={() => setCurrentStep('keyInfo')}
          />
        )}

        {currentStep === 'sections' && expanding && (
          <div className="max-w-2xl mx-auto px-8 py-24 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-8" />
            <h2 className="mb-4">Expanding your brief...</h2>
            <p className="text-gray-700">
              Our AI is analysing your brief and generating enhanced sections. This may take 15-30 seconds.
            </p>
          </div>
        )}

        {currentStep === 'sections' && !expanding && sections.length > 0 && (
          <BriefSectionsStep
            keyInfo={keyInfo}
            leadDepartment={selectedPracticeName}
            sections={sections}
            onSectionUpdate={handleSectionUpdate}
            supportingDepartments={[]}
          />
        )}

        {currentStep === 'sections' && !expanding && sections.length === 0 && !error && (
          <div className="max-w-2xl mx-auto px-8 py-24 text-center">
            <p className="text-gray-500">No sections yet. The expansion may still be processing.</p>
          </div>
        )}

        {/* Back to clients link */}
        <div className="max-w-2xl mx-auto px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to clients
          </button>
        </div>
      </>
    </Layout>
  )
}
