import { useState } from 'react';
import { ArrowLeft, Users, Building2, FolderKanban, FileText } from 'lucide-react';
import { AdminSection } from './AdminSection';
import { OrganisationManagement } from './OrganisationManagement';
import { DepartmentManagement } from './DepartmentManagement';
import { BriefSectionsManagement } from './BriefSectionsManagement';

interface AdminContainerProps {
  onBack: () => void;
}

export function AdminContainer({ onBack }: AdminContainerProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'organisations' | 'departments' | 'sections'>('users');

  const tabs = [
    { id: 'users' as const, label: 'User Management', icon: Users },
    { id: 'organisations' as const, label: 'Organisations', icon: Building2 },
    { id: 'departments' as const, label: 'Practice Areas', icon: FolderKanban },
    { id: 'sections' as const, label: 'Brief Sections', icon: FileText },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <h1 className="mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage users, organisations, practice areas and brief sections
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 mb-6 p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
                  isActive
                    ? 'bg-yellow-400 text-black shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'users' && <AdminSection />}
        {activeTab === 'organisations' && <OrganisationManagement />}
        {activeTab === 'departments' && <DepartmentManagement />}
        {activeTab === 'sections' && <BriefSectionsManagement />}
      </div>
    </div>
  );
}