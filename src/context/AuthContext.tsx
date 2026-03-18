import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../utils/tokenStorage';
import { authAPI } from '../services/authService';

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
  loginWithTokens: (userData: any, accessToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On app launch, check if tokens exist
    const bootstrapAuth = async () => {
      try {
        const refresh = await getRefreshToken();
        
        // Guard: don't proceed with invalid stored values
        if (!refresh || refresh === 'undefined' || refresh === 'null') {
          setIsLoading(false);
          return; // Don't attempt token refresh, just show login
        }
        
        // Step 1: Refresh the access token
        const tokenData = await authAPI.refreshToken(refresh);
        await saveTokens(tokenData.access, refresh);
        setAccessToken(tokenData.access);
        
        // Step 2: Fetch real user profile (NOT hardcoded values)
        const meResult = await authAPI.getMe(tokenData.access);
        setUser({
          ...meResult.data,
          accessToken: tokenData.access,
        });
        
      } catch (err) {
        // Token refresh or /me/ failed — clear everything
        await clearTokens();
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Listen for auth-expired events from axios interceptor
    const handleAuthExpired = () => {
      console.log(' Auth expired event received, clearing state');
      setUser(null);
      setAccessToken(null);
      setIsLoading(false);
    };
    
    window.addEventListener('auth-expired', handleAuthExpired);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
    
    bootstrapAuth();
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

  const logout = async () => {
    const refresh = await getRefreshToken();
    const access = user?.accessToken;
    if (refresh && access) {
      await authAPI.logout(refresh, access);
    }
    await clearTokens();
    setUser(null);
    setAccessToken(null);
    
    // Trigger auth-expired event to ensure all components update
    window.dispatchEvent(new CustomEvent('auth-expired'));
  };

  const loginWithTokens = (userData: any, accessToken: string) => {
    // Set access token state
    setAccessToken(accessToken);
    
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
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, loginWithTokens }}>
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
