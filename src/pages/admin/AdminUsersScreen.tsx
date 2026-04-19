import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { adminAPI, UserRecord } from '@/services/adminService';

const AdminUsersScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params: any = { page_size: 50 };
        if (filter === 'active') params.status = 'active';
        if (filter === 'inactive') params.status = 'inactive';
        if (filter === 'staff') params.role = 'staff';
        if (filter === 'patients') params.role = 'patient';
        if (searchQuery) params.search = searchQuery;

        const res = await adminAPI.getAllUsers(params);
        if (res.data?.users) {
          setUsers(res.data.users);
          setTotal(res.data.total);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [filter, searchQuery]);

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
              {loading ? (
                <>
                  {[1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-10 bg-gray-200 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-6 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-6 w-20 bg-gray-200 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-6 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-6 w-20 bg-gray-200 rounded" /></td>
                    </tr>
                  ))}
                </>
              ) : users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/system-admin/users/${user.id}`)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.facility || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_active ? getStatusBadge('active') : getStatusBadge('inactive')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.location.href = `mailto:${user.email}`}
                        title="Send email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
</tbody>
          </table>
          {!loading && total > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
              Showing {users.length} of {total} users
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersScreen;