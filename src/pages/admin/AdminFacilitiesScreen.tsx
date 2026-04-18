import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Search, 
  MapPin,
  Phone,
  Mail,
  Users,
  Shield,
  MoreVertical,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminFacilitiesScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const facilities = [
    { id: 1, name: 'PHC Lagos', type: 'phc', address: 'Lagos Island, Lagos', staff: 5, patients: 234, status: 'active', verified: true },
    { id: 2, name: 'PHC Kano', type: 'phc', address: 'Kano City, Kano', staff: 3, patients: 156, status: 'active', verified: true },
    { id: 3, name: 'PHC Abuja', type: 'phc', address: 'Gwagwalada, Abuja', staff: 4, patients: 189, status: 'active', verified: true },
    { id: 4, name: 'FMC Abuja', type: 'fmc', address: 'UoZ Road, Abuja', staff: 45, patients: 567, status: 'active', verified: true },
    { id: 5, name: 'LUTH', type: 'fmc', address: 'Surulere, Lagos', staff: 78, patients: 890, status: 'active', verified: true },
    { id: 6, name: 'Private Clinic', type: 'clinic', address: 'Victoria Island, Lagos', staff: 2, patients: 45, status: 'active', verified: false },
    { id: 7, name: 'State Hospital', type: 'sth', address: 'Ibadan, Oyo', staff: 23, patients: 345, status: 'active', verified: true },
    { id: 8, name: 'Old PHC', type: 'phc', address: 'Port Harcourt', staff: 0, patients: 0, status: 'inactive', verified: false },
  ];

  const getTypeBadge = (type: string) => {
    const types: Record<string, { bg: string; text: string; label: string }> = {
      phc: { bg: 'bg-green-100', text: 'text-green-700', label: 'PHC' },
      fmc: { bg: 'bg-red-100', text: 'text-red-700', label: 'FMC' },
      sth: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'State Hospital' },
      stth: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'State Teaching' },
      fth: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Federal Teaching' },
      clinic: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Clinic' },
      pvt: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Private Hospital' },
      hmo: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'HMO' },
    };
    const info = types[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type.toUpperCase() };
    return <Badge className={`${info.bg} ${info.text}`}>{info.label}</Badge>;
  };

  const filteredFacilities = facilities.filter(facility => 
    facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = facilities.filter(f => f.status === 'active').length;
  const inactiveCount = facilities.filter(f => f.status === 'inactive').length;
  const totalPatients = facilities.reduce((sum, f) => sum + f.patients, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-gray-500">Manage all healthcare facilities</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Facilities</p>
          <p className="text-2xl font-bold">{facilities.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Patients</p>
          <p className="text-2xl font-bold text-blue-600">{totalPatients}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search facilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((facility, i) => (
          <motion.div
            key={facility.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{facility.name}</h3>
                  {getTypeBadge(facility.type)}
                </div>
              </div>
              {facility.status === 'active' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                {facility.address}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4 text-gray-400" />
                {facility.staff} staff • {facility.patients} patients
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              {facility.verified ? (
                <Badge className="bg-green-100 text-green-700">Verified</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
              )}
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminFacilitiesScreen;