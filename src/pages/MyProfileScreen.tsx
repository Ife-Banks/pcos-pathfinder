import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Ruler,
  Scale,
  Activity,
  Watch,
  Settings,
  ChevronRight,
  Shield,
  Bell,
  Smartphone,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { settingsService, Device, ProfileData } from "@/services/settingsService";
import { dashboardService, UserProfile } from "@/services/dashboardService";
import { checkinService } from "@/services/checkinService";
import { toast } from "@/hooks/use-toast";
import { authAPI } from "@/services/authService";

const TEAL = '#00897B';



const formatRelativeSync = (isoStr: string | null) => {
  if (!isoStr) return "Never";
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
};

const getBmiStatus = (bmi: number | null) => {
  if (bmi === null) return { label: "Unknown", bg: "bg-gray-100", text: "text-gray-500" };
  if (bmi < 18.5) return { label: "Underweight", bg: "bg-amber-100", text: "text-amber-700" };
  if (bmi < 25) return { label: "Normal", bg: "bg-green-100", text: "text-green-700" };
  if (bmi < 30) return { label: "Overweight", bg: "bg-orange-100", text: "text-orange-700" };
  return { label: "Obese", bg: "bg-red-100", text: "text-red-700" };
};

const CompletenessRing = ({ percent }: { percent: number }) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#E5E7EB" strokeWidth="6" />
        <motion.circle
          cx="40" cy="40" r="36"
          fill="none"
          stroke={TEAL}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-display text-gray-900">{percent}%</span>
        <span className="text-[10px] text-gray-500">Complete</span>
      </div>
    </div>
  );
};

const MyProfileScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [todayStatus, setTodayStatus] = useState<{ completeness_pct: number } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, profileDataRes, devicesRes, todayRes] = await Promise.allSettled([
        dashboardService.getUserProfile(),
        settingsService.getProfile(),
        settingsService.getDevices(),
        checkinService.getTodayStatus(),
      ]);

      if (profileRes.status === 'fulfilled') setUserProfile(profileRes.value.data);
      if (profileDataRes.status === 'fulfilled') setProfileData(profileDataRes.value.data);
      if (devicesRes.status === 'fulfilled') setDevices(devicesRes.value.data);
      if (todayRes.status === 'fulfilled') setTodayStatus(todayRes.value.data);
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return;
      }
      toast({ title: 'Error', description: 'Unable to load profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const refresh = localStorage.getItem('refresh_token');
      const access = localStorage.getItem('access_token');
      if (refresh && access) {
        await authAPI.logout(refresh, access);
      }
    } catch { /* ignore */ }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('latest_prediction_id');
    localStorage.removeItem('latest_risk_tier');
    localStorage.removeItem('latest_risk_score');
    localStorage.removeItem('latest_prediction_id');
    localStorage.removeItem('mshm_mfg_completed_week');
    localStorage.removeItem('mshm_phq4_completed_week');
    localStorage.removeItem('mshm_affect_completed_week');
    localStorage.removeItem('mshm_focus_completed_week');
    localStorage.removeItem('mshm_sleep_completed_week');
    navigate('/login');
    setSigningOut(false);
  };

  const initials = userProfile?.full_name?.charAt(0)?.toUpperCase() ?? 'U';
  const memberSince = userProfile?.date_joined
    ? new Date(userProfile.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const computedBmi = profileData?.height_cm && profileData?.weight_kg && profileData?.height_cm > 0
    ? parseFloat((profileData.weight_kg / Math.pow(profileData.height_cm / 100, 2)).toFixed(1))
    : profileData?.bmi ?? null;
  const bmiStatus = getBmiStatus(computedBmi);

  const profileCompleteness = profileData?.onboarding_completed ? 100 : Math.round((profileData?.onboarding_step ?? 0) / 7 * 100);
  const hasConnectedDevice = devices.some(d => d.is_active);
  const hasRecentSync = devices.some(d => {
    if (!d.last_synced_at) return false;
    return Date.now() - new Date(d.last_synced_at).getTime() < 86400000;
  });
  const wearableCompleteness = hasConnectedDevice ? (hasRecentSync ? 100 : 50) : 0;
  const checkinCompleteness = todayStatus ? 100 : 0;
  const clinicalCompleteness = profileData?.clinical_data_pct ?? 50;
  const overall = Math.round((profileCompleteness + clinicalCompleteness + wearableCompleteness + checkinCompleteness) / 4);

  const quickLinks = [
    { icon: Bell, label: "Notification Settings", route: "/settings/notifications" },
    { icon: Shield, label: "Data & Privacy", route: "/settings/privacy" },
    { icon: Smartphone, label: "Connected Devices", route: "/settings/devices" },
  ];

  const categories = [
    { label: "Profile Info", percent: profileCompleteness, color: "bg-green-500" },
    { label: "Clinical Data", percent: clinicalCompleteness, color: "bg-blue-500" },
    { label: "Wearable Sync", percent: wearableCompleteness, color: "bg-blue-400" },
    { label: "Check-ins", percent: checkinCompleteness, color: "bg-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="font-display text-lg font-bold text-gray-900 flex-1">My Profile</h1>
        <button onClick={() => navigate("/settings/notifications")} className="p-1.5 rounded-lg hover:bg-gray-100">
          <Settings className="w-5 h-5" style={{ color: TEAL }} />
        </button>
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
              </div>
            </div>
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border border-gray-200">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2" style={{ borderColor: TEAL }}>
                      <AvatarImage src={userProfile?.avatar_url ?? undefined} alt={userProfile?.full_name} />
                      <AvatarFallback className="text-white text-xl font-bold font-display" style={{ backgroundColor: TEAL }}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="font-display font-bold text-gray-900 text-lg">{userProfile?.full_name ?? 'User'}</h2>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {userProfile?.email ?? ''}
                      </p>
                      {memberSince && (
                        <p className="text-xs text-gray-500 mt-1">Member since {memberSince}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Demographics
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Calendar, label: "Age", value: profileData?.age ? `${profileData.age} years` : "Not set" },
                      { icon: User, label: "Ethnicity", value: profileData?.ethnicity ?? "Not set" },
                      { icon: Ruler, label: "Height", value: profileData?.height_cm ? `${profileData.height_cm} cm` : "Not set" },
                      { icon: Scale, label: "Weight", value: profileData?.weight_kg ? `${profileData.weight_kg} kg` : "Not set" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                          <item.icon className="h-4 w-4" style={{ color: TEAL }} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{item.label}</p>
                          <p className="font-display font-semibold text-sm text-gray-900">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" style={{ color: TEAL }} />
                      <span className="text-sm text-gray-500">BMI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-gray-900">{computedBmi ?? '—'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${bmiStatus.bg} ${bmiStatus.text}`}>
                        {bmiStatus.label}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Wearable Connections
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  {devices.length > 0 ? (
                    <>
                      {devices.map((device) => (
                        <div key={device.id} className="flex items-center gap-3 mb-3 last:mb-0">
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${TEAL}, #00695C)` }}>
                            <Watch className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-display font-semibold text-gray-900 text-sm">{device.display_name}</p>
                            <p className="text-xs text-gray-500">Last synced {formatRelativeSync(device.last_synced_at)}</p>
                          </div>
                          {device.is_active && <span className="h-2 w-2 rounded-full bg-green-500" />}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full mt-3 rounded-lg border-gray-300"
                        onClick={() => navigate("/settings/devices")}
                      >
                        Manage Devices
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 text-center py-2">No devices connected</p>
                      <Button
                        className="w-full mt-2 rounded-lg text-white"
                        style={{ backgroundColor: TEAL }}
                        onClick={() => navigate("/settings/devices")}
                      >
                        Connect a Device
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Data Completeness Overview
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-6">
                    <CompletenessRing percent={overall} />
                    <div className="flex-1 space-y-2.5">
                      {categories.map((cat, i) => (
                        <div key={cat.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">{cat.label}</span>
                            <span className="text-xs font-semibold text-gray-900">{cat.percent}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${cat.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.percent}%` }}
                              transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Settings
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-0 divide-y divide-gray-100">
                  {quickLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => navigate(link.route)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <link.icon className="h-5 w-5 text-gray-400" />
                      <span className="flex-1 font-display font-medium text-gray-900 text-sm">{link.label}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Sign Out
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyProfileScreen;
