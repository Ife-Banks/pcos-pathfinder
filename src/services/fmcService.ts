import apiClient from '@/services/apiClient';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export const fmcAPI = {
  // FMC1 - Authentication
  login: async (credentials: { identifier: string; password: string }) => {
    const res = await apiClient.post('/auth/login/', { email: credentials.identifier, password: credentials.password });
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

  refreshToken: async (refreshToken: string) => {
    const res = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me/');
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

  logout: async (refreshToken: string, accessToken?: string) => {
    const config = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
    const res = await apiClient.post('/auth/logout/', { refresh: refreshToken }, config);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // FMC2 - Case Queue
  getCases: async (filters?: { status?: string; condition?: string; severity?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.condition) params.condition = filters.condition;
    if (filters?.severity) params.severity = filters.severity;

    const res = await apiClient.get('/centers/fmc/cases/', { params });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // FMC3 - Patient Detail
  getCase: async (caseId: string) => {
    const res = await apiClient.get(`/centers/fmc/cases/${caseId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateCase: async (caseId: string, updates: { status?: string; fmc_notes?: string }) => {
    const res = await apiClient.patch(`/centers/fmc/cases/${caseId}/`, updates);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  assignClinician: async (caseId: string, clinicianId: string) => {
    const res = await apiClient.post(`/centers/fmc/cases/${caseId}/assign/`, {
      clinician_id: clinicianId,
    });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  dischargeCase: async (caseId: string, dischargeData: { closing_score: number; notes: string }) => {
    const res = await apiClient.post(`/centers/fmc/cases/${caseId}/discharge/`, dischargeData);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // FMC4 - Clinician Management
  getClinicians: async () => {
    const res = await apiClient.get('/centers/fmc/clinicians/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  createClinician: async (clinicianData: {
    full_name: string;
    email: string;
    specialization: string;
    license_number: string;
    years_of_experience: number;
    bio?: string;
  }) => {
    const res = await apiClient.post('/centers/fmc/clinicians/', clinicianData);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateClinician: async (clinicianId: string, updates: {
    specialization?: string;
    years_of_experience?: number;
  }) => {
    const res = await apiClient.patch(`/centers/fmc/clinicians/${clinicianId}/`, updates);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  verifyClinician: async (clinicianId: string) => {
    const res = await apiClient.post(`/centers/fmc/clinicians/${clinicianId}/verify/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  deactivateClinician: async (clinicianId: string) => {
    const res = await apiClient.post(`/centers/fmc/clinicians/${clinicianId}/deactivate/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  activateClinician: async (clinicianId: string) => {
    const res = await apiClient.post(`/centers/fmc/clinicians/${clinicianId}/activate/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // FMC6 - Analytics
  getAnalytics: async (range: string = '30d', startDate?: string, endDate?: string) => {
    const params: Record<string, string> = { range };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const res = await apiClient.get('/centers/fmc/analytics/', { params });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // FMC7 - Alerts
  getAlerts: async () => {
    const res = await apiClient.get('/centers/fmc/alerts/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  markAlertRead: async (alertId: string) => {
    const res = await apiClient.patch(`/centers/fmc/alerts/${alertId}/`, { is_read: true });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // FMC5 - Diagnostics
  requestDiagnostics: async (request: {
    patient_id: string;
    tests: string[];
    urgency: 'routine' | 'urgent';
    custom_note?: string;
  }) => {
    const res = await apiClient.post('/centers/fmc/request-diagnostics/', request);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getDiagnosticsStatus: async (patientId: string) => {
    const res = await apiClient.get(`/centers/fmc/diagnostics-status/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // FMC8 - Discharge
  fullDischarge: async (patientId: string, dischargeData: {
    condition_confirmed: string;
    diagnostic_basis: string;
    treatment_summary: string;
    follow_up_plan: string;
    closing_score: number;
    discharge_letter: string;
  }) => {
    const res = await apiClient.post(`/centers/fmc/discharge/${patientId}/`, dischargeData);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // Auto-assign
  autoAssign: async () => {
    const res = await apiClient.post('/centers/fmc/auto-assign/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getFMCProfile: async () => {
    const res = await apiClient.get('/centers/fmc/profile/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateFMCProfile: async (updates: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    notify_on_severe?: boolean;
    notify_on_very_severe?: boolean;
  }) => {
    const res = await apiClient.patch('/centers/fmc/profile/', updates);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // Staff Management (FMC Admin only)
  getStaff: async () => {
    const res = await apiClient.get('/centers/fmc/staff/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  createStaff: async (staffData: {
    full_name: string;
    email: string;
    staff_role: string;
    employee_id?: string;
  }) => {
    const res = await apiClient.post('/centers/fmc/staff/', staffData);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateStaff: async (staffId: string, updates: {
    staff_role?: string;
    employee_id?: string;
  }) => {
    const res = await apiClient.patch(`/centers/fmc/staff/${staffId}/`, updates);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  deactivateStaff: async (staffId: string) => {
    const res = await apiClient.delete(`/centers/fmc/staff/${staffId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // Network - FMC PHC Network (FMC13)
  getNetworkPHCs: async () => {
    const res = await apiClient.get('/centers/fmc/network-phc/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // Reports
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

  exportFHIR: async (patientId: string) => {
    const res = await apiClient.post(`/fhir/export/${patientId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // FMC10 - Consultation Notes
  getConsultationNotes: async (caseId: string) => {
    const res = await apiClient.get(`/centers/fmc/cases/${caseId}/consultation-notes/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  createConsultationNote: async (caseId: string, note: {
    note_type: string;
    content: string;
    vital_signs?: object;
    diagnosis?: object;
  }) => {
    const res = await apiClient.post(`/centers/fmc/cases/${caseId}/consultation-notes/`, note);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateConsultationNote: async (noteId: string, updates: {
    note_type?: string;
    content?: string;
    vital_signs?: object;
    diagnosis?: object;
  }) => {
    const res = await apiClient.patch(`/centers/fmc/consultation-notes/${noteId}/`, updates);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  deleteConsultationNote: async (noteId: string) => {
    const res = await apiClient.delete(`/centers/fmc/consultation-notes/${noteId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  // FMC11 - Treatment Plans
  getTreatmentPlans: async (caseId: string) => {
    const res = await apiClient.get(`/centers/fmc/cases/${caseId}/treatment-plans/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  createTreatmentPlan: async (caseId: string, plan: {
    title: string;
    description: string;
    medications?: object;
    lifestyle?: object;
    follow_up_days?: number;
  }) => {
    const res = await apiClient.post(`/centers/fmc/cases/${caseId}/treatment-plans/`, plan);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  updateTreatmentPlan: async (planId: string, updates: {
    title?: string;
    description?: string;
    medications?: object;
    lifestyle?: object;
    follow_up_days?: number;
    is_active?: boolean;
  }) => {
    const res = await apiClient.patch(`/centers/fmc/treatment-plans/${planId}/`, updates);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  deleteTreatmentPlan: async (planId: string) => {
    const res = await apiClient.delete(`/centers/fmc/treatment-plans/${planId}/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },
};
