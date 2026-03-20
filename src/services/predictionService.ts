const BASE = 'https://ai-mshm-backend-d47t.onrender.com';

function getHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

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
    const res = await fetch(`${BASE}/api/v1/predictions/latest/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getHistory: async (): Promise<{ results: PredictionRecord[] }> => {
    const res = await fetch(`${BASE}/api/v1/predictions/history/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    if (data.results) return { results: data.results };
    return { results: Array.isArray(data) ? data : [] };
  },

  getFeatures: async (predictionId: string): Promise<SHAPFeaturesResponse> => {
    const res = await fetch(`${BASE}/api/v1/predictions/${predictionId}/features/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getReferral: async (): Promise<ReferralResponse> => {
    const res = await fetch(`${BASE}/api/v1/predict/pcos/referral/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
};
