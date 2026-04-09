import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  Users,
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmcAPI } from "@/services/fmcService";

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  patient_id: string;
  patient_name: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  action_required: boolean;
}

const PLACEHOLDER_ALERTS: Alert[] = [];

const FMCAlertsScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pinnedAlerts, setPinnedAlerts] = useState<Alert[]>([]);
  const [regularAlerts, setRegularAlerts] = useState<Alert[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const res = await fmcAPI.getAlerts();
        if (res.data) {
          setPinnedAlerts(res.data.pinned_alerts || []);
          setRegularAlerts(res.data.regular_alerts || []);
        }
      } catch (err) {
        setPinnedAlerts([]);
        setRegularAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "high":
        return <Activity className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "critical_unassigned":
        return "Critical Unassigned";
      case "new_referral":
        return "New Referral";
      case "score_worsened":
        return "Score Worsened";
      case "diagnostics_overdue":
        return "Diagnostics Overdue";
      case "missed_appointment":
        return "Missed Appointment";
      default:
        return type;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredAlerts =
    activeFilter === "all"
      ? regularAlerts
      : regularAlerts.filter((a) => a.alert_type === activeFilter);

  const totalUnread = pinnedAlerts.filter((a) => !a.is_read).length + regularAlerts.filter((a) => !a.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">FMC Alerts</h1>
            <p className="text-sm text-gray-500">
              {totalUnread > 0 ? `${totalUnread} unread alerts` : "All caught up"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading alerts...</p>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {pinnedAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <h2 className="text-sm font-semibold text-red-700">Critical - Requires Action</h2>
              </div>
              {pinnedAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className="border-red-200 bg-red-50 cursor-pointer"
                  onClick={() => navigate(`/fmc/patients/${alert.patient_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            {getAlertTypeLabel(alert.alert_type)}
                          </Badge>
                          <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          Patient: {alert.patient_name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            Assign Now
                          </Button>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          <div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {["all", "new_referral", "score_worsened", "diagnostics_overdue", "missed_appointment"].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      activeFilter === filter
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter === "all"
                      ? "All"
                      : filter === "new_referral"
                      ? "New Referrals"
                      : filter === "score_worsened"
                      ? "Score Changed"
                      : filter === "diagnostics_overdue"
                      ? "Diagnostics"
                      : "Appointments"}
                  </button>
                )
              )}
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No alerts</p>
                <p className="text-sm text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        !alert.is_read ? "border-l-4 border-l-red-500" : ""
                      }`}
                      onClick={() => navigate(`/fmc/patients/${alert.patient_id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Badge
                                className={`text-xs ${
                                  alert.severity === "high"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {getAlertTypeLabel(alert.alert_type)}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {formatTime(alert.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 mt-2">
                              {alert.patient_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{alert.message}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FMCAlertsScreen;