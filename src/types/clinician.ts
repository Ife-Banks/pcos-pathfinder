export type UserRole = 'patient' | 'clinician' | 'hcc_admin' | 'fhc_admin' | 'admin';

export interface CenterInfo {
  center_type: 'hcc' | 'fhc';
  center_name: string;
  is_verified: boolean; // clinician-specific — must be true to access portal
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_email_verified: boolean;
  onboarding_completed: boolean; // always false for clinicians — skip onboarding
  onboarding_step: number;
  center_info: CenterInfo | null;
  date_joined: string;
}

export type TreatmentPlanStatus = 'not_started' | 'draft' | 'active' | 'completed';
export type TierLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  bmi: number;
  assignment_date: string;
  tier: TierLevel;
  risk_scores: { pcos: number; hormonal: number; metabolic: number };
  treatment_plan_status: TreatmentPlanStatus;
  next_followup: string | null;
  is_new_assignment: boolean;
}

export interface Prescription {
  id: string;
  drug_name: string;
  dose: number;
  dose_unit: 'mg' | 'mcg' | 'IU' | 'mL';
  route: 'oral' | 'topical' | 'injection' | 'vaginal' | 'other';
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'custom';
  duration: string;
  instructions: string | null;
  start_date: string;
  status: 'active' | 'completed' | 'discontinued';
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  diagnosis: {
    conditions: string[];
    icd10_codes: string[];
    severity: 'mild' | 'moderate' | 'severe';
  };
  prescriptions: Prescription[];
  investigations: string[];
  lifestyle_recommendations: string;
  followup_date: string;
  followup_frequency: string;
  referral: any;
  status: TreatmentPlanStatus;
  created_at: string;
  updated_at: string;
}

export interface PatientDetail extends PatientSummary {
  full_name: string;
  email: string;
  phone: string;
  blood_type: string;
  fmc_case_id: string;
  medical_history: any;
  current_medications: Prescription[];
  lab_results: any[];
  imaging_results: any[];
  notes: any[];
}

export interface ClinicianAnalytics {
  total_patients_treated: number;
  active_cases: number;
  avg_treatment_duration: number;
  cases_resolved_this_month: number;
  avg_time_to_treatment_plan: number;
  condition_distribution: {
    pcos: number;
    hormonal: number;
    metabolic: number;
  };
  outcome_tracker: {
    resolved: number;
    under_treatment: number;
    referred_on: number;
  };
  risk_score_change: {
    average_delta: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  response_time: {
    avg_hours: number;
    target_hours: number;
  };
  prescription_breakdown: Array<{
    drug_name: string;
    count: number;
  }>;
}

export interface NotificationPreferences {
  new_assignment_alert: boolean;
  patient_message_alert: boolean;
  followup_due_reminder: boolean;
  critical_score_change: boolean;
}

export interface ClinicianProfile {
  id: string;
  user_email: string;
  user_full_name: string;
  fhc: string;
  fhc_name: string;
  fhc_code: string;
  specialization: string;
  downstream_expertise: string[];
  onboarded: boolean;
  onboarded_at: string | null;
  license_number: string;
  years_of_experience: number;
  bio: string;
  is_verified: boolean;
  verified_at: string | null;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicianOnboardingForm {
  specialization: string;
  downstream_expertise: string[];
  license_number?: string;
  years_of_experience?: number;
  bio?: string;
}

export interface TimelineEvent {
  id: string;
  patient_id: string;
  event_type: 'inference' | 'lab_upload' | 'checkin' | 'score_change' | 'referral' | 'wearable_sync';
  timestamp: string;
  data: any;
  description: string;
}

export interface Message {
  id: string;
  sender_type: 'clinician' | 'patient';
  sender_name: string;
  message_type: 'clinical_update' | 'test_result_notification' | 'appointment_reminder' | 'general';
  body: string;
  timestamp: string;
  read_status: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  date: string;
  time: string;
  type: 'in_person' | 'telemedicine' | 'follow_up_call';
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Form types
export interface ClinicianLoginForm {
  email: string;
  password: string;
  medical_license_number?: string;
  two_factor_code?: string;
}

export interface ClinicianRegistrationForm {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: 'clinician';
  medical_license_number: string;
  specialty: string;
}

export interface TreatmentPlanForm {
  patient_id: string;
  diagnosis: {
    conditions: string[];
    icd10_codes: string[];
    severity: 'mild' | 'moderate' | 'severe';
  };
  prescriptions: Array<{
    drug_name: string;
    dose: number;
    dose_unit: string;
    route: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  investigations: string[];
  lifestyle_recommendations: string;
  followup_date: string;
  followup_frequency: string;
  referral?: any;
  status: TreatmentPlanStatus;
}

export interface PrescriptionForm {
  patient_id: string;
  drug_name: string;
  dose: number;
  dose_unit: 'mg' | 'mcg' | 'IU' | 'mL';
  route: 'oral' | 'topical' | 'injection' | 'vaginal' | 'other';
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'custom';
  duration: string;
  instructions?: string;
  start_date: string;
}

export interface MessageForm {
  message_type: 'clinical_update' | 'test_result_notification' | 'appointment_reminder' | 'general';
  body: string;
}

export interface AppointmentForm {
  date: string;
  time: string;
  type: 'in_person' | 'telemedicine' | 'follow_up_call';
  notes?: string;
}

export interface LetterForm {
  letter_type: 'treatment_summary' | 'referral_letter' | 'discharge_letter' | 'custom';
  custom_content?: string;
}
