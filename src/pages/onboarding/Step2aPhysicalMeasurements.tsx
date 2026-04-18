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

const Step2aPhysicalMeasurements = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, refreshProfile } = useOnboarding();
  
  const [form, setForm] = useState({
    height_cm: '',
    weight_kg: '',
    height_unit: 'cm',
    weight_unit: 'kg',
  });
  
  const [displayBMI, setDisplayBMI] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setForm({
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        height_unit: 'cm',
        weight_unit: 'kg',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (form.height_cm && form.weight_kg) {
      const heightM = parseFloat(form.height_cm) / 100;
      const weight = parseFloat(form.weight_kg);
      if (heightM > 0 && weight > 0) {
        setDisplayBMI(weight / (heightM * heightM));
      }
    }
  }, [form.height_cm, form.weight_kg]);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const height = parseFloat(form.height_cm);
    const weight = parseFloat(form.weight_kg);
    
    if (!form.height_cm || isNaN(height) || height < 50 || height > 300) {
      newErrors.height_cm = 'Height must be between 50-300 cm';
    }
    if (!form.weight_kg || isNaN(weight) || weight < 20 || weight > 500) {
      newErrors.weight_kg = 'Weight must be between 20-500 kg';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onboardingAPI.saveStep2({
        height_cm: parseFloat(form.height_cm),
        weight_kg: parseFloat(form.weight_kg),
        height_unit: form.height_unit,
        weight_unit: form.weight_unit,
      });
      await refreshProfile();
      navigate('/onboarding/step/3a');
    } catch (err: any) {
      const backendErrors: Record<string, string> = {};
      if (err?.errors) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          backendErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
      }
      setErrors(Object.keys(backendErrors).length > 0 ? backendErrors : { general: err.message });
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
          onClick={() => navigate('/onboarding/step/1')}
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
            <h1 className="text-2xl font-bold text-foreground">Your Measurements</h1>
            <p className="text-muted-foreground mt-2">
              For male patients, we use BMI and body composition for risk assessment.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={form.height_cm}
                  onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
                />
                {errors.height_cm && (
                  <p className="text-sm text-destructive">{errors.height_cm}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={form.weight_kg}
                  onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                />
                {errors.weight_kg && (
                  <p className="text-sm text-destructive">{errors.weight_kg}</p>
                )}
              </div>

              {displayBMI !== null && !isNaN(displayBMI) && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
                  <p className="text-2xl font-bold">{displayBMI.toFixed(1)}</p>
                  <p className={`text-sm font-medium ${getBMICategory(displayBMI).color}`}>
                    {getBMICategory(displayBMI).label}
                  </p>
                </div>
              )}
            </div>

            {errors.general && (
              <p className="text-sm text-destructive">{errors.general}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Step2aPhysicalMeasurements;