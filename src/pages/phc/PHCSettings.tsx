import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';
import { mockStaff } from '@/data/phcMockData';
import { useToast } from '@/hooks/use-toast';

export default function PHCSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLogout, setShowLogout] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fhirUrl, setFhirUrl] = useState('');
  const [hl7Url, setHl7Url] = useState('');
  const [notifications, setNotifications] = useState({
    newReferral: true, scoreChange: true, overdueFollowup: true, missedCheckin: false, escalationConfirm: true,
  });

  const toggleNotif = (key: keyof typeof notifications) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent outline-none";

  return (
    <PHCLayout>
      <h1 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3 mb-6">Settings</h1>

      {/* Facility Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#2E8B57] p-4 md:p-6 mb-4">
        <h3 className="text-base font-semibold text-[#1E1E2E] mb-3">{mockStaff.facilityName}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
          <div><span className="text-gray-400">Address:</span> {mockStaff.facilityAddress}</div>
          <div><span className="text-gray-400">Phone:</span> {mockStaff.facilityPhone}</div>
          <div><span className="text-gray-400">Hours:</span> {mockStaff.operatingHours}</div>
          <div><span className="text-gray-400">Facility ID:</span> {mockStaff.facilityId}</div>
          <div><span className="text-gray-400">Staff Count:</span> {mockStaff.activeStaffCount}</div>
        </div>
      </div>

      {/* My Account */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
        <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">My Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-400">Name:</span> <span className="font-medium">{mockStaff.firstName} {mockStaff.lastName}</span></div>
          <div><span className="text-gray-400">Role:</span> <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-semibold">PHC Staff</span></div>
          <div><span className="text-gray-400">Staff ID:</span> {mockStaff.id}</div>
          <div><span className="text-gray-400">Email:</span> {mockStaff.email}</div>
        </div>
        <button onClick={() => setShowPassword(true)} className="mt-3 text-sm text-[#2E8B57] hover:underline">Change Password</button>
      </div>

      {/* Staff Management */}
      {mockStaff.isAdmin && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
          <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Staff Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-[#E8F5E9] text-[#1E1E2E]">
                <th className="text-left px-3 py-2 font-semibold">Name</th>
                <th className="text-left px-3 py-2 font-semibold">Role</th>
                <th className="text-left px-3 py-2 font-semibold">Status</th>
                <th className="text-left px-3 py-2 font-semibold">Last Login</th>
              </tr></thead>
              <tbody>
                {[
                  { name: 'Amina Ibrahim', role: 'PHC Staff (Admin)', status: 'Active', lastLogin: 'Today' },
                  { name: 'Chidi Okafor', role: 'PHC Staff', status: 'Active', lastLogin: 'Yesterday' },
                  { name: 'Fatimah Yusuf', role: 'PHC Staff', status: 'Active', lastLogin: '3 days ago' },
                ].map(s => (
                  <tr key={s.name} className="border-b border-gray-50">
                    <td className="px-3 py-2 font-medium">{s.name}</td>
                    <td className="px-3 py-2">{s.role}</td>
                    <td className="px-3 py-2"><span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-[10px] font-semibold">{s.status}</span></td>
                    <td className="px-3 py-2 text-gray-500">{s.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-3 bg-[#2E8B57] text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-[#256D46]">+ Add New Staff</button>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
        <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { key: 'newReferral' as const, label: 'New patient referral received', desc: 'Alert when a new patient is referred to this PHC' },
            { key: 'scoreChange' as const, label: 'Risk score tier change', desc: "Alert when any patient's risk tier changes" },
            { key: 'overdueFollowup' as const, label: 'Overdue follow-up', desc: 'Alert when a scheduled follow-up is past due' },
            { key: 'missedCheckin' as const, label: 'Patient missed check-in', desc: 'Alert when a patient has not checked in for 7+ days' },
            { key: 'escalationConfirm' as const, label: 'Escalation confirmation', desc: 'Confirm when an escalation to FMC has been received' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1E1E2E]">{n.label}</p>
                <p className="text-xs text-gray-500">{n.desc}</p>
              </div>
              <button onClick={() => toggleNotif(n.key)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${notifications[n.key] ? 'bg-[#2E8B57] justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* EHR Integration */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
        <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">EHR Integration</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">FHIR Connection:</span>
            <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs font-semibold">Not connected</span>
          </div>
          <div><label className="text-xs text-gray-500">FHIR Endpoint URL</label><input className={inputCls} value={fhirUrl} onChange={e => setFhirUrl(e.target.value)} placeholder="https://fhir.example.com/r4" /></div>
          <button onClick={() => toast({ title: 'Connection test initiated' })} className="border border-[#2E8B57] text-[#2E8B57] rounded-lg px-4 py-1.5 text-xs font-medium">Test Connection</button>
          <div><label className="text-xs text-gray-500">HL7 Webhook URL</label><input className={inputCls} value={hl7Url} onChange={e => setHl7Url(e.target.value)} placeholder="https://hl7.example.com/webhook" /></div>
          <button onClick={() => toast({ title: 'Settings saved' })} className="bg-[#2E8B57] text-white rounded-lg px-4 py-1.5 text-xs font-medium">Save Integration Settings</button>
        </div>
      </div>

      {/* Support */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
        <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Support</h3>
        <div className="space-y-2">
          <a href="#" className="text-sm text-[#2E8B57] hover:underline block">View Help Documentation</a>
          <a href="mailto:support@ai-mshm.ng" className="text-sm text-[#2E8B57] hover:underline block">Contact AI-MSHM Support</a>
        </div>
      </div>

      {/* Logout */}
      <button onClick={() => setShowLogout(true)}
        className="w-full border border-red-300 text-red-600 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2">
        <LogOut size={16} /> Log Out
      </button>

      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#1E1E2E] mb-2">Log Out</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => navigate('/phc/login')} className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium">Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPassword && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-[#1E1E2E] mb-4">Change Password</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500">Current Password</label><input type="password" className={inputCls} /></div>
              <div><label className="text-xs text-gray-500">New Password</label><input type="password" className={inputCls} /></div>
              <div><label className="text-xs text-gray-500">Confirm New Password</label><input type="password" className={inputCls} /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowPassword(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => { setShowPassword(false); toast({ title: 'Password updated' }); }} className="flex-1 bg-[#2E8B57] text-white rounded-lg px-4 py-2 text-sm font-medium">Update</button>
            </div>
          </div>
        </div>
      )}
    </PHCLayout>
  );
}
