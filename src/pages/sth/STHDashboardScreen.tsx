import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Building2, AlertTriangle, Activity, FileText } from 'lucide-react';

const STHDashboardScreen = () => {
  const stats = [
    { label: 'Total Patients', value: '124', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'PHC Referrals', value: '18', icon: Building2, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Escalations', value: '5', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Active Cases', value: '42', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const recentPatients = [
    { name: 'Sarah Johnson', id: 'MDC/2024/001234', status: 'Under Review', time: '2 hours ago' },
    { name: 'Emily Davis', id: 'MDC/2024/001235', status: 'Pending', time: '4 hours ago' },
    { name: 'Mary Wilson', id: 'MDC/2024/001236', status: 'Treated', time: '1 day ago' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">State Hospital Dashboard</h1>
          <p className="text-gray-500">Welcome back</p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Patients</h2>
          <div className="space-y-3">
            {recentPatients.map((patient, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.id}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    patient.status === 'Treated' ? 'bg-green-100 text-green-700' :
                    patient.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {patient.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{patient.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-teal-50 rounded-lg text-center hover:bg-teal-100 transition-colors">
              <FileText className="h-6 w-6 text-teal-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-teal-700">New Case</span>
            </button>
            <button className="p-4 bg-teal-50 rounded-lg text-center hover:bg-teal-100 transition-colors">
              <Building2 className="h-6 w-6 text-teal-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-teal-700">View Referrals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default STHDashboardScreen;