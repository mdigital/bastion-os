import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Prompt } from '@bastion-os/shared'
import { useAuth } from '../contexts/AuthContext.tsx'
import { apiFetch } from '../lib/api.ts'

interface PromptDraft {
  content: string
  dirty: boolean
}

export default function PromptsPage() {
  const { userRole, signOut } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [drafts, setDrafts] = useState<Record<string, PromptDraft>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (userRole !== 'admin') {
      setLoading(false)
      return
    }

    apiFetch<Prompt[]>('/api/admin/prompts')
      .then((data) => {
        setPrompts(data)
        // Restore drafts from localStorage
        const restored: Record<string, PromptDraft> = {}
        for (const p of data) {
          const stored = localStorage.getItem(`bastion-prompt-draft-${p.id}`)
          if (stored !== null && stored !== p.content) {
            restored[p.id] = { content: stored, dirty: true }
          }
        }
        setDrafts(restored)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userRole])

  if (userRole !== 'admin') {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
        <p>Not authorised</p>
        <Link to="/">Back to home</Link>
      </div>
    )
  }

  function getContent(prompt: Prompt): string {
    return drafts[prompt.id]?.content ?? prompt.content
  }

  function isDirty(prompt: Prompt): boolean {
    return drafts[prompt.id]?.dirty ?? false
  }

  function handleChange(prompt: Prompt, value: string) {
    if (value === prompt.content) {
      // Content matches DB — clear draft
      localStorage.removeItem(`bastion-prompt-draft-${prompt.id}`)
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[prompt.id]
        return next
      })
    } else {
      localStorage.setItem(`bastion-prompt-draft-${prompt.id}`, value)
      setDrafts((prev) => ({
        ...prev,
        [prompt.id]: { content: value, dirty: true },
      }))
    }
  }

  async function handleSave(prompt: Prompt) {
    const content = getContent(prompt)
    setSaving(prompt.id)
    setError(null)
    try {
      const updated = await apiFetch<Prompt>(`/api/admin/prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      setPrompts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      localStorage.removeItem(`bastion-prompt-draft-${prompt.id}`)
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[prompt.id]
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  function handleCancel(prompt: Prompt) {
    localStorage.removeItem(`bastion-prompt-draft-${prompt.id}`)
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[prompt.id]
      return next
    })
  }

  // Group prompts by category
  const grouped: Record<string, Prompt[]> = {}
  for (const p of prompts) {
    if (!grouped[p.category]) grouped[p.category] = []
    grouped[p.category].push(p)
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Prompts</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/">Home</Link>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 32 }}>
          <h2>{category}</h2>
          {items.map((prompt) => (
            <div key={prompt.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <label style={{ fontWeight: 'bold' }}>{prompt.display_name}</label>
                {isDirty(prompt) && (
                  <span style={{ fontSize: 12, color: '#b45309', fontStyle: 'italic' }}>Draft</span>
                )}
              </div>
              <textarea
                value={getContent(prompt)}
                onChange={(e) => handleChange(prompt, e.target.value)}
                rows={6}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, padding: 8 }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => handleSave(prompt)}
                  disabled={!isDirty(prompt) || saving === prompt.id}
                >
                  {saving === prompt.id ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => handleCancel(prompt)} disabled={!isDirty(prompt)}>
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {!loading && prompts.length === 0 && !error && <p>No prompts configured.</p>}
    </div>
  )
}
