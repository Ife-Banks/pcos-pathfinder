import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lgaAPI } from '@/services/lgaService';

interface StateOption {
  state_id: string;
  state_name: string;
  lgas: { id: string; name: string; is_lcda: boolean }[];
}

interface FormErrors {
  facility_type?: string;
  state_id?: string;
  lga_id?: string;
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  admin_full_name?: string;
  admin_email?: string;
  non_field_errors?: string;
}

const FACILITY_TYPE_OPTIONS = [
  { value: 'phc', label: 'Primary Health Centre (PHC)' },
  { value: 'fmc', label: 'Federal Medical Centre (FMC)' },
  { value: 'state_hospital', label: 'State General Hospital (STH)' },
  { value: 'state_teaching_hospital', label: 'State Teaching Hospital (STTH)' },
  { value: 'federal_teaching_hospital', label: 'Federal Teaching Hospital (FTH)' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'private_hospital', label: 'Private Hospital' },
  { value: 'private_teaching_hospital', label: 'Private Teaching Hospital' },
  { value: 'hmo', label: 'Health Maintenance Organization (HMO)' },
];

const AdminCreateFacilityScreen = () => {
  const navigate = useNavigate();
  const [states, setStates] = useState<StateOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addingCustomLga, setAddingCustomLga] = useState(false);
  const [customLgaName, setCustomLgaName] = useState('');
  const [customLgaLoading, setCustomLgaLoading] = useState(false);
  const [customLgaError, setCustomLgaError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    facility_type: '',
    state_id: '',
    lga_id: '',
    lga_custom_name: '',
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    admin_full_name: '',
    admin_email: '',
  });

  useEffect(() => {
    const fetchLgas = async () => {
      try {
        const res = await lgaAPI.listLgas();
        const data = res?.data?.states || [];
        setStates(data);
      } catch (err) {
        console.error('Failed to load LGAs:', err);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchLgas();
  }, []);

  const selectedState = states.find(s => s.state_id === form.state_id);
  const filteredLgas = selectedState?.lgas || [];

  const handleChange = (field: string, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'state_id') {
        updated.lga_id = '';
        updated.lga_custom_name = '';
        setCustomLgaName('');
      }
      return updated;
    });
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddCustomLga = async () => {
    if (!customLgaName.trim()) return;
    if (!form.state_id) {
      setCustomLgaError('Please select a state first');
      return;
    }
    setCustomLgaError('');
    setCustomLgaLoading(true);
    try {
      const res = await lgaAPI.createCustomLga({
        name: customLgaName.trim(),
        state_id: form.state_id,
        is_lcda: false,
      });
      const newLga = res?.data || res;
      if (newLga?.id) {
        setStates(prev => prev.map(s =>
          s.state_id === form.state_id
            ? { ...s, lgas: [...s.lgas, { id: newLga.id, name: newLga.name, is_lcda: false }] }
            : s
        ));
        setForm(prev => ({ ...prev, lga_id: newLga.id, lga_custom_name: '' }));
        setCustomLgaName('');
        setAddingCustomLga(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to add custom LGA';
      setCustomLgaError(msg);
    } finally {
      setCustomLgaLoading(false);
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!form.facility_type) newErrors.facility_type = 'Facility type is required';
    if (!form.state_id) newErrors.state_id = 'State is required';
    if (!form.lga_id && !form.lga_custom_name) newErrors.lga_id = 'LGA is required — select from list or add a custom one';
    if (!form.name.trim()) newErrors.name = 'Facility name is required';
    if (!form.code.trim()) newErrors.code = 'Facility code is required';
    if (!form.admin_full_name.trim()) newErrors.admin_full_name = 'Admin full name is required';
    if (!form.admin_email.trim()) {
      newErrors.admin_email = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin_email)) {
      newErrors.admin_email = 'Invalid email format';
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
      const payload: any = {
        facility_type: form.facility_type,
        name: form.name.trim(),
        code: form.code.trim(),
        state_id: form.state_id,
        admin_full_name: form.admin_full_name.trim(),
        admin_email: form.admin_email.trim(),
      };
      if (form.lga_id) {
        payload.lga_id = form.lga_id;
      } else if (form.lga_custom_name) {
        payload.lga_custom_name = form.lga_custom_name.trim();
      }
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.email.trim()) payload.email = form.email.trim();

      const res = await lgaAPI.createFacilityDirect(payload);
      setSuccess(`Facility created successfully. Admin credentials have been sent to ${form.admin_email}.`);
      setForm({
        facility_type: form.facility_type,
        state_id: form.state_id,
        lga_id: '',
        lga_custom_name: '',
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        admin_full_name: '',
        admin_email: '',
      });
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
          if (!Object.keys(mapped).length) setError('Failed to create facility');
        } else {
          const mapped: FormErrors = {};
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) mapped[key as keyof FormErrors] = value[0];
          });
          setErrors(mapped);
          if (!Object.keys(mapped).length) setError('Failed to create facility');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/system-admin/facilities?tab=all')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Facility</h1>
            <p className="text-sm text-gray-500">Create any facility type directly</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Facility Details
            </CardTitle>
            <CardDescription>Fill in the details to create a new facility</CardDescription>
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

              <div className="space-y-2">
                <Label htmlFor="facility_type">Facility Type *</Label>
                <Select
                  value={form.facility_type}
                  onValueChange={v => handleChange('facility_type', v)}
                >
                  <SelectTrigger id="facility_type" className={errors.facility_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select facility type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACILITY_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.facility_type && <p className="text-sm text-red-500">{errors.facility_type}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state_id">State *</Label>
                  <Select
                    value={form.state_id}
                    onValueChange={v => handleChange('state_id', v)}
                    disabled={loadingStates}
                  >
                    <SelectTrigger id="state_id" className={errors.state_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder={loadingStates ? 'Loading states...' : 'Select state'} />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(s => (
                        <SelectItem key={s.state_id} value={s.state_id}>
                          {s.state_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state_id && <p className="text-sm text-red-500">{errors.state_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lga_id">LGA / LCDA *</Label>
                  {!addingCustomLga ? (
                    <Select
                      value={form.lga_id}
                      onValueChange={v => handleChange('lga_id', v)}
                      disabled={!form.state_id}
                    >
                      <SelectTrigger id="lga_id" className={errors.lga_id ? 'border-red-500' : ''}>
                        <SelectValue
                          placeholder={
                            !form.state_id
                              ? 'Select state first'
                              : filteredLgas.length === 0
                              ? 'No LGAs found'
                              : 'Select LGA'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredLgas.map(lga => (
                          <SelectItem key={lga.id} value={lga.id}>
                            {lga.name}{lga.is_lcda ? ' (LCDA)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Custom LGA name"
                        value={customLgaName}
                        onChange={e => {
                          setCustomLgaName(e.target.value);
                          setForm(prev => ({ ...prev, lga_custom_name: e.target.value }));
                          setCustomLgaError('');
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAddingCustomLga(false);
                          setCustomLgaName('');
                          setForm(prev => ({ ...prev, lga_custom_name: '' }));
                          setCustomLgaError('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {errors.lga_id && !addingCustomLga && <p className="text-sm text-red-500">{errors.lga_id}</p>}
                  {customLgaError && (
                    <p className="text-sm text-red-500">{customLgaError}</p>
                  )}
                </div>
              </div>

              {!addingCustomLga && form.state_id && (
                <Button
                  type="button"
                  variant="link"
                  className="text-blue-600 p-0 h-auto text-xs"
                  onClick={() => setAddingCustomLga(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Not in list? Type name here
                </Button>
              )}

              {addingCustomLga && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomLga}
                    disabled={!customLgaName.trim() || customLgaLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {customLgaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Facility Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="e.g. Kogi State Primary Health Centre"
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Facility Code *</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={e => handleChange('code', e.target.value.toUpperCase())}
                    className={errors.code ? 'border-red-500' : ''}
                    placeholder="e.g. PHC-LAG-001"
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
                  placeholder="Full address"
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="facility@example.com"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Facility Admin Credentials</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin_full_name">Admin Full Name *</Label>
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
                    <Label htmlFor="admin_email">Admin Email *</Label>
                    <Input
                      id="admin_email"
                      type="email"
                      value={form.admin_email}
                      onChange={e => handleChange('admin_email', e.target.value)}
                      className={errors.admin_email ? 'border-red-500' : ''}
                      placeholder="admin@facility.example.com"
                    />
                    {errors.admin_email && <p className="text-sm text-red-500">{errors.admin_email}</p>}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  A temporary password will be generated and sent to the admin email.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Facility
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/system-admin/facilities?tab=all')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCreateFacilityScreen;