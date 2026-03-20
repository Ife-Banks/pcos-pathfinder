import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/services/onboardingService';
import { useOnboarding } from '@/context/OnboardingContext';

const Step3SkinChanges = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, refreshProfile } = useOnboarding();
  
  const [hasSkinChanges, setHasSkinChanges] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile && profile.has_skin_changes !== null) {
      setHasSkinChanges(profile.has_skin_changes);
    }
  }, [profile]);

  const handleNext = async () => {
    if (hasSkinChanges === null) {
      setErrors({ has_skin_changes: 'Please select Yes or No.' });
      return;
    }
    
    try {
      setIsLoading(true);
      setErrors({});
      
      await onboardingAPI.saveStep3({
        has_skin_changes: hasSkinChanges,
      });
      
      // Refresh profile data
      await refreshProfile();
      
      navigate('/onboarding/step/4');
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
          onClick={() => navigate('/onboarding/step/2')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Step 3 of 7</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold font-display text-foreground">
            Skin Changes
          </h1>
          <p className="text-muted-foreground mt-1">
            Do you have any skin changes?
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
            <h3 className="text-lg font-medium">Have you noticed any skin changes?</h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setHasSkinChanges(true)}
                className={`w-full p-4 rounded-lg border-2 transition-colors ${
                  hasSkinChanges === true
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-center">
                  <span className="text-lg font-medium">Yes</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setHasSkinChanges(false)}
                className={`w-full p-4 rounded-lg border-2 transition-colors ${
                  hasSkinChanges === false
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-center">
                  <span className="text-lg font-medium">No</span>
                </div>
              </button>
            </div>
            {errors.has_skin_changes && (
              <p className="text-sm text-destructive">{errors.has_skin_changes}</p>
            )}
          </div>

          <div className="pt-4">
            <Button
              variant="clinical"
              size="xl"
              className="w-full"
              onClick={handleNext}
              disabled={isLoading || hasSkinChanges === null}
            >
              {isLoading ? "Saving..." : "Next"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Step3SkinChanges;
