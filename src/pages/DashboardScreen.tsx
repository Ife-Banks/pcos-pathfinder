import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sun, Moon, Activity, TrendingUp, Calendar, AlertCircle,
  ChevronRight, Bell, User, Heart, BarChart3, ClipboardCheck, Loader2, Check, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
import { NotificationPanel } from "@/components/NotificationPanel";
import { dashboardService, UserProfile, PredictionData } from "@/services/dashboardService";
import { checkinService } from "@/services/checkinService";
import { menstrualService } from "@/services/menstrualService";
import { apiClient } from "@/services/apiClient";
import { isToolCompleteThisWeek, getCurrentWeekKey } from "@/utils/weekUtils";
import logo from "@/assets/logo.png";

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

  const getDaysSince = (dateStr: string) => {
  if (!dateStr || dateStr === "") return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / 86400000);
};

const getCompletenessColor = (pct: number) => {
  if (pct < 40) return "#E74C3C";
  if (pct < 71) return "#F39C12";
  if (pct < 90) return TEAL_PRIMARY;
  return "#27AE60";
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
        <span className="text-3xl font-bold font-display" style={{ color: tier.color }}>
          {safeScore.toFixed(2)}
        </span>
        <p className="text-xs text-gray-500 mt-1">
          Risk Tier: <span className="font-semibold" style={{ color: tier.color }}>{tier.label}</span>
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
}

interface MenstrualSummary {
  mean_cycle_len: number | null;
  CLV: number | null;
  total_cycles_stored: number;
}

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [menstrualSummary, setMenstrualSummary] = useState<MenstrualSummary | null>(null);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttempts = useRef(0);

  const greeting = getGreeting();
  const currentHour = new Date().getHours();
  const currentWeek = getCurrentWeekKey();

  const mfgComplete = isToolCompleteThisWeek('mfg');
  const phq4Complete = isToolCompleteThisWeek('phq4');

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
      });
    } catch {
      // ignore
    }
  }, []);

  const fetchTodaySummary = useCallback(async () => {
    try {
      // Fetch HRV from rPPG sessions (via Django proxy to Node.js)
      let hrv: number | null = null;
      try {
        const hrvRes = await apiClient.get('/rppg/sessions');
        if (hrvRes.data?.data?.sessions?.length > 0) {
          const latestSession = hrvRes.data.data.sessions[0];
          hrv = latestSession.rmssd ?? latestSession.hrv_rmssd ?? null;
        }
      } catch { /* ignore */ }

      // Fetch fatigue from morning check-in
      let fatigue: number | null = null;
      try {
        const todayRes = await checkinService.getTodayStatus();
        if (todayRes.data?.morning_session_id) {
          const morningRes = await apiClient.get(`/checkin/morning/${todayRes.data.morning_session_id}/`);
          if (morningRes.data?.data) {
            fatigue = morningRes.data.data.fatigue_vas ?? null;
          }
        }
      } catch { /* ignore */ }

      // Fetch mood from mood history
      let mood: number | null = null;
      try {
        const moodRes = await apiClient.get('/mood/history');
        const logs = moodRes.data?.data?.logs;
        if (Array.isArray(logs) && logs.length > 0) {
          const latestMood = logs[0];
          // Handle both snake_case and camelCase
          mood = latestMood.phq4Total ?? latestMood.phq4_total ?? null;
        }
      } catch { /* ignore */ }

      setTodaySummary({ hrv_rmssd: hrv, fatigue_vas: fatigue, mood_score: mood });
    } catch {
      // ignore
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
      const [profileRes, todayRes, predRes] = await Promise.allSettled([
        dashboardService.getUserProfile(),
        checkinService.getTodayStatus(),
        dashboardService.getMLPredictions(),
        fetchMenstrualSummary(),
        fetchTodaySummary(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data);
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

      if (predRes.status === 'fulfilled') {
        setPrediction(predRes.value.data);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return;
      }
      setError('Unable to load data');
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

  const isMale = profile?.gender === 'MALE';
  const isFemale = profile?.gender === 'FEMALE';

  const periodCardSubtitle = menstrualSummary && menstrualSummary.mean_cycle_len
    ? `Cycle ${Math.round(menstrualSummary.mean_cycle_len)} days · CLV ${menstrualSummary.CLV ?? '—'}`
    : "Log your cycle";

  const riskScoreTitle = isMale ? "Cardiovascular Risk Score" : "PCOS Risk Score";

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
    { icon: ClipboardCheck, title: "Weekly Tools", subtitle: getWeeklyToolsSubtitle(), route: "/weekly-tools", gradient: "gradient-primary", urgent: !mfgComplete || !phq4Complete },
    { icon: BarChart3, title: "Risk Trends", subtitle: "View your history", route: "/risk-trend", gradient: "gradient-clinical", urgent: false },
    { icon: Camera, title: "Measure HRV", subtitle: "Capture heart rate variability", route: "/rppg-capture", gradient: "bg-blue-500", urgent: false },
  );

  const riskTier = prediction ? getRiskTier(prediction.risk_score) : null;
  const predictionAge = prediction ? getDaysSince(prediction.computed_at) : null;
  const isUpdatedToday = predictionAge === 0;
  const hasValidDate = predictionAge !== null;

  const navItems = [
    { icon: Activity, label: "Home", route: "/dashboard", active: true },
    ...(isFemale ? [{ icon: Calendar, label: "Cycle", route: "/cycle-history", active: false }] : []),
    { icon: BarChart3, label: "Results", route: "/risk-score", active: false },
    { icon: User, label: "Profile", route: "/profile", active: false },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-6 py-4"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI-MSHM" className="h-8 w-8" />
            <div>
              <p className="text-sm text-gray-500">{greeting}</p>
              <p className="font-display font-bold text-gray-900">
                {loading ? (
                  <span className="h-5 w-24 bg-gray-200 rounded animate-pulse inline-block" />
                ) : (
                  profile?.full_name || 'User'
                )}
              </p>
              {profile?.unique_id && (
                <p className="text-xs text-teal-600 font-medium">{profile.unique_id}</p>
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
            <button
              onClick={() => navigate("/profile")}
              className="h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: TEAL_PRIMARY }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 px-6 py-6 max-w-md mx-auto w-full space-y-6">
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
                <h2 className="font-display font-bold text-gray-900">{riskScoreTitle}</h2>
                {prediction && hasValidDate && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {isUpdatedToday ? 'Updated today' : `Updated ${predictionAge} day${predictionAge !== 1 ? 's' : ''} ago`}
                  </span>
                )}
              </div>
              {prediction ? (
                <RiskGauge score={prediction.risk_score} />
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="w-48 h-28 flex items-center justify-center text-gray-400">
                    No score yet
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Complete your check-ins to generate your first score
                  </p>
                </div>
              )}
            </motion.div>

            {/* New ML Predictions Section - All 4 Models */}
            {prediction && (prediction.symptom_intensity_risks || prediction.menstrual_risks || prediction.rppg_risks) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 p-4"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-3">ML Risk Predictions</h3>
                
                <div className="space-y-3">
                  {/* 1. Symptom Intensity */}
                  {prediction.symptom_intensity_risks && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-xs">📝</span>
                        <p className="text-xs text-gray-500 font-medium">Symptom Intensity</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {Object.entries(prediction.symptom_intensity_risks).map(([key, value]) => (
                          <div key={key} className="text-center p-2 bg-teal-50 rounded">
                            <div className="font-semibold text-gray-900 text-[10px]">{key.replace('_', ' ')}</div>
                            <div className="text-teal-700">{(value * 100).toFixed(0)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 2. Menstrual Health */}
                  {prediction.menstrual_risks && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-xs">🩺</span>
                        <p className="text-xs text-gray-500 font-medium">Menstrual Health</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {Object.entries(prediction.menstrual_risks).map(([key, value]) => (
                          <div key={key} className="text-center p-2 bg-purple-50 rounded">
                            <div className="font-semibold text-gray-900 text-[10px]">{key.replace('_', ' ')}</div>
                            <div className="text-purple-700">{(value * 100).toFixed(0)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. rPPG Camera */}
                  {prediction.rppg_risks && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-xs">📷</span>
                        <p className="text-xs text-gray-500 font-medium">rPPG Camera</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-xs font-semibold text-blue-900">Metabolic</p>
                          <div className="flex justify-between text-xs text-blue-700">
                            <span>CVD:</span>
                            <span>{((prediction.rppg_risks.metabolic?.CVD || 0) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between text-xs text-blue-700">
                            <span>T2D:</span>
                            <span>{((prediction.rppg_risks.metabolic?.T2D || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded">
                          <p className="text-xs font-semibold text-indigo-900">Stress</p>
                          <div className="flex justify-between text-xs text-indigo-700">
                            <span>Stress:</span>
                            <span>{((prediction.rppg_risks.reproductive?.Stress || 0) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between text-xs text-indigo-700">
                            <span>Infert:</span>
                            <span>{((prediction.rppg_risks.reproductive?.Infertility || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Mood Analysis */}
                  {prediction.rppg_risks?.mood && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-xs">🧠</span>
                        <p className="text-xs text-gray-500 font-medium">Mood Analysis</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(prediction.rppg_risks.mood).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="text-center p-2 bg-amber-50 rounded">
                            <div className="font-semibold text-gray-900 text-[10px]">{key}</div>
                            <div className="text-amber-700">{(value * 100).toFixed(0)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <CompletenessRing percent={completenessPct} missing={missingCount} />
                <div>
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="font-display font-bold text-gray-900 text-sm">Completeness</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {completenessPct >= 100
                      ? 'All data complete ✓'
                      : `${missingCount} missing inputs`}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4" style={{ color: TEAL_PRIMARY }} />
                  <p className="text-xs text-gray-500">Check-in Streak</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display text-gray-900">{streakDays}</span>
                  <span className="text-sm text-gray-500">days</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <div
                      key={d}
                      className="h-1.5 flex-1 rounded-full"
                      style={d <= streakDays ? { backgroundColor: TEAL_PRIMARY } : { backgroundColor: '#E5E7EB' }}
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
          <h3 className="font-display font-bold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2.5">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                onClick={() => {
                  if (action.locked) {
                    toast("Evening check-in opens at 12:00 PM");
                    return;
                  }
                  navigate(action.route);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border hover:shadow-md transition-all group text-left ${action.bgTint ?? 'bg-white border-gray-200'}`}
              >
                <div className={`h-11 w-11 rounded-xl ${action.gradient} flex items-center justify-center shrink-0`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-gray-900 text-sm">{action.title}</p>
                    {'dotColor' in action && (
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: action.dotColor }} />
                    )}
                    {action.urgent && !('dotColor' in action) && (
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{action.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
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
          <h3 className="font-display font-bold text-gray-900 mb-3">Today's Summary</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-gray-50">
              <Heart className="h-4 w-4 mx-auto mb-1 text-teal-500" />
              <p className="text-lg font-bold font-display text-gray-900">
                {todaySummary?.hrv_rmssd ? `${todaySummary.hrv_rmssd.toFixed(0)}` : '—'}
              </p>
              <p className="text-[10px] text-gray-500">HRV</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold font-display text-gray-900">
                {todaySummary?.fatigue_vas ? `${todaySummary.fatigue_vas.toFixed(1)}` : morningComplete ? '✓' : '—'}
              </p>
              <p className="text-[10px] text-gray-500">Fatigue</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <Sun className="h-4 w-4 mx-auto mb-1 text-purple-500" />
              <p className="text-lg font-bold font-display text-gray-900">
                {todaySummary?.mood_score ? `${todaySummary.mood_score.toFixed(0)}` : '—'}
              </p>
              <p className="text-[10px] text-gray-500">Mood</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {morningComplete ? (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />Morning: Done
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Morning: Pending
              </span>
            )}
            {eveningComplete ? (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />Evening: Done
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Evening: Pending
              </span>
            )}
          </div>

          {!morningComplete && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">
                Complete your morning check-in to update today's data.
              </p>
            </div>
          )}

          {bothComplete && currentHour >= 17 && !prediction && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-teal-50 border border-teal-200">
              <Activity className="h-4 w-4 text-teal-600 shrink-0" />
              <p className="text-xs text-teal-800">
                Complete your evening check-in to unlock today's risk prediction.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <nav className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                item.active ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-display font-semibold">{item.label}</span>
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
