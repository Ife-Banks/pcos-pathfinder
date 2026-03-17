import { NotificationType, NotificationPriority } from '@/types/notifications';

export const getNotificationIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    morning_checkin:  '🌅',
    evening_checkin:  '🌙',
    weekly_prompt:    '📋',
    period_alert:     '🩸',
    risk_update:      '⚠️',
    wearable_sync:    '⌚',
    system:           '📢',
    clinician_msg:    '👩‍⚕️',
  };
  return icons[type] || '🔔';
};

export const getPriorityColor = (priority: NotificationPriority): string => {
  const colors: Record<NotificationPriority, string> = {
    low:    'bg-gray-400',
    medium: 'bg-blue-500',
    high:   'bg-red-500',
  };
  return colors[priority];
};

export const formatTimeAgo = (isoDate: string): string => {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60)    return 'Just now';
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
