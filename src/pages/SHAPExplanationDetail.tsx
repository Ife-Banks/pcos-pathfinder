import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, Info, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { predictionService, SHAPFeature, PredictionRecord } from "@/services/predictionService";

const TEAL = '#00897B';

const SHAPExplanationDetail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<SHAPFeature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const storedId = localStorage.getItem('latest_prediction_id');

      if (storedId) {
        setPredictionId(storedId);
        const featuresRes = await predictionService.getFeatures(storedId);
        setFeatures(featuresRes.data.features ?? []);
        return;
      }

      const latestRes = await predictionService.getLatest();
      const id = latestRes.data.id;
      localStorage.setItem('latest_prediction_id', id);
      setPredictionId(id);
      const featuresRes = await predictionService.getFeatures(id);
      setFeatures(featuresRes.data.features ?? []);
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return;
      }
      setError('Detailed breakdown not available for this prediction.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const sortedFeatures = [...(features ?? [])].sort(
    (a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)
  );

  const formatValue = (feature: SHAPFeature) => {
    const val = feature.value;
    if (feature.unit === '/36') return `${val}/36`;
    if (feature.unit === '/12') return `${val}/12`;
    if (feature.unit === '/10') return `${val}/10`;
    if (feature.unit === 'kg/m²') return `${val} kg/m²`;
    if (feature.unit === 'µIU/mL') return `${val} µIU/mL`;
    if (feature.unit === '%') return `${val}%`;
    if (feature.unit) return `${val} ${feature.unit}`;
    return String(val);
  };

  const getDeltaDisplay = (feature: SHAPFeature) => {
    if (feature.vs_last_week) {
      const { delta, direction } = feature.vs_last_week;
      if (direction === 'stable') return { text: 'No change', color: 'text-gray-400', icon: null };
      return {
        text: `${delta >= 0 ? '+' : ''}${delta.toFixed(2)} vs last wk`,
        color: direction === 'up' ? '#E74C3C' : TEAL,
        icon: direction === 'up' ? '↗' : '↘',
      };
    }
    return { text: '—', color: 'text-gray-400', icon: null };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-gray-900">Score Breakdown</h1>
            <p className="text-xs text-gray-500">SHAP feature contributions</p>
          </div>
        </header>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div>
                    <div className="h-4 bg-gray-100 rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-12" />
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || features.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-gray-900">Score Breakdown</h1>
            <p className="text-xs text-gray-500">SHAP feature contributions</p>
          </div>
        </header>
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Detailed breakdown not available</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            {error || 'Complete more check-ins to generate feature-level insights.'}
          </p>
          <Button
            onClick={() => navigate('/risk-score')}
            className="mt-6 rounded-xl text-white"
            style={{ backgroundColor: TEAL }}
          >
            Back to Risk Score
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-gray-900">Score Breakdown</h1>
          <p className="text-xs text-gray-500">SHAP feature contributions</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#E74C3C]" /> Increases risk
          </span>
          <span className="flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" style={{ color: TEAL }} /> Decreases risk
          </span>
        </div>

        <div className="space-y-2.5">
          {sortedFeatures.map((feature, i) => {
            const isPositive = feature.direction === 'increases_risk';
            const delta = getDeltaDisplay(feature);

            return (
              <motion.div
                key={feature.feature_key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border border-gray-200">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: isPositive ? '#FEE2E2' : '#E0F2F1' }}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-4 h-4 text-[#E74C3C]" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" style={{ color: TEAL }} />
                          )}
                        </div>
                        <div>
                          <p className="font-display font-semibold text-sm text-gray-900">{feature.display_name}</p>
                          <p className="text-xs text-gray-500">{formatValue(feature)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-sm font-bold font-display"
                          style={{ color: isPositive ? '#E74C3C' : TEAL }}
                        >
                          {feature.shap_value >= 0 ? '+' : ''}{feature.shap_value.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-0.5 justify-end mt-0.5">
                          {delta.icon === '↗' && <ArrowUpRight className="w-3 h-3 text-[#E74C3C]" />}
                          {delta.icon === '↘' && <ArrowDownRight className="w-3 h-3" style={{ color: TEAL }} />}
                          {delta.icon === null && <Minus className="w-3 h-3 text-gray-400" />}
                          <span className="text-xs" style={{ color: delta.color }}>
                            {delta.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(Math.abs(feature.shap_value) * 500, 100)}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                        style={{ backgroundColor: isPositive ? '#E74C3C' : TEAL }}
                      />
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">{feature.explanation}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-gray-100 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            SHAP values show how each feature pushes the score up or down from a baseline. Larger bars = stronger contribution.
            Week-over-week changes highlight what shifted since your last assessment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SHAPExplanationDetail;
