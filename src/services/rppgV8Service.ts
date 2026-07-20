import apiClient from '@/services/apiClient';

const BASE = '/rppg-v8';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export interface RppgV8SessionPayload {
  rmssd: number;
  hf: number;
  lf_hf_ratio: number;
  heart_rate: number;
  hrv: number;
  estimated_spo2: number;
  skin_temperature: number;
  hr_trend: number | null;
  mean_eda: number;
  mean_temp: number;
  asi: number | null;
  rmssd_trend: number | null;
  ac: number | null;
  dc: number | null;
  ac_dc_ratio: number | null;
  pulse_amplitude: number | null;
  signal_quality: number | null;
  respiratory_rate: number | null;
  session_type: 'morning' | 'evening' | 'baseline' | 'checkin';
  session_quality: 'good' | 'poor' | 'motion_artifact' | null;
}

export interface RppgV8RegressionResult {
  target: string;
  predictions: Record<string, number | null>;
  ensemble: number | null;
}

export interface RppgV8RiskResult {
  domain: string;
  risk_score: number | null;
  risk_probability: number | null;
  risk_flag: number;
  severity: string | null;
}

export interface RppgV8MoodResult {
  best_prediction: {
    label: string;
    confidence: number;
    probabilities: number[];
  } | null;
  best_algorithm: string;
  all_predictions: Record<string, { label: string; confidence: number }>;
  classes: string[];
}

export interface RppgV8DLResult {
  target: string;
  predictions: Record<string, number | null>;
  ensemble: number | null;
  method: 'deep_learning';
}

export interface RppgV8PredictAllResult {
  regression: Record<string, RppgV8RegressionResult>;
  risk: Record<string, RppgV8RiskResult>;
  mood_check: RppgV8MoodResult | null;
  deep_learning: Record<string, RppgV8DLResult>;
  feature_vector: Record<string, number>;
  nSessions: number;
}

export interface RppgV8Session {
  id: string;
  userId: string;
  rmssd: number;
  hf: number;
  lfHfRatio: number;
  heartRate: number;
  hrv: number;
  estimatedSpO2: number;
  skinTemperature: number;
  hrTrend: number | null;
  meanEda: number;
  meanTemp: number;
  asi: number | null;
  rmssdTrend: number | null;
  ac: number | null;
  dc: number | null;
  acDcRatio: number | null;
  pulseAmplitude: number | null;
  signalQuality: number | null;
  respiratoryRate: number | null;
  sessionType: string;
  sessionQuality: string | null;
  capturedAt: string;
}

export interface RppgV8PredictionResult {
  id: string;
  userId: string;
  predictedAt: string;
  nSessionsUsed: number;
  sleepQualityScore: number | null;
  focusMemoryScore: number | null;
  mentalWellnessScore: number | null;
  moodScoreScore: number | null;
  metabolicSyndromeScore: number | null;
  t2dScore: number | null;
  cardiovascularScore: number | null;
  heartFailureScore: number | null;
  chronicStressScore: number | null;
  infertilityScore: number | null;
  riskCvdScore: number | null;
  riskT2dScore: number | null;
  riskMetabolicScore: number | null;
  riskHeartFailureScore: number | null;
  riskChronicStressScore: number | null;
  riskInfertilityScore: number | null;
  moodCheckLabel: string | null;
  moodCheckConfidence: number | null;
}

export const rppgV8Service = {
  logSession: async (payload: RppgV8SessionPayload) => {
    const res = await apiClient.post(`${BASE}/session`, payload);
    return ensureSuccess(res.data);
  },

  predictAll: async (): Promise<{ success: boolean; data: RppgV8PredictAllResult }> => {
    const res = await apiClient.post(`${BASE}/predict`);
    return ensureSuccess(res.data);
  },

  predictRegression: async (target: string): Promise<{ success: boolean; data: RppgV8RegressionResult }> => {
    const res = await apiClient.post(`${BASE}/predict/regression`, { target });
    return ensureSuccess(res.data);
  },

  predictRisk: async (domain: string): Promise<{ success: boolean; data: RppgV8RiskResult }> => {
    const res = await apiClient.post(`${BASE}/predict/risk`, { domain });
    return ensureSuccess(res.data);
  },

  predictMood: async (): Promise<{ success: boolean; data: RppgV8MoodResult }> => {
    const res = await apiClient.post(`${BASE}/predict/mood`);
    return ensureSuccess(res.data);
  },

  predictDL: async (target: string): Promise<{ success: boolean; data: RppgV8DLResult }> => {
    const res = await apiClient.post(`${BASE}/predict/dl`, { target });
    return ensureSuccess(res.data);
  },

  getSessions: async (): Promise<{ success: boolean; data: { sessions: RppgV8Session[]; count: number } }> => {
    const res = await apiClient.get(`${BASE}/sessions`);
    return ensureSuccess(res.data);
  },

  getPredictions: async (): Promise<{ success: boolean; data: { predictions: RppgV8PredictionResult[]; count: number } }> => {
    const res = await apiClient.get(`${BASE}/predictions`);
    return ensureSuccess(res.data);
  },

  getMetadata: async (): Promise<{ success: boolean; data: any }> => {
    const res = await apiClient.get(`${BASE}/metadata`);
    return ensureSuccess(res.data);
  },
};

export const REGRESSION_TARGETS = [
  'Sleep_Quality', 'Focus_Memory', 'Mental_Wellness', 'Mood_Score',
  'Metabolic_Syndrome_Risk', 'T2D_Metabolic_Risk_Index', 'Cardiovascular_Risk_Score',
  'Heart_Failure_Alert_Score', 'Chronic_Stress_Severity', 'Infertility_Reproductive_Risk',
] as const;

export const RISK_DOMAINS = [
  'Sleep_Quality', 'Focus_Memory', 'Mental_Wellness', 'Mood_Check',
  'Metabolic_Syndrome', 'Type_2_Diabetes', 'Cardiovascular_Disease',
  'Heart_Failure', 'Chronic_Stress', 'Infertility',
] as const;

export const DL_TARGETS = ['Sleep_Quality', 'Focus_Memory', 'Mental_Wellness', 'Mood_Score'] as const;

export type RegressionTarget = typeof REGRESSION_TARGETS[number];
export type RiskDomain = typeof RISK_DOMAINS[number];
export type DLTarget = typeof DL_TARGETS[number];
