import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Settings, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  Bell,
  Save,
  X,
  Download,
  FileText,
  Phone,
  MapPin,
  Mail
} from "lucide-react";
import FMCLayout from '@/components/layout/FMCLayout';
import { fmcAPI } from "@/services/fmcService";

interface FMCProfile {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  role?: string;
  avatar_url?: string;
}

const FMCProfileSettingsScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<FMCProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [notifications, setNotifications] = useState({
    notify_on_severe: true,
    notify_on_very_severe: true,
    email_notifications: true,
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fmcAPI.getFMCProfile();
      const data = response?.data || response;
      setProfile(data);
      setFormData({
        name: data?.name || '',
        address: data?.address || '',
        phone: data?.phone || '',
        email: data?.email || '',
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
      setProfile({ name: 'Federal Medical Centre', address: '123 Health Ave, Abuja', phone: '+2348001234567', email: 'fmc@example.com' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      await fmcAPI.updateFMCProfile(formData);
      setProfile(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await fmcAPI.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <FMCLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C0392B]"></div>
        </div>
      </FMCLayout>
    );
  }

  return (
    <FMCLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Profile & Settings</h1>
            <p className="text-sm text-gray-600 hidden sm:block">Manage your FMC profile and preferences</p>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="sm:hidden">
              <Settings className="h-4 w-4 mr-2" /> Edit
            </Button>
          )}
        </div>

        {/* Alerts */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs for mobile, stacked for desktop */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="flex w-full overflow-x-auto hide-scrollbar">
            <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-[#C0392B]" />
                    Facility Profile
                  </CardTitle>
                  <CardDescription>Basic information about your FMC</CardDescription>
                </div>
                {isEditing ? (
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="hidden sm:flex">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">Facility Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Address</Label>
                      <Textarea
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Phone</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Email</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button onClick={handleUpdateProfile} disabled={saving} className="w-full bg-[#C0392B] hover:bg-[#922B21]">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-[#C0392B] flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{profile?.name || 'Facility Name'}</h3>
                        {user?.unique_id && (
                          <p className="text-sm text-[#C0392B] font-medium">{user.unique_id}</p>
                        )}
                        <Badge className="bg-purple-100 text-purple-800">FMC</Badge>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                        <span className="text-gray-600">{profile?.address || 'No address set'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{profile?.phone || 'No phone set'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{profile?.email || 'No email set'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#C0392B]" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm">Confirm Password</Label>
                  <Input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={saving} className="w-full bg-[#C0392B] hover:bg-[#922B21]">
                  <Lock className="h-4 w-4 mr-2" />
                  {saving ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#C0392B]" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose what alerts you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-sm">Severe Cases</p>
                    <p className="text-xs text-gray-500">Alert for severe risk patients</p>
                  </div>
                  <Switch
                    checked={notifications.notify_on_severe}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, notify_on_severe: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-sm">Very Severe Cases</p>
                    <p className="text-xs text-gray-500">Alert for very severe risk patients</p>
                  </div>
                  <Switch
                    checked={notifications.notify_on_very_severe}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, notify_on_very_severe: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive email updates</p>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email_notifications: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#C0392B]" />
                  Data & Reports
                </CardTitle>
                <CardDescription>Export and manage data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Export</span> Data
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Generate</span> Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FMCLayout>
  );
};

export default FMCProfileSettingsScreen;