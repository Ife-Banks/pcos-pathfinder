import apiClient from '@/services/apiClient';

const ensureSuccess = (body: any) => {
  if (body.status !== 'success') throw body;
  return body;
};

export interface SHAPDriver {
  feature: string;
  display_name: string;
  value: number;
  shap_value: number;
  direction: 'increases_risk' | 'decreases_risk';
  explanation: string;
}

export interface PredictionRecord {
  id: string;
  risk_score: number;
  risk_tier: string;
  triage_class?: string;
  computed_at: string;
  data_completeness_pct?: number;
  missing_inputs_count?: number;
  shap_drivers?: SHAPDriver[];
  data_layers_used?: string[];
}

export interface PredictionResponse {
  success: boolean;
  status: number;
  message: string;
  data: PredictionRecord;
}

export interface SHAPFeature {
  feature_key: string;
  display_name: string;
  value: number;
  unit: string;
  shap_value: number;
  direction: 'increases_risk' | 'decreases_risk';
  bar_pct?: number;
  explanation: string;
  vs_last_week?: {
    delta: number;
    direction: 'up' | 'down' | 'stable';
    label: string;
  };
}

export interface SHAPFeaturesResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    prediction_id: string;
    features: SHAPFeature[];
  };
}

export interface ReferralRecommendation {
  urgency: 'Urgent' | 'Priority' | 'Routine';
  risk_score: number;
  risk_tier: string;
  recommendation_timeframe: string;
  recommended_specialist: string;
  specialist_reason: string;
  key_clinical_findings: Array<{
    label: string;
    value: string;
    status: string;
  }>;
  recommended_evaluations: string[];
  nearby_specialists?: Array<{
    name: string;
    specialty: string;
    practice?: string;
    address: string;
    next_available?: string;
    phone?: string;
    distance_miles?: number;
  }>;
}

export interface ReferralResponse {
  success: boolean;
  status: number;
  message: string;
  data: ReferralRecommendation;
}

export const predictionService = {
  getLatest: async (): Promise<PredictionResponse> => {
    const res = await apiClient.get('/predictions/latest/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getHistory: async (): Promise<{ results: PredictionRecord[] }> => {
    const res = await apiClient.get('/predictions/history/');
    const body = res.data;
    ensureSuccess(body);
    if (body.results) return { results: body.results };
    return { results: Array.isArray(body) ? body : [] };
  },

  getFeatures: async (predictionId: string): Promise<SHAPFeaturesResponse> => {
    const res = await apiClient.get(`/predictions/${predictionId}/features/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getReferral: async (): Promise<ReferralResponse> => {
    const res = await apiClient.get('/predict/pcos/referral/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },
};
