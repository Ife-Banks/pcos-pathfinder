import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SCORE = 0.68;

const TRIAGE_TIERS = [
  { max: 0.25, label: "Low", icon: ShieldCheck, colorClass: "text-accent", bgClass: "bg-accent/10", desc: "No immediate concern" },
  { max: 0.5, label: "Moderate", icon: Shield, colorClass: "text-[hsl(var(--warning))]", bgClass: "bg-[hsl(var(--warning))]/10", desc: "Monitor & lifestyle changes" },
  { max: 0.75, label: "High", icon: ShieldAlert, colorClass: "text-[hsl(var(--destructive))]", bgClass: "bg-destructive/10", desc: "Consult healthcare provider" },
  { max: 1.01, label: "Critical", icon: AlertTriangle, colorClass: "text-[hsl(var(--destructive))]", bgClass: "bg-destructive/10", desc: "Urgent clinical evaluation" },
];

const getTier = (score: number) => TRIAGE_TIERS.find((t) => score <= t.max)!;

const SHAP_FEATURES = [
  { feature: "LH/FSH Ratio", value: "+0.14", positive: true, pct: 70, plain: "Elevated LH relative to FSH suggests hormonal imbalance" },
  { feature: "Fasting Insulin", value: "+0.11", positive: true, pct: 55, plain: "Higher insulin levels indicate insulin resistance" },
  { feature: "Cycle Irregularity", value: "+0.09", positive: true, pct: 45, plain: "Irregular periods are a hallmark PCOS symptom" },
  { feature: "Ovarian Volume", value: "+0.07", positive: true, pct: 35, plain: "Enlarged ovaries with multiple follicles detected" },
  { feature: "BMI", value: "−0.04", positive: false, pct: 20, plain: "Your BMI is within a healthy range, lowering risk" },
];

const PCOSRiskScore = () => {
  const navigate = useNavigate();
  const tier = getTier(SCORE);
  const TierIcon = tier.icon;

  const needleAngle = -90 + SCORE * 180;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">PCOS Risk Score</h1>
          <p className="text-xs text-muted-foreground">AI-powered assessment</p>
        </div>
        <button onClick={() => navigate("/risk-trend")} className="p-1.5 rounded-lg hover:bg-secondary">
          <TrendingUp className="w-5 h-5 text-primary" />
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Score Gauge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="relative w-56 h-32">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  {/* Background arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Colored segments */}
                  <path d="M 20 100 A 80 80 0 0 1 60 32" fill="none" stroke="hsl(var(--accent))" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 60 32 A 80 80 0 0 1 100 20" fill="none" stroke="hsl(var(--warning))" strokeWidth="14" />
                  <path d="M 100 20 A 80 80 0 0 1 140 32" fill="none" stroke="hsl(38 90% 45%)" strokeWidth="14" />
                  <path d="M 140 32 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--destructive))" strokeWidth="14" strokeLinecap="round" />
                  {/* Needle */}
                  <motion.line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="35"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: needleAngle }}
                    transition={{ type: "spring", stiffness: 40, damping: 12, delay: 0.3 }}
                    style={{ transformOrigin: "100px 100px" }}
                  />
                  <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
                </svg>
              </div>

              <motion.div
                className="text-center -mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-4xl font-display font-bold text-foreground">{SCORE.toFixed(2)}</p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <TierIcon className={`w-4 h-4 ${tier.colorClass}`} />
                  <Badge className={`${tier.bgClass} ${tier.colorClass} border-0 font-display`}>
                    {tier.label} Risk
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{tier.desc}</p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SHAP Waterfall */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Contributing Factors
            </h2>
            <button
              onClick={() => navigate("/shap-detail")}
              className="text-xs text-primary font-semibold flex items-center gap-0.5"
            >
              Details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              {SHAP_FEATURES.map((f, i) => (
                <motion.div
                  key={f.feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{f.feature}</span>
                    <span
                      className={`text-sm font-bold font-display ${
                        f.positive ? "text-[hsl(var(--destructive))]" : "text-accent"
                      }`}
                    >
                      {f.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${f.positive ? "bg-[hsl(var(--destructive))]" : "bg-accent"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${f.pct}%` }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top 5 Plain Language */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            What This Means
          </h2>
          <div className="space-y-2">
            {SHAP_FEATURES.map((f, i) => (
              <Card key={f.feature} className="border-border shadow-none">
                <CardContent className="p-3 flex gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      f.positive ? "bg-destructive/10 text-[hsl(var(--destructive))]" : "bg-accent/10 text-accent"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground font-display">{f.feature}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{f.plain}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="bg-secondary/50 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            This score is generated by a machine learning model and is for informational purposes only.
            Always consult your healthcare provider for diagnosis and treatment decisions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          <Button variant="outline-clinical" size="lg" onClick={() => navigate("/risk-trend")}>
            View Trend
          </Button>
          <Button variant="clinical" size="lg" onClick={() => navigate("/shap-detail")}>
            Full Breakdown
          </Button>
        </div>

        {/* Referral CTA for High/Critical Risk */}
        {SCORE >= 0.5 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full mb-4 border-[hsl(var(--warning))]/30 text-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/5"
              onClick={() => navigate("/referral")}
            >
              View Clinical Referral Recommendation
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PCOSRiskScore;
