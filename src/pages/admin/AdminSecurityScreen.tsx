import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Key, Eye, EyeOff, CheckCircle, AlertTriangle, RefreshCw, Users, UserCheck, UserX, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminAPI, SecurityOverview, SecurityEvent, SecurityPolicies } from '@/services/adminService';

interface SecuritySettings {
  two_factor_auth_enabled: boolean;
  session_timeout_minutes: number;
  password_expiry_days: number;
  failed_login_lockout_attempts: number;
  failed_login_lockout_duration_minutes: number;
  minimum_password_length: number;
  require_special_characters: boolean;
  ip_whitelist_enabled: boolean;
  ip_whitelist: string;
}

const AdminSecurityScreen = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_auth_enabled: false,
    session_timeout_minutes: 30,
    password_expiry_days: 90,
    failed_login_lockout_attempts: 5,
    failed_login_lockout_duration_minutes: 15,
    minimum_password_length: 8,
    require_special_characters: false,
    ip_whitelist_enabled: false,
    ip_whitelist: '',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchSecurity = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSecurity();
      setOverview(res.data.overview);
      setEvents(res.data.security_events);
      setPolicies(res.data.policies);

      const settingsRes = await adminAPI.getSecuritySettings();
      if (settingsRes.data) {
        setSettings({
          two_factor_auth_enabled: settingsRes.data.two_factor_auth_enabled || false,
          session_timeout_minutes: settingsRes.data.session_timeout_minutes || 30,
          password_expiry_days: settingsRes.data.password_expiry_days || 90,
          failed_login_lockout_attempts: settingsRes.data.failed_login_lockout_attempts || 5,
          failed_login_lockout_duration_minutes: settingsRes.data.failed_login_lockout_duration_minutes || 15,
          minimum_password_length: settingsRes.data.minimum_password_length || 8,
          require_special_characters: settingsRes.data.require_special_characters || false,
          ip_whitelist_enabled: settingsRes.data.ip_whitelist_enabled || false,
          ip_whitelist: settingsRes.data.ip_whitelist || '',
        });
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load security data:', err);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSettingsSaving(true);
      await adminAPI.updateSecuritySettings(settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSettingsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!passwords.old_password || !passwords.new_password || !passwords.confirm_password) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwords.new_password.length < settings.minimum_password_length) {
      setPasswordError(`Password must be at least ${settings.minimum_password_length} characters.`);
      return;
    }

    if (settings.require_special_characters && !/[!@#$%^&*(),.?":{}|<>]/.test(passwords.new_password)) {
      setPasswordError('Password must contain at least one special character.');
      return;
    }

    try {
      setChangingPassword(true);
      await adminAPI.changePassword(passwords);
      setPasswordSuccess(true);
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-700">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">Info</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500">Manage security and authentication</p>
      </div>

      {/* User Overview */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded mt-2" />
            </div>
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="h-4 w-4" /> Total Users
            </div>
            <p className="text-2xl font-bold">{overview.total_users.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <UserCheck className="h-4 w-4" /> Active (30d)
            </div>
            <p className="text-2xl font-bold text-green-600">{overview.active_users_30d.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <CheckCircle className="h-4 w-4" /> Verified
            </div>
            <p className="text-2xl font-bold text-blue-600">{overview.verified_users.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <UserX className="h-4 w-4" /> Unverified
            </div>
            <p className="text-2xl font-bold text-amber-600">{overview.unverified_users.toLocaleString()}</p>
          </div>
        </div>
      ) : null}

      {/* Password Change */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" /> Change Admin Password
        </h2>
        <div className="space-y-4 max-w-md">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Password changed successfully!
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative mt-1">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={passwords.old_password}
                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative mt-1">
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative mt-1">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={passwords.confirm_password}
                onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handlePasswordChange}
            disabled={changingPassword}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${changingPassword ? 'animate-spin' : ''}`} />
            {changingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </div>

      {/* Security Policies Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security Policies
          </h2>
          <Button onClick={handleSaveSettings} disabled={settingsSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {settingsSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        {settingsSaved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Security settings saved successfully!
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
            <Input
              type="number"
              value={settings.session_timeout_minutes}
              onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) || 30 })}
              min={5}
              max={120}
            />
            <p className="text-xs text-gray-500">Auto logout after inactivity (5-120 min)</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password Expiry (days)</label>
            <Input
              type="number"
              value={settings.password_expiry_days}
              onChange={(e) => setSettings({ ...settings, password_expiry_days: parseInt(e.target.value) || 90 })}
              min={7}
              max={365}
            />
            <p className="text-xs text-gray-500">Force password change after this many days</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Failed Login Lockout (attempts)</label>
            <Input
              type="number"
              value={settings.failed_login_lockout_attempts}
              onChange={(e) => setSettings({ ...settings, failed_login_lockout_attempts: parseInt(e.target.value) || 5 })}
              min={3}
              max={20}
            />
            <p className="text-xs text-gray-500">Lock account after failed attempts</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Lockout Duration (minutes)</label>
            <Input
              type="number"
              value={settings.failed_login_lockout_duration_minutes}
              onChange={(e) => setSettings({ ...settings, failed_login_lockout_duration_minutes: parseInt(e.target.value) || 15 })}
              min={1}
              max={60}
            />
            <p className="text-xs text-gray-500">How long to lock the account</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Minimum Password Length</label>
            <Input
              type="number"
              value={settings.minimum_password_length}
              onChange={(e) => setSettings({ ...settings, minimum_password_length: parseInt(e.target.value) || 8 })}
              min={6}
              max={32}
            />
            <p className="text-xs text-gray-500">Minimum characters required</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, two_factor_auth_enabled: !settings.two_factor_auth_enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.two_factor_auth_enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.two_factor_auth_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {settings.two_factor_auth_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Require Special Characters</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, require_special_characters: !settings.require_special_characters })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.require_special_characters ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.require_special_characters ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {settings.require_special_characters ? 'Yes' : 'No'}
              </span>
            </div>
            <p className="text-xs text-gray-500">Require special characters in passwords</p>
          </div>
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" /> Recent Security Events
        </h2>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No security events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-lg border ${getEventStyle(event.type)}`}
              >
                <div className="flex items-center gap-3">
                  {getEventIcon(event.type)}
                  <div>
                    <p className="font-medium text-gray-900">{event.event}</p>
                    {event.count !== null && (
                      <p className="text-sm text-gray-500">{event.count} occurrences</p>
                    )}
                  </div>
                </div>
                {getSeverityBadge(event.severity)}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSecurityScreen;