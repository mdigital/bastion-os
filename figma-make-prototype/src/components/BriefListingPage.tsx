import { useState } from 'react';
import { Plus, Search, FileText, Calendar, DollarSign, User, HelpCircle, X, ChevronLeft, ChevronRight, Archive, ArchiveRestore } from 'lucide-react';

interface SavedBrief {
  id: string;
  client: string;
  jobToBeDone: string;
  budget: string;
  dueDate: string;
  status: 'draft' | 'finalized';
  lastModified: string;
  leadDepartment: string;
  archived?: boolean;
}

interface BriefListingPageProps {
  briefs: SavedBrief[];
  onSelectBrief: (id: string) => void;
  onNewBrief: () => void;
  onArchiveBrief?: (id: string) => void;
  onUnarchiveBrief?: (id: string) => void;
}

export function BriefListingPage({ briefs, onSelectBrief, onNewBrief, onArchiveBrief, onUnarchiveBrief }: BriefListingPageProps) {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const briefsPerPage = 20;

  const getStatusColor = (status: string) => {
    return status === 'finalized' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter briefs based on all criteria
  const filteredBriefs = briefs.filter(brief => {
    const matchesSearch = searchTerm === '' || 
      brief.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.jobToBeDone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.leadDepartment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || brief.status === statusFilter;
    const matchesDepartment = departmentFilter === '' || brief.leadDepartment === departmentFilter;
    const matchesClient = clientFilter === '' || brief.client === clientFilter;
    const matchesArchived = showArchived || !brief.archived;

    return matchesSearch && matchesStatus && matchesDepartment && matchesClient && matchesArchived;
  });

  // Get unique clients for filter dropdown
  const uniqueClients = Array.from(new Set(briefs.map(b => b.client))).sort();

  // Pagination
  const totalPages = Math.ceil(filteredBriefs.length / briefsPerPage);
  const startIndex = (currentPage - 1) * briefsPerPage;
  const endIndex = startIndex + briefsPerPage;
  const currentBriefs = filteredBriefs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (filterSetter: (value: string) => void, value: string) => {
    filterSetter(value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1>Client briefs</h1>
              <button
                onClick={() => setShowHelpModal(true)}
                className="text-yellow-600 hover:text-yellow-700 transition-colors flex items-center gap-1 text-sm"
              >
                <HelpCircle className="w-5 h-5" />
                <span>How this tool works</span>
              </button>
            </div>
            <p className="text-gray-700">View and manage all your client briefs</p>
          </div>
          <button
            onClick={onNewBrief}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Brief
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search briefs by client name, department, or job..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select 
            value={clientFilter}
            onChange={(e) => handleFilterChange(setClientFilter, e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All Clients</option>
            {uniqueClients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
          </select>
          <select 
            value={departmentFilter}
            onChange={(e) => handleFilterChange(setDepartmentFilter, e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All Departments</option>
            <option value="Social">Social</option>
            <option value="PR">PR</option>
            <option value="Creative">Creative</option>
            <option value="Design">Design</option>
            <option value="Digital">Digital</option>
            <option value="Experiential">Experiential</option>
          </select>
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-700">Show archived:</label>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={() => setShowArchived(!showArchived)}
              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Briefs List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Client</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Budget</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Modified</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentBriefs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">
                      {filteredBriefs.length === 0 && briefs.length > 0 
                        ? 'No briefs match your filters' 
                        : 'No briefs yet'}
                    </p>
                    {briefs.length === 0 && (
                      <button
                        onClick={onNewBrief}
                        className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                      >
                        Create Your First Brief
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentBriefs.map((brief) => (
                  <tr
                    key={brief.id}
                    onClick={() => onSelectBrief(brief.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{brief.client}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 max-w-md truncate">{brief.jobToBeDone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {brief.budget}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(brief.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {brief.leadDepartment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(brief.status)}`}>
                        {brief.status === 'draft' ? 'Draft' : 'Finalized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(brief.lastModified)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {onArchiveBrief && !brief.archived && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onArchiveBrief(brief.id);
                            }}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <Archive className="w-5 h-5" />
                          </button>
                        )}
                        {onUnarchiveBrief && brief.archived && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnarchiveBrief(brief.id);
                            }}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <ArchiveRestore className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredBriefs.length > briefsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredBriefs.length)} of {filteredBriefs.length} briefs
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-yellow-400 text-black'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3>How This Tool Works</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gradient-to-r from-yellow-50 to-bone border-l-4 border-yellow-400 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-6">
                      The Client Brief Clarifier and Enhancer validates that you have all the information needed to make sound strategic decisions. 
                      This tool does <strong>not</strong> suggest what strategy should be used—it ensures clarity before strategic work begins.
                    </p>
                    
                    {/* Timeline Steps */}
                    <div className="space-y-4">
                      {/* Step 1 */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Receive Client Brief</h4>
                          <p className="text-sm text-gray-700">Upload the initial brief received from your client to begin the clarification process.</p>
                        </div>
                      </div>
                      
                      {/* Step 2 */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Clarify and Enhance</h4>
                          <p className="text-sm text-gray-700">The AI analyses the brief and highlights any missing information or areas that need clarification to ensure you have everything needed for strategic planning.</p>
                        </div>
                      </div>
                      
                      {/* Step 3 */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold text-gray-600">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Strategic Response <span className="text-xs text-gray-500 font-normal">(optional)</span></h4>
                          <p className="text-sm text-gray-700">Once the brief is clarified, your team can develop the strategic response using the enhanced brief as a foundation.</p>
                        </div>
                      </div>
                      
                      {/* Step 4 */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-bold">4</span>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Create Practice Brief</h4>
                          <p className="text-sm text-gray-700">Finalise the enhanced brief ready to share with your team and begin execution.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200 rounded-b-2xl">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}