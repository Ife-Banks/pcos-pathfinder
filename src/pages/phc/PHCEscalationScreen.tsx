import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, AlertTriangle, CheckCircle, Clock, Search,
  ShieldAlert, ChevronDown, ChevronUp, X, ArrowLeft,
} from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { phcAPI } from '@/services/phcService';

const getTier = (score: number) => {
  if (score >= 75) return 'Critical';
  if (score >= 55) return 'High';
  if (score >= 35) return 'Moderate';
  return 'Low';
};

const getTierBg = (tier: string) => {
  const map: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    moderate: 'bg-amber-100 text-amber-800',
  };
  return map[tier.toLowerCase()] || 'bg-green-100 text-green-800';
};

interface QueueRecord {
  id: string;
  patient: { id: string; full_name: string; age?: number; bmi?: number };
  latest_score?: number;
  pcos_score?: number;
  hormonal_score?: number;
  metabolic_score?: number;
  condition_label?: string;
  tier?: string;
  status?: string;
}

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const urgencyOptions = [
  {
    value: 'urgent' as const,
    icon: ShieldAlert,
    title: 'Urgent',
    sub: 'Within 24 hours',
    desc: 'Requires immediate specialist attention',
    b: 'border-red-200', bg: 'bg-red-50', sb: 'border-red-500', sbg: 'bg-red-100', c: 'text-red-600',
  },
  {
    value: 'priority' as const,
    icon: ArrowUpRight,
    title: 'Priority',
    sub: 'Within 1 week',
    desc: 'Needs timely specialist review',
    b: 'border-orange-200', bg: 'bg-orange-50', sb: 'border-orange-500', sbg: 'bg-orange-100', c: 'text-orange-600',
  },
  {
    value: 'routine' as const,
    icon: Clock,
    title: 'Routine',
    sub: 'Within 2 weeks',
    desc: 'See specialist when available',
    b: 'border-yellow-200', bg: 'bg-yellow-50', sb: 'border-yellow-500', sbg: 'bg-yellow-100', c: 'text-yellow-600',
  },
];

export default function PHCEscalationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const prePopulated = location.state?.patient as QueueRecord | undefined;
  const queueRecordId = location.state?.queueRecordId as string | undefined;

  // Patient list state
  const [allPatients, setAllPatients] = useState<QueueRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Selected patient + form state
  const [patient, setPatient] = useState<QueueRecord | null>(prePopulated || null);
  const [fmcs, setFmcs] = useState<{ id: string; name: string; state?: string }[]>([]);
  const [selectedFmcId, setSelectedFmcId] = useState('');
  const [urgency, setUrgency] = useState<'urgent' | 'priority' | 'routine' | ''>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [attachPdf, setAttachPdf] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load patients + FMCs on mount
  useEffect(() => {
    async function load() {
      setLoadingPatients(true);
      try {
        const data = await phcAPI.getQueue({});
        const list: QueueRecord[] = Array.isArray(data)
          ? data
          : data?.data?.results || data?.data || [];
        setAllPatients(list);
      } catch {
        setAllPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    }
    load();

    phcAPI.getFMCs().then((data) => {
      const list = Array.isArray(data) ? data : data?.data || [];
      setFmcs(list);
      if (list.length > 0) setSelectedFmcId(list[0].id);
    }).catch(() => {});
  }, []);

  // Auto-fill reason when patient selected
  useEffect(() => {
    if (patient) {
      const tier = patient.tier || getTier(patient.latest_score || 0);
      const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      setReason(
        `PCOS Risk Score reached ${tier} tier on ${date}. Patient presents with ${patient.condition_label || 'complex presentation'}. Escalating for specialist evaluation.`
      );
    }
  }, [patient]);

  const filteredPatients = allPatients.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      r.patient?.full_name?.toLowerCase().includes(q) ||
      r.patient?.id?.toLowerCase().includes(q)
    );
  });

  const handleSubmit = async () => {
    if (!patient || !urgency || !selectedFmcId) {
      setError('Please select a patient, urgency level, and receiving FMC.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const id = queueRecordId || patient.id;
      const body = await phcAPI.escalateRecord(id, {
        fmc_id: selectedFmcId,
        urgency,
        reason,
        notes,
        attach_pdf: attachPdf,
      });
      if (body?.status === 'success' || body?.phc_record_id) {
        setShowSuccess(true);
      } else {
        throw new Error('Failed');
      }
    } catch {
      setError('Failed to send referral. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <PHCLayout>
        <div className="max-w-xl mx-auto py-16 text-center px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Referral sent</h2>
            <p className="text-gray-600 mb-2">
              {patient?.patient?.full_name} referred to{' '}
              {fmcs.find((f) => f.id === selectedFmcId)?.name} — {urgency} urgency
            </p>
            <p className="text-sm text-gray-500 mb-8">Patient notified ✓ · FMC notified ✓</p>
            <Button
              onClick={() => navigate('/phc/dashboard')}
              className="bg-[#2E8B57] hover:bg-green-700"
            >
              Return to Dashboard
            </Button>
          </motion.div>
        </div>
      </PHCLayout>
    );
  }

  // ── Main screen ─────────────────────────────────────────────────────────────
  return (
    <PHCLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 text-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Escalate to Federal Medical Centre</h1>
        <p className="text-gray-500 text-sm mb-6">Select a patient from your queue to refer to a specialist centre.</p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── Patient selector (hidden once a patient is selected) ── */}
        {!patient && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Label className="mb-3 block font-medium">Select Patient</Label>

              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Filter by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Patient list */}
              {loadingPatients ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-gray-200 rounded w-2/5" />
                        <div className="h-3 bg-gray-200 rounded w-3/5" />
                      </div>
                      <div className="w-14 h-5 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredPatients.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  {searchQuery ? 'No patients match your search.' : 'No patients in queue.'}
                </p>
              ) : (
                <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                  {filteredPatients.map((p) => {
                    const score = p.latest_score ?? 0;
                    const tier = p.tier || getTier(score);
                    return (
                      <div
                        key={p.id}
                        onClick={() => setPatient(p)}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-emerald-700">
                            {getInitials(p.patient?.full_name || '?')}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{p.patient?.full_name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            {p.patient?.age && <span>Age {p.patient.age}</span>}
                            {p.patient?.bmi && <span>BMI {p.patient.bmi}</span>}
                            {p.condition_label && <span>{p.condition_label}</span>}
                          </div>
                        </div>

                        {/* Score + tier */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-sm font-bold text-gray-800">{score}</span>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTierBg(tier)}`}>
                            {tier}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Selected patient card + referral form ── */}
        {patient && (
          <>
            {/* Patient summary card */}
            <Card className="mb-6 border-l-4 border-l-[#2E8B57]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-emerald-700">
                        {getInitials(patient.patient?.full_name || '?')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{patient.patient?.full_name}</h3>
                      <div className="flex gap-4 text-sm text-gray-500 mt-0.5">
                        {patient.patient?.age && <span>Age: {patient.patient.age}</span>}
                        {patient.patient?.bmi && <span>BMI: {patient.patient.bmi}</span>}
                        {patient.condition_label && <span>{patient.condition_label}</span>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setPatient(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Score breakdown */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {[
                    { l: 'PCOS', s: patient.pcos_score },
                    { l: 'Hormonal', s: patient.hormonal_score },
                    { l: 'Metabolic', s: patient.metabolic_score },
                  ].map(
                    (i) =>
                      i.s !== undefined && (
                        <div key={i.l} className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{i.l}:</span>
                          <span className="font-semibold">{i.s}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getTierBg(getTier(i.s))}`}>
                            {getTier(i.s)}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Referral form */}
            <Card className="mb-6">
              <CardContent className="p-4 space-y-5">

                {/* Reason */}
                <div>
                  <Label className="mb-2 block">Reason for Escalation</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Urgency */}
                <div>
                  <Label className="mb-3 block">Urgency Level <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-3 gap-3">
                    {urgencyOptions.map((o) => {
                      const Icon = o.icon;
                      return (
                        <button
                          key={o.value}
                          onClick={() => setUrgency(o.value)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            urgency === o.value ? `${o.sb} ${o.sbg}` : `${o.b} ${o.bg}`
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${o.c} mb-2`} />
                          <div className="font-semibold text-sm">{o.title}</div>
                          <div className="text-xs text-gray-400 mb-1">{o.sub}</div>
                          <div className="text-xs text-gray-500">{o.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clinical notes */}
                <div>
                  <Label className="mb-2 block">Clinical Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
                    placeholder="Additional observations from your assessment..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{notes.length}/1000</p>
                </div>

                {/* FMC selector */}
                <div>
                  <Label className="mb-2 block">Receiving FMC <span className="text-red-500">*</span></Label>
                  <Select value={selectedFmcId} onValueChange={setSelectedFmcId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Federal Medical Centre" />
                    </SelectTrigger>
                    <SelectContent>
                      {fmcs.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}{f.state ? ` — ${f.state}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Attach PDF */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox" id="pdf"
                    checked={attachPdf}
                    onChange={(e) => setAttachPdf(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded border-gray-300"
                  />
                  <Label htmlFor="pdf" className="text-sm cursor-pointer">
                    Attach AI-MSHM Clinical Summary PDF to referral
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Preview letter */}
            <div className="mb-6">
              <Button
                variant="link"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[#2E8B57] p-0 h-auto"
              >
                {showPreview
                  ? <><ChevronUp className="w-4 h-4 mr-1" />Hide Referral Letter</>
                  : <><ChevronDown className="w-4 h-4 mr-1" />Preview Referral Letter</>}
              </Button>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm space-y-1"
                >
                  <div className="text-center font-bold mb-3">AI-MSHM Referral Letter</div>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Patient:</strong> {patient.patient?.full_name} · Age: {patient.patient?.age || 'N/A'}</p>
                  <p><strong>Referring PHC:</strong> Surulere Primary Health Centre</p>
                  <p><strong>Receiving FMC:</strong> {fmcs.find((f) => f.id === selectedFmcId)?.name || 'Not selected'}</p>
                  <p><strong>Condition:</strong> {patient.condition_label || 'Complex presentation'}</p>
                  <p><strong>Risk Tier:</strong> {patient.tier || getTier(patient.latest_score || 0)}</p>
                  <p><strong>Urgency:</strong> {urgency || 'Not selected'}</p>
                  <p><strong>Reason:</strong> {reason}</p>
                  {notes && <p><strong>Notes:</strong> {notes}</p>}
                </motion.div>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || !urgency || !selectedFmcId}
              className="w-full bg-red-600 hover:bg-red-700 h-12 text-base font-semibold"
            >
              {submitting ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Sending...</>
              ) : (
                <><ArrowUpRight className="w-4 h-4 mr-2" />Send Referral & Notify Patient</>
              )}
            </Button>
          </>
        )}
      </div>
    </PHCLayout>
  );
}