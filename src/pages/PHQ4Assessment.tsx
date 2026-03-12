import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Phone, Heart, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface PHQ4Item {
  id: string;
  text: string;
  subscale: "anxiety" | "depression";
}

const phq4Items: PHQ4Item[] = [
  { id: "q1", text: "In the last week, how often have you felt nervous, anxious, or on edge?", subscale: "anxiety" },
  { id: "q2", text: "In the last week, how often have you been unable to stop or control worrying?", subscale: "anxiety" },
  { id: "q3", text: "In the last week, how often have you had little interest or pleasure in doing things?", subscale: "depression" },
  { id: "q4", text: "In the last week, how often have you felt down, depressed, or hopeless?", subscale: "depression" },
];

const responseOptions = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

const getSeverity = (score: number) => {
  if (score <= 2) return { label: "Normal", color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success-light))]" };
  if (score <= 5) return { label: "Mild", color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning-light))]" };
  if (score <= 8) return { label: "Moderate", color: "text-orange-600", bg: "bg-orange-50" };
  return { label: "Severe", color: "text-destructive", bg: "bg-destructive/10" };
};

const getSubscaleSeverity = (score: number) => {
  if (score < 3) return { label: "Normal", color: "text-[hsl(var(--success))]" };
  if (score < 5) return { label: "Elevated", color: "text-[hsl(var(--warning))]" };
  return { label: "High", color: "text-destructive" };
};

const PHQ4Assessment = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const allAnswered = phq4Items.every((item) => answers[item.id] !== undefined);

  const totalScore = useMemo(
    () => Object.values(answers).reduce((a, b) => a + b, 0),
    [answers]
  );

  const anxietyScore = useMemo(
    () => phq4Items.filter((i) => i.subscale === "anxiety").reduce((a, i) => a + (answers[i.id] ?? 0), 0),
    [answers]
  );

  const depressionScore = useMemo(
    () => phq4Items.filter((i) => i.subscale === "depression").reduce((a, i) => a + (answers[i.id] ?? 0), 0),
    [answers]
  );

  const severity = getSeverity(totalScore);
  const needsResources = totalScore >= 6;

  const handleSave = () => {
    toast({ title: "PHQ-4 Saved", description: `Total score: ${totalScore}/12 — ${severity.label}` });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-clinical px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate("/dashboard")} className="text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground font-[var(--font-display)]">Mental Wellness</h1>
        </div>
        <p className="text-primary-foreground/70 text-sm ml-8">PHQ-4 Psychological Assessment</p>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {!showResults ? (
          <>
            {/* Instructions */}
            <div className="rounded-xl bg-[hsl(var(--info-light))] border border-[hsl(var(--info))]/20 p-3 mb-6 flex gap-2">
              <Info className="w-4 h-4 text-[hsl(var(--info))] mt-0.5 shrink-0" />
              <p className="text-xs text-foreground/70">
                Over the <strong>last 2 weeks</strong>, how often have you been bothered by the following problems?
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-4 mb-6">
              {phq4Items.map((item, idx) => {
                const isAnxiety = item.subscale === "anxiety";
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    {/* Subscale label */}
                    {(idx === 0 || idx === 2) && (
                      <div className={cn(
                        "inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-3",
                        isAnxiety ? "bg-blue-50 text-[hsl(var(--clinical-blue))]" : "bg-purple-50 text-purple-600"
                      )}>
                        {isAnxiety ? "GAD-2 — Anxiety" : "PHQ-2 — Depression"}
                      </div>
                    )}

                    <p className="text-sm font-medium text-foreground mb-3">{item.text}</p>

                    <div className="grid grid-cols-2 gap-2">
                      {responseOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: opt.value }))}
                          className={cn(
                            "text-left p-2.5 rounded-lg border transition-all text-xs font-medium",
                            answers[item.id] === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          <span className="font-bold mr-1">{opt.value}</span> — {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Button
              onClick={() => setShowResults(true)}
              disabled={!allAnswered}
              className="w-full h-12 gradient-primary text-primary-foreground rounded-xl"
            >
              View Results
            </Button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Score Summary */}
            <div className="rounded-xl border border-border bg-card p-6 mb-4 text-center">
              <div className="text-5xl font-bold text-foreground font-[var(--font-display)] mb-1">{totalScore}</div>
              <div className="text-sm text-muted-foreground mb-3">out of 12</div>
              <div className={cn("inline-block px-4 py-1.5 rounded-full text-sm font-semibold", severity.bg, severity.color)}>
                {severity.label}
              </div>
            </div>

            {/* Subscale Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-xs font-semibold text-[hsl(var(--clinical-blue))] mb-2">GAD-2 Anxiety</div>
                <div className="text-2xl font-bold text-foreground font-[var(--font-display)]">{anxietyScore}</div>
                <div className="text-xs text-muted-foreground mb-1">/ 6</div>
                <span className={cn("text-xs font-semibold", getSubscaleSeverity(anxietyScore).color)}>
                  {getSubscaleSeverity(anxietyScore).label}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-xs font-semibold text-purple-600 mb-2">PHQ-2 Depression</div>
                <div className="text-2xl font-bold text-foreground font-[var(--font-display)]">{depressionScore}</div>
                <div className="text-xs text-muted-foreground mb-1">/ 6</div>
                <span className={cn("text-xs font-semibold", getSubscaleSeverity(depressionScore).color)}>
                  {getSubscaleSeverity(depressionScore).label}
                </span>
              </div>
            </div>

            {/* Score bar visualization */}
            <div className="rounded-xl border border-border bg-card p-4 mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Normal</span>
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
              <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                <div className="absolute inset-y-0 left-0 flex">
                  <div className="h-full bg-[hsl(var(--success))]" style={{ width: `${(3 / 12) * 100}%` }} />
                  <div className="h-full bg-[hsl(var(--warning))]" style={{ width: `${(3 / 12) * 100}%` }} />
                  <div className="h-full bg-orange-400" style={{ width: `${(3 / 12) * 100}%` }} />
                  <div className="h-full bg-destructive" style={{ width: `${(3 / 12) * 100}%` }} />
                </div>
                {/* Marker */}
                <motion.div
                  initial={{ left: "0%" }}
                  animate={{ left: `${(totalScore / 12) * 100}%` }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-card border-2 border-foreground shadow-md"
                />
              </div>
            </div>

            {/* Mental Health Resources — shown if score >= 6 */}
            {needsResources && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border-2 border-[hsl(var(--warning))] bg-[hsl(var(--warning-light))] p-4 mb-4"
              >
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground font-[var(--font-display)]">We're Here for You</h3>
                    <p className="text-xs text-foreground/70 mt-1">
                      Your score suggests you may be experiencing elevated psychological distress. Consider reaching out to a mental health professional.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href="tel:988"
                    className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium text-foreground">988 Suicide & Crisis Lifeline</div>
                      <div className="text-xs text-muted-foreground">Call or text 988</div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                  </a>
                  <a
                    href="https://www.crisistextline.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Crisis Text Line</div>
                      <div className="text-xs text-muted-foreground">Text HOME to 741741</div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                  </a>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowResults(false)} className="flex-1 h-12 rounded-xl">
                Edit Answers
              </Button>
              <Button onClick={handleSave} className="flex-1 h-12 gradient-primary text-primary-foreground rounded-xl">
                Save & Continue
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PHQ4Assessment;
