import { useEffect, useState } from 'react'
import type { Practice } from '@bastion-os/shared'
import { apiFetch } from '../lib/api.ts'

const EMPTY_FORM = { name: '', color: '#3b82f6', icon: '', description: '', sort_order: 0 }

export default function PracticesPage() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPractices()
  }, [])

  async function loadPractices() {
    try {
      const data = await apiFetch<Practice[]>('/api/admin/practices')
      setPractices(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load practices')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(p: Practice) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      color: p.color ?? '#3b82f6',
      icon: p.icon ?? '',
      description: p.description ?? '',
      sort_order: p.sort_order,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)

    try {
      if (editingId) {
        const updated = await apiFetch<Practice>(`/api/admin/practices/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        setPractices((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setEditingId(null)
      } else {
        const created = await apiFetch<Practice>('/api/admin/practices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        setPractices((prev) => [...prev, created])
      }
      setForm(EMPTY_FORM)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this practice? This cannot be undone.')) return
    setError(null)
    try {
      await apiFetch(`/api/admin/practices/${id}`, { method: 'DELETE' })
      setPractices((prev) => prev.filter((p) => p.id !== id))
      if (editingId === id) cancelEdit()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div>
      <h2>Practices</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Creative"
              style={{ width: 160, padding: '4px 8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>Color</label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              style={{ width: 40, height: 30, padding: 0, border: 'none', cursor: 'pointer' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>Icon</label>
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="emoji"
              style={{ width: 60, padding: '4px 8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              style={{ width: 200, padding: '4px 8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>Order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              style={{ width: 60, padding: '4px 8px' }}
            />
          </div>
          <button type="submit" disabled={saving || !form.name.trim()}>
            {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p>Loading...</p>}

      {!loading && practices.length === 0 && <p>No practices yet. Add one above.</p>}

      {practices.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '8px 4px' }}>Color</th>
              <th style={{ padding: '8px 4px' }}>Icon</th>
              <th style={{ padding: '8px 4px' }}>Name</th>
              <th style={{ padding: '8px 4px' }}>Description</th>
              <th style={{ padding: '8px 4px' }}>Order</th>
              <th style={{ padding: '8px 4px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {practices.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 4px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: p.color ?? '#ccc',
                    }}
                  />
                </td>
                <td style={{ padding: '8px 4px' }}>{p.icon ?? '—'}</td>
                <td style={{ padding: '8px 4px', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '8px 4px', color: '#666', fontSize: 14 }}>{p.description ?? '—'}</td>
                <td style={{ padding: '8px 4px' }}>{p.sort_order}</td>
                <td style={{ padding: '8px 4px', display: 'flex', gap: 4 }}>
                  <button type="button" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(p.id)} style={{ color: 'red' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
