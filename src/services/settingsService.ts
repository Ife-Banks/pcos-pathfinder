const BASE = 'https://ai-mshm-backend-d47t.onrender.com';

function getHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

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
    const res = await fetch(`${BASE}/api/v1/onboarding/profile/`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getDevices: async (): Promise<{ success: boolean; data: Device[] }> => {
    const res = await fetch(`${BASE}/api/v1/settings/devices/`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  connectDevice: async (deviceType: string): Promise<{ success: boolean; data: Device }> => {
    const res = await fetch(`${BASE}/api/v1/settings/devices/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ device_type: deviceType }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  syncDevice: async (deviceId: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE}/api/v1/settings/devices/${deviceId}/sync/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  disconnectDevice: async (deviceId: string): Promise<void> => {
    const res = await fetch(`${BASE}/api/v1/settings/devices/${deviceId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw data;
    }
  },

  getNotificationSettings: async (): Promise<{ success: boolean; data: NotificationPreferences }> => {
    const res = await fetch(`${BASE}/api/v1/settings/notifications/`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  saveNotificationSettings: async (settings: Partial<NotificationPreferences>): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE}/api/v1/settings/notifications/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getPrivacySettings: async (): Promise<{ success: boolean; data: PrivacySettings }> => {
    const res = await fetch(`${BASE}/api/v1/settings/privacy/`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  savePrivacySettings: async (settings: PrivacySettings): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE}/api/v1/settings/privacy/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  exportData: async (): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${BASE}/api/v1/settings/privacy/export/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  deleteAccount: async (): Promise<void> => {
    const res = await fetch(`${BASE}/api/v1/settings/privacy/delete-account/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw data;
    }
  },
};
