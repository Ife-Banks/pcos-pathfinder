import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Plus, AlertTriangle, CheckCircle, UserPlus, Copy, Check,
} from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient';

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
}

const ensureResponseSuccess = (body: any) => {
  if (body?.status && body.status !== 'success') throw body;
  return body;
};

const getInitials = (name: string) =>
  name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  cho:           { label: 'CHO',          color: 'bg-blue-100 text-blue-800' },
  assistant:     { label: 'Assistant',    color: 'bg-amber-100 text-amber-800' },
  receptionist:  { label: 'Receptionist', color: 'bg-purple-100 text-purple-800' },
  other:         { label: 'Other',        color: 'bg-gray-100 text-gray-800' },
};

export default function PHCStaffManagementScreen() {
  const { toast } = useToast();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Add staff modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({ full_name: '', email: '', staff_role: 'cho', employee_id: '' });
  const [formErrors, setFormErrors] = useState<{ email?: string; full_name?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Temp password modal
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [tempPasswordData, setTempPasswordData] = useState<{ email: string; temp_password: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Deactivate dialog
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<StaffMember | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    apiClient.get('/centers/phc/staff/')
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setStaff(Array.isArray(data) ? data : [data]);
      })
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddStaff = async () => {
    if (!newStaffForm.full_name || !newStaffForm.email) return;
    setSubmitting(true);
    try {
      const payload: Record<string, string> = {
        full_name: newStaffForm.full_name,
        email: newStaffForm.email,
        staff_role: newStaffForm.staff_role,
      };
      if (newStaffForm.employee_id.trim()) payload.employee_id = newStaffForm.employee_id.trim();

      const res = await apiClient.post('/centers/phc/staff/', payload);
      const body = ensureResponseSuccess(res.data);
      const data = body.data ?? body;

      if (data.temp_password) {
        setTempPasswordData({ email: data.user_email || newStaffForm.email, temp_password: data.temp_password });
        setShowTempPassword(true);
      }

      setStaff((prev) => [...prev, data as StaffMember]);
      setShowAddModal(false);
      setNewStaffForm({ full_name: '', email: '', staff_role: 'cho', employee_id: '' });
      toast({ title: 'Staff account created' });
    } catch (err: any) {
      const data = err?.response?.data;
      const fieldErrors = data?.errors;
      if (fieldErrors) {
        const firstField = Object.keys(fieldErrors)[0];
        const firstError = fieldErrors[firstField]?.[0];
        toast({ title: firstError || data?.message || 'Validation failed', variant: 'destructive' });
        setFormErrors({ [firstField]: firstError });
      } else {
        toast({ title: data?.message || data?.detail || 'Failed to create staff account', variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
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
    } catch {
      toast({ title: 'Failed to deactivate staff', variant: 'destructive' });
    } finally {
      setDeactivating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeCount = staff.filter((s) => s.is_active).length;
  const inactiveCount = staff.filter((s) => !s.is_active).length;

  return (
    <PHCLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#2E8B57]" />
              <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-9">
              {activeCount} active · {inactiveCount} inactive
            </p>
          </div>
          <Button className="bg-[#2E8B57] hover:bg-[#246b47]" onClick={() => { setShowAddModal(true); setFormErrors({}); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Staff
          </Button>
        </div>

        {/* Staff list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="w-16 h-5 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : staff.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">No staff members yet</p>
                <p className="text-xs text-gray-400 mb-4">Add your first team member to get started.</p>
                <Button size="sm" className="bg-[#2E8B57] hover:bg-[#246b47]" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Staff Member
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {staff.map((member, index) => {
                  const roleConfig = ROLE_CONFIG[member.staff_role] || ROLE_CONFIG.other;
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center gap-4 py-4"
                    >
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${member.is_active ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <span className={`text-sm font-semibold ${member.is_active ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {getInitials(member.user_full_name)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900">{member.user_full_name}</p>
                          <Badge className={roleConfig.color}>{roleConfig.label}</Badge>
                          {!member.is_active && (
                            <Badge className="bg-gray-100 text-gray-500">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{member.user_email}</p>
                        {member.employee_id && (
                          <p className="text-xs text-gray-400">ID: {member.employee_id}</p>
                        )}
                      </div>

                      {/* Status dot + action */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className={`w-2 h-2 rounded-full ${member.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {member.is_active && (
                          <Button
                            variant="ghost" size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs h-7 px-2"
                            onClick={() => { setDeactivateTarget(member); setShowDeactivateDialog(true); }}
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Add Staff Modal ─────────────────────────────────────────────── */}
      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) { setNewStaffForm({ full_name: '', email: '', staff_role: 'cho', employee_id: '' }); setFormErrors({}); }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Add Staff Member
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Full Name <span className="text-red-500">*</span></Label>
              <Input
                value={newStaffForm.full_name}
                onChange={(e) => { setNewStaffForm({ ...newStaffForm, full_name: e.target.value }); setFormErrors((p) => ({ ...p, full_name: '' })); }}
                placeholder="Enter full name"
                className={`mt-1 ${formErrors.full_name ? 'border-red-500' : ''}`}
              />
              {formErrors.full_name && <p className="text-xs text-red-600 mt-1">{formErrors.full_name}</p>}
            </div>
            <div>
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={newStaffForm.email}
                onChange={(e) => { setNewStaffForm({ ...newStaffForm, email: e.target.value }); setFormErrors((p) => ({ ...p, email: '' })); }}
                placeholder="Enter email address"
                className={`mt-1 ${formErrors.email ? 'border-red-500' : ''}`}
              />
              {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <Label>Role</Label>
              <select
                value={newStaffForm.staff_role}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, staff_role: e.target.value })}
                className="w-full h-10 px-3 border rounded-md text-sm mt-1"
              >
                <option value="cho">CHO</option>
                <option value="assistant">Assistant</option>
                <option value="receptionist">Receptionist</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>Employee ID <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input
                value={newStaffForm.employee_id}
                onChange={(e) => setNewStaffForm({ ...newStaffForm, employee_id: e.target.value })}
                placeholder="Enter employee ID"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button
              onClick={handleAddStaff}
              disabled={!newStaffForm.full_name || !newStaffForm.email || submitting}
              className="bg-[#2E8B57] hover:bg-[#246b47]"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Temp Password Modal ─────────────────────────────────────────── */}
      <Dialog open={showTempPassword} onOpenChange={setShowTempPassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" /> Staff Account Created
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Share these credentials securely. Staff should change their password after first login.
              </AlertDescription>
            </Alert>
            {[
              { key: 'email', label: 'Email', value: tempPasswordData?.email || '', mono: false },
              { key: 'pass', label: 'Temporary Password', value: tempPasswordData?.temp_password || '', mono: true },
            ].map((f) => (
              <div key={f.key}>
                <Label className="text-xs text-gray-500">{f.label}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={f.value} readOnly className={`flex-1 ${f.mono ? 'font-mono' : ''}`} />
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(f.value, f.key)}>
                    {copied === f.key ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => { setShowTempPassword(false); setTempPasswordData(null); }} className="bg-[#2E8B57] hover:bg-[#246b47] w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate Dialog ───────────────────────────────────────────── */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Deactivate Staff
            </DialogTitle>
          </DialogHeader>
          <p className="py-4 text-sm">
            Are you sure you want to deactivate <strong>{deactivateTarget?.user_full_name}</strong>? They will no longer be able to access this portal.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowDeactivateDialog(false); setDeactivateTarget(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={deactivating}>
              {deactivating ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PHCLayout>
  );
}