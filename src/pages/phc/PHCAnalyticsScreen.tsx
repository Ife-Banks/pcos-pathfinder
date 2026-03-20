import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PHCLayout from "@/components/phc/PHCLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { phcAPI } from "@/services/phcService";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Heart,
  Hospital,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AnalyticsData {
  total_patients: number;
  active_minor_risk: number;
  escalated_this_period: number;
  avg_time_to_action_days: number;
  risk_distribution: { low: number; moderate: number };
  condition_breakdown: { pcos: number; hormonal: number; metabolic: number };
  escalations_timeline: Array<{ week: string; count: number }>;
  staff_actions: {
    advice_sent: number;
    followups_scheduled: number;
    patients_discharged: number;
  };
}

const PLACEHOLDER_DATA: AnalyticsData = {
  total_patients: 0,
  active_minor_risk: 0,
  escalated_this_period: 0,
  avg_time_to_action_days: 0,
  risk_distribution: { low: 0, moderate: 0 },
  condition_breakdown: { pcos: 0, hormonal: 0, metabolic: 0 },
  escalations_timeline: [],
  staff_actions: { advice_sent: 0, followups_scheduled: 0, patients_discharged: 0 },
};

const RANGE_OPTIONS = [
  { value: "7d", label: "This Week" },
  { value: "30d", label: "This Month" },
  { value: "90d", label: "Last 3 Months" },
];

const PHCAnalyticsScreen = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("30d");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const facilityName = user?.center_info?.center_name || "Primary Health Centre";

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await phcAPI.getAnalytics(dateRange);
        if (data?.status === 'success' || data?.total_patients !== undefined) { setAnalytics(data); } else { setAnalytics(null); }
      } catch { setAnalytics(null); } finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [dateRange]);

  const data = analytics || PLACEHOLDER_DATA;
  const hasData = analytics !== null;

  const totalRisk = data.risk_distribution.low + data.risk_distribution.moderate;
  const riskChartData = [
    { name: "Low", value: data.risk_distribution.low, color: "#2E8B57" },
    { name: "Moderate", value: data.risk_distribution.moderate, color: "#F59E0B" },
  ];

  const conditionData = [
    { name: "PCOS", count: data.condition_breakdown.pcos },
    { name: "Hormonal", count: data.condition_breakdown.hormonal },
    { name: "Metabolic", count: data.condition_breakdown.metabolic },
  ];

  const escalationData = data.escalations_timeline.map((item) => ({
    week: new Date(item.week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: item.count,
  }));

  const heatmapData = Array.from({ length: 28 }, (_, i) => ({
    day: i % 7,
    week: Math.floor(i / 7),
    intensity: Math.floor(Math.random() * 5),
  }));

  const renderHeatmap = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const intensities = ["bg-gray-100", "bg-green-100", "bg-green-200", "bg-green-300", "bg-green-400"];
    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-1">
          {days.map((d) => (
            <div key={d} className="w-8 text-center text-xs text-gray-500">{d}</div>
          ))}
        </div>
        {Array.from({ length: 4 }, (_, weekIdx) => (
          <div key={weekIdx} className="flex gap-1">
            {days.map((_, dayIdx) => {
              const cell = heatmapData.find((c) => c.day === dayIdx && c.week === weekIdx);
              return (
                <div
                  key={dayIdx}
                  className={`w-8 h-8 rounded ${intensities[cell?.intensity || 0]}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <PHCLayout>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </PHCLayout>
    );
  }

  return (
    <PHCLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facility Analytics</h1>
            <p className="text-sm text-gray-500">{facilityName}</p>
          </div>
          <div className="flex gap-2">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  dateRange === opt.value
                    ? "bg-[#2E8B57] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {!hasData && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#2E8B57]" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{data.total_patients}</h3>
                  <p className="text-sm text-gray-500">Total Patients</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">registered with this PHC</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-[#2E8B57]" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{data.active_minor_risk}</h3>
                  <p className="text-sm text-gray-500">Active Minor Risk</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">currently under review</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-[#2E8B57]" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{data.escalated_this_period}</h3>
                  <p className="text-sm text-gray-500">Escalated</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">sent to FMC</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#2E8B57]" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {data.avg_time_to_action_days} <span className="text-lg">days</span>
                  </h3>
                  <p className="text-sm text-gray-500">Avg Time to Action</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">from referral to action taken</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Tier Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-gray-900">
                      {totalRisk} total
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2E8B57]" />
                  <span className="text-sm text-gray-600">
                    Low: {data.risk_distribution.low} ({totalRisk > 0 ? Math.round((data.risk_distribution.low / totalRisk) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="text-sm text-gray-600">
                    Moderate: {data.risk_distribution.moderate} ({totalRisk > 0 ? Math.round((data.risk_distribution.moderate / totalRisk) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Conditions Flagged</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conditionData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2E8B57" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {conditionData.map((c) => (
                  <span key={c.name} className="text-sm text-gray-600">
                    {c.name}: {c.count}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Escalations to FMC</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={escalationData}>
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2E8B57"
                      strokeWidth={2}
                      dot={{ fill: "#2E8B57", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Activity</h3>
              <div className="h-64 flex items-center justify-center">
                {renderHeatmap()}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <span className="text-xs text-gray-500">Less</span>
                <div className="w-4 h-4 rounded bg-gray-100" />
                <div className="w-4 h-4 rounded bg-green-100" />
                <div className="w-4 h-4 rounded bg-green-200" />
                <div className="w-4 h-4 rounded bg-green-300" />
                <div className="w-4 h-4 rounded bg-green-400" />
                <span className="text-xs text-gray-500">More</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-[#2E8B57]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{data.staff_actions.advice_sent}</h3>
              <p className="text-sm text-gray-500">Advice Messages Sent</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-[#2E8B57]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{data.staff_actions.followups_scheduled}</h3>
              <p className="text-sm text-gray-500">Follow-Ups Scheduled</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-[#2E8B57]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{data.staff_actions.patients_discharged}</h3>
              <p className="text-sm text-gray-500">Patients Discharged</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PHCLayout>
  );
};

export default PHCAnalyticsScreen;
