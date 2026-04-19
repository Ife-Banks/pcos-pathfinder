import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminAPI } from '@/services/adminService';

interface Country {
  id: string;
  name: string;
  code: string;
}

interface State {
  id: string;
  name: string;
  code: string;
  zone: string;
}

interface FacilityFormData {
  name: string;
  code: string;
  tier: string;
  facility_type: string;
  country: string;
  state: string;
  lga: string;
  zone: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  license_number: string;
}

const AdminAddFacilityScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [formData, setFormData] = useState<FacilityFormData>({
    name: '',
    code: '',
    tier: 'PHC',
    facility_type: 'public',
    country: '',
    state: '',
    lga: '',
    zone: '',
    address: '',
    phone: '',
    email: '',
    status: 'active',
    license_number: '',
  });

  // Tier options grouped by facility type
  const tierOptionsByType: Record<string, { value: string; label: string }[]> = {
    public: [
      { value: 'PHC', label: 'Primary Health Centre (PHC)' },
      { value: 'STH', label: 'State General Hospital (STH)' },
      { value: 'FMC', label: 'Federal Medical Centre (FMC)' },
      { value: 'STTH', label: 'State Teaching Hospital (STTH)' },
      { value: 'FTH', label: 'Federal Teaching Hospital (FTH)' },
    ],
    private: [
      { value: 'CLN', label: 'Clinic' },
      { value: 'PVT', label: 'Private Hospital' },
      { value: 'PTTH', label: 'Private Teaching Hospital' },
    ],
    insurance: [
      { value: 'HMO', label: 'Health Maintenance Organization (HMO)' },
    ],
  };

  const facilityTypeOptions = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'insurance', label: 'Insurance (HMO)' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending Verification' },
  ];

  const zoneOptions = [
    { value: 'NC', label: 'North-Central (NC)' },
    { value: 'NE', label: 'North-East (NE)' },
    { value: 'NW', label: 'North-West (NW)' },
    { value: 'SE', label: 'South-East (SE)' },
    { value: 'SS', label: 'South-South (SS)' },
    { value: 'SW', label: 'South-West (SW)' },
  ];

  // Get current tier options based on selected facility type
  const currentTierOptions = tierOptionsByType[formData.facility_type] || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const countryRes = await adminAPI.getCountries();
        const countryData = countryRes?.data?.results || countryRes?.data?.data?.results || [];
        setCountries(countryData);
        
        if (countryData.length > 0) {
          setFormData(prev => ({ ...prev, country: countryData[0].id }));
          const stateRes = await adminAPI.getStates(countryData[0].id);
          const stateData = stateRes?.data?.results || stateRes?.data?.data?.results || [];
          setStates(stateData);
        }
      } catch (err) {
        console.error('Failed to load countries:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Reset tier when facility_type changes
      if (name === 'facility_type') {
        const newTierOptions = tierOptionsByType[value] || [];
        return { 
          ...prev, 
          [name]: value,
          tier: newTierOptions.length > 0 ? newTierOptions[0].value : ''
        };
      }
      return { ...prev, [name]: value };
    });
    
    if (name === 'country') {
      const fetchStates = async () => {
        try {
          const stateRes = await adminAPI.getStates(value);
          const stateData = stateRes?.data?.results || stateRes?.data?.data?.results || [];
          setStates(stateData);
        } catch (err) {
          console.error('Failed to load states:', err);
        }
      };
      fetchStates();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createFacility(formData);
      navigate('/system-admin/facilities');
    } catch (err: any) {
      console.error('Failed to create facility:', err);
      alert(err?.response?.data?.message || 'Failed to create facility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/system-admin/facilities')}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">Add New Facility</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name *</label>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g., Kogi State Primary Health Centre" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <Input 
                name="code" 
                value={formData.code} 
                onChange={handleChange} 
                placeholder="e.g., PHC-KOG-001" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div>
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type *</label>
              <select 
                name="facility_type" 
                value={formData.facility_type} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-lg"
                required
              >
                {facilityTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tier *</label>
              <select 
                name="tier" 
                value={formData.tier} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-lg"
                required
              >
                {currentTierOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-lg"
                required
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <select 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-lg"
                required
              >
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select 
                name="state" 
                value={formData.state} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select State</option>
                {states.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
              <Input 
                name="lga" 
                value={formData.lga} 
                onChange={handleChange} 
                placeholder="Local Government Area" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
              <select 
                name="zone" 
                value={formData.zone} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select Zone</option>
                {zoneOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                rows={2} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required 
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <Input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="e.g., +2348012345678" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="e.g., info@facility.com" 
                  required 
                />
              </div>
            </div>
          </div>
        </div>

        {/* HMO Specific */}
        {formData.tier === 'HMO' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">HMO Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <Input 
                name="license_number" 
                value={formData.license_number} 
                onChange={handleChange} 
                placeholder="HMO License Number" 
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/system-admin/facilities')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Creating...' : 'Create Facility'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddFacilityScreen;