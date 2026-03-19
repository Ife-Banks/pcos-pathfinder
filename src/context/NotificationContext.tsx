import React, { createContext, useContext, useState, useEffect,
  useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI } from '@/services/notificationService';
import { AppNotification, WSMessage } from '@/types/notifications';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'wss://ai-mshm-backend-d47t.onrender.com/ws/notifications';

// Render wake-up and retry management
const RECONNECT_DELAYS = [3000, 6000, 12000, 24000, 48000]; // 3s, 6s, 12s, 24s, 48s
const MAX_RETRIES = 5;

interface NotificationContextType {
  notifications:    AppNotification[];
  unreadCount:      number;
  isLoading:        boolean;
  wsConnected:      boolean;
  wsConnecting:     boolean;
  wsError:          string | null;
  retryCount:        number;
  loadNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead:       (id: string) => Promise<void>;
  markAllAsRead:    () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  wakeUpRender:     () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useAuth();
  const token = accessToken || localStorage.getItem('access_token');

  const [notifications, setNotifications]   = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [isLoading, setIsLoading]           = useState(false);
  const [wsConnected, setWsConnected]       = useState(false);
  const [wsConnecting, setWsConnecting]     = useState(false);
  const [wsError, setWsError]               = useState<string | null>(null);
  const [retryCount, setRetryCount]         = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── REST: load notification history ──────────────────────────
  const loadNotifications = useCallback(async (unreadOnly = false) => {
    if (!token) return;
    try {
      setIsLoading(true);
      const result = await notificationAPI.getNotifications(token, { 
        unread_only: unreadOnly 
      });
      setNotifications(result.results);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // ── REST: mark single as read ─────────────────────────────────
  const markAsRead = useCallback(async (id: string) => {
    if (!token) return;
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await notificationAPI.markAsRead(token, id);
    } catch (err) {
      console.error('Failed to mark as read:', err);
      // Revert optimistic update on failure
      await loadNotifications();
    }
  }, [token, loadNotifications]);

  // ── REST: mark all as read ────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      await notificationAPI.markAllAsRead(token);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      await loadNotifications();
    }
  }, [token, loadNotifications]);

  // ── REST: delete notification ─────────────────────────────────
  const deleteNotification = useCallback(async (id: string) => {
    if (!token) return;
    try {
      // Optimistic update
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      await notificationAPI.deleteNotification(token, id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      await loadNotifications();
    }
  }, [token, notifications, loadNotifications]);

  // ── WebSocket message handler ─────────────────────────────────
  const handleWSMessage = useCallback((msg: WSMessage) => {
    switch (msg.type) {
      case 'unread_count':
        // Initialise badge counter on connect
        setUnreadCount(msg.count);
        break;

      case 'new_notification':
        // Prepend to list, increment badge
        setNotifications(prev => [msg.notification, ...prev]);
        if (!msg.notification.is_read) {
          setUnreadCount(prev => prev + 1);
        }
        break;

      case 'marked_read':
        // Update matching notification in store
        setNotifications(prev =>
          prev.map(n =>
            n.id === msg.notification_id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        break;

      case 'all_marked_read':
        // Set everything to read, reset badge
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        break;
    }
  }, []);

  // ── Wake up Render instance before WebSocket connection ──────────────────────
  const wakeUpRender = useCallback(async () => {
    if (!token) return false;
    return true;
  }, [token]);

  // ── WebSocket connect with retry logic ───────────────────────────────
  const connectWebSocket = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN || retryCount >= MAX_RETRIES) {
      if (retryCount >= MAX_RETRIES) {
        setWsError('Maximum reconnection attempts reached');
        setWsConnecting(false);
        return;
      }
      return;
    }

    setWsConnecting(true);
    setWsError(null);

    try {
      // NOTE: WebSocket cannot use Vite proxy — connect directly
      const wsUrl = `${WS_BASE_URL}/?token=${token}`;
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Notifications WebSocket connected');
        setWsConnected(true);
        setWsConnecting(false);
        setRetryCount(0);
        // Server sends unread_count immediately on connect
      };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        handleWSMessage(msg);
      } catch (err) {
        console.error('WS message parse error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setWsConnected(false);
    };

    ws.onclose = (event) => {
      setWsConnected(false);
      setWsConnecting(false);
      wsRef.current = null;
      console.log('Notifications WS closed, code:', event.code, event.reason);

      switch (event.code) {
        case 4001:
          // Token expired — refresh then reconnect
          console.warn('WS closed: token invalid/expired');
          setRetryCount(0); // Reset retry count on token refresh
          break;
        case 1000:
          // Normal closure (logout) — do NOT reconnect
          console.log('WS closed normally');
          setRetryCount(0);
          break;
        case 1006:
          // Abnormal closure - retry with exponential backoff
          if (retryCount < MAX_RETRIES) {
            const delay = RECONNECT_DELAYS[Math.min(retryCount, RECONNECT_DELAYS.length - 1)];
            console.log(`WS closed abnormally, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            setRetryCount(prev => prev + 1);
            reconnectTimerRef.current = setTimeout(connectWebSocket, delay);
          } else {
            console.error('WS closed: Maximum reconnection attempts reached');
            setWsError('Connection failed after multiple attempts');
          }
          break;
        default:
          // Network/server error — retry with exponential backoff
          if (retryCount < MAX_RETRIES) {
            const delay = RECONNECT_DELAYS[Math.min(retryCount, RECONNECT_DELAYS.length - 1)];
            console.log(`WS error, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            setRetryCount(prev => prev + 1);
            reconnectTimerRef.current = setTimeout(connectWebSocket, delay);
          } else {
            console.error('WS error: Maximum reconnection attempts reached');
            setWsError('Connection failed after multiple attempts');
          }
          break;
      }
    };

    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
    }
  }, [token, handleWSMessage]);

  // ── Bootstrap on mount / token change ────────────────────────
  useEffect(() => {
    if (!token || !user) return;

    // Wake up Render instance before connecting WebSocket
    wakeUpRender().then((success) => {
      if (success) {
        // Small delay to ensure backend is ready
        setTimeout(connectWebSocket, 1000);
      } else {
        setWsError('Failed to wake up backend');
        setWsConnecting(false);
      }
    });

    // 1. Fetch unread count ONCE via REST on load
    notificationAPI.getUnreadCount(token)
      .then(result => setUnreadCount(result.data.unread_count))
      .catch(err => console.error('Failed to get unread count:', err));

    // Cleanup on unmount or token change
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000); // Normal closure
      }
    };
  }, [token, user, wakeUpRender, connectWebSocket]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    wsConnected,
    wsConnecting,
    wsError,
    retryCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    wakeUpRender,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};
