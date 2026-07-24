import apiClient from '@/services/apiClient';

export interface AdminStats {
  users: {
    total: number;
    total_staff: number;
    new_this_week: number;
    new_this_month: number;
  };
  facilities: {
    count: number;
  };
  sessions: {
    active_today: number;
  };
  predictions: {
    today: number;
    this_week: number;
  };
  checkins: {
    today: number;
    this_week: number;
  };
  onboardings: {
    pending: number;
  };
}

export interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  facility: string | null;
  is_active: boolean;
  date_joined: string | null;
  last_login: string | null;
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  email: string;
  facility: string | null;
  timestamp: string;
}

export interface AdminAnalytics {
  total_users: number;
  active_users: number;
  verified_users: number;
  users_by_role: Record<string, number>;
  monthly_growth: { month: string; users: number }[];
  facilities: { total: number; by_type: Record<string, number> };
  predictions: { total: number; last_30_days: number };
  checkins: { total: number; last_30_days: number };
  onboardings: { completed: number; pending: number; completed_last_30_days: number };
  risk_distribution: { low: number; moderate: number; high: number; critical: number };
}

export interface SystemLog {
  id: string;
  action: string;
  description: string;
  user: string;
  email: string;
  role: string;
  ip_address: string | null;
  status: string;
  timestamp: string | null;
}

export interface ServiceHealth {
  name: string;
  status: string;
  latency_ms: number | null;
  uptime: string;
  message: string | null;
}

export interface SystemHealth {
  status: string;
  services: ServiceHealth[];
  summary: {
    total_users: number;
    active_sessions_today: number;
    predictions_today: number;
    checkins_today: number;
  };
  timestamp: string;
}

export interface SystemAlert {
  id: string;
  type: string;
  alert_type: string;
  title: string;
  message: string;
  priority: string;
  timestamp: string;
  read: boolean;
}

export interface SecurityOverview {
  total_users: number;
  active_users_30d: number;
  verified_users: number;
  unverified_users: number;
  patients: number;
  clinicians: number;
  staff: number;
}

export interface SecurityEvent {
  id: string;
  type: string;
  event: string;
  count: number | null;
  severity: string;
  timestamp: string;
}

export interface SecurityPolicies {
  two_factor_auth: string;
  session_timeout_minutes: number;
  password_expiry_days: number;
  failed_login_lockout_attempts: number;
  failed_login_lockout_duration_minutes: number;
  minimum_password_length: number;
  require_special_characters: boolean;
}

export interface Facility {
  id: string;
  code: string;
  name: string;
  tier: string;
  facility_type: string;
  address: string;
  phone: string;
  email: string;
  state: string;
  lga: string;
  zone: string;
  status: string;
  escalates_to: string;
  escalates_to_name?: string;
  escalates_to_state_teaching?: string;
  escalates_to_state_teaching_name?: string;
  escalates_to_federal_teaching?: string;
  escalates_to_federal_teaching_name?: string;
  escalates_to_fmc?: string;
  escalates_to_fmc_name?: string;
  admin_user: string;
  admin_email: string;
  admin_user_id?: string;
  license_number?: string;
}

export const adminAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login/', credentials);
    return res.data;
  },
  getMe: async () => {
    const token = localStorage.getItem('access_token');
    const res = await apiClient.get('/auth/me/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    const res = await apiClient.post('/auth/logout/', { refresh });
    return res.data;
  },
  changePassword: async (passwords: { old_password: string; new_password: string }) => {
    const res = await apiClient.post('/auth/me/change-password/', passwords);
    return res.data;
  },
  getAllUsers: async (params?: { role?: string; status?: string; search?: string; page?: number; page_size?: number }) => {
    const res = await apiClient.get('/auth/users/', { params });
    return res.data;
  },
  deleteUser: async (userId: string): Promise<any> => {
    const res = await apiClient.delete(`/auth/users/${userId}/`);
    return res.data;
  },
  getDatabaseStats: async (): Promise<any> => {
    const res = await apiClient.get(`/auth/db-stats/`);
    return res.data;
  },
  updateUser: async (userId: string, data: Record<string, any>): Promise<any> => {
    const res = await apiClient.patch(`/auth/users/${userId}/`, data);
    return res.data;
  },
  getUserById: async (userId: string): Promise<any> => {
    const res = await apiClient.get(`/auth/users/${userId}/`);
    return res.data;
  },
  createUser: async (data: {
    email: string;
    full_name: string;
    password: string;
    confirm_password: string;
    role: string;
    is_email_verified?: boolean;
  }): Promise<any> => {
    const res = await apiClient.post('/auth/users/', data);
    return res.data;
  },
  getAllFacilities: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/centers/admin/centers/', { params });
    return res.data;
  },
  createFacility: async (data: any): Promise<any> => {
    const res = await apiClient.post('/centers/admin/centers/', data);
    return res.data;
  },
  updateFacility: async (facilityId: string, data: any, tier?: string): Promise<any> => {
    const params = tier ? { tier } : {};
    const res = await apiClient.patch(`/centers/admin/centers/${facilityId}/`, data, { params });
    return res.data;
  },
  deleteFacility: async (facilityId: string): Promise<any> => {
    const res = await apiClient.delete(`/centers/admin/centers/${facilityId}/`);
    return res.data;
  },
  getFacilityDetail: async (facilityId: string, tier?: string): Promise<any> => {
    const params = tier ? { tier } : {};
    const res = await apiClient.get(`/centers/admin/centers/${facilityId}/`, { params });
    return res.data;
  },
  searchUsers: async (query: string): Promise<any> => {
    const res = await apiClient.get('/auth/users/', { params: { search: query, page_size: 20 } });
    return res.data;
  },
  getCountries: async (): Promise<any> => {
    const res = await apiClient.get('/centers/countries/');
    return res.data;
  },
  getStates: async (countryId?: string): Promise<any> => {
    const params = countryId ? { country: countryId } : {};
    const res = await apiClient.get('/centers/states/', { params });
    return res.data;
  },
  getSystemStats: async (): Promise<{ data: AdminStats }> => {
    const res = await apiClient.get('/auth/stats/');
    return res.data;
  },
  getActivityLogs: async (params?: { action?: string; page?: number; page_size?: number }): Promise<{ data: { logs: ActivityLog[]; total: number } }> => {
    const res = await apiClient.get('/auth/logs/', { params });
    return res.data;
  },
  getAnalytics: async (): Promise<{ data: AdminAnalytics }> => {
    const res = await apiClient.get('/auth/analytics/');
    return res.data;
  },
  getSystemLogs: async (params?: { search?: string; page?: number; page_size?: number }): Promise<{ data: { logs: SystemLog[]; total: number; page: number; page_size: number } }> => {
    const res = await apiClient.get('/auth/system-logs/', { params });
    return res.data;
  },
  getSystemHealth: async (): Promise<{ data: SystemHealth }> => {
    const res = await apiClient.get('/auth/system-health/');
    return res.data;
  },
  getSystemAlerts: async (): Promise<{ data: { alerts: SystemAlert[]; total_unread: number; summary: any; timestamp: string } }> => {
    const res = await apiClient.get('/auth/system-alerts/');
    return res.data;
  },
  getSecurity: async (): Promise<{ data: { overview: SecurityOverview; security_events: SecurityEvent[]; policies: SecurityPolicies; timestamp: string } }> => {
    const res = await apiClient.get('/auth/security/');
    return res.data;
  },
  getSecuritySettings: async (): Promise<any> => {
    const res = await apiClient.get('/settings/security/');
    return res.data;
  },
  updateSecuritySettings: async (settings: Record<string, any>): Promise<any> => {
    const res = await apiClient.patch('/settings/security/', settings);
    return res.data;
  },

  // ── Admin Hierarchy Endpoints ─────────────────────────────────────────────

  createFacilityHierarchy: async (data: {
    tier: string;
    name: string;
    code: string;
    state: string;
    lga?: string;
    zone?: string;
    address?: string;
    phone?: string;
    email?: string;
    facility_type?: string;
  }): Promise<any> => {
    const res = await apiClient.post('/centers/admin/hierarchy/facilities/', data);
    return res.data;
  },

  listFacilitiesHierarchy: async (params?: {
    tier?: string;
    page?: number;
    page_size?: number;
  }): Promise<any> => {
    const res = await apiClient.get('/centers/admin/hierarchy/facilities/list/', { params });
    return res.data;
  },

  getFacilityDetailHierarchy: async (facilityId: string, tier?: string): Promise<any> => {
    const params = tier ? { tier } : {};
    const res = await apiClient.get(`/centers/admin/hierarchy/facilities/${facilityId}/`, { params });
    return res.data;
  },

  deleteFacilityHierarchy: async (facilityId: string, tier?: string): Promise<any> => {
    const params = tier ? { tier } : {};
    const res = await apiClient.delete(`/centers/admin/hierarchy/facilities/${facilityId}/`, { params });
    return res.data;
  },

  createAdmin: async (data: {
    full_name: string;
    email: string;
    role: 'state_admin' | 'lga_admin';
    state_id: string;
    lga_id?: string;
  }): Promise<any> => {
    const res = await apiClient.post('/centers/admin/hierarchy/admins/', data);
    return res.data;
  },

  listAdmins: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<any> => {
    const res = await apiClient.get('/centers/admin/hierarchy/admins/list/', { params });
    return res.data;
  },

  getAdminDetail: async (adminId: string): Promise<any> => {
    const res = await apiClient.get(`/centers/admin/hierarchy/admins/${adminId}/`);
    return res.data;
  },

  deactivateAdmin: async (adminId: string, isActive: boolean): Promise<any> => {
    const res = await apiClient.patch(`/centers/admin/hierarchy/admins/${adminId}/`, { is_active: isActive });
    return res.data;
  },

  deleteAdmin: async (adminId: string): Promise<any> => {
    const res = await apiClient.delete(`/centers/admin/hierarchy/admins/${adminId}/`);
    return res.data;
  },

  // ── HRV Data Export ─────────────────────────────────────────────────────

  exportHRVData: async (userId?: string): Promise<Blob> => {
    const url = userId ? `/auth/users/${userId}/hrv-export/` : '/auth/hrv-export/';
    const token = localStorage.getItem('access_token');
    const res = await apiClient.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    return res.data;
  },
};
