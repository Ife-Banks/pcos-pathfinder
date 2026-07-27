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
  // Unified per-disease scores from weighted ensemble
  unified_disease_scores?: {
    [disease: string]: {
      unified_score: number;
      severity: string;
      contributing_models: number;
      model_contributions: {
        [model: string]: {
          score: number;
          weight: number;
        };
      };
    };
  };
  clinical_rules_triggered?: string[];
  weights_used?: {
    [disease: string]: {
      [model: string]: number;
    };
  };
  calculation_breakdown?: {
    base_scores?: { [disease: string]: number };
    boost_applied?: number;
    clinical_rules_details?: any[];
    data_quality?: { [model: string]: number };
  };
  severity_flags?: {
    ovulatory_dysfunction?: boolean;
    hyperandrogenism?: boolean;
    metabolic_stress?: boolean;
    pcom_suspected?: boolean;
  };
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
      CVD: number | null;
      T2D: number | null;
      Metabolic: number | null;
      HeartFailure: number | null;
    };
    reproductive: {
      Stress: number | null;
      Infertility: number | null;
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
  /** Metadata about rPPG prediction availability (pending vs available) */
  rppg_status?: {
    metabolic_cardio?: {
      status: 'available' | 'pending';
      message?: string;
      current_sessions?: number;
      required_sessions?: number;
      current_span_days?: number;
      required_span_days?: number;
    };
    stress_reproductive?: {
      status: 'available' | 'pending';
      message?: string;
      current_sessions?: number;
      required_sessions?: number;
      current_span_days?: number;
      required_span_days?: number;
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
      const res = await apiClient.get('/predictions/pcos/');
      const body = res.data;
      
      console.log('[getMLPredictions] API response status:', res.status, 'body keys:', Object.keys(body || {}));
      console.log('[getMLPredictions] body:', JSON.stringify(body).substring(0, 500));
      
      // Check if response is success (even if data is null)
      if (!body || body.status === 'error') {
        console.log('[getMLPredictions] Early return: body is null or status error');
        return {
          success: true,
          status: 200,
          message: 'No predictions available',
          data: null as any
        };
      }
      
      const pcosData = body.data;
      
      if (!pcosData) {
        console.log('[getMLPredictions] Early return: pcosData is null/undefined');
        return {
          success: true,
          status: 200,
          message: 'No predictions yet',
          data: null as any
        };
      }

      console.log('[getMLPredictions] pcosData keys:', Object.keys(pcosData));

      // Extract predictions from all 4 models
      const symptomPreds = pcosData.all_predictions?.symptom_intensity || {};
      const menstrualPreds = pcosData.all_predictions?.menstrual || {};
      const rppgPreds = pcosData.all_predictions?.rppg || {};
      const moodPreds = pcosData.all_predictions?.mood || {};

      console.log('[getMLPredictions] unified_disease_scores:', JSON.stringify(pcosData.unified_disease_scores, null, 2));
      console.log('[getMLPredictions] weights_used:', JSON.stringify(pcosData.weights_used, null, 2));
      console.log('[getMLPredictions] clinical_rules_triggered:', pcosData.clinical_rules_triggered);
      console.log('[getMLPredictions] risk_score:', pcosData.risk_score, 'risk_tier:', pcosData.risk_tier);
      console.log('[getMLPredictions] all_predictions keys:', Object.keys(pcosData.all_predictions || {}));
      console.log('[getMLPredictions] data_completeness_pct:', pcosData.data_completeness_pct);
      console.log('[getMLPredictions] data_layers_used:', pcosData.data_layers_used);

      const combinedData: PredictionData = {
        id: pcosData.id,
        risk_score: pcosData.risk_score, // 0-1 scale
        risk_tier: pcosData.risk_tier,
        computed_at: pcosData.computed_at,
        data_completeness_pct: pcosData.data_completeness_pct || 85,
        missing_inputs_count: 2,
        // Unified per-disease scores from weighted ensemble (server-side, replaces client MAX-merge)
        unified_disease_scores: pcosData.unified_disease_scores || undefined,
        clinical_rules_triggered: pcosData.clinical_rules_triggered || undefined,
        weights_used: pcosData.weights_used || undefined,
        calculation_breakdown: pcosData.calculation_breakdown || undefined,
        severity_flags: pcosData.severity_flags || undefined,
        // Symptom Intensity predictions - use risk_score (continuous 0-1)
        symptom_intensity_risks: {
          Infertility: symptomPreds.Infertility?.risk_score || 0,
          Dysmenorrhea: symptomPreds.Dysmenorrhea?.risk_score || 0,
          PMDD: symptomPreds.PMDD?.risk_score || 0,
          Endometrial_Cancer: symptomPreds.Endometrial?.risk_score || 0,
          T2D: symptomPreds.T2D?.risk_score || 0,
          CVD: symptomPreds.CVD?.risk_score || 0,
        },
        // Unified per-disease scores from server-side weighted ensemble (replaces client-side MAX-merge)
        menstrual_risks: pcosData.unified_disease_scores
          ? {
              Infertility: pcosData.unified_disease_scores.Infertility?.unified_score ?? 0,
              Dysmenorrhea: pcosData.unified_disease_scores.Dysmenorrhea?.unified_score ?? 0,
              PMDD: pcosData.unified_disease_scores.PMDD?.unified_score ?? 0,
              Endometrial_Cancer: pcosData.unified_disease_scores.Endometrial?.unified_score ?? 0,
              T2D: pcosData.unified_disease_scores.T2D?.unified_score ?? 0,
              CVD: pcosData.unified_disease_scores.CVD?.unified_score ?? 0,
            }
          : {
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
        // rPPG + Mood (for dashboard display) - use risk_score, preserve nulls
        rppg_risks: {
          metabolic: {
            CVD: rppgPreds.CVD?.risk_score ?? null,
            T2D: rppgPreds.T2D?.risk_score ?? null,
            Metabolic: rppgPreds.Metabolic?.risk_score ?? null,
            HeartFailure: rppgPreds.HeartFailure?.risk_score ?? null,
          },
          reproductive: {
            Stress: rppgPreds.Stress?.risk_score ?? null,
            Infertility: rppgPreds.Infertility?.risk_score ?? null,
          },
          mood: {
            Anxiety: moodPreds.Anxiety?.risk_score || 0,
            Depression: moodPreds.Depression?.risk_score || 0,
            ChronicStress: moodPreds.ChronicStress?.risk_score || 0,
            MetSyn: moodPreds.MetSyn_Mood?.risk_score || 0,
            Stroke: moodPreds.Stroke_Mood?.risk_score || 0,
          },
        },
        rppg_status: pcosData.rppg_status,
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
      console.error('[getMLPredictions] ERROR:', error?.response?.status, error?.response?.data || error?.message);
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
