import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { apiFetch } from '../lib/api'
import { KnowledgeBaseClients } from '../components/KnowledgeBaseClients'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

interface Client {
  id: string
  name: string
  industry: string | null
  source_count: number
}

export default function ClientsPage() {
  const { userRole } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleSelectClient = (clientId: string) => {
    navigate(`/clients/${clientId}`)
  }

  const fetchClients = () => {
    setLoading(true)
    setError(null)

    return apiFetch<Client[]>('/api/admin/clients')
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    apiFetch<Client[]>('/api/admin/clients')
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="mx-auto my-10 max-w-350 px-4">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {userRole === 'admin' && <Link to="/admin">Admin</Link>}
        <KnowledgeBaseClients
          clients={clients}
          loading={loading}
          error={error}
          onSelectClient={handleSelectClient}
          onClientAdded={fetchClients}
        />
        {!loading && clients.length === 0 && !error && <p>No clients yet.</p>}
      </div>
    </Layout>
  )
}
