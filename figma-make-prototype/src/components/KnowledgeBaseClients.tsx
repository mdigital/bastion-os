import { Search, Plus, FolderOpen, FileText, Calendar, User } from 'lucide-react';
import { useState } from 'react';
import { AddClientModal } from './AddClientModal';

interface Client {
  id: string;
  name: string;
  industry: string;
  lastUpdated: string;
  sourceCount: number;
  notebookCount: number;
  color: string;
}

interface KnowledgeBaseClientsProps {
  onSelectClient: (clientId: string) => void;
}

export function KnowledgeBaseClients({ onSelectClient }: KnowledgeBaseClientsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  const clients: Client[] = [
    {
      id: '1',
      name: 'Geely Group',
      industry: 'Automotive',
      lastUpdated: '2 hours ago',
      sourceCount: 24,
      notebookCount: 8,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Acme Corporation',
      industry: 'Sustainability',
      lastUpdated: '1 day ago',
      sourceCount: 18,
      notebookCount: 12,
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'TechStart Inc',
      industry: 'Technology/SaaS',
      lastUpdated: '3 days ago',
      sourceCount: 31,
      notebookCount: 15,
      color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'GreenLife Foods',
      industry: 'Food & Beverage',
      lastUpdated: '5 days ago',
      sourceCount: 12,
      notebookCount: 6,
      color: 'bg-yellow-500'
    },
    {
      id: '5',
      name: 'NordEast Group',
      industry: 'Retail',
      lastUpdated: '1 week ago',
      sourceCount: 22,
      notebookCount: 9,
      color: 'bg-red-500'
    },
    {
      id: '6',
      name: 'Volvo',
      industry: 'Automotive',
      lastUpdated: '1 week ago',
      sourceCount: 45,
      notebookCount: 18,
      color: 'bg-indigo-500'
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientAdded = () => {
    // In production, this would refresh the client list from the database
    console.log('Client added, refreshing list...');
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="mb-2">Client Knowledge Bases</h2>
            <p className="text-gray-600">Access comprehensive client information, documents, and AI-generated insights</p>
          </div>
          <button 
            onClick={() => setIsAddClientModalOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <div
            key={client.id}
            onClick={() => onSelectClient(client.id)}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
          >
            {/* Client Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 ${client.color} rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold mb-1 truncate">{client.name}</h3>
                <p className="text-sm text-gray-600">{client.industry}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <FileText className="w-4 h-4" />
                  <p className="text-xs">Sources</p>
                </div>
                <p className="font-bold">{client.sourceCount}</p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
              <Calendar className="w-4 h-4" />
              <span>Updated {client.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onClientAdded={handleClientAdded}
      />
    </div>
  );
}