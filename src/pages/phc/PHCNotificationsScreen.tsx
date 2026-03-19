import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity, 
  Heart,
  MessageSquare,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Send,
  Calendar,
  Settings,
  Smartphone,
  Mail,
  Volume2,
  Info
} from "lucide-react";
import { phcAPI } from "@/services/phcService";
import { PHCNotification, PHCNotificationPreferences } from "@/types/phc";

const PHCNotificationsScreen = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<PHCNotification[]>([]);
  const [preferences, setPreferences] = useState<PHCNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<PHCNotification | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isUpdatingPrefs, setIsUpdatingPrefs] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await phcAPI.getNotifications();
      setNotifications(response.data);
      
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await phcAPI.getNotificationPreferences();
      setPreferences(response.data);
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      // Preferences are optional, so don't set error
    }
  };

  const handleMarkAsRead = async (notificationId: string, actionTaken?: string) => {
    try {
      setError(null);
      
      await phcAPI.markNotificationRead(notificationId, actionTaken);
      
      // Update notifications list
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true, action_taken: actionTaken } : n
      ));
      
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(prev => prev ? { ...prev, is_read: true, action_taken: actionTaken } : null);
      }
      
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read. Please try again.');
    }
  };

  const handleUpdatePreferences = async (prefs: Partial<PHCNotificationPreferences>) => {
    try {
      setError(null);
      setIsUpdatingPrefs(true);
      
      await phcAPI.updateNotificationPreferences(prefs);
      
      // Refresh preferences
      await fetchPreferences();
      
      setSuccess('Notification preferences updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences. Please try again.');
    } finally {
      setIsUpdatingPrefs(false);
    }
  };

  const handleSendCustomNotification = async () => {
    // This would be implemented if the API supports sending custom notifications
    setSuccess('Custom notification feature coming soon!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'escalation': return 'bg-red-100 text-red-800';
      case 'new_referral': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-amber-100 text-amber-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'advice_sent': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'escalation': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'new_referral': return <Users className="h-4 w-4 text-blue-600" />;
      case 'follow_up': return <Calendar className="h-4 w-4 text-amber-600" />;
      case 'system': return <Settings className="h-4 w-4 text-gray-600" />;
      case 'advice_sent': return <MessageSquare className="h-4 w-4 text-green-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
    return `${Math.floor(diffInMinutes / 10080)} weeks ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'read' && notification.is_read) ||
      (statusFilter === 'unread' && !notification.is_read);
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.is_read).length;

  const statusOptions = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'escalation', label: 'Escalations' },
    { value: 'new_referral', label: 'New Referrals' },
    { value: 'follow_up', label: 'Follow-ups' },
    { value: 'system', label: 'System' },
    { value: 'advice_sent', label: 'Advice Sent' },
  ];

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E8B57]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/phc/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications & Alerts</h1>
                <p className="text-gray-600">Stay updated with important PHC activities</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount} unread
                </Badge>
              )}
              <Button className="bg-[#2E8B57] hover:bg-[#236F47]">
                <Bell className="h-4 w-4 mr-2" />
                Mark All as Read
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success/Error Alerts */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[#2E8B57]" />
                    Notifications
                  </span>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                      <p>You're all caught up! No new notifications to display.</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          !notification.is_read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedNotification(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.is_read ? 'bg-gray-300' : getPriorityColor(notification.priority)
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {notification.title}
                              </h4>
                              <div className="flex gap-2">
                                <Badge className={getTypeColor(notification.type)}>
                                  {notification.type.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {!notification.is_read && (
                                  <Badge className="bg-blue-500 text-white text-xs">
                                    NEW
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{getTimeSince(notification.created_at)}</span>
                              {notification.patient_name && (
                                <span>Patient: {notification.patient_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Details & Settings */}
          <div className="lg:col-span-1">
            {selectedNotification ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTypeIcon(selectedNotification.type)}
                    Notification Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {selectedNotification.title}
                    </h4>
                    <Badge className={getTypeColor(selectedNotification.type)}>
                      {selectedNotification.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <Badge className={getPriorityColor(selectedNotification.priority)}>
                        {selectedNotification.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        selectedNotification.is_read ? 'text-gray-600' : 'text-blue-600'
                      }`}>
                        {selectedNotification.is_read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {new Date(selectedNotification.created_at).toLocaleString()}
                      </span>
                    </div>
                    {selectedNotification.patient_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Patient:</span>
                        <span className="font-medium">{selectedNotification.patient_name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Message</h5>
                    <p className="text-sm text-gray-600">
                      {selectedNotification.message}
                    </p>
                  </div>
                  
                  {selectedNotification.action_taken && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Action Taken</h5>
                      <p className="text-sm text-gray-600">
                        {selectedNotification.action_taken}
                      </p>
                    </div>
                  )}
                  
                  {!selectedNotification.is_read && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleMarkAsRead(selectedNotification.id)}
                        className="bg-[#2E8B57] hover:bg-[#236F47]"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleMarkAsRead(selectedNotification.id, 'Reviewed')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Mark as Reviewed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Notification</h3>
                    <p className="text-gray-600">Choose a notification from the list to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#2E8B57]" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {preferences ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Referral Alerts</p>
                        <p className="text-sm text-gray-600">Get notified for new patient referrals</p>
                      </div>
                      <Switch
                        checked={preferences.new_referral_alert}
                        onCheckedChange={(checked) => handleUpdatePreferences({ new_referral_alert: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Score Change Alerts</p>
                        <p className="text-sm text-gray-600">Alert when patient risk scores change</p>
                      </div>
                      <Switch
                        checked={preferences.score_change_alert}
                        onCheckedChange={(checked) => handleUpdatePreferences({ score_change_alert: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Overdue Follow-up Reminders</p>
                        <p className="text-sm text-gray-600">Remind about missed follow-ups</p>
                      </div>
                      <Switch
                        checked={preferences.overdue_followup_reminder}
                        onCheckedChange={(checked) => handleUpdatePreferences({ overdue_followup_reminder: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Escalation Notifications</p>
                        <p className="text-sm text-gray-600">Alert when patients are escalated</p>
                      </div>
                      <Switch
                        checked={preferences.escalation_alert}
                        onCheckedChange={(checked) => handleUpdatePreferences({ escalation_alert: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Send email summaries</p>
                      </div>
                      <Switch
                        checked={preferences.email_notifications}
                        onCheckedChange={(checked) => handleUpdatePreferences({ email_notifications: checked })}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">Loading preferences...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Notifications</span>
                    <span className="font-semibold">{notifications.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unread</span>
                    <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">High Priority</span>
                    <Badge className="bg-red-500 text-white">{highPriorityCount}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PHCNotificationsScreen;
