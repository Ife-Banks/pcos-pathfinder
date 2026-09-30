import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Mail,
  Phone,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { govAdminAPI, GovStaffMember } from '@/services/govAdminService';

const GovStaffScreen = () => {
  const { user } = useAuth();
  const u = user as unknown as Record<string, unknown> | null;
  const userRole = (u?.role as string) || '';
  const lgaName = (u?.lga_name as string) || (u?.lga as string) || '';
  const stateName = (u?.state_name as string) || (u?.state as string) || '';
  const isAdmin = userRole === 'lga_admin';

  const [staff, setStaff] = useState<GovStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        const res = await govAdminAPI.getGovStaff(params);
        if (cancelled) return;
        const data = res?.data;
        setStaff(data?.results || []);
        setTotal(data?.count || 0);
      } catch (err) {
        if (!cancelled) console.error('Failed to load staff:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page, searchQuery]);

  const heading = isAdmin ? 'PHC Staff' : 'State Staff';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
        <p className="text-gray-500">
          Staff across {isAdmin ? 'PHCs in ' : 'facilities in '}
          {lgaName || stateName || 'your area'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, or facility..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Staff List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>
            {searchQuery
              ? 'No staff match your search'
              : 'No staff members found yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-teal-700">
                      {member.full_name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'ST'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {member.full_name || 'Staff Member'}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-xs mt-0.5"
                    >
                      {member.role?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    member.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.facility_name && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate">{member.facility_name}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
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
                setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))
              }
              disabled={page >= Math.ceil(total / pageSize)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovStaffScreen;
