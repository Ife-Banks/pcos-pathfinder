import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Search,
  Filter,
  Sun,
  Moon,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Building2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CheckIn {
  id: number;
  user: string;
  email: string;
  facility: string;
  type: 'morning' | 'evening' | 'weekly';
  status: 'completed' | 'pending' | 'missed';
  date: string;
  time: string;
  hrv?: number;
  fatigue?: number;
  mood?: number;
}

const AdminCheckInsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'missed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'morning' | 'evening' | 'weekly'>('all');
  const [dateFilter, setDateFilter] = useState('today');

  const checkIns: CheckIn[] = [
    { id: 1, user: 'Sarah Johnson', email: 'sarah@aimher.com', facility: 'PHC Lagos', type: 'morning', status: 'completed', date: '2024-05-18', time: '06:30', hrv: 45, fatigue: 3.2, mood: 2 },
    { id: 2, user: 'Sarah Johnson', email: 'sarah@aimher.com', facility: 'PHC Lagos', type: 'evening', status: 'completed', date: '2024-05-18', time: '20:15', hrv: 52, fatigue: 4.1, mood: 3 },
    { id: 3, user: 'Emily Davis', email: 'emily@aimher.com', facility: 'PHC Kano', type: 'morning', status: 'completed', date: '2024-05-18', time: '07:00', hrv: 38, fatigue: 5.0, mood: 4 },
    { id: 4, user: 'Michael Chen', email: 'chen@fmc.gov.ng', facility: 'FMC Abuja', type: 'morning', status: 'pending', date: '2024-05-18', time: '-', hrv: undefined, fatigue: undefined, mood: undefined },
    { id: 5, user: 'Lisa Brown', email: 'lisa@clinic.ng', facility: 'City Clinic', type: 'morning', status: 'missed', date: '2024-05-17', time: '-', hrv: undefined, fatigue: undefined, mood: undefined },
    { id: 6, user: 'James Wilson', email: 'james@phc.gov.ng', facility: 'PHC Lagos', type: 'weekly', status: 'completed', date: '2024-05-16', time: '14:00', hrv: 62, fatigue: 2.8, mood: 1 },
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" /> Completed
        </Badge>
      );
    }
    if (status === 'pending') {
      return (
        <Badge className="bg-amber-100 text-amber-700">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700">
        <AlertCircle className="h-3 w-3 mr-1" /> Missed
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    if (type === 'morning') return <Sun className="h-4 w-4 text-amber-500" />;
    if (type === 'evening') return <Moon className="h-4 w-4 text-indigo-500" />;
    return <Activity className="h-4 w-4 text-teal-500" />;
  };

  const filteredCheckIns = checkIns.filter(checkIn => {
    const matchesSearch = checkIn.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     checkIn.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || checkIn.status === filter;
    const matchesType = typeFilter === 'all' || checkIn.type === typeFilter;
    return matchesSearch && matchesFilter && matchesType;
  });

  const completedCount = checkIns.filter(c => c.status === 'completed').length;
  const pendingCount = checkIns.filter(c => c.status === 'pending').length;
  const missedCount = checkIns.filter(c => c.status === 'missed').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Check-Ins</h1>
          <p className="text-gray-500">Monitor patient check-in activity</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Missed</p>
              <p className="text-2xl font-bold text-gray-900">{missedCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            size="sm"
          >
            Completed
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={filter === 'missed' ? 'default' : 'outline'}
            onClick={() => setFilter('missed')}
            size="sm"
          >
            Missed
          </Button>
        </div>
      </div>

      {/* Check-Ins Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">HRV</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fatigue</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mood</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCheckIns.map((checkIn, i) => (
                <motion.tr
                  key={checkIn.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{checkIn.user}</p>
                      <p className="text-sm text-gray-500">{checkIn.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(checkIn.type)}
                      <span className="text-sm capitalize">{checkIn.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(checkIn.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{checkIn.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{checkIn.time}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {checkIn.hrv !== undefined ? checkIn.hrv : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {checkIn.fatigue !== undefined ? checkIn.fatigue : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {checkIn.mood !== undefined ? checkIn.mood : '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCheckInsScreen;