import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Heart, Check, ScanFace, Brain, BedDouble } from "lucide-react";
import VASSlider from "@/components/VASSlider";
import { cn } from "@/lib/utils";

const affectEmojis = [
  ["😰", "😟", "🤩"], // High arousal: anxious, worried, excited
  ["😔", "😐", "😊"], // Mid arousal: sad, neutral, content
  ["😴", "😌", "🥰"], // Low arousal: sleepy, calm, loving
];

const arousalLabels = ["High Arousal", "Mid", "Low Arousal"];
const valenceLabels = ["Negative", "Neutral", "Positive"];

const MorningCheckIn = () => {
  const navigate = useNavigate();
  const [fatigue, setFatigue] = useState(0);
  const [pelvicPressure, setPelvicPressure] = useState(0);
  const [sleepSatisfaction, setSleepSatisfaction] = useState<number | null>(null);
  const [cognitiveLoad, setCognitiveLoad] = useState<number | null>(null);
  const [affectArousal, setAffectArousal] = useState<number | null>(null);
  const [affectValence, setAffectValence] = useState<number | null>(null);
  const [step, setStep] = useState<"vas" | "extras" | "rppg" | "done">("vas");
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);

  const startCapture = () => {
    setCapturing(true);
    setTimeout(() => {
      setCapturing(false);
      setCaptured(true);
    }, 3000);
  };

  const handleSubmit = () => {
    if (step === "vas") {
      setStep("extras");
    } else if (step === "extras") {
      setStep("rppg");
    } else if (step === "rppg") {
      setStep("done");
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
            Morning Check-In
          </div>
        </motion.div>

        {step === "done" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="h-20 w-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center"
              >
                <Check className="h-10 w-10 text-primary-foreground" />
              </motion.div>
              <h2 className="text-xl font-bold font-display text-foreground mb-2">Check-in complete!</h2>
              <p className="text-sm text-muted-foreground">Your data has been recorded.</p>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                  {step === "vas" ? (
                    <Sun className="h-5 w-5 text-primary-foreground" />
                  ) : step === "extras" ? (
                    <Brain className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <Heart className="h-5 w-5 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold font-display text-foreground">
                    {step === "vas" ? "How are you feeling?" : step === "extras" ? "Sleep, Mood & Focus" : "HRV Capture"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {step === "vas"
                      ? "Rate your symptoms this morning"
                      : step === "extras"
                      ? "Additional morning assessments"
                      : "2-minute rPPG session"
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {step === "vas" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-8 flex-1"
              >
                <VASSlider
                  label="Physical Fatigue"
                  description="Rate your energy levels this morning."
                  value={fatigue}
                  onChange={setFatigue}
                  lowLabel="Very Energetic"
                  highLabel="Extremely Exhausted"
                />

                <VASSlider
                  label="Pelvic Pressure"
                  description="Rate any feeling of fullness or heaviness in your lower abdomen."
                  value={pelvicPressure}
                  onChange={setPelvicPressure}
                  lowLabel="None"
                  highLabel="Severe Pressure"
                />

                <div className="pt-4">
                  <Button variant="clinical" size="xl" className="w-full" onClick={handleSubmit}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            ) : step === "extras" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-6 flex-1"
              >
                {/* Sleep Satisfaction */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BedDouble className="h-4 w-4 text-primary" />
                    <p className="font-display font-semibold text-foreground text-sm">Sleep Satisfaction</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Post-sleep quality rating to cross-validate passive sleep tracking.</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setSleepSatisfaction(v)}
                        className={cn(
                          "p-3 rounded-lg border text-center font-bold font-display transition-all",
                          sleepSatisfaction === v
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">Very Poor</span>
                    <span className="text-[10px] text-muted-foreground">Excellent</span>
                  </div>
                </div>

                {/* Cognitive Load */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-primary" />
                    <p className="font-display font-semibold text-foreground text-sm">Cognitive Load</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Subjective attention and memory self-rating. Relevant to PMDD and cognitive fog.</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setCognitiveLoad(v)}
                        className={cn(
                          "p-3 rounded-lg border text-center font-bold font-display transition-all",
                          cognitiveLoad === v
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">Very Clear</span>
                    <span className="text-[10px] text-muted-foreground">Very Foggy</span>
                  </div>
                </div>

                {/* Daily Affect Grid — 3×3 Arousal × Valence */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="font-display font-semibold text-foreground text-sm mb-1">Daily Affect Grid</p>
                  <p className="text-xs text-muted-foreground mb-3">2D Arousal × Valence self-report for real-time affect capture.</p>

                  {/* Column headers */}
                  <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1 mb-1">
                    <div />
                    {valenceLabels.map((l) => (
                      <span key={l} className="text-[10px] text-muted-foreground text-center">{l}</span>
                    ))}
                  </div>

                  {/* Grid rows */}
                  {affectEmojis.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1 mb-1">
                      <span className="text-[10px] text-muted-foreground flex items-center pr-1 w-16 text-right">{arousalLabels[ri]}</span>
                      {row.map((emoji, ci) => (
                        <button
                          key={ci}
                          onClick={() => { setAffectArousal(ri); setAffectValence(ci); }}
                          className={cn(
                            "aspect-square rounded-lg border flex items-center justify-center text-xl transition-all",
                            affectArousal === ri && affectValence === ci
                              ? "border-primary bg-primary/10 scale-110 shadow-sm"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button variant="clinical" size="xl" className="w-full" onClick={handleSubmit}>
                    Continue to HRV Capture
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col"
              >
                <div className="aspect-[3/4] max-h-72 rounded-2xl bg-foreground/5 border-2 border-dashed border-border flex items-center justify-center mx-auto w-full max-w-xs overflow-hidden mb-6">
                  {capturing ? (
                    <motion.div
                      className="text-center"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="h-16 w-16 rounded-full border-4 border-primary mx-auto mb-3 flex items-center justify-center">
                        <Heart className="h-8 w-8 text-primary animate-pulse" />
                      </div>
                      <p className="text-sm font-display font-semibold text-foreground">Capturing HRV...</p>
                      <p className="text-xs text-muted-foreground">Hold still, breathe normally</p>
                    </motion.div>
                  ) : captured ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                      <div className="h-16 w-16 rounded-full gradient-primary mx-auto mb-3 flex items-center justify-center">
                        <Check className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <p className="text-sm font-display font-semibold text-foreground">Session complete!</p>
                      <p className="text-xs text-muted-foreground">HRV: 42ms</p>
                    </motion.div>
                  ) : (
                    <div className="text-center">
                      <ScanFace className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Camera preview</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
                  Position your face in the frame. Stay still for 2 minutes while we measure
                  your heart rate variability using remote photoplethysmography.
                </p>

                {!captured && !capturing && (
                  <Button variant="clinical" size="xl" className="w-full mb-3" onClick={startCapture}>
                    Start HRV Capture
                  </Button>
                )}
                {captured && (
                  <Button variant="clinical" size="xl" className="w-full" onClick={handleSubmit}>
                    Complete Check-In
                  </Button>
                )}
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleSubmit}>
                  Skip for now
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MorningCheckIn;
