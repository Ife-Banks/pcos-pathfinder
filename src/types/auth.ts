export type UserRole = 'patient' | 'clinician' | 'hcc_admin' | 'fhc_admin' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_email_verified: boolean;
  onboarding_completed: boolean;
  onboarding_step: number; // 0–5
  center_info: CenterInfo | null;
  date_joined: string;
}

export interface CenterInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  operating_hours: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
