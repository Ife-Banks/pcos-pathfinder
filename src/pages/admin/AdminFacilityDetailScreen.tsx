import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminAPI, Facility } from '@/services/adminService';

const AdminFacilityDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacility = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getAllFacilities();
        const facilitiesData = res?.data?.results || res?.data?.data?.results || [];
        
        const found = (facilitiesData as Facility[]).find(f => f.id === id);
        if (found) {
          setFacility(found);
        }
      } catch (err) {
        console.error('Failed to load facility:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFacility();
  }, [id]);

  const getTypeBadge = (type: string) => {
    const types: Record<string, { bg: string; text: string; label: string }> = {
      phc: { bg: 'bg-green-100', text: 'text-green-700', label: 'PHC' },
      sth: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'State General Hospital' },
      stth: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'State Teaching Hospital' },
      fmc: { bg: 'bg-red-100', text: 'text-red-700', label: 'Federal Medical Centre' },
      fth: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Federal Teaching Hospital' },
      hmo: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Health Insurance (HMO)' },
      cln: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Clinic' },
      pvt: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Private Hospital' },
      ptth: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Private Teaching Hospital' },
    };
    const info = types[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type.toUpperCase() };
    return <Badge className={`${info.bg} ${info.text}`}>{info.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/system-admin/facilities')}>
            ← Back to Facilities
          </Button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-gray-500">Facility not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/system-admin/facilities')}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{facility.name}</h1>
            <p className="text-gray-500">{facility.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTypeBadge(facility.tier)}
          <Badge className={facility.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
            {facility.status}
          </Badge>
        </div>
      </div>

      {/* Details Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Classification */}
          <div className="col-span-full">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Classification</h3>
          </div>
          <div>
            <label className="text-sm text-gray-500">Facility ID</label>
            <p className="font-mono text-sm">{facility.id}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Code</label>
            <p className="font-mono">{facility.code || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Facility Type (Tier)</label>
            <p>{facility.tier || '-'}</p>
          </div>

          {/* Location */}
          <div className="col-span-full mt-4">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Location</h3>
          </div>
          <div>
            <label className="text-sm text-gray-500">Country</label>
            <p>Nigeria</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">State</label>
            <p>{facility.state || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">LGA</label>
            <p>{facility.lga || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Zone</label>
            <p>{facility.zone || '-'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-500">Address</label>
            <p>{facility.address || '-'}</p>
          </div>

          {/* Contact */}
          <div className="col-span-full mt-4">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contact Information</h3>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <p>{facility.phone || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p>{facility.email || '-'}</p>
          </div>

          {/* Management */}
          <div className="col-span-full mt-4">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Management</h3>
          </div>
          <div>
            <label className="text-sm text-gray-500">Escalates To</label>
            <p className="font-mono text-sm">{facility.escalates_to || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Admin User</label>
            <p>{facility.admin_user || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Admin Email</label>
            <p>{facility.admin_email || '-'}</p>
          </div>

          {/* HMO Specific */}
          {facility.tier === 'HMO' && (
            <>
              <div className="col-span-full mt-4">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">HMO Details</h3>
              </div>
              <div>
                <label className="text-sm text-gray-500">License Number</label>
                <p className="font-mono">{facility.license_number || '-'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/system-admin/facilities')}>
          Back to Facilities
        </Button>
      </div>
    </div>
  );
};

export default AdminFacilityDetailScreen;