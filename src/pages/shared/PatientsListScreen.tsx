import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users,
  Search,
  UserPlus,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fmcAPI } from '@/services/fmcService';

interface Patient {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  gender?: string;
  condition?: string;
  severity?: string;
  registered_at?: string;
  status?: string;
}

interface PatientsListScreenProps {
  facility: string;
  facilityName: string;
  themeColor: string;
}

const PatientsListScreen: React.FC<PatientsListScreenProps> = ({
  facility,
  facilityName,
  themeColor,
}) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPatients();
  }, [filter, searchQuery]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await fmcAPI.getCases();
      const cases = response.data || [];
      setPatients(cases.map((c: any) => ({
        id: c.id,
        email: c.patient?.email || '',
        full_name: c.patient?.full_name || '',
        phone: c.patient?.phone || '',
        gender: c.patient?.onboarding_profile?.gender || '',
        condition: c.condition || '',
        severity: c.severity || '',
        registered_at: c.opened_at ? c.opened_at.split('T')[0] : '',
        status: c.status || 'active',
      })));
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity?: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-700',
      moderate: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      severe: 'bg-red-100 text-red-700',
    };
    if (!severity) return null;
    return (
      <Badge className={colors[severity] || 'bg-gray-100 text-gray-700'}>
        {severity?.charAt(0).toUpperCase() + severity?.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500">Manage registered patients at {facilityName}</p>
        </div>
        <Button 
          onClick={() => navigate(`/${facility}/register-patient`)}
          className={`bg-${themeColor}-600 hover:bg-${themeColor}-700`}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Register Patient
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients..."
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
            variant={filter === 'active' ? 'default' : 'outline'} 
            onClick={() => setFilter('active')}
            size="sm"
          >
            Active
          </Button>
          <Button 
            variant={filter === 'discharged' ? 'default' : 'outline'} 
            onClick={() => setFilter('discharged')}
            size="sm"
          >
            Discharged
          </Button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Patient</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Gender</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Condition</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Severity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Registered</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-10 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-12 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-16 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No patients found. Click "Register Patient" to add one.
                  </td>
                </tr>
              ) : patients.map((patient, i) => (
                <motion.tr
                  key={patient.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{patient.full_name}</p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {patient.gender ? (
                      <Badge variant="outline">{patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {patient.phone || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{patient.condition || 'General'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {getSeverityBadge(patient.severity)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {patient.registered_at || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {patient.status === 'active' ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <XCircle className="h-4 w-4" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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

export default PatientsListScreen;