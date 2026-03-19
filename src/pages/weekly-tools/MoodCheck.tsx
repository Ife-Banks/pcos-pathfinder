import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { moodService } from "@/services/moodService";
import { markToolComplete, getTodayDateString, getQuadrantFromValues } from "@/utils/weekUtils";

const TEAL_PRIMARY = '#00897B';
const PURPLE = '#7C3AED';

const quadrantColors: Record<string, { bg: string; text: string }> = {
  'Happy-Energised': { bg: 'bg-green-100', text: 'text-green-700' },
  'Calm-Relaxed': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'Neutral': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Anxious-Agitated': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Depressed-Fatigued': { bg: 'bg-red-100', text: 'text-red-700' },
};

const interpretations: Record<string, string> = {
  'Happy-Energised': "You're feeling positive and full of energy. Great time for productive activities.",
  'Calm-Relaxed': "You're feeling positive but low energy. Good for rest and reflection.",
  'Neutral': "You're in a balanced emotional state. Continue monitoring your mood.",
  'Anxious-Agitated': "You're feeling tense or on edge. Consider a calming activity or rest.",
  'Depressed-Fatigued': "You're feeling low energy and negative. Be gentle with yourself today.",
};

const MoodCheck = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [loading, setLoading] = useState(false);
  const [valence, setValence] = useState(5);
  const [arousal, setArousal] = useState(5);
  const [result, setResult] = useState<{ valence: number; arousal: number; quadrant: string } | null>(null);

  const quadrant = getQuadrantFromValues(valence, arousal);
  const colors = quadrantColors[quadrant];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await moodService.logAffect({
        affect_valence: valence,
        affect_arousal: arousal,
        log_date: getTodayDateString(),
      });
      
      setResult({
        valence: response.data.affect_valence,
        arousal: response.data.affect_arousal,
        quadrant: response.data.affect_quadrant,
      });
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
    markToolComplete('affect');
    navigate('/weekly-tools');
  };

  const renderForm = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-xl font-bold text-gray-900 mb-1 font-[var(--font-display)]">Mood Check</h2>
      <p className="text-sm text-gray-500 mb-6">How are you feeling right now?</p>

      <div className={cn('rounded-xl p-5 mb-6 text-center', colors.bg)}>
        <p className={`text-2xl font-bold ${colors.text}`}>{quadrant}</p>
        <p className="text-sm text-gray-600 mt-1">Valence {valence} • Arousal {arousal}</p>
      </div>

      <div className="rounded-xl border border-gray-200 p-4 mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-2">How positive do you feel?</label>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Very negative</span>
          <input
            type="range"
            min="1"
            max="10"
            value={valence}
            onChange={(e) => setValence(parseInt(e.target.value))}
            className="flex-1 h-2 appearance-none rounded-lg cursor-pointer"
            style={{ accentColor: TEAL_PRIMARY }}
          />
          <span className="text-xs text-gray-500">Very positive</span>
        </div>
        <div className="text-center font-bold text-lg" style={{ color: TEAL_PRIMARY }}>{valence}/10</div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">How energised do you feel?</label>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Calm / sleepy</span>
          <input
            type="range"
            min="1"
            max="10"
            value={arousal}
            onChange={(e) => setArousal(parseInt(e.target.value))}
            className="flex-1 h-2 appearance-none rounded-lg cursor-pointer"
            style={{ accentColor: PURPLE }}
          />
          <span className="text-xs text-gray-500">Excited / alert</span>
        </div>
        <div className="text-center font-bold text-lg" style={{ color: PURPLE }}>{arousal}/10</div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-12 rounded-xl text-white font-semibold"
        style={{ backgroundColor: TEAL_PRIMARY }}
      >
        {loading ? 'Saving...' : 'Save Mood'}
      </Button>
    </motion.div>
  );

  const renderResults = () => {
    if (!result) return null;
    
    const resultColors = quadrantColors[result.quadrant];
    
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={cn('rounded-xl p-6 mb-6 text-center', resultColors.bg)}>
          <p className="text-3xl font-bold mb-2" style={{ color: resultColors.text.replace('text-', '') }}>
            {result.quadrant}
          </p>
          <p className="text-gray-600">Valence {result.valence}/10 • Arousal {result.arousal}/10</p>
        </div>

        <div className="rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            {interpretations[result.quadrant]}
          </p>
        </div>

        <Button
          onClick={handleDone}
          className="w-full h-12 rounded-xl text-white font-semibold"
          style={{ backgroundColor: TEAL_PRIMARY }}
        >
          Done
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: PURPLE }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/weekly-tools')} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Mood Check</h1>
        </div>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {step === 'form' ? renderForm() : renderResults()}
      </div>
    </div>
  );
};

import { cn } from "@/lib/utils";
export default MoodCheck;