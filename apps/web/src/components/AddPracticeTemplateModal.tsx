import { useState, useMemo } from 'react'
import { X, Loader, Search, ChevronDown, ChevronRight } from 'lucide-react'
import type { SectionTemplate, BriefLevel } from '@bastion-os/shared'
import { apiFetch } from '../lib/api'

interface AddPracticeTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onTemplateAdded: () => void | Promise<void>
  practiceId: string
  practiceName: string
  existingBriefLevels: BriefLevel[]
  sectionTemplates: Record<string, SectionTemplate>
}

const BRIEF_LEVEL_OPTIONS: { value: BriefLevel; label: string }[] = [
  { value: 'new_project', label: 'New Project' },
  { value: 'fast_forward', label: 'Fast Forward' },
]

interface SelectedSection {
  section_template_id: string
  required: boolean
}

export default function AddPracticeTemplateModal({
  isOpen,
  onClose,
  onTemplateAdded,
  practiceId,
  practiceName,
  existingBriefLevels,
  sectionTemplates,
}: AddPracticeTemplateModalProps) {
  const availableLevels = BRIEF_LEVEL_OPTIONS.filter(
    (o) => !existingBriefLevels.includes(o.value),
  )

  const [briefLevel, setBriefLevel] = useState<BriefLevel | ''>('')
  const [selectedSections, setSelectedSections] = useState<SelectedSection[]>([])
  const [search, setSearch] = useState('')
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allSections = useMemo(() => {
    return Object.values(sectionTemplates).sort((a, b) => {
      const catCmp = (a.category ?? '').localeCompare(b.category ?? '')
      return catCmp !== 0 ? catCmp : a.name.localeCompare(b.name)
    })
  }, [sectionTemplates])

  const filteredSections = useMemo(() => {
    if (!search.trim()) return allSections
    const q = search.toLowerCase()
    return allSections.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.category ?? '').toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q),
    )
  }, [allSections, search])

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, SectionTemplate[]>()
    for (const s of filteredSections) {
      const cat = s.category ?? 'Uncategorised'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(s)
    }
    return map
  }, [filteredSections])

  const selectedIds = new Set(selectedSections.map((s) => s.section_template_id))

  if (!isOpen) return null

  const handleClose = () => {
    setBriefLevel('')
    setSelectedSections([])
    setSearch('')
    setExpandedPrompt(null)
    setError(null)
    onClose()
  }

  const toggleSection = (id: string) => {
    if (selectedIds.has(id)) {
      setSelectedSections((prev) => prev.filter((s) => s.section_template_id !== id))
    } else {
      setSelectedSections((prev) => [...prev, { section_template_id: id, required: true }])
    }
  }

  const toggleRequired = (id: string) => {
    setSelectedSections((prev) =>
      prev.map((s) =>
        s.section_template_id === id ? { ...s, required: !s.required } : s,
      ),
    )
  }

  const handleSubmit = async () => {
    if (!briefLevel || selectedSections.length === 0) return

    setError(null)
    setIsSubmitting(true)

    try {
      await apiFetch('/api/admin/practice-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practice_id: practiceId,
          brief_level: briefLevel,
          sections: selectedSections,
        }),
      })
      await onTemplateAdded()
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create template')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Add Template</h2>
            <p className="text-sm text-gray-500 mt-0.5">{practiceName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Brief Level */}
          <div>
            <label className="block text-sm font-medium mb-2">Brief Level *</label>
            {availableLevels.length === 0 ? (
              <p className="text-sm text-gray-500">All brief levels already have templates.</p>
            ) : (
              <div className="flex gap-2">
                {availableLevels.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setBriefLevel(o.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      briefLevel === o.value
                        ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section Templates */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Sections * <span className="font-normal text-gray-400">({selectedSections.length} selected)</span>
            </label>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sections..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Selected sections summary */}
            {selectedSections.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {selectedSections.map((sel) => {
                  const tpl = sectionTemplates[sel.section_template_id]
                  if (!tpl) return null
                  return (
                    <span
                      key={sel.section_template_id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-md text-xs"
                    >
                      {tpl.name}
                      <button
                        type="button"
                        onClick={() => toggleRequired(sel.section_template_id)}
                        className={`px-1 rounded ${
                          sel.required
                            ? 'text-yellow-800 font-medium'
                            : 'text-gray-400'
                        }`}
                        title={sel.required ? 'Click to make optional' : 'Click to make required'}
                      >
                        {sel.required ? 'Req' : 'Opt'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSection(sel.section_template_id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* Section list grouped by category */}
            <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto divide-y divide-gray-100">
              {filteredSections.length === 0 ? (
                <p className="text-sm text-gray-400 p-3">No sections match your search.</p>
              ) : (
                Array.from(grouped.entries()).map(([category, sections]) => (
                  <div key={category}>
                    <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide sticky top-0">
                      {category}
                    </div>
                    {sections.map((tpl) => {
                      const isSelected = selectedIds.has(tpl.id)
                      const isExpanded = expandedPrompt === tpl.id
                      return (
                        <div key={tpl.id} className="border-t border-gray-50">
                          <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSection(tpl.id)}
                              className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900">{tpl.name}</span>
                              {tpl.description && (
                                <p className="text-xs text-gray-500 truncate">{tpl.description}</p>
                              )}
                            </div>
                            {(tpl.practice_prompts?.[practiceName] ?? tpl.ai_evaluation_criteria) && (
                              <button
                                type="button"
                                onClick={() => setExpandedPrompt(isExpanded ? null : tpl.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
                                title="View AI prompt"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                          {isExpanded && (tpl.practice_prompts?.[practiceName] ?? tpl.ai_evaluation_criteria) && (
                            <div className="px-3 pb-2 pl-8">
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 font-mono whitespace-pre-wrap">
                                {tpl.practice_prompts?.[practiceName] ?? tpl.ai_evaluation_criteria}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !briefLevel || selectedSections.length === 0}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
            Add Template
          </button>
        </div>
      </div>
    </div>
  )
}
