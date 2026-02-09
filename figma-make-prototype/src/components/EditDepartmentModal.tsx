import { useState, useEffect } from 'react';
import { X, FolderKanban, Plus, Trash2, Check, Search, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { sectionCatalog, getAllCategories, type SectionTemplate } from '../data/sectionCatalog';

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
  briefType: 'New Project Brief' | 'Fast Forward Brief';
  sections: BriefSection[];
}

interface Department {
  id: string;
  name: string;
  color: string;
  icon: string;
  briefTemplates: BriefTemplate[];
}

interface EditDepartmentModalProps {
  onClose: () => void;
  onSave: (department: Department) => void;
  existingDepartment?: Department | null;
}

const colorOptions = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Violet', value: '#7C3AED' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#0891B2' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Dark Red', value: '#DC2626' },
  { name: 'Indigo', value: '#6366F1' }
];

const iconOptions = ['💻', '🎨', '📱', '📢', '✍️', '📧', '📦', '🚀', '💡', '🎯', '📊', '🔧', '⚙️', '📈', '✨', '⭐', '📰', '🚨', '🤝', '📡', '✏️'];

export function EditDepartmentModal({ onClose, onSave, existingDepartment }: EditDepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: '💻'
  });

  const [activeBriefType, setActiveBriefType] = useState<'New Project Brief' | 'Fast Forward Brief'>('New Project Brief');
  const [newProjectSections, setNewProjectSections] = useState<Array<{ sectionId: string; required: boolean; customAiCriteria?: string }>>([]);
  const [fastForwardSections, setFastForwardSections] = useState<Array<{ sectionId: string; required: boolean; customAiCriteria?: string }>>([]);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['All']));
  const [errors, setErrors] = useState({ name: '' });

  const categories = ['All', ...getAllCategories()];

  useEffect(() => {
    if (existingDepartment) {
      setFormData({
        name: existingDepartment.name,
        color: existingDepartment.color,
        icon: existingDepartment.icon
      });
      
      // Convert existing sections to selected sections for each brief type
      if (existingDepartment.briefTemplates) {
        const newProjectTemplate = existingDepartment.briefTemplates.find(t => t.briefType === 'New Project Brief');
        const fastForwardTemplate = existingDepartment.briefTemplates.find(t => t.briefType === 'Fast Forward Brief');
        
        if (newProjectTemplate) {
          setNewProjectSections(newProjectTemplate.sections.map(s => ({
            sectionId: s.id,
            required: s.required,
            customAiCriteria: s.description.includes('Default AI Criteria:') ? s.description.split('Default AI Criteria:')[1].trim() : undefined
          })));
        }
        
        if (fastForwardTemplate) {
          setFastForwardSections(fastForwardTemplate.sections.map(s => ({
            sectionId: s.id,
            required: s.required,
            customAiCriteria: s.description.includes('Default AI Criteria:') ? s.description.split('Default AI Criteria:')[1].trim() : undefined
          })));
        }
      }
    }
  }, [existingDepartment]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCurrentSections = () => {
    return activeBriefType === 'New Project Brief' ? newProjectSections : fastForwardSections;
  };

  const setCurrentSections = (sections: Array<{ sectionId: string; required: boolean; customAiCriteria?: string }>) => {
    if (activeBriefType === 'New Project Brief') {
      setNewProjectSections(sections);
    } else {
      setFastForwardSections(sections);
    }
  };

  const toggleSection = (sectionId: string) => {
    const currentSections = getCurrentSections();
    const existing = currentSections.find(s => s.sectionId === sectionId);
    if (existing) {
      setCurrentSections(currentSections.filter(s => s.sectionId !== sectionId));
    } else {
      setCurrentSections([...currentSections, { sectionId, required: false }]);
    }
  };

  const toggleRequired = (sectionId: string) => {
    const currentSections = getCurrentSections();
    setCurrentSections(currentSections.map(s => 
      s.sectionId === sectionId ? { ...s, required: !s.required } : s
    ));
  };

  const updateCustomCriteria = (sectionId: string, criteria: string) => {
    const currentSections = getCurrentSections();
    setCurrentSections(currentSections.map(s => 
      s.sectionId === sectionId ? { ...s, customAiCriteria: criteria } : s
    ));
  };

  const isSelected = (sectionId: string) => {
    return getCurrentSections().some(s => s.sectionId === sectionId);
  };

  const isRequired = (sectionId: string) => {
    return getCurrentSections().find(s => s.sectionId === sectionId)?.required || false;
  };

  const getCustomCriteria = (sectionId: string) => {
    return getCurrentSections().find(s => s.sectionId === sectionId)?.customAiCriteria || '';
  };

  const filteredSections = sectionCatalog.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSectionsByCategory = (category: string) => {
    return filteredSections.filter(s => s.category === category);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setErrors({ name: 'Practice area name is required' });
      return;
    }

    if (newProjectSections.length === 0 && fastForwardSections.length === 0) {
      alert('Please select at least one section for at least one brief type');
      return;
    }

    const briefTemplates: BriefTemplate[] = [];

    // Add New Project Brief template if sections are selected
    if (newProjectSections.length > 0) {
      const sections: BriefSection[] = newProjectSections.map(selected => {
        const catalogSection = sectionCatalog.find(s => s.id === selected.sectionId);
        return {
          id: catalogSection!.id,
          name: catalogSection!.name,
          description: selected.customAiCriteria ? `Default AI Criteria: ${selected.customAiCriteria}` : catalogSection!.description,
          required: selected.required
        };
      });

      briefTemplates.push({
        id: `${formData.name.toLowerCase().replace(/\s+/g, '-')}-new`,
        name: formData.name,
        description: `${formData.name} brief sections`,
        briefType: 'New Project Brief',
        sections
      });
    }

    // Add Fast Forward Brief template if sections are selected
    if (fastForwardSections.length > 0) {
      const sections: BriefSection[] = fastForwardSections.map(selected => {
        const catalogSection = sectionCatalog.find(s => s.id === selected.sectionId);
        return {
          id: catalogSection!.id,
          name: catalogSection!.name,
          description: selected.customAiCriteria ? `Default AI Criteria: ${selected.customAiCriteria}` : catalogSection!.description,
          required: selected.required
        };
      });

      briefTemplates.push({
        id: `${formData.name.toLowerCase().replace(/\s+/g, '-')}-fast`,
        name: formData.name,
        description: `${formData.name} brief sections`,
        briefType: 'Fast Forward Brief',
        sections
      });
    }

    const department: Department = {
      id: existingDepartment?.id || `dept-${Date.now()}`,
      ...formData,
      briefTemplates
    };

    onSave(department);
  };

  const currentSectionObjects = getCurrentSections()
    .map(s => sectionCatalog.find(cat => cat.id === s.sectionId))
    .filter(Boolean) as SectionTemplate[];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFBE7] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#FEFBE7] border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">
              {existingDepartment ? 'Edit Practice Area' : 'Add New Practice Area'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure practice area details and select brief sections for each brief type
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Department Info */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              Practice Area Information
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-2">Practice Area Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Creative"
                  className={`w-full px-4 py-3 bg-white/60 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-yellow-400'
                  }`}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Colour</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        formData.color === color.value ? 'border-black scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="grid grid-cols-7 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`h-10 rounded-lg border-2 transition-all text-2xl ${
                        formData.icon === icon ? 'border-black bg-yellow-100' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Brief Type Tabs */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveBriefType('New Project Brief')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeBriefType === 'New Project Brief'
                    ? 'bg-yellow-400 border-b-2 border-black'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>New Project Brief</span>
                  <span className="px-2 py-0.5 bg-black text-white rounded-full text-xs">
                    {newProjectSections.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveBriefType('Fast Forward Brief')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeBriefType === 'Fast Forward Brief'
                    ? 'bg-yellow-400 border-b-2 border-black'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Fast Forward Brief</span>
                  <span className="px-2 py-0.5 bg-black text-white rounded-full text-xs">
                    {fastForwardSections.length}
                  </span>
                </div>
              </button>
            </div>

            {/* Selected Sections Summary */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold">Selected Sections ({getCurrentSections().length})</h3>
                  <p className="text-sm text-gray-600">
                    Sections for {activeBriefType}
                  </p>
                </div>
                <button
                  onClick={() => setShowSectionPicker(!showSectionPicker)}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {showSectionPicker ? 'Close Section Picker' : 'Add Sections'}
                </button>
              </div>

              {getCurrentSections().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No sections selected yet. Click "Add Sections" to choose from the section catalogue.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentSectionObjects.map((section, index) => {
                    const catalogSection = sectionCatalog.find(s => s.id === section.id);
                    return (
                      <div key={section.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="font-bold text-gray-500 text-sm min-w-[24px]">{index + 1}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">{section.name}</p>
                            <p className="text-xs text-gray-600 mb-2">{section.description}</p>
                            {catalogSection?.aiEvaluationCriteria && (
                              <p className="text-xs text-gray-500 italic mb-2">
                                Default AI Criteria: {catalogSection.aiEvaluationCriteria}
                              </p>
                            )}
                            <div className="mt-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Custom AI Evaluation Criteria (Optional)
                              </label>
                              <textarea
                                value={getCustomCriteria(section.id)}
                                onChange={(e) => updateCustomCriteria(section.id, e.target.value)}
                                placeholder="Add custom AI evaluation criteria specific to this practice area..."
                                rows={2}
                                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isRequired(section.id)}
                                onChange={() => toggleRequired(section.id)}
                                className="w-4 h-4 text-yellow-400 rounded focus:ring-yellow-400"
                              />
                              <span className="text-xs font-medium whitespace-nowrap">Required</span>
                            </label>
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                              title="Remove section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section Picker */}
          {showSectionPicker && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold mb-4">Section Catalogue</h3>
              
              {/* Search and Filter */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search sections..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-yellow-400 text-black'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections List by Category */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {selectedCategory === 'All' ? (
                  // Show all categories
                  getAllCategories().map(category => {
                    const categorySections = getSectionsByCategory(category);
                    if (categorySections.length === 0) return null;
                    const isExpanded = expandedCategories.has(category);

                    return (
                      <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{category}</span>
                            <span className="text-xs text-gray-600">({categorySections.length})</span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        
                        {isExpanded && (
                          <div className="p-3 space-y-2">
                            {categorySections.map(section => {
                              const selected = isSelected(section.id);
                              return (
                                <div
                                  key={section.id}
                                  onClick={() => toggleSection(section.id)}
                                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    selected
                                      ? 'border-yellow-400 bg-yellow-50'
                                      : 'border-gray-200 bg-white hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                      selected ? 'border-yellow-400 bg-yellow-400' : 'border-gray-300'
                                    }`}>
                                      {selected && <Check className="w-3 h-3 text-black" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm">{section.name}</p>
                                      <p className="text-xs text-gray-600 mt-0.5">{section.description}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Show selected category only
                  <div className="space-y-2">
                    {filteredSections.map(section => {
                      const selected = isSelected(section.id);
                      return (
                        <div
                          key={section.id}
                          onClick={() => toggleSection(section.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selected
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              selected ? 'border-yellow-400 bg-yellow-400' : 'border-gray-300'
                            }`}>
                              {selected && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{section.name}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{section.description}</p>
                              <p className="text-xs text-gray-500 mt-1">Category: {section.category}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
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
            {existingDepartment ? 'Update Practice Area' : 'Add Practice Area'}
          </button>
        </div>
      </div>
    </div>
  );
}