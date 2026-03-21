import apiClient from '@/services/apiClient';

const BASE = '/checkin/mfg';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
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
  assessed_date: string;
  mfg_upper_lip: number;
  mfg_chin: number;
  mfg_chest: number;
  mfg_upper_back: number;
  mfg_lower_back: number;
  mfg_upper_abdomen: number;
  mfg_lower_abdomen: number;
  mfg_upper_arm: number;
  mfg_thigh: number;
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
