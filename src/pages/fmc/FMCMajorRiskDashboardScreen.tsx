import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Filter, 
  ArrowUpDown,
  RefreshCw,
  Eye,
  Calendar,
  Activity,
  User,
  Hospital
} from "lucide-react";
import { fmcAPI } from "@/services/fmcService";
import { PatientCase } from "@/types/fmc";

const FMCMajorRiskDashboardScreen = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const [refreshing, setRefreshing] = useState(false);
  const [facilityName, setFacilityName] = useState<string>('Loading...');

  const filters = [
    { id: 'all', label: 'All', color: 'bg-gray-100 text-gray-800' },
    { id: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
    { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { id: 'unassigned', label: 'Unassigned', color: 'bg-red-100 text-red-800' },
    { id: 'assigned', label: 'Assigned', color: 'bg-green-100 text-green-800' },
    { id: 'pcos', label: 'PCOS', color: 'bg-purple-100 text-purple-800' },
    { id: 'hormonal', label: 'Hormonal', color: 'bg-pink-100 text-pink-800' },
    { id: 'metabolic', label: 'Metabolic', color: 'bg-blue-100 text-blue-800' },
  ];

  const sortOptions = [
    { id: 'urgency', label: 'by Urgency' },
    { id: 'time_since_referral', label: 'by Time Since Referral' },
    { id: 'score', label: 'by Score' },
  ];

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {};
      if (activeFilter !== 'all') {
        if (activeFilter === 'critical' || activeFilter === 'high') {
          filters.severity = activeFilter === 'critical' ? 'very_severe' : 'severe';
        } else if (activeFilter === 'unassigned' || activeFilter === 'assigned') {
          filters.status = activeFilter === 'unassigned' ? 'open' : 'assigned';
        } else if (['pcos', 'hormonal', 'metabolic'].includes(activeFilter)) {
          filters.condition = activeFilter;
        }
      }
      
      const response = await fmcAPI.getCases(filters);
      setCases(response.data);
      
    } catch (error: any) {
      console.error('Error fetching cases:', error);
      setError('Failed to load cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCases();
    setRefreshing(false);
  };

  const handleAssignClinician = (caseId: string) => {
    navigate(`/fmc/patient/${caseId}`, { state: { showAssignmentModal: true } });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'very_severe': return 'bg-red-100 text-red-800 border-red-200';
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'assigned': return 'bg-green-500';
      case 'under_treatment': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeSinceReferral = (openedAt: string) => {
    const now = new Date();
    const referralDate = new Date(openedAt);
    const diffInDays = Math.floor((now.getTime() - referralDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const sortCases = (casesToSort: PatientCase[]) => {
    const sorted = [...casesToSort];
    switch (sortBy) {
      case 'urgency':
        return sorted.sort((a, b) => {
          // Critical first, then by score
          if (a.severity === 'very_severe' && b.severity !== 'very_severe') return -1;
          if (a.severity !== 'very_severe' && b.severity === 'very_severe') return 1;
          return b.opening_score - a.opening_score;
        });
      case 'time_since_referral':
        return sorted.sort((a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime());
      case 'score':
        return sorted.sort((a, b) => b.opening_score - a.opening_score);
      default:
        return sorted;
    }
  };

  const filteredAndSortedCases = sortCases(
    cases.filter(case_ => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'critical') return case_.severity === 'very_severe';
      if (activeFilter === 'high') return case_.severity === 'severe';
      if (activeFilter === 'unassigned') return case_.status === 'open';
      if (activeFilter === 'assigned') return case_.status === 'assigned';
      if (activeFilter === 'pcos') return case_.condition === 'pcos';
      if (activeFilter === 'hormonal') return case_.condition === 'maternal';
      if (activeFilter === 'metabolic') return case_.condition === 'cardiovascular';
      return true;
    })
  );

  const criticalUnassignedCount = cases.filter(c => c.severity === 'very_severe' && c.status === 'open').length;
  const criticalAssignedCount = cases.filter(c => c.severity === 'very_severe' && c.status === 'assigned').length;
  const highUnassignedCount = cases.filter(c => c.severity === 'severe' && c.status === 'open').length;
  const highAssignedCount = cases.filter(c => c.severity === 'severe' && c.status === 'assigned').length;
  const totalActiveCases = cases.filter(c => c.status !== 'discharged').length;

  useEffect(() => {
    fetchCases();
    // Set facility name from user profile
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setFacilityName(user.center_info?.center_name || 'FMC');
  }, [activeFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[#C0392B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Major Risk Patient Queue — {facilityName}</h1>
              <p className="text-gray-600">Federal Medical Centre Portal</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="text-[#C0392B] border-[#C0392B]"
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Emergency Banner */}
        {criticalUnassignedCount > 0 && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex justify-between items-center">
              <span>
                <strong>{criticalUnassignedCount}</strong> Critical patients are unassigned — assign to a clinician now
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/fmc/assignment')}
                className="ml-4 border-red-600 text-red-600 hover:bg-red-50"
              >
                Go to Assignment
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Unassigned</p>
                  <p className="text-2xl font-bold text-red-600">{criticalUnassignedCount}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Assigned</p>
                  <p className="text-2xl font-bold text-red-800">{criticalAssignedCount}</p>
                </div>
                <Users className="h-6 w-6 text-red-700" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Unassigned</p>
                  <p className="text-2xl font-bold text-orange-600">{highUnassignedCount}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Assigned</p>
                  <p className="text-2xl font-bold text-orange-700">{highAssignedCount}</p>
                </div>
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Active Cases</p>
                  <p className="text-2xl font-bold text-blue-600">{totalActiveCases}</p>
                </div>
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={activeFilter === filter.id ? filter.color : ''}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Patient Cards */}
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredAndSortedCases.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active cases</h3>
              <p className="text-gray-600">
                {activeFilter === 'all' 
                  ? "No active cases at this FMC" 
                  : `No cases found for filter: ${filters.find(f => f.id === activeFilter)?.label}`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCases.map((case_, index) => (
              <motion.div
                key={case_.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  case_.severity === 'very_severe' && case_.status === 'open' ? 'border-2 border-red-500' : ''
                }`}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{case_.patient.full_name}</h3>
                        <p className="text-sm text-gray-600">
                          ID: {case_.patient.id.slice(0, 8)}...
                        </p>
                      </div>
                      <Badge className={getSeverityColor(case_.severity)}>
                        {case_.severity_label}
                      </Badge>
                    </div>

                    {/* Condition */}
                    <div className="mb-4">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {case_.condition_label}
                      </Badge>
                    </div>

                    {/* Risk Score */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Risk Score</span>
                        <span className="text-lg font-bold text-[#C0392B]">
                          {case_.opening_score}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#C0392B] h-2 rounded-full"
                          style={{ width: `${Math.min(case_.opening_score, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Referral Info */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Referring PHC:</span>
                        <span className="font-medium">{case_.fhc}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date of referral:</span>
                        <span>{new Date(case_.opened_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time since referral:</span>
                        <span className="font-medium">{getTimeSinceReferral(case_.opened_at)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Clinician:</span>
                        <span className={`font-medium ${
                          case_.clinician ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {case_.clinician ? case_.clinician.full_name : 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/fmc/patient/${case_.id}`)}
                        className="flex-1 bg-[#C0392B] hover:bg-[#922B21]"
                        size="sm"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      
                      {case_.status === 'open' && (
                        <Button
                          onClick={() => handleAssignClinician(case_.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Assign
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FMCMajorRiskDashboardScreen;
