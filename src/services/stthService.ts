import apiClient from './apiClient';

export interface STTHDashboardData {
  facility: {
    id: string;
    name: string;
    code: string;
    address: string;
    state: string;
    lga: string;
    phone: string;
    email: string;
  };
  total_staff: number;
  total_patients: number;
  active_patients: number;
  today_registrations: number;
}

export const stthAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login/', credentials);
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

  getDashboard: async (): Promise<{ status: string; data: STTHDashboardData }> => {
    const res = await apiClient.get('/centers/stth/dashboard/');
    return res.data;
  },
};
