import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/services/onboardingService';
import { useOnboarding } from '@/context/OnboardingContext';

const Step6rPPG = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshProfile } = useOnboarding();
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStartCapture = async () => {
    setIsCapturing(true);
    // Simulate 2-minute capture
    setTimeout(() => {
      setIsCapturing(false);
      setCaptureComplete(true);
    }, 2000); // Using 2 seconds instead of 2 minutes for demo
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      
      await onboardingAPI.saveStep6rPPG(user!.accessToken!);
      
      // Refresh profile data
      await refreshProfile();
      
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
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              {isCapturing ? (
                <div className="text-center">
                  <div className="animate-pulse">
                    <Camera className="h-16 w-16 mx-auto mb-4 text-primary" />
                  </div>
                  <p className="text-lg font-medium">Capturing...</p>
                  <p className="text-sm text-muted-foreground">Please hold still</p>
                </div>
              ) : captureComplete ? (
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-lg font-medium text-green-600">Capture Complete!</p>
                  <p className="text-sm text-muted-foreground">Session quality: 85%</p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">Ready to Capture</p>
                  <p className="text-sm text-muted-foreground">2-minute baseline measurement</p>
                </div>
              )}
            </div>
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
                onClick={handleComplete}
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
