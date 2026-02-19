import { Database, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import KnowledgeBaseClient from './KnowledgeBaseClient'

// TODO replace with actual clients
const clients = [
  { name: 'Geely Group', sources: 24, dotColorClass: 'bg-blue-500' },
  { name: 'Volvo', sources: 45, dotColorClass: 'bg-indigo-500' },
  { name: 'Acme Corporation', sources: 18, dotColorClass: 'bg-green-500' },
  { name: 'TechStart Inc', sources: 31, dotColorClass: 'bg-purple-500' },
  { name: 'GreenLife Foods', sources: 12, dotColorClass: 'bg-orange-500' },
  { name: 'NordEast group', sources: 22, dotColorClass: 'bg-red-500' },
]

export default function KnowledgeBaseCard() {
  const navigate = useNavigate()
  const visibleClients = clients.slice(0, 4)
  const totalSources = clients.reduce((sum, client) => sum + client.sources, 0)

  return (
    <div className="col-span-12 md:col-span-6 bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all group">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Database className="w-7 h-7 text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">Knowledge Base</h3>
          <p className="text-gray-600 text-sm">Everything you need to know about clients</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {visibleClients.map((client) => (
          <KnowledgeBaseClient
            key={client.name}
            name={client.name}
            sources={client.sources}
            dotColorClass={client.dotColorClass}
          />
        ))}
      </div>

      <button
        type="button"
        className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
        onClick={() => navigate('/')}
      >
        View all clients
      </button>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {clients.length} clients • {totalSources} total sources
        </p>
      </div>
    </div>
  )
}
