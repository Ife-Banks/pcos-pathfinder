import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureDetail {
  feature: string;
  currentValue: string;
  shapCurrent: number;
  shapPrevious: number;
  unit: string;
  explanation: string;
}

const FEATURES: FeatureDetail[] = [
  { feature: "LH/FSH Ratio", currentValue: "2.4", shapCurrent: 0.14, shapPrevious: 0.12, unit: "", explanation: "Your LH/FSH ratio increased from 2.1 to 2.4, amplifying its contribution. A ratio above 2.0 is associated with PCOS." },
  { feature: "Fasting Insulin", currentValue: "18.3", shapCurrent: 0.11, shapPrevious: 0.10, unit: "µIU/mL", explanation: "Fasting insulin remained elevated. Levels above 15 µIU/mL suggest insulin resistance, a key PCOS driver." },
  { feature: "Cycle Irregularity", currentValue: "Score 3", shapCurrent: 0.09, shapPrevious: 0.11, unit: "", explanation: "Your cycle regularity slightly improved this week, reducing this factor's contribution compared to last week." },
  { feature: "Ovarian Volume", currentValue: "12.0", shapCurrent: 0.07, shapPrevious: 0.07, unit: "mL", explanation: "Ovarian volume remained stable. Volumes above 10 mL are considered enlarged and contribute to risk." },
  { feature: "BMI", currentValue: "23.1", shapCurrent: -0.04, shapPrevious: -0.05, unit: "kg/m²", explanation: "Your BMI remains healthy, continuing to lower your overall risk. Slight increase reduced its protective effect." },
  { feature: "Hirsutism Score", currentValue: "8", shapCurrent: 0.05, shapPrevious: 0.04, unit: "/36", explanation: "Modified Ferriman-Gallwey score increased slightly, indicating mild excess hair growth contributing to risk." },
  { feature: "PHQ-4 Score", currentValue: "4", shapCurrent: 0.02, shapPrevious: 0.03, unit: "/12", explanation: "Psychological distress decreased this week, slightly reducing its contribution to your overall score." },
  { feature: "HbA1c", currentValue: "5.4", shapCurrent: 0.01, shapPrevious: 0.01, unit: "%", explanation: "HbA1c remains normal. This value has minimal effect on your risk score." },
  { feature: "Acne Severity", currentValue: "6", shapCurrent: 0.03, shapPrevious: 0.02, unit: "/10", explanation: "Acne severity increased from last week's evening check-ins, adding slightly more risk contribution." },
];

const SHAPExplanationDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Score Breakdown</h1>
          <p className="text-xs text-muted-foreground">SHAP feature contributions</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Legend */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5 text-[hsl(var(--destructive))]" /> Increases risk</span>
          <span className="flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5 text-accent" /> Decreases risk</span>
        </div>

        {/* Feature Cards */}
        <div className="space-y-2.5">
          {FEATURES.map((f, i) => {
            const delta = f.shapCurrent - f.shapPrevious;
            const isPositive = f.shapCurrent > 0;
            const deltaDirection = delta > 0.005 ? "up" : delta < -0.005 ? "down" : "stable";

            return (
              <motion.div
                key={f.feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive ? "bg-destructive/10" : "bg-accent/10"}`}>
                          {isPositive ? (
                            <ArrowUpRight className="w-4 h-4 text-[hsl(var(--destructive))]" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-accent" />
                          )}
                        </div>
                        <div>
                          <p className="font-display font-semibold text-sm text-foreground">{f.feature}</p>
                          <p className="text-xs text-muted-foreground">
                            {f.currentValue} {f.unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold font-display ${isPositive ? "text-[hsl(var(--destructive))]" : "text-accent"}`}>
                          {f.shapCurrent > 0 ? "+" : ""}{f.shapCurrent.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-0.5 justify-end mt-0.5">
                          {deltaDirection === "up" && <ArrowUpRight className="w-3 h-3 text-[hsl(var(--destructive))]" />}
                          {deltaDirection === "down" && <ArrowDownRight className="w-3 h-3 text-accent" />}
                          {deltaDirection === "stable" && <Minus className="w-3 h-3 text-muted-foreground" />}
                          <span className="text-xs text-muted-foreground">
                            {deltaDirection === "stable" ? "No change" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)} vs last wk`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SHAP bar */}
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${isPositive ? "bg-[hsl(var(--destructive))]" : "bg-accent"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.abs(f.shapCurrent) * 500}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{f.explanation}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-secondary/50 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            SHAP values show how each feature pushes the score up or down from a baseline. Larger bars = stronger contribution.
            Week-over-week changes highlight what shifted since your last assessment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SHAPExplanationDetail;
