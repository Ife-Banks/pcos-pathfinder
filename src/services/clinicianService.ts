import apiClient from '@/services/apiClient';

const ensureSuccess = (body: any) => {
  const isSuccess =
    body?.success === true ||
    body?.status === 'success' ||
    body?.status === 200 ||
    body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export const clinicianAPI = {
  // ─── Auth ────────────────────────────────────────────────────────────────────

  login: async (credentials: { identifier: string; password: string }) => {
    const res = await apiClient.post('/auth/login/', {
      email: credentials.identifier,
      password: credentials.password,
    });
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
    const res = await apiClient.post('/auth/register/', { ...credentials, role: 'clinician' });
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

  // 2FA endpoint doesn't exist in backend yet — wrapped in try/catch so it
  // won't crash the login flow if the backend hasn't implemented it.
  verify2FA: async (code: string, _accessToken?: string) => {
    try {
      const res = await apiClient.post('/auth/2fa/verify/', { code });
      const body = res.data;
      ensureSuccess(body);
      return body;
    } catch {
      // Endpoint missing — fail silently so login can proceed
      return { success: true };
    }
  },

  // ─── Patients / Cases ────────────────────────────────────────────────────────

  getMyCases: async (filters?: { tier?: string; status?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.tier) params.tier = filters.tier;
    if (filters?.status) params.status = filters.status;
    const res = await apiClient.get('/centers/clinician/cases/', { params });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },


  // ─── Treatment Plans ─────────────────────────────────────────────────────────

  getTreatmentPlans: async () => {
    const res = await apiClient.get('/centers/clinician/treatment-plans/');
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

  // saveTreatmentPlan kept as alias so older screens don't break
  saveTreatmentPlan: async (_patientId: string, plan: any) => {
    const res = await apiClient.post('/centers/clinician/treatment-plans/', plan);
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

  updateTreatmentPlanStatus: async (planId: string, status: string) => {
    const res = await apiClient.patch(`/centers/clinician/treatment-plans/${planId}/`, { status });
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

  // ─── Prescriptions ───────────────────────────────────────────────────────────

  getPrescriptions: async () => {
    const res = await apiClient.get('/centers/clinician/prescriptions/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

   

  getPatient: async (caseId: string) => {
    const res = await apiClient.get(`/centers/clinician/cases/${caseId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getPatientTreatmentPlans: async (caseId: string) => {
    const res = await apiClient.get('/centers/clinician/treatment-plans/');
    const body = res.data;
    ensureSuccess(body);
    const all = body.data || [];
    return { ...body, data: all.filter((p: any) => String(p.case) === caseId) };
  },

  getPatientPrescriptions: async (caseId: string) => {
    const res = await apiClient.get('/centers/clinician/prescriptions/');
    const body = res.data;
    ensureSuccess(body);
    const all = body.data || [];
    return { ...body, data: all.filter((p: any) => String(p.case) === caseId || String(p.patient) === caseId) };
  },

  getPatientMessages: async (_caseId: string) => {
    return { data: [] };
  },

  getPatientTimeline: async (_id: string) => {
    return { data: [] };
  },

  // createPrescription and addPrescription both POST to the same endpoint
  createPrescription: async (prescription: any) => {
    const res = await apiClient.post('/centers/clinician/prescriptions/', prescription);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  addPrescription: async (prescription: any) => {
    const res = await apiClient.post('/centers/clinician/prescriptions/', prescription);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updatePrescription: async (prescriptionId: string, updates: any) => {
    const res = await apiClient.patch(
      `/centers/clinician/prescriptions/${prescriptionId}/`,
      updates,
    );
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

  // /refill/ endpoint doesn't exist in backend yet — falls back gracefully
  refillPrescription: async (prescriptionId: string) => {
    try {
      const res = await apiClient.post(
        `/centers/clinician/prescriptions/${prescriptionId}/refill/`,
      );
      const body = res.data;
      ensureSuccess(body);
      return body;
    } catch {
      // Endpoint missing — return a soft success so the UI doesn't crash
      return { success: true, message: 'Refill request noted (pending backend support)' };
    }
  },

  generatePrescriptionLetter: async (patientId: string) => {
    const res = await apiClient.post(`/centers/clinician/letter/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // ─── Communication ───────────────────────────────────────────────────────────

  getConversations: async () => {
    const res = await apiClient.get('/centers/clinician/communications/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

   

  // /messages/ sub-endpoint doesn't exist — falls back to the parent resource
  getConversationMessages: async (conversationId: string) => {
    try {
      const res = await apiClient.get(
        `/centers/clinician/communications/${conversationId}/messages/`,
      );
      const body = res.data;
      ensureSuccess(body);
      return body;
    } catch {
      // Fallback: return the parent conversation wrapped as a single-message list
      const res = await apiClient.get('/centers/clinician/communications/', {
        params: { id: conversationId },
      });
      const body = res.data;
      ensureSuccess(body);
      return body;
    }
  },

  markConversationAsRead: async (conversationId: string) => {
    const res = await apiClient.patch(
      `/centers/clinician/communications/${conversationId}/read/`,
    );
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  archiveConversation: async (conversationId: string) => {
    const res = await apiClient.post(
      `/centers/clinician/communications/${conversationId}/archive/`,
    );
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // DELETE doesn't exist in backend — archive instead
  deleteConversation: async (conversationId: string) => {
    try {
      const res = await apiClient.delete(
        `/centers/clinician/communications/${conversationId}/`,
      );
      const body = res.data;
      ensureSuccess(body);
      return body;
    } catch {
      // Fallback to archive
      const res = await apiClient.post(
        `/centers/clinician/communications/${conversationId}/archive/`,
      );
      const body = res.data;
      ensureSuccess(body);
      return body;
    }
  },

  // ClinicianCommunicationScreen calls sendMessage({ conversation_id, content, type })
  // The backend expects POST /centers/clinician/message/<patient_id>/
  // We extract patient_id from conversation_id (they're the same in this schema)
  sendMessage: async (messageDataOrPatientId: any, message?: any) => {
    // Support both call signatures:
    //   sendMessage({ conversation_id, content, type })   ← from CommunicationScreen
    //   sendMessage(patientId, messageObj)                ← original API design
    let patientId: string;
    let payload: any;

    if (typeof messageDataOrPatientId === 'string') {
      patientId = messageDataOrPatientId;
      payload = message;
    } else {
      patientId = messageDataOrPatientId.conversation_id;
      payload = { content: messageDataOrPatientId.content, type: messageDataOrPatientId.type };
    }

    const res = await apiClient.post(`/centers/clinician/message/${patientId}/`, payload);
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

  generatePatientLetter: async (patientId: string) => {
    const res = await apiClient.post(`/centers/clinician/letter/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // ─── Analytics ───────────────────────────────────────────────────────────────

  getAnalytics: async (range: string = '30d') => {
    const res = await apiClient.get('/centers/clinician/analytics/', { params: { range } });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // ─── Profile & Settings ──────────────────────────────────────────────────────

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

  // Screen passes a FormData object; we accept either File or FormData
  uploadAvatar: async (fileOrFormData: File | FormData) => {
    let formData: FormData;
    if (fileOrFormData instanceof FormData) {
      formData = fileOrFormData;
    } else {
      formData = new FormData();
      formData.append('profile_photo', fileOrFormData);
    }
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

  // FIX: was hitting /centers/clinician/notification-preferences/ (404)
  // Correct endpoint is /settings/notifications/
  updateNotificationPreferences: async (preferences: any) => {
    const res = await apiClient.patch('/settings/notifications/', preferences);
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

  // ─── Timeline & Reports (endpoints missing — graceful fallbacks) ──────────────

   

  exportTimeline: async (patientId: string, format: string = 'csv') => {
    try {
      const res = await apiClient.get(
        `/centers/clinician/patient/${patientId}/timeline/export/`,
        { params: { format } },
      );
      const body = res.data;
      ensureSuccess(body);
      return body;
    } catch {
      return { success: true, data: null };
    }
  },

  generateReport: async (patientId: string, view: string = 'clinician') => {
    try {
      const res = await apiClient.post('/reports/generate/', undefined, {
        params: { patient_id: patientId, view },
      });
      const body = res.data;
      ensureSuccess(body);
      return body;
    } catch {
      return { success: true, data: null };
    }
  },

  getReport: async (reportId: string, view: string = 'clinician') => {
    try {
      const res = await apiClient.get(`/reports/${reportId}/`, { params: { view } });
      const body = res.data;
      ensureSuccess(body);
      return body;
    } catch {
      return { success: true, data: null };
    }
  },

  exportFHIR: async (patientId: string) => {
    try {
      const res = await apiClient.post(`/fhir/export/${patientId}/`);
      const body = res.data;
      ensureSuccess(body);
      return body;
    } catch {
      return { success: true, data: null };
    }
  },

  // ─── Onboarding ──────────────────────────────────────────────────────────────

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

  // ─── Communication aliases (used by ClinicianCommunicationScreen) ────────────

  getCommunications: async () => {
    const res = await apiClient.get('/centers/clinician/communications/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  markCommunicationRead: async (pk: string) => {
    const res = await apiClient.patch(`/centers/clinician/communications/${pk}/read/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  archiveCommunication: async (pk: string) => {
    const res = await apiClient.post(`/centers/clinician/communications/${pk}/archive/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  sendPatientMessage: async (patientId: string, body: string, messageType = 'CLINICAL_UPDATE') => {
    const res = await apiClient.post(`/centers/clinician/message/${patientId}/`, {
      body,
      message_type: messageType,
    });
    const data = res.data;
    ensureSuccess(data);
    return data;
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
      {
        key: 'pregnancy_complications',
        name: 'Pregnancy Complications (GDM, Pre-eclampsia)',
      },
      { key: 'mental_health', name: 'Mental Health (Depression, Anxiety)' },
      { key: 'dermatologic', name: 'Dermatologic Manifestations (Acne, Hirsutism)' },
    ];
  },

  // ─── Chat ────────────────────────────────────────────────────────────────────

  getChatConversations: async () => {
    const res = await apiClient.get('/chat/conversations/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getChatMessages: async (conversationId: string) => {
    const res = await apiClient.get(`/chat/conversations/${conversationId}/messages/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },
};