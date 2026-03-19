import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Activity
} from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";
import { PatientSummary, ClinicianAnalytics } from "@/types/clinician";

const ClinicianDashboardScreen = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [analytics, setAnalytics] = useState<ClinicianAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const [showNewAssignments, setShowNewAssignments] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: 'all', label: 'All', color: 'bg-gray-100 text-gray-800' },
    { id: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
    { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { id: 'awaiting_plan', label: 'Awaiting Plan', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'plan_active', label: 'Plan Active', color: 'bg-green-100 text-green-800' },
    { id: 'followup_due', label: 'Follow-Up Due', color: 'bg-blue-100 text-blue-800' },
  ];

  const sortOptions = [
    { id: 'urgency', label: 'by Urgency' },
    { id: 'assignment_date', label: 'by Assignment Date' },
    { id: 'risk_score', label: 'by Risk Score' },
  ];

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {};
      if (activeFilter !== 'all') {
        if (activeFilter === 'critical' || activeFilter === 'high') {
          filters.tier = activeFilter;
        } else if (activeFilter === 'awaiting_plan') {
          filters.status = 'awaiting_plan';
        }
      }
      
      const response = await clinicianAPI.getMyPatients(filters);
      setPatients(response.data.patients);
      
      // Check for new assignments
      const newAssignments = response.data.patients.filter((p: PatientSummary) => p.is_new_assignment);
      if (newAssignments.length > 0) {
        setShowNewAssignments(true);
      }
      
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await clinicianAPI.getAnalytics('30d');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    await fetchAnalytics();
    setRefreshing(false);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getTreatmentStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-red-500';
      case 'draft': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatRiskScore = (scores: { pcos: number; hormonal: number; metabolic: number }) => {
    const maxScore = Math.max(scores.pcos, scores.hormonal, scores.metabolic);
    return Math.round(maxScore);
  };

  const getConditionBadges = (scores: { pcos: number; hormonal: number; metabolic: number }) => {
    const badges = [];
    if (scores.pcos > 60) badges.push({ label: 'PCOS', color: 'bg-purple-100 text-purple-800' });
    if (scores.hormonal > 60) badges.push({ label: 'Hormonal', color: 'bg-pink-100 text-pink-800' });
    if (scores.metabolic > 60) badges.push({ label: 'Metabolic', color: 'bg-blue-100 text-blue-800' });
    return badges;
  };

  useEffect(() => {
    fetchPatients();
    fetchAnalytics();
  }, [activeFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[#1A5276]" />
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
              <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
              <p className="text-gray-600">Dr. {localStorage.getItem('user_name') || 'Loading...'}</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="text-[#1A5276] border-[#1A5276]"
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
        {/* New Assignments Banner */}
        {showNewAssignments && patients.filter(p => p.is_new_assignment).length > 0 && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex justify-between items-center">
              <span>
                <strong>{patients.filter(p => p.is_new_assignment).length}</strong> new patients have been assigned to you
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewAssignments(false)}
                className="ml-4"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="border-l-4 border-l-[#1A5276]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Active Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.active_cases}</p>
                  </div>
                  <Users className="h-8 w-8 text-[#1A5276]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical</p>
                    <p className="text-2xl font-bold text-red-600">
                      {patients.filter(p => p.tier === 'critical').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {patients.filter(p => p.tier === 'high').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Awaiting Treatment Plan</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {patients.filter(p => p.treatment_plan_status === 'not_started').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
        ) : patients.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients assigned yet</h3>
              <p className="text-gray-600">
                The FMC will notify you when a patient is assigned.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">
                          Age {patient.age} • BMI {patient.bmi}
                        </p>
                      </div>
                      <Badge className={getTierColor(patient.tier)}>
                        {patient.tier}
                      </Badge>
                    </div>

                    {/* Condition Badges */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {getConditionBadges(patient.risk_scores).map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className={badge.color}>
                          {badge.label}
                        </Badge>
                      ))}
                    </div>

                    {/* Risk Score */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Risk Score</span>
                        <span className="text-lg font-bold text-[#1A5276]">
                          {formatRiskScore(patient.risk_scores)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#1A5276] h-2 rounded-full"
                          style={{ width: `${formatRiskScore(patient.risk_scores)}%` }}
                        />
                      </div>
                    </div>

                    {/* Assignment and Treatment Info */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Assigned:</span>
                        <span>{new Date(patient.assignment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Treatment Plan:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getTreatmentStatusColor(patient.treatment_plan_status)}`} />
                          <span className="capitalize">
                            {patient.treatment_plan_status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {patient.next_followup && (
                        <div className="flex justify-between">
                          <span>Next Follow-up:</span>
                          <span>{new Date(patient.next_followup).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => navigate(`/clinician/patient/${patient.id}`)}
                      className="w-full bg-[#1A5276] hover:bg-[#2A6286]"
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Patient
                    </Button>
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

export default ClinicianDashboardScreen;
