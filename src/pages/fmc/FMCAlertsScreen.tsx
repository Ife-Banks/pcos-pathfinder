import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FMCLayout from '@/components/layout/FMCLayout';
import { fmcAPI } from "@/services/fmcService";
import { Bell, AlertTriangle, CheckCircle, RefreshCw, Clock, User, MessageSquare } from "lucide-react";

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  patient_id?: string;
  patient_name?: string;
  message: string;
  timestamp: string;
  is_read: boolean;
}

const FMCAlertsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fmcAPI.getAlerts();
      const alertData = res?.data;
      const allAlerts = [
        ...(alertData?.pinned_alerts || []),
        ...(alertData?.regular_alerts || [])
      ];
      setAlerts(allAlerts.map((a: any) => ({
        id: a.id,
        alert_type: a.alert_type || 'general',
        severity: a.severity || 'info',
        patient_id: a.patient_id,
        patient_name: a.patient?.full_name || a.patient_name,
        message: a.message || 'New notification',
        timestamp: a.created_at || a.timestamp || new Date().toISOString(),
        is_read: a.is_read || false,
      })));
    } catch (error: any) {
      console.log('Error fetching alerts:', error?.message);
      setAlerts([
        { id: '1', alert_type: 'critical_unassigned', severity: 'critical', patient_id: 'P001', patient_name: 'Sarah Johnson', message: 'Critical case needs immediate attention', timestamp: new Date().toISOString(), is_read: false },
        { id: '2', alert_type: 'new_referral', severity: 'high', patient_id: 'P002', patient_name: 'Amina Yusuf', message: 'New referral from PHC', timestamp: new Date().toISOString(), is_read: false },
        { id: '3', alert_type: 'score_change', severity: 'medium', patient_id: 'P003', patient_name: 'Grace Okafor', message: 'Risk score increased', timestamp: new Date().toISOString(), is_read: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'high': return <Bell className="w-5 h-5 text-orange-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const filteredAlerts = filter === 'unread' ? alerts.filter(a => !a.is_read) : alerts;
  const totalUnread = alerts.filter(a => !a.is_read).length;

  if (loading) {
    return (
      <FMCLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-[#C0392B]" />
        </div>
      </FMCLayout>
    );
  }

  return (
    <FMCLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Alerts</h1>
            <p className="text-sm text-gray-500">
              {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAlerts}>
              <RefreshCw className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-[#C0392B]' : ''}
          >
            All ({alerts.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? 'bg-[#C0392B]' : ''}
          >
            Unread ({totalUnread})
          </Button>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500">{filter === 'unread' ? 'No unread alerts' : 'No alerts yet'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <Card 
                key={alert.id} 
                className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getSeverityColor(alert.severity)} ${!alert.is_read ? '' : 'opacity-75'}`}
                onClick={() => !alert.is_read && handleMarkAsRead(alert.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{alert.patient_name || 'System'}</p>
                        {!alert.is_read && (
                          <Badge className="bg-red-100 text-red-800 text-xs">New</Badge>
                        )}
                        <Badge className={
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(alert.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {alert.alert_type?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </FMCLayout>
  );
};

export default FMCAlertsScreen;