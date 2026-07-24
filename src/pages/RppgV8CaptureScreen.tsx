import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Activity, Heart, Thermometer, Droplets, Wind, BarChart3, AlertTriangle } from 'lucide-react';
import RppgV8Camera from '@/components/RppgV8Camera';
import type { ReadinessState } from '@/components/RppgV8Camera';
import { rppgV8Service } from '@/services/rppgV8Service';
import type { RppgV8SessionPayload } from '@/services/rppgV8Service';
import { toast } from '@/hooks/use-toast';

const TEAL_PRIMARY = '#00897B';

const getSeverityColor = (score: number): string => {
  if (score >= 0.7) return '#ef4444';
  if (score >= 0.5) return '#f97316';
  if (score >= 0.3) return '#eab308';
  return '#22c55e';
};

const RppgV8CaptureScreen = () => {
  const navigate = useNavigate();

  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sessionData, setSessionData] = useState<{ payload: RppgV8SessionPayload; predictions?: any } | null>(null);

  const [captureTimerActive, setCaptureTimerActive] = useState(false);
  const [nextCaptureAt, setNextCaptureAt] = useState<number | null>(null);

  const [readiness, setReadiness] = useState<ReadinessState | null>(null);

  useEffect(() => {
    localStorage.removeItem('nextRppgV8CaptureAt');
  }, []);

  useEffect(() => {
    if (!captureTimerActive) return;
    const check = setInterval(() => {
      const now = Date.now();
      const next = localStorage.getItem('nextRppgV8CaptureAt');
      if (next && parseInt(next, 10) <= now) {
        setCaptureTimerActive(false);
        localStorage.removeItem('nextRppgV8CaptureAt');
      }
    }, 10000);
    return () => clearInterval(check);
  }, [captureTimerActive]);

  const scheduleNextCapture = useCallback(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      setCaptureTimerActive(false);
      return;
    }
    const next = Date.now() + 4 * 60 * 60 * 1000;
    localStorage.setItem('nextRppgV8CaptureAt', next.toString());
    setNextCaptureAt(next);
    setCaptureTimerActive(true);
  }, []);

  const handleStartCapture = () => {
    setShowPreview(false);
    setIsCapturing(true);
    setCaptureComplete(false);
    setErrors({});
  };

  const handleCaptureComplete = async (metrics: RppgV8SessionPayload) => {
    setIsLoading(true);
    setErrors({});

    setSessionData({ payload: metrics });
    setCaptureComplete(true);
    setIsCapturing(false);

    try {
      await rppgV8Service.logSession(metrics);

      try {
        const predictions = await rppgV8Service.predictAll(metrics);
        setSessionData(prev => prev ? { ...prev, predictions } : prev);
      } catch (predErr: any) {
        console.warn('Prediction failed (session still saved):', predErr);
      }

      scheduleNextCapture();
      toast({
        title: 'rPPG Measurement Complete',
        description: 'Your 18+ physiological metrics have been captured.',
      });
    } catch (err: any) {
      console.warn('Backend save failed (results shown locally):', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureError = (error: string) => {
    setErrors({ general: error });
    setIsCapturing(false);
  };

  const handleReadinessChange = useCallback((r: ReadinessState) => {
    setReadiness(r);
  }, []);

  const p = sessionData?.payload;
  const pred = sessionData?.predictions;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/rppg-passive')} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Passive Sensing</h1>
        </div>
        <p className="text-white/70 text-sm ml-8 mt-1">Capture 18+ physiological metrics</p>
      </div>

      <div className="px-6 py-6 max-w-md mx-auto">
        {errors.general && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        {captureComplete && p ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Success header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Measurement Complete!</h2>
              <p className="text-gray-500 text-sm">Your rPPG v8 data has been captured.</p>
            </div>

            {/* Core vitals */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Core Vitals
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">HR</p>
                  <p className="text-xl font-bold text-gray-900">{p.heart_rate.toFixed(0)}</p>
                  <p className="text-[10px] text-gray-400">bpm</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">RMSSD</p>
                  <p className="text-xl font-bold text-gray-900">{p.rmssd.toFixed(1)}</p>
                  <p className="text-[10px] text-gray-400">ms</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">SpO2</p>
                  <p className="text-xl font-bold text-gray-900">{p.estimated_spo2.toFixed(1)}</p>
                  <p className="text-[10px] text-gray-400">%</p>
                </div>
              </div>
            </div>

            {/* HRV breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                HRV Breakdown
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">HF Power</p>
                  <p className="text-lg font-bold text-gray-900">{p.hf?.toFixed(1) ?? '--'}</p>
                  <p className="text-[10px] text-gray-400">ms²</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">LF/HF</p>
                  <p className="text-lg font-bold text-gray-900">{p.lf_hf_ratio?.toFixed(2) ?? '--'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Resp Rate</p>
                  <p className="text-lg font-bold text-gray-900">{p.respiratory_rate?.toFixed(1) ?? '--'}</p>
                  <p className="text-[10px] text-gray-400">br/min</p>
                </div>
              </div>
            </div>

            {/* Skin & Autonomic */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                Skin & Autonomic
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Skin Temp</p>
                  <p className="text-lg font-bold text-gray-900">{p.skin_temperature.toFixed(1)}°C</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">EDA</p>
                  <p className="text-lg font-bold text-gray-900">{p.mean_eda?.toFixed(2) ?? '--'}µS</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">ASI</p>
                  <p className="text-lg font-bold text-gray-900">{p.asi?.toFixed(3) ?? '--'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">AC/DC</p>
                  <p className="text-lg font-bold text-gray-900">{p.ac_dc_ratio?.toFixed(3) ?? '--'}</p>
                </div>
              </div>
            </div>

            {/* Signal quality */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-purple-500" />
                Signal Quality
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (p.signal_quality ?? 0))}%`,
                      backgroundColor: (p.signal_quality ?? 0) >= 50 ? '#22c55e' : (p.signal_quality ?? 0) >= 25 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">{p.signal_quality?.toFixed(0) ?? '--'}%</span>
              </div>
              <div className="flex gap-3 mt-3 text-xs text-gray-500">
                <span>Type: <strong className="text-gray-700">{p.session_type}</strong></span>
                <span>Quality: <strong className="text-gray-700">{p.session_quality ?? 'unknown'}</strong></span>
                <span>HR Trend: <strong className="text-gray-700">{p.hr_trend?.toFixed(2) ?? '--'}</strong></span>
              </div>
            </div>

            {/* Predictions (if available) */}
            {pred && (
              <>
                {/* Risk scores */}
                {pred.risk && Object.keys(pred.risk).length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Risk Scores
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(pred.risk).slice(0, 6).map(([domain, r]: [string, any]) => (
                        <div key={domain} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 capitalize">{domain.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(r.risk_score ?? 0) * 100}%`,
                                  backgroundColor: getSeverityColor(r.risk_score ?? 0),
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium w-8 text-right" style={{ color: getSeverityColor(r.risk_score ?? 0) }}>
                              {r.risk_score != null ? (r.risk_score * 100).toFixed(0) + '%' : '--'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mood */}
                {pred.mood_check?.best_prediction && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-lg">🧠</span>
                      Mood Check
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{pred.mood_check.best_prediction.label}</span>
                      <span className="text-sm text-gray-500">{(pred.mood_check.best_prediction.confidence * 100).toFixed(1)}% confidence</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Best algorithm: {pred.mood_check.best_algorithm}</p>
                  </div>
                )}
              </>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setCaptureComplete(false);
                  setSessionData(null);
                  setShowPreview(true);
                  setReadiness(null);
                }}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Capture Again
              </Button>
              <Button
                onClick={() => navigate('/rppg-passive')}
                className="flex-1 h-12 rounded-xl text-white font-semibold"
                style={{ backgroundColor: TEAL_PRIMARY }}
              >
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-teal-900 mb-1">About this measurement</h3>
                  <p className="text-sm text-teal-700">
                    Capture 18+ physiological metrics including HR, HRV, SpO2, EDA, skin temperature, and respiratory rate.
                    This takes about 2 minutes.
                  </p>
                  {showPreview && readiness && (
                    <div className="mt-2 space-y-1 text-xs text-teal-700">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${readiness.lighting === 'good' ? 'bg-green-500' : readiness.lighting === 'checking' ? 'bg-gray-300 text-gray-500' : 'bg-red-500'}`}>
                          {readiness.lighting === 'good' ? '✓' : readiness.lighting === 'checking' ? '⋯' : '✗'}
                        </span>
                        <span>Lighting</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${readiness.stability === 'steady' ? 'bg-green-500' : readiness.stability === 'checking' ? 'bg-gray-300 text-gray-500' : 'bg-red-500'}`}>
                          {readiness.stability === 'steady' ? '✓' : readiness.stability === 'checking' ? '⋯' : '✗'}
                        </span>
                        <span>Hold steady</span>
                      </div>
                    </div>
                  )}
                  {nextCaptureAt && Date.now() < nextCaptureAt && (
                    <p className="text-xs text-teal-600 mt-2">
                      Next capture available in {Math.ceil((nextCaptureAt - Date.now()) / 3600000)}h
                    </p>
                  )}
                </div>
              </div>
            </div>

            <RppgV8Camera
              onCaptureComplete={handleCaptureComplete}
              onCaptureError={handleCaptureError}
              isCapturing={isCapturing}
              setIsCapturing={setIsCapturing}
              showPreview={showPreview}
              onReadinessChange={handleReadinessChange}
            />

            <div className="pt-4 space-y-3">
              {!captureComplete ? (
                <Button
                  variant="clinical"
                  size="xl"
                  className="w-full"
                  onClick={handleStartCapture}
                  disabled={isCapturing || (showPreview && readiness !== null && !readiness.allReady)}
                  style={isCapturing ? {} : { backgroundColor: TEAL_PRIMARY }}
                >
                  {isCapturing ? "Capturing..." : showPreview && readiness && !readiness.allReady ? "Check Conditions First" : "Start Capture"}
                </Button>
              ) : (
                <Button
                  variant="clinical"
                  size="xl"
                  className="w-full"
                  onClick={() => navigate('/rppg-passive')}
                  disabled={isLoading}
                  style={{ backgroundColor: TEAL_PRIMARY }}
                >
                  Back to Dashboard
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigate('/rppg-passive')}
                className="w-full h-12 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RppgV8CaptureScreen;
