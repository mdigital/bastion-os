import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import type { Practice, PracticeTemplate, SectionTemplate } from '@bastion-os/shared'
import { apiFetch } from '../lib/api.ts'
import AddPracticeAreaModal from '../components/AddPracticeAreaModal.tsx'
import AddPracticeTemplateModal from '../components/AddPracticeTemplateModal.tsx'

const BRIEF_LEVEL_LABELS: Record<string, string> = {
  new_project: 'New Project',
  fast_forward: 'Fast Forward',
}

// Key: "sectionTemplateId:practiceName"
type EditingKey = string

export default function PracticeAreasPage() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [templates, setTemplates] = useState<Record<string, PracticeTemplate[]>>({})
  const [sectionTemplates, setSectionTemplates] = useState<Record<string, SectionTemplate>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addTemplateFor, setAddTemplateFor] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditingKey | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [practicesData, sectionsData] = await Promise.all([
        apiFetch<Practice[]>('/api/admin/practices'),
        apiFetch<SectionTemplate[]>('/api/admin/section-templates'),
      ])

      setPractices(practicesData)

      const sectionsMap: Record<string, SectionTemplate> = {}
      for (const s of sectionsData) sectionsMap[s.id] = s
      setSectionTemplates(sectionsMap)

      // Fetch templates for each practice in parallel
      const templatesMap: Record<string, PracticeTemplate[]> = {}
      await Promise.all(
        practicesData.map(async (p) => {
          const pts = await apiFetch<PracticeTemplate[]>(
            `/api/admin/practice-templates?practice_id=${p.id}`,
          )
          templatesMap[p.id] = pts
        }),
      )
      setTemplates(templatesMap)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function startEditing(tpl: SectionTemplate, practiceName: string) {
    const key = `${tpl.id}:${practiceName}`
    setEditing(key)
    setEditValue(tpl.practice_prompts?.[practiceName] ?? tpl.ai_evaluation_criteria ?? '')
  }

  async function savePrompt(tpl: SectionTemplate, practiceName: string) {
    setSaving(true)
    try {
      const updatedPrompts = { ...tpl.practice_prompts, [practiceName]: editValue }
      await apiFetch(`/api/admin/section-templates/${tpl.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practice_prompts: updatedPrompts }),
      })
      // Update local state
      setSectionTemplates((prev) => ({
        ...prev,
        [tpl.id]: { ...tpl, practice_prompts: updatedPrompts },
      }))
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Practice Area
        </button>
      </div>

      <AddPracticeAreaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPracticeAdded={load}
      />

      {loading && <p className="text-gray-500 py-4">Loading practice areas...</p>}
      {error && <p className="text-red-600 py-4">{error}</p>}
      {!loading && !error && practices.length === 0 && (
        <p className="text-gray-500 py-4">No practice areas configured.</p>
      )}

      {practices.map((practice) => {
        const isOpen = expanded[practice.id] ?? false
        const pts = templates[practice.id] ?? []

        return (
          <div key={practice.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(practice.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              {isOpen ? (
                <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              )}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {practice.color && (
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: practice.color }}
                  />
                )}
                <span className="font-semibold text-gray-900">{practice.name}</span>
                {practice.description && (
                  <span className="text-sm text-gray-500 truncate">{practice.description}</span>
                )}
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {pts.length} template{pts.length !== 1 ? 's' : ''}
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 px-5 pb-5">
                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setAddTemplateFor(practice.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Template
                  </button>
                </div>

                <AddPracticeTemplateModal
                  isOpen={addTemplateFor === practice.id}
                  onClose={() => setAddTemplateFor(null)}
                  onTemplateAdded={load}
                  practiceId={practice.id}
                  practiceName={practice.name}
                  existingBriefLevels={pts.map((pt) => pt.brief_level)}
                  sectionTemplates={sectionTemplates}
                />

                {pts.length === 0 ? (
                  <p className="text-sm text-gray-400 py-3">No templates configured for this practice.</p>
                ) : (
                  pts.map((pt) => (
                    <div key={pt.id} className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        {BRIEF_LEVEL_LABELS[pt.brief_level] ?? pt.brief_level}
                      </h4>
                      <div className="space-y-3">
                        {pt.sections.map((sec) => {
                          const tpl = sectionTemplates[sec.section_template_id]
                          if (!tpl) return null
                          const editKey = `${tpl.id}:${practice.name}`
                          const isEditing = editing === editKey
                          const practicePrompt = tpl.practice_prompts?.[practice.name]
                          const displayPrompt = practicePrompt ?? tpl.ai_evaluation_criteria
                          return (
                            <div
                              key={sec.section_template_id}
                              className="bg-white border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-gray-900">{tpl.name}</span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    sec.required
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {sec.required ? 'Required' : 'Optional'}
                                </span>
                                {tpl.category && (
                                  <span className="text-xs text-gray-400">{tpl.category}</span>
                                )}
                              </div>
                              {tpl.description && (
                                <p className="text-sm text-gray-600 mb-2">{tpl.description}</p>
                              )}
                              <div className="mt-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  AI Evaluation Prompt ({practice.name})
                                </label>
                                {isEditing ? (
                                  <div>
                                    <textarea
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      rows={6}
                                      className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
                                    />
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        type="button"
                                        onClick={() => savePrompt(tpl, practice.name)}
                                        disabled={saving}
                                        className="px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                      >
                                        {saving ? 'Saving...' : 'Save'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditing(null)}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => startEditing(tpl, practice.name)}
                                    className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700 font-mono whitespace-pre-wrap cursor-pointer hover:border-gray-400 transition-colors"
                                    title="Click to edit"
                                  >
                                    {displayPrompt || <span className="text-gray-400 italic">No prompt — click to add</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
