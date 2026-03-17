import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../utils/tokenStorage';

const apiClient = axios.create({
  baseURL: 'https://ai-mshm-backend.onrender.com/api/v1',
});

// Attach token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refresh = await getRefreshToken();
        if (refresh) {
          const { data } = await axios.post(
            'https://ai-mshm-backend.onrender.com/api/v1/auth/token/refresh/',
            { refresh }
          );
          
          await saveTokens(data.access, refresh);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          
          return apiClient.request(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
