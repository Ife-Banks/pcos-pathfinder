import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, Info, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { hairPatternService, HairPatternSubmission } from "@/services/mfgService";
import { cn } from "@/lib/utils";

const TEAL_PRIMARY = '#00897B';

const ZONES = [
  { key: 'hair_upper_lip', label: 'Upper Lip / Mustache', helper: 'Above the lip, below the nose' },
  { key: 'hair_chin', label: 'Chin / Beard', helper: 'Chin, jawline and full beard area' },
  { key: 'hair_chest', label: 'Chest', helper: 'Across the chest and around the nipples' },
  { key: 'hair_upper_abdomen', label: 'Upper Abdomen', helper: 'Above the navel' },
  { key: 'hair_lower_abdomen', label: 'Lower Abdomen', helper: 'Below the navel' },
  { key: 'hair_upper_arm', label: 'Upper Arm', helper: 'Shoulders to elbows' },
  { key: 'hair_thigh', label: 'Thigh', helper: 'Upper inner and outer thighs' },
  { key: 'hair_upper_back', label: 'Upper Back', helper: 'Upper back and shoulders' },
  { key: 'hair_lower_back', label: 'Lower Back', helper: 'Lower back and buttocks' },
] as const;

const SCALES = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Scattered' },
  { value: 2, label: 'Mild' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Dense' },
];

const AndrogenicHairPatternMale = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [result, setResult] = useState<any>(null);

  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(ZONES.map(z => [z.key, 0]))
  );

  const [includeOptional, setIncludeOptional] = useState(false);
  const [scalpNorwood, setScalpNorwood] = useState<number | null>(null);
  const [axillary, setAxillary] = useState<number>(0);
  const [pubic, setPubic] = useState<number>(0);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: HairPatternSubmission = {
        assessed_date: new Date().toISOString().slice(0, 10),
        ...(scores as unknown as Omit<HairPatternSubmission, 'assessed_date'>),
      };
      if (includeOptional) {
        payload.scalp_hamilton_norwood = scalpNorwood;
        payload.hair_axillary = axillary;
        payload.hair_pubic = pubic;
      }

      const res = await hairPatternService.submit(payload);
      setResult(res.data);
      setStep('done');
    } catch (err: any) {
      toast({
        title: "Error saving data",
        description: err?.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderTrendBadge = (trend: string) => {
    switch (trend) {
      case 'Decreasing':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Decreasing</span>;
      case 'Increasing':
        return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">Increasing</span>;
      case 'Stable':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Stable</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">Setting baseline</span>;
    }
  };

  if (step === 'done' && result) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hair Pattern Logged</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6 text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total Score (9 zones)</span>
              <span className="text-2xl font-bold text-teal-700">{result.total_score}/36</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-gray-100">
              <span className="text-gray-600">Trend Status</span>
              {renderTrendBadge(result.trend_label)}
            </div>
            {result.baseline_score !== null && (
              <div className="flex justify-between items-center py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">Your Baseline</span>
                <span className="font-medium text-gray-700">{result.baseline_score}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-4 text-center">
              A sustained drop in body or facial hair from your baseline can accompany low testosterone.
            </p>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full h-12 mt-8 rounded-xl text-white font-semibold"
            style={{ backgroundColor: TEAL_PRIMARY }}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 text-white/80 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-white">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5" /> Androgenic Hair Pattern
            </h1>
            <p className="text-sm text-white/70">Weekly tracking</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto pb-24">
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex gap-3 items-start">
          <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <p className="text-sm text-teal-800">
            Rate hair growth in each body zone from 0 (none) to 4 (dense) to track your personal androgen-related hair pattern over time.
          </p>
        </div>

        <div className="space-y-6">
          {ZONES.map((zone) => (
            <div key={zone.key} className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="font-semibold text-gray-800 mb-1">{zone.label}</p>
              <p className="text-xs text-gray-500 mb-4">{zone.helper}</p>
              
              <div className="flex justify-between items-center gap-2">
                {SCALES.map((scale) => (
                  <button
                    key={scale.value}
                    onClick={() => setScores(s => ({ ...s, [zone.key]: scale.value }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-lg flex-1 border transition-all",
                      scores[zone.key] === scale.value 
                        ? "border-teal-500 bg-teal-50 text-teal-700" 
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-teal-200"
                    )}
                  >
                    <span className="text-lg font-bold">{scale.value}</span>
                    <span className="text-[10px] leading-tight text-center">{scale.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-700">Optional: Scalp, Axillary & Pubic</p>
            </div>
            <input
              type="checkbox"
              checked={includeOptional}
              onChange={(e) => setIncludeOptional(e.target.checked)}
              className="w-5 h-5"
              style={{ accentColor: TEAL_PRIMARY }}
            />
          </label>

          {includeOptional && (
            <div className="mt-6 space-y-6">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Scalp (Male Pattern Hair Loss)</p>
                <p className="text-xs text-gray-500 mb-3">Hamilton-Norwood Scale (1-7)</p>
                <div className="flex flex-wrap gap-2">
                  {[1,2,3,4,5,6,7].map(v => (
                    <button
                      key={v}
                      onClick={() => setScalpNorwood(v)}
                      className={cn(
                        "w-10 h-10 rounded-full border text-sm font-medium transition-all",
                        scalpNorwood === v ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-300"
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 z-10 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Score</p>
            <p className="text-2xl font-bold text-gray-900">{totalScore}<span className="text-gray-400 text-lg">/36</span></p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-48 h-12 rounded-xl text-white font-semibold"
            style={{ backgroundColor: TEAL_PRIMARY }}
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Log'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AndrogenicHairPatternMale;