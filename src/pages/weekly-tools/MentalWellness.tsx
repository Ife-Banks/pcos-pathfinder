import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/services/apiClient";
import { getTodayDateString } from "@/utils/weekUtils";

const triggerMoodPredictions = async () => {
  await Promise.allSettled([
    apiClient.post('/mood/predict/mental-health'),
    apiClient.post('/mood/predict/metabolic'),
    apiClient.post('/mood/predict/cardio-neuro'),
    apiClient.post('/mood/predict/reproductive'),
  ]);
};

const TEAL_PRIMARY = '#00897B';

const optionLabels = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

const MentalWellness = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null]);

  const handleAnswer = (questionIndex: number, value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  };

  const allAnswered = answers.every((a) => a !== null);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await apiClient.post('/mood/log/phq4', {
        phq4_item1: answers[0],
        phq4_item2: answers[1],
        phq4_item3: answers[2],
        phq4_item4: answers[3],
        log_date: getTodayDateString(),
      });

      toast({ title: 'PHQ-4 logged successfully', variant: 'default' });
      triggerMoodPredictions();
      setTimeout(() => navigate('/risk-score'), 1000);

    } catch (err: unknown) {
      toast({ title: 'Could not save. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
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
              <p className="text-sm font-medium text-gray-600 mb-4">4. In the last week, how often have you felt down, depressed, or hopeless?</p>
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
            {loading ? 'Saving...' : 'Save & View Results'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MentalWellness;
