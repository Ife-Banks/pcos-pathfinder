import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, X, Copy, Check, Loader2, RefreshCw, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';
import { phcAPI } from '@/services/phcService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  user_last_login: string | null;
}

interface PHCProfile {
  id: string;
  name: string;
  code: string;
  address: string;
  state: string;
  lga: string;
  phone: string;
  email: string;
  status: string;
  staff_count: number;
}

interface EnsembleWeightConfig {
  id: string;
  disease_name: string;
  symptom_weight: number;
  menstrual_weight: number;
  rppg_weight: number;
  mood_weight: number;
  rotterdam_2_criteria_boost: number;
  rotterdam_3_criteria_boost: number;
  metabolic_reproductive_boost: number;
  mood_rppg_stress_boost: number;
  is_active: boolean;
  updated_at: string;
}

const STAFF_ROLES = [
  { value: 'nurse', label: 'Nurse' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'chw', label: 'Community Health Worker' },
];

export default function PHCSettings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // State
  const [showLogout, setShowLogout] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);
  
  // Profile data
  const [phcProfile, setPhcProfile] = useState<PHCProfile | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [newStaff, setNewStaff] = useState({
    full_name: '',
    email: '',
    staff_role: 'nurse',
    employee_id: '',
  });
  const [tempPassword, setTempPassword] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Ensemble Weight Config state
  const [showEnsembleWeights, setShowEnsembleWeights] = useState(false);
  const [weightConfigs, setWeightConfigs] = useState<Record<string, EnsembleWeightConfig>>({});
  const [editingDisease, setEditingDisease] = useState<string | null>(null);
  const [editedWeights, setEditedWeights] = useState<Record<string, number>>({});
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const isAdmin = user?.role === 'hcc_admin';
  
  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch PHC profile
      const profileRes = await phcAPI.getPHCProfile();
      const profileData = profileRes.data?.data || profileRes.data;
      setPhcProfile(profileData);
      
      // Fetch staff list (only if admin)
      if (isAdmin) {
        const staffRes = await phcAPI.getStaff();
        const staffData = staffRes.data?.data || staffRes.data || [];
        setStaffList(Array.isArray(staffData) ? staffData : []);
      }
    } catch (err: any) {
      console.error('Error fetching settings data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [isAdmin]);
  
  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/phc/login');
  };
  
  // Handle add staff
  const handleAddStaff = async () => {
    if (!newStaff.full_name.trim() || !newStaff.email.trim()) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    
    try {
      setSaving(true);
      const result = await phcAPI.createStaff(newStaff);
      const data = result.data?.data || result.data;
      
      // Show temp password
      setTempPassword(data.temp_password);
      setTempEmail(data.user_email);
      setShowAddStaff(false);
      setShowTempPassword(true);
      
      // Reset form
      setNewStaff({ full_name: '', email: '', staff_role: 'nurse', employee_id: '' });
      
      // Refresh staff list
      fetchData();
      
      toast({ title: 'Success', description: 'Staff account created successfully.' });
    } catch (err: any) {
      console.error('Error creating staff:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to create staff account.';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    
    try {
      setSaving(true);
      await phcAPI.changePassword({
        old_password: passwordForm.current,
        new_password: passwordForm.newPassword,
      });
      
      toast({ title: 'Success', description: 'Password updated successfully.' });
      setShowPassword(false);
      setPasswordForm({ current: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error('Error changing password:', err);
      const errorMsg = err?.response?.data?.message || 'Failed to update password.';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };
  
  // Fetch ensemble weight configs
  const fetchEnsembleWeights = async () => {
    try {
      const res = await apiClient.get('/predictions/ensemble-config/');
      const configs = res.data?.data?.configurations || [];
      const configMap: Record<string, EnsembleWeightConfig> = {};
      configs.forEach((c: EnsembleWeightConfig) => {
        configMap[c.disease_name] = c;
      });
      setWeightConfigs(configMap);
    } catch (err) {
      console.error('Error fetching ensemble weights:', err);
    }
  };
  
  // Update ensemble weight
  const handleUpdateWeight = async (diseaseName: string) => {
    const config = weightConfigs[diseaseName];
    if (!config) return;
    
    const weights = [editedWeights.symptom, editedWeights.menstrual, editedWeights.rppg, editedWeights.mood];
    const total = weights.reduce((a, b) => a + b, 0);
    
    if (Math.abs(total - 1.0) > 0.01) {
      toast({ title: 'Error', description: `Weights must sum to 1.0 (current sum: ${total.toFixed(3)})`, variant: 'destructive' });
      return;
    }
    
    try {
      setSaving(true);
      await apiClient.put(`/predictions/ensemble-config/${diseaseName}/`, {
        symptom_weight: editedWeights.symptom,
        menstrual_weight: editedWeights.menstrual,
        rppg_weight: editedWeights.rppg,
        mood_weight: editedWeights.mood,
      });
      
      toast({ title: 'Success', description: `Weights updated for ${diseaseName}` });
      setEditingDisease(null);
      await fetchEnsembleWeights();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to update weights', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };
  
  // Reset to defaults
  const handleResetWeights = async () => {
    try {
      setSaving(true);
      await apiClient.post('/predictions/ensemble-config/reset/');
      toast({ title: 'Success', description: 'Weights reset to defaults' });
      await fetchEnsembleWeights();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to reset weights', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };
  
  // Start editing a disease
  const startEditing = (diseaseName: string) => {
    const config = weightConfigs[diseaseName];
    if (!config) return;
    setEditedWeights({
      symptom: config.symptom_weight,
      menstrual: config.menstrual_weight,
      rppg: config.rppg_weight,
      mood: config.mood_weight,
    });
    setEditingDisease(diseaseName);
  };
  
  // Fetch ensemble weights when section is shown
  useEffect(() => {
    if (showEnsembleWeights && isAdmin) {
      fetchEnsembleWeights();
    }
  }, [showEnsembleWeights, isAdmin]);
  
  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };
  
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent outline-none";
  
  if (loading) {
    return (
      <PHCLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#2E8B57]" />
        </div>
      </PHCLayout>
    );
  }
  
  return (
    <PHCLayout>
      <h1 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3 mb-6">Settings</h1>

      {/* Facility Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#2E8B57] p-4 md:p-6 mb-4">
        <h3 className="text-base font-semibold text-[#1E1B2E] mb-3">{phcProfile?.name || 'Loading...'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
          <div><span className="text-gray-400">Address:</span> {phcProfile?.address || '-'}</div>
          <div><span className="text-gray-400">Phone:</span> {phcProfile?.phone || '-'}</div>
          <div><span className="text-gray-400">State/LGA:</span> {phcProfile?.state}, {phcProfile?.lga}</div>
          <div><span className="text-gray-400">Facility Code:</span> {phcProfile?.code || '-'}</div>
          <div><span className="text-gray-400">Staff Count:</span> {phcProfile?.staff_count || 0}</div>
          <div><span className="text-gray-400">Status:</span> 
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              phcProfile?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {phcProfile?.status || '-'}
            </span>
          </div>
        </div>
        {/* Edit facility button for admin */}
        {isAdmin && (
          <button 
            onClick={() => toast({ title: 'Coming soon', description: 'Edit facility feature coming soon.' })}
            className="mt-3 text-sm text-[#2E8B57] hover:underline"
          >
            Edit Facility Details
          </button>
        )}
      </div>

      {/* My Account */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
        <h3 className="text-sm font-semibold text-[#1E1B2E] mb-3 border-l-4 border-[#2E8B57] pl-3">My Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-400">Name:</span> <span className="font-medium">{user?.full_name || '-'}</span></div>
          <div><span className="text-gray-400">Role:</span> 
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
            }`}>
              {isAdmin ? 'PHC Admin' : 'PHC Staff'}
            </span>
          </div>
          <div><span className="text-gray-400">Email:</span> {user?.email || '-'}</div>
        </div>
        <button onClick={() => setShowPassword(true)} className="mt-3 text-sm text-[#2E8B57] hover:underline">Change Password</button>
      </div>

      {/* Staff Management - Admin Only */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1E1B2E] border-l-4 border-[#2E8B57] pl-3">Staff Management</h3>
            <button onClick={fetchData} className="p-1 text-gray-400 hover:text-[#2E8B57]">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          {staffList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#E8F5E9] text-[#1E1B2E]">
                    <th className="text-left px-3 py-2 font-semibold">Name</th>
                    <th className="text-left px-3 py-2 font-semibold">Email</th>
                    <th className="text-left px-3 py-2 font-semibold">Role</th>
                    <th className="text-left px-3 py-2 font-semibold">Status</th>
                    <th className="text-left px-3 py-2 font-semibold">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50">
                      <td className="px-3 py-2 font-medium">{s.user_full_name}</td>
                      <td className="px-3 py-2 text-gray-500">{s.user_email}</td>
                      <td className="px-3 py-2">{STAFF_ROLES.find(r => r.value === s.staff_role)?.label || s.staff_role}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{formatDate(s.user_last_login)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">No other staff members yet.</p>
          )}
          
          <button 
            onClick={() => setShowAddStaff(true)}
            className="mt-3 bg-[#2E8B57] text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-[#256D46] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add New Staff
          </button>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
        <h3 className="text-sm font-semibold text-[#1E1B2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Notification Preferences</h3>
        <p className="text-xs text-gray-500 mb-3">Notification settings coming soon.</p>
      </div>

      {/* Ensemble Weight Configuration - Admin Only */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
          <button 
            onClick={() => setShowEnsembleWeights(!showEnsembleWeights)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#2E8B57]" />
              <h3 className="text-sm font-semibold text-[#1E1B2E]">Risk Score Weights</h3>
            </div>
            {showEnsembleWeights ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>
          
          {showEnsembleWeights && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-4">
                Configure how each data source contributes to disease risk scores. Weights must sum to 1.0 (100%).
              </p>
              
              <div className="space-y-4">
                {Object.entries(weightConfigs).map(([disease, config]) => (
                  <div key={disease} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm text-[#1E1B2E]">{disease}</h4>
                      {editingDisease === disease ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingDisease(null)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleUpdateWeight(disease)}
                            disabled={saving}
                            className="text-xs bg-[#2E8B57] text-white px-3 py-1 rounded font-medium"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startEditing(disease)}
                          className="text-xs text-[#2E8B57] hover:underline"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-[#1E1B2E]">Symptom</div>
                        {editingDisease === disease ? (
                          <input 
                            type="number" 
                            step="0.05"
                            min="0"
                            max="1"
                            value={editedWeights.symptom}
                            onChange={e => setEditedWeights(w => ({ ...w, symptom: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-center mt-1"
                          />
                        ) : (
                          <div className="text-[#2E8B57]">{(config.symptom_weight * 100).toFixed(0)}%</div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-[#1E1B2E]">Menstrual</div>
                        {editingDisease === disease ? (
                          <input 
                            type="number" 
                            step="0.05"
                            min="0"
                            max="1"
                            value={editedWeights.menstrual}
                            onChange={e => setEditedWeights(w => ({ ...w, menstrual: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-center mt-1"
                          />
                        ) : (
                          <div className="text-[#2E8B57]">{(config.menstrual_weight * 100).toFixed(0)}%</div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-[#1E1B2E]">rPPG</div>
                        {editingDisease === disease ? (
                          <input 
                            type="number" 
                            step="0.05"
                            min="0"
                            max="1"
                            value={editedWeights.rppg}
                            onChange={e => setEditedWeights(w => ({ ...w, rppg: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-center mt-1"
                          />
                        ) : (
                          <div className="text-[#2E8B57]">{(config.rppg_weight * 100).toFixed(0)}%</div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-[#1E1B2E]">Mood</div>
                        {editingDisease === disease ? (
                          <input 
                            type="number" 
                            step="0.05"
                            min="0"
                            max="1"
                            value={editedWeights.mood}
                            onChange={e => setEditedWeights(w => ({ ...w, mood: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-center mt-1"
                          />
                        ) : (
                          <div className="text-[#2E8B57]">{(config.mood_weight * 100).toFixed(0)}%</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={handleResetWeights}
                disabled={saving}
                className="mt-4 text-xs text-gray-500 hover:text-[#2E8B57] flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Reset to defaults
              </button>
            </div>
          )}
        </div>
      )}

      {/* Logout */}
      <button onClick={() => setShowLogout(true)}
        className="w-full border border-red-300 text-red-600 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2">
        <LogOut size={16} /> Log Out
      </button>

      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#1E1B2E] mb-2">Log Out</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleLogout} className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium">Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPassword && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1E1B2E]">Change Password</h3>
              <button onClick={() => setShowPassword(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Current Password</Label>
                <Input type="password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <Label className="text-xs text-gray-500">New Password</Label>
                <Input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Confirm New Password</Label>
                <Input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowPassword(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm">Cancel</button>
              <button onClick={handlePasswordChange} disabled={saving} className="flex-1 bg-[#2E8B57] text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1E1B2E]">Add New Staff</h3>
              <button onClick={() => setShowAddStaff(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Full Name *</Label>
                <Input 
                  value={newStaff.full_name} 
                  onChange={e => setNewStaff(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="e.g. Jane Doe" 
                  className={inputCls} 
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Email *</Label>
                <Input 
                  type="email"
                  value={newStaff.email} 
                  onChange={e => setNewStaff(p => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. jane.doe@example.com" 
                  className={inputCls} 
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Role *</Label>
                <select 
                  value={newStaff.staff_role}
                  onChange={e => setNewStaff(p => ({ ...p, staff_role: e.target.value }))}
                  className={inputCls}
                >
                  {STAFF_ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Employee ID (Optional)</Label>
                <Input 
                  value={newStaff.employee_id} 
                  onChange={e => setNewStaff(p => ({ ...p, employee_id: e.target.value }))}
                  placeholder="e.g. PHC-0234" 
                  className={inputCls} 
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddStaff(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleAddStaff} disabled={saving} className="flex-1 bg-[#2E8B57] text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temp Password Modal */}
      {showTempPassword && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1E1B2E]">Staff Account Created</h3>
              <button onClick={() => setShowTempPassword(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800 font-medium">⚠️ Important: Share these credentials with the new staff member securely.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <div className="flex items-center gap-2">
                  <Input value={tempEmail} readOnly className={inputCls} />
                  <button onClick={() => copyToClipboard(tempEmail)} className="p-2 text-gray-400 hover:text-[#2E8B57]">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Temporary Password</Label>
                <div className="flex items-center gap-2">
                  <Input value={tempPassword} readOnly className={inputCls} />
                  <button onClick={() => copyToClipboard(tempPassword)} className="p-2 text-gray-400 hover:text-[#2E8B57]">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              The staff member should change their password after first login.
            </p>
            
            <button onClick={() => setShowTempPassword(false)} className="w-full mt-6 bg-[#2E8B57] text-white rounded-lg px-4 py-2 text-sm font-medium">
              Done
            </button>
          </div>
        </div>
      )}
    </PHCLayout>
  );
}
