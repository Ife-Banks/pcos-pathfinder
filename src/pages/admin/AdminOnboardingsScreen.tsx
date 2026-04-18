import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Onboarding {
  id: number;
  user: string;
  email: string;
  gender: 'MALE' | 'FEMALE';
  role: string;
  facility: string;
  currentStep: number;
  totalSteps: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  lastActiveAt: string;
}

const AdminOnboardingsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'abandoned'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'STH' | 'FTH' | 'CLINIC' | 'HMO'>('all');

  const onboardings: Onboarding[] = [
    { id: 1, user: 'Sarah Johnson', email: 'sarah@aimher.com', gender: 'FEMALE', role: 'STH', facility: 'PHC Lagos', currentStep: 7, totalSteps: 7, status: 'completed', startedAt: '2024-05-10', completedAt: '2024-05-12', lastActiveAt: '2024-05-12' },
    { id: 2, user: 'Emily Davis', email: 'emily@aimher.com', gender: 'FEMALE', role: 'STH', facility: 'PHC Kano', currentStep: 3, totalSteps: 7, status: 'in_progress', startedAt: '2024-05-15', completedAt: undefined, lastActiveAt: '2024-05-16' },
    { id: 3, user: 'Michael Chen', email: 'chen@fmc.gov.ng', gender: 'MALE', role: 'FTH', facility: 'FMC Abuja', currentStep: 7, totalSteps: 7, status: 'completed', startedAt: '2024-05-08', completedAt: '2024-05-11', lastActiveAt: '2024-05-11' },
    { id: 4, user: 'Lisa Brown', email: 'lisa@clinic.ng', gender: 'FEMALE', role: 'CLINIC', facility: 'City Clinic', currentStep: 2, totalSteps: 7, status: 'in_progress', startedAt: '2024-05-16', completedAt: undefined, lastActiveAt: '2024-05-16' },
    { id: 5, user: 'James Wilson', email: 'james@phc.gov.ng', gender: 'MALE', role: 'STH', facility: 'PHC Lagos', currentStep: 4, totalSteps: 7, status: 'abandoned', startedAt: '2024-05-01', completedAt: undefined, lastActiveAt: '2024-05-05' },
    { id: 6, user: 'Dr. Ahmad Bello', email: 'ahmad@fmc.gov.ng', gender: 'MALE', role: 'HMO', facility: 'FMC Kano', currentStep: 7, totalSteps: 7, status: 'completed', startedAt: '2024-05-05', completedAt: '2024-05-07', lastActiveAt: '2024-05-07' },
    { id: 7, user: 'Amara Okonkwo', email: 'amara@aimher.com', gender: 'FEMALE', role: 'STH', facility: 'PHC Lagos', currentStep: 5, totalSteps: 7, status: 'in_progress', startedAt: '2024-05-14', completedAt: undefined, lastActiveAt: '2024-05-17' },
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" /> Completed
        </Badge>
      );
    }
    if (status === 'in_progress') {
      return (
        <Badge className="bg-blue-100 text-blue-700">
          <Clock className="h-3 w-3 mr-1" /> In Progress
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700">
        <AlertCircle className="h-3 w-3 mr-1" /> Abandoned
      </Badge>
    );
  };

  const getProgressBar = (current: number, total: number) => {
    const percentage = (current / total) * 100;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">{current}/{total}</span>
      </div>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      'STH': 'bg-teal-100 text-teal-700',
      'FTH': 'bg-purple-100 text-purple-700',
      'CLINIC': 'bg-orange-100 text-orange-700',
      'HMO': 'bg-blue-100 text-blue-700',
    };
    return (
      <Badge className={roleStyles[role] || 'bg-gray-100 text-gray-700'}>
        {role}
      </Badge>
    );
  };

  const filteredOnboardings = onboardings.filter(onboarding => {
    const matchesSearch = onboarding.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     onboarding.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || onboarding.status === statusFilter;
    const matchesRole = roleFilter === 'all' || onboarding.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const completedCount = onboardings.filter(o => o.status === 'completed').length;
  const inProgressCount = onboardings.filter(o => o.status === 'in_progress').length;
  const abandonedCount = onboardings.filter(o => o.status === 'abandoned').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboardings</h1>
          <p className="text-gray-500">Track user onboarding progress</p>
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
              <p className="text-sm text-gray-500">Completed</p>
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
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm text-gray-500">Abandoned</p>
              <p className="text-2xl font-bold text-gray-900">{abandonedCount}</p>
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
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('completed')}
            size="sm"
          >
            Completed
          </Button>
          <Button
            variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('in_progress')}
            size="sm"
          >
            In Progress
          </Button>
          <Button
            variant={statusFilter === 'abandoned' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('abandoned')}
            size="sm"
          >
            Abandoned
          </Button>
        </div>
      </div>

      {/* Onboardings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Gender</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Progress</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Started</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOnboardings.map((onboarding, i) => (
                <motion.tr
                  key={onboarding.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{onboarding.user}</p>
                      <p className="text-sm text-gray-500">{onboarding.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getRoleBadge(onboarding.role)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {onboarding.gender}
                  </td>
                  <td className="px-4 py-3">
                    {getProgressBar(onboarding.currentStep, onboarding.totalSteps)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(onboarding.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{onboarding.startedAt}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{onboarding.lastActiveAt}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOnboardingsScreen;