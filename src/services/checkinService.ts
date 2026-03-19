const BASE = 'https://ai-mshm-backend-d47t.onrender.com';

function getHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

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
    session_id: string;
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
    const res = await fetch(`${BASE}/api/v1/checkin/today/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  startSession: async (period: 'morning' | 'evening'): Promise<StartSessionResponse> => {
    const res = await fetch(`${BASE}/api/v1/checkin/session/start/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ period }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  submitMorningCheckin: async (sessionId: string, payload: {
    fatigue_vas: number;
    pelvic_pressure_vas: number;
    psq_skin_sensitivity: number;
    psq_muscle_pressure_pain: number;
    psq_body_tenderness: number;
  }): Promise<MorningCheckinResponse> => {
    const res = await fetch(`${BASE}/api/v1/checkin/morning/${sessionId}/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
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
    const res = await fetch(`${BASE}/api/v1/checkin/evening/${sessionId}/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  submitHRV: async (payload: {
    session_id: string;
    hrv_sdnn_ms?: number;
    hrv_rmssd_ms?: number;
    skipped: boolean;
  }): Promise<HRVResponse> => {
    const res = await fetch(`${BASE}/api/v1/checkin/hrv/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  submitSession: async (sessionId: string): Promise<SessionSubmitResponse> => {
    const res = await fetch(`${BASE}/api/v1/checkin/session/${sessionId}/submit/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
};