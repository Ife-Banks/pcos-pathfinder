import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User, Bell, Shield, Camera, Save, CheckCircle,
  AlertTriangle, Mail, Stethoscope, Lock, Eye, EyeOff,
  Award, Building, Clock
} from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";

interface ProfileData {
  id: string;
  user_email: string;
  user_full_name: string;
  user_is_active: boolean;
  fhc_name: string;
  fhc_code: string;
  specialization: string;
  downstream_expertise: string[];
  onboarded: boolean;
  license_number: string;
  years_of_experience: number;
  bio: string;
  is_verified: boolean;
  profile_photo_url: string | null;
  created_at: string;
}

interface NotifPrefs {
  morning_checkin_enabled: boolean;
  evening_checkin_enabled: boolean;
  weekly_prompts_enabled: boolean;
  risk_score_updates_enabled: boolean;
  wearable_sync_reminders: boolean;
  do_not_disturb: boolean;
}

const ClinicianProfileSettingsScreen = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({ bio: '', license_number: '', years_of_experience: 0 });
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const flash = (msg: string, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(null); setSuccess(null); }, 3000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [pRes, nRes] = await Promise.all([
        clinicianAPI.getProfile(),
        clinicianAPI.getNotificationPreferences(),
      ]);
      const p: ProfileData = pRes.data;
      setProfile(p);
      setFormData({ bio: p.bio || '', license_number: p.license_number || '', years_of_experience: p.years_of_experience || 0 });
      setNotifPrefs(nRes.data);
    } catch {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSaveProfile = async () => {
    try {
      await clinicianAPI.updateProfile(formData);
      await fetchAll();
      setIsEditing(false);
      flash('Profile updated successfully!');
    } catch {
      flash('Failed to update profile.', true);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      flash('New passwords do not match.', true);
      return;
    }
    try {
      await clinicianAPI.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      flash('Password changed successfully!');
    } catch {
      flash('Failed to change password. Check your current password.', true);
    }
  };

  const handleToggleNotif = async (key: keyof NotifPrefs, value: boolean) => {
    try {
      await clinicianAPI.updateNotificationPreferences({ [key]: value });
      setNotifPrefs(prev => prev ? { ...prev, [key]: value } : prev);
    } catch {
      flash('Failed to update notification preferences.', true);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await clinicianAPI.uploadAvatar(file);
      await fetchAll();
      flash('Photo updated!');
    } catch {
      flash('Failed to upload photo.', true);
    }
  };

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error || 'Profile not available'}</AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
            <p className="text-sm text-gray-500">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={profile.profile_photo_url || undefined} />
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                      {initials(profile.user_full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700">
                    <Camera className="h-3.5 w-3.5" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{profile.user_full_name}</h3>
                <p className="text-sm text-gray-500 mb-3">{profile.user_email}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {profile.is_verified && (
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  )}
                  <Badge className="bg-blue-100 text-blue-800 capitalize">
                    {profile.specialization.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600 text-left">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{profile.fhc_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>License: {profile.license_number || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{profile.years_of_experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Professional Information</CardTitle>
                      <Button
                        variant={isEditing ? 'outline' : 'default'}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Read-only fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input value={profile.user_full_name} disabled />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={profile.user_email} disabled />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Specialization</Label>
                        <Input value={profile.specialization.replace(/_/g, ' ')} disabled className="capitalize" />
                      </div>
                      <div>
                        <Label>Hospital</Label>
                        <Input value={profile.fhc_name} disabled />
                      </div>
                    </div>

                    {/* Editable fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>License Number</Label>
                        <Input
                          value={formData.license_number}
                          onChange={e => setFormData(p => ({ ...p, license_number: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Years of Experience</Label>
                        <Input
                          type="number"
                          value={formData.years_of_experience}
                          onChange={e => setFormData(p => ({ ...p, years_of_experience: Number(e.target.value) }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Professional Bio</Label>
                      <Textarea
                        value={formData.bio}
                        onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Brief description of your experience and expertise..."
                      />
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveProfile}>
                          <Save className="h-4 w-4 mr-2" /> Save Changes
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" /> Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Current Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={e => setPasswordData(p => ({ ...p, current_password: e.target.value }))}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={e => setPasswordData(p => ({ ...p, new_password: e.target.value }))}
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={e => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))}
                      />
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleChangePassword}
                      disabled={!passwordData.current_password || !passwordData.new_password}
                    >
                      <Lock className="h-4 w-4 mr-2" /> Change Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" /> Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {notifPrefs && ([
                      { key: 'morning_checkin_enabled' as const, label: 'Morning Check-in Reminders', desc: 'Remind patients to complete morning check-ins' },
                      { key: 'evening_checkin_enabled' as const, label: 'Evening Check-in Reminders', desc: 'Remind patients to complete evening check-ins' },
                      { key: 'weekly_prompts_enabled' as const, label: 'Weekly Prompts', desc: 'Weekly engagement prompts for patients' },
                      { key: 'risk_score_updates_enabled' as const, label: 'Risk Score Updates', desc: 'Alert when patient risk scores change' },
                      { key: 'wearable_sync_reminders' as const, label: 'Wearable Sync Reminders', desc: 'Remind patients to sync their wearable devices' },
                      { key: 'do_not_disturb' as const, label: 'Do Not Disturb', desc: 'Pause all notifications' },
                    ]).map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                        <Switch
                          checked={notifPrefs[key]}
                          onCheckedChange={val => handleToggleNotif(key, val)}
                        />
                      </div>
                    ))}
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

export default ClinicianProfileSettingsScreen;