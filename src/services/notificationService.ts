const BASE = '/api/v1/notifications';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const notificationAPI = {

  // GET /api/v1/notifications/
  // Returns paginated list, newest first
  // unread_only=true to filter unread only
  getNotifications: async (
    token: string,
    options?: { unread_only?: boolean; page?: number }
  ) => {
    const params = new URLSearchParams();
    if (options?.unread_only) params.set('unread_only', 'true');
    if (options?.page) params.set('page', String(options.page));
    
    const url = `${BASE}/${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, { headers: authHeaders(token) });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { count, next, previous, results: AppNotification[] }
  },

  // GET /api/v1/notifications/unread-count/
  // Fetch ONCE on app load — then use WebSocket to maintain count
  // DO NOT poll this endpoint
  getUnreadCount: async (token: string) => {
    const res = await fetch(`${BASE}/unread-count/`, {
      headers: authHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, data: { unread_count: number } }
  },

  // PATCH /api/v1/notifications/<id>/read/
  // Mark a single notification as read
  markAsRead: async (token: string, notificationId: string) => {
    const res = await fetch(`${BASE}/${notificationId}/read/`, {
      method: 'PATCH',
      headers: authHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, message, data: AppNotification (with is_read: true) }
  },

  // PATCH /api/v1/notifications/mark-all-read/
  // Mark ALL unread notifications as read in one call
  markAllAsRead: async (token: string) => {
    const res = await fetch(`${BASE}/mark-all-read/`, {
      method: 'PATCH',
      headers: authHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
    // Returns: { success, message, data: { marked_count: number } }
    // marked_count can be 0 — still a 200 success
  },

  // DELETE /api/v1/notifications/<id>/
  // Permanently delete — cannot be undone
  deleteNotification: async (token: string, notificationId: string) => {
    const res = await fetch(`${BASE}/${notificationId}/`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    // 204 No Content on success — no JSON body
    if (!res.ok) {
      const data = await res.json();
      throw data;
    }
    return true;
  },
};
