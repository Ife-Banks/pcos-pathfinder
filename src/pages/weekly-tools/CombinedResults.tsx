import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { moodService, PredictionResponse } from "@/services/moodService";
import { predictionService } from "@/services/predictionService";

const TEAL_PRIMARY = '#00897B';

interface GroupPrediction {
  mentalHealth: PredictionResponse | null;
  metabolic: PredictionResponse | null;
  cardioNeuro: PredictionResponse | null;
  reproductive: PredictionResponse | null;
  errors: Record<string, string>;
}

const diseaseLabels: Record<string, string> = {
  Anxiety: 'Anxiety Disorder',
  Depression: 'Depression',
  PMDD: 'PMDD',
  ChronicStress: 'Chronic Stress',
  T2D_Mood: 'Type 2 Diabetes',
  MetSyn_Mood: 'Metabolic Syndrome',
  CVD_Mood: 'Cardiovascular Disease',
  Stroke_Mood: 'Stroke Risk',
  Infertility_Mood: 'Infertility Risk',
};

const severityColors: Record<string, string> = {
  Minimal: '#27AE60',
  Mild: '#F39C12',
  Moderate: '#E67E22',
  Severe: '#E74C3C',
  Extreme: '#922B21',
};

const CombinedResults = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<GroupPrediction>({
    mentalHealth: null,
    metabolic: null,
    cardioNeuro: null,
    reproductive: null,
    errors: {},
  });

  const fetchPredictions = async () => {
    setLoading(true);
    const newErrors: Record<string, string> = {};
    
    try {
      const [mentalHealth, metabolic, cardioNeuro, reproductive] = await Promise.allSettled([
        moodService.predictMentalHealth(),
        moodService.predictMetabolic(),
        moodService.predictCardioNeuro(),
        moodService.predictReproductive(),
      ]);

      const mentalHealthData = mentalHealth.status === 'fulfilled' ? mentalHealth.value : null;
      
      setPredictions({
        mentalHealth: mentalHealthData,
        metabolic: metabolic.status === 'fulfilled' ? metabolic.value : null,
        cardioNeuro: cardioNeuro.status === 'fulfilled' ? cardioNeuro.value : null,
        reproductive: reproductive.status === 'fulfilled' ? reproductive.value : null,
        errors: newErrors,
      });

      if (mentalHealthData && mentalHealthData.data?.predictions) {
        try {
          await predictionService.escalateMood(mentalHealthData.data.predictions);
        } catch (escalateErr) {
          console.warn('Mood escalation check failed:', escalateErr);
        }
      }
    } catch (err: any) {
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleRetry = async (endpoint: keyof Omit<GroupPrediction, 'errors'>) => {
    setLoading(true);
    try {
      let result;
      switch (endpoint) {
        case 'mentalHealth':
          result = await moodService.predictMentalHealth();
          break;
        case 'metabolic':
          result = await moodService.predictMetabolic();
          break;
        case 'cardioNeuro':
          result = await moodService.predictCardioNeuro();
          break;
        case 'reproductive':
          result = await moodService.predictReproductive();
          break;
      }
      setPredictions(prev => ({ ...prev, [endpoint]: result }));
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to fetch predictions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderPredictionGroup = (
    title: string,
    data: PredictionResponse | null,
    diseases: string[],
    endpoint: keyof Omit<GroupPrediction, 'errors'>
  ) => {
    if (!data) {
      return (
        <div className="rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-gray-500 mb-4">Predictions unavailable</p>
          <Button variant="outline" size="sm" onClick={() => handleRetry(endpoint)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    const isInsufficient = data.message === 'INSUFFICIENT_DATA';
    if (isInsufficient) {
      const daysLogged = data.data?.days_logged || 0;
      return (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">More data needed</h3>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Complete your weekly check-ins for at least 3 days to unlock mood risk predictions.
          </p>
          <p className="text-sm font-medium text-blue-800">{daysLogged} days logged so far</p>
        </div>
      );
    }

    const sortedDiseases = [...diseases].sort((a, b) => {
      const scoreA = data.data.predictions[a]?.risk_score || 0;
      const scoreB = data.data.predictions[b]?.risk_score || 0;
      return scoreB - scoreA;
    });

    return (
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-purple-50">
              <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">Disease</th>
              <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700">Risk Score</th>
              <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700">Severity</th>
            </tr>
          </thead>
          <tbody>
            {sortedDiseases.map((disease, idx) => {
              const pred = data.data.predictions[disease];
              if (!pred) return null;
              
              const isFlagged = pred.risk_flag === 1;
              const displayName = diseaseLabels[disease] || disease;
              
              return (
                <tr key={disease} className={cn(idx % 2 === 0 ? 'bg-white' : 'bg-gray-50', isFlagged && 'bg-red-50')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isFlagged && <span>🚩</span>}
                      <span className={cn('font-medium', isFlagged && 'text-red-700')}>
                        {displayName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="font-medium text-gray-900">{(pred.risk_score * 100).toFixed(1)}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 max-w-[80px] mx-auto">
                      <div className="h-1.5 rounded-full" style={{ width: `${pred.risk_score * 100}%`, backgroundColor: severityColors[pred.severity] }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: severityColors[pred.severity] }}>
                      {pred.severity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const getHighestRisk = () => {
    const allPredictions = [
      predictions.mentalHealth?.data.predictions,
      predictions.metabolic?.data.predictions,
      predictions.cardioNeuro?.data.predictions,
      predictions.reproductive?.data.predictions,
    ].filter(Boolean);

    let highestRisk: { name: string; severity: string; flag: number } | null = null;

    for (const preds of allPredictions) {
      if (!preds) continue;
      for (const [key, pred] of Object.entries(preds)) {
        if (pred.risk_flag === 1 && (!highestRisk || pred.risk_score > (highestRisk as any).score)) {
          highestRisk = { name: key, severity: pred.severity, flag: pred.risk_score };
        }
      }
    }

    return highestRisk;
  };

  const highestRisk = getHighestRisk();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/weekly-tools')} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Mood & Cognitive Risk Analysis</h1>
        </div>
        <p className="text-white/70 text-sm ml-8 mt-1">Based on this week's mental health check-ins</p>
      </div>

      <div className="px-6 py-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {highestRisk ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="font-semibold text-amber-800">
                    Elevated risk detected: {diseaseLabels[highestRisk.name] || highestRisk.name} — {highestRisk.severity}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="font-semibold text-green-800">
                    No significant risk flags detected this week
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {renderPredictionGroup('Mental Health', predictions.mentalHealth, ['Anxiety', 'Depression', 'PMDD', 'ChronicStress'], 'mentalHealth')}
              {renderPredictionGroup('Metabolic Health', predictions.metabolic, ['T2D_Mood', 'MetSyn_Mood'], 'metabolic')}
              {renderPredictionGroup('Cardiovascular & Neurological', predictions.cardioNeuro, ['CVD_Mood', 'Stroke_Mood'], 'cardioNeuro')}
              {renderPredictionGroup('Reproductive Health', predictions.reproductive, ['Infertility_Mood'], 'reproductive')}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={() => navigate('/weekly-tools')} className="flex-1 h-12 rounded-xl">
                Back to Weekly Tools
              </Button>
              <Button onClick={() => navigate('/dashboard')} className="flex-1 h-12 rounded-xl text-white font-semibold" style={{ backgroundColor: TEAL_PRIMARY }}>
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CombinedResults;