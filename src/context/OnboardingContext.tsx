import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const { user, accessToken } = useAuth();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
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
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !user || user.role !== 'patient') {
      return;
    }

    refreshProfile();
  }, [accessToken, user?.id]);

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
