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
  getAllFacilities: async (params?: any) => {
    const res = await apiClient.get('/centers/all/', { params });
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