import { useState } from 'react';
import { Building2, Plus, Search, MoreVertical, Edit2, Trash2, Users, FileText, Calendar } from 'lucide-react';
import { AddOrganisationModal } from './AddOrganisationModal';

interface Organisation {
  id: string;
  name: string;
  industry: string;
  country: string;
  activeUsers: number;
  activeBriefs: number;
  addedDate: string;
}

const mockOrganisations: Organisation[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    industry: 'Technology',
    country: 'USA',
    activeUsers: 3,
    activeBriefs: 5,
    addedDate: '2025-01-15'
  },
  {
    id: '2',
    name: 'TechStart Inc',
    industry: 'Software',
    country: 'USA',
    activeUsers: 2,
    activeBriefs: 3,
    addedDate: '2025-02-10'
  },
  {
    id: '3',
    name: 'GreenLife Foods',
    industry: 'Food & Beverage',
    country: 'Australia',
    activeUsers: 2,
    activeBriefs: 4,
    addedDate: '2025-03-05'
  },
  {
    id: '4',
    name: 'Volvo',
    industry: 'Automotive',
    country: 'China',
    activeUsers: 3,
    activeBriefs: 6,
    addedDate: '2025-01-20'
  },
  {
    id: '5',
    name: 'Geely',
    industry: 'Automotive',
    country: 'China',
    activeUsers: 2,
    activeBriefs: 3,
    addedDate: '2025-02-15'
  },
  {
    id: '6',
    name: 'Tower Insurance',
    industry: 'Insurance',
    country: 'New Zealand',
    activeUsers: 2,
    activeBriefs: 5,
    addedDate: '2025-03-01'
  },
  {
    id: '7',
    name: 'Healthy Paws Veterinary',
    industry: 'Healthcare',
    country: 'Australia',
    activeUsers: 1,
    activeBriefs: 2,
    addedDate: '2025-04-10'
  },
  {
    id: '8',
    name: 'Urban Eats',
    industry: 'Food & Beverage',
    country: 'New Zealand',
    activeUsers: 1,
    activeBriefs: 1,
    addedDate: '2025-05-15'
  },
  {
    id: '9',
    name: 'FitTech Solutions',
    industry: 'Health & Fitness',
    country: 'USA',
    activeUsers: 1,
    activeBriefs: 2,
    addedDate: '2025-06-01'
  }
];

export function OrganisationManagement() {
  const [organisations, setOrganisations] = useState<Organisation[]>(mockOrganisations);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrganisation, setEditingOrganisation] = useState<Organisation | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrganisationMenu, setSelectedOrganisationMenu] = useState<string | null>(null);

  const filteredOrganisations = organisations.filter(organisation =>
    organisation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    organisation.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddOrganisation = (organisationData: Omit<Organisation, 'id' | 'activeUsers' | 'activeBriefs' | 'addedDate'>) => {
    const newOrganisation: Organisation = {
      ...organisationData,
      id: `organisation-${Date.now()}`,
      activeUsers: 0,
      activeBriefs: 0,
      addedDate: new Date().toISOString()
    };
    setOrganisations([...organisations, newOrganisation]);
    setShowAddModal(false);
  };

  const handleEditOrganisation = (organisation: Organisation) => {
    setEditingOrganisation(organisation);
    setShowEditModal(true);
    setSelectedOrganisationMenu(null);
  };

  const handleUpdateOrganisation = (updatedOrganisation: Organisation) => {
    setOrganisations(organisations.map(o => o.id === updatedOrganisation.id ? updatedOrganisation : o));
    setShowEditModal(false);
    setEditingOrganisation(null);
  };

  const handleDeleteOrganisation = (organisationId: string) => {
    const organisation = organisations.find(o => o.id === organisationId);
    if (organisation && organisation.activeUsers > 0) {
      alert(`Cannot delete ${organisation.name} - it has ${organisation.activeUsers} active user(s). Please reassign users first.`);
      return;
    }
    if (confirm('Are you sure you want to delete this organisation? This action cannot be undone.')) {
      setOrganisations(organisations.filter(o => o.id !== organisationId));
      setSelectedOrganisationMenu(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Organisation Management</h2>
          <p className="text-sm text-gray-600">Add, edit, and manage client organisations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Organisation
        </button>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search organisations by name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* Organisations Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Organisation</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Industry</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Country</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Team Members</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Active Briefs</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Added</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrganisations.map((organisation) => (
              <tr key={organisation.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {organisation.name.charAt(0)}
                    </div>
                    <p className="font-bold">{organisation.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {organisation.industry}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {organisation.country}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-bold">{organisation.activeUsers}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="font-bold">{organisation.activeBriefs}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(organisation.addedDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setSelectedOrganisationMenu(selectedOrganisationMenu === organisation.id ? null : organisation.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {selectedOrganisationMenu === organisation.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleEditOrganisation(organisation)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Organisation
                          </button>
                          <button
                            onClick={() => handleDeleteOrganisation(organisation.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Organisation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrganisations.length === 0 && (
          <div className="py-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No organisations found matching your search</p>
          </div>
        )}
      </div>

      {/* Add Organisation Modal */}
      {showAddModal && (
        <AddOrganisationModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddOrganisation}
        />
      )}

      {/* Edit Organisation Modal */}
      {showEditModal && editingOrganisation && (
        <AddOrganisationModal
          onClose={() => {
            setShowEditModal(false);
            setEditingOrganisation(null);
          }}
          onAdd={(organisationData) => {
            handleUpdateOrganisation({
              ...editingOrganisation,
              ...organisationData
            });
          }}
          editMode={true}
          existingOrganisation={editingOrganisation}
        />
      )}
    </div>
  );
}
