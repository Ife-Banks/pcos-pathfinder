const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-mshm-backend.onrender.com/api/v1';

export const authAPI = {

  // 4.1 REGISTER — POST /api/v1/auth/register/
  register: async ({ full_name, email, password, confirm_password, role = 'patient' }) => {
    const res = await fetch(`${BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, confirm_password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, message, data: { id, email, full_name, role, 
    //   is_email_verified: false, onboarding_completed: false, onboarding_step: 0 } }
  },

  // 4.2 LOGIN — POST /api/v1/auth/login/
  login: async ({ email, password }) => {
    const res = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, message, data: { access, refresh, user: { ...UserProfile } } }
  },

  // 4.3 REFRESH TOKEN — POST /api/v1/auth/token/refresh/
  refreshToken: async (refresh) => {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data; // Returns: { access: "<new_access_token>" }
  },

  // 4.4 LOGOUT — POST /api/v1/auth/logout/  (requires Bearer token)
  logout: async (refresh, accessToken) => {
    const res = await fetch(`${BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // 4.5 VERIFY EMAIL — POST /api/v1/auth/verify-email/
  // After success, store the returned tokens — user is auto logged in!
  verifyEmail: async (token) => {
    const res = await fetch(`${BASE_URL}/auth/verify-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, data: { ...UserProfile, tokens: { access, refresh } } }
  },

  // 4.6 RESEND VERIFICATION — POST /api/v1/auth/resend-verification/
  resendVerification: async (email) => {
    const res = await fetch(`${BASE_URL}/auth/resend-verification/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // 4.7 FORGOT PASSWORD — POST /api/v1/auth/forgot-password/
  forgotPassword: async (email: string) => {
    console.log('🔍 Forgot password request:', { email, emailType: typeof email });
    
    const requestBody = JSON.stringify({ email });
    console.log('🔍 Request body:', requestBody);
    
    const res = await fetch(`${BASE_URL}/auth/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    });
    
    const data = await res.json();
    console.log('🔍 Response:', { status: res.status, ok: res.ok, data });
    
    if (!res.ok) throw data;
    return data;
  },

  // 4.8 RESET PASSWORD — POST /api/v1/auth/reset-password/
  resetPassword: async ({ token, password, confirm_password }) => {
    console.log('🔍 Reset password service input:', { 
      token, 
      password: password ? '***' : null, 
      confirm_password: confirm_password ? '***' : null,
      tokenType: typeof token,
      passwordType: typeof password,
      confirmType: typeof confirm_password
    });
    
    const requestBody = JSON.stringify({ token, password, confirm_password });
    console.log('🔍 Reset password request body:', requestBody);
    
    const res = await fetch(`${BASE_URL}/auth/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    });
    
    const data = await res.json();
    console.log('🔍 Reset password response:', { status: res.status, ok: res.ok, data });
    
    if (!res.ok) throw data;
    return data;
  },

  // 4.9 GET CURRENT USER — GET /api/v1/auth/me/  (requires Bearer token)
  getMe: async (accessToken) => {
    const res = await fetch(`${BASE_URL}/auth/me/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data; // Returns: { success, data: UserProfile }
  },
};
