import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Info, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { hairPatternService, HairPatternSubmission } from "@/services/mfgService";
import { useUserGender } from "@/hooks/useUserGender";
import { markToolComplete, getTodayDateString } from "@/utils/weekUtils";

interface BodyZone {
  id: string;
  name: string;
  femaleDescription: string;
  maleDescription: string;
  icon: string;
}

const bodyZones: BodyZone[] = [
  { id: "upper_lip", name: "Upper Lip / Mustache", femaleDescription: "Above the lip, below the nose", maleDescription: "Above the lip, below the nose", icon: "👄" },
  { id: "chin", name: "Chin", femaleDescription: "Chin and jawline area", maleDescription: "Chin, jawline and cheeks (full beard area)", icon: "🫦" },
  { id: "chest", name: "Chest", femaleDescription: "Between and around the breasts", maleDescription: "Across the chest and around the nipples", icon: "🫁" },
  { id: "upper_abdomen", name: "Upper Abdomen", femaleDescription: "Above the navel", maleDescription: "Above the navel", icon: "⬆️" },
  { id: "lower_abdomen", name: "Lower Abdomen", femaleDescription: "Below the navel", maleDescription: "Below the navel", icon: "🔽" },
  { id: "upper_arm", name: "Upper Arm", femaleDescription: "Shoulders to elbows", maleDescription: "Shoulders to elbows", icon: "💪" },
  { id: "thigh", name: "Thigh", femaleDescription: "Upper inner and outer thighs", maleDescription: "Upper inner and outer thighs", icon: "🦵" },
  { id: "upper_back", name: "Upper Back", femaleDescription: "Upper back and shoulders", maleDescription: "Upper back and shoulders", icon: "🔙" },
  { id: "lower_back", name: "Lower Back", femaleDescription: "Lower back and buttocks", maleDescription: "Lower back and buttocks", icon: "🔃" },
];

const maleAddOns = [
  { id: "axillary", name: "Axillary (Armpit) Hair", description: "Classic androgen-dependent site", max: 4 },
  { id: "pubic", name: "Pubic Hair", description: "Classic androgen-dependent site", max: 4 },
] as const;

const gradeDescriptions: Record<number, string> = {
  0: "No terminal hair",
  1: "A few scattered hairs",
  2: "Mild coverage",
  3: "Moderate coverage",
  4: "Dense, full coverage",
};

// Female diagnostic cutoffs — must match backend HirsutismSeverity (0–7 / 8–16 / 17–24 / ≥25)
const getFemaleCategory = (score: number) => {
  if (score <= 7) return { label: "Normal", color: "#27AE60", bg: "bg-green-100", textColor: "text-green-700" };
  if (score <= 16) return { label: "Mild Hirsutism", color: "#F59E0B", bg: "bg-amber-100", textColor: "text-amber-700" };
  if (score <= 24) return { label: "Moderate Hirsutism", color: "#E67E22", bg: "bg-orange-100", textColor: "text-orange-700" };
  return { label: "Severe Hirsutism", color: "#E74C3C", bg: "bg-red-100", textColor: "text-red-700" };
};

const getTrendBadge = (trend: string | null | undefined, percentChange: number | null | undefined) => {
  switch (trend) {
    case "Stable":
      return { label: "Stable", color: "#27AE60", bg: "bg-green-100", textColor: "text-green-700" };
    case "Decreasing":
      return { label: "Decreasing", color: "#E67E22", bg: "bg-orange-100", textColor: "text-orange-700" };
    case "Increasing":
      return { label: "Increasing", color: "#E74C3C", bg: "bg-red-100", textColor: "text-red-700" };
    default:
      return { label: "Building baseline", color: "#6B7280", bg: "bg-gray-100", textColor: "text-gray-600" };
  }
};

const TEAL_PRIMARY = '#00897B';

const HirsutismScoring = () => {
  const navigate = useNavigate();
  const { isMale } = useUserGender();
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries([...bodyZones.map((z) => z.id), ...maleAddOns.map((z) => z.id)].map((id) => [id, 0]))
  );
  const [scalpNorwood, setScalpNorwood] = useState<number | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trendLabel, setTrendLabel] = useState<string | null>(null);
  const [percentChange, setPercentChange] = useState<number | null>(null);

  useEffect(() => {
    const loadLatest = async () => {
      setLoading(true);
      try {
        const res = await hairPatternService.getLatest();
        const data = res.data;
        if (data && data.total_score !== undefined) {
          setScores({
            upper_lip: data.hair_upper_lip ?? 0,
            chin: data.hair_chin ?? 0,
            chest: data.hair_chest ?? 0,
            upper_back: data.hair_upper_back ?? 0,
            lower_back: data.hair_lower_back ?? 0,
            upper_abdomen: data.hair_upper_abdomen ?? 0,
            lower_abdomen: data.hair_lower_abdomen ?? 0,
            upper_arm: data.hair_upper_arm ?? 0,
            thigh: data.hair_thigh ?? 0,
            axillary: data.hair_axillary ?? 0,
            pubic: data.hair_pubic ?? 0,
          });
          setScalpNorwood(data.scalp_hamilton_norwood ?? null);
          setTrendLabel(data.trend_label ?? null);
          setPercentChange(data.percent_change_from_baseline ?? null);
        }
      } catch (err) {
        // No previous assessment exists yet
      } finally {
        setLoading(false);
      }
    };
    loadLatest();
  }, []);

  const coreScore = useMemo(
    () => bodyZones.reduce((sum, z) => sum + (scores[z.id] ?? 0), 0),
    [scores]
  );
  // Optional add-ons are excluded from the headline 0–36 total but sent to the API
  const displayTotal = coreScore;

  const femaleCategory = getFemaleCategory(displayTotal);
  const trendBadge = getTrendBadge(trendLabel, percentChange);

  const setGrade = (zoneId: string, grade: number) => {
    setScores((prev) => ({ ...prev, [zoneId]: grade }));
  };

  const buildPayload = (): HairPatternSubmission => {
    return {
      assessed_date: getTodayDateString(),
      hair_upper_lip: scores.upper_lip ?? 0,
      hair_chin: scores.chin ?? 0,
      hair_chest: scores.chest ?? 0,
      hair_upper_back: scores.upper_back ?? 0,
      hair_lower_back: scores.lower_back ?? 0,
      hair_upper_abdomen: scores.upper_abdomen ?? 0,
      hair_lower_abdomen: scores.lower_abdomen ?? 0,
      hair_upper_arm: scores.upper_arm ?? 0,
      hair_thigh: scores.thigh ?? 0,
      hair_axillary: scores.axillary ?? null,
      hair_pubic: scores.pubic ?? null,
      scalp_hamilton_norwood: scalpNorwood,
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await hairPatternService.submit(buildPayload());
      const saved = res.data;
      if (saved?.trend_label) setTrendLabel(saved.trend_label);
      if (saved?.percent_change_from_baseline !== undefined) setPercentChange(saved.percent_change_from_baseline);
      markToolComplete('mfg');
      toast({
        title: isMale ? "Androgenic Hair Pattern Saved" : "Hirsutism Score Saved",
        description: isMale
          ? `Total score: ${displayTotal}/36 — ${trendBadge.label}`
          : `Total score: ${displayTotal}/36 — ${femaleCategory.label}`,
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

  const badge = isMale ? trendBadge : femaleCategory;

  const renderZoneCard = (zone: { id: string; name: string; description: string; icon: string }, idx: number) => {
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
  };

  const norwoodOptions = [
    { value: 1, label: "I — minimal" },
    { value: 2, label: "II — small" },
    { value: 3, label: "III — crown" },
    { value: 4, label: "III-V — bridge" },
    { value: 5, label: "IV-V — large" },
    { value: 6, label: "VI — extensive" },
    { value: 7, label: "VII — most severe" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate("/weekly-tools")} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">
            {isMale ? "Androgenic Hair Pattern" : "Hirsutism Score"}
          </h1>
        </div>
        <p className="text-white/70 text-sm ml-8">
          {isMale ? "mFG-style assessment — weekly trend tracking" : "Modified Ferriman-Gallwey (mFG) Assessment"}
        </p>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        <motion.div
          layout
          className="rounded-xl border border-gray-200 bg-white p-4 mb-6 flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Running Total</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-gray-900 font-[var(--font-display)]">{displayTotal}</span>
              <span className="text-sm text-gray-500">/ 36</span>
            </div>
            {isMale && percentChange !== null && percentChange !== undefined && (
              <div className="text-xs text-gray-500 mt-1">
                {percentChange > 0 ? "+" : ""}{percentChange.toFixed(1)}% vs baseline
              </div>
            )}
          </div>
          <div className={cn("px-3 py-1.5 rounded-full text-xs font-semibold", badge.bg, badge.textColor)}>
            {badge.label}
          </div>
        </motion.div>

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 mb-6 flex gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800">
            {isMale
              ? "Rate hair growth in each body zone from 0 (none) to 4 (dense) to track your personal androgen-related hair pattern over time. Your baseline is built over the first few weeks — a sustained drop can accompany low testosterone, so share it with your clinician."
              : "Rate hair growth in each body zone from 0 (none) to 4 (dense). A total of 8 or more suggests clinically significant hirsutism. All 9 zones are assessed."}
          </p>
        </div>

        {!showResult ? (
          <>
            <div className="space-y-3 mb-6">
              {bodyZones.map((zone, idx) =>
                renderZoneCard(
                  { id: zone.id, name: zone.name, description: isMale ? zone.maleDescription : zone.femaleDescription, icon: zone.icon },
                  idx
                )
              )}

              {isMale && (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Optional add-ons</p>
                  {maleAddOns.map((zone) => renderZoneCard({ id: zone.id, name: zone.name, description: zone.description, icon: "🧴" }, bodyZones.length))}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="text-sm font-semibold text-gray-900">Scalp — Hamilton-Norwood</div>
                    <div className="text-xs text-gray-500 mb-3">Male pattern hair loss stage (optional)</div>
                    <div className="grid grid-cols-2 gap-2">
                      {norwoodOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setScalpNorwood(scalpNorwood === opt.value ? null : opt.value)}
                          className={cn(
                            "px-2 py-2 rounded-lg text-xs font-medium transition-all text-left",
                            scalpNorwood === opt.value
                              ? "text-white"
                              : "border border-gray-200 text-gray-600 bg-white hover:border-teal-300"
                          )}
                          style={scalpNorwood === opt.value ? { backgroundColor: TEAL_PRIMARY } : {}}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
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
              <div className="text-5xl font-bold text-gray-900 font-[var(--font-display)] mb-1">{displayTotal}</div>
              <div className="text-sm text-gray-500 mb-3">out of 36</div>
              <div className={cn("inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4", badge.bg, badge.textColor)}>
                {badge.label}
              </div>

              {isMale && percentChange !== null && percentChange !== undefined && (
                <p className="text-xs text-gray-500 mb-2">
                  {percentChange > 0 ? "+" : ""}{percentChange.toFixed(1)}% from your baseline
                  {trendLabel === "Decreasing" && " — a sustained drop can accompany low testosterone"}
                </p>
              )}

              <div className="space-y-2 mt-4 text-left">
                {bodyZones.map((zone) => (
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

            {!isMale && displayTotal >= 8 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
                <p className="text-sm text-amber-800">
                  Your score suggests clinically significant hirsutism. Consider discussing treatment options with your healthcare provider.
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
