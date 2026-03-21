import apiClient from '@/services/apiClient';

const BASE = '/onboarding';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export const onboardingAPI = {

  // GET /api/v1/onboarding/profile/
  // Use on mount of every step to pre-fill saved data
  getProfile: async () => {
    const res = await apiClient.get(`${BASE}/profile/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // PATCH /api/v1/onboarding/step/1/
  // Fields: full_name (string), age (integer 10–120),
  //         ethnicity (enum — see choices below)
  saveStep1: async (payload: {
    full_name: string;
    age: number;
    ethnicity: string;
  }) => {
    const res = await apiClient.patch(`${BASE}/step/1/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // PATCH /api/v1/onboarding/step/2/
  // Fields: height_cm (float 50–300), weight_kg (float 20–500)
  // IMPORTANT: DO NOT send bmi — it is computed server-side and
  //            returned in the response. Display it from response.data.bmi
  saveStep2: async (payload: {
    height_cm: number;
    weight_kg: number;
  }) => {
    const res = await apiClient.patch(`${BASE}/step/2/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // PATCH /api/v1/onboarding/step/3/
  // Field: has_skin_changes (boolean) — REQUIRED, cannot be null
  // Do NOT pre-select Yes or No — user must explicitly choose
  saveStep3: async (payload: {
    has_skin_changes: boolean;
  }) => {
    const res = await apiClient.patch(`${BASE}/step/3/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // PATCH /api/v1/onboarding/step/4/
  // Fields: cycle_length_days (int 1–90), periods_per_year (int 0–14),
  //         cycle_regularity ("regular" | "irregular")
  saveStep4: async (payload: {
    cycle_length_days: number;
    periods_per_year: number;
    cycle_regularity: 'regular' | 'irregular';
  }) => {
    const res = await apiClient.patch(`${BASE}/step/4/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // PATCH /api/v1/onboarding/step/5/
  // Field: selected_wearable — one of:
  //   "apple_watch" | "fitbit" | "garmin" | "oura_ring" | "none"
  // "none" is valid — means no wearable / skip
  saveStep5: async (payload: {
    selected_wearable: 'apple_watch' | 'fitbit' | 'garmin' | 'oura_ring' | 'none';
  }) => {
    const res = await apiClient.patch(`${BASE}/step/5/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // POST /api/v1/onboarding/step/6/rppg/
  // Field: baseline_captured (boolean) — MUST be true
  //        Sending false returns a 400 error
  // This step is OPTIONAL — user can skip and still call /complete/
  saveStep6rPPG: async () => {
    const res = await apiClient.post(`${BASE}/step/6/rppg/`, {
      baseline_captured: true,
    });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // PATCH /api/v1/onboarding/step/7/
  // Fields: state (string), lga (string), registered_hcc (string|null)
  // This step is OPTIONAL — user can skip and still call /complete/
  // Blocked if patient has active ASSIGNED or UNDER_TREATMENT case at clinic (returns 400)
  // Allowed if case is OPEN (no clinician assigned) — old case will be automatically rerouted
  saveStep7HealthCentre: async (payload: {
    state: string;
    lga: string;
    registered_hcc: string | null;
  }) => {
    const res = await apiClient.patch(`${BASE}/step/7/`, payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // POST /api/v1/onboarding/complete/
  // No request body needed — just POST with auth header
  // Call this after step 5 or step 7 (step 6 and 7 are optional)
  // On 200: redirect to data.redirect ('/dashboard')
  markComplete: async () => {
    const res = await apiClient.post(`${BASE}/complete/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },
};
