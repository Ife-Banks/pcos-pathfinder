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

const Step2PhysicalMeasurements = () => {
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

  // Load existing data on mount
  useEffect(() => {
    if (profile) {
      setForm({
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        height_unit: 'cm',
        weight_unit: 'kg',
      });
      setDisplayBMI(profile.bmi || null);
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    let height_cm = parseFloat(form.height_cm);
    let weight_kg = parseFloat(form.weight_kg);
    
    // Convert to metric if needed
    if (form.height_unit === 'ft') {
      const [feet, inches] = form.height_cm.split('.').map(Number);
      height_cm = (feet * 30.48) + ((inches || 0) * 2.54);
    }
    
    if (form.weight_unit === 'lbs') {
      weight_kg = weight_kg * 0.453592;
    }
    
    if (!height_cm || height_cm < 50 || height_cm > 300) {
      newErrors.height_cm = 'Height must be between 50-300 cm';
    }
    
    if (!weight_kg || weight_kg < 20 || weight_kg > 500) {
      newErrors.weight_kg = 'Weight must be between 20-500 kg';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertToMetric = () => {
    let height_cm = parseFloat(form.height_cm);
    let weight_kg = parseFloat(form.weight_kg);
    
    if (form.height_unit === 'ft') {
      const [feet, inches] = form.height_cm.split('.').map(Number);
      height_cm = (feet * 30.48) + ((inches || 0) * 2.54);
    }
    
    if (form.weight_unit === 'lbs') {
      weight_kg = weight_kg * 0.453592;
    }
    
    return { height_cm: Math.round(height_cm * 10) / 10, weight_kg: Math.round(weight_kg * 10) / 10 };
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      setErrors({});
      
      const { height_cm, weight_kg } = convertToMetric();
      
      const result = await onboardingAPI.saveStep2(user!.accessToken!, {
        height_cm,
        weight_kg,
      });
      
      // Update BMI from server response
      setDisplayBMI(result.data.bmi);
      
      // Refresh profile data
      await refreshProfile();
      
      navigate('/onboarding/step/3');
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
          onClick={() => navigate('/onboarding/step/1')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold font-display text-foreground">
            Physical Measurements
          </h1>
          <p className="text-muted-foreground mt-1">
            Help us understand your physical profile
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
            <Label htmlFor="height_cm">Height</Label>
            <div className="flex gap-2">
              <Input
                id="height_cm"
                placeholder={form.height_unit === 'cm' ? 'Height in cm' : 'Height in feet.inches'}
                value={form.height_cm}
                onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
              />
              <select
                value={form.height_unit}
                onChange={(e) => setForm({ ...form, height_unit: e.target.value })}
                className="p-3 border rounded-md bg-background"
              >
                <option value="cm">cm</option>
                <option value="ft">ft</option>
              </select>
            </div>
            {errors.height_cm && (
              <p className="text-sm text-destructive">{errors.height_cm}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight_kg">Weight</Label>
            <div className="flex gap-2">
              <Input
                id="weight_kg"
                placeholder={form.weight_unit === 'kg' ? 'Weight in kg' : 'Weight in lbs'}
                value={form.weight_kg}
                onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
              />
              <select
                value={form.weight_unit}
                onChange={(e) => setForm({ ...form, weight_unit: e.target.value })}
                className="p-3 border rounded-md bg-background"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
            {errors.weight_kg && (
              <p className="text-sm text-destructive">{errors.weight_kg}</p>
            )}
          </div>

          {/* BMI Display - READ-ONLY from server */}
          {displayBMI && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">BMI: {displayBMI.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Calculated from your measurements</p>
            </div>
          )}

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

export default Step2PhysicalMeasurements;
