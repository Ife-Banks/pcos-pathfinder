import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, BellOff, RefreshCw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminAPI, SystemAlert } from '@/services/adminService';

const AdminAlertsScreen = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSystemAlerts();
      setAlerts(res.data.alerts);
      setSummary(res.data.summary);
      setError(null);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Failed to load system alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 120000);
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-500">System alerts and notifications</p>
        </div>
        <div className="flex items-center gap-3">
          {summary && (
            <div className="flex items-center gap-4 text-sm">
              {summary.critical_risk_patients > 0 && (
                <Badge className="bg-red-100 text-red-700">
                  {summary.critical_risk_patients} Critical
                </Badge>
              )}
              {summary.pending_onboardings > 0 && (
                <Badge className="bg-yellow-100 text-yellow-700">
                  {summary.pending_onboardings} Pending
                </Badge>
              )}
              {summary.unread_notifications > 0 && (
                <Badge className="bg-blue-100 text-blue-700">
                  {summary.unread_notifications} Unread
                </Badge>
              )}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && alerts.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-64 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error && alerts.length === 0 ? (
        <div className="bg-red-50 rounded-xl p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchAlerts}>
            Retry
          </Button>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No alerts at this time</p>
          <p className="text-gray-400 text-sm mt-1">All systems are running normally</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl border ${getAlertStyle(alert.type)} ${!alert.read ? 'font-medium' : ''}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900">{alert.title}</p>
                    {!alert.read && <Badge className="bg-blue-100 text-blue-700">New</Badge>}
                    <Badge variant="outline" className="text-xs">{alert.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm">Total Alerts</div>
            <p className="text-2xl font-bold">{summary.total_alerts}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm">Unread Notifications</div>
            <p className="text-2xl font-bold text-blue-600">{summary.unread_notifications}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm">High Risk Patients</div>
            <p className="text-2xl font-bold text-orange-600">{summary.high_risk_patients}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm">Critical Risk</div>
            <p className="text-2xl font-bold text-red-600">{summary.critical_risk_patients}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlertsScreen;