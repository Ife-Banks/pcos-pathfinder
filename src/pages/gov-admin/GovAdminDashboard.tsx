import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle,
  Users,
  Shield,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  govAdminAPI,
  GovFacility,
  GovAdminAccount,
} from '@/services/govAdminService';

const GovAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<GovFacility[]>([]);
  const [admins, setAdmins] = useState<GovAdminAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const u = user as Record<string, unknown> | null;
  const role = (u?.role as string) || '';
  const lgaName = (u?.lga_name as string) || (u?.lga as string) || '';
  const stateName =
    (u?.state_name as string) || (u?.state as string) || 'your State';

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [facRes, adminRes] = await Promise.allSettled([
          govAdminAPI.getGovFacilities({ page_size: 100 }),
          govAdminAPI.getGovAdmins({ page_size: 100 }),
        ]);
        if (cancelled) return;
        if (facRes.status === 'fulfilled')
          setFacilities(facRes.value.data?.results || []);
        if (adminRes.status === 'fulfilled')
          setAdmins(adminRes.value.data?.results || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const isLgaAdmin = role === 'lga_admin';
  const isStateAdmin = role === 'state_admin' || role === 'sth_admin' || role === 'stth_admin';

  const totalPhcs = facilities.length;
  const activePhcs = facilities.filter((f) => f.status === 'active').length;
  const totalStaff = 0;
  const phcAdmins = admins.filter((a) => a.role === 'facility_admin').length;
  const totalSth = facilities.filter((f) => f.tier === 'sth').length;
  const totalStth = facilities.filter((f) => f.tier === 'stth').length;

  const statCards = isLgaAdmin
    ? [
        {
          label: 'Total PHCs',
          value: totalPhcs,
          icon: Building2,
          color: 'text-teal-600',
          bg: 'bg-teal-50',
        },
        {
          label: 'Active PHCs',
          value: activePhcs,
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
        },
        {
          label: 'Total Staff',
          value: totalStaff,
          icon: Users,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          note: totalStaff === 0 ? 'Coming soon' : undefined,
        },
        {
          label: 'PHC Admins',
          value: phcAdmins,
          icon: Shield,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
        },
      ]
    : [
        {
          label: 'Total STH',
          value: totalSth,
          icon: Building2,
          color: 'text-teal-600',
          bg: 'bg-teal-50',
        },
        {
          label: 'Total STTH',
          value: totalStth,
          icon: Building2,
          color: 'text-green-600',
          bg: 'bg-green-50',
        },
        {
          label: 'Total Staff',
          value: totalStaff,
          icon: Users,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          note: totalStaff === 0 ? 'Coming soon' : undefined,
        },
        {
          label: 'Admins',
          value: admins.length,
          icon: Shield,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
        },
      ];

  const recentFacilities = (isLgaAdmin
    ? facilities.filter((f) => f.tier === 'phc')
    : facilities
  )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const dashboardTitle = isLgaAdmin
    ? `LGA Dashboard`
    : `State Dashboard`;

  const dashboardLocation = isLgaAdmin
    ? lgaName || 'your LGA'
    : stateName;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {dashboardTitle}
          </h1>
          <p className="text-gray-500 flex items-center gap-1">
            <MapPin className="h-4 w-4 text-teal-500" />
            {dashboardLocation}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          Last updated: Just now
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded mt-2" />
              </div>
            ))
          : statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {stat.note && (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    {stat.note}
                  </p>
                )}
              </motion.div>
            ))}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            {isLgaAdmin ? 'Recent PHCs' : 'Recent Facilities'}
          </h2>
          <button
            className="text-sm text-teal-600 hover:underline flex items-center gap-1"
            onClick={() => navigate('/gov-admin/facilities')}
          >
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="h-4 bg-gray-200 rounded w-48" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : recentFacilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Building2 className="h-10 w-10 mb-2 text-gray-300" />
            <p className="text-sm">
              No {isLgaAdmin ? 'PHCs' : 'facilities'} found in{' '}
              {dashboardLocation}
            </p>
            <button
              className="text-sm text-teal-600 hover:underline mt-1"
              onClick={() => navigate('/gov-admin/facilities')}
            >
              Create the first {isLgaAdmin ? 'PHC' : 'facility'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentFacilities.map((facility) => (
              <div
                key={facility.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate('/gov-admin/facilities')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {facility.name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {facility.code}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    facility.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {facility.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isLgaAdmin ? (
            <>
              <button
                className="p-4 bg-teal-50 rounded-lg text-center hover:bg-teal-100 transition-colors"
                onClick={() => navigate('/gov-admin/facilities')}
              >
                <Building2 className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-teal-700">
                  Manage PHCs
                </span>
              </button>
              <button
                className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
                onClick={() => navigate('/gov-admin/staff')}
              >
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-700">
                  PHC Staff
                </span>
              </button>
              <button
                className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
                onClick={() => navigate('/gov-admin/admins')}
              >
                <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-700">
                  Admin Management
                </span>
              </button>
              <button
                className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
                onClick={() => navigate('/gov-admin/facilities')}
              >
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-700">
                  Add New PHC
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                className="p-4 bg-teal-50 rounded-lg text-center hover:bg-teal-100 transition-colors"
                onClick={() =>
                  navigate('/gov-admin/facilities?tier=sth')
                }
              >
                <Building2 className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-teal-700">
                  STH Facilities
                </span>
              </button>
              <button
                className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
                onClick={() =>
                  navigate('/gov-admin/facilities?tier=stth')
                }
              >
                <Building2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-700">
                  STTH Facilities
                </span>
              </button>
              <button
                className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
                onClick={() => navigate('/gov-admin/staff')}
              >
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-700">
                  Staff
                </span>
              </button>
              <button
                className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
                onClick={() => navigate('/gov-admin/admins')}
              >
                <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-700">
                  Admin Management
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovAdminDashboard;
