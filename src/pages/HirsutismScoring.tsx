import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BodyZone {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji for illustration
}

const bodyZones: BodyZone[] = [
  { id: "upper_lip", name: "Upper Lip", description: "Above the lip, below the nose", icon: "👄" },
  { id: "chin", name: "Chin", description: "Chin and jawline area", icon: "🫦" },
  { id: "chest", name: "Chest", description: "Between and around the breasts", icon: "🫁" },
  { id: "upper_abdomen", name: "Upper Abdomen", description: "Above the navel", icon: "⬆️" },
  { id: "lower_abdomen", name: "Lower Abdomen", description: "Below the navel", icon: "🔽" },
  { id: "upper_arm", name: "Upper Arm", description: "Shoulders to elbows", icon: "💪" },
  { id: "thigh", name: "Thigh", description: "Upper inner and outer thighs", icon: "🦵" },
  { id: "upper_back", name: "Upper Back", description: "Upper back and shoulders", icon: "🔙" },
];

const gradeDescriptions: Record<number, string> = {
  0: "No terminal hair",
  1: "Minimal — few scattered hairs",
  2: "More than minimal but less than full coverage",
  3: "Full coverage, light",
  4: "Full coverage, dense/dark",
};

const getScoreCategory = (score: number) => {
  if (score <= 4) return { label: "Normal", color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success-light))]" };
  if (score <= 8) return { label: "Mild Hirsutism", color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning-light))]" };
  if (score <= 15) return { label: "Moderate Hirsutism", color: "text-orange-600", bg: "bg-orange-50" };
  return { label: "Severe Hirsutism", color: "text-destructive", bg: "bg-destructive/10" };
};

const HirsutismScoring = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(bodyZones.map((z) => [z.id, 0]))
  );
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const totalScore = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
  const category = getScoreCategory(totalScore);

  const setGrade = (zoneId: string, grade: number) => {
    setScores((prev) => ({ ...prev, [zoneId]: grade }));
  };

  const handleSave = () => {
    toast({ title: "mFG Score Saved", description: `Total score: ${totalScore}/36 — ${category.label}` });
    navigate("/weekly-tools");
  };

  const handleSaveAndContinue = () => {
    toast({ title: "mFG Score Saved", description: `Total score: ${totalScore}/36 — ${category.label}` });
    navigate("/phq4");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-clinical px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate("/weekly-tools")} className="text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground font-[var(--font-display)]">Hirsutism Score</h1>
        </div>
        <p className="text-primary-foreground/70 text-sm ml-8">Modified Ferriman-Gallwey (mFG) Assessment</p>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {/* Running Total */}
        <motion.div
          layout
          className="rounded-xl border border-border bg-card p-4 mb-6 flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Running Total</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-foreground font-[var(--font-display)]">{totalScore}</span>
              <span className="text-sm text-muted-foreground">/ 36</span>
            </div>
          </div>
          <div className={cn("px-3 py-1.5 rounded-full text-xs font-semibold", category.bg, category.color)}>
            {category.label}
          </div>
        </motion.div>

        {/* Info callout */}
        <div className="rounded-xl bg-[hsl(var(--info-light))] border border-[hsl(var(--info))]/20 p-3 mb-6 flex gap-2">
          <Info className="w-4 h-4 text-[hsl(var(--info))] mt-0.5 shrink-0" />
          <p className="text-xs text-foreground/70">
            Please review the reference images below and rate the hair growth pattern in each body zone. Grades 1–4 for each area. Score ≥4–6 (threshold varies by ethnicity) is considered clinically significant for hyperandrogenism.
          </p>
        </div>

        {!showResult ? (
          <>
            {/* Body Zone Cards */}
            <div className="space-y-3 mb-6">
              {bodyZones.map((zone, idx) => {
                const isActive = activeZone === zone.id;
                const score = scores[zone.id];

                return (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <button
                      onClick={() => setActiveZone(isActive ? null : zone.id)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                        {zone.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">{zone.name}</div>
                        <div className="text-xs text-muted-foreground">{zone.description}</div>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        score > 0 ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {score}
                      </div>
                      <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", isActive && "rotate-90")} />
                    </button>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 border-t border-border">
                            <div className="grid grid-cols-5 gap-2 mt-2">
                              {[0, 1, 2, 3, 4].map((grade) => (
                                <button
                                  key={grade}
                                  onClick={() => setGrade(zone.id, grade)}
                                  className={cn(
                                    "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                                    score === grade
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border text-muted-foreground hover:border-primary/30"
                                  )}
                                >
                                  <span className="text-lg font-bold">{grade}</span>
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              {gradeDescriptions[score]}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <Button onClick={() => setShowResult(true)} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl">
              View Results
            </Button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Results Summary */}
            <div className="rounded-xl border border-border bg-card p-6 mb-6 text-center">
              <div className="text-5xl font-bold text-foreground font-[var(--font-display)] mb-1">{totalScore}</div>
              <div className="text-sm text-muted-foreground mb-3">out of 36</div>
              <div className={cn("inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4", category.bg, category.color)}>
                {category.label}
              </div>

              {/* Zone breakdown */}
              <div className="space-y-2 mt-4 text-left">
                {bodyZones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{zone.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full gradient-primary"
                          style={{ width: `${(scores[zone.id] / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground w-4 text-right">{scores[zone.id]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleSaveAndContinue} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl">
                Save & Continue to PHQ-4
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowResult(false)} className="flex-1 h-12 rounded-xl">
                  Edit Scores
                </Button>
                <Button variant="outline" onClick={handleSave} className="flex-1 h-12 rounded-xl">
                  Save & Exit
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HirsutismScoring;
