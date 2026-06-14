import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/services/adminService';

interface TableStat {
  name: string;
  records: number;
  status: 'healthy' | 'error';
}

interface DBStats {
  tables: TableStat[];
  total_tables: number;
  total_records: number;
}

const AdminDatabaseScreen = () => {
  const [stats, setStats] = useState<DBStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<{ date: string; filename: string; rows: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem('db_export_history') || '[]'); } catch { return []; }
  });

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const res = await adminAPI.getDatabaseStats();
      if (res?.data) setStats(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load database stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/v1/auth/db-export/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `db_export_${new Date().toISOString().slice(0, 10)}.zip`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      const entry = { date: new Date().toISOString(), filename, rows: stats?.tables.length ?? 0 };
      const updated = [entry, ...exportHistory].slice(0, 20);
      setExportHistory(updated);
      localStorage.setItem('db_export_history', JSON.stringify(updated));
    } catch (e) {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Management</h1>
          <p className="text-gray-500">Live stats from your Django database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchStats(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Backup Now
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm">
            <Database className="h-4 w-4" /> Total Tables
          </div>
          <p className="text-2xl font-bold">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : stats?.total_tables ?? '—'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm">
            <HardDrive className="h-4 w-4" /> Total Records
          </div>
          <p className="text-2xl font-bold">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : formatNumber(stats?.total_records ?? 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm">
            <CheckCircle className="h-4 w-4" /> Healthy Tables
          </div>
          <p className="text-2xl font-bold text-green-600">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : stats?.tables.filter(t => t.status === 'healthy').length ?? '—'}
          </p>
        </div>
      </div>

      {/* Tables */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Database Tables</h2>
          <p className="text-sm text-gray-500">Live record counts from your application database</p>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="px-6 py-4 flex items-center justify-between animate-pulse">
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded" />
              </div>
            ))
          ) : stats?.tables.map((table, i) => (
            <motion.div
              key={table.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{table.name}</p>
                <p className="text-sm text-gray-500">{formatNumber(table.records)} records</p>
              </div>
              <Badge className={table.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {table.status === 'healthy'
                  ? <><CheckCircle className="h-3 w-3 mr-1 inline" />healthy</>
                  : <><AlertCircle className="h-3 w-3 mr-1 inline" />error</>
                }
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
            <p className="text-sm text-gray-500">Automated backups are managed by your hosting provider</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
        {exportHistory.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No exports yet</p>
            <p className="text-xs mt-1">Click Export above to download a CSV and track it here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {exportHistory.map((entry, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{entry.filename}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleString()} · {entry.rows} tables</p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    const updated = exportHistory.filter((_, j) => j !== i);
                    setExportHistory(updated);
                    localStorage.setItem('db_export_history', JSON.stringify(updated));
                  }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDatabaseScreen;