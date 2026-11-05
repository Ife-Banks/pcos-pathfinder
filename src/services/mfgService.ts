import apiClient from '@/services/apiClient';

const BASE = '/checkin/hair-pattern';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export interface HairPatternSubmission {
  assessed_date: string;
  hair_upper_lip: number;
  hair_chin: number;
  hair_chest: number;
  hair_upper_back: number;
  hair_lower_back: number;
  hair_upper_abdomen: number;
  hair_lower_abdomen: number;
  hair_upper_arm: number;
  hair_thigh: number;
  // Optional add-ons
  hair_axillary?: number | null;
  hair_pubic?: number | null;
  scalp_hamilton_norwood?: number | null;
}

export interface HairPatternResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    id: string;
    assessed_date: string;
    hair_upper_lip: number;
    hair_chin: number;
    hair_chest: number;
    hair_upper_back: number;
    hair_lower_back: number;
    hair_upper_abdomen: number;
    hair_lower_abdomen: number;
    hair_upper_arm: number;
    hair_thigh: number;
    hair_axillary: number | null;
    hair_pubic: number | null;
    scalp_hamilton_norwood: number | null;
    total_score: number;
    baseline_score: number | null;
    baseline_date: string | null;
    percent_change_from_baseline: number | null;
    trend_label: 'Stable' | 'Decreasing' | 'Increasing' | 'Insufficient_Data' | null;
    hirsutism_severity: 'Normal' | 'Mild' | 'Moderate' | 'Severe' | null;
  } | null;
}

export const hairPatternService = {
  getLatest: async (): Promise<HairPatternResponse> => {
    const res = await apiClient.get(`${BASE}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  submit: async (payload: HairPatternSubmission): Promise<HairPatternResponse> => {
    const res = await apiClient.post(`${BASE}/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },
};

// Backward-compatible aliases for existing imports
export const mfgService = hairPatternService;
export type MFGSubmission = HairPatternSubmission;
export type MFGResponse = HairPatternResponse;
