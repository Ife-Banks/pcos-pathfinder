import React from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AdminAlertsScreen = () => {
  const alerts = [
    { id: 1, type: 'warning', title: 'High failed login attempts', message: 'Multiple failed attempts from IP 10.0.0.55', time: '10 min ago', read: false },
    { id: 2, type: 'info', title: 'New facility registered', message: 'Private Clinic has submitted verification request', time: '1 hour ago', read: false },
    { id: 3, type: 'success', title: 'Backup completed', message: 'Daily backup completed successfully', time: '2 hours ago', read: true },
    { id: 4, type: 'warning', title: 'Storage usage high', message: 'Database storage at 85% capacity', time: '3 hours ago', read: true },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-500">System alerts and notifications</p>
        </div>
        <Button variant="outline">
          <Bell className="h-4 w-4 mr-2" /> Mark All Read
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div key={alert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`p-4 rounded-xl border ${getAlertStyle(alert.type)} ${!alert.read ? 'font-medium' : ''}`}>
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900">{alert.title}</p>
                  {!alert.read && <Badge className="bg-blue-100 text-blue-700">New</Badge>}
                </div>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminAlertsScreen;