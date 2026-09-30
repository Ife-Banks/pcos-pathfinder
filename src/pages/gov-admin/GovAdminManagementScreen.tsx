import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { govAdminAPI, GovAdminAccount, GovFacility } from '@/services/govAdminService';

const GovAdminManagementScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');

  const userRole = user?.role;
  const isLgaAdmin = userRole === 'lga_admin';
  const isStateAdmin = userRole === 'state_admin';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
        <p className="text-gray-500">
          {isLgaAdmin
            ? 'Manage facility admins for your LGA'
            : isStateAdmin
            ? 'Manage STH and STTH admins for your state'
            : 'Manage admin accounts'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Admin List</TabsTrigger>
          <TabsTrigger value="create">Create Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <AdminListTab isLgaAdmin={isLgaAdmin} isStateAdmin={isStateAdmin} />
        </TabsContent>
        <TabsContent value="create">
          <CreateAdminTab
            isLgaAdmin={isLgaAdmin}
            isStateAdmin={isStateAdmin}
            onCancel={() => setActiveTab('list')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function AdminListTab({
  isLgaAdmin,
  isStateAdmin,
}: {
  isLgaAdmin: boolean;
  isStateAdmin: boolean;
}) {
  const [admins, setAdmins] = useState<GovAdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const pageSize = 20;

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await govAdminAPI.getGovAdmins({ page, page_size: pageSize });
      const data = res?.data;
      setAdmins(data?.results || []);
      setTotal(data?.count || 0);
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, [page]);

  const filteredAdmins = admins.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.full_name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.role?.toLowerCase().includes(q)
    );
  });

  const handleToggleActive = async (admin: GovAdminAccount) => {
    try {
      await govAdminAPI.deactivateGovAdmin(admin.id, !admin.is_active);
      loadAdmins();
    } catch (err) {
      console.error('Failed to toggle admin:', err);
    }
  };

  const handleDelete = async (admin: GovAdminAccount) => {
    if (!confirm(`Delete ${admin.full_name || admin.email}?`)) return;
    setDeleting(admin.id);
    try {
      await govAdminAPI.deleteGovAdmin(admin.id);
      loadAdmins();
    } catch (err) {
      console.error('Failed to delete admin:', err);
    } finally {
      setDeleting(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      lga_admin: 'bg-blue-100 text-blue-700',
      state_admin: 'bg-purple-100 text-purple-700',
      sth_admin: 'bg-teal-100 text-teal-700',
      stth_admin: 'bg-green-100 text-green-700',
      facility_admin: 'bg-orange-100 text-orange-700',
    };
    return (
      <Badge className={colors[role] || 'bg-gray-100 text-gray-700'}>
        {role.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" onClick={loadAdmins}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>
            {searchQuery
              ? 'No admins match your search'
              : 'No admin accounts yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAdmins.map((admin) => (
            <motion.div
              key={admin.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-teal-700">
                      {admin.full_name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'AD'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {admin.full_name || 'Admin'}
                    </h3>
                    <p className="text-xs text-gray-500">{admin.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(admin.role)}
                      {admin.state_name && (
                        <span className="text-xs text-gray-400">
                          {admin.state_name}
                        </span>
                      )}
                      {admin.facility_name && (
                        <span className="text-xs text-teal-600 font-medium">
                          {admin.facility_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      admin.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={admin.is_active ? 'Active' : 'Inactive'}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(admin)}
                    title={admin.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {admin.is_active ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(admin)}
                    disabled={deleting === admin.id}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {total > pageSize && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))
              }
              disabled={page >= Math.ceil(total / pageSize)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateAdminTab({
  isLgaAdmin,
  isStateAdmin,
  onCancel,
}: {
  isLgaAdmin: boolean;
  isStateAdmin: boolean;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const u = user as Record<string, unknown> | null;
  const userStateId = (u?.state_id as string) || null;
  const userLgaId = (u?.lga_id as string) || null;

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tempPassword, setTempPassword] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: isLgaAdmin ? 'facility_admin' : isStateAdmin ? 'sth_admin' : 'facility_admin',
  });

  const [facilities, setFacilities] = useState<GovFacility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [facilityId, setFacilityId] = useState('');

  const targetRoles = isLgaAdmin
    ? [{ value: 'facility_admin', label: 'Facility Admin (PHC)' }]
    : isStateAdmin
    ? [
        { value: 'sth_admin', label: 'State Hospital Admin' },
        { value: 'stth_admin', label: 'State Teaching Hospital Admin' },
      ]
    : [];

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Fetch STH/STTH facilities when role changes
  useEffect(() => {
    if (form.role === 'sth_admin' || form.role === 'stth_admin') {
      const tier = form.role === 'sth_admin' ? 'sth' : 'stth';
      setFacilitiesLoading(true);
      setFacilityId('');
      govAdminAPI.getFacilitiesForDropdown(tier as 'sth' | 'stth')
        .then((res) => {
          const data = res?.data as any;
          setFacilities(data?.results || []);
        })
        .catch(() => setFacilities([]))
        .finally(() => setFacilitiesLoading(false));
    } else {
      setFacilities([]);
      setFacilityId('');
    }
  }, [form.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setTempPassword('');

    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if ((form.role === 'sth_admin' || form.role === 'stth_admin') && !facilityId) {
      newErrors.facility_id = 'Facility is required for this role';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: form.role,
        state_id: userStateId,
      };
      if (isLgaAdmin && userLgaId) {
        payload.lga_id = userLgaId;
      }
      if ((form.role === 'sth_admin' || form.role === 'stth_admin') && facilityId) {
        payload.facility_id = facilityId;
      }
      const res = await govAdminAPI.createGovAdmin(payload as any);
      const data = res?.data as any;
      if (data?.temp_password) {
        setTempPassword(data.temp_password);
      }
      setSuccess(`Admin "${form.full_name}" created successfully.`);
      setForm({ full_name: '', email: '', role: form.role });
      setFacilityId('');
    } catch (err: any) {
      const axiosErr = err as {
        response?: { data?: { detail?: string; errors?: Record<string, string[]>; [key: string]: unknown } };
      };
      if (axiosErr?.response?.data) {
        const respData = axiosErr.response.data;
        if (respData.detail) {
          setError(respData.detail as string);
        } else if (respData.errors) {
          setErrors(respData.errors as Record<string, string>);
        } else {
          const mapped: Record<string, string> = {};
          Object.entries(respData).forEach(([key, value]) => {
            if (Array.isArray(value)) mapped[key] = value[0] as string;
          });
          setErrors(mapped);
          if (!Object.keys(mapped).length) setError('Failed to create admin');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <span className="text-lg">&larr;</span>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Admin</h2>
          <p className="text-sm text-gray-500">
            {isLgaAdmin
              ? 'Create a facility admin for your LGA'
              : 'Create an STH or STTH admin for your state'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Details
          </CardTitle>
          <CardDescription>
            Fill in the details to create a new admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {tempPassword && (
              <Alert className="bg-yellow-50 border-yellow-300 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Temporary Password</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-yellow-100 px-3 py-1.5 rounded text-sm font-mono">
                        {tempPassword}
                      </code>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(tempPassword)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs">Share this with the admin. They should change it on first login.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Admin Role *</Label>
              <Select
                value={form.role}
                onValueChange={(value) => handleChange('role', value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {targetRoles.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(form.role === 'sth_admin' || form.role === 'stth_admin') && (
              <div className="space-y-2">
                <Label htmlFor="facility_id">Facility *</Label>
                <Select
                  value={facilityId}
                  onValueChange={(value) => {
                    setFacilityId(value);
                    if (errors.facility_id) {
                      setErrors((prev) => ({ ...prev, facility_id: '' }));
                    }
                  }}
                >
                  <SelectTrigger id="facility_id" className={errors.facility_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={facilitiesLoading ? 'Loading facilities...' : 'Select facility'} />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.facility_id && (
                  <p className="text-sm text-red-500">{errors.facility_id}</p>
                )}
                {!facilitiesLoading && facilities.length === 0 && (
                  <p className="text-xs text-amber-600">
                    No {form.role === 'sth_admin' ? 'State Hospitals' : 'State Teaching Hospitals'} found for your state.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className={errors.full_name ? 'border-red-500' : ''}
                placeholder="e.g. John Doe"
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default GovAdminManagementScreen;
