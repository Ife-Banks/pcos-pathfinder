import apiClient from '@/services/apiClient';

const BASE = '/mood';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.status === 'success' || body?.success === true;
  if (!isSuccess) throw body;
  return body;
};

export interface PHQ4Response {
  success: boolean;
  status: number;
  message: string;
  data: {
    phq4_anxiety_score: number;
    phq4_depression_score: number;
    phq4_total: number;
    log_date: string;
  };
}

export interface AffectResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    affect_valence: number;
    affect_arousal: number;
    affect_quadrant: string;
    log_date: string;
  };
}

export interface FocusResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    cognitive_load_score: number;
    log_date: string;
  };
}

export interface SleepResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    sleep_satisfaction: number;
    hours_slept: number;
    log_date: string;
  };
}

export interface PredictionResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    predictions: Record<string, {
      risk_probability: number;
      risk_score: number;
      risk_flag: number;
      severity: string;
      threshold_used: number;
    }>;
    derived_features: Record<string, number>;
    criterion_flags: Record<string, unknown>;
    days_logged: number;
  };
}

export const moodService = {
  logPHQ4: async (payload: {
    phq4_item1: number;
    phq4_item2: number;
    phq4_item3: number;
    phq4_item4: number;
    log_date: string;
  }): Promise<PHQ4Response> => {
    const res = await apiClient.post(`${BASE}/log/phq4`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  logAffect: async (payload: {
    affect_valence: number;
    affect_arousal: number;
    log_date: string;
  }): Promise<AffectResponse> => {
    const res = await apiClient.post(`${BASE}/log/affect`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  logFocus: async (payload: {
    focus_score: number;
    memory_score: number;
    mental_fatigue: number;
    log_date: string;
  }): Promise<FocusResponse> => {
    const res = await apiClient.post(`${BASE}/log/focus`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  logSleep: async (payload: {
    sleep_quality: number;
    hours_slept: number;
    log_date: string;
  }): Promise<SleepResponse> => {
    const res = await apiClient.post(`${BASE}/log/sleep`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  predictMentalHealth: async (): Promise<PredictionResponse> => {
    const res = await apiClient.post(`${BASE}/predict/mental-health`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  predictMetabolic: async (): Promise<PredictionResponse> => {
    const res = await apiClient.post(`${BASE}/predict/metabolic`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  predictCardioNeuro: async (): Promise<PredictionResponse> => {
    const res = await apiClient.post(`${BASE}/predict/cardio-neuro`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  predictReproductive: async (): Promise<PredictionResponse> => {
    const res = await apiClient.post(`${BASE}/predict/reproductive`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },
};
