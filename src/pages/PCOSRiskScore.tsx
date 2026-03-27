import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Info,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { predictionService, PredictionRecord, SHAPDriver, DiseasePrediction, ComprehensivePrediction } from "@/services/predictionService";
import { toast } from "@/hooks/use-toast";

const TEAL = '#00897B';

interface TierConfig {
  max: number;
  label: string;
  tierLabel: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  desc: string;
}

const TRIAGE_TIERS: TierConfig[] = [
  { max: 0.25, label: "Low", tierLabel: "Low Risk", icon: ShieldCheck, color: "#27AE60", bg: "bg-green-100", desc: "Your risk is within normal range" },
  { max: 0.5, label: "Moderate", tierLabel: "Moderate Risk", icon: Shield, color: "#F39C12", bg: "bg-amber-100", desc: "Monitor your symptoms closely" },
  { max: 0.75, label: "High", tierLabel: "High Risk", icon: ShieldAlert, color: "#E74C3C", bg: "bg-orange-100", desc: "Consult healthcare provider" },
  { max: 1.01, label: "Critical", tierLabel: "Critical Risk", icon: AlertTriangle, color: "#C0392B", bg: "bg-red-100", desc: "Seek immediate medical attention" },
];

const PCOSRiskScore = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionRecord | null>(null);
  const [comprehensive, setComprehensive] = useState<ComprehensivePrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const safeTierConfig = prediction
    ? (TRIAGE_TIERS.find(t => t.label.toUpperCase() === (prediction.risk_tier ?? '').toUpperCase())
      ?? TRIAGE_TIERS[0])
    : null;

  const fetchComprehensive = useCallback(async () => {
    try {
      const res = await predictionService.getComprehensive();
      const data = res.data;
      setComprehensive(data);
      
      // Also set legacy prediction format for gauge
      setPrediction({
        id: data.id,
        risk_score: data.final_risk_score,
        risk_tier: data.risk_tier,
        computed_at: data.computed_at,
        data_layers_used: data.data_layers_used,
        all_predictions: data.all_predictions,
      });

      localStorage.setItem('latest_prediction_id', data.id);
      localStorage.setItem('latest_risk_tier', data.risk_tier);
      localStorage.setItem('latest_risk_score', String(data.final_risk_score));
    } catch (err: any) {
      console.error('Error fetching comprehensive prediction:', err);
      // Fallback to legacy endpoint
      try {
        const res = await predictionService.getPCOSRiskScore();
        setPrediction(res.data);
      } catch (legacyErr) {
        if (err?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
          return;
        }
        if (err?.status === 404) {
          setPrediction(null);
          setComprehensive(null);
        } else {
          setError('Unable to load data. Please try again.');
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await predictionService.triggerComprehensive();
      await fetchComprehensive();
      toast({ title: 'Success', description: 'Risk assessment updated.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to refresh. Please try again.', variant: 'destructive' });
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComprehensive();
  }, [fetchComprehensive]);

  const score = prediction?.risk_score ?? 0;
  const needleAngle = -90 + score * 180;

  const drivers = prediction?.shap_drivers ?? [];
  const sortedDrivers = [...drivers].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  const maxShap = Math.max(...drivers.map(d => Math.abs(d.shap_value)), 0.01);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-gray-900">PCOS Risk Score</h1>
            <p className="text-xs text-gray-500">AI-powered assessment</p>
          </div>
        </header>
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="flex flex-col items-center">
              <div className="w-56 h-32 bg-gray-100 rounded-full" />
              <div className="h-8 bg-gray-100 rounded w-24 mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-gray-900">PCOS Risk Score</h1>
            <p className="text-xs text-gray-500">AI-powered assessment</p>
          </div>
        </header>
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Score Yet</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Complete your daily check-ins to generate your first PCOS risk score.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="mt-6 rounded-xl text-white"
            style={{ backgroundColor: TEAL }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const TierIcon = safeTierConfig!.icon;

  const modelLabels: Record<string, { name: string; color: string; bg: string; icon: string }> = {
    symptom_intensity: { name: "Symptom Intensity", color: "#00897B", bg: "bg-teal-50", icon: "📝" },
    menstrual: { name: "Menstrual Health", color: "#7C3AED", bg: "bg-purple-50", icon: "🩺" },
    rppg: { name: "rPPG Camera", color: "#2563EB", bg: "bg-blue-50", icon: "📷" },
    mood: { name: "Mood Analysis", color: "#F59E0B", bg: "bg-amber-50", icon: "🧠" },
  };

  const formatDiseaseName = (name: string) => name.replace(/_Mood/g, "").replace(/_/g, " ");

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "minimal": return "#27AE60";
      case "mild": return "#F1C40F";
      case "moderate": return "#F39C12";
      case "severe": return "#E74C3C";
      case "extreme": return "#C0392B";
      default: return "#6B7280";
    }
  };

  const renderModelPredictions = (modelKey: string, predictions: Record<string, DiseasePrediction> | undefined) => {
    if (!predictions || Object.keys(predictions).length === 0) return null;
    const config = modelLabels[modelKey];
    if (!config) return null;

    return (
      <div key={modelKey} className={`${config.bg} rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{config.icon}</span>
          <h3 className="font-display font-semibold text-sm" style={{ color: config.color }}>
            {config.name}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(predictions).slice(0, 6).map(([disease, pred]) => (
            <div key={disease} className="bg-white/80 rounded-lg p-2">
              <p className="text-xs text-gray-600 font-medium truncate">{formatDiseaseName(disease)}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold" style={{ color: getSeverityColor(pred.severity) }}>
                  {(pred.risk_score * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-gray-400">{pred.severity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-gray-900">PCOS Risk Score</h1>
          <p className="text-xs text-gray-500">AI-powered assessment</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="p-1.5 rounded-lg hover:bg-gray-100">
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: TEAL }} />
        </button>
        <button onClick={() => navigate("/risk-trend")} className="p-1.5 rounded-lg hover:bg-gray-100">
          <TrendingUp className="w-5 h-5" style={{ color: TEAL }} />
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Data Sources Section */}
        {comprehensive?.data_sources && comprehensive.data_sources.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Data Sources</h3>
                  <span className="text-xs text-gray-500">{comprehensive.data_completeness_pct}% complete</span>
                </div>
                <div className="space-y-2">
                  {comprehensive.data_sources.map((source) => (
                    <div key={source.layer} className="flex items-center gap-2">
                      <span className="text-base">{source.icon}</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-800">{source.name}</p>
                        <p className="text-[10px] text-gray-500">{source.description}</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                  {/* Show missing layers */}
                  {['symptom', 'menstrual', 'rppg', 'mood'].filter(
                    layer => !comprehensive.data_layers_used?.includes(layer)
                  ).map((layer) => {
                    const labels: Record<string, {name: string, icon: string, desc: string}> = {
                      symptom: { name: 'Symptom Check-ins', icon: '📋', desc: 'Complete daily check-ins' },
                      menstrual: { name: 'Menstrual Tracking', icon: '🩺', desc: 'Log period data' },
                      rppg: { name: 'rPPG / HRV', icon: '❤️', desc: 'Measure heart rate variability' },
                      mood: { name: 'Mood Tracking', icon: '🧠', desc: 'Complete mood assessments' },
                    };
                    const info = labels[layer];
                    return (
                      <div key={layer} className="flex items-center gap-2 opacity-50">
                        <span className="text-base">{info?.icon}</span>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600">{info?.name}</p>
                          <p className="text-[10px] text-gray-400">{info?.desc}</p>
                        </div>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Clinical Flags Section */}
        {comprehensive?.clinical_flags && comprehensive.clinical_flags.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">Clinical Indicators</h3>
                <div className="space-y-2">
                  {comprehensive.clinical_flags.map((flag) => (
                    <div key={flag.flag} className="flex items-start gap-2">
                      <AlertCircle className={`w-4 h-4 mt-0.5 ${flag.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                      <div>
                        <p className="text-xs font-medium text-amber-900">{flag.label}</p>
                        <p className="text-[10px] text-amber-700">{flag.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-red-700">{error}</span>
            <Button size="sm" variant="outline" onClick={fetchPrediction}>Retry</Button>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border border-gray-200">
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <div className="relative w-56 h-32">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  <path d="M 20 100 A 80 80 0 0 1 60 32" fill="none" stroke="#27AE60" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 60 32 A 80 80 0 0 1 100 20" fill="none" stroke="#F39C12" strokeWidth="14" />
                  <path d="M 100 20 A 80 80 0 0 1 140 32" fill="none" stroke="#E67E22" strokeWidth="14" />
                  <path d="M 140 32 A 80 80 0 0 1 180 100" fill="none" stroke="#E74C3C" strokeWidth="14" strokeLinecap="round" />
                  <motion.line
                    x1="100" y1="100" x2="100" y2="35"
                    stroke="#1F2937" strokeWidth="3" strokeLinecap="round"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: needleAngle }}
                    transition={{ type: "spring", stiffness: 40, damping: 12, delay: 0.3 }}
                    style={{ transformOrigin: "100px 100px" }}
                  />
                  <circle cx="100" cy="100" r="6" fill="#1F2937" />
                </svg>
              </div>

              <motion.div
                className="text-center -mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-4xl font-display font-bold text-gray-900">{score.toFixed(2)}</p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <TierIcon className="w-4 h-4" style={{ color: safeTierConfig.color }} />
                  <Badge className="border-0 font-display font-semibold" style={{ backgroundColor: safeTierConfig.bg, color: safeTierConfig.color }}>
                    {safeTierConfig.tierLabel}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{safeTierConfig.desc}</p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* All 4 Models Section */}
        {prediction.all_predictions && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
              Prediction Models
            </h2>
            <div className="space-y-3">
              {renderModelPredictions("symptom_intensity", prediction.all_predictions.symptom_intensity)}
              {renderModelPredictions("menstrual", prediction.all_predictions.menstrual)}
              {renderModelPredictions("rppg", prediction.all_predictions.rppg)}
              {renderModelPredictions("mood", prediction.all_predictions.mood)}
            </div>
            {prediction.data_layers_used && prediction.data_layers_used.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {prediction.data_layers_used.map((layer) => (
                  <span
                    key={layer}
                    className="text-[10px] px-2 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: modelLabels[layer]?.bg || "#F3F4F6",
                      color: modelLabels[layer]?.color || "#6B7280"
                    }}
                  >
                    {modelLabels[layer]?.icon} {modelLabels[layer]?.name || layer}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {sortedDrivers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">
                Contributing Factors
              </h2>
              <button
                onClick={() => navigate("/shap-detail")}
                className="text-xs font-semibold flex items-center gap-0.5"
                style={{ color: TEAL }}
              >
                Details <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <Card className="border border-gray-200">
              <CardContent className="p-4 space-y-3">
                {sortedDrivers.map((f, i) => (
                  <motion.div
                    key={f.feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{f.display_name}</span>
                      <span
                        className="text-sm font-bold font-display"
                        style={{ color: f.direction === 'increases_risk' ? '#E74C3C' : TEAL }}
                      >
                        {f.shap_value >= 0 ? '+' : ''}{f.shap_value.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(Math.abs(f.shap_value) / maxShap) * 100}%` }}
                          transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                          style={{ backgroundColor: f.direction === 'increases_risk' ? '#E74C3C' : TEAL }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {sortedDrivers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h2 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
              What This Means
            </h2>
            <div className="space-y-2">
              {sortedDrivers.map((f, i) => (
                <Card key={f.feature} className="border border-gray-200 shadow-none">
                  <CardContent className="p-3 flex gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{
                        backgroundColor: f.direction === 'increases_risk' ? '#FEE2E2' : '#E0F2F1',
                        color: f.direction === 'increases_risk' ? '#E74C3C' : TEAL,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 font-display">{f.display_name}</p>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{f.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        <div className="bg-gray-100 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            This score is generated by a machine learning model and is for informational purposes only.
            Always consult your healthcare provider for diagnosis and treatment decisions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl border-gray-300"
            onClick={() => navigate("/risk-trend")}
          >
            View Trend
          </Button>
          <Button
            className="rounded-xl text-white"
            size="lg"
            style={{ backgroundColor: TEAL }}
            onClick={() => navigate("/shap-detail")}
          >
            Full Breakdown
          </Button>
        </div>

        {(prediction.risk_tier === 'High' || prediction.risk_tier === 'Critical') && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button
              variant="outline"
              size="lg"
              className="w-full mb-4 rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() => navigate("/referral")}
            >
              View Clinical Referral Recommendation
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PCOSRiskScore;
