import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Info, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useCheckinSession } from "@/hooks/useCheckinSession";
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

  const mastalgiaScore = breastLeft + breastRight;
  const mastalgiaSeverity = getSeverityColor(mastalgiaScore, 20);

  const acneGAGSScore = useMemo(() => {
    return (acneForehead * 2) + (acneRightCheek * 2) + (acneLeftCheek * 2) + (acneNose * 2) + (acneChin * 2) + (acneChestBack * 1);
  }, [acneForehead, acneRightCheek, acneLeftCheek, acneNose, acneChin, acneChestBack]);

  const acneSeverity = getSeverityColor(acneGAGSScore, 44);

  const autosavePayload = useDebounce({
    breast_left_vas: breastLeft,
    breast_right_vas: breastRight,
    mastalgia_side: mastalgiaSide,
    mastalgia_quality: mastalgiaQuality,
    acne_forehead: acneForehead,
    acne_right_cheek: acneRightCheek,
    acne_left_cheek: acneLeftCheek,
    acne_nose: acneNose,
    acne_chin: acneChin,
    acne_chest_back: acneChestBack,
    bloating_delta_cm: bloatingDelta ? parseFloat(bloatingDelta) : null,
    unusual_bleeding: unusualBleeding,
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
        breast_left_vas: breastLeft,
        breast_right_vas: breastRight,
        mastalgia_side: mastalgiaSide,
        mastalgia_quality: mastalgiaQuality,
        acne_forehead: acneForehead,
        acne_right_cheek: acneRightCheek,
        acne_left_cheek: acneLeftCheek,
        acne_nose: acneNose,
        acne_chin: acneChin,
        acne_chest_back: acneChestBack,
        bloating_delta_cm: bloatingDelta ? parseFloat(bloatingDelta) : null,
        unusual_bleeding: unusualBleeding,
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save. Please try again.');
      toast({ title: 'Error', description: err.message || 'Failed to save. Please try again.', variant: 'destructive' });
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
      toast({ title: 'Evening check-in complete ✓', description: 'Great job today!' });
      if (result.predictions_triggered) {
        toast({ title: 'Risk score is being updated...', description: 'Check back in a moment.' });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
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

  const renderForm = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
          <div className="flex gap-2">
            {['Sharp', 'Dull', 'Pressure'].map((option) => (
              <button
                key={option}
                onClick={() => setMastalgiaQuality(option as 'Sharp' | 'Dull' | 'Pressure')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  mastalgiaQuality === option
                    ? 'text-white'
                    : 'border border-gray-300 text-gray-600'
                )}
                style={mastalgiaQuality === option ? { backgroundColor: TEAL_PRIMARY } : {}}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-teal-50 p-4 mb-6">
        <p className="text-sm font-semibold text-teal-800 mb-1" style={{ color: TEAL_PRIMARY }}>ACNE SEVERITY</p>
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
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-1">Bloating Circumference Change</label>
        <p className="text-xs text-gray-500 mb-3">Enter abdominal circumference change in cm. Leave blank if not measured.</p>
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
          <button onClick={() => navigate('/dashboard')} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-white text-sm">
            <div className="h-2 w-2 rounded-full bg-teal-300" />
            Evening Check-In
          </div>
        </div>
        <h1 className="text-xl font-bold text-white font-[var(--font-display)] flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Symptom Intensity Logging
        </h1>
        <p className="text-white/70 text-sm mt-1">End of day review</p>
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
