import apiClient from '@/services/apiClient';

const BASE = '/checkin';

const ensureSuccess = (body: any) => {
  if (body.status !== 'success') throw body;
  return body;
};

export interface CheckinTodayResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    date: string;
    morning_status: 'complete' | 'pending' | 'in_progress';
    evening_status: 'complete' | 'pending' | 'in_progress';
    morning_session_id: string | null;
    evening_session_id: string | null;
    completeness_pct: number;
    streak_days: number;
    missed_yesterday: string[];
  };
}

export interface StartSessionResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    id: string;
    period: 'morning' | 'evening';
    started_at: string;
  };
}

export interface MorningCheckinResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    fatigue_vas: number;
    pelvic_pressure_vas: number;
    psq_skin_sensitivity: number;
    psq_muscle_pressure_pain: number;
    psq_body_tenderness: number;
    hyperalgesia_index: number;
    logged_at: string;
  };
}

export interface EveningCheckinResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    breast_left_vas: number;
    breast_right_vas: number;
    mastalgia_side: string;
    mastalgia_quality: string;
    acne_forehead: number;
    acne_right_cheek: number;
    acne_left_cheek: number;
    acne_nose: number;
    acne_chin: number;
    acne_chest_back: number;
    acne_score: number;
    bloating_delta_cm: number | null;
    unusual_bleeding: boolean;
    logged_at: string;
  };
}

export interface HRVResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    session_id: string;
    hrv_sdnn_ms: number;
    hrv_rmssd_ms: number;
    logged_at: string;
  };
}

export interface SessionSubmitResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    session_id: string;
    submitted_at: string;
    predictions_triggered: boolean;
  };
}

export const checkinService = {
  getTodayStatus: async (): Promise<CheckinTodayResponse> => {
    const res = await apiClient.get(`${BASE}/today/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  startSession: async (period: 'morning' | 'evening'): Promise<StartSessionResponse> => {
    const res = await apiClient.post(`${BASE}/session/start/`, { period });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  submitMorningCheckin: async (sessionId: string, payload: {
    fatigue_vas: number;
    pelvic_pressure_vas: number;
    psq_skin_sensitivity: number;
    psq_muscle_pressure_pain: number;
    psq_body_tenderness: number;
  }): Promise<MorningCheckinResponse> => {
    const res = await apiClient.post(`${BASE}/morning/${sessionId}/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  submitEveningCheckin: async (sessionId: string, payload: {
    breast_left_vas: number;
    breast_right_vas: number;
    mastalgia_side: string;
    mastalgia_quality: string;
    acne_forehead: number;
    acne_right_cheek: number;
    acne_left_cheek: number;
    acne_nose: number;
    acne_chin: number;
    acne_chest_back: number;
    bloating_delta_cm: number | null;
    unusual_bleeding: boolean;
  }): Promise<EveningCheckinResponse> => {
    const res = await apiClient.post(`${BASE}/evening/${sessionId}/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  submitHRV: async (payload: {
    session_id: string;
    hrv_sdnn_ms?: number;
    hrv_rmssd_ms?: number;
    skipped: boolean;
  }): Promise<HRVResponse> => {
    const res = await apiClient.post(`${BASE}/hrv/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  submitSession: async (sessionId: string): Promise<SessionSubmitResponse> => {
    const res = await apiClient.post(`${BASE}/session/${sessionId}/submit/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  autosave: async (sessionId: string, payload: Record<string, unknown>): Promise<void> => {
    const res = await apiClient.post(`${BASE}/session/${sessionId}/autosave/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return;
  },
};
