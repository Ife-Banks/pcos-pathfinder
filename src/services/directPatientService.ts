import apiClient from '@/services/apiClient';

const DIRECT_BASE = '/direct';

interface DirectStatusResponse {
  is_direct: boolean;
  onboarding_step: number | null;
  onboarding_completed: boolean;
  emergency_hospital_count: number;
  next_step: number | string | null;
}

interface Hospital {
  id: string;
  name: string;
  state?: string;
  lga?: string;
  level?: string;
  ownership?: string;
  has_emergency?: boolean;
  is_24h?: boolean;
  address?: string;
}

interface HospitalListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Hospital[];
}

interface EmergencyHospitalsResponse {
  hospital_ids: string[];
  picks: EmergencyPick[];
}

interface EmergencyPick {
  id: string;
  hospital_id: string;
  priority: number;
  hospital: Hospital;
}

export const directPatientService = {

  // GET /api/v1/direct/status/
  getStatus: async (): Promise<DirectStatusResponse> => {
    const res = await apiClient.get(`${DIRECT_BASE}/status/`);
    return res.data;
  },

  // GET /api/v1/direct/hospitals/
  listHospitals: async (params?: {
    state?: string;
    lga?: string;
    level?: string;
    ownership?: string;
    has_emergency?: boolean;
    is_24h?: boolean;
    search?: string;
  }): Promise<HospitalListResponse> => {
    const res = await apiClient.get(`${DIRECT_BASE}/hospitals/`, { params });
    return res.data;
  },

  // GET /api/v1/direct/emergency-hospitals/
  getEmergencyHospitals: async (): Promise<EmergencyHospitalsResponse> => {
    const res = await apiClient.get(`${DIRECT_BASE}/emergency-hospitals/`);
    return res.data;
  },

  // PUT /api/v1/direct/emergency-hospitals/
  updateEmergencyHospitals: async (hospitalIds: string[]): Promise<EmergencyHospitalsResponse> => {
    const res = await apiClient.put(`${DIRECT_BASE}/emergency-hospitals/`, { hospital_ids: hospitalIds });
    return res.data;
  },

  // POST /api/v1/direct/complete/
  completeOnboarding: async (): Promise<{ redirect: string; onboarding_completed: boolean; onboarding_step: number }> => {
    const res = await apiClient.post(`${DIRECT_BASE}/complete/`);
    return res.data;
  },
};