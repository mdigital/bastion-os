import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { apiFetch } from '../lib/api.ts'

interface Client {
  id: string
  name: string
  industry: string | null
}

export default function ClientsPage() {
  const { signOut } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Client[]>('/api/admin/clients')
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Clients</h1>
        <button type="button" onClick={signOut}>
          Sign out
        </button>
      </div>

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
  )
}
