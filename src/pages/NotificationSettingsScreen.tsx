import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Sun,
  Moon,
  Calendar,
  Activity,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { settingsService, NotificationPreferences } from "@/services/settingsService";
import { toast } from "@/hooks/use-toast";

const TEAL = '#00897B';

const NotificationSettingsScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);

  const fetchPrefs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsService.getNotificationSettings();
      setPrefs(res.data);
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return;
      }
      toast({ title: 'Error', description: 'Unable to load notification settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      await settingsService.saveNotificationSettings(prefs);
      toast({ title: 'Notification settings saved ✓', description: 'Your preferences have been updated.' });
    } catch {
      toast({ title: 'Failed to save', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-gray-900">Notification Settings</h1>
          <p className="text-xs text-gray-500">Manage your reminders and alerts</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            ))}
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Daily Check-Ins
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Sun className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-gray-900 text-sm">Morning Check-In</p>
                        <p className="text-xs text-gray-500">Daily reminder</p>
                      </div>
                    </div>
                    <Switch
                      checked={prefs?.morning_checkin_enabled ?? true}
                      onCheckedChange={(v) => {
                        if (!prefs) return;
                        setPrefs({ ...prefs, morning_checkin_enabled: v });
                      }}
                    />
                  </div>
                  {prefs?.morning_checkin_enabled && (
                    <div className="pl-13 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatTime(prefs?.morning_time ?? '08:00')}</span>
                      <input
                        type="time"
                        value={prefs?.morning_time ?? '08:00'}
                        onChange={(e) => {
                          if (!prefs) return;
                          setPrefs({ ...prefs, morning_time: e.target.value });
                        }}
                        className="ml-2 text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-700"
                      />
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0F2F1' }}>
                        <Moon className="h-5 w-5" style={{ color: TEAL }} />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-gray-900 text-sm">Evening Check-In</p>
                        <p className="text-xs text-gray-500">Daily reminder</p>
                      </div>
                    </div>
                    <Switch
                      checked={prefs?.evening_checkin_enabled ?? true}
                      onCheckedChange={(v) => {
                        if (!prefs) return;
                        setPrefs({ ...prefs, evening_checkin_enabled: v });
                      }}
                    />
                  </div>
                  {prefs?.evening_checkin_enabled && (
                    <div className="pl-13 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatTime(prefs?.evening_time ?? '20:00')}</span>
                      <input
                        type="time"
                        value={prefs?.evening_time ?? '20:00'}
                        onChange={(e) => {
                          if (!prefs) return;
                          setPrefs({ ...prefs, evening_time: e.target.value });
                        }}
                        className="ml-2 text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-700"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Weekly Tools
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-0 divide-y divide-gray-100">
                  <div className="flex items-center gap-4 p-4">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-gray-900 text-sm">Weekly Tool Reminders</p>
                      <p className="text-xs text-gray-500">mFG and PHQ-4 weekly assessment reminders</p>
                    </div>
                    <Switch
                      checked={prefs?.weekly_prompts_enabled ?? true}
                      onCheckedChange={(v) => {
                        if (!prefs) return;
                        setPrefs({ ...prefs, weekly_prompts_enabled: v });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Health Alerts
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-0 divide-y divide-gray-100">
                  {[
                    { key: 'period_alerts_enabled' as const, icon: Activity, iconBg: 'bg-pink-100', iconColor: 'text-pink-600', title: 'Period Alerts', desc: 'Reminders when your period is approaching' },
                    { key: 'risk_score_updates_enabled' as const, icon: AlertTriangle, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', title: 'Risk Score Updates', desc: 'Notifications when your risk score changes' },
                    { key: 'wearable_sync_reminders' as const, icon: Clock, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', title: 'Wearable Sync Reminders', desc: 'Alert if your device hasn\'t synced in 48 hours' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-4 p-4">
                      <div className={`h-10 w-10 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <Switch
                        checked={prefs ? Boolean(prefs[item.key]) : false}
                        onCheckedChange={(v) => {
                          if (!prefs) return;
                          setPrefs({ ...prefs, [item.key]: v });
                        }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Do Not Disturb
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold text-gray-900 text-sm">Do Not Disturb</p>
                      <p className="text-xs text-gray-500">Pause all notifications temporarily</p>
                    </div>
                    <Switch
                      checked={prefs?.do_not_disturb ?? false}
                      onCheckedChange={(v) => {
                        if (!prefs) return;
                        setPrefs({ ...prefs, do_not_disturb: v });
                      }}
                    />
                  </div>
                  {prefs?.do_not_disturb && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        All notifications are currently paused.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4"
            >
              <div className="flex gap-3">
                <Bell className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Push notifications require permission from your device. Make sure notifications are enabled in your device settings for AI-MSHM.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Button
                size="lg"
                className="w-full rounded-xl text-white"
                style={{ backgroundColor: TEAL }}
                onClick={handleSave}
                disabled={saving}
              >
                Save Notification Settings
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsScreen;
