import apiClient from '@/services/apiClient';

export const authAPI = {

  register: async ({ full_name, email, password, confirm_password, role = 'patient' }) => {
    const res = await apiClient.post('/auth/register/', { full_name, email, password, confirm_password, role });
    return res.data;
  },

  login: async ({ email, password }) => {
    const res = await apiClient.post('/auth/login/', { email, password });
    return res.data;
  },

  refreshToken: async (refresh) => {
    const res = await apiClient.post('/auth/token/refresh/', { refresh });
    return res.data;
  },

  logout: async (refresh) => {
    const res = await apiClient.post('/auth/logout/', { refresh });
    return res.data;
  },

  verifyEmail: async (token) => {
    const res = await apiClient.post('/auth/verify-email/', { token });
    return res.data;
  },

  resendVerification: async (email) => {
    const res = await apiClient.post('/auth/resend-verification/', { email });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password/', { email });
    return res.data;
  },

  resetPassword: async ({ token, password, confirm_password }) => {
    const res = await apiClient.post('/auth/reset-password/', { token, password, confirm_password });
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me/');
    return res.data;
  },
};