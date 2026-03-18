import { useNotifications } from '@/context/NotificationContext';

// Simple debug component to test notification system
export const NotificationDebug = () => {
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

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Notification Debug Info</h3>
      <div className="text-xs space-y-1">
        <p>WebSocket Connected: {wsConnected ? '✅' : '❌'}</p>
        <p>Unread Count: {unreadCount}</p>
        <p>Notifications Loaded: {notifications.length}</p>
        <p>Loading: {isLoading ? '⏳' : '✅'}</p>
      </div>
      <div className="mt-2 space-x-2">
        <button 
          onClick={() => loadNotifications()}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Load Notifications
        </button>
        <button 
          onClick={() => markAllAsRead()}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Mark All Read
        </button>
      </div>
    </div>
  );
};
