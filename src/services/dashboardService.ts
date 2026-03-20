const BASE = 'https://ai-mshm-backend-d47t.onrender.com';

function getHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

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
    const res = await fetch(`${BASE}/api/v1/auth/me/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getLatestPrediction: async (): Promise<PredictionResponse> => {
    const res = await fetch(`${BASE}/api/v1/predictions/latest/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getMoodSummary: async (): Promise<{ affect_quadrant: string; phq4_total: number } | null> => {
    try {
      const res = await fetch(`${BASE}/api/v1/mood/summary/today/`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data || null;
    } catch {
      return null;
    }
  },
};
