import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users,
  Mail,
  User,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/services/adminService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const USER_ROLES = [
  { value: 'admin', label: 'Platform Admin' },
  { value: 'clinician', label: 'Clinician / Doctor' },
  { value: 'hcc_admin', label: 'PHC Admin' },
  { value: 'hcc_staff', label: 'PHC Staff' },
  { value: 'fhc_admin', label: 'FMC Admin' },
  { value: 'fhc_staff', label: 'FMC Staff' },
  { value: 'sth_admin', label: 'State Hospital Admin' },
  { value: 'sth_staff', label: 'State Hospital Staff' },
  { value: 'stth_admin', label: 'State Teaching Hospital Admin' },
  { value: 'stth_staff', label: 'State Teaching Hospital Staff' },
  { value: 'fth_admin', label: 'Federal Teaching Hospital Admin' },
  { value: 'fth_staff', label: 'Federal Teaching Hospital Staff' },
  { value: 'hmo_admin', label: 'HMO Admin' },
  { value: 'hmo_staff', label: 'HMO Staff' },
  { value: 'clinic_admin', label: 'Clinic Admin' },
  { value: 'clinic_staff', label: 'Clinic Staff' },
  { value: 'pvt_admin', label: 'Private Hospital Admin' },
  { value: 'pvt_staff', label: 'Private Hospital Staff' },
  { value: 'ptth_admin', label: 'Private Teaching Hospital Admin' },
  { value: 'ptth_staff', label: 'Private Teaching Hospital Staff' },
  { value: 'patient', label: 'Patient' },
];

const AdminAddUserScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirm_password: '',
    role: '',
    is_email_verified: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 3) {
      newErrors.full_name = 'Full name must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
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
      });
      
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'User created successfully!' });
        setTimeout(() => {
          navigate('/system-admin/users');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to create user' });
      }
    } catch (err: any) {
      console.error('Create user error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.message || 'Failed to create user' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
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

        {/* Message */}
        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-6">
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange('email')}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange('full_name')}
                className={`pl-10 ${errors.full_name ? 'border-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="role"
                value={formData.role}
                onChange={handleChange('role')}
                className={`w-full h-10 pl-10 pr-3 rounded-md border ${
                  errors.role ? 'border-red-500' : 'border-input'
                } bg-background disabled:opacity-50`}
                disabled={loading}
              >
                <option value="">Select a role</option>
                {USER_ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={handleChange('password')}
                className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            <p className="text-xs text-gray-500">
              At least 8 characters. Can't be too similar to your other personal information.
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirm_password"
                type="password"
                placeholder="Enter the same password"
                value={formData.confirm_password}
                onChange={handleChange('confirm_password')}
                className={`pl-10 ${errors.confirm_password ? 'border-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.confirm_password && <p className="text-sm text-red-500">{errors.confirm_password}</p>}
          </div>

          {/* Is Email Verified */}
          <div className="flex items-center gap-2">
            <input
              id="is_email_verified"
              type="checkbox"
              checked={formData.is_email_verified}
              onChange={handleChange('is_email_verified')}
              className="h-4 w-4 rounded border-gray-300"
              disabled={loading}
            />
            <Label htmlFor="is_email_verified" className="text-sm text-gray-600">
              Email is verified (user can login immediately)
            </Label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating User...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddUserScreen;