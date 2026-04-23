import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  User,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { adminAPI, Facility } from '@/services/adminService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminFacilityDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  
  // Admin assignment
  const [adminEmail, setAdminEmail] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [showUserResults, setShowUserResults] = useState(false);
  
  // Escalation options (would come from API in production)
  const [escalationOptions, setEscalationOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchFacility = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getAllFacilities();
        const facilitiesData = res?.data?.results || res?.data?.data?.results || [];
        
        const found = (facilitiesData as Facility[]).find(f => f.id === id);
        if (found) {
          setFacility(found);
          setEditData(found);
        }
      } catch (err) {
        console.error('Failed to load facility:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchEscalationOptions = async () => {
      try {
        const res = await adminAPI.getAllFacilities();
        const allFacilities = res?.data?.results || res?.data?.data?.results || [];
        setEscalationOptions(allFacilities);
      } catch (err) {
        console.error('Failed to load escalation options:', err);
      }
    };
    
    if (id) {
      fetchFacility();
      fetchEscalationOptions();
    }
  }, [id]);

  const handleSearchUsers = async (query: string) => {
    if (!query || query.length < 3) {
      setUserSearchResults([]);
      return;
    }
    
    setSearchingUsers(true);
    try {
      const res = await adminAPI.searchUsers(query);
      const users = res?.data?.users || res?.users || [];
      setUserSearchResults(users);
      setShowUserResults(true);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleAssignAdmin = async (user: any) => {
    setAdminEmail(user.email);
    setEditData((prev: any) => ({ ...prev, admin_email: user.email }));
    setShowUserResults(false);
  };

  const handleSave = async () => {
    if (!facility) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const updateData: any = {
        admin_email: editData.admin_email,
        phone: editData.phone,
        email: editData.email,
        address: editData.address,
        status: editData.status,
      };
      
      // Add escalation based on tier
      if (facility.tier === 'PHC' && editData.escalates_to) {
        updateData.escalates_to = editData.escalates_to;
      }
      
      const res = await adminAPI.updateFacility(facility.id, updateData, facility.tier);
      
      setMessage({ type: 'success', text: res.message || 'Facility updated successfully!' });
      setIsEditing(false);
      
      // Refresh data
      const res2 = await adminAPI.getAllFacilities();
      const facilitiesData = res2?.data?.results || res2?.data?.data?.results || [];
      const found = (facilitiesData as Facility[]).find(f => f.id === id);
      if (found) {
        setFacility(found);
      }
    } catch (err: any) {
      console.error('Failed to update facility:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.message || 'Failed to update facility' 
      });
    } finally {
      setSaving(false);
    }
  };

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
    const info = types[type?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type?.toUpperCase() };
    return <Badge className={`${info.bg} ${info.text}`}>{info.label}</Badge>;
  };

  const getEscalationOptions = () => {
    if (!facility) return [];
    
    const tierEscalationMap: Record<string, string[]> = {
      'PHC': ['STH'],
      'FMC': ['STTH', 'FTH'],
      'STH': ['STTH', 'FTH'],
      'STTH': ['FTH'],
    };
    
    const allowedTiers = tierEscalationMap[facility.tier?.toUpperCase()] || [];
    return escalationOptions.filter(f => allowedTiers.includes(f.tier?.toUpperCase()));
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

      {/* Message */}
      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Edit Button */}
      <div className="flex justify-end">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Facility
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setIsEditing(false); setEditData(facility); }} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        )}
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
            {isEditing ? (
              <Input 
                value={editData.address || ''} 
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                placeholder="Enter address"
              />
            ) : (
              <p>{facility.address || '-'}</p>
            )}
          </div>

          {/* Contact */}
          <div className="col-span-full mt-4">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contact Information</h3>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            {isEditing ? (
              <Input 
                value={editData.phone || ''} 
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                placeholder="Enter phone"
              />
            ) : (
              <p>{facility.phone || '-'}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            {isEditing ? (
              <Input 
                value={editData.email || ''} 
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                placeholder="Enter email"
              />
            ) : (
              <p>{facility.email || '-'}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            {isEditing ? (
              <select 
                value={editData.status || 'active'}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Verification</option>
              </select>
            ) : (
              <Badge className={facility.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                {facility.status}
              </Badge>
            )}
          </div>

          {/* Management */}
          <div className="col-span-full mt-4">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Management</h3>
          </div>
          
          {/* Escalates To */}
          <div>
            <label className="text-sm text-gray-500">Escalates To</label>
            {isEditing && facility.tier === 'PHC' ? (
              <select 
                value={editData.escalates_to || ''}
                onChange={(e) => setEditData({ ...editData, escalates_to: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">-- Not Set --</option>
                {getEscalationOptions().map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} ({opt.tier})
                  </option>
                ))}
              </select>
            ) : (
              <p>{facility.escalates_to_name || facility.escalates_to || '-'}</p>
            )}
          </div>
          
          {/* Admin User */}
          <div>
            <label className="text-sm text-gray-500">Admin User</label>
            <p>{facility.admin_user || '-'}</p>
          </div>
          
          {/* Admin Email Assignment */}
          <div className="col-span-2">
            <label className="text-sm text-gray-500 mb-2 block">
              {facility.admin_email ? 'Change Admin Email' : 'Assign Admin Email'}
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      value={adminEmail || editData.admin_email || ''}
                      onChange={(e) => {
                        setAdminEmail(e.target.value);
                        handleSearchUsers(e.target.value);
                      }}
                      onFocus={() => {
                        if (userSearchResults.length > 0) setShowUserResults(true);
                      }}
                      placeholder="Search by email..."
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* User Search Results */}
                {showUserResults && userSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {userSearchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleAssignAdmin(user)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchingUsers && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Search for an existing user by email to assign as admin. An email will be sent to notify them.
                </p>
              </div>
            ) : (
              <p>{facility.admin_email || '-'}</p>
            )}
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
