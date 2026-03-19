import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { saveTokens } from '../utils/tokenStorage';
import { authAPI } from '../services/authService';
import apiClient from '../services/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-mshm-backend.onrender.com/api/v1';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  is_email_verified: boolean;
  onboarding_completed: boolean;
  onboarding_step: number; // 0–5
  center_info: any | null;
  date_joined: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  loginWithTokens: (userData: any, accessToken: string, refreshToken?: string) => void;
  routeAfterLogin: (user: any) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');

      if (!token || !refresh) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me/');
        const payload = response.data.data ?? response.data;
        setUser(payload);
        setAccessToken(token);
      } catch (error) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
          const newAccess = data.data?.access ?? data.access;
          const newRefresh = data.data?.refresh ?? data.refresh;

          localStorage.setItem('access_token', newAccess);
          localStorage.setItem('refresh_token', newRefresh);

          const meResponse = await apiClient.get('/auth/me/');
          const restoredUser = meResponse.data.data ?? meResponse.data;
          setUser(restoredUser);
          setAccessToken(newAccess);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handleAuthExpired = () => {
      setUser(null);
      setAccessToken(null);
      setIsLoading(false);
    };

    window.addEventListener('auth-expired', handleAuthExpired);

    restoreSession();

    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const data = await authAPI.login(credentials);
    await saveTokens(data.data.access, data.data.refresh);
    
    // Set access token state
    setAccessToken(data.data.access);
    
    // Set user with complete profile from login response
    const user = data.data.user;
    setUser({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      is_email_verified: user.is_email_verified,
      onboarding_completed: user.onboarding_completed,
      onboarding_step: user.onboarding_step,
      center_info: user.center_info,
      date_joined: user.date_joined,
      accessToken: data.data.access
    });
    return data;
  };

  const routeAfterLogin = (user: any) => {
    if (!user.is_email_verified) return '/verify-email';
    if (!['clinician', 'patient', 'fhc_staff', 'fhc_admin', 'hcc_staff', 'hcc_admin'].includes(user.role)) return '/role-mismatch';
    
    // FMC roles
    if (user.role === 'fhc_staff' || user.role === 'fhc_admin') {
      return '/fmc/dashboard';
    }
    
    // PHC roles
    if (user.role === 'hcc_staff' || user.role === 'hcc_admin') {
      return '/phc/dashboard';
    }
    
    // Clinician role
    if (user.role === 'clinician') {
      if (!user.center_info || !user.center_info.is_verified) {
        return '/clinician/pending-verification';
      }
      return '/clinician/dashboard';
    }
    
    // Patient role
    if (user.role === 'patient') {
      if (!user.onboarding_completed) {
        return '/onboarding';
      }
      return '/dashboard';
    }
    
    return '/dashboard';
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    const access = localStorage.getItem('access_token') || user?.accessToken;
    if (refresh && access) {
      await authAPI.logout(refresh, access);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setAccessToken(null);
    
    // Trigger auth-expired event to ensure all components update
    window.dispatchEvent(new CustomEvent('auth-expired'));
  };

  const loginWithTokens = (userData: any, accessToken: string, refreshToken?: string) => {
    // Set access token state and localStorage
    setAccessToken(accessToken);
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    setUser({
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      avatar_url: userData.avatar_url,
      is_email_verified: userData.is_email_verified,
      onboarding_completed: userData.onboarding_completed,
      onboarding_step: userData.onboarding_step,
      center_info: userData.center_info,
      date_joined: userData.date_joined,
      accessToken: accessToken
    });
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, loginWithTokens, routeAfterLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
