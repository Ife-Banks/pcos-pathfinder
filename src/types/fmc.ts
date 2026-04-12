export type FMCRole = 'fhc_staff' | 'fhc_admin';
export type CaseStatus = 'open' | 'assigned' | 'under_treatment' | 'discharged';
export type CaseSeverity = 'severe' | 'very_severe';
export type CaseCondition = 'pcos' | 'maternal' | 'cardiovascular';
export type ClinicianAvailability = 'available' | 'at_capacity' | 'off_duty';
export type StaffRole = 'coordinator' | 'triage' | 'records' | 'other';
export type Specialization =
  | 'general_practice' | 'obstetrics_gynae' | 'endocrinology'
  | 'cardiology' | 'internal_medicine' | 'reproductive_health'
  | 'midwifery' | 'nursing' | 'other';

export interface PatientCase {
  id: string;
  patient: { id: string; full_name: string; email: string };
  fhc: string;
  clinician: ClinicianSummary | null;
  condition: CaseCondition;
  condition_label: string;
  severity: CaseSeverity;
  severity_label: string;
  status: CaseStatus;
  status_label: string;
  opening_score: number;
  closing_score: number | null;
  fmc_notes: string;
  opened_at: string;
  assigned_at: string | null;
  closed_at: string | null;
}

export interface ClinicianSummary {
  id: string;
  full_name: string;
  specialization: Specialization;
  license_number: string;
  is_verified: boolean;
  active_case_count: number;
  availability: ClinicianAvailability;
}

export interface FMCStaff {
  id: string;
  full_name: string;
  email: string;
  staff_role: StaffRole;
  employee_id: string | null;
  is_active: boolean;
}

export interface FMCProfile {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  state: string;
  specialty_departments: string[];
  total_staff: number;
  notify_on_severe: boolean;
  notify_on_very_severe: boolean;
}

export interface DiagnosticRequest {
  patient_id: string;
  tests: string[];
  urgency: 'routine' | 'urgent';
  custom_note?: string;
}

export interface DiagnosticStatus {
  pending_requests: Array<{
    id: string;
    test_name: string;
    patient_id: string;
    patient_name: string;
    date_sent: string;
    days_elapsed: number;
    status: 'awaiting_upload';
  }>;
  received_results: Array<{
    id: string;
    test_name: string;
    value: string;
    reference_range: string;
    is_normal: boolean;
    date_uploaded: string;
    auto_inferred: boolean;
  }>;
}

export interface FMCAnalytics {
  total_active_cases: number;
  critical_cases: number;
  avg_days_to_assignment: number;
  cases_resolved_this_month: number;
  severity_distribution: {
    critical: number;
    high: number;
  };
  condition_prevalence: {
    pcos: number;
    maternal: number;
    cardiovascular: number;
  };
  referral_sources: Array<{
    phc_name: string;
    referral_count: number;
  }>;
  time_to_assignment: Array<{
    days: number;
    case_count: number;
  }>;
  outcomes: {
    resolved: number;
    under_treatment: number;
    referred_externally: number;
  };
  clinician_load: Array<{
    clinician_name: string;
    case_count: number;
    avg_time_per_case: number;
  }>;
}

export interface FMCAlert {
  id: string;
  type: 'critical_unassigned' | 'new_referral' | 'score_worsened' | 'diagnostics_overdue' | 'missed_appointment';
  severity: 'critical' | 'warning' | 'info';
  patient_id?: string;
  patient_name?: string;
  case_id?: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
}

export interface DischargeForm {
  condition_confirmed: 'pcos_confirmed' | 'hormonal_imbalance' | 'metabolic_syndrome' | 'multiple' | 'none_confirmed';
  diagnostic_basis: 'clinical_criteria' | 'lab_results' | 'imaging' | 'combined';
  treatment_summary: string;
  follow_up_plan: 'discharged_to_phc' | 'self_monitor_app' | 'specialist_followup' | 'tertiary_referral';
  closing_score: number;
  discharge_letter: string;
}

export interface FMCLoginForm {
  email: string;
  password: string;
  two_factor_code?: string;
}

export interface FMCStaffForm {
  full_name: string;
  email: string;
  staff_role: StaffRole;
  employee_id?: string;
}

export interface FMCClinicianForm {
  full_name: string;
  email: string;
  specialization: Specialization;
  license_number: string;
  years_of_experience: number;
  bio?: string;
}

export interface CaseAssignmentForm {
  clinician_id: string;
}

export interface CaseStatusForm {
  status: CaseStatus;
  fmc_notes?: string;
}

export interface FMCNotificationPreferences {
  new_referral_alert: boolean;
  score_change_alert: boolean;
  critical_unassigned_alert: boolean;
  diagnostics_overdue_alert: boolean;
}
