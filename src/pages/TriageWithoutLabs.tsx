import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, ShieldAlert, Info, FlaskConical, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AVAILABLE_FEATURES = [
  { feature: "Cycle Irregularity", value: "Score 3", shap: "+0.09" },
  { feature: "Hirsutism Score", value: "8/36", shap: "+0.05" },
  { feature: "Acne Severity", value: "6/10", shap: "+0.03" },
  { feature: "PHQ-4 Score", value: "4/12", shap: "+0.02" },
  { feature: "BMI", value: "23.1 kg/m²", shap: "−0.04" },
];

const MISSING_FEATURES = [
  "LH/FSH Ratio",
  "Fasting Insulin",
  "Testosterone",
  "AMH",
  "Ovarian Volume (Ultrasound)",
  "HbA1c",
  "DHEAS",
  "TSH",
];

const PRELIMINARY_SCORE = 0.41;

const TriageWithoutLabs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Preliminary Score</h1>
          <p className="text-xs text-muted-foreground">Without clinical data</p>
        </div>
        <Badge className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-0">Limited</Badge>
      </header>

      <div className="p-4 space-y-4">
        {/* Disclaimer Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-[hsl(var(--warning))]/5 border-[hsl(var(--warning))]/30">
            <CardContent className="p-4 flex gap-3">
              <AlertTriangle className="w-6 h-6 text-[hsl(var(--warning))] shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-bold text-foreground text-sm">
                  Limited Accuracy Warning
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  This preliminary score is based only on symptom data and self-reported measures.
                  Without lab results and imaging, accuracy is significantly reduced.
                  <strong className="text-foreground"> This is not a diagnostic assessment.</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preliminary Score */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-5 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-[hsl(var(--warning))] flex items-center justify-center mb-3">
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-foreground">{PRELIMINARY_SCORE.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Preliminary</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[hsl(var(--warning))]" />
                <Badge className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-0 font-display">
                  Moderate Risk (est.)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Confidence: Low — based on {AVAILABLE_FEATURES.length}/{AVAILABLE_FEATURES.length + MISSING_FEATURES.length} features
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Features */}
        <div>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Data Used ({AVAILABLE_FEATURES.length} features)
          </h2>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {AVAILABLE_FEATURES.map((f) => (
                <div key={f.feature} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{f.feature}</p>
                    <p className="text-xs text-muted-foreground">{f.value}</p>
                  </div>
                  <span className="text-xs font-bold font-display text-muted-foreground">{f.shap}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Missing Features */}
        <div>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Missing Data ({MISSING_FEATURES.length} features)
          </h2>
          <Card className="border-destructive/20">
            <CardContent className="p-0 divide-y divide-border">
              {MISSING_FEATURES.map((f) => (
                <div key={f} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive/40 shrink-0" />
                  <p className="text-sm text-muted-foreground flex-1">{f}</p>
                  <Badge variant="outline" className="text-[10px] border-destructive/30 text-[hsl(var(--destructive))]">
                    Missing
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* CTA to upload labs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                <p className="font-display font-bold">Improve Your Score Accuracy</p>
              </div>
              <p className="text-sm text-primary-foreground/80">
                Upload lab results to unlock the full AI model with all clinical features included.
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => navigate("/lab-results")}
              >
                <span className="flex items-center gap-2">
                  Upload Lab Results <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="bg-secondary/50 rounded-xl p-4 flex gap-3 mb-4">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            The full model uses 13+ biomarkers and imaging data for high-accuracy risk scoring. This
            preliminary assessment uses only self-reported symptoms and should not replace professional
            medical evaluation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TriageWithoutLabs;
