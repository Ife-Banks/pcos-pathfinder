// Gov Admin Portal — GovFacilitiesScreen.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Plus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/ui/PhoneInput';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { govAdminAPI, GovFacility } from '@/services/govAdminService';

const tierOptions = [
  { value: 'sth', label: 'State Teaching Hospital' },
  { value: 'stth', label: 'State General Hospital' },
];

const GovFacilitiesScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const u = user as Record<string, unknown> | null;
  const userRole = (u?.role as string) || '';
  const lgaName = (u?.lga_name as string) || (u?.lga as string) || '';
  const stateName = (u?.state_name as string) || (u?.state as string) || '';
  const isAdmin = userRole === 'lga_admin';
  const heading = isAdmin ? 'PHC Facilities' : 'State Facilities';
  const addLabel = isAdmin ? 'Add PHC' : 'Add Facility';

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Facilities</TabsTrigger>
          <TabsTrigger value="create">Create Facility</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AllFacilitiesTab
            navigate={navigate}
            lgaName={lgaName}
            stateName={stateName}
            isAdmin={isAdmin}
            heading={heading}
            addLabel={addLabel}
            onCreateClick={() => setActiveTab('create')}
          />
        </TabsContent>
        <TabsContent value="create">
          <CreateFacilityTab
            navigate={navigate}
            lgaName={lgaName}
            stateName={stateName}
            isAdmin={isAdmin}
            onCancel={() => setActiveTab('all')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function AllFacilitiesTab({
  navigate,
  lgaName,
  stateName,
  isAdmin,
  heading,
  addLabel,
  onCreateClick,
}: {
  navigate: ReturnType<typeof useNavigate>;
  lgaName: string;
  stateName: string;
  isAdmin: boolean;
  heading: string;
  addLabel: string;
  onCreateClick: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState<GovFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState(isAdmin ? 'phc' : 'all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, tierFilter]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params: {
          page?: number;
          page_size?: number;
          search?: string;
          tier?: string;
        } = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        if (!isAdmin && tierFilter !== 'all') params.tier = tierFilter;
        if (isAdmin) params.tier = 'phc';
        const res = await govAdminAPI.getGovFacilities(params);
        if (cancelled) return;
        const data = res?.data;
        setFacilities(data?.results || []);
        setTotal(data?.count || 0);
      } catch (err) {
        if (!cancelled) console.error('Failed to load facilities:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page, searchQuery, tierFilter, isAdmin]);

  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      !searchQuery ||
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
          <p className="text-gray-500 flex items-center gap-1">
            <MapPin className="h-4 w-4 text-teal-500" />
            {lgaName}
            {stateName ? `, ${stateName}` : ''}
          </p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700"
          onClick={onCreateClick}
        >
          <Plus className="h-4 w-4 mr-2" />
          {addLabel}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total {isAdmin ? 'PHCs' : 'Facilities'}</p>
          <p className="text-2xl font-bold">{loading ? '...' : facilities.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {loading ? '...' : facilities.filter((f) => f.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600">
            {loading ? '...' : facilities.filter((f) => f.status !== 'active').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, code, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {isAdmin ? (
            <div className="flex gap-1 items-center">
              <span className="text-xs text-gray-500 mr-1">Tier:</span>
              <Input
                value="PHC Only"
                disabled
                className="w-28 h-8 text-xs bg-gray-50"
              />
            </div>
          ) : (
            <div className="flex gap-1 items-center">
              <span className="text-xs text-gray-500 mr-1">Tier:</span>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  {tierOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">Status:</span>
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              className={statusFilter === 'active' ? '' : 'text-green-600'}
              onClick={() => setStatusFilter('active')}
            >
              Active
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'inactive' ? 'default' : 'outline'}
              className={statusFilter === 'inactive' ? '' : 'text-red-600'}
              onClick={() => setStatusFilter('inactive')}
            >
              Inactive
            </Button>
          </div>
          {(statusFilter !== 'all' || searchQuery) && (
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 ml-auto"
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Facility Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((facility) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {facility.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      {facility.code}
                    </p>
                  </div>
                </div>
                {facility.status === 'active' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-teal-100 text-teal-700">
                  {facility.tier?.toUpperCase() || (isAdmin ? 'PHC' : '')}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {facility.lga || facility.state || '-'}
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
          {searchQuery
            ? 'No facilities match your search'
            : `No ${isAdmin ? 'PHC' : 'facility'}${isAdmin ? '' : 's'} in this ${isAdmin ? 'LGA' : 'state'} yet`}
        </div>
      )}

      {/* Pagination */}
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
                setPage((p) =>
                  Math.min(Math.ceil(total / pageSize), p + 1)
                )
              }
              disabled={page >= Math.ceil(total / pageSize)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function CreateFacilityTab({
  navigate,
  lgaName,
  stateName,
  isAdmin,
  onCancel,
}: {
  navigate: ReturnType<typeof useNavigate>;
  lgaName: string;
  stateName: string;
  isAdmin: boolean;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '',
    code: '',
    tier: isAdmin ? 'phc' : 'sth',
    address: '',
    phone: '',
    email: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Facility name is required';
    if (!form.code.trim()) newErrors.code = 'Facility code is required';
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
      await govAdminAPI.createGovFacility({
        name: form.name.trim(),
        code: form.code.trim(),
        state: stateName,
        lga: lgaName,
        tier: form.tier,
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      setSuccess(`Facility "${form.name}" created successfully.`);
      setForm({
        name: '',
        code: '',
        tier: isAdmin ? 'phc' : 'sth',
        address: '',
        phone: '',
        email: '',
      });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { detail?: string; [key: string]: unknown } };
      };
      if (axiosErr?.response?.data) {
        const data = axiosErr.response.data;
        if (data.detail) {
          setError(data.detail as string);
        } else {
          const mapped: Record<string, string> = {};
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) mapped[key] = value[0] as string;
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
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Create PHC Facility' : 'Create Facility'}
          </h2>
          <p className="text-sm text-gray-500">
            {isAdmin
              ? `Add a new Primary Health Centre to ${lgaName}`
              : `Add a new facility to ${stateName || 'your state'}`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isAdmin ? 'PHC Details' : 'Facility Details'}
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? 'Fill in the details to create a new PHC'
              : 'Fill in the details to create a new facility'}
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

            {isAdmin ? (
              <div className="space-y-2">
                <Label className="text-gray-500">Facility Tier</Label>
                <Input
                  value="Primary Health Centre (PHC)"
                  disabled
                  className="bg-gray-50"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="tier">Facility Tier *</Label>
                <Select
                  value={form.tier}
                  onValueChange={(value) => handleChange('tier', value)}
                >
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* State & LGA locked */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-500">State</Label>
                <Input value={stateName} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-500">LGA</Label>
                <Input value={lgaName} disabled className="bg-gray-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder={isAdmin ? 'e.g. Apata PHC' : 'e.g. General Hospital'}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{isAdmin ? 'PHC Code *' : 'Facility Code *'}</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) =>
                    handleChange('code', e.target.value.toUpperCase())
                  }
                  className={errors.code ? 'border-red-500' : ''}
                  placeholder={isAdmin ? 'e.g. PHC-APT-001' : 'e.g. STH-LAG-001'}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Full address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <PhoneInput
                  value={form.phone}
                  onChange={(value) => handleChange('phone', value)}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="facility@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
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
                {isAdmin ? 'Create PHC' : 'Create Facility'}
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

export default GovFacilitiesScreen;
