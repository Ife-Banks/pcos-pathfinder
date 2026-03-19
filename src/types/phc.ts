export type PHCRole = 'hcc_staff' | 'hcc_admin';
export type RecordStatus = 'new' | 'under_review' | 'action_taken' | 'escalated' | 'discharged';
export type RecordSeverity = 'mild' | 'moderate';
export type RecordCondition = 'pcos' | 'maternal' | 'cardiovascular';
export type EscalationUrgency = 'routine' | 'priority' | 'urgent';
export type PHCStaffRole = 'nurse' | 'cho' | 'assistant' | 'receptionist' | 'other';
export type AdviceCondition = 'pcos' | 'hormonal' | 'metabolic';

export interface PHCRecord {
  id: string;
  patient: { id: string; full_name: string; email: string };
  hcc: string;
  condition: RecordCondition;
  condition_label: string;
  severity: RecordSeverity;
  severity_label: string;
  status: RecordStatus;
  status_label: string;
  opening_score: number;
  latest_score: number;
  notes: string;
  last_advice_at: string | null;
  next_followup: string | null;
  escalated_to_case_id: string | null;
  opened_at: string;
  closed_at: string | null;
}

export interface WalkInRegistration {
  full_name: string;
  email?: string;
  age?: number;
  condition: RecordCondition;
  severity?: RecordSeverity;
  notes?: string;
}

export interface WalkInResponse {
  patient_id: string;
  patient_email: string;
  patient_name: string;
  phc_record_id: string;
  registered_hcc: string;
  temp_password: string; // shown once — never re-requestable
}

export interface AdvicePayload {
  patient_id: string;
  condition: AdviceCondition;
  message: string;
  followup_date?: string; // ISO 8601 date
}

export interface PHCStaff {
  id: string;
  full_name: string;
  email: string;
  staff_role: PHCStaffRole;
  employee_id: string | null;
  is_active: boolean;
}

export interface PHCProfile {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  state: string;
  lga: string;
  notify_on_severe: boolean;
  notify_on_very_severe: boolean;
  escalates_to: string; // FMC name — read-only
}

export interface PHCNotification {
  id: string;
  type: 'new_referral' | 'score_change' | 'overdue_followup' | 'missed_checkin' | 'patient_escalated';
  severity: 'info' | 'warning' | 'critical';
  patient_id?: string;
  patient_name?: string;
  record_id?: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
}

export interface PHCAnalytics {
  total_patients: number;
  active_minor_risk_cases: number;
  escalated_to_fmc_this_month: number;
  avg_time_to_action: number;
  risk_tier_distribution: {
    low: number;
    moderate: number;
  };
  top_conditions: {
    pcos: number;
    maternal: number;
    cardiovascular: number;
  };
  referrals_sent_timeline: Array<{
    date: string;
    count: number;
  }>;
  patient_activity_heatmap: Array<{
    date: string;
    activity_level: number;
  }>;
  staff_actions: {
    advice_messages_sent: number;
    followups_scheduled: number;
    patients_discharged: number;
  };
}

export interface PHCLoginForm {
  email: string;
  password: string;
  staff_id?: string;
  two_factor_code?: string;
}

export interface WalkInForm {
  full_name: string;
  email?: string;
  date_of_birth: string;
  phone_number: string;
  gender: string;
  height: number;
  weight: number;
  waist_circumference: number;
  acanthosis_nigricans: boolean;
  cycle_regularity: 'regular' | 'irregular';
  cycle_length?: number;
  last_period_date?: string;
  bleeding_intensity: 1 | 2 | 3 | 4 | 5;
  night_sweats: 'none' | 'occasional' | 'frequent';
  persistent_fatigue: boolean;
  family_history: 'yes' | 'no' | 'unknown';
  consent_given: boolean;
}

export interface EscalationForm {
  urgency: EscalationUrgency;
  notes: string;
  referral_letter: string;
  attach_summary: boolean;
}

export interface PHCNotificationPreferences {
  new_referral_alert: boolean;
  score_change_alert: boolean;
  overdue_followup_reminder: boolean;
}

export interface PHCStaffForm {
  full_name: string;
  email: string;
  staff_role: PHCStaffRole;
  employee_id?: string;
}

export interface RecordUpdateForm {
  status?: RecordStatus;
  notes?: string;
  next_followup?: string;
}

export interface AdviceTemplate {
  id: string;
  condition: AdviceCondition;
  title: string;
  content: string;
}
