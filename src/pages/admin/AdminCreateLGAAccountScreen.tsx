import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Loader2, CheckCircle, AlertCircle, UserPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lgaAPI } from '@/services/lgaService';

interface StateGroup {
  state_id: string;
  state_name: string;
  lgas: { id: string; name: string; is_lcda: boolean }[];
}

interface FormErrors {
  state_id?: string;
  lga_id?: string;
  full_name?: string;
  email?: string;
}

const AdminCreateLGAAccountScreen = () => {
  const navigate = useNavigate();
  const [states, setStates] = useState<StateGroup[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addingCustomLga, setAddingCustomLga] = useState(false);
  const [customLgaName, setCustomLgaName] = useState('');
  const [customLgaLoading, setCustomLgaLoading] = useState(false);
  const [customLgaError, setCustomLgaError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [createdEmail, setCreatedEmail] = useState('');

  const [form, setForm] = useState({
    state_id: '',
    lga_id: '',
    lga_custom_name: '',
    full_name: '',
    email: '',
  });

  useEffect(() => {
    const fetchLgas = async () => {
      try {
        const res = await lgaAPI.listLgas();
        setStates(res?.data?.states || []);
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
        setAddingCustomLga(false);
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
        setStates(prev => prev.map(s => {
          if (s.state_id !== form.state_id) return s;
          const alreadyExists = s.lgas.some(l => l.id === newLga.id);
          return alreadyExists
            ? s
            : { ...s, lgas: [...s.lgas, { id: newLga.id, name: newLga.name, is_lcda: false }] };
        }));
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
    if (!form.state_id) newErrors.state_id = 'State is required';
    if (!form.lga_id && !form.lga_custom_name) newErrors.lga_id = 'LGA is required — select from list or add a custom one';
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
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
      let lgaId = form.lga_id;
      if (!lgaId && form.lga_custom_name) {
        const customRes = await lgaAPI.createCustomLga({ name: form.lga_custom_name.trim(), state_id: form.state_id, is_lcda: false });
        const newLga = customRes?.data || customRes;
        lgaId = newLga?.id;
        if (!lgaId) throw new Error('Failed to create custom LGA');
      }
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        state_id: form.state_id,
        lga_id: lgaId,
      };

      await lgaAPI.createLgaAccount(payload);
      setCreatedEmail(form.email.trim());
      setSuccess(`LGA account created. Login credentials have been sent to ${form.email.trim()}.`);
      setForm({ state_id: '', lga_id: '', lga_custom_name: '', full_name: '', email: '' });
    } catch (err: any) {
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          setError(data.detail);
        } else {
          const mapped: FormErrors = {};
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) mapped[key as keyof FormErrors] = value[0];
          });
          setErrors(mapped);
          if (!Object.keys(mapped).length) setError('Failed to create LGA account');
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/system-admin/facilities?tab=lga-accounts')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create LGA Account</h1>
            <p className="text-sm text-gray-500">Create a new LGA admin account</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              LGA Account Details
            </CardTitle>
            <CardDescription>Fill in the details for the new LGA admin account</CardDescription>
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
                      {states.sort((a, b) => a.state_name.localeCompare(b.state_name)).map(s => (
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
                        {filteredLgas.sort((a, b) => a.name.localeCompare(b.name)).map(lga => (
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
                  {customLgaError && <p className="text-sm text-red-500">{customLgaError}</p>}
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
                  placeholder="lgaadmin@example.com"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/system-admin/facilities?tab=lga-accounts')}>
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

export default AdminCreateLGAAccountScreen;