import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { moodService } from "@/services/moodService";
import { markToolComplete, getTodayDateString } from "@/utils/weekUtils";

const GREEN = '#27AE60';

const SleepQuality = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(5);
  const [hours, setHours] = useState(7);
  const [result, setResult] = useState<{ satisfaction: number; hours: number } | null>(null);

  const sleepStatus = useMemo(() => {
    if (quality >= 7 && hours >= 7) return { label: 'Good', color: '#27AE60', bg: 'bg-green-100' };
    if (quality >= 5 && hours >= 6) return { label: 'Fair', color: '#F59E0B', bg: 'bg-amber-100' };
    return { label: 'Poor', color: '#E74C3C', bg: 'bg-red-100' };
  }, [quality, hours]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await moodService.logSleep({
        sleep_quality: quality,
        hours_slept: hours,
        log_date: getTodayDateString(),
      });
      
      setResult({ satisfaction: response.data.sleep_satisfaction, hours: response.data.hours_slept });
      setStep('results');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Could not save. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    markToolComplete('sleep');
    navigate('/weekly-tools');
  };

  const renderForm = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-xl font-bold text-gray-900 mb-1 font-[var(--font-display)]">Sleep Quality</h2>
      <p className="text-sm text-gray-500 mb-6">How well did you sleep?</p>

      <div className={cn('rounded-xl p-5 mb-6 text-center', sleepStatus.bg)}>
        <p className="text-2xl font-bold" style={{ color: sleepStatus.color }}>{sleepStatus.label}</p>
        <p className="text-sm text-gray-600 mt-1">{hours} hours • Quality {quality}/10</p>
      </div>

      <div className="rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Sleep Quality</p>
        <p className="text-xs text-gray-500 mb-3">How restful was your sleep last night?</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Very poor</span>
          <input
            type="range"
            min="1"
            max="10"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="flex-1 h-2 appearance-none rounded-lg cursor-pointer"
            style={{ accentColor: GREEN }}
          />
          <span className="text-xs text-gray-500">Excellent</span>
        </div>
        <div className="text-center font-bold text-lg" style={{ color: GREEN }}>{quality}/10</div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-1">Hours Slept</p>
        <p className="text-xs text-gray-500 mb-3">How many hours did you sleep?</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">0h</span>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value))}
            className="flex-1 h-2 appearance-none rounded-lg cursor-pointer"
            style={{ accentColor: GREEN }}
          />
          <span className="text-xs text-gray-500">12h</span>
        </div>
        <div className="text-center font-bold text-lg" style={{ color: GREEN }}>{hours}h</div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-12 rounded-xl text-white font-semibold"
        style={{ backgroundColor: GREEN }}
      >
        {loading ? 'Saving...' : 'Save Sleep Data'}
      </Button>
    </motion.div>
  );

  const renderResults = () => {
    if (!result) return null;
    
    const resultStatus = useMemo(() => {
      if (quality >= 7 && hours >= 7) return { label: 'Good', color: '#27AE60', bg: 'bg-green-100' };
      if (quality >= 5 && hours >= 6) return { label: 'Fair', color: '#F59E0B', bg: 'bg-amber-100' };
      return { label: 'Poor', color: '#E74C3C', bg: 'bg-red-100' };
    }, [quality, hours]);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={cn('rounded-xl p-5 mb-6 text-center', resultStatus.bg)}>
          <p className="text-2xl font-bold" style={{ color: resultStatus.color }}>{resultStatus.label}</p>
          <p className="text-sm text-gray-600 mt-1">{hours} hours slept • Quality {quality}/10</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Sleep Satisfaction</p>
            <p className="text-2xl font-bold text-gray-900">{result.satisfaction.toFixed(1)}</p>
            <p className="text-xs text-gray-500">out of 5</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Hours Slept</p>
            <p className="text-2xl font-bold text-gray-900">{hours}h</p>
          </div>
        </div>

        {hours < 6 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
            <p className="text-sm text-amber-800">
              Less than 6 hours of sleep can impact hormonal health, mood, and cognitive function.
            </p>
          </div>
        )}

        <Button
          onClick={handleDone}
          className="w-full h-12 rounded-xl text-white font-semibold"
          style={{ backgroundColor: GREEN }}
        >
          Done
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: GREEN }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/weekly-tools')} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Sleep Quality</h1>
        </div>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {step === 'form' ? renderForm() : renderResults()}
      </div>
    </div>
  );
};

import { cn } from "@/lib/utils";
export default SleepQuality;