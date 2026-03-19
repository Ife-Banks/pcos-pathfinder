import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-mshm-backend.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
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
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
          const { data } = await axios.post(
  `${API_BASE_URL}/auth/token/refresh/`,
  { refresh }
);

const newAccess = data.data?.access ?? data.access;
const newRefresh = data.data?.refresh ?? data.refresh;

localStorage.setItem('access_token', newAccess);
localStorage.setItem('refresh_token', newRefresh);
originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          
          return apiClient.request(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Clear React state by triggering a global event
        window.dispatchEvent(new CustomEvent('auth-expired'));
        
        // Show user-friendly toast notification
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { 
            message: 'Your session has expired. Please sign in again.', 
            type: 'warning' 
          } 
        }));
        
        // Redirect based on current path
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/clinician')) {
          window.location.href = '/clinician/login';
        } else if (currentPath.startsWith('/fmc')) {
          window.location.href = '/fmc/login';
        } else if (currentPath.startsWith('/phc')) {
          window.location.href = '/phc/login';
        } else {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
