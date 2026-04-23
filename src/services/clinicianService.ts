import apiClient from '@/services/apiClient';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export const clinicianAPI = {
  // CL1 - Login & Registration
  login: async (credentials: { identifier: string; password: string }) => {
    const res = await apiClient.post('/auth/login/', { email: credentials.identifier, password: credentials.password });
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
  getMyCases: async (filters?: { tier?: string; status?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.tier) params.tier = filters.tier;
    if (filters?.status) params.status = filters.status;

    const res = await apiClient.get('/centers/clinician/cases/', { params });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL3 - Patient Detail
  getPatient: async (patientId: string) => {
    const res = await apiClient.get(`/centers/clinician/cases/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  saveTreatmentPlan: async (patientId: string, plan: any) => {
    const res = await apiClient.post(`/centers/clinician/treatment-plans/${patientId}/`, plan);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateTreatmentPlanStatus: async (planId: string, status: string) => {
    const res = await apiClient.patch(`/centers/clinician/treatment-plans/${planId}/`, { status });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  generatePatientLetter: async (patientId: string) => {
    const res = await apiClient.post(`/centers/clinician/letter/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL4 - Treatment Plan Builder
  getTreatmentPlans: async () => {
    const res = await apiClient.get('/centers/clinician/treatment-plans/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateTreatmentPlan: async (planId: string, updates: any) => {
    const res = await apiClient.patch(`/centers/clinician/treatment-plans/${planId}/`, updates);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  deleteTreatmentPlan: async (planId: string) => {
    const res = await apiClient.delete(`/centers/clinician/treatment-plans/${planId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  createTreatmentPlan: async (plan: any) => {
    const res = await apiClient.post('/centers/clinician/treatment-plans/', plan);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL5 - Prescriptions
  addPrescription: async (prescription: any) => {
    const res = await apiClient.post('/centers/clinician/prescriptions/', prescription);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getPrescriptions: async () => {
    const res = await apiClient.get('/centers/clinician/prescriptions/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updatePrescription: async (prescriptionId: string, updates: any) => {
    const res = await apiClient.patch(`/centers/clinician/prescriptions/${prescriptionId}/`, updates);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  deletePrescription: async (prescriptionId: string) => {
    const res = await apiClient.delete(`/centers/clinician/prescriptions/${prescriptionId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  refillPrescription: async (prescriptionId: string) => {
    const res = await apiClient.post(`/centers/clinician/prescriptions/${prescriptionId}/refill/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  generatePrescriptionLetter: async (patientId: string) => {
    const res = await apiClient.post(`/centers/clinician/letter/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL6 - Communication
  getConversations: async () => {
    const res = await apiClient.get('/centers/clinician/communications/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getConversationMessages: async (conversationId: string) => {
    const res = await apiClient.get(`/centers/clinician/communications/${conversationId}/messages/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  markConversationAsRead: async (conversationId: string) => {
    const res = await apiClient.patch(`/centers/clinician/communications/${conversationId}/read/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  archiveConversation: async (conversationId: string) => {
    const res = await apiClient.post(`/centers/clinician/communications/${conversationId}/archive/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  deleteConversation: async (conversationId: string) => {
    const res = await apiClient.delete(`/centers/clinician/communications/${conversationId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  sendMessage: async (patientId: string, message: any) => {
    const res = await apiClient.post(`/centers/clinician/message/${patientId}/`, message);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  bookAppointment: async (patientId: string, appointment: any) => {
    const res = await apiClient.post(`/centers/clinician/appointment/${patientId}/`, appointment);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  generateClinicalLetter: async (patientId: string, letter: any) => {
    const res = await apiClient.post(`/centers/clinician/letter/${patientId}/`, letter);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL7 - Analytics
  getAnalytics: async (range: string = '30d') => {
    const res = await apiClient.get('/centers/clinician/analytics/', { params: { range } });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // CL8 - Profile & Settings
  getProfile: async () => {
    const res = await apiClient.get('/centers/clinician/profile/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateProfile: async (profileData: any) => {
    const res = await apiClient.patch('/centers/clinician/profile/', profileData);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('profile_photo', file);
    const res = await apiClient.patch('/centers/clinician/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getNotificationPreferences: async () => {
    const res = await apiClient.get('/settings/notifications/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateNotificationPreferences: async (preferences: any) => {
    const res = await apiClient.patch('/centers/clinician/notification-preferences/', preferences);
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
  getPatientTreatmentPlans: async (patientId: string) => {
    const res = await apiClient.get('/centers/clinician/treatment-plans/', { params: { patient_id: patientId } });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getPatientPrescriptions: async (patientId: string) => {
    const res = await apiClient.get('/centers/clinician/prescriptions/', { params: { patient_id: patientId } });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getPatientMessages: async (patientId: string) => {
    const res = await apiClient.get('/centers/clinician/communications/', { params: { patient_id: patientId } });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getPatientTimeline: async (patientId: string, filters?: { range?: string; type?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.range) params.range = filters.range;
    if (filters?.type) params.type = filters.type;

    const res = await apiClient.get(`/centers/clinician/patient/${patientId}/timeline/`, { params });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  exportTimeline: async (patientId: string, format: string = 'csv') => {
    const res = await apiClient.get(`/centers/clinician/patient/${patientId}/timeline/export/`, {
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

  // Clinician Onboarding
  completeOnboarding: async (data: {
    specialization: string;
    downstream_expertise: string[];
    license_number?: string;
    years_of_experience?: number;
    bio?: string;
  }) => {
    const res = await apiClient.post('/centers/clinician/onboarding/', data);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getDownstreamDiseases: async () => {
    return [
      { key: 'type2_diabetes', name: 'Type 2 Diabetes / Metabolic Syndrome' },
      { key: 'cardiovascular_disease', name: 'Cardiovascular Disease (CVD, Hypertension)' },
      { key: 'obesity', name: 'Obesity' },
      { key: 'infertility', name: 'Infertility & Reproductive Complications' },
      { key: 'endometrial_hyperplasia', name: 'Endometrial Hyperplasia / Cancer' },
      { key: 'fatty_liver', name: 'Nonalcoholic Fatty Liver Disease (NAFLD)' },
      { key: 'sleep_apnea', name: 'Sleep Apnea' },
      { key: 'pregnancy_complications', name: 'Pregnancy Complications (GDM, Pre-eclampsia)' },
      { key: 'mental_health', name: 'Mental Health (Depression, Anxiety)' },
      { key: 'dermatologic', name: 'Dermatologic Manifestations (Acne, Hirsutism)' },
    ];
  },
};
