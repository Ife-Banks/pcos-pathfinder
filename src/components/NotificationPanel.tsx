import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Bell, Wifi, WifiOff } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { AppNotification } from '@/types/notifications';
import { getNotificationIcon, getPriorityColor, formatTimeAgo } from '@/utils/notificationHelpers';
import { Button } from '@/components/ui/button';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    
    // Handle navigation based on action
    switch (notification.data.action) {
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
        navigate('/results');
        break;
      case 'open_dashboard':
        navigate('/dashboard');
        break;
      case 'open_devices':
        navigate('/settings/devices');
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
            className={`fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-xl z-50 flex flex-col ${
              isClosing ? 'pointer-events-none' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                    wsConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Connection Status */}
            <div className="px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2 text-xs">
                {wsConnected ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Connected - Real-time updates</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">Disconnected - May have missed updates</span>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                // Loading skeleton
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card rounded-lg p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : safeNotifications.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    You're all caught up!
                  </h3>
                  <p className="text-muted-foreground">
                    No notifications at the moment.
                  </p>
                </div>
              ) : (
                // Notifications list
                <div className="p-4 space-y-3">
                  {safeNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-card rounded-lg p-4 border border-border cursor-pointer transition-all hover:shadow-md ${
                        !notification.is_read ? 'border-l-4 border-l-primary' : ''
                      }`}
                      onClick={() => handleNotificationTap(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className={`font-medium text-foreground ${
                                !notification.is_read ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.body}
                              </p>
                              
                              {/* Risk update special handling */}
                              {notification.notification_type === 'risk_update' && notification.data.delta && (
                                <div className={`text-sm font-semibold mt-2 ${
                                  notification.data.delta > 0 ? 'text-red-500' : 'text-green-500'
                                }`}>
                                  {notification.data.condition?.toUpperCase()} Risk: 
                                  {notification.data.previous_score} → {notification.data.new_score}
                                  ({notification.data.delta > 0 ? '+' : ''}{notification.data.delta} pts)
                                </div>
                              )}
                              
                              {/* Time */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(notification.created_at)}
                                </span>
                                {/* Priority indicator */}
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
