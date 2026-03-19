const BASE = '/api/v1/onboarding';

const headers = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const onboardingAPI = {

  // GET /api/v1/onboarding/profile/
  // Use on mount of every step to pre-fill saved data
  getProfile: async (token: string) => {
    const res = await fetch(`${BASE}/profile/`, {
      headers: headers(token),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data; 
    // Returns: { success, data: OnboardingProfile }
  },

  // PATCH /api/v1/onboarding/step/1/
  // Fields: full_name (string), age (integer 10–120), 
  //         ethnicity (enum — see choices below)
  saveStep1: async (token: string, payload: {
    full_name: string;
    age: number;
    ethnicity: string;
  }) => {
    const res = await fetch(`${BASE}/step/1/`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, data: { full_name, age, ethnicity } }
  },

  // PATCH /api/v1/onboarding/step/2/
  // Fields: height_cm (float 50–300), weight_kg (float 20–500)
  // IMPORTANT: DO NOT send bmi — it is computed server-side and 
  //            returned in the response. Display it from response.data.bmi
  saveStep2: async (token: string, payload: {
    height_cm: number;
    weight_kg: number;
  }) => {
    const res = await fetch(`${BASE}/step/2/`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, data: { height_cm, weight_kg, bmi } }
    // bmi is READ-ONLY — always display from response, never send it
  },

  // PATCH /api/v1/onboarding/step/3/
  // Field: has_skin_changes (boolean) — REQUIRED, cannot be null
  // Do NOT pre-select Yes or No — user must explicitly choose
  saveStep3: async (token: string, payload: {
    has_skin_changes: boolean;
  }) => {
    const res = await fetch(`${BASE}/step/3/`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, data: { has_skin_changes } }
  },

  // PATCH /api/v1/onboarding/step/4/
  // Fields: cycle_length_days (int 1–90), periods_per_year (int 0–14),
  //         cycle_regularity ("regular" | "irregular")
  saveStep4: async (token: string, payload: {
    cycle_length_days: number;
    periods_per_year: number;
    cycle_regularity: 'regular' | 'irregular';
  }) => {
    const res = await fetch(`${BASE}/step/4/`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, data: { cycle_length_days, periods_per_year, cycle_regularity } }
  },

  // PATCH /api/v1/onboarding/step/5/
  // Field: selected_wearable — one of:
  //   "apple_watch" | "fitbit" | "garmin" | "oura_ring" | "none"
  // "none" is valid — means no wearable / skip
  saveStep5: async (token: string, payload: {
    selected_wearable: 'apple_watch' | 'fitbit' | 'garmin' | 'oura_ring' | 'none';
  }) => {
    const res = await fetch(`${BASE}/step/5/`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, data: { selected_wearable } }
  },

  // POST /api/v1/onboarding/step/6/rppg/
  // Field: baseline_captured (boolean) — MUST be true
  //        Sending false returns a 400 error
  // This step is OPTIONAL — user can skip and still call /complete/
  saveStep6rPPG: async (token: string) => {
    const res = await fetch(`${BASE}/step/6/rppg/`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ baseline_captured: true }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, data: { rppg_baseline_captured: true, rppg_captured_at } }
  },

  // PATCH /api/v1/onboarding/step/7/
  // Fields: state (string), lga (string), registered_hcc (string|null)
  // This step is OPTIONAL — user can skip and still call /complete/
  // Blocked if patient has active ASSIGNED or UNDER_TREATMENT case at clinic (returns 400)
  // Allowed if case is OPEN (no clinician assigned) — old case will be automatically rerouted
  saveStep7HealthCentre: async (token: string, payload: {
    state: string;
    lga: string;
    registered_hcc: string | null;
  }) => {
    const res = await fetch(`${BASE}/step/7/`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, data: { state, lga, registered_hcc } }
  },

  // POST /api/v1/onboarding/complete/
  // No request body needed — just POST with auth header
  // Call this after step 5 or step 7 (step 6 and 7 are optional)
  // On 200: redirect to data.redirect ('/dashboard')
  markComplete: async (token: string) => {
    const res = await fetch(`${BASE}/complete/`, {
      method: 'POST',
      headers: headers(token),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, data: { redirect: '/dashboard', 
    //   onboarding_completed: true, onboarding_step: 7, profile: {...} } }
  },
};
