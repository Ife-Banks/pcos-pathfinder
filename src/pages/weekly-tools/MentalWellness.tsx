import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { moodService } from "@/services/moodService";
import { markToolComplete, getTodayDateString } from "@/utils/weekUtils";

const TEAL_PRIMARY = '#00897B';

const optionLabels = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

const MentalWellness = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<number[]>([0, 0, 0, 0]);
  const [result, setResult] = useState<{ anxiety: number; depression: number; total: number } | null>(null);

  const handleAnswer = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const allAnswered = answers.every((a) => a >= 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await moodService.logPHQ4({
        phq4_item1: answers[0],
        phq4_item2: answers[1],
        phq4_item3: answers[2],
        phq4_item4: answers[3],
        log_date: getTodayDateString(),
      });
      
      setResult({
        anxiety: response.data.phq4_anxiety_score,
        depression: response.data.phq4_depression_score,
        total: response.data.phq4_total,
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
    markToolComplete('phq4');
    navigate('/weekly-tools');
  };

  const getStatusBadge = (total: number) => {
    if (total <= 2) return { label: 'Normal', color: '#27AE60', bg: 'bg-green-100' };
    if (total <= 5) return { label: 'Mild', color: '#F59E0B', bg: 'bg-amber-100' };
    if (total <= 8) return { label: 'Moderate', color: '#E67E22', bg: 'bg-orange-100' };
    return { label: 'Severe', color: '#E74C3C', bg: 'bg-red-100' };
  };

  const getAnxietyStatus = (score: number) => {
    return score < 3 ? { label: 'Normal', color: '#27AE60' } : { label: 'Elevated', color: '#E74C3C' };
  };

  const getDepressionStatus = (score: number) => {
    return score < 3 ? { label: 'Normal', color: '#27AE60' } : { label: 'Elevated', color: '#E74C3C' };
  };

  const renderForm = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-1 font-[var(--font-display)]">Mental Wellness</h2>
      <p className="text-sm text-gray-500 mb-6">How have you been feeling this week?</p>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-6">
        <p className="text-xs text-amber-800">
          Over the last week, how often have you been bothered by the following problems?
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3" style={{ color: TEAL_PRIMARY }}>
            GAD-2 Anxiety
          </p>
          <p className="text-sm text-gray-600 mb-4">1. In the last week, how often have you felt nervous, anxious, or on edge?</p>
          <div className="grid grid-cols-2 gap-2">
            {optionLabels.map((label, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(0, idx)}
                className={cn(
                  'p-3 rounded-lg border text-sm font-medium transition-all',
                  answers[0] === idx
                    ? 'border-transparent text-white'
                    : 'border-gray-200 text-gray-700 bg-white'
                )}
                style={answers[0] === idx ? { backgroundColor: TEAL_PRIMARY } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600 mb-4">2. In the last week, how often have you been unable to stop or control worrying?</p>
          <div className="grid grid-cols-2 gap-2">
            {optionLabels.map((label, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(1, idx)}
                className={cn(
                  'p-3 rounded-lg border text-sm font-medium transition-all',
                  answers[1] === idx
                    ? 'border-transparent text-white'
                    : 'border-gray-200 text-gray-700 bg-white'
                )}
                style={answers[1] === idx ? { backgroundColor: TEAL_PRIMARY } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3" style={{ color: '#7C3AED' }}>
            PHQ-2 Depression
          </p>
          <p className="text-sm text-gray-600 mb-4">3. In the last week, how often have you had little interest or pleasure in doing things?</p>
          <div className="grid grid-cols-2 gap-2">
            {optionLabels.map((label, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(2, idx)}
                className={cn(
                  'p-3 rounded-lg border text-sm font-medium transition-all',
                  answers[2] === idx
                    ? 'border-transparent text-white'
                    : 'border-gray-200 text-gray-700 bg-white'
                )}
                style={answers[2] === idx ? { backgroundColor: '#7C3AED' } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-4">4. In the last week, how often have you felt down, depressed, or hopeless?</p>
          <div className="grid grid-cols-2 gap-2">
            {optionLabels.map((label, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(3, idx)}
                className={cn(
                  'p-3 rounded-lg border text-sm font-medium transition-all',
                  answers[3] === idx
                    ? 'border-transparent text-white'
                    : 'border-gray-200 text-gray-700 bg-white'
                )}
                style={answers[3] === idx ? { backgroundColor: '#7C3AED' } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!allAnswered || loading}
        className="w-full mt-6 h-12 rounded-xl text-white font-semibold"
        style={{ backgroundColor: TEAL_PRIMARY }}
      >
        {loading ? 'Saving...' : 'View Results'}
      </Button>
    </motion.div>
  );

  const renderResults = () => {
    if (!result) return null;
    
    const status = getStatusBadge(result.total);
    const anxietyStatus = getAnxietyStatus(result.anxiety);
    const depressionStatus = getDepressionStatus(result.depression);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
            style={{ backgroundColor: `${status.color}20` }}
          >
            <span className="text-4xl font-bold" style={{ color: status.color }}>
              {result.total}
            </span>
          </div>
          <p className="text-gray-500 text-sm">out of 12</p>
          <span
            className={cn('inline-block px-3 py-1 rounded-full text-sm font-medium mt-2', status.bg)}
            style={{ color: status.color }}
          >
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">GAD-2 Anxiety</p>
            <p className="text-2xl font-bold text-gray-900">{result.anxiety}/6</p>
            <span className="text-sm font-medium" style={{ color: anxietyStatus.color }}>
              {anxietyStatus.label}
            </span>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">PHQ-2 Depression</p>
            <p className="text-2xl font-bold text-gray-900">{result.depression}/6</p>
            <span className="text-sm font-medium" style={{ color: depressionStatus.color }}>
              {depressionStatus.label}
            </span>
          </div>
        </div>

        {result.total >= 6 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
            <p className="text-sm text-amber-800">
              Your score suggests moderate to significant mental health burden. Consider speaking with a healthcare professional.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('form')} className="flex-1 h-12 rounded-xl">
            Edit Answers
          </Button>
          <Button onClick={handleDone} className="flex-1 h-12 rounded-xl text-white font-semibold" style={{ backgroundColor: TEAL_PRIMARY }}>
            Done
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/weekly-tools')} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Mental Wellness</h1>
        </div>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {step === 'form' ? renderForm() : renderResults()}
      </div>
    </div>
  );
};

export default MentalWellness;