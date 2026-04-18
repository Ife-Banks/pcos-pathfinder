import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Activity,
  Calendar,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminAnalyticsScreen = () => {
  const stats = [
    { label: 'Total Users', value: '12,450', change: '+12%', trend: 'up' },
    { label: 'Active Now', value: '342', change: '+8%', trend: 'up' },
    { label: 'Facilities', value: '156', change: '+5%', trend: 'up' },
    { label: 'Consultations', value: '4,567', change: '+15%', trend: 'up' },
  ];

  const monthlyData = [
    { month: 'Jan', users: 8500, patients: 6200 },
    { month: 'Feb', users: 9200, patients: 6800 },
    { month: 'Mar', users: 10100, patients: 7200 },
    { month: 'Apr', users: 11050, patients: 8100 },
    { month: 'May', users: 11800, patients: 8900 },
    { month: 'Jun', users: 12450, patients: 9500 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">System performance and usage metrics</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              <span className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">User Growth</h2>
        <div className="h-64 flex items-end gap-4">
          {monthlyData.map((data, i) => (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
              <motion.div initial={{ height: 0 }} animate={{ height: `${(data.users / 15000) * 100}%` }} transition={{ delay: i * 0.1 }} className="w-full bg-blue-500 rounded-t" />
              <span className="text-xs text-gray-500">{data.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-sm text-gray-600">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-sm text-gray-600">Patients</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsScreen;