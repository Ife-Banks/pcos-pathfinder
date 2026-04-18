import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/services/onboardingService';
import { useOnboarding } from '@/context/OnboardingContext';

const Step3aSkinChanges = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, refreshProfile } = useOnboarding();
  
  const [hasSkinChanges, setHasSkinChanges] = useState<boolean | null>(null);
  const [hasHairLoss, setHasHairLoss] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile && profile.has_skin_changes !== null) {
      setHasSkinChanges(profile.has_skin_changes);
    }
    if (profile && profile.has_hair_loss !== null) {
      setHasHairLoss(profile.has_hair_loss);
    }
  }, [profile]);

  const handleNext = async () => {
    if (hasSkinChanges === null) {
      setErrors({ has_skin_changes: 'Please select Yes or No.' });
      return;
    }

    setIsLoading(true);
    try {
      await onboardingAPI.saveStep3({
        has_skin_changes: hasSkinChanges,
        has_hair_loss: hasHairLoss,
      });
      await refreshProfile();
      navigate('/onboarding/step/4a');
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/onboarding/step/2a')}
          className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Skin & Hair Changes</h1>
            <p className="text-muted-foreground mt-2">
              For male patients, we track skin conditions and hair loss patterns.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="font-medium">Do you experience any skin changes?</p>
              <p className="text-sm text-muted-foreground">
                E.g., acne, oily skin, dark patches (acanthosis nigricans)
              </p>
              <div className="flex gap-3">
                <Button
                  variant={hasSkinChanges === true ? 'clinical' : 'outline'}
                  className="flex-1"
                  onClick={() => setHasSkinChanges(true)}
                >
                  Yes
                </Button>
                <Button
                  variant={hasSkinChanges === false ? 'clinical' : 'outline'}
                  className="flex-1"
                  onClick={() => setHasSkinChanges(false)}
                >
                  No
                </Button>
              </div>
              {errors.has_skin_changes && (
                <p className="text-sm text-destructive">{errors.has_skin_changes}</p>
              )}
            </div>

            <div className="space-y-3">
              <p className="font-medium">Do you experience hair loss?</p>
              <p className="text-sm text-muted-foreground">
                E.g., thinning hair, bald patches, body hair changes
              </p>
              <div className="flex gap-3">
                <Button
                  variant={hasHairLoss === true ? 'clinical' : 'outline'}
                  className="flex-1"
                  onClick={() => setHasHairLoss(true)}
                >
                  Yes
                </Button>
                <Button
                  variant={hasHairLoss === false ? 'clinical' : 'outline'}
                  className="flex-1"
                  onClick={() => setHasHairLoss(false)}
                >
                  No
                </Button>
              </div>
            </div>
          </div>

          {errors.general && (
            <p className="text-sm text-destructive">{errors.general}</p>
          )}

          <Button
            onClick={handleNext}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Step3aSkinChanges;