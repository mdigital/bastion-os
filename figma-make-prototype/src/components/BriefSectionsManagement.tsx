import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, Check, FileText } from 'lucide-react';
import { sectionCatalog, getAllCategories, type SectionTemplate } from '../data/sectionCatalog';

export function BriefSectionsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionTemplate | null>(null);

  const categories = ['All', ...getAllCategories()];

  const filteredSections = sectionCatalog.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (section: SectionTemplate) => {
    setEditingSection(section);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setEditingSection(null);
    setShowEditModal(true);
  };

  const handleSave = (section: SectionTemplate) => {
    // In production, this would save to the database
    console.log('Saving section:', section);
    alert(`Section "${section.name}" has been ${editingSection ? 'updated' : 'created'} successfully!`);
    setShowEditModal(false);
  };

  const handleDelete = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section? This will affect all practice areas using it.')) {
      // In production, this would delete from the database
      console.log('Deleting section:', sectionId);
      alert('Section deleted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2">Brief Sections Management</h2>
          <p className="text-gray-600">
            Manage the master catalogue of brief sections used across all practice areas
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Section
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sections by name or description..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Section Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">AI Criteria</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSections.map((section) => (
                <tr key={section.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium text-gray-900">{section.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-md">{section.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {section.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {section.aiEvaluationCriteria ? (
                      <p className="text-xs text-gray-600 max-w-xs line-clamp-2">
                        {section.aiEvaluationCriteria}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No criteria set</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(section)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit section"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSections.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No sections found matching your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Sections</p>
          <p className="text-2xl font-bold">{sectionCatalog.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Categories</p>
          <p className="text-2xl font-bold">{getAllCategories().length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">With AI Criteria</p>
          <p className="text-2xl font-bold">
            {sectionCatalog.filter(s => s.aiEvaluationCriteria).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Filtered Results</p>
          <p className="text-2xl font-bold">{filteredSections.length}</p>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditSectionModal
          section={editingSection}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// Edit Section Modal Component
interface EditSectionModalProps {
  section: SectionTemplate | null;
  onClose: () => void;
  onSave: (section: SectionTemplate) => void;
}

function EditSectionModal({ section, onClose, onSave }: EditSectionModalProps) {
  const [formData, setFormData] = useState<SectionTemplate>(
    section || {
      id: `sec-${Date.now()}`,
      name: '',
      description: '',
      category: 'Strategy',
      aiEvaluationCriteria: ''
    }
  );

  const [errors, setErrors] = useState({ name: '', description: '', category: '' });

  const categories = getAllCategories();

  const handleSubmit = () => {
    const newErrors = {
      name: formData.name.trim() ? '' : 'Section name is required',
      description: formData.description.trim() ? '' : 'Description is required',
      category: formData.category.trim() ? '' : 'Category is required'
    };

    setErrors(newErrors);

    if (!newErrors.name && !newErrors.description && !newErrors.category) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFBE7] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#FEFBE7] border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">
              {section ? 'Edit Section' : 'Add New Section'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure section details and AI evaluation criteria
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Section Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Campaign Objectives"
              className={`w-full px-4 py-3 bg-white/60 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-yellow-400'
              }`}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what this section should contain..."
              rows={3}
              className={`w-full px-4 py-3 bg-white/60 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                errors.description ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-yellow-400'
              }`}
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-4 py-3 bg-white/60 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.category ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-yellow-400'
              }`}
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
          </div>

          {/* AI Evaluation Criteria */}
          <div>
            <label className="block text-sm font-medium mb-2">
              AI Evaluation Criteria
              <span className="text-gray-500 font-normal ml-2">(Optional)</span>
            </label>
            <textarea
              value={formData.aiEvaluationCriteria || ''}
              onChange={(e) => setFormData({ ...formData, aiEvaluationCriteria: e.target.value })}
              placeholder="Describe what the AI should look for when evaluating this section. For example: 'Check for specific, measurable objectives. Verify KPIs are quantifiable with clear targets.'"
              rows={4}
              className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
            <p className="text-xs text-gray-600 mt-2">
              These criteria guide the AI when reviewing and providing feedback on this section in client briefs.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Changes to existing sections will affect all practice areas currently using this section.
              The AI evaluation criteria helps ensure consistent quality across all briefs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#FEFBE7] border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            {section ? 'Update Section' : 'Add Section'}
          </button>
        </div>
      </div>
    </div>
  );
}
