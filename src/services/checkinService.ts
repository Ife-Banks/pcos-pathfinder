import apiClient from '@/services/apiClient';

const BASE = '/checkin';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
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

export interface MorningCheckinPayload {
  fatigue_vas: number;
  pelvic_pressure_vas: number;
  psq_skin_sensitivity: number;
  psq_muscle_pressure_pain: number;
  psq_body_tenderness: number;
  // Male block (optional — sent only for male patients)
  genital_discomfort_vas?: number | null;
  lower_back_hip_pain_vas?: number | null;
  nocturia_count?: number | null;
  urinary_symptoms_vas?: number | null;
  vitality_libido?: number | null;
  vitality_mental_drive?: number | null;
  vitality_morning_erection?: number | null;
}

export interface EveningCheckinPayload {
  // Female modules (sent only for female patients)
  breast_left_vas?: number;
  breast_right_vas?: number;
  mastalgia_side?: string | null;
  mastalgia_quality?: string | null;
  unusual_bleeding?: boolean;
  // Shared modules
  acne_forehead: number;
  acne_right_cheek: number;
  acne_left_cheek: number;
  acne_nose: number;
  acne_chin: number;
  acne_chest_back: number;
  bloating_delta_cm: number | null;
  // Male block (optional — sent only for male patients)
  chest_left_vas?: number | null;
  chest_right_vas?: number | null;
  chest_side?: string | null;
  chest_quality?: string | null;
  nipple_sensitivity_vas?: number | null;
  testicle_left_vas?: number | null;
  testicle_right_vas?: number | null;
  pelvic_ache_vas?: number | null;
  pelvic_quality?: string | null;
  oily_skin_vas?: number | null;
  urinary_urgency?: number | null;
  urinary_weak_stream?: number | null;
  urinary_incomplete_emptying?: number | null;
  urinary_straining?: number | null;
  urinary_daytime_frequency?: number | null;
  libido_vas?: number | null;
  erection_hardness?: string | null;
  evening_energy_vas?: number | null;
  strength_stamina_vas?: number | null;
  low_mood_vas?: number | null;
  hot_flush_intensity_vas?: number | null;
  hot_flush_count?: number | null;
  drowsiness_after_dinner?: boolean;
  red_flag_blood_urine_semen?: boolean;
  red_flag_severe_testicular_pain?: boolean;
  red_flag_unable_pass_urine?: boolean;
  red_flag_prolonged_erection?: boolean;
}

export interface HRVSubmitPayload {
  session_id: string;
  hrv_sdnn_ms?: number;
  hrv_rmssd_ms?: number;
  skipped: boolean;
  hrv_quality_score?: number;
  hrv_artifact_flag?: boolean;
  hrv_reliability_note?: string;
  heart_rate_bpm?: number;
  lf_hf_ratio?: number;
  stress_index_asi?: number;
  skin_temp_celsius?: number;
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

  submitMorningCheckin: async (sessionId: string, payload: MorningCheckinPayload): Promise<any> => {
    const res = await apiClient.post(`${BASE}/morning/${sessionId}/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  submitEveningCheckin: async (sessionId: string, payload: EveningCheckinPayload): Promise<any> => {
    const res = await apiClient.post(`${BASE}/evening/${sessionId}/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  submitHRV: async (payload: HRVSubmitPayload): Promise<any> => {
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
