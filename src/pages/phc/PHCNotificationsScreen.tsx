import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  BellRing,
  AlertTriangle,
  Heart,
  Trash2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { phcAPI } from "@/services/phcService";

type NotificationType =
  | "new_referral"
  | "score_change"
  | "overdue_followup"
  | "missed_checkin"
  | "risk_update"
  | "system"
  | "morning_checkin"
  | "evening_checkin"
  | "weekly_prompt"
  | "period_alert"
  | "wearable_sync"
  | "clinician_msg";

type Priority = "low" | "medium" | "high" | "urgent";

interface Notification {
  id: string;
  notification_type: NotificationType;
  priority: Priority;
  title: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  data: {
    action?: string;
    patient_id?: string;
    queue_record_id?: string;
    record_id?: string;
    case_id?: string;
    severity?: string;
    score?: number;
    disease?: string;
    condition?: string;
    fmc_name?: string;
    hcc_name?: string;
  };
}

interface PaginationMeta {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
}

const FILTERS: { label: string; value: NotificationType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Risk Alerts", value: "risk_update" },
  { label: "Referrals", value: "new_referral" },
  { label: "Score Changes", value: "score_change" },
  { label: "Follow-ups", value: "overdue_followup" },
  { label: "System", value: "system" },
];

const ACCENT = "#2E8B57";

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getIconConfig(type: NotificationType): { icon: React.ReactNode; bg: string } {
  const cls = "h-5 w-5";
  switch (type) {
    case "new_referral":
      return { icon: <Users className={cls} />, bg: "bg-red-100 text-red-600" };
    case "score_change":
      return { icon: <TrendingUp className={cls} />, bg: "bg-orange-100 text-orange-600" };
    case "overdue_followup":
      return { icon: <Clock className={cls} />, bg: "bg-amber-100 text-amber-600" };
    case "missed_checkin":
      return { icon: <BellOff className={cls} />, bg: "bg-gray-100 text-gray-500" };
    case "risk_update":
      return { icon: <AlertTriangle className={cls} />, bg: "bg-purple-100 text-purple-600" };
    case "period_alert":
      return { icon: <Heart className={cls} />, bg: "bg-pink-100 text-pink-600" };
    case "system":
    default:
      return { icon: <Bell className={cls} />, bg: "bg-blue-100 text-blue-600" };
  }
}

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "low" || priority === "medium") return null;
  const config =
    priority === "urgent"
      ? { label: "Urgent", cls: "bg-red-100 text-red-700 border-red-200" }
      : { label: "High", cls: "bg-orange-100 text-orange-700 border-orange-200" };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${config.cls}`}>
      {config.label}
    </span>
  );
}

function ActionButton({ type }: { type: NotificationType }) {
  const base =
    "text-xs font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap";
  switch (type) {
    case "new_referral":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}>
          Review <ArrowRight className="h-3 w-3" />
        </span>
      );
    case "score_change":
    case "risk_update":
      return (
        <span className={`${base} bg-purple-50 text-purple-700 hover:bg-purple-100`}>
          View <ArrowRight className="h-3 w-3" />
        </span>
      );
    case "overdue_followup":
      return (
        <span className={`${base} border border-amber-300 text-amber-700 hover:bg-amber-50`}>
          View <ArrowRight className="h-3 w-3" />
        </span>
      );
    case "missed_checkin":
      return (
        <span className={`${base} border border-gray-300 text-gray-600 hover:bg-gray-50`}>
          Remind <ArrowRight className="h-3 w-3" />
        </span>
      );
    default:
      return null;
  }
}

export default function PHCNotificationsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<NotificationType | "all">("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      // The paginated response shape: { status, message, data: [...], meta: {...} }
      const res = await phcAPI.getNotifications();
      const items: Notification[] = Array.isArray(res?.data) ? res.data : [];
      const pageMeta: PaginationMeta | null = res?.meta ?? null;

      setNotifications((prev) => {
  if (!append) return items;
  const existingIds = new Set(prev.map((n) => n.id));
  return [...prev, ...items.filter((n) => !existingIds.has(n.id))];
});
      setMeta(pageMeta);
    } catch {
      if (!append) setNotifications([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await phcAPI.getUnreadCount();
      // success_response wraps: { status, message, data: { unread_count: N } }
      const count = res?.data?.unread_count ?? res?.unread_count ?? 0;
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  async function handleNotificationClick(notification: Notification) {
    if (!notification.is_read) {
      try {
        await phcAPI.markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // continue
      }
    }
    const recordId =
      notification.data?.record_id || notification.data?.case_id;
    if (recordId) {
      navigate(`/phc/patients/${recordId}`, { state: { returnTo: '/phc/alerts' } });
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await phcAPI.markNotificationRead(id); // mark read first so count is correct
      // Use the delete endpoint
      await (phcAPI as any).deleteNotification?.(id);
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.is_read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  }

  async function handleMarkAllRead() {
    try {
      await phcAPI.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }

  async function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchNotifications(nextPage, true);
  }

  const filtered = notifications
    .filter((n) => activeFilter === "all" || n.notification_type === activeFilter)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const hasMore = meta ? meta.current_page < meta.total_pages : false;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BellRing className="h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
              {unreadCount > 0 && (
                <Badge
                  className="h-6 min-w-6 px-1.5 flex items-center justify-center text-xs font-semibold"
                  style={{ backgroundColor: ACCENT, color: "white" }}
                >
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { fetchNotifications(1); fetchUnreadCount(); }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
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
                style={activeFilter === filter.value ? { backgroundColor: ACCENT } : {}}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">All caught up</h3>
              <p className="text-sm text-gray-400">No alerts for this filter.</p>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                <div className="space-y-2">
                  {filtered.map((notification, index) => {
                    const { icon, bg } = getIconConfig(notification.notification_type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-sm group ${
                            !notification.is_read
                              ? "bg-emerald-50/40 border-emerald-100"
                              : "bg-white"
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div
                                className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}
                              >
                                {icon}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p
                                        className={`text-sm text-gray-900 truncate ${
                                          !notification.is_read ? "font-bold" : "font-semibold"
                                        }`}
                                      >
                                        {notification.title}
                                      </p>
                                      <PriorityBadge priority={notification.priority} />
                                      {!notification.is_read && (
                                        <span
                                          className="w-2 h-2 rounded-full flex-shrink-0"
                                          style={{ backgroundColor: ACCENT }}
                                        />
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                      {notification.body || "New notification"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatTimestamp(notification.created_at)}
                                    </p>
                                  </div>

                                  {/* Actions */}
                                  <div
                                    className="flex-shrink-0 flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div onClick={() => handleNotificationClick(notification)}>
                                      <ActionButton type={notification.notification_type} />
                                    </div>
                                    <button
                                      onClick={(e) => handleDelete(e, notification.id)}
                                      disabled={deletingId === notification.id}
                                      className="p-1.5 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                      title="Dismiss"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>

              {/* Load more */}
              {hasMore && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="gap-2 text-gray-600"
                  >
                    {loadingMore ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    Load more
                  </Button>
                </div>
              )}

              {/* Count summary */}
              {meta && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Showing {notifications.length} of {meta.count} notifications
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}