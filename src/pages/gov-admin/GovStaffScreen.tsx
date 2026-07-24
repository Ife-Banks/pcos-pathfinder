// LGA Admin Portal — GovStaffScreen.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/context/AuthContext';
import { govAdminAPI, GovStaffMember } from '@/services/govAdminService';

const GovStaffScreen = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<GovStaffMember[]>([]);
  const [facilities, setFacilities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const role = (user as Record<string, unknown>)?.role as string || '';
  const lgaName = (user as Record<string, unknown>)?.lga_name as string || (user as Record<string, unknown>)?.lga as string || 'your LGA';
  const headingTitle = role === 'lga_admin' ? 'PHC Staff' : 'Staff';

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [staffRes, facRes] = await Promise.allSettled([
          govAdminAPI.getGovStaff({ page_size: 200 }),
          govAdminAPI.getGovFacilities({ page_size: 100 }),
        ]);

        if (cancelled) return;

        if (staffRes.status === 'fulfilled') {
          setStaff(staffRes.value.data?.results || []);
        }
        if (facRes.status === 'fulfilled') {
          setFacilities(facRes.value.data?.results || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load staff data:', err);
          setError('Failed to load staff data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const filteredStaff = staff.filter(s => {
    const matchesSearch = !searchQuery ||
      s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFacility = facilityFilter === 'all' || s.facility_id === facilityFilter;
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesFacility && matchesRole;
  });

  const uniqueRoles = [...new Set(staff.map(s => s.role).filter(Boolean))];

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
      hcc_admin: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'PHC Admin' },
      hcc_staff: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'PHC Staff' },
    };
    const config = roleConfig[role] || { bg: 'bg-gray-100', text: 'text-gray-700', label: role };
    return <Badge className={`${config.bg} ${config.text}`}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{headingTitle}</h2>
          <p className="text-gray-500">Staff members across all PHCs in {lgaName}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Staff</p>
          <p className="text-2xl font-bold">{loading ? '...' : staff.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">PHC Admins</p>
          <p className="text-2xl font-bold text-teal-600">
            {loading ? '...' : staff.filter(s => s.role === 'hcc_admin').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">PHC Staff</p>
          <p className="text-2xl font-bold text-blue-600">
            {loading ? '...' : staff.filter(s => s.role === 'hcc_staff').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">Facility:</span>
            <Select value={facilityFilter} onValueChange={setFacilityFilter}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="All Facilities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Facilities</SelectItem>
                {facilities.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">Role:</span>
            <Button size="sm" variant={roleFilter === 'all' ? 'default' : 'outline'} onClick={() => setRoleFilter('all')}>All</Button>
            {uniqueRoles.map(role => (
              <Button key={role} size="sm" variant={roleFilter === role ? 'default' : 'outline'} onClick={() => setRoleFilter(role)}>
                {role.replace('hcc_', '').toUpperCase()}
              </Button>
            ))}
          </div>
          {(facilityFilter !== 'all' || roleFilter !== 'all' || searchQuery) && (
            <Button size="sm" variant="ghost" className="text-gray-400 ml-auto" onClick={() => { setFacilityFilter('all'); setRoleFilter('all'); setSearchQuery(''); }}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : staff.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">No staff members found</p>
            <p className="text-xs text-gray-400 mt-1">
              Staff will appear here once PHC admins create staff accounts
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Staff ({filteredStaff.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map(member => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell className="text-gray-500">{member.email}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>{member.facility_name}</TableCell>
                    <TableCell>
                      {member.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GovStaffScreen;
