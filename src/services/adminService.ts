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
};