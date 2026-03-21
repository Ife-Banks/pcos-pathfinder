import apiClient from '@/services/apiClient';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export const clinicianAPI = {
  // CL1 - Login & Registration
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login/', credentials);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  register: async (credentials: {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
    role: string;
  }) => {
    const payload = { ...credentials, role: 'clinician' };
    const res = await apiClient.post('/auth/register/', payload);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  verifyEmail: async (token: string) => {
    const res = await apiClient.post('/auth/verify-email/', { token });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  resendVerification: async (email: string) => {
    const res = await apiClient.post('/auth/resend-verification/', { email });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  verify2FA: async (code: string, accessToken?: string) => {
    const config = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
    const res = await apiClient.post('/auth/2fa/verify/', { code }, config);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL2 - My Patients Dashboard
  getMyPatients: async (filters?: { tier?: string; status?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.tier) params.tier = filters.tier;
    if (filters?.status) params.status = filters.status;

    const res = await apiClient.get('/clinician/my-patients/', { params });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL3 - Patient Detail
  getPatient: async (patientId: string) => {
    const res = await apiClient.get(`/clinician/patient/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  saveTreatmentPlan: async (patientId: string, plan: any) => {
    const res = await apiClient.post(`/clinician/treatment-plan/${patientId}/`, plan);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateTreatmentPlanStatus: async (planId: string, status: string) => {
    const res = await apiClient.patch(`/clinician/treatment-plan/${planId}/status/`, { status });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  generatePatientLetter: async (patientId: string) => {
    const res = await apiClient.post(`/clinician/patient-letter/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL4 - Treatment Plan Builder
  createTreatmentPlan: async (plan: any) => {
    const res = await apiClient.post('/clinician/treatment-plan/', plan);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL5 - Prescriptions
  addPrescription: async (prescription: any) => {
    const res = await apiClient.post('/clinician/prescription/', prescription);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updatePrescription: async (prescriptionId: string, updates: any) => {
    const res = await apiClient.patch(`/clinician/prescription/${prescriptionId}/`, updates);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  generatePrescriptionLetter: async (patientId: string) => {
    const res = await apiClient.post(`/clinician/prescription-letter/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL6 - Communication
  sendMessage: async (patientId: string, message: any) => {
    const res = await apiClient.post(`/clinician/message/${patientId}/`, message);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  bookAppointment: async (patientId: string, appointment: any) => {
    const res = await apiClient.post(`/clinician/appointment/${patientId}/`, appointment);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  generateClinicalLetter: async (patientId: string, letter: any) => {
    const res = await apiClient.post(`/clinician/letter/${patientId}/`, letter);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL7 - Analytics
  getAnalytics: async (range: string = '30d') => {
    const res = await apiClient.get('/clinician/analytics/', { params: { range } });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL8 - Profile & Settings
  getProfile: async () => {
    const res = await apiClient.get('/clinician/profile/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateNotificationPreferences: async (preferences: any) => {
    const res = await apiClient.patch('/clinician/notification-preferences/', preferences);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  changePassword: async (passwords: { old_password: string; new_password: string }) => {
    const res = await apiClient.post('/auth/me/change-password/', passwords);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // Timeline & Reports (Screens 36-37)
  getPatientTimeline: async (patientId: string, filters?: { range?: string; type?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.range) params.range = filters.range;
    if (filters?.type) params.type = filters.type;

    const res = await apiClient.get(`/clinician/patient/${patientId}/timeline/`, { params });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  exportTimeline: async (patientId: string, format: string = 'csv') => {
    const res = await apiClient.get(`/clinician/patient/${patientId}/timeline/export/`, {
      params: { format },
    });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  generateReport: async (patientId: string, view: string = 'clinician') => {
    const res = await apiClient.post(
      '/reports/generate/',
      undefined,
      { params: { patient_id: patientId, view } }
    );
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getReport: async (reportId: string, view: string = 'clinician') => {
    const res = await apiClient.get(`/reports/${reportId}/`, { params: { view } });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  exportFHIR: async (patientId: string) => {
    const res = await apiClient.post(`/fhir/export/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },
};
