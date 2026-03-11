import { useState } from "react";
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
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationSetting {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
}

const NotificationSettingsScreen = () => {
  const navigate = useNavigate();
  
  const [morningTime, setMorningTime] = useState("08:00");
  const [eveningTime, setEveningTime] = useState("20:00");
  
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: "morning", icon: Sun, title: "Morning Check-In Reminder", description: "Daily reminder to complete your morning check-in", enabled: true },
    { id: "evening", icon: Moon, title: "Evening Check-In Reminder", description: "Daily reminder to complete your evening check-in", enabled: true },
    { id: "weekly", icon: Calendar, title: "Weekly Tool Prompts", description: "Reminders for mFG scoring and PHQ-4 assessment", enabled: true },
    { id: "period", icon: Activity, title: "Period Tracking Alerts", description: "Predictions and reminders for cycle tracking", enabled: true },
    { id: "risk", icon: AlertTriangle, title: "Risk Score Updates", description: "Notifications when your risk score changes significantly", enabled: true },
    { id: "sync", icon: Clock, title: "Wearable Sync Reminders", description: "Alerts when wearable data hasn't synced recently", enabled: false },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    );
  };

  const timeOptions = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Notification Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your reminders and alerts</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Check-In Times */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Check-In Reminder Times
          </h3>
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Morning Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--warning))]/10 flex items-center justify-center">
                    <Sun className="h-5 w-5 text-[hsl(var(--warning))]" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">Morning Check-In</p>
                    <p className="text-xs text-muted-foreground">When to remind you</p>
                  </div>
                </div>
                <Select value={morningTime} onValueChange={setMorningTime}>
                  <SelectTrigger className="w-24 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.filter(t => parseInt(t) < 12).map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-border" />

              {/* Evening Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--clinical-blue))]/10 flex items-center justify-center">
                    <Moon className="h-5 w-5 text-[hsl(var(--clinical-blue))]" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">Evening Check-In</p>
                    <p className="text-xs text-muted-foreground">When to remind you</p>
                  </div>
                </div>
                <Select value={eveningTime} onValueChange={setEveningTime}>
                  <SelectTrigger className="w-24 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.filter(t => parseInt(t) >= 12).map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Toggles */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Notification Types
          </h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {notifications.map((notification, i) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center gap-4 p-4"
                >
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <notification.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-foreground text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                  </div>
                  <Switch 
                    checked={notification.enabled} 
                    onCheckedChange={() => toggleNotification(notification.id)}
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quiet Hours */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Quiet Hours
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-display font-semibold text-foreground text-sm">Do Not Disturb</p>
                  <p className="text-xs text-muted-foreground">Pause all notifications</p>
                </div>
                <Switch />
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When enabled, you won't receive any notifications between 10:00 PM and 7:00 AM. 
                  Critical risk alerts will still come through.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.25 }}
          className="bg-[hsl(var(--info))]/5 border border-[hsl(var(--info))]/20 rounded-xl p-4"
        >
          <div className="flex gap-3">
            <Bell className="h-5 w-5 text-[hsl(var(--info))] shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Push notifications require permission from your device. Make sure notifications are enabled 
              in your device settings for AI-MSHM.
            </p>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button variant="clinical" size="lg" className="w-full" onClick={() => navigate(-1)}>
            Save Preferences
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationSettingsScreen;
