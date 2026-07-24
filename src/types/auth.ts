export type UserRole = 'patient' | 'clinician' | 'hcc_admin' | 'fhc_admin' | 'admin';

export type AdminRole = 'admin' | 'state_admin' | 'lga_admin';

export interface UserProfile {
  id: string;
  email: string;
  unique_id: string | null;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_email_verified: boolean;
  onboarding_completed: boolean;
  onboarding_step: number;
  center_info: CenterInfo | null;
  date_joined: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  scope: 'national' | 'state' | 'lga';
  state_name: string | null;
  lga_name: string | null;
  created_by_name: string | null;
  is_active: boolean;
  created_at: string;
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
