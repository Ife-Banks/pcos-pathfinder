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
  User, 
  Settings, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Bell,
  Smartphone,
  Download,
  Trash2,
  Stethoscope,
  Hospital,
  Users,
  FileText
} from "lucide-react";
import FMCLayout from '@/components/layout/FMCLayout';
import { fmcAPI } from "@/services/phcService";
import { FMCProfile, FMCNotificationPreferences } from "@/types/fmc";

const FMCProfileSettingsScreen = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FMCProfile | null>(null);
  const [preferences, setPreferences] = useState<FMCNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    specialization: '',
    department: '',
    license_number: '',
    years_of_experience: '',
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
      
      const response = await fmcAPI.getFMCProfile();
      setProfile(response.data);
      
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fmcAPI.getFMCNotificationPreferences();
      setPreferences(response.data);
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPreferences();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      await fmcAPI.updateFMCProfile(formData);
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
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      await fmcAPI.changePassword({
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
      setError('Failed to change password. Please try again.');
    }
  };

  const handleUpdatePreferences = async (prefs: Partial<FMCNotificationPreferences>) => {
    try {
      setError(null);
      setSuccess(null);
      
      await fmcAPI.updateFMCNotificationPreferences(prefs);
      await fetchPreferences();
      
      setSuccess('Notification preferences updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences. Please try again.');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setError(null);
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        await fmcAPI.uploadFMAvatar(formData);
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
      case 'fmc_admin': return 'bg-purple-100 text-purple-800';
      case 'fmc_staff': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

   if (loading) {
    return (
      <FMCLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C0392B]"></div>
        </div>
      </FMCLayout>
    );
  }

  if (error && !profile) {
    return (
      <FMCLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>Failed to load profile data. Please try again.</AlertDescription>
          </Alert>
        </div>
      </FMCLayout>
    );
  }
  return (
    
    <FMCLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FMC Profile & Settings</h1>
                <p className="text-gray-600">Manage your Federal Medical Centre profile and preferences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Success/Error Alerts */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#2E8B57]" />
                  Profile Information
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Facility Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter facility name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter full address"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="specialization">Specialization</Label>
                        <Select value={formData.specialization} onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cardiology">Cardiology</SelectItem>
                            <SelectItem value="endocrinology">Endocrinology</SelectItem>
                            <SelectItem value="maternal_fetal">Maternal & Fetal</SelectItem>
                            <SelectItem value="general_surgery">General Surgery</SelectItem>
                            <SelectItem value="emergency_medicine">Emergency Medicine</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cardiology">Cardiology</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="icu">ICU</SelectItem>
                            <SelectItem value="outpatient">Outpatient</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="license_number">License Number</Label>
                        <Input
                          id="license_number"
                          value={formData.license_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                          placeholder="Enter license number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="years_of_experience">Years of Experience</Label>
                        <Input
                          id="years_of_experience"
                          type="number"
                          value={formData.years_of_experience}
                          onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: e.target.value }))}
                          placeholder="Enter years of experience"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-[#2E8B57] hover:bg-[#236F47]" onClick={handleUpdateProfile}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-[#2E8B57] text-white">
                          <Stethoscope className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{profile?.name || 'Facility Name'}</h3>
                        <Badge className={getRoleColor(profile?.role || '')}>
                          {profile?.role?.replace('_', ' ').toUpperCase() || 'STAFF'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{profile?.email || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{profile?.phone || 'Not provided'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{profile?.address || 'Not provided'}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Specialization:</span>
                        <span className="font-medium">{profile?.specialization || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{profile?.department || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">License Number:</span>
                        <span className="font-medium">{profile?.license_number || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Years of Experience:</span>
                        <span className="font-medium">{profile?.years_of_experience || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#2E8B57]" />
                  Security Settings
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
                      placeholder="Enter current password"
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
                      placeholder="Enter new password"
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
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="bg-[#2E8B57] hover:bg-[#236F47]" onClick={handleChangePassword}>
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#2E8B57]" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {preferences ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive email updates for critical cases</p>
                      </div>
                      <Switch
                        checked={preferences.email_notifications}
                        onCheckedChange={(checked) => handleUpdatePreferences({ email_notifications: checked })}
                      />
                    </div>
                  
                  <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS Alerts</p>
                        <p className="text-sm text-gray-600">Get SMS notifications for urgent cases</p>
                      </div>
                      <Switch
                        checked={preferences.sms_alerts}
                        onCheckedChange={(checked) => handleUpdatePreferences({ sms_alerts: checked })}
                      />
                    </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Escalation Notifications</p>
                        <p className="text-sm text-gray-600">Alert when patients are escalated</p>
                      </div>
                      <Switch
                        checked={preferences.escalation_alerts}
                        onCheckedChange={(checked) => handleUpdatePreferences({ escalation_alerts: checked })}
                      />
                    </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Case Updates</p>
                        <p className="text-sm text-gray-600">Updates on patient case status</p>
                      </div>
                      <Switch
                        checked={preferences.case_updates}
                        onCheckedChange={(checked) => handleUpdatePreferences({ case_updates: checked })}
                      />
                    </div>
                </>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E8B57]"></div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#2E8B57]" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Patient Data
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Manage Staff Access
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Generate Reports
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </FMCLayout>
    );
};

export default FMCProfileSettingsScreen;
