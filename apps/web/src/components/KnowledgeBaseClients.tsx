import { Search, Plus, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import AddClientModal from './AddClientModal'

interface Client {
  id: string
  name: string
  industry: string | null
}

interface KnowledgeBaseClientsProps {
  clients: Client[]
  loading: boolean
  error: string | null
  onSelectClient: (clientId: string) => void
  onClientAdded: () => void | Promise<void>
}

const folderColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
]

export function KnowledgeBaseClients({
  clients,
  loading,
  error,
  onSelectClient,
  onClientAdded,
}: KnowledgeBaseClientsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase()
    return (
      client.name.toLowerCase().includes(query) ||
      (client.industry ?? '').toLowerCase().includes(query)
    )
  })

  const handleClientAdded = () => {
    void onClientAdded()
  }

  return (
    <div>
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-2">Client Knowledge Bases</h2>
            <p className="text-gray-600">
              Access comprehensive client information, documents, and AI-generated insights
            </p>
          </div>
          <button
            onClick={() => setIsAddClientModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {loading ? <p>Loading clients...</p> : null}
      {!loading && error ? <p className="text-red-600">{error}</p> : null}
      {!loading && !error && filteredClients.length === 0 ? (
        <p className="text-gray-600">No clients found.</p>
      ) : null}

      {!loading && !error && filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg"
            >
              <div className="mb-2 flex items-start gap-4">
                <div
                  className={`h-12 w-12 ${folderColors[index % folderColors.length]} shrink-0 rounded-lg text-white transition-transform group-hover:scale-110 flex items-center justify-center`}
                >
                  <FolderOpen className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 truncate font-bold">{client.name}</h3>
                  <p className="text-sm text-gray-600">
                    {client.industry ?? 'Unspecified industry'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onClientAdded={handleClientAdded}
      />
    </div>
  )
}
