import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sun, Moon, Activity, TrendingUp, Calendar, AlertCircle, MessageCircle,
  ChevronRight, ChevronDown, ChevronUp, Bell, User, Heart, BarChart3, ClipboardCheck, Loader2, Check, Camera, LogOut, Wrench, Timer,
  Brain, Droplets, HeartPulse, Thermometer, Target, Zap, Smile, Frown, Shield, Stethoscope, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { NotificationPanel } from "@/components/NotificationPanel";
import { dashboardService, UserProfile, PredictionData } from "@/services/dashboardService";
import { checkinService } from "@/services/checkinService";
import { menstrualService, CriterionFlags } from "@/services/menstrualService";
import { apiClient } from "@/services/apiClient";
import { isToolCompleteThisWeek, getCurrentWeekKey, isToolCompleteToday } from "@/utils/weekUtils";
import logo from "@/assets/logo.png";
import { AnimatePresence } from "framer-motion";

const TrialBanner = () => {
  const { subscription } = useAuth();
  const navigate = useNavigate();
  if (!subscription?.is_trial || !subscription?.is_active) return null;
  const days = subscription.days_remaining;
  if (days > 14) return null;
  const urgent = days <= 3;
  return (
    <div className={`mx-6 mt-3 rounded-xl px-4 py-3 flex items-center justify-between gap-3 ${urgent ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
      <p className={`text-sm font-medium ${urgent ? 'text-red-700' : 'text-amber-700'}`}>
        {days === 0 ? 'Your trial expires today' : `${days} day${days === 1 ? '' : 's'} left in your free trial`}
      </p>
      <button
        onClick={() => navigate('/subscription/upgrade')}
        className={`text-xs font-semibold shrink-0 px-3 py-1 rounded-lg ${urgent ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}
      >
        Upgrade
      </button>
    </div>
  );
};

const TEAL_PRIMARY = '#00897B';

const getRiskTier = (score: number) => {
  if (score < 0.25) return { label: "Low", color: "#27AE60", bg: "bg-green-100", textColor: "text-green-700" };
  if (score < 0.5) return { label: "Moderate", color: "#F39C12", bg: "bg-amber-100", textColor: "text-amber-700" };
  if (score < 0.75) return { label: "High", color: "#E74C3C", bg: "bg-orange-100", textColor: "text-orange-700" };
  return { label: "Critical", color: "#C0392B", bg: "bg-red-100", textColor: "text-red-700" };
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour <= 4) return "Good night";
  if (hour >= 5 && hour <= 11) return "Good morning";
  if (hour >= 12 && hour <= 16) return "Good afternoon";
  if (hour >= 17 && hour <= 23) return "Good evening";
  return "Good morning";
};

  const getRelativeTime = (dateStr: string): string | null => {
  if (!dateStr || dateStr === "") return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'just now';
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
};

const getCompletenessColor = (pct: number) => {
  if (pct < 40) return "#E74C3C";
  if (pct < 71) return "#F39C12";
  if (pct < 90) return TEAL_PRIMARY;
  return "#27AE60";
};

const expandAbbreviation = (key: string): string => {
  const mapping: Record<string, string> = {
    'T2D': 'Type 2 Diabetes',
    'CVD': 'Cardiovascular Disease',
    'PMDD': 'Premenstrual Dysphoric Disorder',
    'CLV': 'Cycle Length Variation',
    'TTH': 'Teaching Tertiary Hospital',
    'STH': 'Secondary Tertiary Hospital',
    'FTH': 'Federal Tertiary Hospital',
    'HMO': 'Health Maintenance Organization',
    'PHC': 'Primary Healthcare Centre',
    'PTTH': 'Private Teaching Tertiary Hospital',
    'STTH': 'State Tertiary Teaching Hospital',
    'FMC': 'Federal Medical Centre',
    'HRV': 'Heart Rate Variability',
    'rPPG': 'Remote Photoplethysmography',
    'TIR': 'Time in Range',
    'GDM': 'Gestational Diabetes Mellitus',
    'PCOS': 'Polycystic Ovary Syndrome',
    'GAD': 'Generalized Anxiety Disorder',
    'PHQ': 'Patient Health Questionnaire',
    'MGH': 'Multi-Disciplinary Group Healthcare',
    'LGA': 'Local Government Area',
    'BMI': 'Body Mass Index',
    'SMBG': 'Self-Monitoring of Blood Glucose',
    'HbA1c': 'Hemoglobin A1c',
    'LDL': 'Low-Density Lipoprotein',
    'HDL': 'High-Density Lipoprotein',
    'VLDL': 'Very-Low-Density Lipoprotein',
    'TG': 'Triglycerides',
    'TC': 'Total Cholesterol',
    'SBP': 'Systolic Blood Pressure',
    'DBP': 'Diastolic Blood Pressure',
    'MAP': 'Mean Arterial Pressure',
    'HR': 'Heart Rate',
    'SpO2': 'Oxygen Saturation',
    'RR': 'Respiratory Rate',
    'UTI': 'Urinary Tract Infection',
    'STI': 'Sexually Transmitted Infection',
    'IVF': 'In Vitro Fertilization',
    'IUI': 'Intrauterine Insemination',
    'LH': 'Luteinizing Hormone',
    'FSH': 'Follicle Stimulating Hormone',
    'E2': 'Estradiol',
    'P4': 'Progesterone',
    'T': 'Testosterone',
    'PRL': 'Prolactin',
    'AMH': 'Anti-Müllerian Hormone',
    'SHBG': 'Sex Hormone Binding Globulin',
    'DHEA': 'Dehydroepiandrosterone',
    'AID': 'Autoimmune Disease',
    'SLE': 'Systemic Lupus Erythematosus',
    'RA': 'Rheumatoid Arthritis',
    'MS': 'Multiple Sclerosis',
    'IBD': 'Inflammatory Bowel Disease',
    'T1D': 'Type 1 Diabetes',
    'CKD': 'Chronic Kidney Disease',
    'ESRD': 'End-Stage Renal Disease',
    'CHF': 'Congestive Heart Failure',
    'COPD': 'Chronic Obstructive Pulmonary Disease',
    'OSA': 'Obstructive Sleep Apnea',
    'NAFLD': 'Non-Alcoholic Fatty Liver Disease',
    'METS': 'Metabolic Syndrome',
    'MetSyn': 'Metabolic Syndrome',
    'Stroke': 'Stroke',
    'HF': 'Heart Failure',
    'HeartFailure': 'Heart Failure',
    'ChronicStress': 'Chronic Stress',
    'Endometrial': 'Endometrial Cancer',
    'Infertility_Mood': 'Infertility',
    'PAD': 'Peripheral Arterial Disease',
    'AF': 'Atrial Fibrillation',
    'MI': 'Myocardial Infarction',
    'ACS': 'Acute Coronary Syndrome',
    'CABG': 'Coronary Artery Bypass Graft',
    'PCI': 'Percutaneous Coronary Intervention',
    'SVD': 'Small Vessel Disease',
    'LVD': 'Large Vessel Disease',
    'CVD_Mood': 'Cardiovascular Disease',
    'T2D_Mood': 'Type 2 Diabetes',
    'MetSyn_Mood': 'Metabolic Syndrome',
    'Stroke_Mood': 'Stroke',
    'Anxiety': 'Anxiety',
    'Depression': 'Depression',
    'Insomnia': 'Insomnia',
    'Bipolar': 'Bipolar Disorder',
    'Schizophrenia': 'Schizophrenia',
    'Anorexia': 'Anorexia Nervosa',
    'Bulimia': 'Bulimia Nervosa',
    'OCD': 'Obsessive Compulsive Disorder',
    'PTSD': 'Post Traumatic Stress Disorder',
    'ADHD': 'Attention Deficit Hyperactivity Disorder',
    'ASD': 'Autism Spectrum Disorder',
    'OID': 'Opioid Use Disorder',
    'AUD': 'Alcohol Use Disorder',
    'SUD': 'Substance Use Disorder',
    'CUD': 'Cannabis Use Disorder',
    'NIC': 'Nicotine Use Disorder',
    'SH': 'Self-Harm',
    'SI': 'Suicidal Ideation',
    'ED': 'Eating Disorder',
    'BFR': 'Bioavailability Factor',
    'AUC': 'Area Under Curve',
    'Cmax': 'Maximum Concentration',
    'Tmax': 'Time to Maximum',
    't1/2': 'Half Life',
    'VD': 'Volume of Distribution',
    'CL': 'Clearance',
    'F': 'Bioavailability',
    'Cardiovascular_Disease': 'Cardiovascular Disease',
    'Type_2_Diabetes': 'Type 2 Diabetes',
    'Metabolic_Syndrome': 'Metabolic Syndrome',
    'Heart_Failure': 'Heart Failure',
    'Chronic_Stress': 'Chronic Stress',
    'Infertility': 'Infertility',
    'Sleep_Quality': 'Sleep Quality',
    'Focus_Memory': 'Focus & Memory',
    'Mental_Wellness': 'Mental Wellness',
    'Mood_Score': 'Mood Check',
  };
  return mapping[key] || key.replace(/_/g, ' ');
};

const getHrvLabel = (rmssd: number): string => {
  if (rmssd >= 50) return 'Normal';
  if (rmssd >= 40) return 'Very Good';
  if (rmssd >= 30) return 'Good';
  if (rmssd >= 20) return 'Low';
  if (rmssd >= 10) return 'Very Low';
  return 'Extremely Low';
};

const getUnifiedSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'Extreme': return '#dc2626';
    case 'Severe': return '#ea580c';
    case 'Moderate': return '#d97706';
    case 'Mild': return '#2563eb';
    case 'Minimal': return '#16a34a';
    default: return '#6b7280';
  }
};

const getUnifiedSeverityBg = (severity: string): string => {
  switch (severity) {
    case 'Extreme': return '#fef2f2';
    case 'Severe': return '#fff7ed';
    case 'Moderate': return '#fffbeb';
    case 'Mild': return '#eff6ff';
    case 'Minimal': return '#f0fdf4';
    default: return '#f9fafb';
  }
};

const getWellnessColor = (severity: string): string => {
  switch (severity) {
    case 'Excellent': return '#16a34a';
    case 'Good': return '#0d9488';
    case 'Moderate': return '#d97706';
    case 'Below Average': return '#ea580c';
    case 'Poor': return '#dc2626';
    default: return '#6b7280';
  }
};

const getWellnessBg = (severity: string): string => {
  switch (severity) {
    case 'Excellent': return '#f0fdf4';
    case 'Good': return '#f0fdfa';
    case 'Moderate': return '#fffbeb';
    case 'Below Average': return '#fff7ed';
    case 'Poor': return '#fef2f2';
    default: return '#f9fafb';
  }
};

const getDiseaseIcon = (disease: string): React.ReactNode => {
  const iconClass = "w-5 h-5 shrink-0";
  switch (disease) {
    case 'CVD': return <Heart className={iconClass} style={{ color: '#dc2626' }} />;
    case 'T2D': return <Droplets className={iconClass} style={{ color: '#2563eb' }} />;
    case 'Metabolic': return <Activity className={iconClass} style={{ color: '#7c3aed' }} />;
    case 'HeartFailure': return <HeartPulse className={iconClass} style={{ color: '#e11d48' }} />;
    case 'ChronicStress': return <Brain className={iconClass} style={{ color: '#9333ea' }} />;
    case 'Infertility': return <Target className={iconClass} style={{ color: '#0891b2' }} />;
    case 'PMDD': return <Moon className={iconClass} style={{ color: '#7c3aed' }} />;
    case 'Dysmenorrhea': return <Thermometer className={iconClass} style={{ color: '#ea580c' }} />;
    case 'Endometrial': return <Stethoscope className={iconClass} style={{ color: '#be185d' }} />;
    case 'Sleep_Quality': return <Moon className={iconClass} style={{ color: '#0891b2' }} />;
    case 'Focus_Memory': return <Brain className={iconClass} style={{ color: '#7c3aed' }} />;
    case 'Mental_Wellness': return <Heart className={iconClass} style={{ color: '#059669' }} />;
    case 'Mood_Score': return <Sun className={iconClass} style={{ color: '#d97706' }} />;
    case 'Anxiety': return <Smile className={iconClass} style={{ color: '#ca8a04' }} />;
    case 'Depression': return <Frown className={iconClass} style={{ color: '#6d28d9' }} />;
    case 'Stroke': return <Zap className={iconClass} style={{ color: '#dc2626' }} />;
    case 'MetSyn': return <Shield className={iconClass} style={{ color: '#7c3aed' }} />;
    case 'Infertility_Mood': return <Target className={iconClass} style={{ color: '#0891b2' }} />;
    case 'CVD_Mood': return <Heart className={iconClass} style={{ color: '#dc2626' }} />;
    case 'T2D_Mood': return <Droplets className={iconClass} style={{ color: '#2563eb' }} />;
    case 'MetSyn_Mood': return <Shield className={iconClass} style={{ color: '#7c3aed' }} />;
    case 'Stroke_Mood': return <Zap className={iconClass} style={{ color: '#dc2626' }} />;
    default: return <Activity className={iconClass} style={{ color: '#6b7280' }} />;
  }
};

const getDiseaseBorderColor = (severity: string): string => {
  switch (severity) {
    case 'Extreme': return '#dc2626';
    case 'Severe': return '#ea580c';
    case 'Moderate': return '#d97706';
    case 'Mild': return '#2563eb';
    case 'Minimal': return '#16a34a';
    default: return '#d1d5db';
  }
};

const fatigueLabel = (v: number): string => {
  if (v <= 3) return 'Low';
  if (v <= 6) return 'Moderate';
  return 'High';
};

const moodLabel = (v: number): string => {
  if (v <= 2) return 'Normal';
  if (v <= 5) return 'Mild';
  if (v <= 8) return 'Moderate';
  return 'Severe';
};

const riskSeverityLabel = (v: number): string => {
  if (v < 0.20) return 'Minimal';
  if (v < 0.40) return 'Mild';
  if (v < 0.60) return 'Moderate';
  if (v < 0.80) return 'Severe';
  return 'Extreme';
};

const RiskGauge = ({ score }: { score?: number }) => {
  const safeScore = score ?? 0;
  const tier = getRiskTier(safeScore);
  const angle = safeScore * 180;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-28 overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#27AE60" />
              <stop offset="33%" stopColor="#F1C40F" />
              <stop offset="66%" stopColor="#E67E22" />
              <stop offset="100%" stopColor="#E74C3C" />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: score }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
          <motion.line
            x1="100" y1="100" x2="100" y2="30"
            stroke="#1F2937"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ transformOrigin: "100px 100px" }}
            initial={{ rotate: -90 }}
            animate={{ rotate: angle - 90 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
          <circle cx="100" cy="100" r="4" fill="#1F2937" />
        </svg>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center -mt-2"
      >
       <span>
  <span className="text-3xl font-bold font-display" style={{ color: tier.color }}>
    {safeScore.toFixed(2)}
  </span>{' '}
  <span className="text-lg font-extrabold text-black-500">/ 1.00</span>
</span>
        <p className="text-sm text-semibold text-gray-800">
          Risk Tier: <span className="font-extrabold" style={{ color: tier.color }}>{tier.label}</span>
        </p>
      </motion.div>
    </div>
  );
};

const CompletenessRing = ({ percent, missing }: { percent: number; missing: number }) => {
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (percent / 100) * circumference;
  const color = getCompletenessColor(percent);

  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <motion.circle
          cx="24" cy="24" r="20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-display text-gray-900">
        {percent}%
      </span>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
    <div className="h-24 bg-gray-100 rounded" />
  </div>
);

interface TodayData {
  morning_status: 'complete' | 'pending' | 'in_progress';
  evening_status: 'complete' | 'pending' | 'in_progress';
  streak_days: number;
  completeness_pct: number;
  missed_yesterday: string[];
  date: string;
}

interface TodaySummary {
  hrv_rmssd: number | null;
  fatigue_vas: number | null;
  mood_score: number | null;
  cardiovascular_score?: number | null;
  cardiovascular_severity?: string;
  infertility_score?: number | null;
  infertility_severity?: string;
  t2d_score?: number | null;
  t2d_severity?: string;
  chronic_stress_score?: number | null;
  chronic_stress_severity?: string;
  depression_score?: number | null;
  depression_severity?: string;
}

interface MenstrualSummary {
  mean_cycle_len: number | null;
  CLV: number | null;
  total_cycles_stored: number;
  criterion_flags?: CriterionFlags;
}

const DashboardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { user, logout } = useAuth();

  // Redirect patients with incomplete onboarding back to onboarding
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'patient' && !user.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [menstrualSummary, setMenstrualSummary] = useState<MenstrualSummary | null>(null);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModelDetail, setShowModelDetail] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttempts = useRef(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const greeting = getGreeting();
  const currentHour = new Date().getHours();
  const currentWeek = getCurrentWeekKey();

  const mfgComplete = isToolCompleteThisWeek('mfg');
  const phq4Complete = isToolCompleteThisWeek('phq4');

  const dailyToolsComplete = isToolCompleteToday('phq4') && isToolCompleteToday('sleep');
  const dailyContinuousComplete = isToolCompleteToday('affect') && isToolCompleteToday('focus');

  const fetchPrediction = useCallback(async (silent = false) => {
    if (!silent) setPredictionLoading(true);
    try {
      // Use new ML predictions service
      const res = await dashboardService.getMLPredictions();
      if (res.data) {
        setPrediction(res.data);
        return res.data;
      }
      setPrediction(null);
      return null;
    } catch {
      setPrediction(null);
      return null;
    } finally {
      if (!silent) setPredictionLoading(false);
    }
  }, []);

  const fetchMenstrualSummary = useCallback(async () => {
    try {
      const res = await menstrualService.getCycleHistory();
      const cycles = res.data?.cycles || [];
      if (cycles.length === 0) return;
      const aggregates = res.data?.aggregates;
      setMenstrualSummary({
        mean_cycle_len: aggregates?.mean_cycle_len ?? null,
        CLV: aggregates?.CLV ?? null,
        total_cycles_stored: cycles.length,
        criterion_flags: res.data?.criterion_flags,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchTodaySummary = useCallback(async () => {
    try {
      let hrv: number | null = null;
      let fatigue: number | null = null;
      let mood: number | null = null;

      const [hrvRes, todayRes, moodRes] = await Promise.allSettled([
        apiClient.get('/rppg/sessions'),
        checkinService.getTodayStatus(),
        apiClient.get('/mood/history'),
      ]);

      if (hrvRes.status === 'fulfilled' && hrvRes.value.data?.data?.sessions?.length > 0) {
        const latestSession = hrvRes.value.data.data.sessions[0];
        hrv = latestSession.rmssd ?? latestSession.hrv_rmssd ?? null;
      }

      if (todayRes.status === 'fulfilled' && todayRes.value.data?.morning_session_id) {
        try {
          const morningRes = await apiClient.get(`/checkin/morning/${todayRes.value.data.morning_session_id}/`);
          if (morningRes.data?.data) {
            fatigue = morningRes.data.data.fatigue_vas ?? null;
          }
        } catch { /* ignore */ }
      }

      if (moodRes.status === 'fulfilled') {
        const logs = moodRes.value.data?.data?.logs;
        if (Array.isArray(logs) && logs.length > 0) {
          const latestMood = logs[0];
          mood = latestMood.phq4Total ?? latestMood.phq4_total ?? null;
        }
      }

      setTodaySummary({ hrv_rmssd: hrv, fatigue_vas: fatigue, mood_score: mood });
      return true;
    } catch {
      return false;
    }
  }, []);

  const startPredictionPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingAttempts.current = 0;
    pollingRef.current = setInterval(async () => {
      pollingAttempts.current++;
      try {
        const newPred = await fetchPrediction(true);
        if (newPred && newPred.id) {
          const days = getDaysSince(newPred.computed_at);
          const isNew = days === 0;
          if (isNew || pollingAttempts.current >= 3) {
            clearInterval(pollingRef.current!);
            pollingRef.current = null;
          }
        }
      } catch {
        // Silently ignore polling errors
      }
      if (pollingAttempts.current >= 3) {
        clearInterval(pollingRef.current!);
        pollingRef.current = null;
      }
    }, 5000);
  }, [fetchPrediction]);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Fire all requests in parallel immediately
      setPredictionLoading(true);
      const predPromise = dashboardService.getMLPredictions();
      const profilePromise = dashboardService.getUserProfile();
      const todayPromise = checkinService.getTodayStatus();
      const menstrualPromise = fetchMenstrualSummary();
      const todaySummaryPromise = fetchTodaySummary();

      // Wait only for critical data (fast Django-local calls)
      const [profileRes, todayRes] = await Promise.allSettled([profilePromise, todayPromise]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data);
      } else {
        const err = profileRes.reason;
        if (err?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
          return;
        }
      }

      if (todayRes.status === 'fulfilled') {
        const td = todayRes.value.data;
        setTodayData({
          morning_status: td.morning_status,
          evening_status: td.evening_status,
          streak_days: td.streak_days ?? 0,
          completeness_pct: td.completeness_pct ?? 0,
          missed_yesterday: td.missed_yesterday ?? [],
          date: td.date,
        });

        if (td.morning_status === 'complete' && td.evening_status === 'complete') {
          startPredictionPolling();
        }
      }

      // Show UI immediately with critical data
      setLoading(false);

      // Collect remaining results as they complete
      const predRes = await Promise.allSettled([predPromise]);
      if (predRes[0].status === 'fulfilled' && predRes[0].value.data) {
        setPrediction(predRes[0].value.data);
      }
      setPredictionLoading(false);

      // menstrualPromise and todaySummaryPromise fire-and-forget (they call setState internally)
    } catch (err: any) {
      setError('Unable to load data');
      setPredictionLoading(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, fetchMenstrualSummary, fetchTodaySummary, startPredictionPolling]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDashboardDataSafe = useCallback(async (isRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      await fetchDashboardData(isRefresh);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err?.message?.includes('canceled')) {
        console.log('[Dashboard] Request was cancelled, ignoring');
        return;
      }
      throw err;
    }
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchDashboardData]);

  useEffect(() => {
    const handleFocus = () => fetchDashboardDataSafe(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchDashboardDataSafe]);

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const getMorningSubtitle = () => {
    if (!todayData) return "Log fatigue & pressure";
    switch (todayData.morning_status) {
      case 'complete': return "Completed today";
      case 'in_progress': return "In progress — tap to continue";
      default: return "Log fatigue & pressure";
    }
  };

  const getEveningSubtitle = () => {
    if (!todayData) return "Log soreness & acne";
    switch (todayData.evening_status) {
      case 'complete': return "Completed today";
      case 'in_progress': return "In progress — tap to continue";
      default: return "Log soreness & acne";
    }
  };

  const getWeeklyToolsSubtitle = () => {
    if (mfgComplete && phq4Complete) return "All tools complete this week ✓";
    const pending = [];
    if (!mfgComplete) pending.push('mFG');
    if (!phq4Complete) pending.push('PHQ-4');
    return `${pending.join(' & ')} due`;
  };

  const isMale = profile?.gender === 'male';
  const isFemale = profile ? profile.gender === 'female' : true;

  const getCycleStatus = (summary: MenstrualSummary): string => {
    const flags = summary.criterion_flags;
    if (!flags) return '';
    if (!flags.criterion_1_positive) return 'No irregularity detected';
    const labels: Record<string, string> = {
      'oligomenorrhea': 'Oligomenorrhea (cycle >35 days)',
      'amenorrhea_risk': 'Amenorrhea Risk (<8 periods/year)',
      'irregular_cycle_pattern': 'Irregular Pattern (CLV >7 days)',
    };
    return flags.criteria
      .filter((c) => c.triggered)
      .map((c) => labels[c.condition] || c.condition)
      .join(', ');
  };

  const periodCardSubtitle = menstrualSummary && menstrualSummary.mean_cycle_len
    ? `Cycle Length ${Math.round(menstrualSummary.mean_cycle_len)} days · CLV ${menstrualSummary.CLV ?? '—'} · ${getCycleStatus(menstrualSummary)}`
    : "Log your cycle";

  const riskScoreTitle = isMale ? "Cardiovascular Risk Score" : "Polyendocrine Metabolic Ovarian Syndrome (PMOS) Score";

  const morningComplete = todayData?.morning_status === 'complete';
  const eveningComplete = todayData?.evening_status === 'complete';
  const bothComplete = morningComplete && eveningComplete;
  const missedYesterday = todayData?.missed_yesterday ?? [];
  const hasMissedYesterday = missedYesterday.length > 0;

  const completenessPct = todayData?.completeness_pct ?? 0;
  const missingCount = Math.round((100 - completenessPct) / 100 * 5);
  const streakDays = todayData?.streak_days ?? 0;

  const quickActions: Array<{
    icon: React.ElementType; title: string; subtitle: string;
    route: string; gradient: string; urgent: boolean; dotColor?: string;
    bgTint?: string; tappable?: boolean; locked?: boolean;
  }> = [];

  // MORNING WINDOW: 5:00 AM – 11:59 AM
  if (currentHour >= 5 && currentHour <= 11) {
    if (morningComplete) {
      quickActions.push({
        icon: Sun, title: "Morning done ✓", subtitle: "See you this evening",
        route: "/checkin/morning", gradient: "gradient-primary",
        urgent: false, dotColor: '#27AE60', bgTint: 'bg-green-50 border-green-200', tappable: false,
      });
    } else {
      quickActions.push({
        icon: Sun, title: "Morning Check-In", subtitle: getMorningSubtitle(),
        route: "/checkin/morning", gradient: "gradient-primary",
        urgent: true, dotColor: todayData?.morning_status === 'in_progress' ? '#F59E0B' : '#F59E0B',
      });
    }
    // Evening preview (locked, greyed out) if morning is complete
    if (morningComplete && !eveningComplete) {
      quickActions.push({
        icon: Moon, title: "Evening Check-In", subtitle: "Available from 12:00 PM",
        route: "/checkin/evening", gradient: "bg-teal-500",
        urgent: false, dotColor: TEAL_PRIMARY,
        bgTint: 'bg-gray-50 border-gray-200 opacity-60', locked: true,
      });
    }
  }
  // AFTERNOON/EVENING WINDOW: 12:00 PM – 11:59 PM
  else if (currentHour >= 12 && currentHour <= 23) {
    if (eveningComplete) {
      quickActions.push({
        icon: Moon, title: "Evening done ✓", subtitle: "Great job today!",
        route: "/checkin/evening", gradient: "bg-teal-500",
        urgent: false, dotColor: '#27AE60', bgTint: 'bg-green-50 border-green-200', tappable: false,
      });
    } else {
      quickActions.push({
        icon: Moon, title: "Evening Check-In", subtitle: getEveningSubtitle(),
        route: "/checkin/evening", gradient: "bg-teal-500",
        urgent: true, dotColor: TEAL_PRIMARY,
      });
    }
    if (!morningComplete) {
      quickActions.push({
        icon: Sun, title: "Morning Check-In", subtitle: getMorningSubtitle(),
        route: "/checkin/morning", gradient: "gradient-primary",
        urgent: true, dotColor: '#F59E0B',
      });
    }
  }
  // LATE NIGHT WINDOW: 12:00 AM – 4:59 AM
  else {
    const eveningNotDone = todayData?.evening_status !== 'complete';
    if (eveningNotDone) {
      quickActions.push({
        icon: Moon, title: "Evening Check-In", subtitle: getEveningSubtitle(),
        route: "/checkin/evening", gradient: "bg-teal-500",
        urgent: true, dotColor: TEAL_PRIMARY,
      });
    } else {
      quickActions.push({
        icon: Sun, title: "Morning Check-In", subtitle: getMorningSubtitle(),
        route: "/checkin/morning", gradient: "gradient-primary",
        urgent: true, dotColor: '#F59E0B',
      });
    }
  }

  if (isFemale) {
    quickActions.push(
      { icon: Calendar, title: "Period Tracking", subtitle: periodCardSubtitle, route: "/period-logging", gradient: "gradient-clinical", urgent: false },
    );
  }

  quickActions.push(
    {
      icon: Timer,
      title: dailyContinuousComplete ? "Daily Continuous check-in done ✓" : "Daily Continuous check-in",
      subtitle: dailyContinuousComplete ? "All hourly tracking complete" : "Hourly tracking & 4-hourly tracking",
      route: "/daily-continuous",
      gradient: "bg-indigo-500",
      urgent: false,
      dotColor: dailyContinuousComplete ? '#27AE60' : '#F59E0B',
      bgTint: dailyContinuousComplete ? 'bg-green-50 border-green-200' : undefined,
    },
    {
      icon: Wrench,
      title: dailyToolsComplete ? "Daily Tools check-in done ✓" : "Daily Tools check-in",
      subtitle: dailyToolsComplete ? "All daily tools complete" : "Mood, sleep, focus and mental wellness",
      route: "/daily-tools",
      gradient: "gradient-clinical",
      urgent: false,
      dotColor: dailyToolsComplete ? '#27AE60' : '#F59E0B',
      bgTint: dailyToolsComplete ? 'bg-green-50 border-green-200' : undefined,
    },
    { icon: ClipboardCheck, title: "Weekly Tools", subtitle: getWeeklyToolsSubtitle(), route: "/weekly-tools", gradient: "gradient-primary", urgent: !mfgComplete || !phq4Complete },
    { icon: Activity, title: "Measure rPPG HRV", subtitle: "rPPG Passive Sensing(Capture Raw rPPG Signals - More 18 physiological metrics)", route: "/rppg-passive", gradient: "bg-emerald-500", urgent: false },
    { icon: Camera, title: "Measure HRV", subtitle: "Capture heart rate variability", route: "/rppg-capture", gradient: "bg-blue-500", urgent: false },
     { icon: BarChart3, title: "Risk Trends", subtitle: "View your history", route: "/risk-trend", gradient: "gradient-clinical", urgent: false }
    
  );

  const riskTier = prediction ? getRiskTier(prediction.risk_score) : null;
  const predictionAge = prediction ? getRelativeTime(prediction.computed_at) : null;
  const hasValidDate = predictionAge !== null;

  const activeRoute = location.pathname;

  const navItems = [
    { icon: Activity, label: "Home", route: "/dashboard" },
    ...(isFemale ? [{ icon: Calendar, label: "Cycle", route: "/cycle-history" }] : []),
    { icon: BarChart3, label: "Results", route: "/risk-score" },
    { icon: MessageCircle, label: "Messages", route: "/messages" },
    { icon: User, label: "Profile", route: "/profile" },
  ].map(item => ({ ...item, active: activeRoute === item.route }));

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-6 py-4"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI-MSHM" className="h-10 w-10" />
            <div>
              <p className="text-sm text-gray-600 font-medium">{greeting}</p>
              <p className="font-display font-bold text-gray-900 text-lg">
                {loading ? (
                  <span className="h-5 w-28 bg-gray-200 rounded animate-pulse inline-block" />
                ) : (
                  profile?.full_name || 'User'
                )}
              </p>
              {profile?.unique_id && (
                <p className="text-sm text-teal-600 font-semibold">{profile.unique_id}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationPanelOpen(true)}
              className="relative h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: TEAL_PRIMARY }}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />
                )}
              </button>
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      Profile Analytics
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      onClick={async () => {
                        setIsProfileDropdownOpen(false);
                        await logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>
      <TrialBanner />
      <div className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full space-y-6">
        {refreshing && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-sm text-gray-500 ml-2">Refreshing...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error} · Tap to retry
          </div>
        )}

        {hasMissedYesterday && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2"
          >
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              You missed your {missedYesterday.join(' & ')} check-in yesterday. Your streak has been reset.
            </p>
          </motion.div>
        )}

        {bothComplete && predictionLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex gap-2"
          >
            <Activity className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-800">
              Your risk score is being updated...
            </p>
          </motion.div>
        )}

        {loading ? (
          <>
            <SkeletonCard />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-14 w-14 bg-gray-100 rounded-full mb-3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="flex gap-1">
                  {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-1.5 flex-1 bg-gray-200 rounded-full" />)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-gray-900 text-lg">{riskScoreTitle}</h2>
                {prediction && hasValidDate && (
                  <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                    Updated {predictionAge}
                  </span>
                )}
              </div>
              {prediction ? (
                <RiskGauge score={prediction.risk_score} />
              ) : predictionLoading ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-48 h-28 flex items-center justify-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    Calculating your score...
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="w-48 h-28 flex items-center justify-center text-gray-400">
                    No score yet
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center font-medium">
                    Complete your check-ins to generate your first score
                  </p>
                </div>
              )}
            </motion.div>

            {/* Downstream Disease Risk Prediction — Unified */}
            {prediction && (prediction.unified_disease_scores || prediction.symptom_intensity_risks || prediction.menstrual_risks || prediction.rppg_risks) && (
              <>
              {(() => { console.log('[Dashboard] prediction keys:', Object.keys(prediction)); console.log('[Dashboard] unified_disease_scores:', prediction.unified_disease_scores); console.log('[Dashboard] risk_score:', prediction.risk_score, 'risk_tier:', prediction.risk_tier); return null; })()}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 p-4"
              >
                <h3 className="font-display font-extrabold text-gray-900 mb-4 text-xl flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-teal-600" />
                  Downstream Diseases Risk Prediction
                </h3>

                {/* Unified per-disease scores — grouped grid */}
                {prediction.unified_disease_scores && Object.keys(prediction.unified_disease_scores).length > 0 && (() => {
                  const wellnessKeys = ['Sleep_Quality', 'Focus_Memory', 'Mental_Wellness', 'Mood_Score'];
                  const v8wellness = prediction.rppg_v8_risks || {};
                  const diseaseGroups: { title: string; keys: string[] }[] = [
                    { title: 'Mental Health', keys: [...wellnessKeys, 'ChronicStress', 'PMDD'] },
                    { title: 'Metabolic Health', keys: ['T2D', 'Metabolic'] },
                    { title: 'Cardiovascular & Neurological', keys: ['CVD', 'Stroke', 'HeartFailure'] },
                    { title: 'Reproductive Health', keys: ['Infertility', 'Endometrial', 'Dysmenorrhea'] },
                  ];
                  const scores = prediction.unified_disease_scores!;
                  return (
                    <div className="mb-5 space-y-6">
                      {diseaseGroups.map(group => {
                        const items = group.keys.filter(k => scores[k] || v8wellness[k]).map(k => ({ key: k, data: scores[k], w: v8wellness[k] }));
                        if (items.length === 0) return null;
                        return (
                          <div key={group.title}>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{group.title}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {items.map(({ key, data, w }) => {
                                if (w) {
                                  const score = w.raw_score ?? (w.risk_score != null ? w.risk_score * 100 : null);
                                  const sev = w.severity || 'Moderate';
                                  return (
                                    <div
                                      key={key}
                                      className="flex items-center gap-2 p-3 rounded-xl border-l-4 shadow-sm"
                                      style={{
                                        backgroundColor: getWellnessBg(sev),
                                        borderLeftColor: getWellnessColor(sev),
                                      }}
                                    >
                                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 shadow-sm shrink-0">
                                        {getDiseaseIcon(key)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-bold text-gray-900 truncate">
                                            {expandAbbreviation(key)}
                                          </span>
                                          <span className="text-[9px] font-semibold text-gray-500 bg-white/70 px-1.5 py-0.5 rounded-full shrink-0 ml-auto">
                                            1 Health Index
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                          <span className="text-sm font-extrabold text-gray-900">
                                            {score != null ? `${score.toFixed(1)}%` : '—'}
                                          </span>
                                          <span
                                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-sm shrink-0"
                                            style={{ backgroundColor: getWellnessColor(sev) }}
                                          >
                                            {sev}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                if (data) {
                                  return (
                                    <div
                                      key={key}
                                      className="flex items-center gap-2 p-3 rounded-xl border-l-4 shadow-sm"
                                      style={{
                                        backgroundColor: getUnifiedSeverityBg(data.severity),
                                        borderLeftColor: getDiseaseBorderColor(data.severity),
                                      }}
                                    >
                                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 shadow-sm shrink-0">
                                        {getDiseaseIcon(key)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-bold text-gray-900 truncate">
                                            {expandAbbreviation(key)}
                                          </span>
                                          <span className="text-[9px] font-semibold text-gray-500 bg-white/70 px-1.5 py-0.5 rounded-full shrink-0">
                                            {data.contributing_models || 1} Health Indices
                                          </span>
                                          <span
                                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-sm shrink-0"
                                            style={{ backgroundColor: getUnifiedSeverityColor(data.severity) }}
                                          >
                                            {data.severity}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                          <div className="flex-1 bg-white/70 rounded-full h-1.5 overflow-hidden shadow-inner">
                                            <div
                                              className="h-full rounded-full transition-all duration-500"
                                              style={{
                                                width: `${Math.min(100, data.unified_score * 100)}%`,
                                                backgroundColor: getUnifiedSeverityColor(data.severity),
                                              }}
                                            />
                                          </div>
                                          <span className="text-xs font-extrabold text-gray-800 w-10 text-right">
                                            {(data.unified_score * 100).toFixed(0)}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Per-model breakdown (collapsible) */}
                {(prediction.symptom_intensity_risks || prediction.menstrual_risks || prediction.rppg_risks) && (
                  <div>
                    <button
                      onClick={() => setShowModelDetail(!showModelDetail)}
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-lg text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                      style={{
                        background: showModelDetail
                          ? 'linear-gradient(135deg, #00897B 0%, #00695C 100%)'
                          : 'linear-gradient(135deg, #00897B 0%, #26A69A 100%)',
                      }}
                    >
                      {showModelDetail ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                      <span className="tracking-wide">
                        {showModelDetail ? 'Hide' : 'Click to check'} Downstream Diseases Breakdown
                      </span>
                      <Info className="w-5 h-5 opacity-70" />
                    </button>

                    {showModelDetail && (
                      <div className="space-y-5 mt-4">
                        {/* 1. Symptom Intensity */}
                        {prediction.symptom_intensity_risks && (
                          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100">
                                <ClipboardCheck className="w-5 h-5 text-teal-600" />
                              </div>
                              <p className="text-base font-bold text-gray-900">Symptom Intensity</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {Object.entries(prediction.symptom_intensity_risks).map(([key, value]) => (
                                <div key={key} className="text-center p-3 bg-teal-50 rounded-xl border border-teal-100">
                                  <div className="font-semibold text-gray-700 text-sm">{expandAbbreviation(key)}</div>
                                  <div className="text-teal-700 font-extrabold text-lg mt-1">{(value * 100).toFixed(0)}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. Menstrual Health */}
                        {prediction.menstrual_risks && (
                          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100">
                                <Stethoscope className="w-5 h-5 text-purple-600" />
                              </div>
                              <p className="text-base font-bold text-gray-900">Menstrual Health</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {Object.entries(prediction.menstrual_risks).map(([key, value]) => (
                                <div key={key} className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                                  <div className="font-semibold text-gray-700 text-sm">{expandAbbreviation(key)}</div>
                                  <div className="text-purple-700 font-extrabold text-lg mt-1">{(value * 100).toFixed(0)}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. rPPG Camera */}
                        {prediction.rppg_risks && (
                          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
                                <Camera className="w-5 h-5 text-blue-600" />
                              </div>
                              <p className="text-base font-bold text-gray-900">rPPG / Heart Rate Variability</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                  <Heart className="w-4 h-4 text-red-500" />
                                  <span className="text-sm font-bold text-gray-800">Cardiovascular Disease</span>
                                </div>
                                <div className="font-extrabold text-lg text-blue-700">
                                  {prediction.rppg_risks.metabolic?.CVD != null
                                    ? `${(prediction.rppg_risks.metabolic.CVD * 100).toFixed(0)}%`
                                    : `${prediction.rppg_status?.metabolic_cardio?.current_span_days ?? 0}/${prediction.rppg_status?.metabolic_cardio?.required_span_days ?? 30} days`}
                                </div>
                              </div>
                              <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                  <Droplets className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-bold text-gray-800">Type 2 Diabetes</span>
                                </div>
                                <div className="font-extrabold text-lg text-blue-700">
                                  {prediction.rppg_risks.metabolic?.T2D != null
                                    ? `${(prediction.rppg_risks.metabolic.T2D * 100).toFixed(0)}%`
                                    : `${prediction.rppg_status?.metabolic_cardio?.current_span_days ?? 0}/${prediction.rppg_status?.metabolic_cardio?.required_span_days ?? 30} days`}
                                </div>
                              </div>
                              <div className="p-4 bg-indigo-50 rounded-xl text-center border border-indigo-100">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                  <Brain className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm font-bold text-gray-800">Stress</span>
                                </div>
                                <div className="font-extrabold text-lg text-indigo-700">
                                  {prediction.rppg_status?.stress_reproductive?.status === 'pending'
                                    ? `${prediction.rppg_status.stress_reproductive.current_span_days ?? 0}/${prediction.rppg_status.stress_reproductive.required_span_days ?? 7}d`
                                    : `${((prediction.rppg_risks.reproductive?.Stress || 0) * 100).toFixed(0)}%`}
                                </div>
                              </div>
                              <div className="p-4 bg-indigo-50 rounded-xl text-center border border-indigo-100">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                  <Target className="w-4 h-4 text-cyan-500" />
                                  <span className="text-sm font-bold text-gray-800">Infertility</span>
                                </div>
                                <div className="font-extrabold text-lg text-indigo-700">
                                  {prediction.rppg_status?.stress_reproductive?.status === 'pending'
                                    ? `${prediction.rppg_status.stress_reproductive.current_span_days ?? 0}/${prediction.rppg_status.stress_reproductive.required_span_days ?? 7}d`
                                    : `${((prediction.rppg_risks.reproductive?.Infertility || 0) * 100).toFixed(0)}%`}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. rPPG V8 Camera */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-100">
                              <Camera className="w-5 h-5 text-sky-600" />
                            </div>
                            <p className="text-base font-bold text-gray-900">rPPG V8 Camera</p>
                            {prediction.rppg_v8_n_sessions != null && (
                              <span className="ml-auto text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                                {prediction.rppg_v8_n_sessions} session{prediction.rppg_v8_n_sessions !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {prediction.rppg_v8_risks && Object.keys(prediction.rppg_v8_risks).filter(k => k !== '_meta').length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(prediction.rppg_v8_risks)
                                .filter(([key]) => key !== '_meta')
                                .map(([key, entry]) => {
                                  const rawScore = entry.raw_score ?? 0;
                                  const severity = entry.severity || '';
                                  const isWellness = ['Sleep_Quality', 'Focus_Memory', 'Mental_Wellness', 'Mood_Score'].includes(key);
                                  const borderColor = isWellness
                                    ? rawScore >= 80 ? 'border-emerald-200' :
                                      rawScore >= 60 ? 'border-blue-200' :
                                      rawScore >= 40 ? 'border-amber-200' : 'border-red-200'
                                    : rawScore >= 60 ? 'border-red-200' :
                                      rawScore >= 40 ? 'border-orange-200' :
                                      rawScore >= 20 ? 'border-amber-200' : 'border-emerald-200';
                                  const bgColor = isWellness
                                    ? rawScore >= 80 ? 'bg-emerald-50' :
                                      rawScore >= 60 ? 'bg-blue-50' :
                                      rawScore >= 40 ? 'bg-amber-50' : 'bg-red-50'
                                    : rawScore >= 60 ? 'bg-red-50' :
                                      rawScore >= 40 ? 'bg-orange-50' :
                                      rawScore >= 20 ? 'bg-amber-50' : 'bg-emerald-50';
                                  const textColor = isWellness
                                    ? rawScore >= 80 ? 'text-emerald-700' :
                                      rawScore >= 60 ? 'text-blue-700' :
                                      rawScore >= 40 ? 'text-amber-700' : 'text-red-700'
                                    : rawScore >= 60 ? 'text-red-700' :
                                      rawScore >= 40 ? 'text-orange-700' :
                                      rawScore >= 20 ? 'text-amber-700' : 'text-emerald-700';
                                  return (
                                    <div key={key} className={`p-3 rounded-xl text-center border ${bgColor} ${borderColor}`}>
                                      <div className="text-sm font-bold text-gray-800">{expandAbbreviation(key)}</div>
                                      <div className={`font-extrabold text-lg mt-1 ${textColor}`}>
                                        {rawScore.toFixed(2)}%
                                      </div>
                                      {severity && <div className="text-xs font-medium text-gray-500 mt-0.5">{severity}</div>}
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <div className="text-center py-4 px-4 bg-sky-50 rounded-xl border border-sky-100">
                              <p className="text-sm font-semibold text-sky-700">No rPPG V8 data yet</p>
                              <p className="text-xs text-sky-600 mt-1">Capture an rPPG V8 session from the Tools page to see your advanced camera-based predictions</p>
                            </div>
                          )}
                        </div>

                        {/* 5. Mood Analysis */}
                        {prediction.rppg_risks?.mood && (
                          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100">
                                <Brain className="w-5 h-5 text-violet-600" />
                              </div>
                              <p className="text-base font-bold text-gray-900">Mood Analysis</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {Object.entries(prediction.rppg_risks.mood).slice(0, 3).map(([key, value]) => (
                                <div key={key} className="text-center p-3 bg-violet-50 rounded-xl border border-violet-100">
                                  <div className="font-semibold text-gray-700 text-sm">{expandAbbreviation(key)}</div>
                                  <div className="text-violet-700 font-extrabold text-lg mt-1">{(value * 100).toFixed(0)}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <CompletenessRing percent={completenessPct} missing={missingCount} />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Data</p>
                  <p className="font-display font-bold text-gray-900 text-lg">Completeness</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {completenessPct >= 100
                      ? 'All data complete ✓'
                      : `${missingCount} missing inputs`}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" style={{ color: TEAL_PRIMARY }} />
                    <p className="text-sm text-teal-700 font-bold">Check-in Streak</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-display text-amber-500">{streakDays}</span>
                    <span className="text-2xl font-bold text-black-900">/30</span>
                    <span className="text-lg text-black-500">days</span>
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-x-1 gap-y-3 mt-3">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                    <div
                      key={d}
                      className="h-2 rounded-full"
                      style={d <= streakDays ? { backgroundColor: TEAL_PRIMARY } : { backgroundColor: '#b4bac6' }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-display font-bold text-gray-900 mb-3 text-lg">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                onClick={() => {
                  if (action.locked) {
                    toast({ title: "Evening check-in opens at 12:00 PM" });
                    return;
                  }
                  navigate(action.route);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border hover:shadow-md transition-all group text-left ${action.bgTint ?? 'bg-white border-gray-200'}`}
              >
                <div className={`h-12 w-12 rounded-xl ${action.gradient} flex items-center justify-center shrink-0`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-gray-900 text-base">{action.title}</p>
                    {'dotColor' in action && (
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: action.dotColor }} />
                    )}
                    {action.urgent && !('dotColor' in action) && (
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{action.subtitle}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-5"
        >
          <h3 className="font-display font-bold text-gray-900 mb-4 text-lg">Today's Summary</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-gray-50">
              <Heart className="h-4 w-4 mx-auto mb-1.5 text-teal-500" />
              <p className="text-xl font-bold font-display text-gray-900">
                {todaySummary?.hrv_rmssd ? `${todaySummary.hrv_rmssd.toFixed(0)}` : '—'}
              </p>
              {todaySummary?.hrv_rmssd ? (
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                  {getHrvLabel(todaySummary.hrv_rmssd)}
                </p>
              ) : <p className="text-[10px] text-gray-400 mt-0.5">—</p>}
              <p className="text-xs text-gray-600 mt-1 font-medium">HRV</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <TrendingUp className="h-4 w-4 mx-auto mb-1.5 text-amber-500" />
              <p className="text-xl font-bold font-display text-gray-900">
                {todaySummary?.fatigue_vas ? `${todaySummary.fatigue_vas.toFixed(1)}` : morningComplete ? '✓' : '—'}
              </p>
              {todaySummary?.fatigue_vas ? (
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                  {fatigueLabel(todaySummary.fatigue_vas)}
                </p>
              ) : <p className="text-[10px] text-gray-400 mt-0.5">—</p>}
              <p className="text-xs text-gray-600 mt-1 font-medium">Fatigue</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <Sun className="h-4 w-4 mx-auto mb-1.5 text-purple-500" />
              <p className="text-xl font-bold font-display text-gray-900">
                {todaySummary?.mood_score ? `${todaySummary.mood_score.toFixed(0)}` : '—'}
              </p>
              {todaySummary?.mood_score ? (
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                  {moodLabel(todaySummary.mood_score)}
                </p>
              ) : <p className="text-[10px] text-gray-400 mt-0.5">—</p>}
              <p className="text-xs text-gray-600 mt-1 font-medium">Mood</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: prediction?.unified_disease_scores?.CVD ? getUnifiedSeverityBg(prediction.unified_disease_scores.CVD.severity) : '#f9fafb' }}>
              <HeartPulse className="h-4 w-4 mx-auto mb-1.5" style={{ color: prediction?.unified_disease_scores?.CVD ? getUnifiedSeverityColor(prediction.unified_disease_scores.CVD.severity) : '#9ca3af' }} />
              <p className="text-xl font-bold font-display text-gray-900">
                {prediction?.unified_disease_scores?.CVD ? `${(prediction.unified_disease_scores.CVD.unified_score * 100).toFixed(0)}` : '—'}
              </p>
              {prediction?.unified_disease_scores?.CVD ? (
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{prediction.unified_disease_scores.CVD.severity}</p>
              ) : <p className="text-[10px] text-gray-400 mt-0.5">—</p>}
              <p className="text-xs text-gray-600 mt-1 font-medium">Cardiovascular</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: prediction?.unified_disease_scores?.Infertility ? getUnifiedSeverityBg(prediction.unified_disease_scores.Infertility.severity) : '#f9fafb' }}>
              <Target className="h-4 w-4 mx-auto mb-1.5" style={{ color: prediction?.unified_disease_scores?.Infertility ? getUnifiedSeverityColor(prediction.unified_disease_scores.Infertility.severity) : '#9ca3af' }} />
              <p className="text-xl font-bold font-display text-gray-900">
                {prediction?.unified_disease_scores?.Infertility ? `${(prediction.unified_disease_scores.Infertility.unified_score * 100).toFixed(0)}` : '—'}
              </p>
              {prediction?.unified_disease_scores?.Infertility ? (
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{prediction.unified_disease_scores.Infertility.severity}</p>
              ) : <p className="text-[10px] text-gray-400 mt-0.5">—</p>}
              <p className="text-xs text-gray-600 mt-1 font-medium">Infertility</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: prediction?.unified_disease_scores?.T2D ? getUnifiedSeverityBg(prediction.unified_disease_scores.T2D.severity) : '#f9fafb' }}>
              <Droplets className="h-4 w-4 mx-auto mb-1.5" style={{ color: prediction?.unified_disease_scores?.T2D ? getUnifiedSeverityColor(prediction.unified_disease_scores.T2D.severity) : '#9ca3af' }} />
              <p className="text-xl font-bold font-display text-gray-900">
                {prediction?.unified_disease_scores?.T2D ? `${(prediction.unified_disease_scores.T2D.unified_score * 100).toFixed(0)}` : '—'}
              </p>
              {prediction?.unified_disease_scores?.T2D ? (
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{prediction.unified_disease_scores.T2D.severity}</p>
              ) : <p className="text-[10px] text-gray-400 mt-0.5">—</p>}
              <p className="text-xs text-gray-600 mt-1 font-medium">Type 2 Diabetes</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: prediction?.unified_disease_scores?.ChronicStress ? getUnifiedSeverityBg(prediction.unified_disease_scores.ChronicStress.severity) : '#f9fafb' }}>
              <Brain className="h-4 w-4 mx-auto mb-1.5" style={{ color: prediction?.unified_disease_scores?.ChronicStress ? getUnifiedSeverityColor(prediction.unified_disease_scores.ChronicStress.severity) : '#9ca3af' }} />
              <p className="text-xl font-bold font-display text-gray-900">
                {prediction?.unified_disease_scores?.ChronicStress ? `${(prediction.unified_disease_scores.ChronicStress.unified_score * 100).toFixed(0)}` : '—'}
              </p>
              {prediction?.unified_disease_scores?.ChronicStress ? (
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{prediction.unified_disease_scores.ChronicStress.severity}</p>
              ) : <p className="text-[10px] text-gray-400 mt-0.5">—</p>}
              <p className="text-xs text-gray-600 mt-1 font-medium">Chronic Stress</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <Frown className="h-4 w-4 mx-auto mb-1.5 text-gray-400" />
              <p className="text-xl font-bold font-display text-gray-900">
                {prediction?.rppg_risks?.mood?.Depression ? `${(prediction.rppg_risks.mood.Depression * 100).toFixed(0)}` : '—'}
              </p>
              {prediction?.rppg_risks?.mood?.Depression ? (
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                  {riskSeverityLabel(prediction.rppg_risks.mood.Depression)}
                </p>
              ) : <p className="text-[10px] text-gray-400 mt-0.5">—</p>}
              <p className="text-xs text-gray-600 mt-1 font-medium">Depression</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {morningComplete ? (
              <span className="flex items-center gap-1.5 text-sm bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-semibold">
                <span className="h-2 w-2 rounded-full bg-green-500" />Morning: Done
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-semibold">
                <span className="h-2 w-2 rounded-full bg-amber-500" />Morning: Pending
              </span>
            )}
            {eveningComplete ? (
              <span className="flex items-center gap-1.5 text-sm bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-semibold">
                <span className="h-2 w-2 rounded-full bg-green-500" />Evening: Done
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-semibold">
                <span className="h-2 w-2 rounded-full bg-amber-500" />Evening: Pending
              </span>
            )}
          </div>

          {!morningComplete && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                Complete your morning check-in to update today's data.
              </p>
            </div>
          )}

          {bothComplete && currentHour >= 17 && !prediction && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-teal-50 border border-teal-200">
              <Activity className="h-5 w-5 text-teal-600 shrink-0" />
              <p className="text-sm text-teal-800 font-medium">
                Complete your evening check-in to unlock today's risk prediction.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <nav className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-3">
        <div className="flex justify-around max-w-6xl mx-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                item.active
                  ? "text-teal-800 bg-teal-100/70"
                  : "text-gray-600 hover:text-teal-800 hover:bg-teal-100"
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-display font-extrabold">{item.label}</span>
              {item.active && <div className="h-0.5 w-4 rounded-full" style={{ backgroundColor: TEAL_PRIMARY }} />}
            </button>
          ))}
        </div>
      </nav>

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </div>
  );
};

export default DashboardScreen;
