import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Activity, Stethoscope, MessageCircle, AlertTriangle,
  Clock, Calendar, Send, ChevronRight, ShieldAlert, CheckCircle, X,
  AlertCircle
} from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import apiClient from '@/services/apiClient';

const getTier = (score: number): string => {
  if (score >= 75) return 'critical';
  if (score >= 55) return 'high';
  if (score >= 35) return 'moderate';
  return 'low';
};

const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'critical': return '#922B21';
    case 'high': return '#E74C3C';
    case 'moderate': return '#E67E22';
    case 'low': return '#27AE60';
    default: return '#9CA3AF';
  }
};

const getTierBgColor = (tier: string): string => {
  switch (tier) {
    case 'critical': return 'bg-red-100 text-red-900';
    case 'high': return 'bg-red-100 text-red-700';
    case 'moderate': return 'bg-amber-100 text-amber-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getSeverityBgColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'bg-red-600 text-white';
    case 'high': return 'bg-red-100 text-red-700';
    case 'moderate': return 'bg-amber-100 text-amber-800';
    case 'low': case 'mild': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusBgColor = (status: string): string => {
  switch (status) {
    case 'new': return 'bg-amber-100 text-amber-800';
    case 'under_review': return 'bg-blue-100 text-blue-800';
    case 'action_taken': return 'bg-green-100 text-green-800';
    case 'discharged': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (d: string | undefined) => {
  if (!d) return '--';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ensureResponseSuccess = (body: any) => {
  if (body?.status && body.status !== 'success') {
    throw body;
  }
  return body;
};

export default function PHCPatientDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'symptoms' | 'clinical' | 'actions'>('overview');

  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const [statusValue, setStatusValue] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');
  const [updating, setUpdating] = useState(false);

  const [escalateOpen, setEscalateOpen] = useState(false);
  const [urgency, setUrgency] = useState<'routine' | 'priority' | 'urgent'>('priority');
  const [escalateNotes, setEscalateNotes] = useState('');
  const [escalating, setEscalating] = useState(false);
  const [escalatedFmc, setEscalatedFmc] = useState<string | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [dischargeReason, setDischargeReason] = useState('');
  const [discharging, setDischarging] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRecord = useCallback(async () => {
    if (!id) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/phc/login');
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get(`/centers/phc/queue/${id}/`);
      const body = ensureResponseSuccess(res.data);
      const data = (body.data ?? body) as Record<string, unknown>;
      setRecord(data);
      setNotes((data.notes as string) || '');
      setStatusValue((data.status as string) || '');
      setNextFollowup((data.next_followup as string) || '');
      if (data.status === 'escalated') {
        setEscalatedFmc('FMC');
      }
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/phc/login');
        return;
      }
      setError(err?.message || 'Failed to load patient record. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  const saveNotes = async () => {
    if (!id) return;
    setNotesSaving(true);
    try {
      const res = await apiClient.patch(`/centers/phc/queue/${id}/`, { notes });
      ensureResponseSuccess(res.data);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save notes.', 'error');
    } finally {
      setNotesSaving(false);
    }
  };

  const updateRecord = async (updates: Record<string, unknown>) => {
    if (!id) return;
    setUpdating(true);
    try {
      const res = await apiClient.patch(`/centers/phc/queue/${id}/`, updates);
      ensureResponseSuccess(res.data);
      if (updates.status) setStatusValue(updates.status as string);
      if (updates.next_followup !== undefined) setNextFollowup(updates.next_followup as string);
      if (updates.status === 'action_taken') {
        showToast('Status updated to Action Taken.', 'success');
      }
      await fetchRecord();
    } catch (err: any) {
      showToast(err?.message || 'Update failed.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleEscalate = async () => {
    if (!id) return;
    const token = localStorage.getItem('access_token');
    setEscalating(true);
    try {
      const res = await apiClient.post(`/centers/phc/queue/${id}/escalate/`, { urgency, notes: escalateNotes });
      const body = ensureResponseSuccess(res.data);
      setEscalateOpen(false);
      setEscalatedFmc((body.data?.fmc_name as string) || 'FMC');
      showToast(body.message || 'Patient escalated successfully.', 'success');
      await fetchRecord();
      setTimeout(() => navigate('/phc/dashboard'), 2000);
    } catch (err: any) {
      showToast(err?.message || 'Escalation failed.', 'error');
    } finally {
      setEscalating(false);
    }
  };

  const handleDischarge = async () => {
    if (!id) return;
    const token = localStorage.getItem('access_token');
    setDischarging(true);
    try {
      const res = await apiClient.patch(`/centers/phc/queue/${id}/`, {
        status: 'discharged',
        notes: dischargeReason,
      });
      ensureResponseSuccess(res.data);
      setDischargeOpen(false);
      showToast('Patient discharged.', 'success');
      await fetchRecord();
      setTimeout(() => navigate('/phc/dashboard'), 1500);
    } catch (err: any) {
      showToast(err?.message || 'Discharge failed.', 'error');
    } finally {
      setDischarging(false);
    }
  };

  const statusOptions = [
    { value: 'under_review', label: 'Under Review' },
    { value: 'action_taken', label: 'Action Taken' },
  ];

  const urgencyOptions = [
    { value: 'routine', label: 'Routine', color: 'bg-yellow-50 border-yellow-200', selectedColor: 'border-yellow-400 bg-yellow-100', icon: '🟡', desc: 'Within 2 weeks' },
    { value: 'priority', label: 'Priority', color: 'bg-orange-50 border-orange-200', selectedColor: 'border-orange-400 bg-orange-100', icon: '🟠', desc: 'Within 1 week' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-50 border-red-200', selectedColor: 'border-red-400 bg-red-100', icon: '🔴', desc: 'Within 24 hours' },
  ];

  if (loading) {
    return (
      <PHCLayout>
        <div className="flex items-center justify-center h-64">
          <Activity className="w-8 h-8 animate-spin text-[#2E8B57]" />
        </div>
      </PHCLayout>
    );
  }

  if (error || !record) {
    return (
      <PHCLayout>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/phc/dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-800 font-medium">{error || 'Record not found.'}</p>
              <Button onClick={fetchRecord} className="mt-4 bg-[#2E8B57]">Retry</Button>
            </CardContent>
          </Card>
        </div>
      </PHCLayout>
    );
  }

  const patient = record.patient as { id: string; full_name: string; email: string } | undefined;
  const condition = (record.condition as string) || '';
  const conditionLabel = (record.condition_label as string) || condition;
  const severity = (record.severity as string) || 'low';
  const severityLabel = (record.severity_label as string) || severity;
  const status = (record.status as string) || 'new';
  const statusLabel = (record.status_label as string) || status;
  const latestScore = (record.latest_score as number) ?? 0;
  const openingScore = (record.opening_score as number) ?? latestScore;
  const tier = getTier(latestScore);
  const showEscalationBanner = severity === 'high' || severity === 'critical';
  const initials = (patient?.full_name || 'UN').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: User },
    { id: 'symptoms' as const, label: 'Notes', icon: Activity },
    { id: 'clinical' as const, label: 'Clinical Data', icon: Stethoscope },
    { id: 'actions' as const, label: 'Actions', icon: MessageCircle },
  ];

  return (
    <PHCLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          >
            {toast.msg}
          </motion.div>
        )}

        <Button variant="ghost" onClick={() => navigate('/phc/dashboard')} className="mb-4 text-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        {showEscalationBanner && (
          <Card className="mb-6 bg-red-50 border-red-300">
            <CardContent className="flex items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-sm font-medium">
                  This patient has a {conditionLabel} score at <span className="font-bold capitalize">{tier}</span> tier. Escalate to FMC immediately.
                </p>
              </div>
              {!escalatedFmc && (
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-100 flex-shrink-0"
                  onClick={() => setEscalateOpen(true)}
                >
                  Escalate to FMC
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 bg-white border-l-4 border-l-[#2E8B57] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#2E8B57] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{patient?.full_name || 'Patient'}</h1>
                  <p className="text-gray-600 text-sm">{patient?.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Referred: {formatDate(record.opened_at as string)} · {(record.hcc as string) || 'PHC'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityBgColor(severity)}`}>
                  {severityLabel}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBgColor(status)}`}>
                  {statusLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-5 items-center">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                <span className="font-semibold text-gray-700">{conditionLabel}:</span>
                <span className="font-bold text-2xl" style={{ color: getTierColor(tier) }}>{latestScore}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getTierBgColor(tier)}`}>{tier}</span>
              </div>
              {openingScore !== latestScore && (
                <span className="text-xs text-gray-500">
                  Opened at {openingScore} → now {latestScore}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tabId
                  ? 'bg-white shadow text-[#2E8B57]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Case Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Condition', value: conditionLabel },
                    { label: 'Severity', value: severityLabel, badge: getSeverityBgColor(severity) },
                    { label: 'Risk Score', value: `${latestScore} (${tier})` },
                    { label: 'Opened At', value: formatDate(record.opened_at as string) },
                    { label: 'Last Advice', value: record.last_advice_at ? formatDate(record.last_advice_at as string) : 'None' },
                    { label: 'Next Follow-up', value: nextFollowup ? formatDate(nextFollowup) : 'Not scheduled' },
                    { label: 'Status', value: statusLabel, badge: getStatusBgColor(status) },
                  ].map(({ label, value, badge }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{label}</span>
                      {badge ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge}`}>{value}</span>
                      ) : (
                        <span className="font-medium text-gray-900">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Score History</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Opening Score</p>
                    <p className="text-3xl font-bold" style={{ color: getTierColor(getTier(openingScore)) }}>{openingScore}</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <svg width="80" height="40">
                      <line x1="0" y1="20" x2="80" y2="20" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4" />
                      <polygon points="70,15 80,20 70,25" fill="#9CA3AF" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Current Score</p>
                    <p className="text-3xl font-bold" style={{ color: getTierColor(tier) }}>{latestScore}</p>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${latestScore > openingScore ? 'bg-red-100 text-red-700' : latestScore < openingScore ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {latestScore > openingScore ? `+${latestScore - openingScore}` : latestScore < openingScore ? `${latestScore - openingScore}` : '0'} pts
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'symptoms' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#2E8B57]" /> Clinical Notes
                </h3>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-48"
                  placeholder="Enter clinical notes about this patient..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{notes.length}/1000</span>
                  <div className="flex items-center gap-2">
                    {notesSaved && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Saved</span>}
                    <Button
                      className="bg-[#2E8B57] hover:bg-[#246B47]"
                      onClick={saveNotes}
                      disabled={notesSaving}
                    >
                      {notesSaving ? 'Saving...' : 'Save Notes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'clinical' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Assessment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Condition', value: conditionLabel },
                    { label: 'Opening Score', value: String(openingScore) },
                    { label: 'Latest Score', value: String(latestScore) },
                    { label: 'Severity', value: severityLabel, badge: getSeverityBgColor(severity) },
                    { label: 'Status', value: statusLabel, badge: getStatusBgColor(status) },
                    { label: 'Next Follow-up', value: nextFollowup ? formatDate(nextFollowup) : 'Not set' },
                  ].map(({ label, value, badge }) => (
                    <div key={label} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      {badge ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge}`}>{value}</span>
                      ) : (
                        <p className="font-semibold text-gray-900">{value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 bg-gray-50 border border-dashed border-gray-300">
              <CardContent className="p-6 text-center text-gray-500 text-sm">
                Full clinical data (lab results, ultrasound) available after lab integration.
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'actions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Update Status</h3>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {statusOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateRecord({ status: opt.value })}
                        disabled={updating || status === opt.value || status === 'discharged' || status === 'escalated'}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          status === opt.value
                            ? 'border-[#2E8B57] bg-[#2E8B57] text-white'
                            : 'border-gray-300 text-gray-600 hover:border-[#2E8B57]'
                        } disabled:opacity-40`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {updating && <Activity className="w-4 h-4 animate-spin text-[#2E8B57]" />}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#2E8B57]" /> Schedule Follow-Up
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <Input
                    type="date"
                    className="w-auto"
                    value={nextFollowup ? nextFollowup.split('T')[0] : ''}
                    onChange={e => setNextFollowup(e.target.value)}
                  />
                  {[7, 14, 28].map(d => (
                    <button
                      key={d}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
                      onClick={() => {
                        const dt = new Date();
                        dt.setDate(dt.getDate() + d);
                        setNextFollowup(dt.toISOString().split('T')[0]);
                      }}
                    >
                      +{d}d
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    className="border-[#2E8B57] text-[#2E8B57]"
                    onClick={() => updateRecord({ next_followup: nextFollowup || null })}
                    disabled={updating}
                  >
                    {updating ? 'Saving...' : 'Save Follow-up'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {escalatedFmc ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Escalated to {escalatedFmc}</p>
                      <p className="text-sm text-green-700">Patient has been referred to the Federal Medical Centre.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Escalate to FMC
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Escalation sends this case to the Federal Medical Centre for specialist review.
                  </p>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-100"
                    onClick={() => setEscalateOpen(true)}
                  >
                    Escalate Patient →
                  </Button>
                </CardContent>
              </Card>
            )}

            {status !== 'discharged' && status !== 'escalated' && (
              <Card className="bg-white">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Discharge Patient</h3>
                  <p className="text-sm text-gray-500 mb-4">Remove this patient from the active queue.</p>
                  <Button
                    variant="outline"
                    className="border-gray-400 text-gray-600"
                    onClick={() => setDischargeOpen(true)}
                  >
                    Discharge Patient
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>

      <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" /> Escalate to FMC
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Urgency Level</Label>
              <div className="space-y-2">
                {urgencyOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setUrgency(opt.value as typeof urgency)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left ${urgency === opt.value ? opt.selectedColor : opt.color}`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs opacity-70">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Clinical Notes (optional)</Label>
              <textarea
                className="w-full p-2 border rounded text-sm h-24 resize-none"
                placeholder="Additional observations..."
                value={escalateNotes}
                onChange={e => setEscalateNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleEscalate}
              disabled={escalating}
            >
              {escalating ? 'Escalating...' : 'Send Referral'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dischargeOpen} onOpenChange={setDischargeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discharge Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">This will mark the patient as discharged and remove them from the active queue.</p>
            <div>
              <Label className="text-sm font-medium mb-1 block">Reason (optional)</Label>
              <textarea
                className="w-full p-2 border rounded text-sm h-20 resize-none"
                placeholder="Enter discharge reason..."
                value={dischargeReason}
                onChange={e => setDischargeReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDischargeOpen(false)}>Cancel</Button>
            <Button
              className="bg-gray-600 hover:bg-gray-700"
              onClick={handleDischarge}
              disabled={discharging}
            >
              {discharging ? 'Discharging...' : 'Confirm Discharge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PHCLayout>
  );
}
