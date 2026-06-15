import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Cpu, Database, Globe, Wifi, CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminAPI, SystemHealth, ServiceHealth } from '@/services/adminService';

const AdminHealthScreen = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSystemHealth();
      setHealth(res.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to load health:', err);
      setError('Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
      case 'unhealthy':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const healthyCount = health?.services.filter(s => s.status === 'healthy').length || 0;
  const warningCount = health?.services.filter(s => s.status === 'warning').length || 0;
  const errorCount = health?.services.filter(s => s.status === 'error' || s.status === 'unhealthy').length || 0;

  const overallStatus = health?.status || 'unknown';
  const statusText = overallStatus === 'healthy' ? 'All Systems Operational' : overallStatus === 'warning' ? 'Degraded Performance' : 'System Issues Detected';
  const statusColor = overallStatus === 'healthy' ? 'bg-green-100 text-green-700' : overallStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500">Real-time system status</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && !health ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded mt-2" />
            </div>
          ))}
        </div>
      ) : error && !health ? (
        <div className="bg-red-50 rounded-xl p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchHealth}>
            Retry
          </Button>
        </div>
      ) : health ? (
        <>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusColor}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                overallStatus === 'healthy' ? 'bg-green-500' : overallStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              {statusText}
            </span>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Server className="h-4 w-4" /> Active Services
              </div>
              <p className="text-2xl font-bold">{health.services.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <CheckCircle className="h-4 w-4" /> Healthy
              </div>
              <p className="text-2xl font-bold text-green-600">{healthyCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <AlertTriangle className="h-4 w-4" /> Warnings
              </div>
              <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Cpu className="h-4 w-4" /> System Summary
              </div>
              <p className="text-2xl font-bold">{health.summary.total_users.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="text-gray-500 mb-1">Active Sessions Today</div>
              <p className="text-2xl font-bold text-blue-600">{health.summary.active_sessions_today.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="text-gray-500 mb-1">Predictions Today</div>
              <p className="text-2xl font-bold text-purple-600">{health.summary.predictions_today.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="text-gray-500 mb-1">Check-ins Today</div>
              <p className="text-2xl font-bold text-green-600">{health.summary.checkins_today.toLocaleString()}</p>
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Services Status</h2>
            <div className="space-y-3">
              {health.services.map((service, i) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      {service.message && (
                        <p className="text-sm text-gray-500">{service.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {service.latency_ms !== null && (
                      <p className="font-medium text-gray-900">{service.latency_ms}ms</p>
                    )}
                    <p className={`text-sm ${getStatusColor(service.status)}`}>
                      {service.status} • {service.uptime}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminHealthScreen;