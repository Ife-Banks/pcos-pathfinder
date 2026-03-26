export type PHCRole = 'hcc_staff' | 'hcc_admin';
export type RecordStatus = 'new' | 'under_review' | 'action_taken' | 'escalated' | 'discharged';
export type RecordSeverity = 'low' | 'mild' | 'moderate' | 'high' | 'critical';
export type RecordCondition = 'pcos' | 'hormonal' | 'metabolic';
export type EscalationUrgency = 'urgent' | 'priority' | 'routine';
export type PHCStaffRole = 'nurse' | 'doctor' | 'administrator' | 'chw';
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
  notes: string | null;
  last_advice_at: string | null;
  next_followup: string | null;
  escalated_to_case_id: string | null;
  opened_at: string;
  closed_at: string | null;
}

export interface WalkInResponse {
  patient_id: string;
  full_name: string;
  temp_password: string;
  queue_record_id: string;
  baseline_risk: {
    pcos_score: number;
    pcos_tier: string;
    hormonal_score: number;
    hormonal_tier: string;
    metabolic_score: number;
    metabolic_tier: string;
  };
}

export interface PHCNotification {
  id: string;
  type: 'new_referral' | 'score_change' | 'overdue_followup' | 'missed_checkin';
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  data: {
    action: 'open_patient' | 'open_dashboard';
    queue_record_id: string;
  };
}

export interface PHCAnalytics {
  total_patients: number;
  active_minor_risk: number;
  escalated_this_period: number;
  avg_time_to_action_days: number;
  risk_distribution: { low: number; moderate: number };
  condition_breakdown: { pcos: number; hormonal: number; metabolic: number };
  escalations_timeline: Array<{ week: string; count: number }>;
  staff_actions: {
    advice_sent: number;
    followups_scheduled: number;
    patients_discharged: number;
  };
}

export interface PHCLoginForm {
  email: string;
  password: string;
}

export interface EscalationForm {
  fmc_id: string;
  urgency: EscalationUrgency;
  reason: string;
  notes: string;
  attach_pdf?: boolean;
}

export interface PHCProfile {
  id: string;
  name: string;
  code: string;
  state: string;
  lga: string;
  phone: string;
  email: string;
  status: string;
  escalation_fmc?: { id: string; name: string };
  escalation_fmc_detail?: { id: string; name: string };
}

export interface PHCStaff {
  id: string;
  full_name: string;
  email: string;
  staff_role: string;
  employee_id: string | null;
  is_active: boolean;
}
