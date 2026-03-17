export type NotificationType =
  | 'morning_checkin' | 'evening_checkin' | 'weekly_prompt'
  | 'period_alert'    | 'risk_update'      | 'wearable_sync'
  | 'system'          | 'clinician_msg';

export type NotificationPriority = 'low' | 'medium' | 'high';
export type RiskCondition = 'pcos' | 'maternal' | 'cardiovascular';

export interface NotificationData {
  action?:         string;
  condition?:      RiskCondition;
  new_score?:      number;
  previous_score?: number;
  delta?:          number;
  device_type?:    string;
  device_id?:      string;
  [key: string]:   unknown;
}

export interface AppNotification {
  id:                string;
  notification_type: NotificationType;
  priority:          NotificationPriority;
  title:             string;
  body:              string;
  data:              NotificationData;
  is_read:           boolean;
  read_at:           string | null;
  created_at:        string;
}

// WebSocket messages received FROM server
export type WSMessage =
  | { type: 'unread_count';     count: number }
  | { type: 'new_notification'; notification: AppNotification }
  | { type: 'marked_read';      notification_id: string }
  | { type: 'all_marked_read';  count: number };

// WebSocket actions sent BY client
export type WSClientAction =
  | { action: 'mark_read';     notification_id: string }
  | { action: 'mark_all_read' };
