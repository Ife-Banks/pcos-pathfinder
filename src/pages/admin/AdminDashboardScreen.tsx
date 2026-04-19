import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  Activity,
  Shield,
  Database,
  AlertTriangle,
  Server,
  Clock,
  TrendingUp,
  FileText
} from 'lucide-react';
import { adminAPI, AdminStats, ActivityLog } from '@/services/adminService';

const AdminDashboardScreen = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          adminAPI.getSystemStats(),
          adminAPI.getActivityLogs({ page_size: 10 }),
        ]);
        if (statsRes.data) {
          setStats(statsRes.data);
        }
        if (logsRes.data?.logs) {
          setRecentActivity(logsRes.data.logs);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '+' + change + '%';
    if (change < 0) return change + '%';
    return '0%';
  };

  const statCards = stats ? [
    { label: 'Total Users', value: formatNumber(stats.users.total), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+' + stats.users.new_this_week },
    { label: 'Facilities', value: stats.facilities.count, icon: Building2, color: 'text-green-600', bg: 'bg-green-50', change: '+' + stats.users.new_this_week },
    { label: 'Active Sessions', value: stats.sessions.active_today, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50', change: '+' + stats.checkins.this_week },
    { label: 'Pending Onboardings', value: stats.onboardings.pending, icon: Database, color: 'text-amber-600', bg: 'bg-amber-50', change: '0' },
  ] : [];

  const recentActivityList = recentActivity.length > 0 ? recentActivity.map(log => ({
    action: log.action.replace(/_/g, ' '),
    user: log.user,
    facility: log.facility || '-',
    time: new Date(log.timestamp).toLocaleTimeString(),
  })) : [
    { action: 'No recent activity', user: '-', facility: '-', time: '-' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administration Dashboard</h1>
          <p className="text-gray-500">Welcome back, Administrator</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          Last updated: Just now
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded mt-2" />
              </div>
            ))}
          </>
        ) : statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className={`text-xs font-medium ${
                typeof stat.change === 'string' && stat.change.startsWith('+') ? 'text-green-600' : 
                stat.change === 0 ? 'text-gray-500' : 'text-green-600'
              }`}>
                {typeof stat.change === 'string' ? stat.change : (stat.change > 0 ? '+' + stat.change : stat.change)}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <>
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </>
            ) : recentActivityList.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.user} • {item.facility}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">System Health</h2>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              All Systems Operational
            </span>
          </div>
          <div className="space-y-3">
            {systemHealth.map((service, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.service}</p>
                    <p className="text-xs text-gray-500">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  service.status === 'healthy' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-blue-700">Manage Users</span>
          </button>
          <button className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
            <Building2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-green-700">Add Facility</span>
          </button>
          <button className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
            <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-700">Security Logs</span>
          </button>
          <button className="p-4 bg-amber-50 rounded-lg text-center hover:bg-amber-100 transition-colors">
            <Database className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-amber-700">Backup Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardScreen;