import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Mail, User, Lock, Shield, CheckCircle,
  AlertCircle, Loader2, ArrowLeft, Building2, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminAPI } from '@/services/adminService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FACILITY_ROLE_MAP: Record<string, { value: string; label: string }[]> = {
  FMC: [
    { value: 'fhc_admin', label: 'FMC Admin' },
    { value: 'fhc_staff', label: 'FMC Staff' },
  ],
  PHC: [
    { value: 'hcc_admin', label: 'PHC Admin' },
    { value: 'hcc_staff', label: 'PHC Staff (Nurse / CHO / Doctor)' },
  ],
  STH: [
    { value: 'sth_admin', label: 'State Hospital Admin' },
    { value: 'sth_staff', label: 'State Hospital Staff' },
  ],
  STTH: [
    { value: 'stth_admin', label: 'State Teaching Hospital Admin' },
    { value: 'stth_staff', label: 'State Teaching Hospital Staff' },
  ],
  FTH: [
    { value: 'fth_admin', label: 'Federal Teaching Hospital Admin' },
    { value: 'fth_staff', label: 'Federal Teaching Hospital Staff' },
  ],
  HMO: [
    { value: 'hmo_admin', label: 'HMO Admin' },
    { value: 'hmo_staff', label: 'HMO Staff' },
  ],
};

const NO_FACILITY_ROLES = [
  { value: 'admin', label: 'Platform Admin' },
  { value: 'clinician', label: 'Clinician / Doctor' },
  { value: 'patient', label: 'Patient' },
];

const AdminAddUserScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [availableRoles, setAvailableRoles] = useState(NO_FACILITY_ROLES);
  const [staffRole, setStaffRole] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirm_password: '',
    role: '',
    is_email_verified: true,
  });

  useEffect(() => {
    const pwd = generatePassword();
    setGeneratedPassword(pwd);
    setFormData(prev => ({ ...prev, password: pwd, confirm_password: pwd }));
  }, []);

  useEffect(() => {
    adminAPI.getAllFacilities({ page_size: 100 }).then((res: any) => {
      const data = res?.data?.results || res?.data?.centers || res?.data || [];
      setFacilities(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    return Array.from({length: 12}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleFacilityChange = (facilityId: string) => {
    if (!facilityId) {
      setSelectedFacility(null);
      setAvailableRoles(NO_FACILITY_ROLES);
      setFormData(prev => ({ ...prev, role: '' }));
      return;
    }
    const facility = facilities.find((f: any) => f.id === facilityId);
    setSelectedFacility(facility);
    const roles = FACILITY_ROLE_MAP[facility?.tier] || NO_FACILITY_ROLES;
    setAvailableRoles(roles);
    setFormData(prev => ({ ...prev, role: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    else if (formData.full_name.trim().length < 3) newErrors.full_name = 'Full name must be at least 3 characters';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirm_password) newErrors.confirm_password = 'Please confirm your password';
    else if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (!formData.role) newErrors.role = 'Please select a role';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await adminAPI.createUser({
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: formData.role,
        is_email_verified: formData.is_email_verified,
        ...(selectedFacility ? { facility_id: selectedFacility.id } : {}),
        ...(staffRole ? { staff_role: staffRole } : {}),
      });
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'User created successfully!' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to create user' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/system-admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Add New User</h1>
            <p className="text-sm text-gray-500">Create a new user account</p>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-6">
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        {message?.type === 'success' && generatedPassword && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">Generated Password — share with user:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-green-200 rounded px-3 py-2 text-sm font-mono text-gray-800">
                {generatedPassword}
              </code>
              <button type="button" onClick={() => { navigator.clipboard.writeText(generatedPassword); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors whitespace-nowrap">
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="email" type="email" placeholder="user@example.com" value={formData.email}
                onChange={handleChange('email')} className={`pl-10 ${errors.email ? 'border-red-500' : ''}`} disabled={loading} />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="full_name" type="text" placeholder="John Doe" value={formData.full_name}
                onChange={handleChange('full_name')} className={`pl-10 ${errors.full_name ? 'border-red-500' : ''}`} disabled={loading} />
            </div>
            {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
          </div>

          {/* Facility */}
          <div className="space-y-2">
            <Label htmlFor="facility">Facility</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select id="facility" onChange={e => handleFacilityChange(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background disabled:opacity-50" disabled={loading}>
                <option value="">No facility (Admin / Patient / Clinician)</option>
                {facilities.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            {selectedFacility && (
              <p className="text-xs text-gray-500">Type: {selectedFacility.tier}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select id="role" value={formData.role} onChange={handleChange('role')}
                className={`w-full h-10 pl-10 pr-3 rounded-md border ${errors.role ? 'border-red-500' : 'border-input'} bg-background disabled:opacity-50`}
                disabled={loading}>
                <option value="">Select a role</option>
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>

          {/* Staff Role */}
          {formData.role === 'hcc_staff' && (
            <div className="space-y-2">
              <Label htmlFor="staff_role">Staff Role <span className="text-red-500">*</span></Label>
              <select id="staff_role" value={staffRole} onChange={e => setStaffRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background disabled:opacity-50" disabled={loading}>
                <option value="">Select staff role</option>
                <option value="nurse">Nurse</option>
                <option value="cho">Community Health Officer</option>
                <option value="assistant">Health Assistant</option>
                <option value="receptionist">Receptionist</option>
                <option value="doctor">Doctor / Medical Officer</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="password" type="text" value={formData.password}
                onChange={handleChange('password')} className={`pl-10 ${errors.password ? 'border-red-500' : ''}`} disabled={loading} />
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            <button type="button" onClick={() => { const pwd = generatePassword(); setGeneratedPassword(pwd); setFormData(prev => ({ ...prev, password: pwd, confirm_password: pwd })); }}
              className="text-xs text-blue-600 hover:underline mt-1">
              🔄 Regenerate password
            </button>
          </div>

          {/* Confirm Password
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="confirm_password" type="password" placeholder="Enter the same password" value={formData.confirm_password}
                onChange={handleChange('confirm_password')} className={`pl-10 ${errors.confirm_password ? 'border-red-500' : ''}`} disabled={loading} />
            </div>
            {errors.confirm_password && <p className="text-sm text-red-500">{errors.confirm_password}</p>}
          </div> */}

          {/* Email Verified */}
          <div className="flex items-center gap-2">
            <input id="is_email_verified" type="checkbox" checked={formData.is_email_verified}
              onChange={handleChange('is_email_verified')} className="h-4 w-4 rounded border-gray-300" disabled={loading} />
            <Label htmlFor="is_email_verified" className="text-sm text-gray-600">
              Email is verified (user can login immediately)
            </Label>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating User...</> : <><CheckCircle className="mr-2 h-4 w-4" />Create User</>}
            </Button>
          </div>
        </form>
      </div>
    {/* Password Modal */}
    {message?.type === 'success' && generatedPassword && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">User Created Successfully</h2>
              <p className="text-sm text-gray-500">Save this password before closing</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm font-medium text-gray-900">{formData.email}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-2">Generated Password</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono text-gray-800 break-all">
                {generatedPassword}
              </code>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(generatedPassword); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/system-admin/users')}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(generatedPassword); setCopied(true); setTimeout(() => { setCopied(false); navigate('/system-admin/users'); }, 1000); }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy & Close
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default AdminAddUserScreen;