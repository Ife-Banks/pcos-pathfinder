import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Search, 
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Calendar,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminDatabaseScreen = () => {
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  const databases = [
    { id: 1, name: 'users', records: 12450, size: '245 MB', lastBackup: '2024-04-18 10:30', status: 'healthy' },
    { id: 2, name: 'patient_records', records: 8934, size: '1.2 GB', lastBackup: '2024-04-18 10:30', status: 'healthy' },
    { id: 3, name: 'consultations', records: 45678, size: '890 MB', lastBackup: '2024-04-18 10:30', status: 'healthy' },
    { id: 4, name: 'assessments', records: 23456, size: '456 MB', lastBackup: '2024-04-18 10:30', status: 'healthy' },
    { id: 5, name: 'prescriptions', records: 12345, size: '234 MB', lastBackup: '2024-04-18 10:30', status: 'healthy' },
  ];

  const backups = [
    { id: 1, date: '2024-04-18 10:00', size: '2.1 GB', type: 'Full' },
    { id: 2, date: '2024-04-17 10:00', size: '2.0 GB', type: 'Full' },
    { id: 3, date: '2024-04-16 10:00', size: '1.9 GB', type: 'Full' },
    { id: 4, date: '2024-04-15 10:00', size: '1.8 GB', type: 'Full' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Management</h1>
          <p className="text-gray-500">Manage databases and backups</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="h-4 w-4 mr-2" />
            Backup Now
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Database className="h-4 w-4" /> Total Databases
          </div>
          <p className="text-2xl font-bold">{databases.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <HardDrive className="h-4 w-4" /> Total Size
          </div>
          <p className="text-2xl font-bold">3.0 GB</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Calendar className="h-4 w-4" /> Last Backup
          </div>
          <p className="text-2xl font-bold">2h ago</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Database className="h-4 w-4" /> Total Records
          </div>
          <p className="text-2xl font-bold">102K</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Tables */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Database Tables</h2>
          <div className="space-y-3">
            {databases.map((db, i) => (
              <motion.div key={db.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{db.name}</p>
                  <p className="text-sm text-gray-500">{db.records.toLocaleString()} records • {db.size}</p>
                </div>
                <Badge className="bg-green-100 text-green-700">{db.status}</Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Backup History</h2>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
          <div className="space-y-3">
            {backups.map((backup, i) => (
              <motion.div key={backup.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{backup.date}</p>
                  <p className="text-sm text-gray-500">{backup.type} • {backup.size}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDatabaseScreen;