import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/services/onboardingService';
import { useOnboarding } from '@/context/OnboardingContext';
import RppgCamera from '@/components/RppgCamera';
import { rppgService, RppgSessionPayload } from '@/services/rppgService';

const Step6rPPG = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshProfile } = useOnboarding();
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStartCapture = () => {
    setIsCapturing(true);
    setCaptureComplete(false);
  };

  const handleCaptureComplete = async (metrics: RppgSessionPayload) => {
    try {
      setIsLoading(true);
      setErrors({});
      
      // Log rPPG session to backend
      await rppgService.logSession(metrics);
      
      // Save onboarding step 6
      await onboardingAPI.saveStep6rPPG();
      
      // Refresh profile data
      await refreshProfile();
      
      setCaptureComplete(true);
      setIsCapturing(false);
      
      // Navigate to step 7 after successful capture
      navigate('/onboarding/step/7');
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

  const handleSkipAndFinish = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      
      // Skip rPPG, go to step 7
      navigate('/onboarding/step/7');
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

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/onboarding/step/5')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Step 6 of 7</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold font-display text-foreground">
            rPPG Baseline
          </h1>
          <p className="text-muted-foreground mt-1">
            Capture your heart rate variability for baseline measurements
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 flex-1"
        >
          {/* General error banner */}
          {errors.general && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <RppgCamera
              onCaptureComplete={handleCaptureComplete}
              onCaptureError={handleCaptureError}
              isCapturing={isCapturing}
              setIsCapturing={setIsCapturing}
            />
          </div>

          <div className="pt-4 space-y-3">
            {!captureComplete ? (
              <Button
                variant="clinical"
                size="xl"
                className="w-full"
                onClick={handleStartCapture}
                disabled={isCapturing}
              >
                {isCapturing ? "Capturing..." : "Start Capture"}
              </Button>
            ) : (
              <Button
                variant="clinical"
                size="xl"
                className="w-full"
                onClick={() => navigate('/onboarding/step/7')}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Continue"}
              </Button>
            )}
            
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleSkipAndFinish}
              disabled={isLoading}
            >
              Skip
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Step6rPPG;
