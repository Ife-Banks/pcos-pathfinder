import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const HISTORY = [
  { week: "W1", score: 0.52, label: "Jan 6" },
  { week: "W2", score: 0.55, label: "Jan 13" },
  { week: "W3", score: 0.61, label: "Jan 20" },
  { week: "W4", score: 0.58, label: "Jan 27" },
  { week: "W5", score: 0.63, label: "Feb 3" },
  { week: "W6", score: 0.65, label: "Feb 10" },
  { week: "W7", score: 0.62, label: "Feb 17" },
  { week: "W8", score: 0.68, label: "Feb 24" },
];

const RiskScoreTrend = () => {
  const navigate = useNavigate();
  const current = HISTORY[HISTORY.length - 1];
  const previous = HISTORY[HISTORY.length - 2];
  const delta = current.score - previous.score;
  const overallDelta = current.score - HISTORY[0].score;

  const getDeltaIcon = (d: number) => {
    if (d > 0.02) return <TrendingUp className="w-4 h-4" />;
    if (d < -0.02) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getDeltaColor = (d: number) => {
    if (d > 0.02) return "text-[hsl(var(--destructive))]";
    if (d < -0.02) return "text-accent";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Risk Trend</h1>
          <p className="text-xs text-muted-foreground">8-week history</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-xl font-display font-bold text-foreground">{current.score.toFixed(2)}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">vs Last Week</p>
                <div className={`flex items-center justify-center gap-1 ${getDeltaColor(delta)}`}>
                  {getDeltaIcon(delta)}
                  <span className="text-xl font-display font-bold">
                    {delta > 0 ? "+" : ""}{delta.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">8-wk Δ</p>
                <div className={`flex items-center justify-center gap-1 ${getDeltaColor(overallDelta)}`}>
                  {getDeltaIcon(overallDelta)}
                  <span className="text-xl font-display font-bold">
                    {overallDelta > 0 ? "+" : ""}{overallDelta.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4 pt-5">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 13,
                    }}
                    formatter={(val: number) => [val.toFixed(2), "Risk Score"]}
                  />
                  <ReferenceLine y={0.5} stroke="hsl(var(--warning))" strokeDasharray="5 5" label={{ value: "Moderate", fill: "hsl(var(--warning))", fontSize: 10 }} />
                  <ReferenceLine y={0.75} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label={{ value: "High", fill: "hsl(var(--destructive))", fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Week-by-week */}
        <div>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Weekly Changes
          </h2>
          <div className="space-y-2">
            {[...HISTORY].reverse().map((entry, i) => {
              const prev = HISTORY[HISTORY.length - 1 - i - 1];
              const d = prev ? entry.score - prev.score : 0;
              return (
                <motion.div
                  key={entry.week}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                >
                  <Card className="border-border shadow-none">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <span className="text-xs font-bold font-display text-muted-foreground">{entry.week}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{entry.label}</p>
                        <p className="text-xs text-muted-foreground">Score: {entry.score.toFixed(2)}</p>
                      </div>
                      {prev && (
                        <div className={`flex items-center gap-1 ${getDeltaColor(d)}`}>
                          {getDeltaIcon(d)}
                          <span className="text-sm font-bold font-display">
                            {d > 0 ? "+" : ""}{d.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {!prev && (
                        <Badge variant="outline" className="text-xs">Baseline</Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskScoreTrend;
