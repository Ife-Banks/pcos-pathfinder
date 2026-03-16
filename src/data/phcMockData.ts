// Mock data for the PHC Portal

export interface PHCPatient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  bmi: number;
  gender: string;
  phone: string;
  email?: string;
  pcosScore: number;
  hormonalScore: number;
  metabolicScore: number;
  pcosTier: 'Low' | 'Moderate' | 'High' | 'Critical';
  hormonalTier: 'Low' | 'Moderate' | 'High' | 'Critical';
  metabolicTier: 'Low' | 'Moderate' | 'High' | 'Critical';
  conditionFlags: string[];
  referredDate: string;
  status: 'New' | 'Under Review' | 'Action Taken' | 'Discharged';
  referralSource: string;
  assignedTo?: string;
  lastCheckIn?: string;
  registeredAt: string;
  cycleDay?: number;
  clv?: number;
  cycleDurations?: number[];
}

export interface PHCAlert {
  id: string;
  type: 'new_referral' | 'score_change' | 'overdue_followup' | 'missed_checkin' | 'escalation_required';
  patientId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SentAdvice {
  id: string;
  patientId: string;
  condition: string;
  message: string;
  sentAt: string;
  readByPatient: boolean;
  followUpDate?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: 'In-Person' | 'Phone Call' | 'Home Visit';
  status: 'Upcoming' | 'Completed' | 'Missed';
  notes?: string;
}

export interface SymptomEntry {
  id: string;
  date: string;
  session: 'Morning' | 'Evening';
  conditionTrack: 'PCOS' | 'Hormonal' | 'Metabolic';
  cyclePhase: 'Follicular' | 'Ovulatory' | 'Luteal' | 'Menstrual';
  scores: Record<string, number>;
}

export interface LabMarker {
  name: string;
  value: number | null;
  unit: string;
  referenceRange: string;
  dateCollected: string | null;
  status: 'Normal' | 'Flagged' | 'Critical' | 'Missing';
}

export const mockStaff = {
  id: 'STF-0042',
  firstName: 'Amina',
  lastName: 'Ibrahim',
  email: 'amina.ibrahim@phc-abuja.ng',
  role: 'phc_staff',
  facilityName: 'Wuse District PHC',
  facilityId: 'PHC-ABJ-012',
  facilityAddress: '14 Aminu Kano Crescent, Wuse II, Abuja',
  facilityPhone: '+234 809 123 4567',
  operatingHours: '8:00 AM — 5:00 PM',
  activeStaffCount: 12,
  isAdmin: true,
};

export const mockPatients: PHCPatient[] = [
  {
    id: 'P-00234',
    firstName: 'Fatima',
    lastName: 'Adeyemi',
    age: 27,
    bmi: 26.4,
    gender: 'Female',
    phone: '+234 801 234 5678',
    email: 'fatima.a@email.com',
    pcosScore: 0.42,
    hormonalScore: 0.31,
    metabolicScore: 0.28,
    pcosTier: 'Moderate',
    hormonalTier: 'Low',
    metabolicTier: 'Low',
    conditionFlags: ['PCOS'],
    referredDate: '2026-03-13',
    status: 'New',
    referralSource: 'Self-referred via app',
    lastCheckIn: '2026-03-15',
    registeredAt: '2026-03-13',
    cycleDay: 18,
    clv: 5.2,
    cycleDurations: [28, 32, 29, 35],
  },
  {
    id: 'P-00189',
    firstName: 'Grace',
    lastName: 'Okonkwo',
    age: 34,
    bmi: 30.1,
    gender: 'Female',
    phone: '+234 802 345 6789',
    pcosScore: 0.55,
    hormonalScore: 0.48,
    metabolicScore: 0.61,
    pcosTier: 'Moderate',
    hormonalTier: 'Moderate',
    metabolicTier: 'Moderate',
    conditionFlags: ['PCOS', 'Hormonal', 'Metabolic'],
    referredDate: '2026-03-10',
    status: 'Under Review',
    referralSource: 'Walk-in registration',
    assignedTo: 'Amina Ibrahim',
    lastCheckIn: '2026-03-14',
    registeredAt: '2026-03-10',
    cycleDay: 8,
    clv: 9.1,
    cycleDurations: [26, 38, 30, 42],
  },
  {
    id: 'P-00301',
    firstName: 'Blessing',
    lastName: 'Nwosu',
    age: 22,
    bmi: 23.8,
    gender: 'Female',
    phone: '+234 803 456 7890',
    pcosScore: 0.82,
    hormonalScore: 0.35,
    metabolicScore: 0.29,
    pcosTier: 'Critical',
    hormonalTier: 'Low',
    metabolicTier: 'Low',
    conditionFlags: ['PCOS'],
    referredDate: '2026-03-12',
    status: 'Under Review',
    referralSource: 'Self-referred via app',
    lastCheckIn: '2026-03-11',
    registeredAt: '2026-03-12',
    cycleDay: 5,
    clv: 12.3,
    cycleDurations: [24, 45, 28, 50],
  },
  {
    id: 'P-00456',
    firstName: 'Chioma',
    lastName: 'Eze',
    age: 29,
    bmi: 27.5,
    gender: 'Female',
    phone: '+234 804 567 8901',
    pcosScore: 0.22,
    hormonalScore: 0.18,
    metabolicScore: 0.15,
    pcosTier: 'Low',
    hormonalTier: 'Low',
    metabolicTier: 'Low',
    conditionFlags: [],
    referredDate: '2026-03-14',
    status: 'Action Taken',
    referralSource: 'Walk-in registration',
    assignedTo: 'Amina Ibrahim',
    lastCheckIn: '2026-03-16',
    registeredAt: '2026-03-14',
    cycleDay: 22,
    clv: 3.1,
    cycleDurations: [28, 27, 29, 28],
  },
  {
    id: 'P-00512',
    firstName: 'Ngozi',
    lastName: 'Okoro',
    age: 31,
    bmi: 32.4,
    gender: 'Female',
    phone: '+234 805 678 9012',
    pcosScore: 0.38,
    hormonalScore: 0.52,
    metabolicScore: 0.45,
    pcosTier: 'Moderate',
    hormonalTier: 'Moderate',
    metabolicTier: 'Moderate',
    conditionFlags: ['Hormonal', 'Metabolic'],
    referredDate: '2026-03-11',
    status: 'Under Review',
    referralSource: 'Self-referred via app',
    assignedTo: 'Amina Ibrahim',
    lastCheckIn: '2026-03-15',
    registeredAt: '2026-03-11',
    cycleDay: 14,
    clv: 6.8,
    cycleDurations: [30, 33, 28, 36],
  },
  {
    id: 'P-00623',
    firstName: 'Aisha',
    lastName: 'Bello',
    age: 25,
    bmi: 24.2,
    gender: 'Female',
    phone: '+234 806 789 0123',
    pcosScore: 0.15,
    hormonalScore: 0.12,
    metabolicScore: 0.55,
    pcosTier: 'Low',
    hormonalTier: 'Low',
    metabolicTier: 'Moderate',
    conditionFlags: ['Metabolic'],
    referredDate: '2026-03-15',
    status: 'New',
    referralSource: 'Self-referred via app',
    lastCheckIn: '2026-03-16',
    registeredAt: '2026-03-15',
    cycleDay: 3,
    clv: 2.4,
    cycleDurations: [27, 28, 29, 27],
  },
  {
    id: 'P-00734',
    firstName: 'Yetunde',
    lastName: 'Afolabi',
    age: 38,
    bmi: 35.2,
    gender: 'Female',
    phone: '+234 807 890 1234',
    pcosScore: 0.44,
    hormonalScore: 0.72,
    metabolicScore: 0.68,
    pcosTier: 'Moderate',
    hormonalTier: 'High',
    metabolicTier: 'Moderate',
    conditionFlags: ['PCOS', 'Hormonal', 'Metabolic'],
    referredDate: '2026-03-09',
    status: 'Under Review',
    referralSource: 'Walk-in registration',
    assignedTo: 'Amina Ibrahim',
    lastCheckIn: '2026-03-13',
    registeredAt: '2026-03-09',
    cycleDay: 31,
    clv: 8.5,
    cycleDurations: [32, 40, 28, 44],
  },
  {
    id: 'P-00845',
    firstName: 'Halima',
    lastName: 'Musa',
    age: 20,
    bmi: 22.1,
    gender: 'Female',
    phone: '+234 808 901 2345',
    pcosScore: 0.28,
    hormonalScore: 0.22,
    metabolicScore: 0.19,
    pcosTier: 'Low',
    hormonalTier: 'Low',
    metabolicTier: 'Low',
    conditionFlags: [],
    referredDate: '2026-03-16',
    status: 'New',
    referralSource: 'Self-referred via app',
    lastCheckIn: '2026-03-16',
    registeredAt: '2026-03-16',
  },
];

export const mockAlerts: PHCAlert[] = [
  {
    id: 'ALT-001',
    type: 'escalation_required',
    patientId: 'P-00301',
    message: "Patient P-00301's PCOS score has reached Critical tier. Immediate escalation to FMC is required.",
    timestamp: '2026-03-16T08:30:00',
    read: false,
  },
  {
    id: 'ALT-002',
    type: 'score_change',
    patientId: 'P-00189',
    message: "Patient P-00189's Metabolic Health score has increased from Low to Moderate.",
    timestamp: '2026-03-16T07:15:00',
    read: false,
  },
  {
    id: 'ALT-003',
    type: 'new_referral',
    patientId: 'P-00845',
    message: 'New patient P-00845 has been referred to this PHC via the AI-MSHM app.',
    timestamp: '2026-03-16T06:00:00',
    read: false,
  },
  {
    id: 'ALT-004',
    type: 'missed_checkin',
    patientId: 'P-00234',
    message: 'Patient P-00234 has not checked in for 8 days. Schedule a follow-up.',
    timestamp: '2026-03-15T14:00:00',
    read: true,
  },
  {
    id: 'ALT-005',
    type: 'overdue_followup',
    patientId: 'P-00456',
    message: 'Scheduled follow-up with Patient P-00456 is 3 days overdue.',
    timestamp: '2026-03-15T10:30:00',
    read: true,
  },
];

export const mockSentAdvice: SentAdvice[] = [
  {
    id: 'ADV-001',
    patientId: 'P-00234',
    condition: 'PCOS',
    message: 'Reduce refined carbohydrates and sugars — this helps manage insulin resistance common in PCOS. Aim for 150 minutes of moderate aerobic exercise per week.',
    sentAt: '2026-03-14T10:30:00',
    readByPatient: true,
    followUpDate: '2026-03-21',
  },
  {
    id: 'ADV-002',
    patientId: 'P-00189',
    condition: 'Metabolic',
    message: 'Walk for 30 minutes daily — consistent low-intensity activity helps metabolic regulation. Keep a food diary for 2 weeks to identify blood sugar trigger foods.',
    sentAt: '2026-03-12T09:15:00',
    readByPatient: false,
    followUpDate: '2026-03-26',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'APT-001',
    patientId: 'P-00234',
    date: '2026-03-20',
    time: '10:00',
    type: 'In-Person',
    status: 'Upcoming',
  },
  {
    id: 'APT-002',
    patientId: 'P-00189',
    date: '2026-03-18',
    time: '14:30',
    type: 'Phone Call',
    status: 'Upcoming',
    notes: 'Follow-up on metabolic markers',
  },
];

export const mockSymptomEntries: SymptomEntry[] = [
  {
    id: 'SYM-001',
    date: '2026-03-16',
    session: 'Morning',
    conditionTrack: 'PCOS',
    cyclePhase: 'Luteal',
    scores: { Fatigue: 6, 'Pelvic Pressure': 3, 'Cognitive Load': 4 },
  },
  {
    id: 'SYM-002',
    date: '2026-03-15',
    session: 'Evening',
    conditionTrack: 'Hormonal',
    cyclePhase: 'Luteal',
    scores: { 'Breast Soreness': 5, Acne: 2, Bloating: 4 },
  },
  {
    id: 'SYM-003',
    date: '2026-03-15',
    session: 'Morning',
    conditionTrack: 'Metabolic',
    cyclePhase: 'Luteal',
    scores: { Fatigue: 7, 'Pelvic Pressure': 2, 'Blood Pressure': 3 },
  },
  {
    id: 'SYM-004',
    date: '2026-03-14',
    session: 'Evening',
    conditionTrack: 'PCOS',
    cyclePhase: 'Ovulatory',
    scores: { 'Breast Soreness': 3, Acne: 5, 'Night Sweats': 1 },
  },
  {
    id: 'SYM-005',
    date: '2026-03-14',
    session: 'Morning',
    conditionTrack: 'Hormonal',
    cyclePhase: 'Ovulatory',
    scores: { Fatigue: 4, 'Muscle Weakness': 3, Libido: 6 },
  },
];

export const mockPCOSLabMarkers: LabMarker[] = [
  { name: 'Total Testosterone', value: 2.8, unit: 'nmol/L', referenceRange: '0.5–2.4', dateCollected: '2026-03-10', status: 'Flagged' },
  { name: 'Free Testosterone', value: 0.035, unit: 'nmol/L', referenceRange: '0.01–0.03', dateCollected: '2026-03-10', status: 'Flagged' },
  { name: 'DHEA-S', value: 280, unit: 'µg/dL', referenceRange: '65–380', dateCollected: '2026-03-10', status: 'Normal' },
  { name: 'SHBG', value: 25, unit: 'nmol/L', referenceRange: '18–144', dateCollected: '2026-03-10', status: 'Normal' },
  { name: 'AMH', value: 8.2, unit: 'ng/mL', referenceRange: '1.0–3.5', dateCollected: '2026-03-10', status: 'Flagged' },
  { name: 'LH', value: 12.5, unit: 'IU/L', referenceRange: '2.4–12.6', dateCollected: '2026-03-10', status: 'Normal' },
  { name: 'FSH', value: 5.1, unit: 'IU/L', referenceRange: '3.5–12.5', dateCollected: '2026-03-10', status: 'Normal' },
  { name: 'LH:FSH Ratio', value: 2.45, unit: 'ratio', referenceRange: '<2.0', dateCollected: '2026-03-10', status: 'Flagged' },
  { name: 'Prolactin', value: null, unit: 'ng/mL', referenceRange: '4.8–23.3', dateCollected: null, status: 'Missing' },
  { name: '17-OH Progesterone', value: null, unit: 'ng/dL', referenceRange: '20–290', dateCollected: null, status: 'Missing' },
  { name: 'Androstenedione', value: null, unit: 'ng/dL', referenceRange: '40–150', dateCollected: null, status: 'Missing' },
];

export const mockHormonalMarkers: LabMarker[] = [
  { name: 'Estradiol (E2)', value: 145, unit: 'pg/mL', referenceRange: '15–350 (follicular)', dateCollected: '2026-03-10', status: 'Normal' },
  { name: 'Progesterone', value: 0.8, unit: 'ng/mL', referenceRange: '0.2–1.5 (follicular)', dateCollected: '2026-03-10', status: 'Normal' },
  { name: 'TSH', value: 3.2, unit: 'mIU/L', referenceRange: '0.27–4.20', dateCollected: '2026-03-10', status: 'Normal' },
  { name: 'Free T4', value: null, unit: 'ng/dL', referenceRange: '0.93–1.7', dateCollected: null, status: 'Missing' },
  { name: 'Cortisol (AM)', value: null, unit: 'µg/dL', referenceRange: '6–23', dateCollected: null, status: 'Missing' },
];

export const mockMetabolicMarkers: LabMarker[] = [
  { name: 'Fasting Glucose', value: 102, unit: 'mg/dL', referenceRange: '70–100', dateCollected: '2026-03-10', status: 'Flagged' },
  { name: 'Fasting Insulin', value: 18.5, unit: 'µIU/mL', referenceRange: '2.6–24.9', dateCollected: '2026-03-10', status: 'Normal' },
  { name: 'HOMA-IR', value: 4.65, unit: 'index', referenceRange: '<2.5', dateCollected: '2026-03-10', status: 'Flagged' },
  { name: 'HbA1c', value: 5.8, unit: '%', referenceRange: '<5.7', dateCollected: '2026-03-10', status: 'Flagged' },
  { name: 'Total Cholesterol', value: 210, unit: 'mg/dL', referenceRange: '<200', dateCollected: '2026-03-10', status: 'Flagged' },
  { name: 'Triglycerides', value: null, unit: 'mg/dL', referenceRange: '<150', dateCollected: null, status: 'Missing' },
  { name: 'HDL-C', value: 42, unit: 'mg/dL', referenceRange: '>50', dateCollected: '2026-03-10', status: 'Flagged' },
  { name: 'LDL-C', value: null, unit: 'mg/dL', referenceRange: '<100', dateCollected: null, status: 'Missing' },
];

export const adviceTemplates = {
  PCOS: [
    'Reduce refined carbohydrates and sugars — this helps manage insulin resistance common in PCOS',
    'Aim for 150 minutes of moderate aerobic exercise per week (e.g. brisk walking, cycling)',
    'Maintain a consistent sleep schedule — sleep disruption worsens hormonal balance',
    'Track your menstrual cycle monthly using the AI-MSHM app',
    'Manage stress with daily relaxation techniques — chronic stress elevates androgens',
  ],
  'Hormonal Health': [
    'Track your night sweats — note the time they occur and how long they last',
    'Avoid caffeine after 2pm — caffeine disrupts hormonal sleep patterns',
    'Include magnesium-rich foods in your diet (spinach, nuts, seeds) to reduce muscle weakness',
    'Practice pelvic floor exercises to help manage pelvic pressure and breast soreness',
    'Discuss your symptoms with a gynaecologist if night sweats persist more than 3 weeks',
  ],
  'Metabolic Health': [
    'Reduce your daily sodium intake to help manage blood pressure',
    'Walk for 30 minutes daily — consistent low-intensity activity helps metabolic regulation',
    'Keep a food diary for 2 weeks to identify blood sugar trigger foods',
    'Monitor your waist circumference monthly — log it in your AI-MSHM app',
    'Avoid long periods of sitting — take a 5-minute walk every hour if possible',
  ],
};

export const mockFMCs = [
  { id: 'FMC-001', name: 'National Hospital Abuja', distance: '4.2 km', specialties: ['Gynaecology', 'Endocrinology', 'Internal Medicine'] },
  { id: 'FMC-002', name: 'University of Abuja Teaching Hospital', distance: '12.8 km', specialties: ['Gynaecology', 'General Medicine'] },
  { id: 'FMC-003', name: 'Garki Hospital', distance: '6.5 km', specialties: ['Internal Medicine', 'Endocrinology'] },
];
