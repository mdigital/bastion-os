import { useState } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, Search, User, Shield, Building2, Users, CheckCircle2, Clock, XCircle, UserPlus, Mail, Briefcase } from 'lucide-react';
import { InviteUserModal } from './InviteUserModal';
import { OrganisationManagement } from './OrganisationManagement';
import { DepartmentManagement } from './DepartmentManagement';

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

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@agency.com',
    type: 'team',
    organisations: ['Acme Corporation', 'TechStart Inc'],
    role: 'Account Director',
    department: 'Account Management',
    status: 'active',
    invitedDate: '2025-01-15',
    lastLogin: '2025-12-18'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    email: 'marcus.chen@agency.com',
    type: 'team',
    organisations: ['Acme Corporation', 'TechStart Inc', 'Volvo'],
    role: 'Senior Strategist',
    department: 'Strategy',
    status: 'active',
    invitedDate: '2025-02-01',
    lastLogin: '2025-12-17'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@agency.com',
    type: 'team',
    organisations: ['GreenLife Foods', 'Tower Insurance'],
    role: 'Creative Director',
    department: 'Creative',
    status: 'active',
    invitedDate: '2025-02-10',
    lastLogin: '2025-12-16'
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david.park@agency.com',
    type: 'team',
    organisations: ['Acme Corporation'],
    role: 'Account Manager',
    department: 'Account Management',
    status: 'active',
    invitedDate: '2025-03-05',
    lastLogin: '2025-12-15'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.t@agency.com',
    type: 'team',
    organisations: ['TechStart Inc'],
    role: 'Digital Planner',
    department: 'Digital',
    status: 'pending',
    invitedDate: '2025-11-28'
  },
  {
    id: '6',
    name: 'James Patterson',
    email: 'james.patterson@agency.com',
    type: 'team',
    organisations: ['Geely', 'Volvo'],
    role: 'PR Manager',
    department: 'PR',
    status: 'active',
    invitedDate: '2025-01-20',
    lastLogin: '2025-12-14'
  },
  {
    id: '7',
    name: 'Rachel Green',
    email: 'rachel@agency.com',
    type: 'team',
    organisations: ['GreenLife Foods'],
    role: 'Social Media Manager',
    department: 'Social',
    status: 'inactive',
    invitedDate: '2025-06-12',
    lastLogin: '2025-09-01'
  }
];

const availableOrganisations = [
  'Acme Corporation',
  'TechStart Inc',
  'GreenLife Foods',
  'Volvo',
  'Geely',
  'Tower Insurance'
];

const availableRoles = [
  'Account Director',
  'Account Manager',
  'Senior Strategist',
  'Strategist',
  'Creative Director',
  'Art Director',
  'Copywriter',
  'Digital Planner',
  'PR Manager',
  'Social Media Manager'
];

const availableDepartments = [
  'Account Management',
  'Strategy',
  'Creative',
  'Digital',
  'PR',
  'Social'
];

// Generate additional users to reach 300 total
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Drew', 'Blake', 'Reese', 'Jamie', 'Charlie', 'Rowan', 'Cameron', 'Sage', 'Dakota', 'Finley', 'Kendall', 'Hayden', 'Emerson', 'Peyton', 'Logan', 'Parker', 'Skyler', 'River', 'Phoenix', 'Eden', 'Kai', 'Harper', 'Elliot', 'Jules', 'Ash', 'Sam', 'Max', 'Devon', 'Jesse', 'Angel', 'Frankie', 'Winter', 'Nova', 'Indie', 'Rain', 'Ocean', 'Sky', 'Storm', 'Gray', 'Blue', 'Jade', 'Ruby'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Turner'];

const roles = [
  'Account Director',
  'Account Manager',
  'Senior Strategist',
  'Strategist',
  'Creative Director',
  'Art Director',
  'Copywriter',
  'Digital Planner',
  'PR Manager',
  'Social Media Manager'
];

const departments = [
  'Account Management',
  'Strategy',
  'Creative',
  'Digital',
  'PR',
  'Social'
];

const statuses: ('active' | 'pending' | 'inactive')[] = ['active', 'active', 'active', 'active', 'pending', 'inactive'];

// Generate 293 more users (we already have 7)
for (let i = 8; i <= 300; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@agency.com`;
  const role = roles[Math.floor(Math.random() * roles.length)];
  const department = departments[Math.floor(Math.random() * departments.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  // Randomly assign 1-3 organisations
  const numOrgs = Math.floor(Math.random() * 3) + 1;
  const shuffledOrgs = [...availableOrganisations].sort(() => Math.random() - 0.5);
  const organisations = shuffledOrgs.slice(0, numOrgs);
  
  // Generate random dates for the past year
  const daysAgo = Math.floor(Math.random() * 365);
  const invitedDate = new Date();
  invitedDate.setDate(invitedDate.getDate() - daysAgo);
  
  let lastLogin: string | undefined;
  if (status === 'active') {
    const loginDaysAgo = Math.floor(Math.random() * 30);
    const loginDate = new Date();
    loginDate.setDate(loginDate.getDate() - loginDaysAgo);
    lastLogin = loginDate.toISOString().split('T')[0];
  } else if (status === 'inactive') {
    const loginDaysAgo = Math.floor(Math.random() * 90) + 60; // 60-150 days ago
    const loginDate = new Date();
    loginDate.setDate(loginDate.getDate() - loginDaysAgo);
    lastLogin = loginDate.toISOString().split('T')[0];
  }
  
  mockUsers.push({
    id: String(i),
    name,
    email,
    type: 'team',
    organisations,
    role,
    department,
    status,
    invitedDate: invitedDate.toISOString().split('T')[0],
    lastLogin
  });
}

export function AdminSection() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserMenu, setSelectedUserMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setFilterDepartment(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: 'all' | 'active' | 'pending' | 'inactive') => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getUserStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleInviteUser = (userData: Omit<User, 'id' | 'status' | 'invitedDate'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      status: 'pending',
      invitedDate: new Date().toISOString()
    };
    setUsers([...users, newUser]);
    setShowInviteModal(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
    setSelectedUserMenu(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(u => u.id !== userId));
      setSelectedUserMenu(null);
    }
  };

  const handleResendInvite = (userId: string) => {
    // In production, this would send an email
    alert('Invitation email resent successfully!');
    setSelectedUserMenu(null);
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    byDepartment: availableDepartments.reduce((acc, dept) => {
      acc[dept] = users.filter(u => u.department === dept).length;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div>
      {/* Header with Invite Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Users</h2>
          <p className="text-sm text-gray-600">Invite users, assign roles, and manage organisation access</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Invite User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 mb-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-4">
          {/* Department Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value as any)}
              className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">All Departments</option>
              {availableDepartments.map(department => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">User</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Role</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Department</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Organisations</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Last Login</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    {user.department}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.organisations.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.organisations.slice(0, 2).map((organisation, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {organisation}
                        </span>
                      ))}
                      {user.organisations.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{user.organisations.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">All organisations</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.lastLogin ? (
                    new Date(user.lastLogin).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  ) : (
                    <span className="text-gray-400">Never</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setSelectedUserMenu(selectedUserMenu === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {selectedUserMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit User
                          </button>
                          {user.status === 'pending' && (
                            <button
                              onClick={() => handleResendInvite(user.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                              Resend Invite
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete User
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

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found matching your filters</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}
            </span>
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteUser}
          availableOrganisations={availableOrganisations}
          availableRoles={availableRoles}
          availableDepartments={availableDepartments}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <InviteUserModal
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onInvite={(userData) => {
            handleUpdateUser({
              ...editingUser,
              ...userData
            });
          }}
          availableOrganisations={availableOrganisations}
          availableRoles={availableRoles}
          availableDepartments={availableDepartments}
          editMode={true}
          existingUser={editingUser}
        />
      )}
    </div>
  );
}