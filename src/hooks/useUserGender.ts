import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dashboardService } from '@/services/dashboardService';

/**
 * Resolves the current user's gender ('male' | 'female' | '') for gender-aware
 * check-in UIs. Prefers a fresh /auth/me/ read (gender lives on the onboarding
 * profile and can change after login), falling back to the cached auth user.
 */
export function useUserGender(): { gender: string; isMale: boolean; isFemale: boolean; loading: boolean } {
  const { user } = useAuth();
  const [gender, setGender] = useState<string>((user?.gender || '').toLowerCase());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    dashboardService
      .getUserProfile()
      .then((res) => {
        if (mounted) setGender((res.data?.gender || user?.gender || '').toLowerCase());
      })
      .catch(() => {
        if (mounted) setGender((user?.gender || '').toLowerCase());
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    gender,
    isMale: gender === 'male',
    isFemale: gender === 'female',
    loading,
  };
}
