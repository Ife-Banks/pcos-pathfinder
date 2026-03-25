import React, { createContext, useContext, useState, useEffect,
  useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '@/services/apiClient';
import { notificationAPI } from '@/services/notificationService';
import { AppNotification, WSMessage } from '@/types/notifications';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'wss://ai-mshm-backend-d47t.onrender.com/ws/notifications';
const WS_ENABLED = import.meta.env.VITE_WS_ENABLED !== 'false'; // WebSockets enabled by default

// Render wake-up and retry management
const RECONNECT_DELAYS = [3000, 6000, 12000, 24000, 48000]; // 3s, 6s, 12s, 24s, 48s
const MAX_RETRIES = 3; // Reduced from 5 to stop retries faster

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
      const result = await notificationAPI.getNotifications({
        unread_only: unreadOnly,
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
      await notificationAPI.markAsRead(id);
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
      await notificationAPI.markAllAsRead();
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
      await notificationAPI.deleteNotification(id);
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

  const fetchUnreadCountFallback = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('access_token');
      if (!storedToken || storedToken === 'null' || storedToken === 'undefined') return;

      const res = await apiClient.get('/notifications/unread-count/');
      const body = res.data;
      if (body.status === 'success') {
        setUnreadCount(body.data?.unread_count ?? 0);
      }
    } catch {
      // silent fail — notifications are non-critical
    }
  }, []);

  // ── WebSocket connect with retry logic ───────────────────────────────
  const connectWebSocket = useCallback(() => {
    // Always read fresh token from localStorage — avoid stale closure
    const freshToken = localStorage.getItem('access_token');
    if (!freshToken || freshToken === 'undefined' || freshToken === 'null') {
      console.log('No valid token — skipping WebSocket connection');
      setWsConnecting(false);
      setWsError('No authentication token');
      return;
    }
    if (wsRef.current?.readyState === WebSocket.OPEN || retryCount >= MAX_RETRIES) {
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
      const wsUrl = `${WS_BASE_URL}/?token=${freshToken}`;
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
        } catch {
          // Silently ignore malformed messages
        }
      };

      ws.onerror = () => {
        // Silently ignore — 1006/connection errors happen when backend is down
        // Do not console.error or setWsError here
        setWsConnected(false);
      };

      ws.onclose = (event) => {
        setWsConnected(false);
        setWsConnecting(false);
        wsRef.current = null;

        switch (event.code) {
          case 4001:
            // Token expired — refresh then reconnect
            setRetryCount(0);
            break;
          case 1000:
            // Normal closure (logout) — do NOT reconnect
            setRetryCount(0);
            break;
          case 1006:
          default: {
            // Abnormal/network error — retry with exponential backoff, stop after MAX_RETRIES
            if (retryCount < MAX_RETRIES) {
              const delay = Math.min(3000 * Math.pow(2, retryCount), 30000);
              reconnectTimerRef.current = setTimeout(connectWebSocket, delay);
              setRetryCount(prev => prev + 1);
            } else {
              // After max retries: stop silently. Notifications load via REST fallback.
              setRetryCount(0);
            }
            break;
          }
        }
      };

    } catch {
      // Silently ignore connection errors — retry logic handles this
    }
  }, [handleWSMessage]);

  // ── Bootstrap on mount / token change ────────────────────────
  useEffect(() => {
    if (!token || !user) return;
    // Only connect WebSocket for patient users — PHC/FMC portals use their own notification systems
    if (user.role !== 'patient') return;

    // Only connect WebSocket if enabled (disable on platforms without WS support)
    if (WS_ENABLED) {
      // Small delay to ensure backend is ready
      setTimeout(connectWebSocket, 1000);
    } else {
      console.log('WebSocket disabled via VITE_WS_ENABLED');
    }

    // 1. Fetch unread count ONCE via REST on load
    notificationAPI.getUnreadCount()
      .then(result => setUnreadCount(result.data.unread_count))
      .catch(err => {
        console.error('Failed to get unread count:', err);
        fetchUnreadCountFallback();
      });

    // Cleanup on unmount or token change
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000); // Normal closure
      }
    };
  }, [token, user, wakeUpRender, connectWebSocket, fetchUnreadCountFallback]);

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
