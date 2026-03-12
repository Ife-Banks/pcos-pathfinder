import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, User, Ruler, ScanFace, CalendarHeart, Watch, Heart, Sparkles } from "lucide-react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  data: Record<string, any>;
  setData: (d: Record<string, any>) => void;
}

const PersonalInfoStep = ({ onNext, data, setData }: StepProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Full Name</Label>
      <Input placeholder="Your name" value={data.name || ""} onChange={(e) => setData({ ...data, name: e.target.value })} />
    </div>
    <div className="space-y-2">
      <Label>Age</Label>
      <p className="text-xs text-muted-foreground">Enter age in years</p>
      <Input type="number" placeholder="e.g. 28" min={13} max={65} value={data.age || ""} onChange={(e) => setData({ ...data, age: e.target.value })} />
    </div>
    <div className="space-y-2">
      <Label>Ethnicity</Label>
      <Select value={data.ethnicity || ""} onValueChange={(v) => setData({ ...data, ethnicity: v })}>
        <SelectTrigger><SelectValue placeholder="Select ethnicity" /></SelectTrigger>
        <SelectContent>
          {["White/Caucasian", "Black/African American", "Hispanic/Latino", "Asian", "South Asian", "Middle Eastern", "Mixed/Other", "Prefer not to say"].map((e) => (
            <SelectItem key={e} value={e}>{e}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <Button variant="clinical" size="xl" className="w-full mt-6" onClick={onNext}>Continue</Button>
  </div>
);

const PhysicalStep = ({ onNext, onBack, data, setData }: StepProps) => {
  const unitSystem = data.unitSystem || "metric";
  const isMetric = unitSystem === "metric";

  const bmi = useMemo(() => {
    if (isMetric) {
      const h = parseFloat(data.height);
      const w = parseFloat(data.weight);
      if (h > 0 && w > 0) return (w / ((h / 100) ** 2)).toFixed(1);
    } else {
      const ft = parseFloat(data.heightFt) || 0;
      const inches = parseFloat(data.heightIn) || 0;
      const lbs = parseFloat(data.weightLbs);
      const totalInches = ft * 12 + inches;
      if (totalInches > 0 && lbs > 0) {
        const kg = lbs * 0.453592;
        const m = totalInches * 0.0254;
        return (kg / (m ** 2)).toFixed(1);
      }
    }
    return null;
  }, [data.height, data.weight, data.heightFt, data.heightIn, data.weightLbs, isMetric]);

  return (
    <div className="space-y-4">
      {/* Unit Toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        {[
          { value: "metric", label: "cm / kg" },
          { value: "imperial", label: "ft-in / lbs" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setData({ ...data, unitSystem: opt.value })}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
              unitSystem === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isMetric ? (
        <>
          <div className="space-y-2">
            <Label>Height (cm)</Label>
            <Input type="number" placeholder="e.g. 165" value={data.height || ""} onChange={(e) => setData({ ...data, height: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Weight (kg)</Label>
            <Input type="number" placeholder="e.g. 65" value={data.weight || ""} onChange={(e) => setData({ ...data, weight: e.target.value })} />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Height</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="ft" value={data.heightFt || ""} onChange={(e) => setData({ ...data, heightFt: e.target.value })} className="flex-1" />
              <Input type="number" placeholder="in" value={data.heightIn || ""} onChange={(e) => setData({ ...data, heightIn: e.target.value })} className="flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Weight (lbs)</Label>
            <Input type="number" placeholder="e.g. 143" value={data.weightLbs || ""} onChange={(e) => setData({ ...data, weightLbs: e.target.value })} />
          </div>
        </>
      )}

      {bmi && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-secondary border border-border">
          <p className="text-sm text-muted-foreground">Computed BMI</p>
          <p className="text-xs text-muted-foreground mb-1">BMI = weight(kg) / height(m)²</p>
          <p className="text-2xl font-bold font-display text-foreground">{bmi}</p>
        </motion.div>
      )}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button variant="clinical" size="lg" onClick={onNext} className="flex-1">Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
      </div>
    </div>
  );
};

const SkinStep = ({ onNext, onBack, data, setData }: StepProps) => (
  <div className="space-y-4">
    <p className="text-sm font-medium text-foreground leading-relaxed">
      Do you have dark, velvety patches of skin — for example, on your neck, underarms, or groin?
    </p>
    <p className="text-xs text-muted-foreground leading-relaxed">
      This binary flag captures Acanthosis Nigricans, a dermatological marker of peripheral insulin resistance, critical for metabolic PCOS phenotype classification.
    </p>
    <div className="grid grid-cols-2 gap-3">
      {["Yes", "No"].map((opt) => (
        <button
          key={opt}
          onClick={() => setData({ ...data, acanthosis: opt })}
          className={`p-6 rounded-xl border-2 text-center font-display font-semibold transition-all ${
            data.acanthosis === opt
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-card text-foreground hover:border-primary/30"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
    <div className="flex gap-3 mt-6">
      <Button variant="outline" size="lg" onClick={onBack} className="flex-1"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
      <Button variant="clinical" size="lg" onClick={onNext} className="flex-1">Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
    </div>
  </div>
);

const MenstrualStep = ({ onNext, onBack, data, setData }: StepProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Are your periods generally regular?</Label>
      <div className="grid grid-cols-2 gap-3">
        {["Regular", "Irregular"].map((opt) => (
          <button
            key={opt}
            onClick={() => setData({ ...data, regularity: opt })}
            className={`p-4 rounded-xl border-2 text-center font-display font-semibold transition-all ${
              data.regularity === opt
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/30"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <Label>How many days usually pass from the start of one period to the start of the next?</Label>
      <Input type="number" placeholder="e.g. 28 days, 40 days" min={15} max={90} value={data.cycleLength || ""} onChange={(e) => setData({ ...data, cycleLength: e.target.value })} />
    </div>
    <div className="space-y-2">
      <Label>In the last 12 months, how many periods have you had?</Label>
      <p className="text-xs text-muted-foreground">Values below 8 may flag potential amenorrhea or oligomenorrhea.</p>
      <Input type="number" placeholder="0–15" min={0} max={15} value={data.periodsPerYear || ""} onChange={(e) => setData({ ...data, periodsPerYear: e.target.value })} />
    </div>
    <div className="flex gap-3 mt-6">
      <Button variant="outline" size="lg" onClick={onBack} className="flex-1"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
      <Button variant="clinical" size="lg" onClick={onNext} className="flex-1">Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
    </div>
  </div>
);

const wearables = [
  { name: "Apple Watch", icon: "⌚" },
  { name: "Fitbit", icon: "📟" },
  { name: "Garmin", icon: "🏃" },
  { name: "Oura Ring", icon: "💍" },
];

const WearableStep = ({ onNext, onBack, data, setData }: StepProps) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Connect a wearable device for automatic HRV and activity data, or skip this step.</p>
    <div className="space-y-3">
      {wearables.map((w) => (
        <button
          key={w.name}
          onClick={() => setData({ ...data, wearable: data.wearable === w.name ? "" : w.name })}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
            data.wearable === w.name
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/30"
          }`}
        >
          <span className="text-2xl">{w.icon}</span>
          <span className="font-display font-semibold text-foreground">{w.name}</span>
          {data.wearable === w.name && <Check className="h-5 w-5 text-primary ml-auto" />}
        </button>
      ))}
    </div>
    <div className="flex gap-3 mt-6">
      <Button variant="outline" size="lg" onClick={onBack} className="flex-1"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
      <Button variant="clinical" size="lg" onClick={onNext} className="flex-1">
        {data.wearable ? "Connect & Continue" : "Skip"}
      </Button>
    </div>
  </div>
);

const RppgStep = ({ onNext, onBack }: StepProps) => {
  const [capturing, setCapturing] = useState(false);
  const [done, setDone] = useState(false);

  const startCapture = () => {
    setCapturing(true);
    setTimeout(() => {
      setCapturing(false);
      setDone(true);
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        We'll use your front camera to capture a 2-minute rPPG baseline for heart rate variability. Position your face in the frame and remain still.
      </p>
      <div className="aspect-[3/4] max-h-64 rounded-2xl bg-foreground/5 border-2 border-dashed border-border flex items-center justify-center mx-auto w-full max-w-xs overflow-hidden">
        {capturing ? (
          <motion.div className="text-center" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="h-16 w-16 rounded-full border-4 border-primary mx-auto mb-3 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-display font-semibold text-foreground">Capturing...</p>
            <p className="text-xs text-muted-foreground">Hold still</p>
          </motion.div>
        ) : done ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <div className="h-16 w-16 rounded-full gradient-primary mx-auto mb-3 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="text-sm font-display font-semibold text-foreground">Baseline captured!</p>
          </motion.div>
        ) : (
          <div className="text-center">
            <ScanFace className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Camera preview</p>
          </div>
        )}
      </div>
      {!done && !capturing && (
        <Button variant="clinical" size="xl" className="w-full" onClick={startCapture}>
          Start Baseline Capture
        </Button>
      )}
      <div className="flex gap-3 mt-2">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button variant="clinical" size="lg" onClick={onNext} className="flex-1" disabled={!done}>
          Continue <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

const steps = [
  { title: "Personal Info", subtitle: "Demographic covariates for risk stratification", icon: User, component: PersonalInfoStep },
  { title: "Physical Measurements", subtitle: "Height, weight & BMI computation", icon: Ruler, component: PhysicalStep },
  { title: "Skin Changes", subtitle: "Acanthosis Nigricans screening", icon: ScanFace, component: SkinStep },
  { title: "Menstrual History", subtitle: "Cycle patterns & regularity baseline", icon: CalendarHeart, component: MenstrualStep },
  { title: "Wearable Setup", subtitle: "Connect your device", icon: Watch, component: WearableStep },
  { title: "rPPG Baseline", subtitle: "Heart rate variability capture", icon: Heart, component: RppgStep },
];

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>({});

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else navigate("/onboarding-complete");
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const CurrentStep = steps[step].component;

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-display">Step {step + 1} of {steps.length}</p>
            <p className="text-xs text-muted-foreground">{Math.round(((step + 1) / steps.length) * 100)}%</p>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                {(() => { const Icon = steps[step].icon; return <Icon className="h-5 w-5 text-primary-foreground" />; })()}
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-foreground">{steps[step].title}</h2>
                <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
              </div>
            </div>

            <CurrentStep onNext={handleNext} onBack={handleBack} data={data} setData={setData} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingScreen;
