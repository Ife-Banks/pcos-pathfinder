import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users, Activity, Calendar, BarChart3, Target,
  AlertTriangle, CheckCircle, Clock, Stethoscope, TrendingUp
} from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";

interface AnalyticsData {
  total_assigned: number;
  active_cases: number;
  resolved_cases: number;
  avg_treatment_duration_days: number;
  condition_distribution: { pcos: number; hormonal: number; metabolic: number };
  outcomes: { resolved: number; under_treatment: number; referred_on: number };
}

const ClinicianAnalyticsScreen = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await clinicianAPI.getAnalytics(dateRange);
      setAnalytics(res.data);
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [dateRange]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (error || !analytics) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error || 'Analytics data not available'}</AlertDescription>
      </Alert>
    </div>
  );

  const total = analytics.total_assigned || 1; // avoid div/0
  const condTotal = (analytics.condition_distribution.pcos +
    analytics.condition_distribution.hormonal +
    analytics.condition_distribution.metabolic) || 1;
  const outcomeTotal = (analytics.outcomes.resolved +
    analytics.outcomes.under_treatment +
    analytics.outcomes.referred_on) || 1;

  const conditionBars = [
    { label: 'PCOS', value: analytics.condition_distribution.pcos, color: 'bg-purple-500' },
    { label: 'Hormonal', value: analytics.condition_distribution.hormonal, color: 'bg-pink-500' },
    { label: 'Metabolic', value: analytics.condition_distribution.metabolic, color: 'bg-orange-500' },
  ];

  const outcomeBars = [
    { label: 'Resolved', value: analytics.outcomes.resolved, color: 'bg-green-500' },
    { label: 'Under Treatment', value: analytics.outcomes.under_treatment, color: 'bg-blue-500' },
    { label: 'Referred On', value: analytics.outcomes.referred_on, color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500">Patient population insights</p>
            </div>
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Assigned</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.total_assigned}</p>
              </div>
              <Users className="h-8 w-8 text-blue-300" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Active Cases</p>
                <p className="text-3xl font-bold text-amber-600">{analytics.active_cases}</p>
              </div>
              <Activity className="h-8 w-8 text-amber-300" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Resolved Cases</p>
                <p className="text-3xl font-bold text-green-600">{analytics.resolved_cases}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-300" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Avg Treatment Duration</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.avg_treatment_duration_days}d</p>
              </div>
              <Clock className="h-8 w-8 text-purple-300" />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Condition Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-5 w-5 text-gray-500" />
                Condition Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditionBars.map(c => (
                <div key={c.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{c.label}</span>
                    <span className="text-gray-500">{c.value} patients ({Math.round(c.value / condTotal * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`${c.color} h-2.5 rounded-full transition-all`}
                      style={{ width: `${Math.round(c.value / condTotal * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {condTotal === 1 && (
                <p className="text-xs text-gray-400 text-center pt-2">No condition data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-gray-500" />
                Patient Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {outcomeBars.map(o => (
                <div key={o.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{o.label}</span>
                    <span className="text-gray-500">{o.value} ({Math.round(o.value / outcomeTotal * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`${o.color} h-2.5 rounded-full transition-all`}
                      style={{ width: `${Math.round(o.value / outcomeTotal * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {outcomeTotal === 1 && (
                <p className="text-xs text-gray-400 text-center pt-2">No outcome data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-gray-500" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {total > 0 ? Math.round(analytics.resolved_cases / total * 100) : 0}%
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Active Case Load</p>
                <p className="text-2xl font-bold text-amber-600">
                  {total > 0 ? Math.round(analytics.active_cases / total * 100) : 0}%
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Referral Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {total > 0 ? Math.round(analytics.outcomes.referred_on / total * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ClinicianAnalyticsScreen;