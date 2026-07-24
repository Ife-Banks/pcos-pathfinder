import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Bell, Wifi, WifiOff, MessageCircle, AlertTriangle, Activity, Calendar, Moon, Sun, CreditCard } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { AppNotification, NotificationType } from '@/types/notifications';
import { getPriorityColor, formatTimeAgo } from '@/utils/notificationHelpers';
import { Button } from '@/components/ui/button';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: NotificationType | string): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    morning_checkin: <Sun className="h-5 w-5 text-amber-500" />,
    evening_checkin: <Moon className="h-5 w-5 text-indigo-500" />,
    weekly_prompt: <Calendar className="h-5 w-5 text-purple-500" />,
    period_alert: <Activity className="h-5 w-5 text-pink-500" />,
    risk_update: <AlertTriangle className="h-5 w-5 text-red-500" />,
    wearable_sync: <Activity className="h-5 w-5 text-blue-500" />,
    clinician_msg: <MessageCircle className="h-5 w-5 text-teal-500" />,
    system: <Bell className="h-5 w-5 text-gray-500" />,
    subscription_expiring: <CreditCard className="h-5 w-5 text-orange-500" />,
  };
  return icons[type] || <Bell className="h-5 w-5 text-gray-500" />;
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    wsConnected,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const safeNotifications = notifications ?? [];

  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && safeNotifications.length === 0) {
      loadNotifications();
    }
  }, [isOpen, safeNotifications.length, loadNotifications]);

  const handleNotificationTap = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    const action = notification.data?.action;
    switch (action) {
      case 'open_morning_checkin':
        navigate('/checkin/morning');
        break;
      case 'open_evening_checkin':
        navigate('/checkin/evening');
        break;
      case 'open_weekly_tools':
        navigate('/weekly-tools');
        break;
      case 'open_risk_details':
      case 'open_risk_report':
      case 'open_patient_risk_report':
        navigate('/results');
        break;
      case 'open_dashboard':
        navigate('/dashboard');
        break;
      case 'open_devices':
        navigate('/settings/devices');
        break;
      case 'open_change_requests':
        navigate('/settings/change-requests');
        break;
      case 'open_messaging':
      case 'open_chat':
        navigate('/messages');
        break;
      case 'open_profile':
        navigate('/profile');
        break;
      case 'open_checkin':
        navigate('/checkin');
        break;
      case 'open_period_logging':
        navigate('/period-log');
        break;
      case 'open_rppg':
        navigate('/rppg-capture');
        break;
      case 'open_subscription':
        navigate('/settings/subscription');
        break;
      default:
        break;
    }

    onClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className={`fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col ${
              isClosing ? 'pointer-events-none' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-5 w-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium px-2 py-1"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Connection Status */}
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-xs">
                {wsConnected ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-600">Connected - Real-time updates active</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-gray-500">Polling mode - Pull down to refresh</span>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                /* Loading skeleton */
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : safeNotifications.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    You're all caught up!
                  </h3>
                  <p className="text-sm text-gray-500">
                    No notifications at the moment.
                  </p>
                </div>
              ) : (
                /* Notifications list */
                <div className="p-3 space-y-2">
                  {safeNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${
                        !notification.is_read
                          ? 'bg-teal-50 border-l-4 border-l-teal-600'
                          : 'bg-white border border-gray-200'
                      }`}
                      onClick={() => handleNotificationTap(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          !notification.is_read ? 'bg-teal-100' : 'bg-gray-100'
                        }`}>
                          {getNotificationIcon(notification.notification_type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm ${
                                  !notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                }`}>
                                  {notification.title}
                                </h4>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {notification.body}
                              </p>

                              {/* Risk update special handling */}
                              {notification.notification_type === 'risk_update' && notification.data && (
                                <div className="mt-2 bg-white rounded-lg p-2 border border-gray-100">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 uppercase">{notification.data.condition}</span>
                                    {notification.data.delta !== undefined && (
                                      <span className={`font-semibold ${
                                        notification.data.delta > 0 ? 'text-red-500' : 'text-green-500'
                                      }`}>
                                        {notification.data.delta > 0 ? '+' : ''}{notification.data.delta} pts
                                      </span>
                                    )}
                                  </div>
                                  {notification.data.previous_score !== undefined && notification.data.new_score !== undefined && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      Score: {notification.data.previous_score} → {notification.data.new_score}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Time and priority */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-400">
                                  {formatTimeAgo(notification.created_at)}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                                {!notification.is_read && (
                                  <span className="text-[10px] text-teal-600 font-medium">New</span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1">
                              {!notification.is_read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1.5 rounded-full hover:bg-teal-100 text-gray-400 hover:text-teal-600"
                                  title="Mark as read"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {safeNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleMarkAllAsRead}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium py-2"
                  disabled={unreadCount === 0}
                >
                  {unreadCount > 0 ? `Mark all ${unreadCount} as read` : 'All notifications read'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
