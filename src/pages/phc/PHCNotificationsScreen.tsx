import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  BellOff,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  BellRing,
  Filter,
} from "lucide-react";
import PHCLayout from "@/components/phc/PHCLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { phcAPI } from "@/services/phcService";

type NotificationType = "new_referral" | "score_change" | "overdue_followup" | "missed_checkin";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  data: {
    action: "open_patient" | "open_dashboard";
    queue_record_id: string;
  };
}

const FILTERS: { label: string; value: NotificationType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New Referrals", value: "new_referral" },
  { label: "Score Changes", value: "score_change" },
  { label: "Overdue Follow-Ups", value: "overdue_followup" },
  { label: "Missed Check-Ins", value: "missed_checkin" },
];

const ACCENT_COLOR = "#2E8B57";

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNotificationIcon(type: NotificationType, className = "h-5 w-5") {
  const iconProps = { className, strokeWidth: 2 };
  switch (type) {
    case "new_referral":
      return <Users {...iconProps} />;
    case "score_change":
      return <TrendingUp {...iconProps} />;
    case "overdue_followup":
      return <Clock {...iconProps} />;
    case "missed_checkin":
      return <BellOff {...iconProps} />;
  }
}

function getIconBgColor(type: NotificationType): string {
  switch (type) {
    case "new_referral":
      return "bg-red-100 text-red-600";
    case "score_change":
      return "bg-orange-100 text-orange-600";
    case "overdue_followup":
      return "bg-amber-100 text-amber-600";
    case "missed_checkin":
      return "bg-gray-100 text-gray-500";
  }
}

function getActionButton(type: NotificationType) {
  const baseClass = "text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors";
  switch (type) {
    case "new_referral":
      return (
        <Button variant="ghost" className={`${baseClass} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`} size="sm">
          Review Patient <ArrowRight className="h-3 w-3" />
        </Button>
      );
    case "score_change":
      return (
        <Button variant="ghost" className={`${baseClass} bg-blue-50 text-blue-700 hover:bg-blue-100`} size="sm">
          View Details <ArrowRight className="h-3 w-3" />
        </Button>
      );
    case "overdue_followup":
      return (
        <Button variant="outline" className={`${baseClass} border-amber-300 text-amber-700 hover:bg-amber-50`} size="sm">
          View Patient <ArrowRight className="h-3 w-3" />
        </Button>
      );
    case "missed_checkin":
      return (
        <Button variant="outline" className={`${baseClass} border-gray-300 text-gray-600 hover:bg-gray-50`} size="sm">
          Send Reminder <ArrowRight className="h-3 w-3" />
        </Button>
      );
  }
}

export default function PHCNotificationsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<NotificationType | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  async function fetchNotifications() {
    try {
      const data = await phcAPI.getNotifications();
      const results = Array.isArray(data) ? data : (data?.data?.results || data?.data || []);
      setNotifications(results);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnreadCount() {
    try {
      const data = await phcAPI.getUnreadCount();
      const count = typeof data === 'number' ? data : (data?.unread_count ?? 0);
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.is_read) {
      try {
        await phcAPI.markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // continue anyway
      }
    }
    if (notification.data.queue_record_id) {
      navigate(`/phc/patients/${notification.data.queue_record_id}`);
    }
  }

  async function handleMarkAllRead() {
    try {
      await phcAPI.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silent fail
    }
  }

  const filteredNotifications = notifications
    .filter((n) => activeFilter === "all" || n.type === activeFilter)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <PHCLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BellRing className="h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
              {unreadCount > 0 && (
                <Badge
                  className="h-6 min-w-6 px-1.5 flex items-center justify-center text-xs font-semibold"
                  style={{ backgroundColor: ACCENT_COLOR, color: "white" }}
                >
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter.value
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={activeFilter === filter.value ? { backgroundColor: ACCENT_COLOR } : {}}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {filteredNotifications.length > 0 && unreadCount > 0 && (
            <div className="flex justify-end mb-3">
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline-offset-2 hover:underline"
              >
                Mark All Read
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">You're all caught up!</h3>
              <p className="text-sm text-gray-500">No new alerts at this time.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      !notification.is_read ? "bg-blue-50/50" : "bg-white"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-semibold text-gray-900 truncate ${!notification.is_read ? "font-bold" : ""}`}>
                                  {notification.title}
                                </p>
                                {!notification.is_read && (
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ACCENT_COLOR }} />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notification.body}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notification.created_at)}</p>
                            </div>
                            <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              {getActionButton(notification.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PHCLayout>
  );
}
