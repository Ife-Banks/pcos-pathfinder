import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, TrendingUp, Clock, CalendarX, AlertTriangle, CheckCircle2 } from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';
import { mockAlerts, PHCAlert } from '@/data/phcMockData';

const alertConfig: Record<PHCAlert['type'], { icon: any; bg: string; color: string; actionLabel: string }> = {
  new_referral: { icon: UserPlus, bg: 'bg-green-100', color: 'text-green-600', actionLabel: 'Review Patient' },
  score_change: { icon: TrendingUp, bg: 'bg-amber-100', color: 'text-amber-600', actionLabel: 'View Score Details' },
  overdue_followup: { icon: Clock, bg: 'bg-orange-100', color: 'text-orange-600', actionLabel: 'Book Follow-Up' },
  missed_checkin: { icon: CalendarX, bg: 'bg-gray-100', color: 'text-gray-600', actionLabel: 'Send Reminder' },
  escalation_required: { icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600', actionLabel: 'Escalate Now' },
};

export default function PHCAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'New Referrals', 'Score Changes', 'Overdue Follow-Ups', 'Missed Check-Ins', 'Escalation Required'];
  const filterMap: Record<string, PHCAlert['type'] | null> = {
    'All': null, 'New Referrals': 'new_referral', 'Score Changes': 'score_change',
    'Overdue Follow-Ups': 'overdue_followup', 'Missed Check-Ins': 'missed_checkin', 'Escalation Required': 'escalation_required',
  };

  const filtered = filter === 'All' ? alerts : alerts.filter(a => a.type === filterMap[filter]);
  const unread = alerts.filter(a => !a.read).length;

  const markAllRead = () => setAlerts(alerts.map(a => ({ ...a, read: true })));

  const handleAction = (alert: PHCAlert) => {
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a));
    if (alert.type === 'escalation_required') navigate(`/phc/refer/${alert.patientId}`);
    else navigate(`/phc/patients/${alert.patientId}`);
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`;
  };

  return (
    <PHCLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3">Alerts & Notifications</h1>
          {unread > 0 && <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">{unread}</span>}
        </div>
        <button onClick={markAllRead} className="text-sm text-[#2E8B57] hover:underline">Mark All Read</button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${filter === f ? 'bg-[#2E8B57] text-white' : 'bg-gray-100 text-gray-600'}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 size={48} className="mx-auto text-[#2E8B57] mb-3" />
          <p className="text-gray-600 font-medium">You're all caught up</p>
          <p className="text-gray-400 text-sm">No new alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;
            return (
              <div key={alert.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-start gap-3 ${!alert.read ? 'border-l-4 border-l-[#2E8B57]' : ''}`}>
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!alert.read ? 'font-semibold' : ''} text-[#1E1E2E]`}>{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(alert.timestamp)}</p>
                </div>
                <button onClick={() => handleAction(alert)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    alert.type === 'escalation_required' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-[#2E8B57] text-white hover:bg-[#256D46]'
                  }`}>
                  {config.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </PHCLayout>
  );
}
