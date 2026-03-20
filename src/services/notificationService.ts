import apiClient from '@/services/apiClient';

const BASE = '/notifications';

const ensureSuccess = (body: any) => {
  if (body.status !== 'success') throw body;
  return body;
};

export const notificationAPI = {
  // GET /api/v1/notifications/
  // Returns paginated list, newest first
  // unread_only=true to filter unread only
  getNotifications: async (options?: { unread_only?: boolean; page?: number }) => {
    const params: Record<string, string> = {};
    if (options?.unread_only) params.unread_only = 'true';
    if (options?.page) params.page = String(options.page);

    const res = await apiClient.get(`${BASE}/`, { params });
    const body = res.data;
    ensureSuccess(body);
    return body;
    // Returns: { count, next, previous, results: AppNotification[] }
  },

  // GET /api/v1/notifications/unread-count/
  // Fetch ONCE on app load — then use WebSocket to maintain count
  // DO NOT poll this endpoint
  getUnreadCount: async () => {
    const res = await apiClient.get(`${BASE}/unread-count/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
    // Returns: { success, data: { unread_count: number } }
  },

  // PATCH /api/v1/notifications/<id>/read/
  // Mark a single notification as read
  markAsRead: async (notificationId: string) => {
    const res = await apiClient.patch(`${BASE}/${notificationId}/read/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
    // Returns: { success, message, data: AppNotification (with is_read: true) }
  },

  // PATCH /api/v1/notifications/mark-all-read/
  // Mark ALL unread notifications as read in one call
  markAllAsRead: async () => {
    const res = await apiClient.patch(`${BASE}/mark-all-read/`);
    const body = res.data;
    ensureSuccess(body);
    return body;
    // Returns: { success, message, data: { marked_count: number } }
    // marked_count can be 0 — still a 200 success
  },

  // DELETE /api/v1/notifications/<id>/
  // Permanently delete — cannot be undone
  deleteNotification: async (notificationId: string) => {
    await apiClient.delete(`${BASE}/${notificationId}/`);
    // 204 No Content on success — no JSON body
    return true;
  },
};
