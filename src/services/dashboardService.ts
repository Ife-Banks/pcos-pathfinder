import axios from 'axios';
import apiClient from '@/services/apiClient';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export interface UserProfile {
  id: string;
  email: string;
  unique_id: string | null;
  full_name: string;
  role: string;
  avatar_url: string | null;
  is_email_verified: boolean;
  onboarding_completed: boolean;
  onboarding_step: number;
  date_joined: string;
  gender?: string;
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
  // Combined Symptom + Menstrual (for dashboard display)
  menstrual_risks?: {
    Infertility: number;
    Dysmenorrhea: number;
    PMDD: number;
    Endometrial_Cancer: number;
    T2D: number;
    CVD: number;
  };
  // Separate Symptom Intensity risks
  symptom_intensity_risks?: {
    Infertility: number;
    Dysmenorrhea: number;
    PMDD: number;
    Endometrial_Cancer: number;
    T2D: number;
    CVD: number;
  };
  // rPPG + Mood (for dashboard display)
  rppg_risks?: {
    metabolic: {
      CVD: number;
      T2D: number;
      Metabolic: number;
      HeartFailure: number;
    };
    reproductive: {
      Stress: number;
      Infertility: number;
    };
    mood?: {
      Anxiety: number;
      Depression: number;
      ChronicStress: number;
      MetSyn: number;
      Stroke: number;
    };
    anomaly?: {
      is_anomaly: boolean;
      anomaly_score: number;
      confidence: number;
      explanation: string;
    };
  };
  last_updated: string;
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

  // NEW: Get comprehensive ML predictions
  getMLPredictions: async (): Promise<PredictionResponse> => {
    try {
      // Get unified PCOS risk score from Django (which combines all 4 models)
      const res = await apiClient.get('/predictions/pcos/');
      const body = res.data;
      
      // Check if response is success (even if data is null)
      if (!body || body.status === 'error') {
        return {
          success: true,
          status: 200,
          message: 'No predictions available',
          data: null as any
        };
      }
      
      const pcosData = body.data;
      
      if (!pcosData) {
        return {
          success: true,
          status: 200,
          message: 'No predictions yet',
          data: null as any
        };
      }

      // Extract predictions from all 4 models
      const symptomPreds = pcosData.all_predictions?.symptom_intensity || {};
      const menstrualPreds = pcosData.all_predictions?.menstrual || {};
      const rppgPreds = pcosData.all_predictions?.rppg || {};
      const moodPreds = pcosData.all_predictions?.mood || {};

      const combinedData: PredictionData = {
        id: pcosData.id,
        risk_score: pcosData.risk_score * 100, // Convert to percentage
        risk_tier: pcosData.risk_tier,
        computed_at: pcosData.computed_at,
        data_completeness_pct: pcosData.data_completeness_pct || 85,
        missing_inputs_count: 2,
        // Symptom Intensity predictions - use risk_score (continuous 0-1)
        symptom_intensity_risks: {
          Infertility: symptomPreds.Infertility?.risk_score || 0,
          Dysmenorrhea: symptomPreds.Dysmenorrhea?.risk_score || 0,
          PMDD: symptomPreds.PMDD?.risk_score || 0,
          Endometrial_Cancer: symptomPreds.Endometrial?.risk_score || 0,
          T2D: symptomPreds.T2D?.risk_score || 0,
          CVD: symptomPreds.CVD?.risk_score || 0,
        },
        // Combined Symptom + Menstrual (for dashboard display) - use risk_score
        menstrual_risks: {
          Infertility: Math.max(
            symptomPreds.Infertility?.risk_score || 0,
            menstrualPreds.Infertility?.risk_score || 0
          ),
          Dysmenorrhea: Math.max(
            symptomPreds.Dysmenorrhea?.risk_score || 0,
            menstrualPreds.Dysmenorrhea?.risk_score || 0
          ),
          PMDD: Math.max(
            symptomPreds.PMDD?.risk_score || 0,
            menstrualPreds.PMDD?.risk_score || 0,
            moodPreds.PMDD?.risk_score || 0
          ),
          Endometrial_Cancer: Math.max(
            symptomPreds.Endometrial?.risk_score || 0,
            menstrualPreds.Endometrial?.risk_score || 0
          ),
          T2D: Math.max(
            symptomPreds.T2D?.risk_score || 0,
            menstrualPreds.T2D?.risk_score || 0,
            moodPreds.T2D_Mood?.risk_score || 0
          ),
          CVD: Math.max(
            symptomPreds.CVD?.risk_score || 0,
            menstrualPreds.CVD?.risk_score || 0,
            moodPreds.CVD_Mood?.risk_score || 0
          ),
        },
        // rPPG + Mood (for dashboard display) - use risk_score
        rppg_risks: {
          metabolic: {
            CVD: rppgPreds.CVD?.risk_score || 0,
            T2D: rppgPreds.T2D?.risk_score || 0,
            Metabolic: rppgPreds.Metabolic?.risk_score || 0,
            HeartFailure: rppgPreds.HeartFailure?.risk_score || 0,
          },
          reproductive: {
            Stress: rppgPreds.Stress?.risk_score || 0,
            Infertility: rppgPreds.Infertility?.risk_score || 0,
          },
          mood: {
            Anxiety: moodPreds.Anxiety?.risk_score || 0,
            Depression: moodPreds.Depression?.risk_score || 0,
            ChronicStress: moodPreds.ChronicStress?.risk_score || 0,
            MetSyn: moodPreds.MetSyn_Mood?.risk_score || 0,
            Stroke: moodPreds.Stroke_Mood?.risk_score || 0,
          },
        },
        last_updated: new Date().toISOString()
      };

      return {
        success: true,
        status: 200,
        message: 'ML predictions retrieved successfully',
        data: combinedData
      };
    } catch (error: any) {
      if (axios.isCancel(error) || error?.message === 'canceled' || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        // Request was aborted - this is expected during navigation
        return {
          success: false,
          status: 0,
          message: 'Request aborted',
          data: null as any
        };
      }
      // Silently return null for other errors (like 404 from production backend)
      return {
        success: false,
        status: 500,
        message: 'Failed to get ML predictions',
        data: null as any
      };
    }
  },

  // NEW: Get menstrual model information
  getMenstrualModelInfo: async () => {
    try {
      const res = await menstrualService.getModelInfo();
      return res.data;
    } catch (error) {
      console.error('Error getting menstrual model info:', error);
      throw error;
    }
  },

  // NEW: Get menstrual features
  getMenstrualFeatures: async () => {
    try {
      const res = await menstrualService.getFeatures();
      return res.data;
    } catch (error) {
      console.error('Error getting menstrual features:', error);
      throw error;
    }
  },

  // NEW: Get rPPG session history
  getRppgSessions: async () => {
    try {
      const res = await rppgService.getSessions();
      return res.data;
    } catch (error) {
      console.error('Error getting rPPG sessions:', error);
      throw error;
    }
  },

  // NEW: Get latest rPPG session
  getLatestRppgSession: async () => {
    try {
      const res = await rppgService.getSessions();
      const sessions = res.data.sessions;
      return sessions.length > 0 ? sessions[0] : null;
    } catch (error) {
      console.error('Error getting latest rPPG session:', error);
      return null;
    }
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
