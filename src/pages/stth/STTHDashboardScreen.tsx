import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Building2, Activity, UserPlus, Loader2 } from 'lucide-react';
import { stthAPI, STTHDashboardData } from '@/services/stthService';

const STTHDashboardScreen = () => {
  const [data, setData] = useState<STTHDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    stthAPI.getDashboard()
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        setError('Failed to load dashboard data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Patients', value: data?.total_patients ?? 0, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Active Cases', value: data?.active_patients ?? 0, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Staff', value: data?.total_staff ?? 0, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Today', value: data?.today_registrations ?? 0, icon: UserPlus, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">State Teaching Hospital Dashboard</h1>
        <p className="text-gray-500">
          {data?.facility.name} ({data?.facility.code})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {data?.facility && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Facility Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Address:</span> <span className="text-gray-900">{data.facility.address}</span></div>
            <div><span className="text-gray-500">State:</span> <span className="text-gray-900">{data.facility.state}</span></div>
            <div><span className="text-gray-500">LGA:</span> <span className="text-gray-900">{data.facility.lga}</span></div>
            <div><span className="text-gray-500">Phone:</span> <span className="text-gray-900">{data.facility.phone}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default STTHDashboardScreen;
