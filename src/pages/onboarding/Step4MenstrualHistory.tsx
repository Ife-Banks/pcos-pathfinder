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

const Step4MenstrualHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, refreshProfile } = useOnboarding();
  
  const [form, setForm] = useState({
    cycle_length_days: '',
    periods_per_year: '',
    cycle_regularity: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setForm({
        cycle_length_days: profile.cycle_length_days?.toString() || '',
        periods_per_year: profile.periods_per_year?.toString() || '',
        cycle_regularity: profile.cycle_regularity || '',
      });
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const cycleLength = parseInt(form.cycle_length_days);
    if (!form.cycle_length_days || isNaN(cycleLength) || cycleLength < 1 || cycleLength > 90) {
      newErrors.cycle_length_days = 'Cycle length must be between 1-90 days';
    }
    
    const periodsPerYear = parseInt(form.periods_per_year);
    if (!form.periods_per_year || isNaN(periodsPerYear) || periodsPerYear < 0 || periodsPerYear > 14) {
      newErrors.periods_per_year = 'Periods per year must be between 0-14';
    }
    
    if (!form.cycle_regularity || !['regular', 'irregular'].includes(form.cycle_regularity)) {
      newErrors.cycle_regularity = 'Please select cycle regularity';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setErrors({});
      
      await onboardingAPI.saveStep4({
        cycle_length_days: parseInt(form.cycle_length_days),
        periods_per_year: parseInt(form.periods_per_year),
        cycle_regularity: form.cycle_regularity as 'regular' | 'irregular',
      });
      
      // Refresh profile data
      await refreshProfile();
      
      navigate('/onboarding/step/5');
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
          onClick={() => navigate('/onboarding/step/3')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Step 4 of 7</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold font-display text-foreground">
            Menstrual History
          </h1>
          <p className="text-muted-foreground mt-1">
            Help us understand your menstrual patterns
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 flex-1"
          onSubmit={(e) => { e.preventDefault(); handleNext(); }}
        >
          {/* General error banner */}
          {errors.general && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cycle_length_days">Average cycle length in days</Label>
            <Input
              id="cycle_length_days"
              type="number"
              placeholder="28"
              value={form.cycle_length_days}
              onChange={(e) => setForm({ ...form, cycle_length_days: e.target.value })}
              min={1}
              max={90}
            />
            {errors.cycle_length_days && (
              <p className="text-sm text-destructive">{errors.cycle_length_days}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="periods_per_year">Periods per year</Label>
            <Input
              id="periods_per_year"
              type="number"
              placeholder="12"
              value={form.periods_per_year}
              onChange={(e) => setForm({ ...form, periods_per_year: e.target.value })}
              min={0}
              max={14}
            />
            {errors.periods_per_year && (
              <p className="text-sm text-destructive">{errors.periods_per_year}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cycle regularity</Label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="cycle_regularity"
                  value="regular"
                  checked={form.cycle_regularity === 'regular'}
                  onChange={(e) => setForm({ ...form, cycle_regularity: e.target.value })}
                  className="w-4 h-4"
                />
                <span>Regular</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="cycle_regularity"
                  value="irregular"
                  checked={form.cycle_regularity === 'irregular'}
                  onChange={(e) => setForm({ ...form, cycle_regularity: e.target.value })}
                  className="w-4 h-4"
                />
                <span>Irregular</span>
              </label>
            </div>
            {errors.cycle_regularity && (
              <p className="text-sm text-destructive">{errors.cycle_regularity}</p>
            )}
          </div>

          <div className="pt-4">
            <Button
              variant="clinical"
              size="xl"
              className="w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Next"}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Step4MenstrualHistory;
