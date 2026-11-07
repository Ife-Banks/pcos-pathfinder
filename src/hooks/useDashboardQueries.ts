import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService, UserProfile, PredictionData } from '@/services/dashboardService';
import { checkinService } from '@/services/checkinService';
import { menstrualService } from '@/services/menstrualService';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => dashboardService.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMLPredictions = (userGender?: string) => {
  return useQuery({
    queryKey: ['ml-predictions', userGender],
    queryFn: () => dashboardService.getMLPredictions(userGender),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus - predictions are expensive
    enabled: !!userGender, // Only run when gender is available to avoid duplicate calls
  });
};

export const useCheckinToday = () => {
  return useQuery({
    queryKey: ['checkin-today'],
    queryFn: () => checkinService.getTodayStatus(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export const useTodaySummary = () => {
  return useQuery({
    queryKey: ['today-summary'],
    queryFn: () => dashboardService.getTodaySummary(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export const useMenstrualHistory = () => {
  return useQuery({
    queryKey: ['menstrual-history'],
    queryFn: () => menstrualService.getCycleHistory(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMorningCheckin = (sessionId: string | null) => {
  return useQuery({
    queryKey: ['morning-checkin', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const { apiClient } = await import('@/services/apiClient');
      const res = await apiClient.get(`/checkin/morning/${sessionId}/`);
      return res.data?.data;
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDashboardData = () => {
  const queryClient = useQueryClient();

  const profileQuery = useUserProfile();
  const gender = profileQuery.data?.data?.gender?.toLowerCase();
  
  // Only run predictions query when gender is available to avoid duplicate calls
  const predictionsQuery = useMLPredictions(gender);
  
  const checkinTodayQuery = useCheckinToday();
  const todaySummaryQuery = useTodaySummary();
  // Removed menstrualHistoryQuery - not used on dashboard, saves 7.8KB request

  // Get session ID for morning check-in
  const morningSessionId = checkinTodayQuery.data?.morning_session_id || null;
  const morningCheckinQuery = useMorningCheckin(morningSessionId);

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    queryClient.invalidateQueries({ queryKey: ['ml-predictions'] });
    queryClient.invalidateQueries({ queryKey: ['checkin-today'] });
    queryClient.invalidateQueries({ queryKey: ['today-summary'] });
  };

  return {
    profile: profileQuery,
    predictions: predictionsQuery,
    checkinToday: checkinTodayQuery,
    todaySummary: todaySummaryQuery,
    morningCheckin: morningCheckinQuery,
    invalidateDashboard,
    isLoading: profileQuery.isLoading || predictionsQuery.isLoading || checkinTodayQuery.isLoading,
    isError: profileQuery.isError || predictionsQuery.isError || checkinTodayQuery.isError,
  };
};
