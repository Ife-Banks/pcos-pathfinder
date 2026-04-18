import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/services/onboardingService';
import { useOnboarding } from '@/context/OnboardingContext';

const Step4aMentalHealth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, refreshProfile } = useOnboarding();
  
  const [form, setForm] = useState({
    stress_level: '',
    mood_swings: '',
    sleep_quality: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setForm({
        stress_level: profile.stress_level || '',
        mood_swings: profile.mood_swings || '',
        sleep_quality: profile.sleep_quality || '',
      });
    }
  }, [profile]);

  const handleNext = async () => {
    if (!form.stress_level || !form.mood_swings || !form.sleep_quality) {
      setErrors({ general: 'Please answer all questions.' });
      return;
    }

    setIsLoading(true);
    try {
      await onboardingAPI.saveStep4({
        stress_level: form.stress_level,
        mood_swings: form.mood_swings,
        sleep_quality: form.sleep_quality,
      });
      await refreshProfile();
      navigate('/onboarding/step/5');
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
          onClick={() => navigate('/onboarding/step/3a')}
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
            <h1 className="text-2xl font-bold text-foreground">Mental & Sleep Health</h1>
            <p className="text-muted-foreground mt-2">
              For male patients, we track stress, mood, and sleep patterns.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label>How would you rate your stress level?</Label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'moderate', 'high'].map((level) => (
                  <Button
                    key={level}
                    variant={form.stress_level === level ? 'clinical' : 'outline'}
                    onClick={() => setForm({ ...form, stress_level: level })}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Do you experience mood swings?</Label>
              <div className="grid grid-cols-3 gap-2">
                {['rarely', 'sometimes', 'often'].map((freq) => (
                  <Button
                    key={freq}
                    variant={form.mood_swings === freq ? 'clinical' : 'outline'}
                    onClick={() => setForm({ ...form, mood_swings: freq })}
                    className="capitalize"
                  >
                    {freq}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>How would you rate your sleep quality?</Label>
              <div className="grid grid-cols-3 gap-2">
                {['poor', 'fair', 'good'].map((quality) => (
                  <Button
                    key={quality}
                    variant={form.sleep_quality === quality ? 'clinical' : 'outline'}
                    onClick={() => setForm({ ...form, sleep_quality: quality })}
                    className="capitalize"
                  >
                    {quality}
                  </Button>
                ))}
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

export default Step4aMentalHealth;