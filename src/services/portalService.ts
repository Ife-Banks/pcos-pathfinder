import apiClient from '@/services/apiClient';

export const portalAPI = {
  logout: async (portal: string, refreshToken: string, accessToken?: string) => {
    const res = await apiClient.post(`/${portal}/logout/`, { refresh: refreshToken });
    return res.data;
  },
};

const createPortalAPI = (basePath: string) => ({
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post(`${basePath}/login/`, credentials);
    return res.data;
  },
  refreshToken: async (refreshToken: string) => {
    const res = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken });
    return res.data;
  },
  getMe: async (accessToken: string) => {
    const res = await apiClient.get(`${basePath}/me/`);
    return res.data;
  },
  changePassword: async (passwords: { old_password: string; new_password: string }) => {
    const res = await apiClient.post(`${basePath}/me/change-password/`, passwords);
    return res.data;
  },
  logout: async (refreshToken: string, accessToken?: string) => {
    const res = await apiClient.post(`${basePath}/logout/`, { refresh: refreshToken });
    return res.data;
  },
});

export const sthAPI = createPortalAPI('/auth'); // STH uses same auth endpoint
export const stthAPI = createPortalAPI('/auth');
export const fthAPI = createPortalAPI('/auth');
export const hmoAPI = createPortalAPI('/auth');
export const clinicAPI = createPortalAPI('/auth');
export const pvtAPI = createPortalAPI('/auth');
export const ptthAPI = createPortalAPI('/auth');