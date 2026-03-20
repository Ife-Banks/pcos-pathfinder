import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, AlertTriangle, CheckCircle, Clock, Search, ShieldAlert, ChevronDown, ChevronUp, X, ArrowLeft } from 'lucide-react';
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
  const map: Record<string, string> = { critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800', moderate: 'bg-amber-100 text-amber-800' };
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
}

export default function PHCEscalationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const prePopulated = location.state?.patient as QueueRecord | undefined;
  const queueRecordId = location.state?.queueRecordId as string | undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<QueueRecord[]>([]);
  const [patient, setPatient] = useState<QueueRecord | null>(prePopulated || null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [urgency, setUrgency] = useState<'urgent' | 'priority' | 'routine' | ''>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [attachPdf, setAttachPdf] = useState(true);
  const [fmc, setFmc] = useState<{ id: string; name: string; state?: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFMCs = async () => {
      try {
        const data = await phcAPI.getFMCs();
        const fmcData = Array.isArray(data) ? data : (data?.data || []);
        if (fmcData.length > 0) setFmc(fmcData[0]);
      } catch { }
    };
    loadFMCs();
  }, []);

  useEffect(() => {
    if (patient) {
      const tier = patient.tier || getTier(patient.latest_score || 0);
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      setReason(`PCOS Risk Score reached ${tier} tier on ${date}. Patient presents with ${patient.condition_label || 'complex presentation'}. Escalating for specialist evaluation.`);
    }
  }, [patient]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await phcAPI.getQueue({});
      const allRecords: QueueRecord[] = Array.isArray(data) ? data : (data?.data?.results || data?.data || []);
      const q = searchQuery.toLowerCase();
      const records = allRecords.filter((r: QueueRecord) =>
        r.patient?.full_name?.toLowerCase().includes(q) || r.patient?.id?.toLowerCase().includes(q)
      );
      setResults(records);
    } catch { setError('Search failed.'); }
    finally { setLoading(false); }
  };

  const selectPatient = (p: QueueRecord) => { setPatient(p); setSearchQuery(''); setResults([]); };
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const urgencyOptions = [
    { value: 'urgent' as const, icon: ShieldAlert, title: 'Urgent', sub: 'Within 24 hours', desc: 'Patient requires immediate specialist attention', b: 'border-red-200', bg: 'bg-red-50', sb: 'border-red-500', sbg: 'bg-red-100', c: 'text-red-600' },
    { value: 'priority' as const, icon: ArrowUpRight, title: 'Priority', sub: 'Within 1 week', desc: 'Patient needs timely specialist review', b: 'border-orange-200', bg: 'bg-orange-50', sb: 'border-orange-500', sbg: 'bg-orange-100', c: 'text-orange-600' },
    { value: 'routine' as const, icon: Clock, title: 'Routine', sub: 'Within 2 weeks', desc: 'Patient should see specialist when available', b: 'border-yellow-200', bg: 'bg-yellow-50', sb: 'border-yellow-500', sbg: 'bg-yellow-100', c: 'text-yellow-600' },
  ];

  const handleSubmit = async () => {
    if (!patient || !urgency || !fmc) { setError('Please fill in all required fields.'); return; }
    setSubmitting(true);
    try {
      const id = queueRecordId || patient.id;
      const body = await phcAPI.escalateRecord(id, { fmc_id: fmc.id, urgency, reason, notes, attach_pdf: attachPdf });
      if (body?.status === 'success' || body?.phc_record_id) {
        setShowSuccess(true);
      } else {
        throw new Error('Failed');
      }
    } catch { setError('Failed to send referral.'); }
    finally { setSubmitting(false); }
  };

  if (showSuccess) {
    return (
      <PHCLayout>
        <div className="max-w-xl mx-auto py-16 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Referral sent successfully</h2>
            <p className="text-gray-600 mb-2">{patient?.patient?.full_name} referred to {fmc?.name} — {urgency} urgency</p>
            <p className="text-sm text-gray-500 mb-8">Patient notified ✓ · FMC notified ✓</p>
            <Button onClick={() => navigate('/phc/dashboard')} className="bg-[#2E8B57] hover:bg-green-700">Return to Dashboard</Button>
          </motion.div>
        </div>
      </PHCLayout>
    );
  }

  return (
    <PHCLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Escalate to Federal Medical Centre</h1>
        <p className="text-gray-600 mb-6">Refer this patient to a specialist for advanced care.</p>

        {error && <Alert variant="destructive" className="mb-6"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        {!patient && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Label className="mb-2 block">Search for Patient</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search by name or patient ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-10" />
                </div>
                <Button onClick={handleSearch} disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
              </div>
              {results.length > 0 && (
                <div className="mt-3 border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {results.map(p => (
                    <div key={p.id} onClick={() => selectPatient(p)} className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-700">{getInitials(p.patient?.full_name || '')}</span>
                      </div>
                      <div>
                        <p className="font-medium">{p.patient?.full_name}</p>
                        <p className="text-sm text-gray-500">ID: {p.patient?.id} · Score: {p.latest_score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {patient && (
          <>
            <Card className="mb-6 border-l-4 border-l-[#2E8B57]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-green-700">{getInitials(patient.patient?.full_name || '')}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{patient.patient?.full_name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        {patient.patient?.age && <span>Age: {patient.patient.age}</span>}
                        {patient.patient?.bmi && <span>BMI: {patient.patient.bmi}</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setPatient(null)} className="text-gray-400"><X className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {[{ l: 'PCOS', s: patient.pcos_score }, { l: 'Hormonal', s: patient.hormonal_score }, { l: 'Metabolic', s: patient.metabolic_score }].map(i => i.s !== undefined && (
                    <div key={i.l} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{i.l}:</span>
                      <span className="font-medium">{i.s}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getTierBg(getTier(i.s))}`}>{getTier(i.s)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">Referring PHC: Surulere Primary Health Centre</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label className="mb-2 block">Reason for Escalation</Label>
                  <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="resize-none" />
                </div>

                <div>
                  <Label className="mb-3 block">Urgency Level</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {urgencyOptions.map(o => {
                      const Icon = o.icon;
                      return (
                        <button key={o.value} onClick={() => setUrgency(o.value)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${urgency === o.value ? `${o.sb} ${o.sbg}` : `${o.b} ${o.bg}`}`}>
                          <Icon className={`w-6 h-6 ${o.c} mb-2`} />
                          <div className="font-semibold">{o.title}</div>
                          <div className="text-xs text-gray-500 mb-1">{o.sub}</div>
                          <div className="text-xs text-gray-600">{o.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Clinical Notes</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value.slice(0, 1000))}
                    placeholder="Add any additional observations from your assessment (optional)..." rows={3} className="resize-none" />
                  <p className="text-xs text-gray-400 mt-1 text-right">{notes.length}/1000</p>
                </div>

                <div>
                  <Label className="mb-2 block">Receiving FMC</Label>
                  <Select value={fmc?.id} onValueChange={id => setFmc(fmc || { id, name: '' })}>
                    <SelectTrigger><SelectValue placeholder="Select FMC" /></SelectTrigger>
                    <SelectContent>
                      {fmc && <SelectItem value={fmc.id}>{fmc.name}{fmc.state ? ` - ${fmc.state}` : ''}</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pdf" checked={attachPdf} onChange={e => setAttachPdf(e.target.checked)} className="w-4 h-4 text-green-600 rounded border-gray-300" />
                  <Label htmlFor="pdf" className="text-sm cursor-pointer">Attach AI-MSHM Clinical Summary PDF to referral ✓</Label>
                </div>
              </CardContent>
            </Card>

            <div className="mb-6">
              <Button variant="link" onClick={() => setShowPreview(!showPreview)} className="text-[#2E8B57] p-0 h-auto">
                {showPreview ? <><ChevronUp className="w-4 h-4 mr-1" />Hide Referral Letter</> : <><ChevronDown className="w-4 h-4 mr-1" />Preview Referral Letter</>}
              </Button>
              {showPreview && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
                  <div className="text-center font-bold mb-4">AI-MSHM Referral Letter</div>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Patient:</strong> {patient.patient?.full_name} | Age: {patient.patient?.age || 'N/A'} | ID: {patient.patient?.id}</p>
                  <p><strong>Referring PHC:</strong> Surulere Primary Health Centre</p>
                  <p><strong>Receiving FMC:</strong> {fmc?.name || 'Not selected'}</p>
                  <p><strong>Condition:</strong> {patient.condition_label || 'Complex presentation'}</p>
                  <p><strong>Risk Tier:</strong> {patient.tier || getTier(patient.latest_score || 0)}</p>
                  <p><strong>Urgency:</strong> {urgency || 'Not selected'}</p>
                  <p><strong>Reason:</strong> {reason}</p>
                  <p><strong>Clinical Notes:</strong> {notes || 'None'}</p>
                </motion.div>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={submitting || !urgency || !fmc}
              className="w-full bg-red-600 hover:bg-red-700 h-12 text-base font-semibold">
              {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Sending...</> : <><ArrowUpRight className="w-4 h-4 mr-2" />Send Referral & Notify Patient</>}
            </Button>
          </>
        )}
      </div>
    </PHCLayout>
  );
}
