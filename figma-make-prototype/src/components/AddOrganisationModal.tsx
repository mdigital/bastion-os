import { useState, useEffect } from 'react';
import { X, Building2, Briefcase, Check, Plus, Globe } from 'lucide-react';

interface Organisation {
  id: string;
  name: string;
  industry: string;
  country: string;
  activeUsers: number;
  activeBriefs: number;
  addedDate: string;
}

interface AddOrganisationModalProps {
  onClose: () => void;
  onAdd: (organisationData: Omit<Organisation, 'id' | 'activeUsers' | 'activeBriefs' | 'addedDate'>) => void;
  editMode?: boolean;
  existingOrganisation?: Organisation;
}

const industries = [
  'Technology',
  'Software',
  'Food & Beverage',
  'Automotive',
  'Insurance',
  'Healthcare',
  'Health & Fitness',
  'Retail',
  'Finance',
  'Education',
  'Entertainment',
  'Real Estate',
  'Manufacturing',
  'Professional Services',
  'Other'
];

const countries = [
  'Australia',
  'New Zealand',
  'China',
  'USA'
];

export function AddOrganisationModal({ onClose, onAdd, editMode = false, existingOrganisation }: AddOrganisationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Technology',
    country: 'Australia'
  });

  const [errors, setErrors] = useState({
    name: ''
  });

  useEffect(() => {
    if (editMode && existingOrganisation) {
      setFormData({
        name: existingOrganisation.name,
        industry: existingOrganisation.industry,
        country: existingOrganisation.country
      });
    }
  }, [editMode, existingOrganisation]);

  const handleSubmit = () => {
    // Validate
    const newErrors = {
      name: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Organisation name is required';
    }

    setErrors(newErrors);

    // If no errors, submit
    if (!newErrors.name) {
      onAdd(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFBE7] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#FEFBE7] border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{editMode ? 'Edit Organisation' : 'Add New Organisation'}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {editMode ? 'Update organisation details' : 'Add a new client organisation to the system'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Organisation Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organisation Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organisation Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Acme Corporation"
                  className={`w-full px-4 py-3 bg-white/60 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-yellow-400'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Industry *</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                  >
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country *</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          {!editMode && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">💡</span>
              </div>
              <div>
                <p className="font-bold text-blue-900 mb-1">Organisation Setup</p>
                <p className="text-sm text-blue-800">
                  After adding the organisation, you can assign users to it through Settings and create client briefs specifically for this organisation.
                </p>
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
            {editMode ? (
              <>
                <Check className="w-5 h-5" />
                Update Organisation
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Organisation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}