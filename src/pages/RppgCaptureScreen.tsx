import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Activity } from 'lucide-react';
import RppgCamera from '@/components/RppgCamera';
import { rppgService, RppgSessionPayload } from '@/services/rppgService';
import { predictionService } from '@/services/predictionService';
import { toast } from '@/hooks/use-toast';

const TEAL_PRIMARY = '#00897B';

const getSeverityFromScore = (score: number): string => {
  if (score >= 0.7) return 'Severe';
  if (score >= 0.5) return 'Moderate';
  if (score >= 0.3) return 'Mild';
  return 'Minimal';
};

const RppgCaptureScreen = () => {
  const navigate = useNavigate();
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sessionData, setSessionData] = useState<{ rmssd: number; mean_heart_rate: number } | null>(null);

  const handleStartCapture = () => {
    setIsCapturing(true);
    setCaptureComplete(false);
    setErrors({});
  };

  const handleCaptureComplete = async (metrics: RppgSessionPayload) => {
    try {
      setIsLoading(true);
      setErrors({});
      
      const logResponse = await rppgService.logSession({
        ...metrics,
        session_type: 'checkin',
      });
      
      setSessionData({
        rmssd: metrics.rmssd,
        mean_heart_rate: metrics.mean_temp,
      });

      try {
        const [metabolicCardio, stressReproductive] = await Promise.allSettled([
          rppgService.predictMetabolicCardio(),
          rppgService.predictStressReproductive(),
        ]);

        const predictions: Record<string, { risk_score: number; severity: string }> = {};
        
        if (metabolicCardio.status === 'fulfilled') {
          const mcPreds = metabolicCardio.value.data.predictions;
          Object.entries(mcPreds).forEach(([key, value]) => {
            predictions[key] = { risk_score: value, severity: getSeverityFromScore(value) };
          });
        }

        if (stressReproductive.status === 'fulfilled') {
          const srPreds = stressReproductive.value.data.predictions;
          Object.entries(srPreds).forEach(([key, value]) => {
            predictions[key] = { risk_score: value, severity: getSeverityFromScore(value) };
          });
        }

        if (Object.keys(predictions).length > 0) {
          await predictionService.escalateRppg(predictions);
        }
      } catch (escalateErr) {
        console.warn('rPPG escalation check failed:', escalateErr);
      }

      setCaptureComplete(true);
      setIsCapturing(false);
      toast({
        title: 'HRV Captured',
        description: 'Your heart rate variability has been measured.',
      });
    } catch (err: any) {
      const backendErrors: Record<string, string> = {};
      if (err?.errors) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          backendErrors[field] = Array.isArray(messages) 
            ? messages[0] : String(messages);
        });
      }
      setErrors(
        Object.keys(backendErrors).length > 0 
          ? backendErrors 
          : { general: err?.message || 'Something went wrong.' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureError = (error: string) => {
    setErrors({ general: error });
    setIsCapturing(false);
  };

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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">HRV (RMSSD)</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionData.rmssd.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">ms</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Heart Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(sessionData.mean_heart_rate)}</p>
                  <p className="text-xs text-gray-400">bpm</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full h-12 rounded-xl text-white font-semibold"
              style={{ backgroundColor: TEAL_PRIMARY }}
            >
              Back to Dashboard
            </Button>
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
                    We'll use your phone camera to measure your heart rate variability (HRV) through 
                    remote photoplethysmography (rPPG). This takes about 30 seconds.
                  </p>
                </div>
              </div>
            </div>

            <RppgCamera
              onCaptureComplete={handleCaptureComplete}
              onCaptureError={handleCaptureError}
              isCapturing={isCapturing}
              setIsCapturing={setIsCapturing}
            />

            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full h-12 rounded-xl"
            >
              Cancel
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RppgCaptureScreen;
