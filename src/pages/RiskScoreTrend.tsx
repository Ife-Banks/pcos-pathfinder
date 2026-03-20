import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingDown, TrendingUp, Minus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const TEAL_PRIMARY = '#00897B';

interface PredictionRecord {
  id: string;
  risk_score: number;
  risk_tier: string;
  computed_at: string;
  data_completeness_pct?: number;
}

interface ChartDataPoint {
  date: string;
  score: number;
  tier: string;
  index: number;
}

const formatDelta = (val: number | null) => {
  if (val === null) return { text: "—", color: "text-gray-400", arrow: null };
  const text = val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
  if (Math.abs(val) < 0.005) return { text, color: "text-gray-500", arrow: null };
  if (val > 0) return { text, color: "#E74C3C", arrow: "↗" };
  return { text, color: TEAL_PRIMARY, arrow: "↘" };
};

const formatDateShort = (isoStr: string) => {
  const date = new Date(isoStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-l-2 border-teal-500 shadow-lg rounded-lg p-3 text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-gray-900">
        Risk Score : {payload[0].value.toFixed(2)}
      </p>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-3 animate-pulse">
    <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
    <div className="h-6 bg-gray-100 rounded w-4/5 mx-auto" />
  </div>
);

const RiskScoreTrend = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        'https://ai-mshm-backend-d47t.onrender.com/api/v1/predictions/history/',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      let data = await res.json();
      if (data.results) data = data.results;
      if (!Array.isArray(data)) data = [];
      setHistory(data);
    } catch {
      setError('Unable to load risk trend data.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sorted = [...history].sort(
    (a, b) => new Date(a.computed_at).getTime() - new Date(b.computed_at).getTime()
  );

  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const oldest = sorted.length > 0 ? sorted[0] : null;

  const currentScore = latest?.risk_score ?? null;
  const vsLastWeek = latest && previous
    ? latest.risk_score - previous.risk_score
    : null;
  const eightWeekDelta = latest && oldest
    ? latest.risk_score - oldest.risk_score
    : null;

  const currentDelta = formatDelta(vsLastWeek);
  const overallDelta = formatDelta(eightWeekDelta);

  const chartData: ChartDataPoint[] = sorted.map((p, i) => ({
    date: formatDateShort(p.computed_at),
    score: p.risk_score,
    tier: p.risk_tier,
    index: i,
  }));

  const weekCount = history.length;
  const subtitle = weekCount === 0
    ? "8-week history"
    : weekCount === 1
    ? "1-week history"
    : `${weekCount}-week history`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-gray-900">Risk Trend</h1>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-red-700">{error}</span>
            <Button size="sm" variant="outline" onClick={fetchHistory}>
              Retry
            </Button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border border-gray-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Current</p>
                    <p className="text-xl font-display font-bold text-gray-900">
                      {currentScore !== null ? currentScore.toFixed(2) : "—"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Card className="border border-gray-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">vs Last Week</p>
                    <div
                      className="flex items-center justify-center gap-0.5"
                      style={{ color: currentDelta.color }}
                    >
                      {currentDelta.arrow === "↗" && <TrendingUp className="w-3.5 h-3.5" />}
                      {currentDelta.arrow === "↘" && <TrendingDown className="w-3.5 h-3.5" />}
                      {currentDelta.arrow === null && vsLastWeek !== null && <Minus className="w-3.5 h-3.5" />}
                      <span className="text-xl font-display font-bold">
                        {currentDelta.text}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border border-gray-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">8-wk Δ</p>
                    <div
                      className="flex items-center justify-center gap-0.5"
                      style={{ color: overallDelta.color }}
                    >
                      {overallDelta.arrow === "↗" && <TrendingUp className="w-3.5 h-3.5" />}
                      {overallDelta.arrow === "↘" && <TrendingDown className="w-3.5 h-3.5" />}
                      {overallDelta.arrow === null && eightWeekDelta !== null && <Minus className="w-3.5 h-3.5" />}
                      <span className="text-xl font-display font-bold">
                        {overallDelta.text}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border border-gray-200">
            <CardContent className="p-4 pt-5">
              {loading ? (
                <div className="h-[220px] bg-gray-100 rounded animate-pulse" />
              ) : sorted.length === 0 ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-center px-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Not enough data yet.
                  </p>
                  <p className="text-xs text-gray-400">
                    Complete daily check-ins to build your risk score history.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={chartData}
                    onMouseMove={(e: any) => {
                      if (e?.activePayloadIndex !== undefined) {
                        setActiveIndex(e.activePayloadIndex);
                      }
                    }}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                      interval={chartData.length > 6 ? 1 : 0}
                    />
                    <YAxis
                      domain={[0, 1]}
                      ticks={[0, 0.25, 0.5, 0.75, 1]}
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={0.5}
                      stroke="#F39C12"
                      strokeDasharray="5 5"
                      label={{
                        value: "Moderate",
                        fill: "#F39C12",
                        fontSize: 10,
                        position: "right",
                      }}
                    />
                    <ReferenceLine
                      y={0.75}
                      stroke="#E74C3C"
                      strokeDasharray="5 5"
                      label={{
                        value: "High",
                        fill: "#E74C3C",
                        fontSize: 10,
                        position: "right",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={TEAL_PRIMARY}
                      strokeWidth={2.5}
                      dot={{
                        fill: TEAL_PRIMARY,
                        strokeWidth: 2,
                        r: activeIndex !== null ? 4 : 5,
                      }}
                      activeDot={{
                        r: 7,
                        fill: "#FFFFFF",
                        stroke: TEAL_PRIMARY,
                        strokeWidth: 3,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div>
          <h2 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
            Weekly Changes
          </h2>
          <div className="space-y-2">
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-3 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-100 rounded w-2/3 mb-1" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              : sorted.length === 0 && !loading ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No weekly data yet.
                </p>
              ) : (
                [...sorted].reverse().map((record, revIdx) => {
                  const originalIdx = sorted.length - 1 - revIdx;
                  const prevRecord =
                    originalIdx > 0 ? sorted[originalIdx - 1] : null;
                  const delta =
                    prevRecord ? record.risk_score - prevRecord.risk_score : null;
                  const formattedDelta = formatDelta(delta);
                  const weekLabel = `W${sorted.length - revIdx}`;

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + revIdx * 0.04 }}
                      onClick={() => setActiveIndex(originalIdx)}
                      className={`bg-white rounded-xl border border-gray-200 cursor-pointer transition-all ${
                        activeIndex === originalIdx
                          ? "border-teal-400 ring-1 ring-teal-200"
                          : "hover:border-gray-300"
                      }`}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
                          style={
                            activeIndex === originalIdx
                              ? { backgroundColor: TEAL_PRIMARY + "20" }
                              : {}
                          }
                        >
                          <span
                            className="text-xs font-bold font-display"
                            style={
                              activeIndex === originalIdx
                                ? { color: TEAL_PRIMARY }
                                : { color: "#9CA3AF" }
                            }
                          >
                            {weekLabel}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDateShort(record.computed_at)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Score: {record.risk_score.toFixed(2)}
                          </p>
                        </div>
                        {delta !== null ? (
                          <div
                            className="flex items-center gap-0.5"
                            style={{ color: formattedDelta.color }}
                          >
                            {formattedDelta.arrow === "↗" && (
                              <TrendingUp className="w-3.5 h-3.5" />
                            )}
                            {formattedDelta.arrow === "↘" && (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            {formattedDelta.arrow === null && (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                            <span className="text-sm font-bold font-display">
                              {formattedDelta.text}
                            </span>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-300 text-gray-400"
                          >
                            Baseline
                          </Badge>
                        )}
                      </CardContent>
                    </motion.div>
                  );
                })
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskScoreTrend;
