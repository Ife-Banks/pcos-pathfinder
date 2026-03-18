import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-mshm-backend.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
            `${API_BASE_URL}/auth/token/refresh/`,
            { refresh }
          );
          
          await saveTokens(data.access, refresh);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          
          return apiClient.request(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        console.error('Token refresh failed:', refreshError);
        await clearTokens();
        
        // Clear React state by triggering a global event
        window.dispatchEvent(new CustomEvent('auth-expired'));
        
        // Show user-friendly toast notification
        const toastEvent = new CustomEvent('show-toast', {
          detail: {
            message: 'Your session has expired. Please sign in again.',
            type: 'warning'
          }
        });
        window.dispatchEvent(toastEvent);
        
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
