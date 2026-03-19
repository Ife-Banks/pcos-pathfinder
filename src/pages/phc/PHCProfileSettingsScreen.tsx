import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Camera, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Users,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Smartphone,
  Edit,
  Hospital,
  Stethoscope,
  Clock,
  FileText
} from "lucide-react";
import { phcAPI } from "@/services/phcService";
import { PHCProfile, PHCNotificationPreferences } from "@/types/phc";

const PHCProfileSettingsScreen = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PHCProfile | null>(null);
  const [preferences, setPreferences] = useState<PHCNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingPrefs, setIsUpdatingPrefs] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    lga: '',
    state: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profileResponse, prefsResponse] = await Promise.all([
        phcAPI.getPHCProfile(),
        phcAPI.getNotificationPreferences()
      ]);
      
      setProfile(profileResponse.data);
      setPreferences(prefsResponse.data);
      
      // Set form data
      const p = profileResponse.data;
      setFormData({
        name: p.name || '',
        address: p.address || '',
        phone: p.phone || '',
        email: p.email || '',
        lga: p.lga || '',
        state: p.state || '',
      });
      
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      await phcAPI.updatePHCProfile(formData);
      
      // Refetch profile
      await fetchProfile();
      
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      if (passwordData.new_password !== passwordData.confirm_password) {
        setError('New passwords do not match');
        return;
      }
      
      await phcAPI.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError('Failed to change password. Please check your current password.');
    }
  };

  const handleUpdateNotificationPreferences = async (prefs: Partial<PHCNotificationPreferences>) => {
    try {
      setError(null);
      setSuccess(null);
      setIsUpdatingPrefs(true);
      
      await phcAPI.updateNotificationPreferences(prefs);
      
      // Refetch preferences
      const response = await phcAPI.getNotificationPreferences();
      setPreferences(response.data);
      
      setSuccess('Notification preferences updated!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      setError('Failed to update notification preferences.');
    } finally {
      setIsUpdatingPrefs(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setError(null);
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        await phcAPI.uploadAvatar(formData);
        await fetchProfile();
        
        setSuccess('Avatar updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
        
      } catch (error: any) {
        console.error('Error uploading avatar:', error);
        setError('Failed to upload avatar. Please try again.');
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'hcc_admin': return 'bg-purple-100 text-purple-800';
      case 'hcc_staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const states = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E8B57]"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
                <h1 className="text-2xl font-bold text-gray-900">PHC Profile & Settings</h1>
                <p className="text-gray-600">Manage your PHC facility and preferences</p>
              </div>
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
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        <Building className="h-12 w-12 text-[#2E8B57]" />
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-2 right-2 bg-[#2E8B57] text-white rounded-full p-1 cursor-pointer hover:bg-[#236F47]">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900">{profile?.name}</h3>
                  <Badge className={getRoleColor(profile?.role || '')}>
                    {profile?.role?.replace('_', ' ').toUpperCase()}
                  </Badge>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile?.address || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{profile?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{profile?.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Established: {new Date(profile?.established_date || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-[#2E8B57]">{profile?.total_patients || 0}</p>
                        <p className="text-sm text-gray-600">Total Patients</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#2E8B57]">{profile?.staff_count || 0}</p>
                        <p className="text-sm text-gray-600">Staff Members</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Facility Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="staff">Staff Management</TabsTrigger>
              </TabsList>

              {/* Facility Profile Tab */}
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Facility Information</CardTitle>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Facility Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))} disabled={!isEditing}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="lga">LGA</Label>
                      <Input
                        id="lga"
                        value={formData.lga}
                        onChange={(e) => setFormData(prev => ({ ...prev, lga: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Full facility address..."
                      />
                    </div>
                    
                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button className="bg-[#2E8B57] hover:bg-[#236F47]" onClick={handleUpdateProfile}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="current_password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current_password"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="new_password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new_password"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                      />
                    </div>
                    
                    <Button className="bg-[#2E8B57] hover:bg-[#236F47]" onClick={handleChangePassword}>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Two-Factor Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {preferences ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">New Patient Referrals</p>
                            <p className="text-sm text-gray-600">Get notified when new patients are referred</p>
                          </div>
                          <Switch 
                            checked={preferences.new_referral_alert}
                            onCheckedChange={(checked) => handleUpdateNotificationPreferences({ new_referral_alert: checked })}
                            disabled={isUpdatingPrefs}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Risk Score Changes</p>
                            <p className="text-sm text-gray-600">Alert when patient risk scores change significantly</p>
                          </div>
                          <Switch 
                            checked={preferences.score_change_alert}
                            onCheckedChange={(checked) => handleUpdateNotificationPreferences({ score_change_alert: checked })}
                            disabled={isUpdatingPrefs}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Severe Risk Cases</p>
                            <p className="text-sm text-gray-600">Notify when patients reach severe risk levels</p>
                          </div>
                          <Switch 
                            checked={preferences.notify_on_severe}
                            onCheckedChange={(checked) => handleUpdateNotificationPreferences({ notify_on_severe: checked })}
                            disabled={isUpdatingPrefs}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Very Severe Risk Cases</p>
                            <p className="text-sm text-gray-600">Urgent alerts for very severe cases</p>
                          </div>
                          <Switch 
                            checked={preferences.notify_on_very_severe}
                            onCheckedChange={(checked) => handleUpdateNotificationPreferences({ notify_on_very_severe: checked })}
                            disabled={isUpdatingPrefs}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-gray-600">Receive email summaries of notifications</p>
                          </div>
                          <Switch 
                            checked={preferences.email_notifications}
                            onCheckedChange={(checked) => handleUpdateNotificationPreferences({ email_notifications: checked })}
                            disabled={isUpdatingPrefs}
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
              </TabsContent>

              {/* Staff Management Tab */}
              <TabsContent value="staff" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Staff Management
                      </CardTitle>
                      <Button className="bg-[#2E8B57] hover:bg-[#236F47]">
                        <User className="h-4 w-4 mr-2" />
                        Add Staff
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Staff Management</h3>
                      <p className="text-gray-600 mb-4">Manage PHC staff members and permissions</p>
                      <Button className="bg-[#2E8B57] hover:bg-[#236F47]">
                        <Users className="h-4 w-4 mr-2" />
                        View Staff Directory
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PHCProfileSettingsScreen;
