import apiClient from '@/services/apiClient';

const ensureSuccess = (body: any) => {
  if (body.status !== 'success') throw body;
  return body;
};

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  is_email_verified: boolean;
  onboarding_completed: boolean;
  onboarding_step: number;
  date_joined: string;
}

export interface UserProfileResponse {
  success: boolean;
  status: number;
  message: string;
  data: UserProfile;
}

export interface PredictionData {
  id: string;
  risk_score: number;
  risk_tier: string;
  computed_at: string;
  data_completeness_pct: number;
  missing_inputs_count: number;
}

export interface PredictionResponse {
  success: boolean;
  status: number;
  message: string;
  data: PredictionData;
}

export interface MoodSummary {
  affect_quadrant: string;
  phq4_total: number;
}

export interface DashboardData {
  profile: UserProfile | null;
  todayStatus: {
    morning_status: 'pending' | 'in_progress' | 'complete';
    evening_status: 'pending' | 'in_progress' | 'complete';
    streak_days: number;
    completeness_pct: number;
  } | null;
  prediction: PredictionData | null;
  mood: MoodSummary | null;
}

export const dashboardService = {
  getUserProfile: async (): Promise<UserProfileResponse> => {
    const res = await apiClient.get('/auth/me/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getLatestPrediction: async (): Promise<PredictionResponse> => {
    const res = await apiClient.get('/predictions/latest/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getMoodSummary: async (): Promise<MoodSummary | null> => {
    try {
      const res = await apiClient.get('/mood/summary/today/');
      const body = res.data;
      ensureSuccess(body);
      return body.data || null;
    } catch {
      return null;
    }
  },
};
