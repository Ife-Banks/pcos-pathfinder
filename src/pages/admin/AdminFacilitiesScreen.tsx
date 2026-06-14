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
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/services/adminService';

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

const AdminFacilitiesScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
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
        setTotal(mapped.length);
      } catch (err: any) {
        if (cancelled) return;
        // Ignore aborted/cancelled requests
        if (err?.code === 'ERR_CANCELED' || err?.message?.includes('canceled')) {
          return;
        }
        console.error('Failed to load facilities:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
          <p className="text-gray-500">Manage all healthcare facilities</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/system-admin/facilities/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
      </div>

      {/* Stats */}
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

      {/* Search & Filters */}
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
          {/* Tier filter */}
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">Tier:</span>
            <Button size="sm" variant={tierFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setTierFilter('all')}>All</Button>
            {uniqueTiers.map(tier => (
              <Button key={tier} size="sm"
                variant={tierFilter === tier ? 'default' : 'outline'}
                onClick={() => setTierFilter(tier)}>
                {tier.toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          {/* Status filter */}
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">Status:</span>
            <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}>All</Button>
            <Button size="sm" variant={statusFilter === 'active' ? 'default' : 'outline'}
              className={statusFilter === 'active' ? '' : 'text-green-600'}
              onClick={() => setStatusFilter('active')}>Active</Button>
            <Button size="sm" variant={statusFilter === 'inactive' ? 'default' : 'outline'}
              className={statusFilter === 'inactive' ? '' : 'text-red-600'}
              onClick={() => setStatusFilter('inactive')}>Inactive</Button>
          </div>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          {/* State filter */}
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">State:</span>
            <Button size="sm" variant={stateFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStateFilter('all')}>All</Button>
            {uniqueStates.map(state => (
              <Button key={state} size="sm"
                variant={stateFilter === state ? 'default' : 'outline'}
                onClick={() => setStateFilter(state)}>
                {state}
              </Button>
            ))}
          </div>
          {(tierFilter !== 'all' || statusFilter !== 'all' || stateFilter !== 'all' || searchQuery) && (
            <Button size="sm" variant="ghost" className="text-gray-400 ml-auto"
              onClick={() => { setTierFilter('all'); setStatusFilter('all'); setStateFilter('all'); setSearchQuery(''); }}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
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
    </div>
  );
};

export default AdminFacilitiesScreen;