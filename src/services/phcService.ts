import apiClient from './apiClient';

export const phcAPI = {
  // PHC1 - Authentication
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login/', credentials);
    return res.data;
  },

  verify2FA: async (code: string, accessToken: string) => {
    const res = await apiClient.post('/auth/2fa/verify/', { code });
    return res.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken });
    return res.data;
  },

  getMe: async (accessToken: string) => {
    const res = await apiClient.get('/auth/me/');
    return res.data;
  },

  changePassword: async (passwords: { old_password: string; new_password: string }) => {
    const res = await apiClient.post('/auth/me/change-password/', passwords);
    return res.data;
  },

  logout: async (refreshToken: string, accessToken: string) => {
    const res = await apiClient.post('/auth/logout/', { refresh: refreshToken });
    return res.data;
  },

  // PHC2 - Patient Queue
  getQueue: async (filters?: {
    status?: string;
    condition?: string;
    severity?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.condition) params.append('condition', filters.condition);
    if (filters?.severity) params.append('severity', filters.severity);
    
    const res = await apiClient.get(`/centers/phc/queue/?${params}`);
    return res.data;
  },

  // PHC3 - Patient Detail
  getRecord: async (recordId: string) => {
    const res = await apiClient.get(`/centers/phc/queue/${recordId}/`);
    return res.data;
  },

  updateRecord: async (recordId: string, updates: {
    status?: string;
    notes?: string;
    next_followup?: string;
  }) => {
    const res = await apiClient.patch(`/centers/phc/queue/${recordId}/`, updates);
    return res.data;
  },

  escalateRecord: async (recordId: string, escalationData: {
    urgency: string;
    notes: string;
  }) => {
    const res = await apiClient.post(`/centers/phc/queue/${recordId}/escalate/`, escalationData);
    return res.data;
  },

  // PHC4 - Walk-in Registration
  registerWalkIn: async (walkInData: {
    full_name: string;
    email?: string;
    age?: number;
    condition: string;
    severity?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post('/centers/phc/walk-in/', walkInData);
    return res.data;
  },

  sendCredentials: async (patientId: string, phoneNumber: string) => {
    const res = await apiClient.post('/auth/send-credentials/', { 
      patient_id: patientId, 
      phone_number: phoneNumber 
    });
    return res.data;
  },

  // PHC5 - Lifestyle Advice
  sendAdvice: async (adviceData: {
    patient_id: string;
    condition: string;
    message: string;
    followup_date?: string;
  }) => {
    const res = await apiClient.post('/phc/advice/', adviceData);
    return res.data;
  },

  sendAdviceToRecord: async (recordId: string, adviceData: {
    patient_id: string;
    condition: string;
    message: string;
    followup_date?: string;
  }) => {
    const res = await apiClient.post(`/phc/advice/${recordId}/`, adviceData);
    return res.data;
  },

  // PHC7 - Analytics
  getAnalytics: async (range: string = '30d', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ range });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const res = await apiClient.get(`/phc/analytics/?${params}`);
    return res.data;
  },

  // PHC8 - Notifications
  getNotifications: async () => {
    const res = await apiClient.get('/phc/notifications/');
    return res.data;
  },

  markNotificationRead: async (notificationId: string, actionTaken?: string) => {
    const body: any = { is_read: true };
    if (actionTaken) body.action_taken = actionTaken;
    
    const res = await apiClient.patch(`/phc/notifications/${notificationId}/read/`, body);
    return res.data;
  },

  // PHC9 - Settings & Management
  getPHCProfile: async () => {
    const res = await apiClient.get('/centers/phc/profile/');
    return res.data;
  },

  updatePHCProfile: async (updates: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    notify_on_severe?: boolean;
    notify_on_very_severe?: boolean;
  }) => {
    const res = await apiClient.patch('/centers/phc/profile/', updates);
    return res.data;
  },

  getNotificationPreferences: async () => {
    const res = await apiClient.get('/phc/notification-preferences/');
    return res.data;
  },

  updateNotificationPreferences: async (preferences: {
    new_referral_alert: boolean;
    score_change_alert: boolean;
    overdue_followup_reminder: boolean;
  }) => {
    const res = await apiClient.patch('/phc/notification-preferences/', preferences);
    return res.data;
  },

  // Staff Management (PHC Admin only)
  getStaff: async () => {
    const res = await apiClient.get('/centers/phc/staff/');
    return res.data;
  },

  createStaff: async (staffData: {
    full_name: string;
    email: string;
    staff_role: string;
    employee_id?: string;
  }) => {
    const res = await apiClient.post('/centers/phc/staff/', staffData);
    return res.data;
  },

  getStaffMember: async (staffId: string) => {
    const res = await apiClient.get(`/centers/phc/staff/${staffId}/`);
    return res.data;
  },

  updateStaffMember: async (staffId: string, updates: {
    staff_role?: string;
    employee_id?: string;
  }) => {
    const res = await apiClient.patch(`/centers/phc/staff/${staffId}/`, updates);
    return res.data;
  },

  deactivateStaff: async (staffId: string) => {
    const res = await apiClient.delete(`/centers/phc/staff/${staffId}/`);
    return res.data;
  },

  // Network
  getPHCs: async (state?: string, lga?: string) => {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (lga) params.append('lga', lga);
    
    const res = await apiClient.get(`/centers/phc/?${params}`);
    return res.data;
  },

  getFMCs: async () => {
    const res = await apiClient.get('/centers/fmc/');
    return res.data;
  },
};

export const fmcAPI = {
  getFMCProfile: async () => {
    const res = await apiClient.get('/centers/fmc/profile/');
    return res.data;
  },

  updateFMCProfile: async (updates: any) => {
    const res = await apiClient.patch('/centers/fmc/profile/', updates);
    return res.data;
  },

  getFMCNotificationPreferences: async () => {
    const res = await apiClient.get('/fmc/notification-preferences/');
    return res.data;
  },

  updateFMCNotificationPreferences: async (prefs: any) => {
    const res = await apiClient.patch('/fmc/notification-preferences/', prefs);
    return res.data;
  },

  uploadFMAvatar: async (formData: FormData) => {
    const res = await apiClient.patch('/auth/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  changePassword: async (passwords: { old_password: string; new_password: string }) => {
    const res = await apiClient.post('/auth/me/change-password/', passwords);
    return res.data;
  },

  logout: async (refresh: string) => {
    const res = await apiClient.post('/auth/logout/', { refresh });
    return res.data;
  },
};
