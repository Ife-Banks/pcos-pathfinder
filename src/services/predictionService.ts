import apiClient from '@/services/apiClient';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
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

export interface DiseasePrediction {
  risk_score: number;
  risk_probability: number;
  severity: string;
  risk_flag?: number;
}

export interface ModelPredictions {
  symptom_intensity?: Record<string, DiseasePrediction>;
  menstrual?: Record<string, DiseasePrediction>;
  rppg?: Record<string, DiseasePrediction>;
  mood?: Record<string, DiseasePrediction>;
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
  all_predictions?: ModelPredictions;
}

export interface ComprehensivePrediction {
  id: string;
  final_risk_score: number;
  risk_tier: string;
  all_predictions: {
    symptom: Record<string, DiseasePrediction>;
    menstrual: Record<string, DiseasePrediction>;
    rppg: Record<string, DiseasePrediction>;
    mood: Record<string, DiseasePrediction>;
  };
  data_layers_used: string[];
  data_completeness_pct: number;
  data_sources: Array<{
    layer: string;
    name: string;
    description: string;
    icon: string;
    active: boolean;
  }>;
  severity_flags: {
    ovulatory_dysfunction?: boolean;
    hyperandrogenism?: boolean;
    metabolic_stress?: boolean;
    pcom_suspected?: boolean;
  };
  clinical_flags: Array<{
    flag: string;
    label: string;
    description: string;
    severity: string;
  }>;
  highest_risk_disease: string;
  highest_risk_model: string;
  patient_notified: boolean;
  escalated_to_phc: boolean;
  escalated_to_fmc: boolean;
  computed_at: string;
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

  getPCOSRiskScore: async (): Promise<PredictionResponse> => {
    const res = await apiClient.get('/predictions/pcos/');
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

  // Comprehensive prediction methods
  getComprehensive: async (): Promise<{ data: ComprehensivePrediction }> => {
    const res = await apiClient.get('/predictions/comprehensive/');
    return res.data;
  },

  triggerComprehensive: async (): Promise<{ data: ComprehensivePrediction }> => {
    const res = await apiClient.post('/predictions/comprehensive/');
    return res.data;
  },

  // Per-model escalation triggers
  escalateMood: async (predictions: Record<string, DiseasePrediction>) => {
    const res = await apiClient.post('/predictions/escalate/mood/', { predictions });
    return res.data;
  },

  escalateMenstrual: async (predictions: Record<string, DiseasePrediction>, criterionFlags?: any) => {
    const res = await apiClient.post('/predictions/escalate/menstrual/', { 
      predictions,
      criterion_flags: criterionFlags || {}
    });
    return res.data;
  },

  escalateRppg: async (predictions: Record<string, DiseasePrediction>) => {
    const res = await apiClient.post('/predictions/escalate/rppg/', { predictions });
    return res.data;
  },
};
