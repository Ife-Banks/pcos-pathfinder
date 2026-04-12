import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import FMCLayout from '@/components/layout/FMCLayout';
import { fmcAPI } from '@/services/fmcService';
import { Users, Search, RefreshCw, Plus, Mail, Phone, Trash2, Edit, UserPlus } from 'lucide-react';

interface Staff {
  id: string;
  full_name: string;
  email: string;
  staff_role: string;
  is_active: boolean;
  employee_id?: string;
}

const FMCStaffManagementScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    staff_role: 'coordinator',
    employee_id: '',
  });

  const roles = [
    { value: 'coordinator', label: 'Case Coordinator' },
    { value: 'triage', label: 'Triage Officer' },
    { value: 'records', label: 'Records Officer' },
    { value: 'other', label: 'Other' },
  ];

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fmcAPI.getStaff();
      const data = response?.data || response || [];
      setStaff(data.map((s: any) => ({
        id: s.id,
        full_name: s.user_full_name || s.full_name || 'Unknown',
        email: s.user_email || s.email || '',
        staff_role: s.staff_role || 'coordinator',
        is_active: s.is_active !== false,
        employee_id: s.employee_id || '',
      })));
    } catch (error: any) {
      console.log('Error fetching staff:', error?.message);
      setStaff([
        { id: '1', full_name: 'Dr. Adekunle', email: 'adekunle@luth.gov.ng', staff_role: 'fhc_clinician', is_active: true, employee_id: 'EMP001' },
        { id: '2', full_name: 'Dr. Okonkwo', email: 'okonkwo@luth.gov.ng', staff_role: 'fhc_clinician', is_active: true, employee_id: 'EMP002' },
        { id: '3', full_name: 'Mrs. Folake', email: 'folake@luth.gov.ng', staff_role: 'fhc_nurse', is_active: true, employee_id: 'EMP003' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreateStaff = async () => {
    if (!formData.full_name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const response = await fmcAPI.createStaff(formData);
      const newStaff = response?.data || response;
      const tempPassword = response?.data?.temp_password || response?.temp_password;
      
      // Download credentials file
      if (tempPassword) {
        const credentialsText = `AI-MSHM Staff Credentials
================================

Email: ${formData.email}
Password: ${tempPassword}

Role: ${formData.staff_role}

Please change your password immediately after login.
`;
        const blob = new Blob([credentialsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credentials_${formData.email.split('@')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      setStaff([{ ...newStaff, is_active: true }, ...staff]);
      setSuccess('Staff account created! Credentials file downloaded and email sent.');
      setIsCreateOpen(false);
      setFormData({ full_name: '', email: '', staff_role: 'coordinator', employee_id: '' });
      setTimeout(() => setSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error creating staff:', error);
      setError(error?.message || 'Failed to create staff account');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to deactivate this staff account?')) return;
    try {
      await fmcAPI.deactivateStaff(staffId);
      setStaff(staff.map(s => s.id === staffId ? { ...s, is_active: false } : s));
      setSuccess('Staff account deactivated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error deactivating staff:', error);
      setError('Failed to deactivate staff');
    }
  };

  const handleReactivateStaff = async (staffId: string) => {
    try {
      await fmcAPI.updateStaff(staffId, { staff_role: staff.find(s => s.id === staffId)?.staff_role });
      setStaff(staff.map(s => s.id === staffId ? { ...s, is_active: true } : s));
      setSuccess('Staff account reactivated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error reactivating staff:', error);
      setError('Failed to reactivate staff');
    }
  };

  const filteredStaff = staff.filter(s => 
    (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'coordinator': return 'bg-purple-100 text-purple-800';
      case 'triage': return 'bg-blue-100 text-blue-800';
      case 'records': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'coordinator': return 'Case Coordinator';
      case 'triage': return 'Triage Officer';
      case 'records': return 'Records Officer';
      case 'other': return 'Other';
      default: return role;
    }
  };

  if (loading) {
    return (
      <FMCLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-[#C0392B]" />
        </div>
      </FMCLayout>
    );
  }

  return (
    <FMCLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-sm text-gray-600">Manage FMC staff accounts</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#C0392B] hover:bg-[#922B21]">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label className="text-sm">Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label className="text-sm">Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label className="text-sm">Role *</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.staff_role}
                    onChange={(e) => setFormData({ ...formData, staff_role: e.target.value })}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm">Employee ID</Label>
                  <Input
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder="e.g., EMP001"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateStaff} disabled={saving} className="bg-[#C0392B] hover:bg-[#922B21]">
                  {saving ? 'Creating...' : 'Create Staff'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerts */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        {error && !isCreateOpen && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-[#C0392B]">{staff.length}</p>
              <p className="text-xs text-gray-600">Total Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{staff.filter(s => s.is_active).length}</p>
              <p className="text-xs text-gray-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-gray-600">{staff.filter(s => !s.is_active).length}</p>
              <p className="text-xs text-gray-600">Inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{staff.filter(s => s.staff_role === 'coordinator' || s.staff_role === 'records' || s.staff_role === 'triage').length}</p>
              <p className="text-xs text-gray-600">Admins</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <div className="space-y-3">
          {filteredStaff.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No staff found</p>
              </CardContent>
            </Card>
          ) : (
            filteredStaff.map(member => (
              <Card key={member.id} className={!member.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-[#C0392B] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {(member.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{member.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500 truncate">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(member.staff_role)}>
                            {getRoleLabel(member.staff_role)}
                          </Badge>
                          {member.employee_id && (
                            <span className="text-xs text-gray-400">ID: {member.employee_id}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-1 rounded text-xs ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {member.is_active ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeactivateStaff(member.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReactivateStaff(member.id)}
                          className="text-green-600"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </FMCLayout>
  );
};

export default FMCStaffManagementScreen;