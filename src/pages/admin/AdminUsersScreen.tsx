import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminUsersScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const users = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@phc.gov.ng', role: 'hcc_staff', facility: 'PHC Lagos', status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Dr. Michael Chen', email: 'dr.chen@fmc.gov.ng', role: 'clinician', facility: 'FMC Abuja', status: 'active', joined: '2024-02-20' },
    { id: 3, name: 'Emily Davis', email: 'emily@aimher.com', role: 'patient', facility: '-', status: 'active', joined: '2024-03-10' },
    { id: 4, name: 'Admin User', email: 'admin@aimher.com', role: 'admin', facility: 'HQ', status: 'active', is_superuser: true, joined: '2023-12-01' },
    { id: 5, name: 'James Wilson', email: 'james@clinic.ng', role: 'clinic_staff', facility: 'City Clinic', status: 'inactive', joined: '2024-01-25' },
    { id: 6, name: 'Lisa Brown', email: 'lisa@phc.gov.ng', role: 'hcc_admin', facility: 'PHC Kano', status: 'active', joined: '2024-04-05' },
  ];

  const getRoleBadge = (role: string, isSuperuser?: boolean) => {
    if (isSuperuser) return <Badge className="bg-purple-100 text-purple-700">Admin</Badge>;
    if (role === 'admin') return <Badge className="bg-purple-100 text-purple-700">Admin</Badge>;
    if (role === 'clinician') return <Badge className="bg-blue-100 text-blue-700">Clinician</Badge>;
    if (role === 'hcc_staff' || role === 'hcc_admin') return <Badge className="bg-green-100 text-green-700">PHC Staff</Badge>;
    if (role === 'fhc_staff' || role === 'fhc_admin') return <Badge className="bg-red-100 text-red-700">FMC Staff</Badge>;
    if (role === 'clinic_staff' || role === 'clinic_admin') return <Badge className="bg-orange-100 text-orange-700">Clinic Staff</Badge>;
    return <Badge className="bg-gray-100 text-gray-700">Patient</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 text-green-600 text-sm">
          <CheckCircle className="h-4 w-4" /> Active
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-red-600 text-sm">
        <XCircle className="h-4 w-4" /> Inactive
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && user.status === 'active') ||
                         (filter === 'inactive' && user.status === 'inactive') ||
                         (filter === 'staff' && user.role.includes('staff')) ||
                         (filter === 'patients' && user.role === 'patient');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage all registered users</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button 
            variant={filter === 'active' ? 'default' : 'outline'} 
            onClick={() => setFilter('active')}
            size="sm"
          >
            Active
          </Button>
          <Button 
            variant={filter === 'inactive' ? 'default' : 'outline'} 
            onClick={() => setFilter('inactive')}
            size="sm"
          >
            Inactive
          </Button>
          <Button 
            variant={filter === 'staff' ? 'default' : 'outline'} 
            onClick={() => setFilter('staff')}
            size="sm"
          >
            Staff
          </Button>
          <Button 
            variant={filter === 'patients' ? 'default' : 'outline'} 
            onClick={() => setFilter('patients')}
            size="sm"
          >
            Patients
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Facility</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getRoleBadge(user.role, user.is_superuser)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.facility}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.joined}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersScreen;