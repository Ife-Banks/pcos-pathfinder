const BASE = 'https://ai-mshm-backend-d47t.onrender.com';

function getHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

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
    const res = await fetch(`${BASE}/api/v1/mood/log/phq4`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  logAffect: async (payload: {
    affect_valence: number;
    affect_arousal: number;
    log_date: string;
  }): Promise<AffectResponse> => {
    const res = await fetch(`${BASE}/api/v1/mood/log/affect`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  logFocus: async (payload: {
    focus_score: number;
    memory_score: number;
    mental_fatigue: number;
    log_date: string;
  }): Promise<FocusResponse> => {
    const res = await fetch(`${BASE}/api/v1/mood/log/focus`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  logSleep: async (payload: {
    sleep_quality: number;
    hours_slept: number;
    log_date: string;
  }): Promise<SleepResponse> => {
    const res = await fetch(`${BASE}/api/v1/mood/log/sleep`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  predictMentalHealth: async (): Promise<PredictionResponse> => {
    const res = await fetch(`${BASE}/api/v1/mood/predict/mental-health`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  predictMetabolic: async (): Promise<PredictionResponse> => {
    const res = await fetch(`${BASE}/api/v1/mood/predict/metabolic`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  predictCardioNeuro: async (): Promise<PredictionResponse> => {
    const res = await fetch(`${BASE}/api/v1/mood/predict/cardio-neuro`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  predictReproductive: async (): Promise<PredictionResponse> => {
    const res = await fetch(`${BASE}/api/v1/mood/predict/reproductive`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
};