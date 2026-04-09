import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Info, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { mfgService, MFGSubmission } from "@/services/mfgService";
import { markToolComplete, getTodayDateString } from "@/utils/weekUtils";

interface BodyZone {
  id: string;
  name: string;
  description: string;
  icon: string;
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
  { id: "lower_back", name: "Lower Back", description: "Lower back and buttocks", icon: "🔃" },
];

const gradeDescriptions: Record<number, string> = {
  0: "No terminal hair",
  1: "Minimal — few scattered hairs",
  2: "More than minimal but less than full coverage",
  3: "Full coverage, light",
  4: "Full coverage, dense/dark",
};

const getScoreCategory = (score: number) => {
  if (score <= 3) return { label: "Normal", color: "#27AE60", bg: "bg-green-100", textColor: "text-green-700" };
  if (score <= 7) return { label: "Mild Hirsutism", color: "#F59E0B", bg: "bg-amber-100", textColor: "text-amber-700" };
  if (score <= 15) return { label: "Moderate Hirsutism", color: "#E67E22", bg: "bg-orange-100", textColor: "text-orange-700" };
  return { label: "Severe Hirsutism", color: "#E74C3C", bg: "bg-red-100", textColor: "text-red-700" };
};

const TEAL_PRIMARY = '#00897B';

const HirsutismScoring = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(bodyZones.map((z) => [z.id, 0]))
  );
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLatest = async () => {
      setLoading(true);
      try {
        const res = await mfgService.getLatest();
        const data = res.data;
        if (data && data.total_score !== undefined) {
          setScores({
            upper_lip: data.mfg_upper_lip ?? 0,
            chin: data.mfg_chin ?? 0,
            chest: data.mfg_chest ?? 0,
            upper_back: data.mfg_upper_back ?? 0,
            lower_back: data.mfg_lower_back ?? 0,
            upper_abdomen: data.mfg_upper_abdomen ?? 0,
            lower_abdomen: data.mfg_lower_abdomen ?? 0,
            upper_arm: data.mfg_upper_arm ?? 0,
            thigh: data.mfg_thigh ?? 0,
          });
        }
      } catch (err) {
        // No previous assessment exists yet
      } finally {
        setLoading(false);
      }
    };
    loadLatest();
  }, []);

  const totalScore = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
  const category = getScoreCategory(totalScore);

  const setGrade = (zoneId: string, grade: number) => {
    setScores((prev) => ({ ...prev, [zoneId]: grade }));
  };

  const buildPayload = (): MFGSubmission => {
    return {
      assessed_date: getTodayDateString(),
      mfg_upper_lip: scores.upper_lip ?? 0,
      mfg_chin: scores.chin ?? 0,
      mfg_chest: scores.chest ?? 0,
      mfg_upper_back: scores.upper_back ?? 0,
      mfg_lower_back: scores.lower_back ?? 0,
      mfg_upper_abdomen: scores.upper_abdomen ?? 0,
      mfg_lower_abdomen: scores.lower_abdomen ?? 0,
      mfg_upper_arm: scores.upper_arm ?? 0,
      mfg_thigh: scores.thigh ?? 0,
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await mfgService.submit(buildPayload());
      markToolComplete('mfg');
      toast({
        title: "Hirsutism Score Saved",
        description: `Total score: ${totalScore}/36 — ${category.label}`,
      });
      navigate("/weekly-tools");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDone = () => {
    markToolComplete('mfg');
    navigate("/weekly-tools");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate("/weekly-tools")} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Hirsutism Score</h1>
        </div>
        <p className="text-white/70 text-sm ml-8">Modified Ferriman-Gallwey (mFG) Assessment</p>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        <motion.div
          layout
          className="rounded-xl border border-gray-200 bg-white p-4 mb-6 flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Running Total</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-gray-900 font-[var(--font-display)]">{totalScore}</span>
              <span className="text-sm text-gray-500">/ 36</span>
            </div>
          </div>
          <div className={cn("px-3 py-1.5 rounded-full text-xs font-semibold", category.bg, category.textColor)}>
            {category.label}
          </div>
        </motion.div>

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 mb-6 flex gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800">
            Rate hair growth in each body zone from 0 (none) to 4 (dense). Score ≥4–6 indicates clinically significant hirsutism. All 9 zones are assessed.
          </p>
        </div>

        {!showResult ? (
          <>
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
                    className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                  >
                    <button
                      onClick={() => setActiveZone(isActive ? null : zone.id)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                        {zone.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{zone.name}</div>
                        <div className="text-xs text-gray-500">{zone.description}</div>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        score > 0 ? "text-white" : "bg-gray-200 text-gray-500"
                      )}
                      style={score > 0 ? { backgroundColor: TEAL_PRIMARY } : {}}
                      >
                        {score}
                      </div>
                      <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", isActive && "rotate-90")} />
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
                          <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                            <div className="grid grid-cols-5 gap-2 mt-2">
                              {[0, 1, 2, 3, 4].map((grade) => (
                                <button
                                  key={grade}
                                  onClick={() => setGrade(zone.id, grade)}
                                  className={cn(
                                    "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                                    score === grade
                                      ? "border-transparent text-white"
                                      : "border-gray-200 text-gray-600 bg-white hover:border-teal-300"
                                  )}
                                  style={score === grade ? { backgroundColor: TEAL_PRIMARY } : {}}
                                >
                                  <span className="text-lg font-bold">{grade}</span>
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
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

            <Button
              onClick={() => setShowResult(true)}
              className="w-full h-12 rounded-xl text-white font-semibold"
              style={{ backgroundColor: TEAL_PRIMARY }}
            >
              View Results
            </Button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6 text-center">
              <div className="text-5xl font-bold text-gray-900 font-[var(--font-display)] mb-1">{totalScore}</div>
              <div className="text-sm text-gray-500 mb-3">out of 36</div>
              <div className={cn("inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4", category.bg, category.textColor)}>
                {category.label}
              </div>

              <div className="space-y-2 mt-4 text-left">
                {bodyZones.slice(0, 8).map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{zone.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(scores[zone.id] / 4) * 100}%`, backgroundColor: TEAL_PRIMARY }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-900 w-4 text-right">{scores[zone.id]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalScore >= 4 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
                <p className="text-sm text-amber-800">
                  Your score indicates clinically significant hirsutism. Consider discussing treatment options with your healthcare provider.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 rounded-xl text-white font-semibold"
                style={{ backgroundColor: TEAL_PRIMARY }}
              >
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save & Exit"}
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResult(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Edit Scores
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDone}
                  className="flex-1 h-12 rounded-xl"
                >
                  Done Without Saving
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
