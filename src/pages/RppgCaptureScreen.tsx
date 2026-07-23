import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Activity } from 'lucide-react';
import RppgCamera from '@/components/RppgCamera';
import type { ReadinessState } from '@/components/RppgCamera';
import { rppgService } from '@/services/rppgService';
import type { RppgSessionPayload } from '@/components/RppgCamera';
import { toast } from '@/hooks/use-toast';

const TEAL_PRIMARY = '#00897B';

const RppgCaptureScreen = () => {
  const navigate = useNavigate();
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sessionData, setSessionData] = useState<{ payload: RppgSessionPayload } | null>(null);

  const [captureTimerActive, setCaptureTimerActive] = useState(false);
  const [nextCaptureAt, setNextCaptureAt] = useState<number | null>(null);

  const [readiness, setReadiness] = useState<ReadinessState | null>(null);

  useEffect(() => {
    localStorage.removeItem('nextRppgCaptureAt');
  }, []);

  useEffect(() => {
    if (!captureTimerActive) return;
    const check = setInterval(() => {
      const now = Date.now();
      const next = localStorage.getItem('nextRppgCaptureAt');
      if (next && parseInt(next, 10) <= now) {
        setCaptureTimerActive(false);
        localStorage.removeItem('nextRppgCaptureAt');
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
    localStorage.setItem('nextRppgCaptureAt', next.toString());
    setNextCaptureAt(next);
    setCaptureTimerActive(true);
  }, []);

  const handleStartCapture = () => {
    setShowPreview(false);
    setIsCapturing(true);
    setCaptureComplete(false);
    setErrors({});
  };

  const handleCaptureComplete = async (metrics: RppgSessionPayload) => {
    setIsLoading(true);
    setErrors({});
    
    setSessionData({ payload: metrics });
    setCaptureComplete(true);
    setIsCapturing(false);

    try {
      await rppgService.logSession(metrics);

      scheduleNextCapture();
      toast({
        title: 'HRV Captured',
        description: 'Your heart rate variability has been measured.',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Measure HRV</h1>
        </div>
        <p className="text-white/70 text-sm ml-8 mt-1">Capture your heart rate variability</p>
      </div>

      <div className="px-6 py-6 max-w-md mx-auto">
        {errors.general && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        {captureComplete && sessionData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Measurement Complete!</h2>
              <p className="text-gray-500 mb-6">Your HRV has been captured successfully.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">HRV (RMSSD)</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionData.payload.rmssd.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">ms</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">ASI</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionData.payload.asi?.toFixed(2) ?? '--'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Temp</p>
                  <p className="text-lg font-bold text-gray-900">{sessionData.payload.mean_temp}°C</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">EDA</p>
                  <p className="text-lg font-bold text-gray-900">{sessionData.payload.mean_eda}µS</p>
                </div>
              </div>
            </div>

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
                onClick={() => navigate('/dashboard')}
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
                    We'll use your phone camera to measure heart rate variability (HRV) through 
                    remote photoplethysmography (rPPG). This takes 1 minute.
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

            <RppgCamera
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
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                  style={{ backgroundColor: TEAL_PRIMARY }}
                >
                  Back to Dashboard
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
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

export default RppgCaptureScreen;
