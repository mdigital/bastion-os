import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { apiFetch } from '../lib/api.ts'
import Layout from './Layout.tsx'

interface Client {
  id: string
  name: string
  industry: string | null
}

export default function ClientsPage() {
  const { signOut, userRole } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    apiFetch<Client[]>('/api/admin/clients')
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    setAdding(true)
    setError(null)
    apiFetch<Client>('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
      .then((created) => {
        setClients((prev) => [...prev, created])
        setNewName('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setAdding(false))
  }

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Clients</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {userRole === 'admin' && <Link to="/prompts">Prompts</Link>}
            <button type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>

        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
          <input
            type="text"
            placeholder="Client name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={adding}
            style={{ flex: 1, padding: '6px 8px' }}
          />
          <button type="submit" disabled={adding || !newName.trim()}>
            {adding ? 'Adding...' : 'Add client'}
          </button>
        </form>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {clients.map((c) => (
            <li key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <Link to={`/clients/${c.id}`}>
                {c.name}
                {c.industry && <span style={{ color: '#888', marginLeft: 8 }}>({c.industry})</span>}
              </Link>
            </li>
          ))}
        </ul>

        {!loading && clients.length === 0 && !error && <p>No clients yet.</p>}
      </div>
    </Layout>
  )
}
