import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Activity, Heart, Thermometer, Droplets, BarChart3, TrendingUp, Brain, Moon, AlertTriangle, Shield, Clock, Sparkles } from 'lucide-react';
import { rppgV8Service, RppgV8Session, RppgV8PredictAllResult } from '@/services/rppgV8Service';

const TEAL_PRIMARY = '#00897B';

const getSeverityColor = (score: number): string => {
  if (score >= 0.7) return '#ef4444';
  if (score >= 0.5) return '#f97316';
  if (score >= 0.3) return '#eab308';
  return '#22c55e';
};

const getPositiveColor = (value: number): string => {
  if (value >= 70) return '#22c55e';
  if (value >= 50) return '#eab308';
  return '#ef4444';
};

const isRiskTarget = (target: string): boolean => {
  const t = target.toLowerCase();
  return t.includes('risk') || t.includes('stress') || t.includes('failure') || t.includes('syndrome');
};

const getSeverityLabel = (score: number): string => {
  if (score >= 0.7) return 'High';
  if (score >= 0.5) return 'Moderate';
  if (score >= 0.3) return 'Mild';
  return 'Low';
};

const getRegressionInterpretation = (target: string, value: number): string => {
  const t = target.toLowerCase();
  if (t.includes('sleep_quality')) {
    if (value >= 70) return 'Good sleep quality';
    if (value >= 50) return 'Moderate — room for improvement';
    return 'Poor — consider sleep hygiene';
  }
  if (t.includes('focus_memory')) {
    if (value >= 70) return 'Sharp focus & memory';
    if (value >= 50) return 'Moderate cognitive function';
    return 'Below average — stress may be impacting focus';
  }
  if (t.includes('mental_wellness')) {
    if (value >= 70) return 'Good mental wellness';
    if (value >= 50) return 'Moderate — monitor stress levels';
    return 'Needs attention — consider wellness activities';
  }
  if (t.includes('mood_score')) {
    if (value >= 70) return 'Good mood stability';
    if (value >= 50) return 'Moderate mood';
    return 'Mood may be affected — check in with yourself';
  }
  if (t.includes('metabolic_syndrome')) {
    if (value >= 60) return 'Elevated risk — monitor closely';
    if (value >= 40) return 'Mild risk — maintain healthy habits';
    return 'Low risk — keep it up';
  }
  if (t.includes('t2d') || t.includes('metabolic_risk')) {
    if (value >= 60) return 'Elevated metabolic risk';
    if (value >= 40) return 'Mild risk — stay active';
    return 'Low risk';
  }
  if (t.includes('cardiovascular')) {
    if (value >= 60) return 'Elevated cardiovascular risk';
    if (value >= 40) return 'Mild risk — HRV supports heart health';
    return 'Low risk — good cardiac markers';
  }
  if (t.includes('heart_failure')) {
    if (value >= 60) return 'Elevated alert — consult a doctor';
    if (value >= 40) return 'Mild concern — monitor symptoms';
    return 'Low risk — no alerts';
  }
  if (t.includes('chronic_stress')) {
    if (value >= 60) return 'High stress — prioritise rest';
    if (value >= 40) return 'Mild stress — some recovery needed';
    return 'Low stress — well regulated';
  }
  if (t.includes('infertility') || t.includes('reproductive')) {
    if (value >= 60) return 'Elevated reproductive risk';
    if (value >= 40) return 'Moderate — monitor cycle patterns';
    return 'Low risk — reproductive health stable';
  }
  return '';
};

const formatTimeRemaining = (ms: number): string => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const RppgPassiveSensing = () => {
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<RppgV8Session[]>([]);
  const [predictions, setPredictions] = useState<RppgV8PredictAllResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCaptureAt, setNextCaptureAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      localStorage.removeItem('nextRppgV8CaptureAt');
      localStorage.removeItem('nextRppgCaptureAt');
    } else {
      const stored = localStorage.getItem('nextRppgV8CaptureAt');
      if (stored) {
        const ts = parseInt(stored, 10);
        if (ts > Date.now()) {
          setNextCaptureAt(ts);
        } else {
          localStorage.removeItem('nextRppgV8CaptureAt');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!nextCaptureAt) return;
    const update = () => {
      const remaining = nextCaptureAt - Date.now();
      if (remaining <= 0) {
        setTimeRemaining('Ready');
        localStorage.removeItem('nextRppgV8CaptureAt');
        setNextCaptureAt(null);
      } else {
        setTimeRemaining(formatTimeRemaining(remaining));
      }
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [nextCaptureAt]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, predRes] = await Promise.allSettled([
        rppgV8Service.getSessions(),
        rppgV8Service.predictAll().catch((e) => { console.error('[RppgPassive] predictAll failed:', e); return null; }),
      ]);
      if (sessionsRes.status === 'fulfilled') {
        const raw = sessionsRes.value.data;
        setSessions(raw.sessions);
      }
      if (predRes.status === 'fulfilled' && predRes.value) {
        setPredictions(predRes.value.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Today's averages from most recent sessions
  const todaySessions = sessions.filter(s => {
    const d = new Date(s.capturedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const avg = (field: keyof RppgV8Session, decimals = 1): string => {
    if (!todaySessions.length) return '--';
    const vals = todaySessions.map(s => s[field]).filter((v): v is number => v !== null && v !== undefined);
    if (!vals.length) return '--';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(decimals);
  };

  const latestSession = sessions.length > 0 ? sessions[0] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Passive Sensing</h1>
        </div>
        <p className="text-white/70 text-sm ml-8 mt-1">rPPG v8 — Autonomic health monitoring</p>
      </div>

      <div className="px-6 py-6 max-w-md mx-auto space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {/* Status Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: TEAL_PRIMARY }} />
              <h2 className="font-semibold text-gray-900">Capture Status</h2>
            </div>
            {nextCaptureAt ? (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Next in {timeRemaining}</span>
            ) : (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Ready</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/rppg-v8-capture')}
              className="flex-1 h-11 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: TEAL_PRIMARY }}
              disabled={!!nextCaptureAt && Date.now() < nextCaptureAt}
            >
              <Camera className="w-4 h-4 mr-2" />
              {nextCaptureAt && Date.now() < nextCaptureAt ? 'Waiting...' : 'Start Capture'}
            </Button>
            <Button
              variant="outline"
              onClick={fetchData}
              className="h-11 rounded-xl text-sm"
              disabled={loading}
            >
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Today's Averages */}
            {todaySessions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" style={{ color: TEAL_PRIMARY }} />
                  Today's Averages ({todaySessions.length} session{todaySessions.length > 1 ? 's' : ''})
                </h2>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">HR</p>
                    <p className="text-lg font-bold text-gray-900">{avg('heartRate', 0)}</p>
                    <p className="text-xs text-gray-400">bpm</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">RMSSD</p>
                    <p className="text-lg font-bold text-gray-900">{avg('rmssd', 1)}</p>
                    <p className="text-xs text-gray-400">ms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">HRV</p>
                    <p className="text-lg font-bold text-gray-900">{avg('hrv', 1)}</p>
                    <p className="text-xs text-gray-400">ms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">SpO₂</p>
                    <p className="text-lg font-bold text-gray-900">{avg('estimatedSpO2', 0)}</p>
                    <p className="text-xs text-gray-400">%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Temp</p>
                    <p className="text-lg font-bold text-gray-900">{avg('skinTemperature', 1)}</p>
                    <p className="text-xs text-gray-400">°C</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">EDA</p>
                    <p className="text-lg font-bold text-gray-900">{avg('meanEda', 1)}</p>
                    <p className="text-xs text-gray-400">µS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">LF/HF</p>
                    <p className="text-lg font-bold text-gray-900">{avg('lfHfRatio', 2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Resp</p>
                    <p className="text-lg font-bold text-gray-900">{avg('respiratoryRate', 1)}</p>
                    <p className="text-xs text-gray-400">brpm</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Latest Session Detail */}
            {latestSession && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: TEAL_PRIMARY }} />
                  Latest Session — {new Date(latestSession.capturedAt).toLocaleTimeString()}
                </h2>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500">ASI: </span>
                    <span className="font-semibold">{latestSession.asi?.toFixed(3) ?? '--'}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500">AC: </span>
                    <span className="font-semibold">{latestSession.ac?.toFixed(2) ?? '--'}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500">DC: </span>
                    <span className="font-semibold">{latestSession.dc?.toFixed(2) ?? '--'}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500">AC/DC: </span>
                    <span className="font-semibold">{latestSession.acDcRatio?.toFixed(4) ?? '--'}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500">Pulse Amp: </span>
                    <span className="font-semibold">{latestSession.pulseAmplitude?.toFixed(3) ?? '--'}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500">Quality: </span>
                    <span className="font-semibold">{latestSession.signalQuality ?? '--'}%</span>
                  </div>
                </div>
                {latestSession.hrTrend !== null && (
                  <div className="mt-2 text-xs text-gray-500 flex gap-4">
                    <span>HR Trend: {latestSession.hrTrend?.toFixed(4)}</span>
                    <span>RMSSD Trend: {latestSession.rmssdTrend?.toFixed(4)}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Regression Scores */}
            {predictions?.regression && Object.keys(predictions.regression).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" style={{ color: TEAL_PRIMARY }} />
                  Regression Scores
                </h2>
                <div className="space-y-3">
                  {Object.entries(predictions.regression ?? {}).map(([target, result]) => {
                    const ensemble = result?.ensemble;
                    const interpretation = ensemble != null ? getRegressionInterpretation(target, ensemble) : '';
                    return (
                      <div key={target} className="py-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{target.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-semibold" style={{ color: isRiskTarget(target) ? getSeverityColor((ensemble ?? 0) / 100) : getPositiveColor(ensemble ?? 0) }}>
                            {ensemble != null ? ensemble.toFixed(2) + '%' : '--'}
                          </span>
                        </div>
                        {interpretation && (
                          <p className="text-xs text-gray-400 mt-0.5 ml-1">{interpretation}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Risk Domains */}
            {predictions?.risk && Object.keys(predictions.risk).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: TEAL_PRIMARY }} />
                  Risk Assessment
                </h2>
                <div className="space-y-3">
                  {Object.entries(predictions.risk).map(([domain, result]) => {
                    const riskScore = result?.risk_score;
                    return (
                      <div key={domain} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{domain.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${((riskScore ?? 0) * 100).toFixed(0)}%`,
                                backgroundColor: getSeverityColor(riskScore ?? 0),
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold min-w-[4rem] text-right" style={{ color: getSeverityColor(riskScore ?? 0) }}>
                            {getSeverityLabel(riskScore ?? 0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Mood Check */}
            {predictions?.mood_check && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" style={{ color: TEAL_PRIMARY }} />
                  Mood Check
                </h2>
                {predictions.mood_check.best_prediction ? (
                  <div className="text-center py-2">
                    <p className="text-2xl font-bold text-gray-900">{predictions.mood_check.best_prediction.label}</p>
                    <p className="text-sm text-gray-500">
                      Confidence: {(predictions.mood_check.best_prediction.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Not enough data for mood prediction</p>
                )}
              </motion.div>
            )}

            {/* Sessions Summary */}
            {sessions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: TEAL_PRIMARY }} />
                  Session History ({sessions.length})
                </h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sessions.slice(0, 20).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{new Date(s.capturedAt).toLocaleString()}</span>
                      <div className="flex gap-3 text-gray-700">
                        <span>HR {s.heartRate}</span>
                        <span>RMSSD {s.rmssd.toFixed(1)}</span>
                        <span className={s.sessionQuality === 'good' ? 'text-green-600' : 'text-amber-600'}>{s.sessionQuality}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {!todaySessions.length && !predictions && (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sessions Yet</h3>
                <p className="text-sm text-gray-400 mb-6">Capture your first rPPG measurement to see insights here.</p>
                <Button
                  onClick={() => navigate('/rppg-v8-capture')}
                  className="h-12 rounded-xl text-white font-semibold"
                  style={{ backgroundColor: TEAL_PRIMARY }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Capture
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default RppgPassiveSensing;
