import apiClient from '@/services/apiClient';

const BASE = '/checkin/mfg';

const ensureSuccess = (body: any) => {
  if (body.status !== 'success') throw body;
  return body;
};

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
    const res = await apiClient.get(`${BASE}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  submit: async (payload: MFGSubmission): Promise<MFGResponse> => {
    const res = await apiClient.post(`${BASE}/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },
};
