import { useState } from 'react';
import { FolderKanban, Plus, Edit2, Trash2, ChevronDown, ChevronRight, FileText, GripVertical } from 'lucide-react';
import { EditDepartmentModal } from './EditDepartmentModal';
import { practiceAreas } from '../data/practiceTemplates';

interface BriefSection {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

interface BriefTemplate {
  id: string;
  name: string;
  description: string;
  sections: BriefSection[];
}

interface Department {
  id: string;
  name: string;
  color: string;
  icon: string;
  briefTemplates: BriefTemplate[];
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>(practiceAreas);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setShowEditModal(true);
  };

  const handleUpdateDepartment = (updatedDepartment: Department) => {
    setDepartments(departments.map(d => d.id === updatedDepartment.id ? updatedDepartment : d));
    setShowEditModal(false);
    setEditingDepartment(null);
  };

  const handleAddDepartment = (newDepartment: Department) => {
    setDepartments([...departments, newDepartment]);
    setShowEditModal(false);
  };

  const handleDeleteDepartment = (departmentId: string) => {
    if (confirm('Are you sure you want to delete this practice area? This will affect all existing briefs that use this practice area.')) {
      setDepartments(departments.filter(d => d.id !== departmentId));
    }
  };

  const toggleDepartmentExpansion = (departmentId: string) => {
    setExpandedDepartment(expandedDepartment === departmentId ? null : departmentId);
  };

  const toggleTemplateExpansion = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Practice Area Management</h2>
          <p className="text-sm text-gray-600">Manage practice areas and their brief section requirements</p>
        </div>
        <button
          onClick={() => {
            setEditingDepartment(null);
            setShowEditModal(true);
          }}
          className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Practice Area
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FolderKanban className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-blue-900 mb-1">How it works</p>
            <p className="text-sm text-blue-800">
              Each practice area has a standard set of brief sections. When creating a brief, users select a practice area which automatically includes the relevant sections for that brief type. Required sections must be completed before the brief can be finalised.
            </p>
          </div>
        </div>
      </div>

      {/* Departments List */}
      <div className="space-y-4">
        {departments.map((department) => {
          const isDepartmentExpanded = expandedDepartment === department.id;
          const template = department.briefTemplates[0]; // Each practice has only one template now
          const totalSections = template.sections.length;
          const totalRequired = template.sections.filter(s => s.required).length;
          
          return (
            <div
              key={department.id}
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden"
            >
              {/* Department Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: `${department.color}20` }}
                    >
                      {department.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg">{department.name}</h3>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: department.color }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {totalSections} sections • {totalRequired} required
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleDepartmentExpansion(department.id)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      {isDepartmentExpanded ? (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Hide Sections
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4" />
                          View Sections
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEditDepartment(department)}
                      className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sections List (Expandable) */}
              {isDepartmentExpanded && (
                <div className="border-t border-gray-200 bg-gray-50/50">
                  <div className="p-6 space-y-2">
                    {template.sections.map((section, index) => (
                      <div
                        key={section.id}
                        className="bg-white rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 pt-0.5">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-bold text-gray-500 min-w-[20px]">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-sm">{section.name}</h5>
                                {section.required && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                    Required
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">{section.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit/Add Department Modal */}
      {showEditModal && (
        <EditDepartmentModal
          onClose={() => {
            setShowEditModal(false);
            setEditingDepartment(null);
          }}
          onSave={editingDepartment ? handleUpdateDepartment : handleAddDepartment}
          existingDepartment={editingDepartment}
        />
      )}
    </div>
  );
}
