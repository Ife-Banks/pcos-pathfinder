import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sun, Moon, Activity, TrendingUp, Calendar, AlertCircle,
  ChevronRight, Bell, User, Heart, BarChart3, ClipboardCheck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
import { NotificationPanel } from "@/components/NotificationPanel";
import { dashboardService, UserProfile, PredictionData } from "@/services/dashboardService";
import { checkinService } from "@/services/checkinService";
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
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
};

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const getDaysSince = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / 86400000);
};

const RiskGauge = ({ score }: { score: number }) => {
  const tier = getRiskTier(score);
  const angle = score * 180;

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
            x1="100"
            y1="100"
            x2="100"
            y2="30"
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
          {score.toFixed(2)}
        </span>
        <p className="text-xs text-gray-500 mt-1">
          Risk Tier: <span className="font-semibold" style={{ color: tier.color }}>{tier.label}</span>
        </p>
      </motion.div>
    </div>
  );
};

const CompletenessRing = ({ percent }: { percent: number }) => {
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <motion.circle
          cx="24" cy="24" r="20"
          fill="none"
          stroke={TEAL_PRIMARY}
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

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayStatus, setTodayStatus] = useState<{
    morning_status: 'pending' | 'in_progress' | 'complete';
    evening_status: 'pending' | 'in_progress' | 'complete';
    streak_days: number;
    completeness_pct: number;
  } | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const greeting = getGreeting();
  const currentHour = new Date().getHours();
  const isMorningTime = currentHour >= 5 && currentHour < 14;
  const currentWeek = getCurrentWeekKey();

  const mfgComplete = isToolCompleteThisWeek('mfg');
  const phq4Complete = isToolCompleteThisWeek('phq4');

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [profileRes, todayRes, predRes] = await Promise.allSettled([
        dashboardService.getUserProfile(),
        checkinService.getTodayStatus(),
        dashboardService.getLatestPrediction(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data);
      }

      if (todayRes.status === 'fulfilled') {
        setTodayStatus(todayRes.value.data);
      }

      if (predRes.status === 'fulfilled') {
        setPrediction(predRes.value.data);
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
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
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const handleFocus = () => fetchDashboardData(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchDashboardData]);

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getMorningSubtitle = () => {
    if (!todayStatus) return "Log fatigue & pressure";
    switch (todayStatus.morning_status) {
      case 'complete': return "Completed today";
      case 'in_progress': return "In progress — tap to continue";
      default: return "Log fatigue & pressure";
    }
  };

  const getEveningSubtitle = () => {
    if (!todayStatus) return "Log soreness & acne";
    switch (todayStatus.evening_status) {
      case 'complete': return "Completed today";
      case 'in_progress': return "In progress — tap to continue";
      default: return "Log soreness & acne";
    }
  };

  const getWeeklyToolsSubtitle = () => {
    if (mfgComplete && phq4Complete) return "All tools completed this week";
    const pending = [];
    if (!mfgComplete) pending.push('mFG');
    if (!phq4Complete) pending.push('PHQ-4');
    return `${pending.join(' & ')} due`;
  };

  const showEveningCard = todayStatus?.morning_status === 'complete' || currentHour >= 12;

  const quickActions: Array<{
    icon: React.ElementType;
    title: string;
    subtitle: string;
    route: string;
    gradient: string;
    urgent: boolean;
    dotColor?: string;
  }> = [];

  if (currentHour >= 5 && currentHour < 12) {
    quickActions.push({
      icon: Sun,
      title: "Morning Check-In",
      subtitle: getMorningSubtitle(),
      route: "/checkin/morning",
      gradient: "gradient-primary",
      urgent: todayStatus?.morning_status !== 'complete',
      dotColor: todayStatus?.morning_status === 'complete' ? '#27AE60' : '#F59E0B',
    });
    if (todayStatus?.morning_status === 'complete') {
      quickActions.push({
        icon: Moon,
        title: "Evening Check-In",
        subtitle: getEveningSubtitle(),
        route: "/checkin/evening",
        gradient: "bg-teal-500",
        urgent: todayStatus?.evening_status !== 'complete',
        dotColor: todayStatus?.evening_status === 'complete' ? '#27AE60' : TEAL_PRIMARY,
      });
    }
  } else if (currentHour >= 12 && currentHour < 24) {
    quickActions.push({
      icon: Moon,
      title: "Evening Check-In",
      subtitle: getEveningSubtitle(),
      route: "/checkin/evening",
      gradient: "bg-teal-500",
      urgent: todayStatus?.evening_status !== 'complete',
      dotColor: todayStatus?.evening_status === 'complete' ? '#27AE60' : TEAL_PRIMARY,
    });
    if (todayStatus?.morning_status !== 'complete') {
      quickActions.push({
        icon: Sun,
        title: "Morning Check-In",
        subtitle: getMorningSubtitle(),
        route: "/checkin/morning",
        gradient: "gradient-primary",
        urgent: true,
        dotColor: '#F59E0B',
      });
    }
  } else {
    if (todayStatus?.evening_status !== 'complete') {
      quickActions.push({
        icon: Moon,
        title: "Evening Check-In",
        subtitle: getEveningSubtitle(),
        route: "/checkin/evening",
        gradient: "bg-teal-500",
        urgent: true,
        dotColor: TEAL_PRIMARY,
      });
    }
    if (todayStatus?.morning_status !== 'complete') {
      quickActions.push({
        icon: Sun,
        title: "Morning Check-In",
        subtitle: getMorningSubtitle(),
        route: "/checkin/morning",
        gradient: "gradient-primary",
        urgent: true,
        dotColor: '#F59E0B',
      });
    }
    if (todayStatus?.morning_status === 'complete' && todayStatus?.evening_status === 'complete') {
      quickActions.push({
        icon: Sun,
        title: "Both Check-ins",
        subtitle: "Completed today ✓",
        route: "/dashboard",
        gradient: "gradient-primary",
        urgent: false,
        dotColor: '#27AE60',
      });
    }
  }

  quickActions.push(
    {
      icon: Calendar,
      title: "Period Tracking",
      subtitle: "Log your cycle",
      route: "/period-logging",
      gradient: "gradient-clinical",
      urgent: false,
    },
    {
      icon: ClipboardCheck,
      title: "Weekly Tools",
      subtitle: getWeeklyToolsSubtitle(),
      route: "/weekly-tools",
      gradient: "gradient-primary",
      urgent: !mfgComplete || !phq4Complete,
    },
    {
      icon: BarChart3,
      title: "Risk Trends",
      subtitle: "View your history",
      route: "/risk-trend",
      gradient: "gradient-clinical",
      urgent: false,
    }
  );

  const riskTier = prediction ? getRiskTier(prediction.risk_score) : null;
  const predictionAge = prediction ? getDaysSince(prediction.computed_at) : null;
  const isUpdatedToday = predictionAge === 0;

  const morningComplete = todayStatus?.morning_status === 'complete';

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
            {error} · Pull to refresh
          </div>
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
                  {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} className="h-1.5 flex-1 bg-gray-200 rounded-full" />
                  ))}
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
                <h2 className="font-display font-bold text-gray-900">PCOS Risk Score</h2>
                {prediction && (
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <CompletenessRing percent={prediction?.data_completeness_pct || 0} />
                <div>
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="font-display font-bold text-gray-900 text-sm">Completeness</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {prediction?.missing_inputs_count === 0 
                      ? 'All data complete' 
                      : `${prediction?.missing_inputs_count || 0} missing inputs`}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4" style={{ color: TEAL_PRIMARY }} />
                  <p className="text-xs text-gray-500">Check-in Streak</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display text-gray-900">
                    {todayStatus?.streak_days || 0}
                  </span>
                  <span className="text-sm text-gray-500">days</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <div
                      key={d}
                      className={`h-1.5 flex-1 rounded-full ${d <= (todayStatus?.streak_days || 0) ? '' : 'bg-gray-200'}`}
                      style={d <= (todayStatus?.streak_days || 0) ? { backgroundColor: TEAL_PRIMARY } : {}}
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
                onClick={() => navigate(action.route)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all group text-left"
              >
                <div className={`h-11 w-11 rounded-xl ${action.gradient} flex items-center justify-center shrink-0`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-gray-900 text-sm">{action.title}</p>
                    {'dotColor' in action && (
                      <span 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: action.dotColor }}
                      />
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
              <Heart className="h-4 w-4 mx-auto mb-1 text-gray-400" />
              <p className="text-lg font-bold font-display text-gray-900">—</p>
              <p className="text-[10px] text-gray-500">HRV</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-gray-400" />
              <p className="text-lg font-bold font-display text-gray-900">
                {morningComplete ? '—' : '—'}
              </p>
              <p className="text-[10px] text-gray-500">Fatigue</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <Sun className="h-4 w-4 mx-auto mb-1 text-gray-400" />
              <p className="text-lg font-bold font-display text-gray-900">—</p>
              <p className="text-[10px] text-gray-500">Mood</p>
            </div>
          </div>
          {!morningComplete && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">
                Complete your morning check-in to update today's data.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <nav className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          {[
            { icon: Activity, label: "Home", route: "/dashboard", active: true },
            { icon: Calendar, label: "Cycle", route: "/cycle-history", active: false },
            { icon: BarChart3, label: "Results", route: "/risk-score", active: false },
            { icon: User, label: "Profile", route: "/profile", active: false },
          ].map((item) => (
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
