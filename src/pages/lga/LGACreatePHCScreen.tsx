import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LGALayout from '@/components/layout/LGALayout';
import { lgaAPI } from '@/services/lgaService';

interface FormErrors {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  admin_full_name?: string;
  admin_email?: string;
  non_field_errors?: string;
}

const LGACreatePHCScreen = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    admin_full_name: '',
    admin_email: '',
    latitude: '',
    longitude: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Facility name is required';
    if (!form.code.trim()) newErrors.code = 'Facility code is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s+()-]{7,}$/.test(form.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!form.admin_full_name.trim()) newErrors.admin_full_name = 'Admin full name is required';
    if (!form.admin_email.trim()) {
      newErrors.admin_email = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin_email)) {
      newErrors.admin_email = 'Invalid admin email format';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await lgaAPI.createPhc({
        name: form.name,
        code: form.code,
        address: form.address,
        phone: form.phone,
        email: form.email || undefined,
        admin_full_name: form.admin_full_name,
        admin_email: form.admin_email,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      });
      setSuccess('PHC facility created successfully! The admin credentials have been sent to the provided email.');
      setForm({ name: '', code: '', address: '', phone: '', email: '', admin_full_name: '', admin_email: '', latitude: '', longitude: '' });
    } catch (err: any) {
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          setError(data.detail);
        } else if (data.errors) {
          const mapped: FormErrors = {};
          Object.entries(data.errors).forEach(([key, value]) => {
            if (Array.isArray(value)) mapped[key as keyof FormErrors] = value[0];
          });
          setErrors(mapped);
          if (!Object.keys(mapped).length) setError('Failed to create PHC');
        } else {
          const mapped: FormErrors = {};
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) mapped[key as keyof FormErrors] = value[0];
          });
          setErrors(mapped);
          if (!Object.keys(mapped).length) setError('Failed to create PHC');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/lga/phcs')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New PHC</h1>
            <p className="text-sm text-gray-500">Create a new Primary Health Center under your LGA</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              PHC Facility Details
            </CardTitle>
            <CardDescription>Fill in the details for the new Primary Health Center</CardDescription>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Facility Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="e.g. Umuneze PHC"
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Facility Code</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={e => handleChange('code', e.target.value.toUpperCase())}
                    className={errors.code ? 'border-red-500' : ''}
                    placeholder="e.g. PHC/ABJ/001"
                  />
                  {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={e => handleChange('address', e.target.value)}
                  className={errors.address ? 'border-red-500' : ''}
                  placeholder="Full address of the facility"
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                    placeholder="+234..."
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="phc@example.com"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">PHC Admin Credentials</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin_full_name">Admin Full Name</Label>
                    <Input
                      id="admin_full_name"
                      value={form.admin_full_name}
                      onChange={e => handleChange('admin_full_name', e.target.value)}
                      className={errors.admin_full_name ? 'border-red-500' : ''}
                      placeholder="e.g. John Doe"
                    />
                    {errors.admin_full_name && <p className="text-sm text-red-500">{errors.admin_full_name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_email">Admin Email</Label>
                    <Input
                      id="admin_email"
                      type="email"
                      value={form.admin_email}
                      onChange={e => handleChange('admin_email', e.target.value)}
                      className={errors.admin_email ? 'border-red-500' : ''}
                      placeholder="admin@phc.example.com"
                    />
                    {errors.admin_email && <p className="text-sm text-red-500">{errors.admin_email}</p>}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  A temporary password will be generated and sent to the admin email.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={e => handleChange('latitude', e.target.value)}
                    placeholder="e.g. 9.0579"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={e => handleChange('longitude', e.target.value)}
                    placeholder="e.g. 7.4951"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create PHC
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/lga/phcs')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return <LGALayout>{content}</LGALayout>;
};

export default LGACreatePHCScreen;