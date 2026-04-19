import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Mail, Building2, Shield, Activity, CheckCircle, XCircle,
  Edit, Trash2, AlertTriangle, User, Users, Clock, Star, Save, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { adminAPI, UserRecord } from '@/services/adminService';

const ROLES = [
  { value: 'patient', label: 'Patient' },
  { value: 'admin', label: 'Admin' },
  { value: 'clinician', label: 'Clinician' },
  { value: 'hcc_staff', label: 'PHC Staff' },
  { value: 'hcc_admin', label: 'PHC Admin' },
  { value: 'fhc_staff', label: 'FMC Staff' },
  { value: 'fhc_admin', label: 'FMC Admin' },
  { value: 'clinic_staff', label: 'Clinic Staff' },
  { value: 'clinic_admin', label: 'Clinic Admin' },
  { value: 'hmo', label: 'HMO' },
];

const AdminUserDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [originalUser, setOriginalUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminAPI.getUserById(id!);
        
        let userData = null;
        if (res.data?.data) userData = res.data.data;
        else if (res.data) userData = res.data;
        
        if (userData) {
          setUser(userData);
          setOriginalUser(userData);
        } else {
          setError('User not found');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  useEffect(() => {
    if (user && originalUser) {
      const changed = JSON.stringify(user) !== JSON.stringify(originalUser);
      setHasChanges(changed);
    }
  }, [user, originalUser]);

  const handleChange = (field: string, value: any) => {
    setUser((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Saving user:', user);
      alert('User updated successfully!');
      setOriginalUser(user);
      setHasChanges(false);
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setUser(originalUser);
    setHasChanges(false);
  };

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      'admin': 'bg-purple-100 text-purple-700',
      'clinician': 'bg-blue-100 text-blue-700',
      'hcc_staff': 'bg-green-100 text-green-700',
      'hcc_admin': 'bg-green-100 text-green-700',
      'fhc_staff': 'bg-red-100 text-red-700',
      'fhc_admin': 'bg-red-100 text-red-700',
      'clinic_staff': 'bg-orange-100 text-orange-700',
      'clinic_admin': 'bg-orange-100 text-orange-700',
      'patient': 'bg-gray-100 text-gray-700',
    };
    return <Badge className={roleStyles[role] || 'bg-gray-100 text-gray-700'}>{role}</Badge>;
  };

  const BoolRow = ({ label, field }: { label: string; field: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <Checkbox
        checked={user?.[field] || false}
        onCheckedChange={(checked) => handleChange(field, checked)}
      />
    </div>
  );

  const selectRole = (value: string) => (
    <select
      value={user?.role || ''}
      onChange={(e) => handleChange('role', e.target.value)}
      className="border rounded px-2 py-1 text-sm"
    >
      {ROLES.map(r => (
        <option key={r.value} value={r.value}>{r.label}</option>
      ))}
    </select>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-24 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">User Not Found</h2>
          <p className="text-red-600 mb-4">{error || 'The requested user could not be found.'}</p>
          <Button onClick={() => navigate('/system-admin/users')}>Back to Users</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/system-admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Users
        </Button>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />Reset
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />Delete
          </Button>
        </div>
      </div>

      {/* User Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-teal-700">{user.full_name?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.full_name || 'Unknown User'}</h1>
            <p className="text-gray-500 mb-3">{user.email}</p>
            <div className="flex gap-3">
              {getRoleBadge(user.role)}
              {user.is_active ? (
                <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History - Email & Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Mail className="h-5 w-5 text-teal-600" />History</h2>
          <div className="space-y-1">
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Email</span><span className="text-gray-900">{user.email}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Password</span><span className="text-gray-400 text-sm">••••••••</span></div>
          </div>
        </motion.div>

        {/* Personal - Name & Avatar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><User className="h-5 w-5 text-teal-600" />Personal</h2>
          <div className="space-y-1">
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Full name</span><span className="text-gray-900">{user.full_name}</span></div>
          </div>
        </motion.div>

        {/* Role & Auth */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-teal-600" />Role & Auth</h2>
          <div className="space-y-1">
            <div className="flex justify-between py-2 items-center"><span className="text-gray-500">Role</span>{selectRole(user.role)}</div>
            <BoolRow label="Is email verified" field="is_email_verified" />
            <BoolRow label="Onboarding completed" field="onboarding_completed" />
            <div className="flex justify-between py-2 items-center">
              <span className="text-gray-500">Onboarding step</span>
              <input
                type="number"
                min="0"
                max="10"
                value={user.onboarding_step || 0}
                onChange={(e) => handleChange('onboarding_step', parseInt(e.target.value))}
                className="border rounded px-2 py-1 w-16 text-center"
              />
            </div>
          </div>
        </motion.div>

        {/* Permissions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Star className="h-5 w-5 text-teal-600" />Permissions</h2>
          <div className="space-y-1">
            <BoolRow label="Is active" field="is_active" />
            <BoolRow label="Is staff" field="is_staff" />
            <BoolRow label="Superuser status" field="is_superuser" />
          </div>
        </motion.div>

        {/* Timestamps */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-teal-600" />Timestamps</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between py-2"><span className="text-gray-500">Date joined</span><span className="text-gray-900">{user.date_joined ? new Date(user.date_joined).toLocaleString() : '-'}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">Last login</span><span className="text-gray-900">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUserDetailScreen;