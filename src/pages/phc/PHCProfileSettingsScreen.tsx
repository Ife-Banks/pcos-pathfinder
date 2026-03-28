import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, User, Users, Bell, ShieldCheck, Lock, Eye, EyeOff,
  Plus, Edit, Trash2, Copy, Check, LogOut, HelpCircle, ExternalLink,
  Mail, Phone, Building, MapPin, Clock, AlertTriangle, CheckCircle,
  UserPlus, X
} from 'lucide-react';
import  PHCLayout  from '@/components/phc/PHCLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient';

interface PHCProfile {
  id: string;
  name: string;
  code: string;
  state: string;
  lga: string;
  phone: string;
  email: string;
  address: string;
  escalation_fmc_name?: string;
}

interface StaffMember {
  id: string;
  user_email: string;
  user_full_name: string;
  hcc_name: string;
  hcc_code: string;
  staff_role: string;
  employee_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationSettings {
  new_referral: boolean;
  score_change: boolean;
  overdue_followup: boolean;
  missed_checkin: boolean;
}

const ensureResponseSuccess = (body: any) => {
  if (body?.status && body.status !== 'success') {
    throw body;
  }
  return body;
};

export default function PHCProfileSettingsScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'hcc_admin';

  const [profile, setProfile] = useState<PHCProfile | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    new_referral: true,
    score_change: true,
    overdue_followup: true,
    missed_checkin: true,
  });
  const [loading, setLoading] = useState(true);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<StaffMember | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Temp password modal state
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [tempPasswordData, setTempPasswordData] = useState<{ email: string; temp_password: string } | null>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [editProfile, setEditProfile] = useState<PHCProfile | null>(null);

  const [newStaffForm, setNewStaffForm] = useState({
    full_name: '',
    email: '',
    staff_role: 'cho',
    employee_id: '',
  });
  const [formErrors, setFormErrors] = useState<{ email?: string; full_name?: string; employee_id?: string }>({});

  const [webhookUrl, setWebhookUrl] = useState('https://hospital-ehr.internal/hl7-webhook');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await apiClient.get('/centers/phc/profile/');
        const profileData = profileRes.data?.data || profileRes.data || {};
        setProfile(profileData as PHCProfile);
        setEditProfile(profileData as PHCProfile);

        if (isAdmin) {
          const staffRes = await apiClient.get('/centers/phc/staff/');
          const sData = staffRes.data?.data ?? staffRes.data ?? [];
          const staffList = Array.isArray(sData) ? sData : [sData];
          setStaff(staffList as StaffMember[]);
        }

        const notifRes = await apiClient.get('/settings/notifications/');
        const nData = notifRes.data;
        const notifData = nData?.status === 'success' ? nData.data : nData;
        if (notifData && typeof notifData === 'object') {
          setNotifications({
            new_referral: !!(notifData.new_referral ?? notifData.new_referral_alerts),
            score_change: !!(notifData.score_change ?? notifData.score_change_alerts),
            overdue_followup: !!(notifData.overdue_followup ?? notifData.overdue_followup_reminders),
            missed_checkin: !!(notifData.missed_checkin ?? notifData.missed_checkin_alerts),
          });
        }
      } catch {
        // non-critical — silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      const res = await apiClient.post('/auth/me/change-password/', { old_password: oldPassword, new_password: newPassword });
      if (res.data?.status === 'success' || res.status === 200) {
        toast({ title: 'Password updated successfully' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        setPasswordError(res.data?.detail || 'Failed to update password');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setPasswordError(error.response?.data?.detail || 'Network error');
    }
  };

  const handleAddStaff = async () => {
    if (!newStaffForm.full_name || !newStaffForm.email) return;

    try {
      const payload: Record<string, string> = {
        full_name: newStaffForm.full_name,
        email: newStaffForm.email,
        staff_role: newStaffForm.staff_role,
      };
      if (newStaffForm.employee_id.trim()) {
        payload.employee_id = newStaffForm.employee_id.trim();
      }

      console.log('Creating staff with payload:', JSON.stringify(payload, null, 2));
      const res = await apiClient.post('/centers/phc/staff/', payload);
      const body = ensureResponseSuccess(res.data);
      const data = body.data ?? body;
      
      // Extract temp password from response
      if (data.temp_password) {
        setTempPasswordData({
          email: data.user_email || newStaffForm.email,
          temp_password: data.temp_password,
        });
        setShowTempPassword(true);
      }
      
      const created: StaffMember = data;
      setStaff((prev) => [...prev, created]);
      setShowAddStaffModal(false);
      setNewStaffForm({ full_name: '', email: '', staff_role: 'cho', employee_id: '' });
      toast({ title: 'Staff account created' });
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]>; detail?: string } } };
      console.error('Add staff error:', {
        status: error?.response?.status,
        data: JSON.stringify(error?.response?.data, null, 2),
      });
      const data = error?.response?.data;
      const fieldErrors = data?.errors;

      if (fieldErrors) {
        const firstField = Object.keys(fieldErrors)[0];
        const firstError = fieldErrors[firstField]?.[0];
        if (firstError) {
          toast({ title: firstError, variant: 'destructive' });
          setFormErrors({ [firstField]: firstError });
        } else {
          toast({ title: data?.message || 'Validation failed', variant: 'destructive' });
        }
      } else {
        toast({ title: data?.message || data?.detail || 'Failed to create staff account', variant: 'destructive' });
      }
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await apiClient.delete(`/centers/phc/staff/${deactivateTarget.id}/`);
      setStaff((prev) => prev.map((m) => m.id === deactivateTarget.id ? { ...m, is_active: false } : m));
      setShowDeactivateDialog(false);
      setDeactivateTarget(null);
      toast({ title: 'Staff account deactivated' });
    } catch (err) {
      console.error('Deactivate error:', err);
      toast({ title: 'Failed to deactivate staff', variant: 'destructive' });
    } finally {
      setDeactivating(false);
    }
  };

  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);

    try {
      const res = await apiClient.patch('/settings/notifications/', updated);
      ensureResponseSuccess(res.data);
    } catch {
      setNotifications(notifications);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') });
    } catch { /* ignore */ }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    logout();
    navigate('/phc/login');
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      cho: 'bg-blue-100 text-blue-800',
      assistant: 'bg-amber-100 text-amber-800',
      receptionist: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      cho: 'CHO',
      assistant: 'Assistant',
      receptionist: 'Receptionist',
      other: 'Other',
    };
    return <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>{labels[role] || role}</Badge>;
  };

  if (loading) {
    return (
      <PHCLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E8B57]" />
        </div>
      </PHCLayout>
    );
  }

  return (
    <PHCLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#2E8B57]" />
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Facility Profile */}
        <Card className="border-l-4 border-[#2E8B57]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" /> Facility Profile
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-[#2E8B57] text-[#2E8B57] hover:bg-green-50"
                onClick={() => setShowEditProfile(!showEditProfile)}
              >
                <Edit className="w-4 h-4 mr-1" /> Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showEditProfile && editProfile ? (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Facility Name</Label><Input value={editProfile.name} disabled /></div>
                  <div><Label>Facility Code</Label><Input value={editProfile.code} disabled /></div>
                  <div><Label>State</Label><Input value={editProfile.state} disabled /></div>
                  <div><Label>LGA</Label><Input value={editProfile.lga} disabled /></div>
                  <div><Label>Phone</Label><Input value={editProfile.phone} disabled /></div>
                  <div><Label>Escalation FMC</Label><Input value={editProfile.escalation_fmc_name || 'Not set'} disabled /></div>
                </div>
                <p className="text-sm text-gray-500">Operating Hours: Mon-Fri 8am-5pm</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Building className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Name:</span><span className="font-medium">{profile?.name || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><span className="text-gray-600">Code:</span><span className="font-medium">{profile?.code || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-gray-600">State:</span><span className="font-medium">{profile?.state || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><span className="text-gray-600">LGA:</span><span className="font-medium">{profile?.lga || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Phone:</span><span className="font-medium">{profile?.phone || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Hours:</span><span className="font-medium">Mon-Fri 8am-5pm</span></div>
                {profile?.escalation_fmc_name && <div className="col-span-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Escalation FMC:</span><span className="font-medium">{profile.escalation_fmc_name}</span></div>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Account */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> My Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2E8B57] flex items-center justify-center text-white font-bold text-lg">{user?.full_name?.charAt(0) || 'U'}</div>
              <div>
                <p className="font-semibold text-lg">{user?.full_name || 'PHC Staff'}</p>
                <Badge className={isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{isAdmin ? 'PHC Admin' : 'PHC Staff'}</Badge>
              </div>
            </div>
            <div className="text-sm text-gray-600"><p>Employee Number: {((user as unknown) as { employee_id?: string })?.employee_id || 'N/A'}</p></div>
            <Button variant="link" className="text-[#2E8B57] p-0 h-auto font-normal" onClick={() => setShowPasswordForm(!showPasswordForm)}>Change Password</Button>

            {showPasswordForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {passwordError && <Alert variant="destructive"><AlertDescription>{passwordError}</AlertDescription></Alert>}
                <div>
                  <Label>Old Password</Label>
                  <div className="relative">
                    <Input type={showOldPassword ? 'text' : 'password'} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div>
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div><Label>Confirm Password</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
                <div className="flex gap-2">
                  <Button onClick={handlePasswordChange} className="bg-[#2E8B57] hover:bg-[#246b47]">Update Password</Button>
                  <Button variant="outline" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Staff Management - Admin Only */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Staff Management</CardTitle>
                <Button size="sm" className="bg-[#2E8B57] hover:bg-[#246b47]" onClick={() => { setShowAddStaffModal(true); setFormErrors({}); }}><Plus className="w-4 h-4 mr-1" /> Add Staff</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Role</th><th className="pb-2 font-medium">Email</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Employee ID</th><th className="pb-2 font-medium">Actions</th></tr></thead>
                  <tbody>
                    {staff.map((member) => (
                      <tr key={member.id} className="border-b">
                        <td className="py-3">{member.user_full_name}</td>
                        <td className="py-3">{getRoleBadge(member.staff_role)}</td>
                        <td className="py-3 text-gray-600">{member.user_email}</td>
                        <td className="py-3"><span className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${member.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />{member.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td className="py-3 text-gray-600">{member.employee_id || '—'}</td>
                        <td className="py-3"><div className="flex gap-2">{member.is_active && <Button variant="link" size="sm" className="text-red-600 p-0 h-auto" onClick={() => { setDeactivateTarget(member); setShowDeactivateDialog(true); }}>Deactivate</Button>}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Preferences */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notification Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'new_referral', label: 'New patient referral alerts' },
              { key: 'score_change', label: 'Patient score change alerts' },
              { key: 'overdue_followup', label: 'Overdue follow-up reminders' },
              { key: 'missed_checkin', label: 'Missed check-in alerts' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span>{item.label}</span>
                <Switch checked={notifications[item.key as keyof NotificationSettings]} onCheckedChange={() => handleNotificationToggle(item.key as keyof NotificationSettings)} />
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2"><span>Critical escalation alerts</span><Lock className="w-3 h-3 text-gray-400" /></div>
              <Switch checked={true} disabled />
            </div>
          </CardContent>
        </Card>

        {/* EHR Integration */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> EHR Integration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-gray-600">FHIR Connection Status</span><Badge variant="outline" className="text-gray-600">Not Connected</Badge></div>
            <Button variant="outline" className="border-gray-300">Connect to Hospital EHR</Button>
            <div>
              <Label>HL7 Webhook URL</Label>
              <div className="flex gap-2">
                <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={copyWebhookUrl}>{copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}</Button>
              </div>
            </div>
            <Button variant="outline" className="border-gray-300">Test Connection</Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Support</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <a href="#" className="flex items-center gap-2 text-[#2E8B57] hover:underline"><ExternalLink className="w-4 h-4" /> Help Documentation</a>
            <a href="mailto:support@ai-mshm.org" className="flex items-center gap-2 text-[#2E8B57] hover:underline"><Mail className="w-4 h-4" /> Contact AI-MSHM Support</a>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setShowLogoutDialog(true)}><LogOut className="w-4 h-4 mr-2" /> Log Out</Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Staff Modal */}
      <Dialog open={showAddStaffModal} onOpenChange={(open) => {
        setShowAddStaffModal(open);
        if (!open) {
          setNewStaffForm({ full_name: '', email: '', staff_role: 'cho', employee_id: '' });
          setFormErrors({});
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Full Name *</Label><Input value={newStaffForm.full_name} onChange={(e) => { setNewStaffForm({ ...newStaffForm, full_name: e.target.value }); setFormErrors((p) => ({ ...p, full_name: '' })); }} placeholder="Enter full name" className={formErrors.full_name ? 'border-red-500' : ''} /></div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={newStaffForm.email} onChange={(e) => { setNewStaffForm({ ...newStaffForm, email: e.target.value }); setFormErrors((p) => ({ ...p, email: '' })); }} placeholder="Enter email address" className={formErrors.email ? 'border-red-500' : ''} />
              {formErrors.email && <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <Label>Role</Label>
              <select value={newStaffForm.staff_role} onChange={(e) => setNewStaffForm({ ...newStaffForm, staff_role: e.target.value })} className="w-full h-10 px-3 border rounded-md text-sm">
                <option value="cho">CHO</option>
                <option value="assistant">Assistant</option>
                <option value="receptionist">Receptionist</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div><Label>Employee ID (Optional)</Label><Input value={newStaffForm.employee_id} onChange={(e) => setNewStaffForm({ ...newStaffForm, employee_id: e.target.value })} placeholder="Enter employee ID" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddStaffModal(false); setNewStaffForm({ full_name: '', email: '', staff_role: 'cho', employee_id: '' }); setFormErrors({}); }}>Cancel</Button>
            <Button onClick={handleAddStaff} disabled={!newStaffForm.full_name || !newStaffForm.email} className="bg-[#2E8B57] hover:bg-[#246b47]">Create Staff Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Temp Password Modal */}
      <Dialog open={showTempPassword} onOpenChange={setShowTempPassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Staff Account Created</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Important:</strong> Share these credentials securely with the new staff member. They should change their password after first login.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={tempPasswordData?.email || ''} readOnly className="flex-1" />
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(tempPasswordData?.email || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Temporary Password</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={tempPasswordData?.temp_password || ''} readOnly className="flex-1 font-mono" />
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(tempPasswordData?.temp_password || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setShowTempPassword(false); setTempPasswordData(null); }} className="bg-[#2E8B57] hover:bg-[#246b47] w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Staff Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" /> Deactivate Staff</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to deactivate <strong>{deactivateTarget?.user_full_name}</strong>? They will no longer be able to access this portal.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowDeactivateDialog(false); setDeactivateTarget(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={deactivating} className="bg-red-600 hover:bg-red-700">{deactivating ? 'Deactivating...' : 'Deactivate'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><LogOut className="w-5 h-5" /> Log Out</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to log out?</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleLogout} className="bg-red-600 hover:bg-red-700">Log Out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PHCLayout>
  );
}
