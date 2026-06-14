import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Activity,
  Download,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminAPI, AdminAnalytics } from '@/services/adminService';

const AdminAnalyticsScreen = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getAnalytics();
        setAnalytics(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = analytics ? [
    { label: 'Total Users', value: analytics.total_users.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Users', value: analytics.active_users.toLocaleString(), icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Facilities', value: analytics.facilities.total.toString(), icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Completed Onboardings', value: analytics.onboardings.completed.toLocaleString(), icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ] : [];

  const maxMonthlyUsers = analytics?.monthly_growth.reduce((max, item) => Math.max(max, item.users), 1) || 1;

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
        {loading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
                <div className="h-8 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded mt-2" />
              </div>
            ))}
          </>
        ) : error ? (
          <div className="col-span-4 bg-red-50 rounded-xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-red-400 text-sm mt-1">Please try again later</p>
          </div>
        ) : stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">User Growth (Last 6 Months)</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="h-48 w-8 bg-gray-200 rounded" />
              <div className="h-48 w-8 bg-gray-200 rounded" />
              <div className="h-48 w-8 bg-gray-200 rounded" />
              <div className="h-48 w-8 bg-gray-200 rounded" />
              <div className="h-48 w-8 bg-gray-200 rounded" />
              <div className="h-48 w-8 bg-gray-200 rounded" />
            </div>
          </div>
        ) : analytics?.monthly_growth && analytics.monthly_growth.length > 0 ? (
          <div className="h-64 flex items-end gap-4">
            {analytics.monthly_growth.map((item, i) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.users / maxMonthlyUsers) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="w-full bg-blue-500 rounded-t"
                />
                <span className="text-xs text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <Clock className="h-8 w-8 mr-2" />
            <span>No growth data available</span>
          </div>
        )}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-sm text-gray-600">New Users</span>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      {analytics && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Risk Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Low Risk', value: analytics.risk_distribution.low, color: 'bg-green-500' },
              { label: 'Moderate Risk', value: analytics.risk_distribution.moderate, color: 'bg-yellow-500' },
              { label: 'High Risk', value: analytics.risk_distribution.high, color: 'bg-orange-500' },
              { label: 'Critical Risk', value: analytics.risk_distribution.critical, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.label} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 ${item.color} rounded-full mx-auto mb-2`} />
                <p className="text-2xl font-bold text-gray-900">{item.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Predictions</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.predictions.total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total predictions made</p>
            <p className="text-xs text-green-600 mt-2">+{analytics.predictions.last_30_days.toLocaleString()} in last 30 days</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Health Check-ins</h3>
            <p className="text-3xl font-bold text-green-600">{analytics.checkins.total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total check-ins completed</p>
            <p className="text-xs text-green-600 mt-2">+{analytics.checkins.last_30_days.toLocaleString()} in last 30 days</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Pending Onboardings</h3>
            <p className="text-3xl font-bold text-amber-600">{analytics.onboardings.pending.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Users awaiting completion</p>
            <p className="text-xs text-green-600 mt-2">+{analytics.onboardings.completed_last_30_days} completed in last 30 days</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsScreen;