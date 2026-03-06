import { useEffect, useState } from 'react'
import type { Prompt } from '@bastion-os/shared'
import { apiFetch } from '../lib/api.ts'

interface PromptDraft {
  content: string
  dirty: boolean
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [drafts, setDrafts] = useState<Record<string, PromptDraft>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Prompt[]>('/api/admin/prompts')
      .then((data) => {
        setPrompts(data)
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
  }, [])

  function getContent(prompt: Prompt): string {
    return drafts[prompt.id]?.content ?? prompt.content
  }

  function isDirty(prompt: Prompt): boolean {
    return drafts[prompt.id]?.dirty ?? false
  }

  function handleChange(prompt: Prompt, value: string) {
    if (value === prompt.content) {
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
    <div>
      {loading && <p className="text-gray-500 py-4">Loading...</p>}
      {error && <p className="text-red-600 py-4">{error}</p>}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
          {items.map((prompt) => (
            <div key={prompt.id} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <label className="font-medium text-sm text-gray-700">{prompt.display_name}</label>
                {isDirty(prompt) && (
                  <span className="text-xs text-amber-600 italic">Draft</span>
                )}
              </div>
              <textarea
                value={getContent(prompt)}
                onChange={(e) => handleChange(prompt, e.target.value)}
                rows={6}
                className="w-full bg-white border border-gray-200 rounded-lg p-3 font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-y"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleSave(prompt)}
                  disabled={!isDirty(prompt) || saving === prompt.id}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {saving === prompt.id ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => handleCancel(prompt)}
                  disabled={!isDirty(prompt)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {!loading && prompts.length === 0 && !error && (
        <p className="text-gray-500 py-4">No prompts configured.</p>
      )}
    </div>
  )
}
