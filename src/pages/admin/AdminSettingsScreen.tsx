import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RefreshCw, Globe, Mail, Bell, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminSettingsScreen = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500">Configure system settings</p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" /> General Settings
        </h2>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">System Name</label>
            <Input defaultValue="AI-MSHM" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Support Email</label>
            <Input defaultValue="support@aimher.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Timezone</label>
            <Input defaultValue="Africa/Lagos (GMT+1)" />
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" /> Email Configuration
        </h2>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">SMTP Host</label>
            <Input defaultValue="smtp.gmail.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">SMTP Port</label>
            <Input defaultValue="587" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">From Address</label>
            <Input defaultValue="noreply@aimher.com" />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notification Settings
        </h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <span>Email notifications enabled</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <span>SMS notifications enabled</span>
            <input type="checkbox" className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <span>Push notifications enabled</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          {saved ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
        {saved && <Badge className="bg-green-100 text-green-700">Settings updated successfully</Badge>}
      </div>
    </div>
  );
};

export default AdminSettingsScreen;