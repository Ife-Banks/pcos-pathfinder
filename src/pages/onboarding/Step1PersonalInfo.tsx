import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/services/onboardingService';
import { useOnboarding } from '@/context/OnboardingContext';

const Step1PersonalInfo = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const { profile, refreshProfile } = useOnboarding();
  
  const [form, setForm] = useState({
    full_name: '',
    age: '',
    ethnicity: '',
    gender: '',
    phone_number: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing data on mount
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        age: profile.age?.toString() || '',
        ethnicity: profile.ethnicity || '',
        gender: profile.gender || '',
        phone_number: profile.phone_number || '',
      });
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    const ageNum = parseInt(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      newErrors.age = 'Age must be between 10 and 120';
    }
    
    if (!form.ethnicity) {
      newErrors.ethnicity = 'Please select your ethnicity';
    }

    if (!form.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!form.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    
    console.log('TOKEN CHECK:', { 
      fromUser: user?.accessToken, 
      direct: accessToken 
    });
    
    try {
      setIsLoading(true);
      setErrors({});
      
      await onboardingAPI.saveStep1({
        full_name: form.full_name,
        age: parseInt(form.age),
        ethnicity: form.ethnicity,
        gender: form.gender,
        phone_number: form.phone_number,
      });
      
      // Refresh profile data
      await refreshProfile();
      
      // Route based on gender - different path for males vs females
      const nextStep = form.gender === 'male' ? '/onboarding/step/2a' : '/onboarding/step/2';
      navigate(nextStep);
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

  const ethnicityOptions = [
    { value: 'white', label: 'White / Caucasian' },
    { value: 'black', label: 'Black / African American' },
    { value: 'hispanic', label: 'Hispanic / Latino' },
    { value: 'asian', label: 'Asian' },
    { value: 'south_asian', label: 'South Asian' },
    { value: 'middle_eastern', label: 'Middle Eastern' },
    { value: 'mixed', label: 'Mixed / Other' },
    { value: 'prefer_not', label: 'Prefer not to say' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  return (
    <div className="flex min-h-screen flex-col gradient-surface">
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </motion.button>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Step 1 of 7</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold font-display text-foreground">
            Personal Information
          </h1>
          <p className="text-muted-foreground mt-1">
            Tell us a bit about yourself
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
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="Your full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={form.gender} 
              onValueChange={(value) => setForm({ ...form, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-destructive">{errors.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              placeholder="e.g., +2348123456789"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            />
            {errors.phone_number && (
              <p className="text-sm text-destructive">{errors.phone_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Your age"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              min={10}
              max={120}
            />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ethnicity">Ethnicity</Label>
            <select
              id="ethnicity"
              value={form.ethnicity}
              onChange={(e) => setForm({ ...form, ethnicity: e.target.value })}
              className="w-full p-3 border rounded-md bg-background"
            >
              <option value="">Select ethnicity</option>
              {ethnicityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.ethnicity && (
              <p className="text-sm text-destructive">{errors.ethnicity}</p>
            )}
          </div>

          <div className="pt-4 space-y-3">
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

export default Step1PersonalInfo;
