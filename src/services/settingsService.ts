import apiClient from '@/services/apiClient';

const ensureSuccess = (body: any) => {
  const isSuccess = body?.success === true || body?.status === 'success' || body?.status === 200 || body?.status === 201;
  if (!isSuccess) throw body;
  return body;
};

export interface Device {
  id: string;
  device_type: string;
  display_name: string;
  last_synced_at: string | null;
  is_active: boolean;
}

export interface NotificationPreferences {
  morning_time: string;
  evening_time: string;
  morning_checkin_enabled: boolean;
  evening_checkin_enabled: boolean;
  weekly_prompts_enabled: boolean;
  period_alerts_enabled: boolean;
  risk_score_updates_enabled: boolean;
  wearable_sync_reminders: boolean;
  do_not_disturb: boolean;
}

export interface PrivacySettings {
  behavioral_data_enabled: boolean;
  wearable_data_enabled: boolean;
  clinical_data_enabled: boolean;
  share_with_clinician: boolean;
  anonymized_research: boolean;
  model_improvement: boolean;
}

export interface ProfileData {
  age: number | null;
  ethnicity: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  has_skin_changes: boolean;
  onboarding_step: number;
  onboarding_completed: boolean;
  clinical_data_pct?: number;
}

export const settingsService = {
  getProfile: async (): Promise<{ success: boolean; data: ProfileData }> => {
    const res = await apiClient.get('/onboarding/profile/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getDevices: async (): Promise<{ success: boolean; data: Device[] }> => {
    const res = await apiClient.get('/settings/devices/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  connectDevice: async (deviceType: string): Promise<{ success: boolean; data: Device }> => {
    const res = await apiClient.post('/settings/devices/', { device_type: deviceType });
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  syncDevice: async (deviceId: string): Promise<{ success: boolean }> => {
    const res = await apiClient.post(`/settings/devices/${deviceId}/sync/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  disconnectDevice: async (deviceId: string): Promise<void> => {
    await apiClient.delete(`/settings/devices/${deviceId}/`);
  },

  getNotificationSettings: async (): Promise<{ success: boolean; data: NotificationPreferences }> => {
    const res = await apiClient.get('/settings/notifications/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  saveNotificationSettings: async (settings: Partial<NotificationPreferences>): Promise<{ success: boolean }> => {
    const res = await apiClient.patch('/settings/notifications/', settings);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  getPrivacySettings: async (): Promise<{ success: boolean; data: PrivacySettings }> => {
    const res = await apiClient.get('/settings/privacy/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  savePrivacySettings: async (settings: PrivacySettings): Promise<{ success: boolean }> => {
    const res = await apiClient.patch('/settings/privacy/', settings);
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  exportData: async (): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post('/settings/privacy/export/');
    const body = res.data;
    ensureSuccess(body);
    return body;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/settings/privacy/delete-account/');
  },
};
