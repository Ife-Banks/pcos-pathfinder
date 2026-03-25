import apiClient from '@/services/apiClient';

const BASE = '/rppg';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export interface RppgSession {
  id: string;
  rmssd: number;
  mean_temp: number;
  mean_eda: number;
  asi?: number;
  session_type: 'morning' | 'evening' | 'baseline' | 'checkin';
  session_quality?: 'good' | 'poor' | 'motion_artifact';
  created_at: string;
}

export interface RppgSessionPayload {
  rmssd: number;
  mean_temp: number;
  mean_eda: number;
  asi?: number;
  session_type: 'morning' | 'evening' | 'baseline' | 'checkin';
  session_quality?: 'good' | 'poor' | 'motion_artifact';
}

export interface RppgPrediction {
  CVD: number;
  T2D: number;
  Metabolic: number;
  HeartFailure: number;
  Stress?: number;
  Infertility?: number;
}

export interface RppgPredictionResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    predictions: RppgPrediction;
    risk_level?: 'low' | 'moderate' | 'high' | 'critical';
    stress_level?: 'low' | 'moderate' | 'high';
    recommendations?: string[];
  };
}

export interface RppgSessionsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    sessions: RppgSession[];
    total: number;
    page?: number;
    total_pages?: number;
  };
}

export interface RppgPredictionsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    predictions: Array<{
      id: string;
      prediction_type: string;
      results: RppgPrediction;
      created_at: string;
    }>;
    total: number;
  };
}

export interface RppgAnomalyResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    is_anomaly: boolean;
    anomaly_score: number;
    anomaly_type?: string;
    confidence: number;
    explanation?: string;
  };
}

export const rppgService = {
  // Log a new rPPG session
  logSession: async (payload: RppgSessionPayload): Promise<{ success: boolean; data: { session: RppgSession; total_sessions: number } }> => {
    const res = await apiClient.post(`${BASE}/session`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // Get session history
  getSessions: async (): Promise<RppgSessionsResponse> => {
    const res = await apiClient.get(`${BASE}/sessions`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // Get prediction history
  getPredictions: async (): Promise<RppgPredictionsResponse> => {
    const res = await apiClient.get(`${BASE}/predictions`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // Predict metabolic & cardiovascular risks
  predictMetabolicCardio: async (): Promise<RppgPredictionResponse> => {
    const res = await apiClient.post(`${BASE}/predict/metabolic-cardio`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // Predict stress & reproductive risks
  predictStressReproductive: async (): Promise<RppgPredictionResponse> => {
    const res = await apiClient.post(`${BASE}/predict/stress-reproductive`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // Detect anomalies
  predictAnomaly: async (): Promise<RppgAnomalyResponse> => {
    const res = await apiClient.post(`${BASE}/predict/anomaly`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },
};
