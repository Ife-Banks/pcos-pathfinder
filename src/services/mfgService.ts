const BASE = 'https://ai-mshm-backend-d47t.onrender.com';

function getHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export interface MFGZone {
  zone: string;
  score: number;
}

export interface MFGResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    total_score: number;
    severity: string;
    log_date: string;
  };
}

export interface MFGSubmission {
  upper_lip: number;
  chin: number;
  chest: number;
  upper_abdomen: number;
  lower_abdomen: number;
  upper_arm: number;
  thigh: number;
  upper_back: number;
  log_date: string;
}

export const mfgService = {
  getLatest: async (): Promise<MFGResponse> => {
    const res = await fetch(`${BASE}/api/v1/checkin/mfg/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  submit: async (payload: MFGSubmission): Promise<MFGResponse> => {
    const res = await fetch(`${BASE}/api/v1/checkin/mfg/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
};
