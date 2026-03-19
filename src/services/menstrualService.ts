const DJANGO_BASE = 'https://ai-mshm-backend-d47t.onrender.com';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

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
  totalMensesScore: number;
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

export const menstrualService = {
  logCycle: async (payload: LogCyclePayload): Promise<LogCycleResponse> => {
    const res = await fetch(`${DJANGO_BASE}/api/v1/menstrual/log-cycle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getMenstrualPrediction: async (): Promise<PredictResponse> => {
    const res = await fetch(`${DJANGO_BASE}/api/v1/menstrual/predict`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getCycleHistory: async (): Promise<HistoryResponse> => {
    const res = await fetch(`${DJANGO_BASE}/api/v1/menstrual/history`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
};