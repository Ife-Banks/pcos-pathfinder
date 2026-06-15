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
  RefreshCw,
  Eye,
  Trash2,
  UserX,
  UserCheck
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
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

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

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(prev => prev.length === users.length ? [] : users.map(u => u.id));

  const bulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (!selected.length) return;
    const label = action === 'delete' ? 'delete' : action;
    if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} ${selected.length} user(s)?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(selected.map(id => {
        if (action === 'delete') return adminAPI.deleteUser(id);
        return adminAPI.updateUser(id, { is_active: action === 'activate' });
      }));
      if (action === 'delete') {
        setUsers(prev => prev.filter(u => !selected.includes(u.id)));
      } else {
        setUsers(prev => prev.map(u => selected.includes(u.id) ? { ...u, is_active: action === 'activate' } : u));
      }
      setSelected([]);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Bulk action failed');
    } finally {
      setBulkLoading(false);
    }
  };

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
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/system-admin/users/add')}>
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

      {/* Bulk Actions Bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-700">{selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" disabled={bulkLoading}
              onClick={() => bulkAction('activate')}
              className="text-green-600 border-green-300 hover:bg-green-50">
              <UserCheck className="h-4 w-4 mr-1" /> Activate
            </Button>
            <Button size="sm" variant="outline" disabled={bulkLoading}
              onClick={() => bulkAction('deactivate')}
              className="text-amber-600 border-amber-300 hover:bg-amber-50">
              <UserX className="h-4 w-4 mr-1" /> Deactivate
            </Button>
            <Button size="sm" variant="outline" disabled={bulkLoading}
              onClick={() => bulkAction('delete')}
              className="text-red-600 border-red-300 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox"
                    checked={selected.length === users.length && users.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300 cursor-pointer" />
                </th>
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
                  className={`hover:bg-gray-50 cursor-pointer ${selected.includes(user.id) ? 'bg-blue-50' : ''}`}
                  onClick={() => navigate(`/system-admin/users/${user.id}`)}
                >
                  <td className="px-4 py-3 w-10" onClick={e => { e.stopPropagation(); toggleSelect(user.id); }}>
                    <input type="checkbox" checked={selected.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="rounded border-gray-300 cursor-pointer" />
                  </td>
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
                        onClick={() => navigate(`/system-admin/users/${user.id}`)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={user.is_active ? 'Deactivate user' : 'Activate user'}
                        className={user.is_active ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50' : 'text-green-500 hover:text-green-700 hover:bg-green-50'}
                        onClick={() => {
                          if (window.confirm(`${user.is_active ? 'Deactivate' : 'Activate'} ${user.full_name}?`)) {
                            adminAPI.updateUser(user.id, { is_active: !user.is_active })
                              .then(() => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u)))
                              .catch(e => alert(e?.response?.data?.message || 'Failed to update user'));
                          }
                        }}
                      >
                        {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete user"
                        onClick={() => {
                          if (window.confirm(`Delete ${user.full_name}? This cannot be undone.`)) {
                            adminAPI.deleteUser(user.id)
                              .then(() => setUsers(prev => prev.filter(u => u.id !== user.id)))
                              .catch(e => alert(e?.response?.data?.message || 'Failed to delete'));
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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