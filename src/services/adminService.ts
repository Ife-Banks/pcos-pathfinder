import apiClient from '@/services/apiClient';

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
  getAllUsers: async (params?: any) => {
    const res = await apiClient.get('/auth/users/', { params });
    return res.data;
  },
  getAllFacilities: async (params?: any) => {
    const res = await apiClient.get('/centers/all/', { params });
    return res.data;
  },
  getSystemStats: async () => {
    const res = await apiClient.get('/auth/stats/');
    return res.data;
  },
  getActivityLogs: async (params?: any) => {
    const res = await apiClient.get('/auth/logs/', { params });
    return res.data;
  },
};