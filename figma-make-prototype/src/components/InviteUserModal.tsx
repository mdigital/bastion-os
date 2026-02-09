import { useState, useEffect } from 'react';
import { X, Mail, User, Shield, Building2, Users, Check, Briefcase, FolderKanban } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'team';
  organisations: string[];
  role: string;
  department: string;
  status: 'active' | 'pending' | 'inactive';
  invitedDate: string;
  lastLogin?: string;
}

interface InviteUserModalProps {
  onClose: () => void;
  onInvite: (userData: Omit<User, 'id' | 'status' | 'invitedDate'>) => void;
  availableOrganisations: string[];
  availableRoles: string[];
  availableDepartments: string[];
  editMode?: boolean;
  existingUser?: User;
}

export function InviteUserModal({ 
  onClose, 
  onInvite, 
  availableOrganisations, 
  availableRoles,
  availableDepartments,
  editMode = false, 
  existingUser 
}: InviteUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'team' as 'team',
    organisations: [] as string[],
    role: '',
    department: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    organisations: '',
    role: '',
    department: ''
  });

  useEffect(() => {
    if (editMode && existingUser) {
      setFormData({
        name: existingUser.name,
        email: existingUser.email,
        type: existingUser.type,
        organisations: existingUser.organisations,
        role: existingUser.role,
        department: existingUser.department
      });
    }
  }, [editMode, existingUser]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    // Validate
    const newErrors = {
      name: '',
      email: '',
      organisations: '',
      role: '',
      department: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.type === 'team' && formData.organisations.length === 0) {
      newErrors.organisations = 'Team members must be assigned to at least one organisation';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);

    // If no errors, submit
    if (!newErrors.name && !newErrors.email && !newErrors.organisations && !newErrors.role && !newErrors.department) {
      onInvite(formData);
    }
  };

  const toggleOrganisation = (organisation: string) => {
    setFormData({
      ...formData,
      organisations: formData.organisations.includes(organisation)
        ? formData.organisations.filter(o => o !== organisation)
        : [...formData.organisations, organisation]
    });
  };

  const selectAllOrganisations = () => {
    setFormData({
      ...formData,
      organisations: availableOrganisations
    });
  };

  const clearAllOrganisations = () => {
    setFormData({
      ...formData,
      organisations: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFBE7] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#FEFBE7] border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{editMode ? 'Edit User' : 'Invite New User'}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {editMode ? 'Update user details and permissions' : 'Send an invitation to join Bastion OS'}
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
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sarah Johnson"
                  className={`w-full px-4 py-3 bg-white/60 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-yellow-400'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., sarah.johnson@company.com"
                  className={`w-full px-4 py-3 bg-white/60 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-yellow-400'
                  }`}
                  disabled={editMode}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
                {editMode && (
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                )}
              </div>
            </div>
          </div>

          {/* Role & Department */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Role & Department *
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full px-4 py-3 bg-white/60 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.role ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-yellow-400'
                  }`}
                >
                  <option value="">Select role...</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-sm text-red-600 mt-1">{errors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full px-4 py-3 bg-white/60 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.department ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-yellow-400'
                  }`}
                >
                  <option value="">Select department...</option>
                  {availableDepartments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-sm text-red-600 mt-1">{errors.department}</p>
                )}
              </div>
            </div>
          </div>

          {/* Organisation Assignment */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organisation Access *
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllOrganisations}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllOrganisations}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Select which organisations this user can access
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {availableOrganisations.map((organisation) => (
                <label
                  key={organisation}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.organisations.includes(organisation)
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.organisations.includes(organisation)}
                      onChange={() => toggleOrganisation(organisation)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        formData.organisations.includes(organisation)
                          ? 'bg-yellow-400 border-yellow-400'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {formData.organisations.includes(organisation) && (
                        <Check className="w-3 h-3 text-black" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium">{organisation}</span>
                </label>
              ))}
            </div>

            {errors.organisations && (
              <p className="text-sm text-red-600 mt-3">{errors.organisations}</p>
            )}

            {formData.organisations.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{formData.organisations.length}</strong> {formData.organisations.length === 1 ? 'organisation' : 'organisations'} selected
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          {!editMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-blue-900 mb-1">Invitation Email</p>
                  <p className="text-sm text-blue-800">
                    An invitation email will be sent to <strong>{formData.email || '[email]'}</strong> with instructions to set up their account and access Bastion OS.
                  </p>
                </div>
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
                Update User
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Send Invitation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}