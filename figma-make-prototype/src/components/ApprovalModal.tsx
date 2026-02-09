import { X, CheckCircle2, Circle, User, MessageSquare, Eye } from 'lucide-react';
import { useState } from 'react';

interface Strategist {
  id: string;
  name: string;
  department: string;
  role: string;
  avatar?: string;
}

interface ApprovalModalProps {
  onClose: () => void;
  onShare: (selectedStrategists: string[], note: string) => void;
  onViewAsApprover?: () => void;
  leadDepartment: string;
  supportingDepartments: string[];
}

export function ApprovalModal({
  onClose,
  onShare,
  onViewAsApprover,
  leadDepartment,
  supportingDepartments
}: ApprovalModalProps) {
  const [selectedStrategists, setSelectedStrategists] = useState<string[]>([]);
  const [note, setNote] = useState('');

  // Mock strategists data - organized by department
  const allStrategists: Strategist[] = [
    { id: '1', name: 'Sarah Chen', department: 'Digital', role: 'Senior Digital Strategist' },
    { id: '2', name: 'Marcus Thompson', department: 'Digital', role: 'Digital Strategy Lead' },
    { id: '3', name: 'Emily Rodriguez', department: 'Digital', role: 'Digital Planner' },
    { id: '4', name: 'Jake Morrison', department: 'Social', role: 'Social Media Strategist' },
    { id: '5', name: 'Priya Patel', department: 'Social', role: 'Senior Social Strategist' },
    { id: '6', name: 'Alex Kim', department: 'Creative', role: 'Creative Strategist' },
    { id: '7', name: 'Jordan Lee', department: 'Creative', role: 'Creative Director' },
    { id: '8', name: 'Taylor Swift', department: 'PR', role: 'PR Strategist' },
    { id: '9', name: 'Chris Martinez', department: 'PR', role: 'Senior PR Manager' },
    { id: '10', name: 'Rachel Green', department: 'Design', role: 'Design Strategy Lead' },
    { id: '11', name: 'David Park', department: 'Design', role: 'UX Strategist' },
    { id: '12', name: 'Olivia Brown', department: 'Experiential', role: 'Experiential Strategist' },
    { id: '13', name: 'Nathan Gray', department: 'Experiential', role: 'Event Strategy Lead' }
  ];

  // Filter strategists to only show those from relevant departments
  const relevantDepartments = [leadDepartment, ...supportingDepartments];
  const relevantStrategists = allStrategists.filter(s => 
    relevantDepartments.includes(s.department)
  );

  // Group strategists by department
  const strategistsByDepartment = relevantStrategists.reduce((acc, strategist) => {
    if (!acc[strategist.department]) {
      acc[strategist.department] = [];
    }
    acc[strategist.department].push(strategist);
    return acc;
  }, {} as Record<string, Strategist[]>);

  const toggleStrategist = (id: string) => {
    setSelectedStrategists(prev =>
      prev.includes(id)
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const handleShare = () => {
    if (selectedStrategists.length === 0) {
      alert('Please select at least one strategist to share with.');
      return;
    }
    onShare(selectedStrategists, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="mb-2">Request Approval</h3>
            <p className="text-sm text-gray-600">
              Select strategists from relevant departments to review this brief
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Department Sections */}
          <div className="space-y-6 mb-6">
            {Object.entries(strategistsByDepartment).map(([department, strategists]) => {
              const isLead = department === leadDepartment;
              
              return (
                <div key={department}>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm">{department}</h4>
                    {isLead && (
                      <span className="px-2 py-0.5 bg-yellow-400 text-black rounded-full text-xs font-medium">
                        Lead
                      </span>
                    )}
                    {!isLead && (
                      <span className="px-2 py-0.5 bg-gray-600 text-white rounded-full text-xs">
                        Supporting
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {strategists.map(strategist => {
                      const isSelected = selectedStrategists.includes(strategist.id);

                      return (
                        <div
                          key={strategist.id}
                          onClick={() => toggleStrategist(strategist.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium">{strategist.name}</p>
                                <p className="text-sm text-gray-600">{strategist.role}</p>
                              </div>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Note Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium">Add a Note (Optional)</label>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any context or specific questions for the reviewers..."
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {selectedStrategists.length} strategist{selectedStrategists.length !== 1 ? 's' : ''} selected
            </p>
            {onViewAsApprover && (
              <button
                onClick={onViewAsApprover}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                Preview as Approver (Demo)
              </button>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              Share Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}