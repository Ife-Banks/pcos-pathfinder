import React, { createContext, useContext, useState, useEffect,
  useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI } from '@/services/notificationService';
import { AppNotification, WSMessage } from '@/types/notifications';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'wss://ai-mshm-backend.onrender.com/ws/notifications';

interface NotificationContextType {
  notifications:    AppNotification[];
  unreadCount:      number;
  isLoading:        boolean;
  wsConnected:      boolean;
  loadNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead:       (id: string) => Promise<void>;
  markAllAsRead:    () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useAuth();
  const token = accessToken || localStorage.getItem('access_token');

  const [notifications, setNotifications]   = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [isLoading, setIsLoading]           = useState(false);
  const [wsConnected, setWsConnected]       = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ── WebSocket connect ─────────────────────────────────────────
  const connectWebSocket = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // NOTE: WebSocket cannot use Vite proxy — connect directly
      const wsUrl = `${WS_BASE_URL}/?token=${token}`;
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Notifications WebSocket connected');
        setWsConnected(true);
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
      wsRef.current = null;
      console.log('Notifications WS closed, code:', event.code, event.reason);

      switch (event.code) {
        case 4001:
          // Token expired — refresh then reconnect
          // The auth context's token refresh will trigger a re-render
          // which re-runs the useEffect below with the new token
          console.warn('WS closed: token invalid/expired');
          break;
        case 1000:
          // Normal closure (logout) — do NOT reconnect
          break;
        case 1006:
          // Abnormal closure - don't reconnect immediately
          console.warn('WS closed abnormally');
          break;
        default:
          // Network/server error — retry after 3 seconds
          console.log('Will attempt to reconnect in 3 seconds...');
          try {
            reconnectTimerRef.current = setTimeout(connectWebSocket, 3000);
          } catch (err) {
            console.error('Error setting reconnect timer:', err);
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

    // 1. Fetch unread count ONCE via REST on load
    notificationAPI.getUnreadCount(token)
      .then(result => setUnreadCount(result.data.unread_count))
      .catch(err => console.error('Failed to get unread count:', err));

    // 2. Connect WebSocket for real-time push
    connectWebSocket();

    // Cleanup on unmount or token change
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000); // Normal closure
      }
    };
  }, [token, user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      wsConnected,
      loadNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};
