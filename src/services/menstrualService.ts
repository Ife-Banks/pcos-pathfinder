import apiClient from '@/services/apiClient';

const BASE = '/menstrual';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export interface CriteriaItem {
  criterion: number;
  condition: 'oligomenorrhea' | 'amenorrhea_risk' | 'irregular_cycle_pattern';
  description: string;
  triggered: boolean;
  value: number | null;
  threshold: number;
}

export interface CriterionFlags {
  criterion_1_positive: 0 | 1;
  criteria: CriteriaItem[];
  summary: string;
}

export interface DerivedFeatures {
  CLV: number;
  mean_cycle_len: number;
  mean_luteal: number;
  luteal_std: number;
  anovulatory_rate: number;
  mean_menses_len: number;
  mean_menses_score: number;
  unusual_bleed_rate: number;
  mean_fertility_days: number;
  n_cycles: number;
}

export interface DiseasePrediction {
  risk_probability: number;
  risk_score: number;
  risk_flag: 0 | 1;
  severity: 'Minimal' | 'Mild' | 'Moderate' | 'Severe' | 'Extreme';
  threshold_used: number;
}

export interface Predictions {
  Infertility: DiseasePrediction;
  Dysmenorrhea: DiseasePrediction;
  PMDD: DiseasePrediction;
  Endometrial: DiseasePrediction;
  T2D: DiseasePrediction;
  CVD: DiseasePrediction;
}

export interface LogCycleResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    cycle: {
      id: string;
      cycleLength: number | null;
      mensesLength: number;
      cycleNumber: number;
    };
    updated_aggregates: DerivedFeatures;
    total_cycles_stored: number;
    criterion_flags: CriterionFlags;
  };
}

export interface PredictResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    predictions: Predictions;
    derived_features: DerivedFeatures;
    cycles_used: number;
    criterion_flags: CriterionFlags;
  };
}

export interface CycleAggregates {
  CLV: number;
  mean_cycle_len: number;
  mean_luteal: number;
  luteal_std: number;
  anovulatory_rate: number;
  mean_menses_len: number;
  mean_menses_score: number;
  unusual_bleed_rate: number;
  mean_fertility_days: number;
  n_cycles: number;
}

export interface Cycle {
  id: string;
  userId: string;
  periodStartDate: string;
  periodEndDate: string;
  bleedingScores: number[];
  hasOvulationPeak: boolean;
  unusualBleeding: boolean;
  rppgOvulationDay: null;
  cycleLength: number | null;
  mensesLength: number;
  total_menses_score: number;
  lutealLength: number | null;
  fertilityDays: number | null;
  ovulationDay: number | null;
  cycleNumber: number;
  loggedAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    cycles: Cycle[];
    total: number;
    aggregates: CycleAggregates;
    criterion_flags: CriterionFlags;
  };
}

interface LogCyclePayload {
  period_start_date: string;
  period_end_date: string;
  bleeding_scores: number[];
  has_ovulation_peak: boolean;
  unusual_bleeding: boolean;
  rppg_ovulation_day: null;
}

export interface FeatureInfo {
  name: string;
  description: string;
  type: string;
  range: string;
}

export interface ModelInfo {
  diseases: Array<{
    name: string;
    flag_threshold: number;
  }>;
  severity_bins: number[];
  severity_labels: string[];
  model_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
  };
  trained_at: string;
  module: string;
}

export interface FeaturesResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    features: FeatureInfo[];
  };
}

export interface ModelInfoResponse {
  success: boolean;
  status: number;
  message: string;
  data: ModelInfo;
}

export interface PredictFromLogsPayload {
  cycles: Array<{
    period_start_date: string;
    period_end_date: string;
    bleeding_scores: number[];
    has_ovulation_peak: boolean;
    unusual_bleeding: boolean;
  }>;
  rppg_ovulation_day?: number | null;
}

export interface PredictFromLogsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    predictions: {
      Infertility: number;
      Dysmenorrhea: number;
      PMDD: number;
      Endometrial_Cancer: number;
      T2D: number;
      CVD: number;
    };
    derived_features: DerivedFeatures;
    criterion_flags: CriterionFlags;
  };
}

export const menstrualService = {
  logCycle: async (payload: LogCyclePayload): Promise<LogCycleResponse> => {
    const res = await apiClient.post(`${BASE}/log-cycle`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getMenstrualPrediction: async (): Promise<PredictResponse> => {
    const res = await apiClient.post(`${BASE}/predict`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getCycleHistory: async (): Promise<HistoryResponse> => {
    const res = await apiClient.get(`${BASE}/history`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // NEW: Get feature schema
  getFeatures: async (): Promise<FeaturesResponse> => {
    const res = await apiClient.get(`${BASE}/features`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // NEW: Get model information
  getModelInfo: async (): Promise<ModelInfoResponse> => {
    const res = await apiClient.get(`${BASE}/model-info`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // NEW: Predict from raw logs (stateless)
  predictFromLogs: async (payload: PredictFromLogsPayload): Promise<PredictFromLogsResponse> => {
    const res = await apiClient.post(`${BASE}/predict/from-logs`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },
};
