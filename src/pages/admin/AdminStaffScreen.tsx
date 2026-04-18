import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Search, 
  UserPlus,
  Mail,
  Lock,
  MoreVertical,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminStaffScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const staffMembers = [
    { id: 1, name: 'Admin User', email: 'admin@aimher.com', role: 'admin', permissions: 'all', status: 'active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@phc.gov.ng', role: 'hcc_admin', permissions: 'phc:read,phc:write', facility: 'PHC Lagos', status: 'active' },
    { id: 3, name: 'Dr. Michael Chen', email: 'dr.chen@fmc.gov.ng', role: 'fhc_admin', permissions: 'fmc:read,fmc:write,patient:read', facility: 'FMC Abuja', status: 'active' },
    { id: 4, name: 'James Wilson', email: 'james@clinic.ng', role: 'clinic_admin', permissions: 'clinic:read', facility: 'City Clinic', status: 'active' },
    { id: 5, name: 'Inactive Staff', email: 'inactive@aimher.com', role: 'staff', permissions: 'read', facility: 'HQ', status: 'inactive' },
  ];

  const getRoleBadge = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      hcc_admin: 'bg-green-100 text-green-700',
      fhc_admin: 'bg-red-100 text-red-700',
      clinic_admin: 'bg-orange-100 text-orange-700',
      sth_admin: 'bg-teal-100 text-teal-700',
      stth_admin: 'bg-cyan-100 text-cyan-700',
    };
    return roles[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">Manage staff roles and permissions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Staff Member</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Facility</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Permissions</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staffMembers.map((staff, i) => (
              <motion.tr key={staff.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{staff.name}</p>
                    <p className="text-sm text-gray-500">{staff.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getRoleBadge(staff.role)}>{staff.role.replace('_', ' ').toUpperCase()}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{staff.facility}</td>
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">{staff.permissions}</td>
                <td className="px-4 py-3">
                  {staff.status === 'active' ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="h-4 w-4" /> Active</span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 text-sm"><XCircle className="h-4 w-4" /> Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStaffScreen;