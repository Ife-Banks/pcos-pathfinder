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
  UserPlus,
  Building2,
  Copy,
  Trash2,
  Phone,
  Mail,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { govAdminAPI, GovAdminAccount } from '@/services/govAdminService';

const GovAdminManagementScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');

  const userRole = user?.role;
  const isLgaAdmin = userRole === 'lga_admin';
  const scopeLabel = isLgaAdmin
    ? (user as Record<string, unknown>)?.lga_name || (user as Record<string, unknown>)?.lga || 'your LGA'
    : (user as Record<string, unknown>)?.state_name || (user as Record<string, unknown>)?.state || 'your State';

  const adminTypeLabel = isLgaAdmin ? 'Facility Admin' : 'State Admin';
  const heading = isLgaAdmin ? 'Facility Admin Management' : 'State Admin Management';
  const description = isLgaAdmin ? 'Manage facility administrator accounts' : 'Manage state-level administrator accounts';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{heading}</h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
          {adminTypeLabel} Portal
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Existing Admins</TabsTrigger>
          <TabsTrigger value="create">Create New Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <AdminListTab
            isLgaAdmin={isLgaAdmin}
            scopeLabel={scopeLabel}
            adminTypeLabel={adminTypeLabel}
            heading={heading}
          />
        </TabsContent>
        <TabsContent value="create">
          <CreateAdminTab
            isLgaAdmin={isLgaAdmin}
            scopeLabel={scopeLabel}
            adminTypeLabel={adminTypeLabel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function AdminListTab({
  isLgaAdmin,
  scopeLabel,
  adminTypeLabel,
  heading,
}: {
  isLgaAdmin: boolean;
  scopeLabel: string;
  adminTypeLabel: string;
  heading: string;
}) {
  const [admins, setAdmins] = useState<GovAdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await govAdminAPI.getGovAdmins({ page, page_size: pageSize });
      setAdmins(res?.data?.results || []);
      setTotalCount(res?.data?.count || 0);
    } catch (err) {
      console.error('Failed to load admins:', err);
      setError('Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [page]);

  const handleToggleActive = async (admin: GovAdminAccount) => {
    setToggling(admin.id);
    try {
      await govAdminAPI.deactivateGovAdmin(admin.id, !admin.is_active);
      setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, is_active: !a.is_active } : a));
    } catch (err) {
      console.error('Failed to toggle admin status:', err);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (admin: GovAdminAccount) => {
    if (!window.confirm(`Delete ${admin.email}? This cannot be undone.`)) return;
    setDeletingId(admin.id);
    try {
      await govAdminAPI.deleteGovAdmin(admin.id);
      setAdmins(prev => prev.filter(a => a.id !== admin.id));
    } catch (err) {
      console.error('Failed to delete admin:', err);
      setError('Failed to delete admin account');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAdmins = admins.filter(a => {
    const q = searchQuery.toLowerCase();
    return !q || a.full_name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const roleBadgeClass = (role: string) => {
    switch (role) {
      case 'facility_admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'sth_admin': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'stth_admin': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'facility_admin': return 'Facility Admin';
      case 'sth_admin': return 'STH Admin';
      case 'stth_admin': return 'STTH Admin';
      default: return role;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-600" />
              {heading}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchAdmins} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {error && (
            <Alert className="bg-red-50 border-red-200 text-red-800 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Shield className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-sm">
                {isLgaAdmin ? 'No facility admins yet' : 'No state admins yet'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Create a new {adminTypeLabel.toLowerCase()} from the Create tab
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map(admin => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.full_name}</TableCell>
                      <TableCell className="text-gray-500">{admin.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleBadgeClass(admin.role)}>
                          {roleLabel(admin.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                          {isLgaAdmin
                            ? admin.lga_name || scopeLabel
                            : admin.state_name || scopeLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={admin.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant={admin.is_active ? 'destructive' : 'outline'}
                            onClick={() => handleToggleActive(admin)}
                            disabled={toggling === admin.id || deletingId === admin.id}
                          >
                            {toggling === admin.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : admin.is_active ? (
                              'Deactivate'
                            ) : (
                              'Reactivate'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(admin)}
                            disabled={toggling === admin.id || deletingId === admin.id}
                          >
                            {deletingId === admin.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  Showing {Math.min((page - 1) * pageSize + 1, totalCount)} to {Math.min(page * pageSize, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={!hasNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateAdminTab({
  isLgaAdmin,
  scopeLabel,
  adminTypeLabel,
}: {
  isLgaAdmin: boolean;
  scopeLabel: string;
  adminTypeLabel: string;
}) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdAdmin, setCreatedAdmin] = useState<{ email: string; password: string } | null>(null);

  const roleOptions = isLgaAdmin
    ? [{ value: 'facility_admin', label: 'Facility Admin (PHC)' }]
    : [
        { value: 'sth_admin', label: 'STH Admin' },
        { value: 'stth_admin', label: 'STTH Admin' },
      ];

  const [selectedRole, setSelectedRole] = useState(
    isLgaAdmin ? 'facility_admin' : 'sth_admin'
  );

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  const stateId = (user as Record<string, unknown>)?.state_id as string || '';
  const lgaId = (user as Record<string, unknown>)?.lga_id as string || '';

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setCreatedAdmin(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setSubmitting(true);
    try {
      const res = await govAdminAPI.createGovAdmin({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: selectedRole as 'facility_admin' | 'sth_admin' | 'stth_admin',
        state_id: stateId,
        lga_id: lgaId,
      });
      const tempPassword = res?.data?.temp_password;
      if (tempPassword) {
        setCreatedAdmin({ email: form.email.trim(), password: tempPassword });
      } else {
        setSuccess(`Admin account created. Login credentials have been sent to ${form.email.trim()}.`);
      }
      setForm({ full_name: '', email: '', phone: '' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string; [key: string]: unknown } } };
      if (axiosErr?.response?.data) {
        const data = axiosErr.response.data;
        if (data.detail) {
          setError(data.detail);
        } else {
          const mapped: Record<string, string> = {};
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) mapped[key] = value[0] as string;
          });
          setErrors(mapped);
          if (!Object.keys(mapped).length) setError('Failed to create admin account');
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-teal-600" />
            Create New {adminTypeLabel}
          </CardTitle>
          <CardDescription>
            Fill in the details for the new {adminTypeLabel.toLowerCase()} account
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

            {createdAdmin && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <p className="font-semibold text-green-800 mb-2">Admin account created successfully</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium text-gray-700">Email:</span> {createdAdmin.email}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Password:</span>
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">{createdAdmin.password}</code>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(createdAdmin.password)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy password"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">The admin will be required to change this password on first login.</p>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Admin Role *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={e => handleChange('full_name', e.target.value)}
                className={errors.full_name ? 'border-red-500' : ''}
                placeholder="e.g. John Doe"
              />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="admin@example.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="+234 xxx xxxx"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
              <p className="text-sm text-teal-700">
                <span className="font-medium">Auto-scoped to:</span> {scopeLabel}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create {adminTypeLabel} Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default GovAdminManagementScreen;
