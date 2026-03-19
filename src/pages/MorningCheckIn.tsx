import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const MorningCheckIn = () => {
  const navigate = useNavigate();
  const { loading, error, todayStatus, sessionId, isAlreadyComplete, retrySession, submitMorningData, submitHRV, completeSession } = useCheckinSession('morning');
  const [step, setStep] = useState<'form' | 'hrv' | 'done' | 'error'>('form');
  const [submitting, setSubmitting] = useState(false);
  
  const [fatigue, setFatigue] = useState(0);
  const [pelvicPressure, setPelvicPressure] = useState(0);
  const [psqSkin, setPsqSkin] = useState(0);
  const [psqMuscle, setPsqMuscle] = useState(0);
  const [psqBody, setPsqBody] = useState(0);

  const hyperalgesiaIndex = (psqSkin + psqMuscle + psqBody) / 3;
  const hyperalgesiaSeverity = getSeverityColor(hyperalgesiaIndex, 10);

  useEffect(() => {
    if (isAlreadyComplete || todayStatus?.morning_status === 'complete') {
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
    try {
      await submitMorningData({
        fatigue_vas: fatigue,
        pelvic_pressure_vas: pelvicPressure,
        psq_skin_sensitivity: psqSkin,
        psq_muscle_pressure_pain: psqMuscle,
        psq_body_tenderness: psqBody,
      });
      setStep('hrv');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHRVSubmit = async (skipped: boolean) => {
    setSubmitting(true);
    try {
      if (!skipped) {
        await submitHRV({ hrv_sdnn_ms: 42.5, hrv_rmssd_ms: 38.2 });
      } else {
        await submitHRV(null);
      }
      await completeSession();
      setStep('done');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to complete. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderForm = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <VASSlider
        label="Physical Fatigue"
        description="How tired or physically drained do you feel?"
        value={fatigue}
        onChange={setFatigue}
        min={0}
        max={10}
        lowLabel="Energized"
        highLabel="Exhausted"
      />

      <div className="mt-8">
        <VASSlider
          label="Pelvic Pressure"
          description="Any lower abdominal pressure or discomfort?"
          value={pelvicPressure}
          onChange={setPelvicPressure}
          min={0}
          max={10}
          lowLabel="No pressure"
          highLabel="Intense"
        />
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-teal-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-teal-600" />
          <p className="font-semibold text-teal-800 text-sm">Painful Touch / Hyperalgesia</p>
        </div>
        <p className="text-xs text-teal-700 mb-4">Pain Sensitivity Questionnaire (PSQ-3)</p>

        <div className="space-y-4">
          <VASSlider
            label="Skin Sensitivity"
            description="How sensitive is your skin to light touch today?"
            value={psqSkin}
            onChange={setPsqSkin}
            min={0}
            max={10}
            lowLabel="No pain"
            highLabel="Severe"
          />

          <VASSlider
            label="Muscle Pressure Pain"
            description="Does pressure on your muscles feel painful today?"
            value={psqMuscle}
            onChange={setPsqMuscle}
            min={0}
            max={10}
            lowLabel="No pain"
            highLabel="Severe"
          />

          <VASSlider
            label="Overall Body Tenderness"
            description="How would you rate your overall body tenderness?"
            value={psqBody}
            onChange={setPsqBody}
            min={0}
            max={10}
            lowLabel="No pain"
            highLabel="Severe"
          />
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-teal-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Hyperalgesia Index</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: hyperalgesiaSeverity.color }}>
                {hyperalgesiaIndex.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">/10</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: hyperalgesiaSeverity.color }}
              >
                {hyperalgesiaSeverity.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-12 rounded-xl text-white font-semibold"
          style={{ backgroundColor: TEAL_PRIMARY }}
        >
          {submitting ? 'Saving...' : 'Complete Morning Check-In'}
        </Button>
      </div>
    </motion.div>
  );

  const renderHRVPrompt = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
      <div className="h-20 w-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
        <Sun className="h-10 w-10 text-teal-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Daily HRV Reading</h3>
      <p className="text-sm text-gray-500 mb-6">Take your 2-minute camera HRV session for more accurate predictions.</p>
      
      <div className="space-y-3">
        <Button
          onClick={() => handleHRVSubmit(false)}
          disabled={submitting}
          className="w-full h-12 rounded-xl text-white font-semibold"
          style={{ backgroundColor: TEAL_PRIMARY }}
        >
          Start HRV Session (2 min)
        </Button>
        <Button
          variant="outline"
          onClick={() => handleHRVSubmit(true)}
          disabled={submitting}
          className="w-full h-12 rounded-xl"
        >
          Skip for now
        </Button>
      </div>
    </motion.div>
  );

  const renderDone = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
      <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Morning Check-In Complete!</h3>
      <p className="text-sm text-gray-500">Your data has been recorded.</p>
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
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            Morning Check-In
          </div>
        </div>
        <h1 className="text-xl font-bold text-white font-[var(--font-display)] flex items-center gap-2">
          <Sun className="w-5 h-5" />
          Symptom Intensity Logging
        </h1>
        <p className="text-white/70 text-sm mt-1">How are you feeling this morning?</p>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {(loading && !sessionId && !error) ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : step === 'error' ? renderError() : step === 'form' ? renderForm() : step === 'hrv' ? renderHRVPrompt() : renderDone()}
      </div>
    </div>
  );
};

export default MorningCheckIn;