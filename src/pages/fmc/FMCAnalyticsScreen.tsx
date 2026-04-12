import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import FMCLayout from '@/components/layout/FMCLayout';
import { fmcAPI } from '@/services/fmcService';
import { BarChart3, Users, RefreshCw } from 'lucide-react';

const FMCAnalyticsScreen = () => {
  const [dateRange, setDateRange] = useState('this_month');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fmcAPI.getAnalytics(dateRange);
      setAnalyticsData(response.data);
    } catch (error: any) {
      console.log('Error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [dateRange]);

  const kpiData = analyticsData ? {
    totalActive: analyticsData.total_active_cases || 0,
    critical: analyticsData.critical_cases || 0,
    avgDays: analyticsData.avg_days_to_assignment || 0,
    resolved: analyticsData.cases_resolved || 0
  } : { totalActive: 47, critical: 12, avgDays: 1.8, resolved: 23 };

  if (loading) {
    return (
      <FMCLayout>
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-8 w-8 animate-spin text-[#C0392B]" />
        </div>
      </FMCLayout>
    );
  }

  return (
    <FMCLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border rounded-md px-3 py-2">
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_3_months">Last 3 Months</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card><CardContent className="p-3"><p className="text-xs text-gray-500">Active Cases</p><p className="text-xl font-bold text-[#C0392B]">{kpiData.totalActive}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-xs text-gray-500">Critical</p><p className="text-xl font-bold text-red-600">{kpiData.critical}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-xs text-gray-500">Avg Days</p><p className="text-xl font-bold text-blue-600">{kpiData.avgDays}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-xs text-gray-500">Resolved</p><p className="text-xl font-bold text-green-600">{kpiData.resolved}</p></CardContent></Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Severity Distribution</h3>
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Condition Prevalence</h3>
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FMCLayout>
  );
};

export default FMCAnalyticsScreen;