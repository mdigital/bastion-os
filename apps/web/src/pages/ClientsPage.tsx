import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { apiFetch } from '../lib/api'
import { KnowledgeBaseClients } from '../components/KnowledgeBaseClients'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

interface Client {
  id: string
  name: string
  industry: string | null
}

export default function ClientsPage() {
  const { userRole } = useAuth()
  const [, setSelectedClient] = useState<string | null>(null)
  const [, setClientName] = useState<string>('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)

    setSelectedClient(clientId)
    setClientName(client?.name ?? 'Client')
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
