import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { moodService } from "@/services/moodService";
import { markToolComplete, getTodayDateString } from "@/utils/weekUtils";

const ORANGE = '#F59E0B';

const FocusMemory = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(5);
  const [memory, setMemory] = useState(5);
  const [fatigue, setFatigue] = useState(5);
  const [result, setResult] = useState<{ cognitive_load: number } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await moodService.logFocus({
        focus_score: focus,
        memory_score: memory,
        mental_fatigue: fatigue,
        log_date: getTodayDateString(),
      });
      
      setResult({ cognitive_load: response.data.cognitive_load_score });
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
    markToolComplete('focus');
    navigate('/weekly-tools');
  };

  const getLoadStatus = (score: number) => {
    if (score <= 3) return { label: 'Low Load', color: '#27AE60', bg: 'bg-green-100' };
    if (score <= 6) return { label: 'Moderate Load', color: '#F59E0B', bg: 'bg-amber-100' };
    return { label: 'High Load', color: '#E74C3C', bg: 'bg-red-100' };
  };

  const renderForm = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-xl font-bold text-gray-900 mb-1 font-[var(--font-display)]">Focus & Memory</h2>
      <p className="text-sm text-gray-500 mb-6">How sharp have you felt this week?</p>

      <div className="rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Focus Score</p>
        <p className="text-xs text-gray-500 mb-3">How well were you able to concentrate?</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Very scattered</span>
          <input
            type="range"
            min="1"
            max="10"
            value={focus}
            onChange={(e) => setFocus(parseInt(e.target.value))}
            className="flex-1 h-2 appearance-none rounded-lg cursor-pointer"
            style={{ accentColor: ORANGE }}
          />
          <span className="text-xs text-gray-500">Laser-focused</span>
        </div>
        <div className="text-center font-bold text-lg" style={{ color: ORANGE }}>{focus}/10</div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Memory Score</p>
        <p className="text-xs text-gray-500 mb-3">How well were you able to remember things?</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Very forgetful</span>
          <input
            type="range"
            min="1"
            max="10"
            value={memory}
            onChange={(e) => setMemory(parseInt(e.target.value))}
            className="flex-1 h-2 appearance-none rounded-lg cursor-pointer"
            style={{ accentColor: ORANGE }}
          />
          <span className="text-xs text-gray-500">Sharp recall</span>
        </div>
        <div className="text-center font-bold text-lg" style={{ color: ORANGE }}>{memory}/10</div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-1">Mental Fatigue</p>
        <p className="text-xs text-gray-500 mb-3">How mentally drained do you feel?</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Completely drained</span>
          <input
            type="range"
            min="1"
            max="10"
            value={fatigue}
            onChange={(e) => setFatigue(parseInt(e.target.value))}
            className="flex-1 h-2 appearance-none rounded-lg cursor-pointer"
            style={{ accentColor: ORANGE }}
          />
          <span className="text-xs text-gray-500">Mentally fresh</span>
        </div>
        <div className="text-center font-bold text-lg" style={{ color: ORANGE }}>{fatigue}/10</div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-12 rounded-xl text-white font-semibold"
        style={{ backgroundColor: ORANGE }}
      >
        {loading ? 'Saving...' : 'Save Assessment'}
      </Button>
    </motion.div>
  );

  const renderResults = () => {
    if (!result) return null;
    
    const status = getLoadStatus(result.cognitive_load);
    
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Focus</p>
            <p className="text-2xl font-bold text-gray-900">{focus}/10</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Memory</p>
            <p className="text-2xl font-bold text-gray-900">{memory}/10</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Mental Fatigue</p>
            <p className="text-2xl font-bold text-gray-900">{fatigue}/10</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-sm font-medium text-gray-500 mb-2">Cognitive Load Score</p>
          <p className="text-4xl font-bold mb-1">{result.cognitive_load.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-3">out of 10</p>
          <span className={cn('inline-block px-3 py-1 rounded-full text-sm font-medium', status.bg)} style={{ color: status.color }}>
            {status.label}
          </span>
          <p className="text-xs text-gray-500 mt-3">
            This score reflects overall mental burden combining focus, memory, and fatigue.
          </p>
        </div>

        <Button
          onClick={handleDone}
          className="w-full h-12 rounded-xl text-white font-semibold"
          style={{ backgroundColor: ORANGE }}
        >
          Done
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: ORANGE }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/weekly-tools')} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Focus & Memory</h1>
        </div>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {step === 'form' ? renderForm() : renderResults()}
      </div>
    </div>
  );
};

import { cn } from "@/lib/utils";
export default FocusMemory;