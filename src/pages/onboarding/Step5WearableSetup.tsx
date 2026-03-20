import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/services/onboardingService';
import { useOnboarding } from '@/context/OnboardingContext';

const Step5WearableSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, refreshProfile } = useOnboarding();
  
  const [selectedWearable, setSelectedWearable] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile && profile.selected_wearable) {
      setSelectedWearable(profile.selected_wearable);
    }
  }, [profile]);

  const handleNext = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      
      await onboardingAPI.saveStep5({
        selected_wearable: (selectedWearable || 'none') as 'apple_watch' | 'fitbit' | 'garmin' | 'oura_ring' | 'none',
      });
      
      // Refresh profile data
      await refreshProfile();
      
      navigate('/onboarding/step/6');
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

  const wearableOptions = [
    { value: 'apple_watch', label: 'Apple Watch' },
    { value: 'fitbit', label: 'Fitbit' },
    { value: 'garmin', label: 'Garmin' },
    { value: 'oura_ring', label: 'Oura Ring' },
    { value: 'none', label: 'Skip — no wearable' },
  ];

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/onboarding/step/4')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Step 5 of 7</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold font-display text-foreground">
            Wearable Setup
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your wearable device for continuous monitoring
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
            <h3 className="text-lg font-medium">Select Your Wearable</h3>
            <div className="space-y-3">
              {wearableOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedWearable(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                    selectedWearable === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    {selectedWearable === option.value && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-xs text-primary-foreground">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              variant="clinical"
              size="xl"
              className="w-full"
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Next"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Step5WearableSetup;
