// For web app - using localStorage as secure storage alternative
// In production, consider using httpOnly cookies for better security

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const getAccessToken = async (): Promise<string | null> => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = async (): Promise<string | null> => {
  return localStorage.getItem('refresh_token');
};

export const clearTokens = async () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};
