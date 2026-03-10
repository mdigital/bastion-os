import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api.ts'

interface Organisation {
  id: string
  settings: Record<string, unknown> | null
}

export default function SettingsPage() {
  const [delayMs, setDelayMs] = useState(1000)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Organisation>('/api/admin/organisation')
      .then((org) => {
        const val = org.settings?.gemini_delay_ms
        if (typeof val === 'number') setDelayMs(val)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const org = await apiFetch<Organisation>('/api/admin/organisation')
      const currentSettings = org.settings ?? {}
      await apiFetch('/api/admin/organisation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: { ...currentSettings, gemini_delay_ms: delayMs },
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-500 py-4">Loading settings...</p>

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gemini API</h2>

        <div className="max-w-sm">
          <label htmlFor="gemini-delay" className="block text-sm font-medium text-gray-700 mb-1">
            Delay between API calls (ms)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Adds a pause between Gemini API calls during brief analysis to avoid rate-limit errors.
          </p>
          <input
            id="gemini-delay"
            type="number"
            min={0}
            max={10000}
            step={100}
            value={delayMs}
            onChange={(e) => setDelayMs(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  )
}
