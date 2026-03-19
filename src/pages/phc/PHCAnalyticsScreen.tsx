import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Hospital,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  Building,
  Users2,
  FileText,
  MessageSquare,
  ArrowUpRight
} from "lucide-react";
import { phcAPI } from "@/services/phcService";
import { PHCAnalytics } from "@/types/phc";

const PHCAnalyticsScreen = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<PHCAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await phcAPI.getAnalytics(dateRange);
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
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-amber-500';
      case 'severe': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'pcos': return 'bg-purple-100 text-purple-800';
      case 'maternal': return 'bg-pink-100 text-pink-800';
      case 'cardiovascular': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E8B57]"></div>
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
                onClick={() => navigate('/phc/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PHC Analytics & Facility Overview</h1>
                <p className="text-gray-600">Primary Health Centre performance and insights</p>
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
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
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
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-amber-600" />
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
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analytics.escalation_rate_change)}
                  <span className={`text-sm font-medium ${getTrendColor(analytics.escalation_rate_change)}`}>
                    {analytics.escalation_rate_change > 0 ? '+' : ''}{analytics.escalation_rate_change}%
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analytics.escalation_rate}%</h3>
              <p className="text-sm text-gray-600">Escalation Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient Distribution */}
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
                Condition Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.condition_distribution.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getConditionColor(condition.condition)}>
                        {condition.condition}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#2E8B57] h-2 rounded-full"
                          style={{ width: `${condition.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{condition.percentage}%</span>
                      <span className="text-sm text-gray-600 w-8 text-right">{condition.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Facility Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="h-5 w-5" />
                Facility Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-semibold">{analytics.facility.name}</h4>
                    <p className="text-sm text-gray-600">{analytics.facility.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{analytics.facility.address}</p>
                    <p className="text-sm text-gray-600">{analytics.facility.lga}, {analytics.facility.state}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-600">{analytics.facility.phone}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-600">{analytics.facility.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-5 w-5" />
                Staff Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Staff</span>
                  <span className="font-semibold">{analytics.staff.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">PHC Admin</span>
                  <span className="font-semibold">{analytics.staff.admins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">PHC Staff</span>
                  <span className="font-semibold">{analytics.staff.staff}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Today</span>
                  <span className="font-semibold text-green-600">{analytics.staff.active_today}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Clinical Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Walk-ins Today</span>
                  <span className="font-semibold">{analytics.clinical.walk_ins_today}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Advice Sent</span>
                  <span className="font-semibold">{analytics.clinical.advice_sent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Follow-ups Scheduled</span>
                  <span className="font-semibold">{analytics.clinical.follow_ups_scheduled}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Escalations</span>
                  <span className="font-semibold text-red-600">{analytics.clinical.escalations}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Patient Satisfaction</h4>
                <p className="text-2xl font-bold text-green-600">{analytics.performance.patient_satisfaction}%</p>
                <p className="text-sm text-gray-600">Based on feedback</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Avg. Response Time</h4>
                <p className="text-2xl font-bold text-blue-600">{analytics.performance.avg_response_time}h</p>
                <p className="text-sm text-gray-600">For follow-ups</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="h-8 w-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Treatment Adherence</h4>
                <p className="text-2xl font-bold text-amber-600">{analytics.performance.treatment_adherence}%</p>
                <p className="text-sm text-gray-600">Following advice</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ArrowUpRight className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Escalation Success</h4>
                <p className="text-2xl font-bold text-red-600">{analytics.performance.escalation_success_rate}%</p>
                <p className="text-sm text-gray-600">Successful transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PHCAnalyticsScreen;
