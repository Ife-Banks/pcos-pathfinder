import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, FileText, Pill, Activity } from 'lucide-react';

const PVTDashboardScreen = () => {
  const stats = [
    { label: 'Patients', value: '156', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Consultations', value: '78', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Treatments', value: '64', icon: Pill, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Diagnostics', value: '45', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Private Hospital Dashboard</h1>
        <p className="text-gray-500">Welcome back</p>
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
    </div>
  );
};

export default PVTDashboardScreen;