import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Plus,
  Building,
  ArrowLeft,
  Loader2,
  CheckCircle as CheckCircleIcon,
  AlertCircle,
  Users,
  Upload,
  FileText,
  Loader2 as Spinner,
  X,
  Check,
  AlertTriangle,
  UserPlus,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminAPI } from '@/services/adminService';
import { lgaAPI } from '@/services/lgaService';

interface Facility {
  id: string;
  code: string;
  name: string;
  tier: string;
  address: string;
  phone: string;
  email: string;
  state: string;
  lga: string;
  zone: string;
  status: string;
}

interface LgaAccount {
  id: string;
  email: string;
  full_name: string;
  lga_name: string;
  state_name: string;
  total_phcs: number;
  is_active: boolean;
  created_at: string;
}

interface StateOption {
  state_id: string;
  state_name: string;
  lgas: { id: string; name: string; is_lcda: boolean }[];
}

interface CsvResult {
  total_rows: number;
  created: number;
  skipped: number;
  errors: { row: number; reason: string }[];
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

const AdminFacilitiesScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Facilities</TabsTrigger>
          <TabsTrigger value="create">Create Facility</TabsTrigger>
          <TabsTrigger value="lga-accounts">LGA Accounts</TabsTrigger>
          <TabsTrigger value="create-lga-account">Create LGA Account</TabsTrigger>
          <TabsTrigger value="csv-upload">CSV Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="all"><AllFacilitiesTab navigate={navigate} /></TabsContent>
        <TabsContent value="create"><CreateFacilityTab navigate={navigate} /></TabsContent>
        <TabsContent value="lga-accounts"><LgaAccountsTab navigate={navigate} /></TabsContent>
        <TabsContent value="create-lga-account"><CreateLgaAccountTab navigate={navigate} /></TabsContent>
        <TabsContent value="csv-upload"><CsvUploadTab navigate={navigate} /></TabsContent>
      </Tabs>
    </div>
  );
};

function AllFacilitiesTab({ navigate }: { navigate: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getAllFacilities();
        if (cancelled) return;
        const facilitiesData = res?.data?.results || res?.data?.data?.results || [];
        const mapped = facilitiesData.map((f: any) => ({
          id: f.id,
          code: f.code || '',
          name: f.name,
          tier: f.tier || f.type || 'phc',
          address: f.address || '',
          phone: f.phone || f.phone_number || '',
          email: f.email || '',
          state: f.state || '',
          lga: f.lga || '',
          zone: f.zone || '',
          status: f.status || 'active',
        }));
        setFacilities(mapped);
      } catch (err: any) {
        if (cancelled) return;
        if (err?.code === 'ERR_CANCELED' || err?.message?.includes('canceled')) return;
        console.error('Failed to load facilities:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFacilities();
    return () => { cancelled = true; };
  }, []);

  const getTypeBadge = (type: string) => {
    const types: Record<string, { bg: string; text: string; label: string }> = {
      phc: { bg: 'bg-green-100', text: 'text-green-700', label: 'PHC' },
      sth: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'STH' },
      stth: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'STTH' },
      fmc: { bg: 'bg-red-100', text: 'text-red-700', label: 'FMC' },
      fth: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'FTH' },
      hmo: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'HMO' },
      cln: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Clinic' },
      pvt: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Private' },
      ptth: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'PTTH' },
    };
    const info = types[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type.toUpperCase() };
    return <Badge className={`${info.bg} ${info.text}`}>{info.label}</Badge>;
  };

  const uniqueTiers = [...new Set(facilities.map(f => f.tier).filter(Boolean))];
  const uniqueStates = [...new Set(facilities.map(f => f.state).filter(Boolean))];

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = !searchQuery ||
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || f.tier?.toLowerCase() === tierFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchesState = stateFilter === 'all' || f.state === stateFilter;
    return matchesSearch && matchesTier && matchesStatus && matchesState;
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Facilities</h2>
          <p className="text-gray-500">Manage all healthcare facilities</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/system-admin/facilities/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Facilities</p>
          <p className="text-2xl font-bold">{loading ? '...' : facilities.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">States</p>
          <p className="text-2xl font-bold">{loading ? '...' : new Set(facilities.map(f => f.state)).size}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Tiers</p>
          <p className="text-2xl font-bold">{loading ? '...' : new Set(facilities.map(f => f.tier)).size}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {loading ? '...' : facilities.filter(f => f.status === 'active').length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, code, state, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">Tier:</span>
            <Button size="sm" variant={tierFilter === 'all' ? 'default' : 'outline'} onClick={() => setTierFilter('all')}>All</Button>
            {uniqueTiers.map(tier => (
              <Button key={tier} size="sm" variant={tierFilter === tier ? 'default' : 'outline'} onClick={() => setTierFilter(tier)}>
                {tier.toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">Status:</span>
            <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>All</Button>
            <Button size="sm" variant={statusFilter === 'active' ? 'default' : 'outline'} className={statusFilter === 'active' ? '' : 'text-green-600'} onClick={() => setStatusFilter('active')}>Active</Button>
            <Button size="sm" variant={statusFilter === 'inactive' ? 'default' : 'outline'} className={statusFilter === 'inactive' ? '' : 'text-red-600'} onClick={() => setStatusFilter('inactive')}>Inactive</Button>
          </div>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">State:</span>
            <Button size="sm" variant={stateFilter === 'all' ? 'default' : 'outline'} onClick={() => setStateFilter('all')}>All</Button>
            {uniqueStates.map(state => (
              <Button key={state} size="sm" variant={stateFilter === state ? 'default' : 'outline'} onClick={() => setStateFilter(state)}>
                {state}
              </Button>
            ))}
          </div>
          {(tierFilter !== 'all' || statusFilter !== 'all' || stateFilter !== 'all' || searchQuery) && (
            <Button size="sm" variant="ghost" className="text-gray-400 ml-auto" onClick={() => { setTierFilter('all'); setStatusFilter('all'); setStateFilter('all'); setSearchQuery(''); }}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((facility) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/system-admin/facilities/${facility.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{facility.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{facility.code}</p>
                  </div>
                </div>
                {facility.status === 'active' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                {getTypeBadge(facility.tier)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {facility.state || facility.lga || '-'}
                </div>
                {facility.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {facility.phone}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredFacilities.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'No facilities match your search' : 'No facilities yet'}
        </div>
      )}
    </>
  );
}

function CreateFacilityTab({ navigate }: { navigate: any }) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addingCustomLga, setAddingCustomLga] = useState(false);
  const [customLgaName, setCustomLgaName] = useState('');
  const [customLgaLoading, setCustomLgaLoading] = useState(false);
  const [customLgaError, setCustomLgaError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      }
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddCustomLga = async () => {
    if (!customLgaName.trim()) return;
    if (!form.state_id) { setCustomLgaError('Please select a state first'); return; }
    setCustomLgaError('');
    setCustomLgaLoading(true);
    try {
      const res = await lgaAPI.createCustomLga({ name: customLgaName.trim(), state_id: form.state_id, is_lcda: false });
      const newLga = res?.data || res;
      if (newLga?.id) {
        setStates(prev => prev.map(s => s.state_id === form.state_id ? { ...s, lgas: [...s.lgas, { id: newLga.id, name: newLga.name, is_lcda: false }] } : s));
        setForm(prev => ({ ...prev, lga_id: newLga.id, lga_custom_name: '' }));
        setCustomLgaName('');
        setAddingCustomLga(false);
      }
    } catch (err: any) {
      setCustomLgaError(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to add custom LGA');
    } finally {
      setCustomLgaLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
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
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
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
      if (form.lga_id) payload.lga_id = form.lga_id;
      else if (form.lga_custom_name) payload.lga_custom_name = form.lga_custom_name.trim();
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.email.trim()) payload.email = form.email.trim();
      await lgaAPI.createFacilityDirect(payload);
      setSuccess(`Facility created successfully. Admin credentials have been sent to ${form.admin_email}.`);
      setForm({ facility_type: '', state_id: '', lga_id: '', lga_custom_name: '', name: '', code: '', address: '', phone: '', email: '', admin_full_name: '', admin_email: '' });
    } catch (err: any) {
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.detail) setError(data.detail);
        else {
          const mapped: Record<string, string> = {};
          Object.entries(data).forEach(([key, value]) => { if (Array.isArray(value)) mapped[key] = value[0]; });
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
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/system-admin/facilities')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Facility</h2>
          <p className="text-sm text-gray-500">Create any facility type directly</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Facility Details</CardTitle>
          <CardDescription>Fill in the details to create a new facility</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && <Alert className="bg-green-50 border-green-200 text-green-800"><CheckCircleIcon className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}
            {error && <Alert className="bg-red-50 border-red-200 text-red-800"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

            <div className="space-y-2">
              <Label htmlFor="facility_type">Facility Type *</Label>
              <Select value={form.facility_type} onValueChange={v => handleChange('facility_type', v)}>
                <SelectTrigger id="facility_type" className={errors.facility_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select facility type" />
                </SelectTrigger>
                <SelectContent>
                  {FACILITY_TYPE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.facility_type && <p className="text-sm text-red-500">{errors.facility_type}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state_id">State *</Label>
                <Select value={form.state_id} onValueChange={v => handleChange('state_id', v)} disabled={loadingStates}>
                  <SelectTrigger id="state_id" className={errors.state_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={loadingStates ? 'Loading states...' : 'Select state'} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(s => <SelectItem key={s.state_id} value={s.state_id}>{s.state_name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.state_id && <p className="text-sm text-red-500">{errors.state_id}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lga_id">LGA / LCDA *</Label>
                {!addingCustomLga ? (
                  <Select value={form.lga_id} onValueChange={v => handleChange('lga_id', v)} disabled={!form.state_id}>
                    <SelectTrigger id="lga_id" className={errors.lga_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder={!form.state_id ? 'Select state first' : filteredLgas.length === 0 ? 'No LGAs found' : 'Select LGA'} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredLgas.map(lga => <SelectItem key={lga.id} value={lga.id}>{lga.name}{lga.is_lcda ? ' (LCDA)' : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder="Custom LGA name" value={customLgaName} onChange={e => { setCustomLgaName(e.target.value); setForm(prev => ({ ...prev, lga_custom_name: e.target.value })); setCustomLgaError(''); }} className="flex-1" />
                    <Button type="button" variant="outline" size="sm" onClick={() => { setAddingCustomLga(false); setCustomLgaName(''); setForm(prev => ({ ...prev, lga_custom_name: '' })); setCustomLgaError(''); }}>Cancel</Button>
                  </div>
                )}
                {errors.lga_id && !addingCustomLga && <p className="text-sm text-red-500">{errors.lga_id}</p>}
                {customLgaError && <p className="text-sm text-red-500">{customLgaError}</p>}
              </div>
            </div>

            {!addingCustomLga && form.state_id && (
              <Button type="button" variant="link" className="text-blue-600 p-0 h-auto text-xs" onClick={() => setAddingCustomLga(true)}>
                <Plus className="h-3 w-3 mr-1" />Not in list? Type name here
              </Button>
            )}
            {addingCustomLga && (
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" onClick={handleAddCustomLga} disabled={!customLgaName.trim() || customLgaLoading} className="bg-blue-600 hover:bg-blue-700">
                  {customLgaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Facility Name *</Label>
                <Input id="name" value={form.name} onChange={e => handleChange('name', e.target.value)} className={errors.name ? 'border-red-500' : ''} placeholder="e.g. Kogi State Primary Health Centre" />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Facility Code *</Label>
                <Input id="code" value={form.code} onChange={e => handleChange('code', e.target.value.toUpperCase())} className={errors.code ? 'border-red-500' : ''} placeholder="e.g. PHC-LAG-001" />
                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={e => handleChange('address', e.target.value)} className={errors.address ? 'border-red-500' : ''} placeholder="Full address" />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={e => handleChange('phone', e.target.value)} className={errors.phone ? 'border-red-500' : ''} placeholder="+234..." />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className={errors.email ? 'border-red-500' : ''} placeholder="facility@example.com" />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Facility Admin Credentials</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_full_name">Admin Full Name *</Label>
                  <Input id="admin_full_name" value={form.admin_full_name} onChange={e => handleChange('admin_full_name', e.target.value)} className={errors.admin_full_name ? 'border-red-500' : ''} placeholder="e.g. John Doe" />
                  {errors.admin_full_name && <p className="text-sm text-red-500">{errors.admin_full_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Admin Email *</Label>
                  <Input id="admin_email" type="email" value={form.admin_email} onChange={e => handleChange('admin_email', e.target.value)} className={errors.admin_email ? 'border-red-500' : ''} placeholder="admin@facility.example.com" />
                  {errors.admin_email && <p className="text-sm text-red-500">{errors.admin_email}</p>}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">A temporary password will be generated and sent to the admin email.</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Facility
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/system-admin/facilities')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function LgaAccountsTab({ navigate }: { navigate: any }) {
  const [accounts, setAccounts] = useState<LgaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const res = await lgaAPI.listLgaAccounts();
        if (cancelled) return;
        const data = res?.data?.accounts || [];
        setAccounts(data.map((a: any) => ({
          id: a.id,
          email: a.user_email,
          full_name: a.full_name,
          lga_name: a.lga_name,
          state_name: a.state_name,
          total_phcs: a.total_phcs ?? 0,
          is_active: a.is_active ?? true,
          created_at: a.created_at,
        })));
      } catch (err: any) {
        if (cancelled) return;
        if (err?.code === 'ERR_CANCELED') return;
        setError('Failed to load LGA accounts');
        console.error('Failed to load LGA accounts:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAccounts();
    return () => { cancelled = true; };
  }, []);

  const filteredAccounts = accounts.filter(a => {
    const q = searchQuery.toLowerCase();
    return !q || a.full_name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.lga_name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">LGA Accounts</h2>
          <p className="text-sm text-gray-500">{filteredAccounts.length} LGA admin account(s)</p>
        </div>
        <Button onClick={() => navigate('/system-admin/facilities/lga-accounts/create')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />Create Account
        </Button>
      </div>

      {error && <Alert className="bg-red-50 border-red-200 text-red-800"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />All LGA Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by name, email, or LGA..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
          ) : filteredAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Building2 className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-sm">No LGA accounts found</p>
              <Button variant="link" onClick={() => navigate('/system-admin/facilities/lga-accounts/create')}>Create the first account</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>LGA</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>PHCs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map(account => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.full_name}</TableCell>
                    <TableCell className="text-gray-500">{account.email}</TableCell>
                    <TableCell>{account.lga_name}</TableCell>
                    <TableCell>{account.state_name}</TableCell>
                    <TableCell>{account.total_phcs}</TableCell>
                    <TableCell>
                      <Badge className={account.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{account.created_at ? new Date(account.created_at).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateLgaAccountTab({ navigate }: { navigate: any }) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addingCustomLga, setAddingCustomLga] = useState(false);
  const [customLgaName, setCustomLgaName] = useState('');
  const [customLgaLoading, setCustomLgaLoading] = useState(false);
  const [customLgaError, setCustomLgaError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({ state_id: '', lga_id: '', lga_custom_name: '', full_name: '', email: '' });

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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAddCustomLga = async () => {
    if (!customLgaName.trim()) return;
    if (!form.state_id) { setCustomLgaError('Please select a state first'); return; }
    setCustomLgaError('');
    setCustomLgaLoading(true);
    try {
      const res = await lgaAPI.createCustomLga({ name: customLgaName.trim(), state_id: form.state_id, is_lcda: false });
      const newLga = res?.data || res;
      if (newLga?.id) {
        setStates(prev => prev.map(s => s.state_id === form.state_id ? { ...s, lgas: [...s.lgas, { id: newLga.id, name: newLga.name, is_lcda: false }] } : s));
        setForm(prev => ({ ...prev, lga_id: newLga.id, lga_custom_name: '' }));
        setCustomLgaName('');
        setAddingCustomLga(false);
      }
    } catch (err: any) {
      setCustomLgaError(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to add custom LGA');
    } finally {
      setCustomLgaLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.state_id) newErrors.state_id = 'State is required';
    if (!form.lga_id && !form.lga_custom_name) newErrors.lga_id = 'LGA is required — select from list or add a custom one';
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setSubmitting(true);
    try {
      const payload: any = { full_name: form.full_name.trim(), email: form.email.trim(), state_id: form.state_id };
      if (form.lga_id) payload.lga_id = form.lga_id;
      else if (form.lga_custom_name) payload.lga_custom_name = form.lga_custom_name.trim();
      await lgaAPI.createLgaAccount(payload);
      setSuccess(`LGA account created. Login credentials have been sent to ${form.email.trim()}.`);
      setForm({ state_id: '', lga_id: '', lga_custom_name: '', full_name: '', email: '' });
    } catch (err: any) {
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.detail) setError(data.detail);
        else {
          const mapped: Record<string, string> = {};
          Object.entries(data).forEach(([key, value]) => { if (Array.isArray(value)) mapped[key] = value[0]; });
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
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/system-admin/facilities?tab=lga-accounts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create LGA Account</h2>
          <p className="text-sm text-gray-500">Create a new LGA admin account</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />LGA Account Details</CardTitle>
          <CardDescription>Fill in the details for the new LGA admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && <Alert className="bg-green-50 border-green-200 text-green-800"><CheckCircleIcon className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}
            {error && <Alert className="bg-red-50 border-red-200 text-red-800"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state_id">State *</Label>
                <Select value={form.state_id} onValueChange={v => handleChange('state_id', v)} disabled={loadingStates}>
                  <SelectTrigger id="state_id" className={errors.state_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={loadingStates ? 'Loading states...' : 'Select state'} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(s => <SelectItem key={s.state_id} value={s.state_id}>{s.state_name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.state_id && <p className="text-sm text-red-500">{errors.state_id}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lga_id">LGA / LCDA *</Label>
                {!addingCustomLga ? (
                  <Select value={form.lga_id} onValueChange={v => handleChange('lga_id', v)} disabled={!form.state_id}>
                    <SelectTrigger id="lga_id" className={errors.lga_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder={!form.state_id ? 'Select state first' : filteredLgas.length === 0 ? 'No LGAs found' : 'Select LGA'} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredLgas.map(lga => <SelectItem key={lga.id} value={lga.id}>{lga.name}{lga.is_lcda ? ' (LCDA)' : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder="Custom LGA name" value={customLgaName} onChange={e => { setCustomLgaName(e.target.value); setForm(prev => ({ ...prev, lga_custom_name: e.target.value })); setCustomLgaError(''); }} className="flex-1" />
                    <Button type="button" variant="outline" size="sm" onClick={() => { setAddingCustomLga(false); setCustomLgaName(''); setForm(prev => ({ ...prev, lga_custom_name: '' })); setCustomLgaError(''); }}>Cancel</Button>
                  </div>
                )}
                {errors.lga_id && !addingCustomLga && <p className="text-sm text-red-500">{errors.lga_id}</p>}
                {customLgaError && <p className="text-sm text-red-500">{customLgaError}</p>}
              </div>
            </div>

            {!addingCustomLga && form.state_id && (
              <Button type="button" variant="link" className="text-blue-600 p-0 h-auto text-xs" onClick={() => setAddingCustomLga(true)}>
                <Plus className="h-3 w-3 mr-1" />Not in list? Type name here
              </Button>
            )}
            {addingCustomLga && (
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" onClick={handleAddCustomLga} disabled={!customLgaName.trim() || customLgaLoading} className="bg-blue-600 hover:bg-blue-700">
                  {customLgaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} className={errors.full_name ? 'border-red-500' : ''} placeholder="e.g. John Doe" />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className={errors.email ? 'border-red-500' : ''} placeholder="lgaadmin@example.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} className={errors.phone ? 'border-red-500' : ''} placeholder="+2348000000000" />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Account
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/system-admin/facilities?tab=lga-accounts')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function CsvUploadTab({ navigate }: { navigate: any }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<CsvResult | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) { setError('Please upload a CSV file'); return; }
      if (selected.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB'); return; }
      setFile(selected);
      setError('');
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (!dropped.name.endsWith('.csv')) { setError('Please upload a CSV file'); return; }
      if (dropped.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB'); return; }
      setFile(dropped);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await lgaAPI.uploadFacilitiesCsv(formData);
      const data = res?.data || res;
      setResult({ total_rows: data.total_rows ?? 0, created: data.created ?? 0, skipped: data.skipped ?? 0, errors: data.errors ?? [] });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      if (err?.response?.data?.detail) setError(err.response.data.detail);
      else if (err?.response?.data?.error) setError(err.response.data.error);
      else setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/system-admin/facilities')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CSV Upload</h2>
          <p className="text-sm text-gray-500">Bulk upload health facilities via CSV</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Upload Facilities CSV</CardTitle>
          <CardDescription>Upload a CSV file containing health facility data. Max file size: 10MB.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <Alert className="bg-red-50 border-red-200 text-red-800"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {!file ? (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer" onDragOver={e => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 mb-1">Drag and drop your CSV file here</p>
              <p className="text-xs text-gray-400 mb-3">or click to browse</p>
              <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse Files</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleUpload} disabled={uploading} className="bg-blue-600 hover:bg-blue-700">
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Upload
                </Button>
                <Button variant="ghost" size="icon" onClick={removeFile} disabled={uploading}><X className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {result && (
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-green-600" />Upload Complete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{result.total_rows}</p>
                    <p className="text-xs text-gray-500">Total Rows</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{result.created}</p>
                    <p className="text-xs text-green-600">Created</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-700">{result.skipped}</p>
                    <p className="text-xs text-yellow-600">Skipped</p>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-red-700 mb-2"><AlertCircle className="h-4 w-4 inline mr-1" />{result.errors.length} error{result.errors.length > 1 ? 's' : ''} encountered:</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((err, i) => <p key={i} className="text-xs text-red-700"><span className="font-medium">Row {err.row}:</span> {err.reason}</p>)}
                    </div>
                  </div>
                )}
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setResult(null)}>Upload Another File</Button>
              </CardContent>
            </Card>
          )}

          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">CSV Format</p>
            <p className="text-xs text-gray-500 mb-2">The CSV should include the following columns:</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 font-mono">
              <span>name</span><span>facility_type</span>
              <span>address</span><span>phone_number</span>
              <span>email</span><span>latitude</span>
              <span>longitude</span><span>lga</span>
              <span>state</span><span>zone</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminFacilitiesScreen;