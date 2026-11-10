import React, { useState, useEffect } from 'react';
import { Search, CreditCard, CheckCircle2, XCircle, Clock, MoreVertical, CalendarPlus } from 'lucide-react';
import { adminAPI } from '@/services/adminService'; // Adjust path if needed

export default function AdminSubscriptionsScreen() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [daysByUser, setDaysByUser] = useState<Record<string, string>>({});
  const [trialDays, setTrialDays] = useState('');
  const [savedTrialDays, setSavedTrialDays] = useState<number | null>(null);
  const [savingTrial, setSavingTrial] = useState(false);
  const [trialMsg, setTrialMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Fetch subscriptions (You will need to ensure this endpoint exists in your backend)
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // Example API call - adjust to match your actual admin API setup
      const response = await adminAPI.getSubscriptions(); 
      const body = response?.data;
      const rows = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
      setSubscriptions(
        rows.map((u: any) => ({
          user_id: u.id,
          user_email: u.email,
          user_role: u.role,
          plan: u.subscription?.plan ?? 'none',
          status: u.subscription?.status ?? 'no subscription',
          trial_end: u.subscription?.trial_end ?? null,
          paid_end: u.subscription?.paid_end ?? null,
          has_subscription: !!u.subscription,
          is_active: !!u.subscription?.is_active,
          is_trial: !!u.subscription?.is_trial,
          trial_activated: u.subscription?.trial_activated,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialSettings = async () => {
    try {
      const res = await adminAPI.getTrialSettings();
      const d = res?.data?.data?.trial_days ?? res?.data?.trial_days;
      if (typeof d === 'number') {
        setSavedTrialDays(d);
        setTrialDays(String(d));
      }
    } catch (error) {
      console.error('Failed to load trial settings:', error);
    }
  };

  const saveTrialSettings = async () => {
    const days = parseInt(trialDays, 10);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      setTrialMsg({ type: 'err', text: 'Enter a whole number between 1 and 365.' });
      return;
    }
    try {
      setSavingTrial(true);
      setTrialMsg(null);
      const res = await adminAPI.updateTrialSettings(days);
      const d = res?.data?.data?.trial_days ?? days;
      setSavedTrialDays(d);
      setTrialDays(String(d));
      setTrialMsg({ type: 'ok', text: `Default trial is now ${d} days for new trials.` });
    } catch (error) {
      console.error('Failed to save trial settings:', error);
      setTrialMsg({ type: 'err', text: 'Could not save. Check your admin permissions and try again.' });
    } finally {
      setSavingTrial(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchTrialSettings();
  }, []);

  const handleExtendTrial = async (userId: string) => {
    const days = parseInt(daysByUser[userId] ?? '10', 10);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      console.error('Enter a number of days between 1 and 365');
      return;
    }
    try {
      await adminAPI.extendTrial(userId, days);
      fetchSubscriptions(); // Refresh the list
    } catch (error) {
      console.error('Failed to extend trial:', error);
    }
  };

  const filteredSubs = subscriptions.filter(sub => 
    sub.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  // A user still inside their trial window counts as active, even if the trial wasn't formally started
  const isActiveSub = (s: any) =>
    s.has_subscription &&
    (s.is_active || (s.is_trial && !!s.trial_end && new Date(s.trial_end) > new Date()));

  const getStatus = (s: any) => {
    if (!s.has_subscription) return { label: 'No subscription', ok: false };
    return isActiveSub(s) ? { label: 'Active', ok: true } : { label: 'Expired', ok: false };
  };

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(isActiveSub).length,
    trial: subscriptions.filter(s => isActiveSub(s) && s.is_trial).length,
    paid: subscriptions.filter(s => isActiveSub(s) && !s.is_trial).length,
    expired: subscriptions.filter(s => s.has_subscription && !isActiveSub(s)).length,
  };

  const statCards = [
    { label: 'Total Users', value: stats.total, icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'On Trial', value: stats.trial, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Paid', value: stats.paid, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Expired', value: stats.expired, icon: XCircle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Manage Subscriptions
          </h1>
          <p className="text-gray-500 mt-1">Monitor and control user billing, trials, and access.</p>
        </div>
      </div>

      {/* Default trial length */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="font-medium text-gray-900">Default trial length</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Applies automatically to new trials. Existing trials keep their current end date.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={365}
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
              className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">days</span>
            <button
              onClick={saveTrialSettings}
              disabled={savingTrial || trialDays === '' || Number(trialDays) === savedTrialDays}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savingTrial ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        {trialMsg && (
          <p className={`text-sm mt-3 ${trialMsg.type === 'ok' ? 'text-green-700' : 'text-red-700'}`}>
            {trialMsg.text}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <div
            key={label}
            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 ${
              i === statCards.length - 1 ? 'col-span-2 md:col-span-1' : ''
            }`}
          >
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{loading ? '–' : value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center mb-6">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Expiration Dates</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading subscriptions...
                  </td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub, idx) => (
                  <tr key={sub.user_id ?? idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{sub.user_email}</div>
                      <div className="text-gray-500 text-xs mt-0.5">Role: {sub.user_role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 font-medium">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {sub.status === 'active' || sub.status === 'trialing' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`capitalize font-medium ${
                          sub.status === 'active' || sub.status === 'trialing' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {sub.trial_end && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          Trial: {new Date(sub.trial_end).toLocaleDateString()}
                        </div>
                      )}
                      {sub.paid_end && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Paid: {new Date(sub.paid_end).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={daysByUser[sub.user_id] ?? '10'}
                          onChange={(e) =>
                            setDaysByUser((prev) => ({ ...prev, [sub.user_id]: e.target.value }))
                          }
                          className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleExtendTrial(sub.user_id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          <CalendarPlus className="w-4 h-4" />
                          Add Days
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500">
            Loading subscriptions...
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500">
            No subscriptions found.
          </div>
        ) : (
          filteredSubs.map((sub, idx) => {
            const status = getStatus(sub);
            return (
              <div
                key={sub.user_id ?? idx}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 break-all">{sub.user_email}</div>
                    <div className="text-gray-500 text-xs mt-0.5 capitalize">Role: {sub.user_role}</div>
                  </div>
                  <span className="capitalize bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 text-xs font-medium shrink-0">
                    {sub.plan}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-3">
                  {status.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${status.ok ? 'text-green-700' : 'text-red-700'}`}>
                    {status.label}
                  </span>
                </div>

                {(sub.trial_end || sub.paid_end) && (
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    {sub.trial_end && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Trial: {new Date(sub.trial_end).toLocaleDateString()}
                      </div>
                    )}
                    {sub.paid_end && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Paid: {new Date(sub.paid_end).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={daysByUser[sub.user_id] ?? '10'}
                    onChange={(e) =>
                      setDaysByUser((prev) => ({ ...prev, [sub.user_id]: e.target.value }))
                    }
                    className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleExtendTrial(sub.user_id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Add Days
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}