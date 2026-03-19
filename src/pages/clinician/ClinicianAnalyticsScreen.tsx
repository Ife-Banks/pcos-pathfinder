import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Calendar, 
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Pill,
  MessageSquare,
  FileText,
  Stethoscope
} from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";
import { ClinicianAnalytics } from "@/types/clinician";

const ClinicianAnalyticsScreen = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<ClinicianAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clinicianAPI.getAnalytics(dateRange);
      setAnalytics(response.data);
      
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'moderate': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDateRange = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 3 months';
      case '1y': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Analytics data not available'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/clinician/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Patient population insights and trends</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Date Range Badge */}
        <div className="mb-6">
          <Badge variant="outline" className="text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDateRange(dateRange)}
          </Badge>
        </div>

        {/* Overview KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.patient_growth)}
                  <span className={`text-sm font-medium ${getTrendColor(analytics.patient_growth)}`}>
                    {analytics.patient_growth > 0 ? '+' : ''}{analytics.patient_growth}%
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analytics.total_patients}</h3>
              <p className="text-sm text-gray-600">Total Patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.avg_risk_score_change)}
                  <span className={`text-sm font-medium ${getTrendColor(analytics.avg_risk_score_change)}`}>
                    {analytics.avg_risk_score_change > 0 ? '+' : ''}{analytics.avg_risk_score_change}
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analytics.avg_risk_score}</h3>
              <p className="text-sm text-gray-600">Average Risk Score</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.engagement_rate_change)}
                  <span className={`text-sm font-medium ${getTrendColor(analytics.engagement_rate_change)}`}>
                    {analytics.engagement_rate_change > 0 ? '+' : ''}{analytics.engagement_rate_change}%
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analytics.engagement_rate}%</h3>
              <p className="text-sm text-gray-600">Engagement Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.treatment_adherence_change)}
                  <span className={`text-sm font-medium ${getTrendColor(analytics.treatment_adherence_change)}`}>
                    {analytics.treatment_adherence_change > 0 ? '+' : ''}{analytics.treatment_adherence_change}%
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analytics.treatment_adherence}%</h3>
              <p className="text-sm text-gray-600">Treatment Adherence</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Risk Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.risk_distribution.map((risk, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(risk.level)}`} />
                      <span className="font-medium capitalize">{risk.level}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getRiskLevelColor(risk.level)}`}
                          style={{ width: `${risk.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{risk.percentage}%</span>
                      <span className="text-sm text-gray-600 w-8 text-right">{risk.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Age Group Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.age_distribution.map((age, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{age.range}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${age.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{age.percentage}%</span>
                      <span className="text-sm text-gray-600 w-8 text-right">{age.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Treatment and Communication Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Treatment Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Plans</span>
                  <span className="font-semibold">{analytics.treatment_plans.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold">{analytics.treatment_plans.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">{analytics.treatment_plans.success_rate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Prescriptions</span>
                  <span className="font-semibold">{analytics.prescriptions.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Refills This Month</span>
                  <span className="font-semibold">{analytics.prescriptions.refills}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Adherence Rate</span>
                  <span className="font-semibold text-green-600">{analytics.prescriptions.adherence_rate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Messages Sent</span>
                  <span className="font-semibold">{analytics.communication.messages_sent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">{analytics.communication.avg_response_time}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Patient Satisfaction</span>
                  <span className="font-semibold text-green-600">{analytics.communication.satisfaction}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trending Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Key Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">New Patients</h4>
                <p className="text-2xl font-bold text-blue-600">{analytics.trends.new_patients}</p>
                <p className="text-sm text-gray-600">This period</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900">High Risk Cases</h4>
                <p className="text-2xl font-bold text-red-600">{analytics.trends.high_risk_cases}</p>
                <p className="text-sm text-gray-600">Requiring attention</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Improved Patients</h4>
                <p className="text-2xl font-bold text-green-600">{analytics.trends.improved_patients}</p>
                <p className="text-sm text-gray-600">Risk score decreased</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Avg Follow-up</h4>
                <p className="text-2xl font-bold text-amber-600">{analytics.trends.avg_follow_up_days}d</p>
                <p className="text-sm text-gray-600">Between visits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicianAnalyticsScreen;
