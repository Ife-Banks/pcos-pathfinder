import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Key, Eye, EyeOff, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminSecurityScreen = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const securitySettings = [
    { name: 'Two-Factor Authentication', status: 'enabled', description: 'Required for all admin accounts' },
    { name: 'Session Timeout', status: '30 min', description: 'Auto logout after inactivity' },
    { name: 'Password Expiry', status: '90 days', description: 'Mandatory password change' },
    { name: 'Failed Login Lockout', status: '5 attempts', description: 'Account locked after failed attempts' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500">Manage security and authentication</p>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" /> Change Admin Password
        </h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative mt-1">
              <Input type={showCurrent ? 'text' : 'password'} placeholder="Enter current password" />
              <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative mt-1">
              <Input type={showNew ? 'text' : 'password'} placeholder="Enter new password" />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <Input type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" /> Update Password
          </Button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" /> Security Policies
        </h2>
        <div className="space-y-4">
          {securitySettings.map((setting, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{setting.name}</p>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
              <Badge className="bg-green-100 text-green-700">{setting.status}</Badge>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSecurityScreen;