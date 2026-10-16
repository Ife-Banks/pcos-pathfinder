import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/services/onboardingService';

interface DirectOnboardingStep7Props {
  state: string;
  lga: string;
  registered_hcc: string | null;
}

const DirectOnboardingScreen = () => {
  const { params } = useParams<{ step?: string }>();
  const navigate = useNavigate();
  const { user, accessToken, refreshUser, refreshProfile } = useAuth();
  const [step, setStep] = useState<number>(params?.step ? parseInt(params.step, 10) : 1);
  const [form, setForm] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<any>(null);

  // Load existing data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await onboardingAPI.getProfile();
        setProfile(res?.profile || null);
        if (res?.profile) {
          setForm({
            state: res.profile.state || '',
            lga: res.profile.lga || '',
            registered_hcc: res.profile.registered_hcc || null,
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    loadProfile();
  }, [refreshProfile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.state) {
      newErrors.state = 'State is required';
    }

    if (!form.lga) {
      newErrors.lga = 'LGA is required';
    }

    if (step === 7 && form.registered_hcc === undefined) {
      newErrors.registered_hcc = 'Registered health centre is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setErrors({});

      const payload = {
        state: form.state,
        lga: form.lga,
        registered_hcc: form.registered_hcc || null,
      };

      console.log('📤 Submitting step', step, 'with payload:', payload);

      await onboardingAPI.saveStep7HealthCentre(payload);

      // Refresh profile and user
      await Promise.all([refreshProfile(), refreshUser()]);

      // Navigate to next step or complete
      const nextStep = step < 7 ? step + 1 : null;
      if (nextStep) {
        setStep(nextStep);
      } else {
        navigate('/onboarding/complete');
      }
    } catch (err: any) {
      console.error('❌ Step submission error:', err);

      const errorData = err?.response?.data;
      const backendErrors: Record<string, string> = {};

      if (errorData?.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          backendErrors[field] = Array.isArray(messages)
            ? messages[0] : String(messages);
        });
      } else if (errorData?.message) {
        backendErrors.general = errorData.message;
      } else if (typeof errorData === 'string') {
        backendErrors.general = errorData;
      }

      if (Object.keys(backendErrors).length === 0) {
        backendErrors.general = `Failed to submit step ${step}. Please try again.`;
      }

      setErrors(backendErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    const prevStep = step > 1 ? step - 1 : 1;
    navigate(`/onboarding/direct/${prevStep}`);
  };

  const goNext = () => {
    const nextStep = step < 7 ? step + 1 : 7;
    setStep(nextStep);
  };

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={goBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            Step {step} of 7
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold font-display text-foreground">
            Direct Onboarding
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete your onboarding to receive personalized insights
          </p>
        </motion.div>

        {step === 7 ? (
          <div>
            <h2 className="text-xl font-medium mb-4">Health Centre Information</h2>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="State"
                value={form.state || ''}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              {errors.state && (
                <p className="text-sm text-destructive">{errors.state}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lga">LGA</Label>
              <Input
                id="lga"
                placeholder="Local Government Area"
                value={form.lga || ''}
                onChange={(e) => setForm({ ...form, lga: e.target.value })}
              />
              {errors.lga && (
                <p className="text-sm text-destructive">{errors.lga}</p>
              )}
            </div>

            {step === 7 ? (
              <div className="space-y-2">
                <Label htmlFor="registered_hcc">Registered Health Centre (Optional)</Label>
                <Input
                  id="registered_hcc"
                  placeholder="e.g. General Hospital, Lagos"
                  value={form.registered_hcc || ''}
                  onChange={(e) =>
                    setForm({ ...form, registered_hcc: e.target.value })
                  }
                />
              </div>
            ) : null}

            <div className="pt-4 space-y-3">
              <Button
                variant="clinical"
                size="xl"
                className="w-full"
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Complete Onboarding"}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              This step is optional. You can skip and complete onboarding later.
            </p>

            <Button
              variant="default"
              size="xl"
              className="w-full"
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Submit and Continue"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectOnboardingScreen;