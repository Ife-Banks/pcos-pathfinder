import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PHCLayout from "@/components/phc/PHCLayout";
import { 
  Users, 
  Search, 
  RefreshCw,
  UserPlus,
  Activity,
  Calendar,
  User,
  AlertCircle,
  ArrowUpDown
} from "lucide-react";
import { phcAPI } from "@/services/phcService";
import { PHCRecord } from "@/types/phc";

const PHCMinorRiskDashboardScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [records, setRecords] = useState<PHCRecord[]>([]);
  const [allRecords, setAllRecords] = useState<PHCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk_score');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const facilityName = user?.center_info?.center_name || 'PHC';
  const queueTitle = `Minor Risk Patient Queue — ${facilityName}`;

  const filters = [
    { id: 'all', label: 'All', group: 'tier' },
    { id: 'moderate', label: 'Moderate', group: 'tier' },
    { id: 'low', label: 'Low', group: 'tier' },
    { id: 'pcos', label: 'PCOS', group: 'condition' },
    { id: 'hormonal', label: 'Hormonal', group: 'condition' },
    { id: 'metabolic', label: 'Metabolic', group: 'condition' },
    { id: 'new_today', label: 'New Today', group: 'status' },
    { id: 'awaiting_review', label: 'Awaiting Review', group: 'status' },
  ];

  const sortOptions = [
    { id: 'risk_score', label: 'by Risk Score (desc)' },
    { id: 'date_referred', label: 'by Date Referred' },
    { id: 'last_checkin', label: 'by Last Check-In' },
  ];

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allRes, filteredRes] = await Promise.all([
        phcAPI.getQueue({}),
        activeFilter === 'new_today'
          ? phcAPI.getQueue({})
          : (() => {
              const queueFilters: Record<string, string> = {};
              if (activeFilter === 'moderate') queueFilters.severity = 'moderate';
              else if (activeFilter === 'low') queueFilters.severity = 'mild';
              else if (activeFilter === 'awaiting_review') queueFilters.status = 'new';
              else if (['pcos', 'hormonal', 'metabolic'].includes(activeFilter)) {
                queueFilters.condition = activeFilter;
              }
              return phcAPI.getQueue(queueFilters);
            })(),
      ]);

      const all = allRes.data ?? [];
      setAllRecords(all);

      if (activeFilter === 'new_today') {
        const today = new Date().toDateString();
        setRecords(all.filter(r => new Date(r.opened_at).toDateString() === today));
      } else {
        setRecords(filteredRes.data ?? []);
      }

    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Error fetching records:', err);
      setError(e.message || 'Failed to load patient records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800 border-green-200';
      case 'under_review': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'action_taken': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'escalated': return 'bg-red-100 text-red-800 border-red-200';
      case 'discharged': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-500';
      case 'under_review': return 'bg-amber-500';
      case 'action_taken': return 'bg-blue-500';
      case 'escalated': return 'bg-red-500';
      case 'discharged': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getConditionBadgeColor = (condition: string) => {
    switch (condition) {
      case 'pcos': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hormonal': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'metabolic': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'moderate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'mild': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredAndSortedRecords = records
    .filter(record => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const patientName = record.patient.full_name.toLowerCase();
      const patientEmail = record.patient.email.toLowerCase();
      const recordId = record.id.toLowerCase();
      return patientName.includes(query) || patientEmail.includes(query) || recordId.slice(0, 7).includes(query);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'risk_score':
          return (b.latest_score ?? 0) - (a.latest_score ?? 0);
        case 'date_referred':
          return new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime();
        case 'last_checkin': {
          const lastA = a.last_advice_at || a.opened_at;
          const lastB = b.last_advice_at || b.opened_at;
          return new Date(lastB).getTime() - new Date(lastA).getTime();
        }
        default:
          return 0;
      }
    });

  const moderateCount = allRecords.filter(r => r.severity === 'moderate').length;
  const lowCount = allRecords.filter(r => r.severity === 'mild').length;
  const newTodayCount = allRecords.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.opened_at).toDateString() === today;
  }).length;

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  if (loading && records.length === 0) {
    return (
      <PHCLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{queueTitle}</h1>
                  <p className="text-gray-600">Primary Health Centre Portal</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Button className="bg-[#2E8B57] hover:bg-[#236F47] flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Register Walk-in
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Skeletons */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Summary Stats Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Patient Card Skeletons */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PHCLayout>
    );
  }

  return (
    <PHCLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{queueTitle}</h1>
                <p className="text-gray-600">Primary Health Centre Portal</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  className="bg-[#2E8B57] hover:bg-[#236F47] flex items-center gap-2"
                  onClick={() => navigate('/phc/register')}
                >
                  <UserPlus className="h-4 w-4" />
                  Register Walk-in
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Error State */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={fetchRecords}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Moderate</p>
                    <p className="text-2xl font-bold text-gray-900">{moderateCount}</p>
                  </div>
                  <Activity className="h-6 w-6 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#2E8B57]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Low</p>
                    <p className="text-2xl font-bold text-gray-900">{lowCount}</p>
                  </div>
                  <Users className="h-6 w-6 text-[#2E8B57]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Referrals Today</p>
                    <p className="text-2xl font-bold text-gray-900">{newTodayCount}</p>
                  </div>
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search + Filter Chips */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, ID, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-[#2E8B57] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Control */}
          <div className="flex justify-end mb-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Patient List */}
          {filteredAndSortedRecords.length === 0 && !loading ? (
            <Card className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients assigned to this PHC yet</h3>
              <p className="text-gray-600 mb-4">Patients will appear here once they register and are assigned to your facility</p>
              <Button 
                className="bg-[#2E8B57] hover:bg-[#236F47]"
                onClick={() => navigate('/phc/register')}
              >
                Register a Walk-In Patient
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={() => navigate(`/phc/patients/${record.id}`)}
                >
                  <div className="flex items-center gap-4">
                    {/* Patient Avatar */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#2E8B57] flex items-center justify-center text-white font-semibold">
                        {getInitials(record.patient.full_name || 'Unknown')}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {record.patient.id?.slice(-6) || 'N/A'}
                      </span>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{record.patient.full_name}</h3>
                      <p className="text-sm text-gray-600">{record.patient.email}</p>
                    </div>

                    {/* Date & Facility */}
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {record.opened_at ? formatDate(record.opened_at) : 'Date unknown'}
                      </p>
                      <p className="text-xs text-gray-500">{record.hcc}</p>
                    </div>

                    {/* Badges & Score */}
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getConditionBadgeColor(record.condition)}>
                        {record.condition_label || record.condition.toUpperCase()}
                      </Badge>
                      <Badge className={getSeverityBadgeColor(record.severity)}>
                        {record.severity_label || record.severity}
                      </Badge>
                      <Badge className={getStatusColor(record.status)}>
                        <span className={`w-2 h-2 rounded-full ${getStatusDot(record.status)} mr-2`} />
                        {record.status_label || record.status}
                      </Badge>
                      <p className="text-sm text-gray-900 font-semibold">Score: {record.latest_score}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-[#2E8B57] hover:bg-[#E8F5E9]"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/phc/patients/${record.id}`);
                        }}
                      >
                        View
                      </Button>
                    </div>

                    {/* NEW Tag */}
                    {record.status === 'new' && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
                        NEW
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PHCLayout>
  );
};

export default PHCMinorRiskDashboardScreen;
