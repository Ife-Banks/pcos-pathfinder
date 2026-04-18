import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Download, Filter, Clock, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminLogsScreen = () => {
  const logs = [
    { id: 1, timestamp: '2024-04-18 10:45:23', action: 'User login', user: 'admin@aimher.com', ip: '192.168.1.1', status: 'success' },
    { id: 2, timestamp: '2024-04-18 10:44:15', action: 'Password change', user: 'sarah@phc.gov.ng', ip: '192.168.1.45', status: 'success' },
    { id: 3, timestamp: '2024-04-18 10:43:02', action: 'Failed login attempt', user: 'unknown', ip: '10.0.0.55', status: 'failed' },
    { id: 4, timestamp: '2024-04-18 10:42:11', action: 'Patient record created', user: 'dr.chen@fmc.gov.ng', ip: '192.168.1.30', status: 'success' },
    { id: 5, timestamp: '2024-04-18 10:41:05', action: 'Facility added', user: 'admin@aimher.com', ip: '192.168.1.1', status: 'success' },
    { id: 6, timestamp: '2024-04-18 10:40:22', action: 'Export data', user: 'admin@aimher.com', ip: '192.168.1.1', status: 'success' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500">System activity and audit trail</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export Logs
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search logs..." className="pl-10" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Timestamp</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Action</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">IP Address</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log, i) => (
              <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">{log.timestamp}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{log.action}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{log.user}</td>
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">{log.ip}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {log.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogsScreen;