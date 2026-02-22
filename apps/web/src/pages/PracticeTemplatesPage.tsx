import { useEffect, useState } from 'react'
import type { Practice, PracticeTemplate, SectionTemplate, BriefLevel } from '@bastion-os/shared'
import { apiFetch } from '../lib/api.ts'

export default function PracticeTemplatesPage() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [templates, setTemplates] = useState<PracticeTemplate[]>([])
  const [sectionTemplates, setSectionTemplates] = useState<SectionTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Selection state
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<BriefLevel>('new_project')

  // Editing state: the sections for the current practice+level
  const [editSections, setEditSections] = useState<Array<{ section_template_id: string; required: boolean }>>([])
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch<Practice[]>('/api/admin/practices'),
      apiFetch<PracticeTemplate[]>('/api/admin/practice-templates'),
      apiFetch<SectionTemplate[]>('/api/admin/section-templates'),
    ])
      .then(([p, t, s]) => {
        setPractices(p)
        setTemplates(t)
        setSectionTemplates(s)
        if (p.length > 0) setSelectedPracticeId(p[0].id)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  // When selection changes, load the matching template sections
  useEffect(() => {
    if (!selectedPracticeId) return
    const existing = templates.find(
      (t) => t.practice_id === selectedPracticeId && t.brief_level === selectedLevel,
    )
    setEditSections(existing?.sections ?? [])
    setDirty(false)
  }, [selectedPracticeId, selectedLevel, templates])

  function addSection(templateId: string) {
    if (editSections.some((s) => s.section_template_id === templateId)) return
    setEditSections([...editSections, { section_template_id: templateId, required: true }])
    setDirty(true)
  }

  function removeSection(templateId: string) {
    setEditSections(editSections.filter((s) => s.section_template_id !== templateId))
    setDirty(true)
  }

  function toggleRequired(templateId: string) {
    setEditSections(
      editSections.map((s) =>
        s.section_template_id === templateId ? { ...s, required: !s.required } : s,
      ),
    )
    setDirty(true)
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= editSections.length) return
    const next = [...editSections]
    ;[next[index], next[target]] = [next[target], next[index]]
    setEditSections(next)
    setDirty(true)
  }

  async function handleSave() {
    if (!selectedPracticeId) return
    setSaving(true)
    setError(null)

    const existing = templates.find(
      (t) => t.practice_id === selectedPracticeId && t.brief_level === selectedLevel,
    )

    try {
      if (existing) {
        const updated = await apiFetch<PracticeTemplate>(
          `/api/admin/practice-templates/${existing.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sections: editSections }),
          },
        )
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      } else {
        const created = await apiFetch<PracticeTemplate>('/api/admin/practice-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            practice_id: selectedPracticeId,
            brief_level: selectedLevel,
            sections: editSections,
          }),
        })
        setTemplates((prev) => [...prev, created])
      }
      setDirty(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // Group section templates by category for the picker
  const grouped: Record<string, SectionTemplate[]> = {}
  for (const st of sectionTemplates) {
    const cat = st.category ?? 'Uncategorized'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(st)
  }

  // IDs already assigned
  const assignedIds = new Set(editSections.map((s) => s.section_template_id))

  // Resolve template name
  function templateName(id: string): string {
    return sectionTemplates.find((st) => st.id === id)?.name ?? id
  }

  return (
    <div>
      <h2>Practice Templates</h2>
      <p style={{ color: '#666', fontSize: 14, marginTop: -8 }}>
        Configure which sections appear for each practice and brief level.
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          {/* Selectors */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>Practice</label>
              <select
                value={selectedPracticeId}
                onChange={(e) => setSelectedPracticeId(e.target.value)}
                style={{ padding: '4px 8px', minWidth: 200 }}
              >
                {practices.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon ? `${p.icon} ` : ''}{p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>Brief Level</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['new_project', 'fast_forward'] as BriefLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedLevel(level)}
                    style={{
                      padding: '4px 12px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      background: selectedLevel === level ? '#2563eb' : '#fff',
                      color: selectedLevel === level ? '#fff' : '#333',
                      cursor: 'pointer',
                    }}
                  >
                    {level === 'new_project' ? 'New Project' : 'Fast Forward'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {practices.length === 0 && (
            <p>No practices yet. Create practices first in the Practices tab.</p>
          )}

          {practices.length > 0 && (
            <div style={{ display: 'flex', gap: 24 }}>
              {/* Assigned sections */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>
                  Assigned Sections ({editSections.length})
                </h3>
                {editSections.length === 0 && (
                  <p style={{ color: '#999', fontSize: 14 }}>
                    No sections assigned. Add from the list on the right.
                  </p>
                )}
                {editSections.map((s, i) => (
                  <div
                    key={s.section_template_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 8px',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <span style={{ fontWeight: 500, flex: 1 }}>{templateName(s.section_template_id)}</span>
                    <button
                      type="button"
                      onClick={() => toggleRequired(s.section_template_id)}
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 3,
                        border: '1px solid #ddd',
                        background: s.required ? '#dcfce7' : '#fef3c7',
                        cursor: 'pointer',
                      }}
                    >
                      {s.required ? 'Required' : 'Optional'}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(i, -1)}
                      disabled={i === 0}
                      style={{ padding: '2px 6px', cursor: 'pointer' }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(i, 1)}
                      disabled={i === editSections.length - 1}
                      style={{ padding: '2px 6px', cursor: 'pointer' }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(s.section_template_id)}
                      style={{ color: 'red', cursor: 'pointer', padding: '2px 6px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  <button type="button" onClick={handleSave} disabled={!dirty || saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  {dirty && <span style={{ marginLeft: 8, fontSize: 12, color: '#b45309' }}>Unsaved changes</span>}
                </div>
              </div>

              {/* Available sections picker */}
              <div style={{ flex: 1, maxHeight: 500, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Available Sections</h3>
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category} style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{category}</h4>
                    {items.map((st) => {
                      const assigned = assignedIds.has(st.id)
                      return (
                        <div
                          key={st.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 0',
                            opacity: assigned ? 0.4 : 1,
                          }}
                        >
                          <span style={{ fontSize: 14 }}>{st.name}</span>
                          <button
                            type="button"
                            onClick={() => addSection(st.id)}
                            disabled={assigned}
                            style={{ fontSize: 12, cursor: assigned ? 'default' : 'pointer' }}
                          >
                            {assigned ? 'Added' : '+ Add'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
