import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Info, Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useCheckinSession } from "@/hooks/useCheckinSession";
import { useUserGender } from "@/hooks/useUserGender";
import VASSlider from "@/components/VASSlider";
import { cn } from "@/lib/utils";

const TEAL_PRIMARY = '#00897B';

const getSeverityColor = (score: number, max: number): { color: string; label: string } => {
  const percentage = (score / max) * 100;
  if (percentage <= 20) return { color: '#27AE60', label: 'None' };
  if (percentage <= 40) return { color: '#F39C12', label: 'Mild' };
  if (percentage <= 60) return { color: '#E67E22', label: 'Moderate' };
  if (percentage <= 80) return { color: '#E74C3C', label: 'Severe' };
  return { color: '#922B21', label: 'Extreme' };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

// GAGS bands per spec: 0 = none, 1–18 mild, 19–30 moderate, 31–38 severe, >38 very severe
const getAcneBand = (score: number): { color: string; label: string } => {
  if (score <= 0) return { color: '#27AE60', label: 'None' };
  if (score <= 18) return { color: '#F39C12', label: 'Mild' };
  if (score <= 30) return { color: '#E67E22', label: 'Moderate' };
  if (score <= 38) return { color: '#E74C3C', label: 'Severe' };
  return { color: '#922B21', label: 'Very Severe' };
};

const acneLabels = [
  { value: 0, label: 'No spots', color: '#27AE60' },
  { value: 1, label: 'Blackheads / whiteheads', color: '#27AE60' },
  { value: 2, label: 'Small red bumps', color: '#F39C12' },
  { value: 3, label: 'Pus-filled bumps', color: '#E67E22' },
  { value: 4, label: 'Large lumps', color: '#E74C3C' },
];

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const EveningCheckIn = () => {
  const navigate = useNavigate();
  const { isMale } = useUserGender();
  const { loading, error, todayStatus, sessionId, isAlreadyComplete, retrySession, submitEveningData, submitHRV, completeSession, autosave } = useCheckinSession('evening');
  const [step, setStep] = useState<'form' | 'done' | 'error'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [breastLeft, setBreastLeft] = useState(0);
  const [breastRight, setBreastRight] = useState(0);
  const [mastalgiaSide, setMastalgiaSide] = useState<'Unilateral' | 'Bilateral'>('Unilateral');
  const [mastalgiaQuality, setMastalgiaQuality] = useState<'Sharp' | 'Dull' | 'Pressure'>('Dull');

  const [acneForehead, setAcneForehead] = useState(0);
  const [acneRightCheek, setAcneRightCheek] = useState(0);
  const [acneLeftCheek, setAcneLeftCheek] = useState(0);
  const [acneNose, setAcneNose] = useState(0);
  const [acneChin, setAcneChin] = useState(0);
  const [acneChestBack, setAcneChestBack] = useState(0);

  const [bloatingDelta, setBloatingDelta] = useState('');
  const [unusualBleeding, setUnusualBleeding] = useState(false);

  // Male block — Chest/Breast Tenderness
  const [chestLeft, setChestLeft] = useState(0);
  const [chestRight, setChestRight] = useState(0);
  const [chestSide, setChestSide] = useState<'Unilateral' | 'Bilateral'>('Unilateral');
  const [chestQuality, setChestQuality] = useState<'Sharp' | 'Dull' | 'Pressure'>('Dull');
  const [nippleSensitivity, setNippleSensitivity] = useState<number | null>(null);

  // Male block — Testicular & Pelvic Discomfort
  const [testicleLeft, setTesticleLeft] = useState(0);
  const [testicleRight, setTesticleRight] = useState(0);
  const [pelvicAche, setPelvicAche] = useState(0);
  const [pelvicQuality, setPelvicQuality] = useState<'Sharp' | 'Dull' | 'Pressure' | 'Heaviness'>('Dull');

  // Male block — Acne & Oily Skin
  const [oilySkin, setOilySkin] = useState<number | null>(null);

  // Male block — Urinary Symptoms (IPSS-style, each 0–5, null until rated)
  const [urinaryUrgency, setUrinaryUrgency] = useState<number | null>(null);
  const [urinaryWeakStream, setUrinaryWeakStream] = useState<number | null>(null);
  const [urinaryIncomplete, setUrinaryIncomplete] = useState<number | null>(null);
  const [urinaryStraining, setUrinaryStraining] = useState<number | null>(null);
  const [urinaryFrequency, setUrinaryFrequency] = useState<number | null>(null);
  const [daytimeVoidCount, setDaytimeVoidCount] = useState('');

  // Male block — Sexual Function, Energy & Mood
  const [libido, setLibido] = useState(0);
  const [erectionHardness, setErectionHardness] = useState<string>('');
  const [eveningEnergy, setEveningEnergy] = useState(0);
  const [strengthStamina, setStrengthStamina] = useState(0);
  const [lowMood, setLowMood] = useState(0);
  const [hotFlushIntensity, setHotFlushIntensity] = useState(0);
  const [hotFlushCount, setHotFlushCount] = useState('');
  const [drowsinessAfterDinner, setDrowsinessAfterDinner] = useState(false);

  // Male block — Red flags
  const [redFlagBlood, setRedFlagBlood] = useState(false);
  const [redFlagTesticular, setRedFlagTesticular] = useState(false);
  const [redFlagUrine, setRedFlagUrine] = useState(false);
  const [redFlagErection, setRedFlagErection] = useState(false);

  const mastalgiaScore = breastLeft + breastRight;
  const mastalgiaSeverity = getSeverityColor(mastalgiaScore, 20);

  // GAGS weights per spec/backend: forehead×2, cheeks×2+2, nose×1, chin×1, chest&back×3 (max 44)
  const acneGAGSScore = useMemo(() => {
    return (acneForehead * 2) + (acneRightCheek * 2) + (acneLeftCheek * 2) + (acneNose * 1) + (acneChin * 1) + (acneChestBack * 3);
  }, [acneForehead, acneRightCheek, acneLeftCheek, acneNose, acneChin, acneChestBack]);

  const acneSeverity = getAcneBand(acneGAGSScore);

  const chestTendernessScore = Math.max(chestLeft, chestRight);
  const pelvicDiscomfortScore = Math.max(testicleLeft, testicleRight, pelvicAche);

  const urinaryValues = [urinaryUrgency, urinaryWeakStream, urinaryIncomplete, urinaryStraining, urinaryFrequency].filter(
    (v): v is number => v !== null
  );
  const urinaryScore = urinaryValues.reduce((a, b) => a + b, 0);

  const anyRedFlag = redFlagBlood || redFlagTesticular || redFlagUrine || redFlagErection;

  const malePayload = isMale
    ? {
        chest_left_vas: chestLeft,
        chest_right_vas: chestRight,
        chest_side: chestSide,
        chest_quality: chestQuality,
        ...(nippleSensitivity !== null ? { nipple_sensitivity_vas: nippleSensitivity } : {}),
        testicle_left_vas: testicleLeft,
        testicle_right_vas: testicleRight,
        pelvic_ache_vas: pelvicAche,
        pelvic_quality: pelvicQuality,
        ...(oilySkin !== null ? { oily_skin_vas: oilySkin } : {}),
        ...(urinaryUrgency !== null ? { urinary_urgency: urinaryUrgency } : {}),
        ...(urinaryWeakStream !== null ? { urinary_weak_stream: urinaryWeakStream } : {}),
        ...(urinaryIncomplete !== null ? { urinary_incomplete_emptying: urinaryIncomplete } : {}),
        ...(urinaryStraining !== null ? { urinary_straining: urinaryStraining } : {}),
        ...(urinaryFrequency !== null ? { urinary_daytime_frequency: urinaryFrequency } : {}),
        ...(daytimeVoidCount !== '' ? { daytime_voids_count: Math.min(20, Math.max(1, parseInt(daytimeVoidCount, 10) || 1)) } : {}),
        libido_vas: libido,
        ...(erectionHardness ? { erection_hardness: erectionHardness } : {}),
        evening_energy_vas: eveningEnergy,
        strength_stamina_vas: strengthStamina,
        low_mood_vas: lowMood,
        hot_flush_intensity_vas: hotFlushIntensity,
        ...(hotFlushCount !== '' ? { hot_flush_count: Math.min(20, Math.max(0, parseInt(hotFlushCount, 10) || 0)) } : {}),
        drowsiness_after_dinner: drowsinessAfterDinner,
        red_flag_blood_urine_semen: redFlagBlood,
        red_flag_severe_testicular_pain: redFlagTesticular,
        red_flag_unable_pass_urine: redFlagUrine,
        red_flag_prolonged_erection: redFlagErection,
      }
    : {};

  const autosavePayload = useDebounce({
    ...(isMale ? {} : {
      breast_left_vas: breastLeft,
      breast_right_vas: breastRight,
      mastalgia_side: mastalgiaSide || null,
      mastalgia_quality: mastalgiaQuality || null,
      unusual_bleeding: unusualBleeding,
    }),
    acne_forehead: acneForehead,
    acne_right_cheek: acneRightCheek,
    acne_left_cheek: acneLeftCheek,
    acne_nose: acneNose,
    acne_chin: acneChin,
    acne_chest_back: acneChestBack,
    bloating_delta_cm: bloatingDelta ? parseFloat(bloatingDelta) : null,
    ...malePayload,
  }, 2000);

  const prevPayloadRef = useRef('');

  useEffect(() => {
    const payloadStr = JSON.stringify(autosavePayload);
    if (payloadStr !== prevPayloadRef.current && sessionId) {
      prevPayloadRef.current = payloadStr;
      autosave(autosavePayload as Record<string, unknown>);
    }
  }, [autosavePayload, sessionId, autosave]);

  useEffect(() => {
    if (isAlreadyComplete || todayStatus?.evening_status === 'complete') {
      setStep('done');
    }
  }, [isAlreadyComplete, todayStatus]);

  useEffect(() => {
    if (error && !loading) {
      setStep('error');
    }
  }, [error, loading]);

  const handleSubmit = async () => {
    if (!sessionId) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitEveningData({
        ...(isMale ? {} : {
          breast_left_vas: breastLeft,
          breast_right_vas: breastRight,
          mastalgia_side: mastalgiaSide || null,
          mastalgia_quality: mastalgiaQuality || null,
          unusual_bleeding: unusualBleeding,
        }),
        acne_forehead: acneForehead,
        acne_right_cheek: acneRightCheek,
        acne_left_cheek: acneLeftCheek,
        acne_nose: acneNose,
        acne_chin: acneChin,
        acne_chest_back: acneChestBack,
        bloating_delta_cm: bloatingDelta ? parseFloat(bloatingDelta) : null,
        ...malePayload,
      });
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to save. Please try again.');
      setSubmitError(message);
      toast({ title: 'Error', description: message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    try {
      await submitHRV(null);
    } catch {
      // Non-blocking
    }

    try {
      const result = await completeSession();
      toast({ title: 'Evening check-in complete', description: 'Great job today!' });
      if (result.predictions_triggered) {
        toast({ title: 'Risk score is being updated...', description: 'Check back in a moment.' });
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err, 'Submission failed. Please try again.'));
      toast({ title: 'Submission failed', description: 'Please try again.', variant: 'destructive' });
      setSubmitting(false);
    }
  };

  const renderAcneSlider = (value: number, onChange: (v: number) => void, label: string) => (
    <div className="flex items-center justify-between gap-4 mb-2">
      <span className="text-sm text-gray-700 w-24">{label}</span>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="range"
          min="0"
          max="4"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 appearance-none rounded-lg cursor-pointer"
          style={{ accentColor: acneLabels[value].color }}
        />
        <span className="text-sm font-medium w-20" style={{ color: acneLabels[value].color }}>
          {value}/4
        </span>
      </div>
      <span className="text-xs text-gray-500 w-32">{acneLabels[value].label}</span>
    </div>
  );

  const renderChoiceButtons = <T extends string>(
    options: T[],
    value: T,
    onSelect: (v: T) => void
  ) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            value === option
              ? 'text-white'
              : 'border border-gray-300 text-gray-600'
          )}
          style={value === option ? { backgroundColor: TEAL_PRIMARY } : {}}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const renderScale0to5 = (value: number | null, onChange: (v: number) => void) => (
    <div className="flex gap-1.5">
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={cn(
            'flex-1 h-9 rounded-lg text-sm font-semibold transition-all',
            value === n
              ? 'text-white'
              : 'border border-gray-300 text-gray-500 bg-white hover:border-teal-300'
          )}
          style={value === n ? { backgroundColor: TEAL_PRIMARY } : {}}
        >
          {n}
        </button>
      ))}
    </div>
  );

  const ehsOptions = [
    { value: 'Not_Attempted', label: 'Not attempted' },
    { value: '0', label: '0 — does not enlarge' },
    { value: '1', label: '1 — enlarges, not hard' },
    { value: '2', label: '2 — hard, not enough' },
    { value: '3', label: '3 — hard enough' },
    { value: '4', label: '4 — completely hard' },
  ];

  const renderForm = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* ── FEMALE: Cyclic Breast Soreness ─────────────────────────────────── */}
      {!isMale && (
      <div className="rounded-xl border border-gray-200 bg-teal-50 p-4 mb-6">
        <p className="text-sm font-semibold text-teal-800 mb-1" style={{ color: TEAL_PRIMARY }}>CYCLIC BREAST SORENESS</p>
        <p className="text-xs text-gray-600 mb-4">Cyclic Mastalgia</p>

        <div className="space-y-4">
          <VASSlider
            label="Left Breast"
            value={breastLeft}
            onChange={setBreastLeft}
            min={0}
            max={10}
            lowLabel="No pain"
            highLabel="Worst pain"
          />

          <VASSlider
            label="Right Breast"
            value={breastRight}
            onChange={setBreastRight}
            min={0}
            max={10}
            lowLabel="No pain"
            highLabel="Worst pain"
          />
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-teal-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Cyclic Mastalgia Score</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: mastalgiaSeverity.color }}>
                {mastalgiaScore}
              </span>
              <span className="text-xs text-gray-500">/20</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: mastalgiaSeverity.color }}
              >
                {mastalgiaSeverity.label}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Location</p>
          <div className="flex gap-2">
            {['Unilateral', 'Bilateral'].map((option) => (
              <button
                key={option}
                onClick={() => setMastalgiaSide(option as 'Unilateral' | 'Bilateral')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  mastalgiaSide === option
                    ? 'text-white'
                    : 'border border-gray-300 text-gray-600'
                )}
                style={mastalgiaSide === option ? { backgroundColor: TEAL_PRIMARY } : {}}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Quality</p>
          {renderChoiceButtons(
            ['Sharp', 'Dull', 'Pressure'] as const,
            mastalgiaQuality,
            (v) => setMastalgiaQuality(v)
          )}
        </div>
      </div>
      )}

      {/* ── MALE: Chest/Breast Tenderness ──────────────────────────────────── */}
      {isMale && (
      <div className="rounded-xl border border-gray-200 bg-teal-50 p-4 mb-6">
        <p className="text-sm font-semibold text-teal-800 mb-1" style={{ color: TEAL_PRIMARY }}>CHEST / BREAST TENDERNESS</p>
        <p className="text-xs text-gray-600 mb-4">Possible gynecomastia-related tenderness</p>

        <div className="space-y-4">
          <VASSlider
            label="Left Chest"
            value={chestLeft}
            onChange={setChestLeft}
            min={0}
            max={10}
            lowLabel="No pain"
            highLabel="Worst pain"
          />
          <VASSlider
            label="Right Chest"
            value={chestRight}
            onChange={setChestRight}
            min={0}
            max={10}
            lowLabel="No pain"
            highLabel="Worst pain"
          />
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Location</p>
          {renderChoiceButtons(
            ['Unilateral', 'Bilateral'] as const,
            chestSide,
            (v) => setChestSide(v)
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Quality</p>
          {renderChoiceButtons(
            ['Sharp', 'Dull', 'Pressure'] as const,
            chestQuality,
            (v) => setChestQuality(v)
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Nipple sensitivity (optional)</p>
          <VASSlider
            label="Nipple Sensitivity"
            value={nippleSensitivity ?? 0}
            onChange={setNippleSensitivity}
            min={0}
            max={10}
            lowLabel="None"
            highLabel="Severe"
          />
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-teal-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Chest Tenderness Score</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: TEAL_PRIMARY }}>
                {chestTendernessScore}
              </span>
              <span className="text-xs text-gray-500">/10</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── MALE: Testicular & Pelvic Discomfort ────────────────────────────── */}
      {isMale && (
      <div className="rounded-xl border border-gray-200 bg-teal-50 p-4 mb-6">
        <p className="text-sm font-semibold text-teal-800 mb-1" style={{ color: TEAL_PRIMARY }}>TESTICULAR & PELVIC DISCOMFORT</p>
        <p className="text-xs text-gray-600 mb-4">Pain or aching in the testicles, pelvis or lower abdomen</p>

        <div className="space-y-4">
          <VASSlider
            label="Left Testicle"
            value={testicleLeft}
            onChange={setTesticleLeft}
            min={0}
            max={10}
            lowLabel="No pain"
            highLabel="Worst pain"
          />
          <VASSlider
            label="Right Testicle"
            value={testicleRight}
            onChange={setTesticleRight}
            min={0}
            max={10}
            lowLabel="No pain"
            highLabel="Worst pain"
          />
          <VASSlider
            label="Pelvic / Perineal / Lower-Abdominal Ache"
            value={pelvicAche}
            onChange={setPelvicAche}
            min={0}
            max={10}
            lowLabel="No pain"
            highLabel="Worst pain"
          />
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Quality</p>
          {renderChoiceButtons(
            ['Sharp', 'Dull', 'Pressure', 'Heaviness'] as const,
            pelvicQuality,
            (v) => setPelvicQuality(v)
          )}
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-teal-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Pelvic Discomfort Score</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: TEAL_PRIMARY }}>
                {pelvicDiscomfortScore}
              </span>
              <span className="text-xs text-gray-500">/10</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── SHARED: Acne Severity (GAGS) ────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-teal-50 p-4 mb-6">
        <p className="text-sm font-semibold text-teal-800 mb-1" style={{ color: TEAL_PRIMARY }}>{isMale ? 'ACNE & OILY SKIN' : 'ACNE SEVERITY'}</p>
        <p className="text-xs text-gray-600 mb-4">GAGS Scale</p>

        <p className="text-xs font-medium text-gray-700 mb-2">Face</p>
        {renderAcneSlider(acneForehead, setAcneForehead, 'Forehead')}
        {renderAcneSlider(acneRightCheek, setAcneRightCheek, 'Right Cheek')}
        {renderAcneSlider(acneLeftCheek, setAcneLeftCheek, 'Left Cheek')}
        {renderAcneSlider(acneNose, setAcneNose, 'Nose')}
        {renderAcneSlider(acneChin, setAcneChin, 'Chin')}

        <p className="text-xs font-medium text-gray-700 mb-2 mt-4">Chest & Back</p>
        {renderAcneSlider(acneChestBack, setAcneChestBack, 'Chest & Back')}

        <div className="mt-4 p-3 bg-white rounded-lg border border-teal-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Acne Score</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: acneSeverity.color }}>
                {acneGAGSScore}
              </span>
              <span className="text-xs text-gray-500">/44</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: acneSeverity.color }}
              >
                {acneSeverity.label}
              </span>
            </div>
          </div>
        </div>

        {isMale && (
          <div className="mt-4">
            <p className="text-xs text-gray-600 mb-2">Oily skin (optional)</p>
            <VASSlider
              label="Oily Skin"
              value={oilySkin ?? 0}
              onChange={setOilySkin}
              min={0}
              max={10}
              lowLabel="None"
              highLabel="Severe"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-1">
          {isMale ? 'Abdominal Girth Change' : 'Bloating Circumference Change'}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          {isMale
            ? 'Measured waist circumference change from this morning\'s baseline. Leave blank if not measured.'
            : 'Enter abdominal circumference change in cm. Leave blank if not measured.'}
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="e.g. 2.5"
            value={bloatingDelta}
            onChange={(e) => setBloatingDelta(e.target.value)}
            className="flex-1"
          />
          <span className="text-gray-500 text-sm">cm change from morning baseline</span>
        </div>
      </div>

      {/* ── MALE: Urinary Symptoms (IPSS-style) ─────────────────────────────── */}
      {isMale && (
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-1">URINARY SYMPTOMS</p>
        <p className="text-xs text-gray-500 mb-4">Rate each item 0 (not at all) to 5 (almost always)</p>

        <div className="space-y-4">
          {[
            { label: 'Urgency — difficult to postpone urination', value: urinaryUrgency, set: setUrinaryUrgency },
            { label: 'Weak stream', value: urinaryWeakStream, set: setUrinaryWeakStream },
            { label: 'Incomplete emptying', value: urinaryIncomplete, set: setUrinaryIncomplete },
            { label: 'Straining to start', value: urinaryStraining, set: setUrinaryStraining },
            { label: 'Daytime frequency', value: urinaryFrequency, set: setUrinaryFrequency },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium text-gray-700 mb-2">{item.label}</p>
              {renderScale0to5(item.value, item.set)}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Daytime voids today</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={20}
              placeholder="e.g. 6"
              value={daytimeVoidCount}
              onChange={(e) => setDaytimeVoidCount(e.target.value)}
              className="w-24"
            />
            <span className="text-xs text-gray-500">times you urinated today (optional)</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Urinary Score</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: TEAL_PRIMARY }}>{urinaryScore}</span>
              <span className="text-xs text-gray-500">/25</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── MALE: Sexual Function, Energy & Mood ────────────────────────────── */}
      {isMale && (
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-1">SEXUAL FUNCTION, ENERGY & MOOD</p>
        <p className="text-xs text-gray-500 mb-4">How has your drive, energy and mood been today?</p>

        <div className="space-y-4">
          <VASSlider
            label="Libido Today"
            value={libido}
            onChange={setLibido}
            min={0}
            max={10}
            lowLabel="None"
            highLabel="High"
          />

          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Erection Hardness Score (EHS)</p>
            <div className="space-y-1.5">
              {ehsOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setErectionHardness(opt.value)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    erectionHardness === opt.value
                      ? 'text-white'
                      : 'border border-gray-300 text-gray-600 bg-white hover:border-teal-300'
                  )}
                  style={erectionHardness === opt.value ? { backgroundColor: TEAL_PRIMARY } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <VASSlider
            label="Evening Energy / Fatigue"
            value={eveningEnergy}
            onChange={setEveningEnergy}
            min={0}
            max={10}
            lowLabel="Drained"
            highLabel="Energetic"
          />
          <VASSlider
            label="Strength & Stamina"
            value={strengthStamina}
            onChange={setStrengthStamina}
            min={0}
            max={10}
            lowLabel="Low"
            highLabel="High"
          />
          <VASSlider
            label="Low Mood / Irritability"
            value={lowMood}
            onChange={setLowMood}
            min={0}
            max={10}
            lowLabel="None"
            highLabel="Severe"
          />
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Hot flushes / night sweats</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={20}
              placeholder="Count"
              value={hotFlushCount}
              onChange={(e) => setHotFlushCount(e.target.value)}
              className="w-24"
            />
            <span className="text-xs text-gray-500">episodes today</span>
          </div>
          <div className="mt-3">
            <VASSlider
              label="Hot Flush Intensity"
              value={hotFlushIntensity}
              onChange={setHotFlushIntensity}
              min={0}
              max={10}
              lowLabel="None"
              highLabel="Severe"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-700">Drowsiness after dinner</p>
              <p className="text-xs text-gray-500">Do you feel unusually sleepy after evening meals?</p>
            </div>
            <input
              type="checkbox"
              checked={drowsinessAfterDinner}
              onChange={(e) => setDrowsinessAfterDinner(e.target.checked)}
              className="w-5 h-5"
              style={{ accentColor: TEAL_PRIMARY }}
            />
          </label>
        </div>
      </div>
      )}

      {/* ── MALE: Red-Flag Checkboxes ───────────────────────────────────────── */}
      {isMale && (
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-1">RED-FLAG SYMPTOMS</p>
        <p className="text-xs text-gray-500 mb-4">
          Tick any that apply today. These trigger an alert — they are not scored.
        </p>

        {[
          { label: 'Blood in urine or semen', checked: redFlagBlood, set: setRedFlagBlood },
          { label: 'Sudden severe testicular pain or swelling', checked: redFlagTesticular, set: setRedFlagTesticular },
          { label: 'Unable to pass urine', checked: redFlagUrine, set: setRedFlagUrine },
          { label: 'Painful erection lasting more than 4 hours', checked: redFlagErection, set: setRedFlagErection },
        ].map((flag) => (
          <label key={flag.label} className="flex items-center justify-between cursor-pointer py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-700">{flag.label}</span>
            <input
              type="checkbox"
              checked={flag.checked}
              onChange={(e) => flag.set(e.target.checked)}
              className="w-5 h-5"
              style={{ accentColor: '#E74C3C' }}
            />
          </label>
        ))}

        {anyRedFlag && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-semibold">Please seek medical care promptly.</span>{' '}
              The symptoms you selected can be serious and should be checked by a clinician.
            </p>
          </div>
        )}
      </div>
      )}

      {/* ── FEMALE ONLY: Unusual Bleeding ───────────────────────────────────── */}
      {!isMale && (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium text-gray-700">Unusual Bleeding</p>
            <p className="text-xs text-gray-500">Any bleeding outside your normal period window?</p>
          </div>
          <input
            type="checkbox"
            checked={unusualBleeding}
            onChange={(e) => setUnusualBleeding(e.target.checked)}
            className="w-5 h-5"
            style={{ accentColor: TEAL_PRIMARY }}
          />
        </label>
      </div>
      )}

      {submitError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={submitting || !sessionId}
          className="w-full h-12 rounded-xl text-white font-semibold"
          style={{ backgroundColor: TEAL_PRIMARY }}
        >
          {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : 'Complete Evening Check-In'}
        </Button>
      </div>
    </motion.div>
  );

  const renderDone = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
      <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Evening Check-In Complete!</h3>
      <p className="text-sm text-gray-500">Your data has been recorded. Great job today!</p>
    </motion.div>
  );

  const renderError = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
      <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">!</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Start Check-In</h3>
      <p className="text-sm text-gray-500 mb-6">{error || 'Could not start your check-in session. Tap to try again.'}</p>
      <Button
        onClick={retrySession}
        className="w-full h-12 rounded-xl text-white font-semibold"
        style={{ backgroundColor: TEAL_PRIMARY }}
      >
        Try Again
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-4" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1 rounded-full px-3 py-2 text-white/80 transition duration-200 ease-in-out hover:bg-white hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>

            <div className="inline-flex flex-col rounded-xl px-3 py-2">
              <h1 className="flex items-center gap-2 text-xl font-bold text-white font-[var(--font-display)]">
                <Moon className="w-5 h-5" />
                Symptom Intensity Logging
              </h1>

              <p className="mt-1 text-sm text-white/70">
                End of day review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white text-sm">
            <div className="h-2 w-2 rounded-full bg-teal-300" />
            Evening Check-In
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto pb-20">
        {(loading && !sessionId && !error) ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : step === 'error' ? renderError() : step === 'form' ? renderForm() : renderDone()}
      </div>
    </div>
  );
};

export default EveningCheckIn;
