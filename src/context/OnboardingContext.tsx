import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { onboardingAPI } from '@/services/onboardingService';
import { OnboardingProfile } from '@/types/onboarding';

interface OnboardingContextType {
  profile: OnboardingProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAuth(); // get accessToken directly from context
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshProfile = async () => {
    // Guard: never call API without a valid token
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
      return;
    }
    try {
      setIsLoading(true);
      const result = await onboardingAPI.getProfile();
      setProfile(result.data);
    } catch (err) {
      console.error('Failed to load onboarding profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role;

    if (!accessToken || !role || role !== 'patient') {
      return;
    }

    refreshProfile();
  }, [accessToken, refreshProfile]); // ← only run for patient roles with a token

  return (
    <OnboardingContext.Provider value={{ profile, isLoading, refreshProfile }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
};
