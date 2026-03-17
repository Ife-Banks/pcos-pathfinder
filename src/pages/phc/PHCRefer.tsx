import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';
import { mockPatients, mockFMCs, mockStaff } from '@/data/phcMockData';

const tierBadge = (tier: string) => {
  switch (tier) { case 'Low': return 'bg-green-100 text-green-800'; case 'Moderate': return 'bg-amber-100 text-amber-800'; case 'High': return 'bg-red-100 text-red-700'; case 'Critical': return 'bg-red-600 text-white'; default: return 'bg-gray-100 text-gray-600'; }
};

export default function PHCRefer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(id || '');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [selectedFMC, setSelectedFMC] = useState('');
  const [specialists, setSpecialists] = useState<string[]>([]);
  const [attachSummary, setAttachSummary] = useState(true);
  const [editLetter, setEditLetter] = useState(false);
  const [letterOverride, setLetterOverride] = useState('');
  const [success, setSuccess] = useState(false);

  const patient = mockPatients.find(p => p.id === selectedPatient);
  const fmc = mockFMCs.find(f => f.id === selectedFMC);

  useEffect(() => {
    if (patient) {
      const conditions: string[] = [];
      if (['High', 'Critical'].includes(patient.pcosTier)) conditions.push(`PCOS: ${patient.pcosTier}`);
      if (['High', 'Critical'].includes(patient.hormonalTier)) conditions.push(`Hormonal: ${patient.hormonalTier}`);
      if (['High', 'Critical'].includes(patient.metabolicTier)) conditions.push(`Metabolic: ${patient.metabolicTier}`);
      if (conditions.length > 0) {
        setReason(`AI-MSHM Risk Score has reached ${conditions.join(', ')} tier. Clinical review at a Federal Medical Centre level is required.`);
      }
    }
  }, [patient]);

  const urgencyLabel = urgency === 'urgent' ? 'Urgent — Within 24 hours' : urgency === 'priority' ? 'Priority — Within 1 week' : urgency === 'routine' ? 'Routine — Within 2 weeks' : '';
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const letterContent = `${today}\n${mockStaff.facilityName}\n${mockStaff.facilityAddress}\n\nTo: The Medical Officer,\n${fmc?.name || '[Select FMC]'}\n\nRe: Referral of Patient ${patient?.id || '[Patient ID]'} — ${urgencyLabel || '[Urgency Level]'} Referral\n\nDear Doctor,\n\nWe are referring the above-named patient (Age: ${patient?.age || 'N/A'}, BMI: ${patient?.bmi || 'N/A'}) from ${mockStaff.facilityName} to your facility for specialist evaluation.\n\nThe AI-MSHM system has flagged concerning risk scores which exceed the clinical management scope of a Primary Health Centre.\n\nReason for Referral: ${reason || '[Not specified]'}\n\nPHC Assessment & Actions Taken: ${clinicalNotes || '[Not specified]'}\n\nWe respectfully request that this patient be reviewed by a ${specialists.join(', ') || '[Specialist]'} at your earliest convenience.\n\nYours sincerely,\n${mockStaff.firstName} ${mockStaff.lastName}\n${mockStaff.id}\n${mockStaff.facilityName}`;

  if (success) {
    return (
      <PHCLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <CheckCircle2 size={64} className="mx-auto text-[#2E8B57] mb-4" />
          <h2 className="text-xl font-semibold text-[#1E1E2E] mb-2">Referral Sent Successfully</h2>
          <p className="text-sm text-gray-500 mb-2">Patient {patient?.id} has been referred to {fmc?.name}</p>
          <p className="text-sm text-gray-500 mb-6">with {urgencyLabel} priority</p>
          <p className="text-sm text-green-600 mb-6">The patient has been notified via the AI-MSHM app</p>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/phc/patients/${patient?.id}`)} className="flex-1 bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium">View Patient Record</button>
            <button onClick={() => { setSuccess(false); setSelectedPatient(''); setReason(''); }} className="flex-1 border border-[#2E8B57] text-[#2E8B57] rounded-lg px-4 py-2.5 text-sm font-medium">Refer Another</button>
          </div>
        </div>
      </PHCLayout>
    );
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent outline-none";

  return (
    <PHCLayout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#2E8B57] mb-4">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3 mb-6">Escalate Patient to Federal Medical Centre</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select className={inputCls} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
              <option value="">Select patient...</option>
              {mockPatients.map(p => <option key={p.id} value={p.id}>{p.id} — {p.firstName} {p.lastName}</option>)}
            </select>
          </div>

          {patient && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span><span className="text-gray-500">Name:</span> {patient.firstName} {patient.lastName}</span>
                <span><span className="text-gray-500">Age:</span> {patient.age}</span>
                <span><span className="text-gray-500">BMI:</span> {patient.bmi}</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[
                  { label: 'PCOS', tier: patient.pcosTier },
                  { label: 'Hormonal', tier: patient.hormonalTier },
                  { label: 'Metabolic', tier: patient.metabolicTier },
                ].map(c => (
                  <span key={c.label} className={`${tierBadge(c.tier)} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>{c.label}: {c.tier}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Escalation</label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={reason} onChange={e => setReason(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
            <div className="space-y-2">
              {[
                { value: 'urgent', icon: '🔴', label: 'Urgent — Within 24 hours' },
                { value: 'priority', icon: '🟠', label: 'Priority — Within 1 week' },
                { value: 'routine', icon: '🟡', label: 'Routine — Within 2 weeks' },
              ].map(u => (
                <button key={u.value} onClick={() => setUrgency(u.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${urgency === u.value ? 'bg-[#E8F5E9] border-[#2E8B57]' : 'border-gray-200 hover:bg-gray-50'}`}>
                  {u.icon} {u.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PHC Clinical Notes</label>
            <textarea className={`${inputCls} resize-none`} rows={3} maxLength={1000} value={clinicalNotes} onChange={e => setClinicalNotes(e.target.value)} placeholder="Clinical observations and actions taken..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiving FMC</label>
            <select className={inputCls} value={selectedFMC} onChange={e => setSelectedFMC(e.target.value)}>
              <option value="">Select Federal Medical Centre...</option>
              {mockFMCs.map(f => <option key={f.id} value={f.id}>{f.name} — {f.distance}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialist Requested</label>
            <div className="flex flex-wrap gap-2">
              {['Gynaecologist', 'Endocrinologist', 'Internal Medicine', 'General Physician', 'Other'].map(s => (
                <button key={s} onClick={() => setSpecialists(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${specialists.includes(s) ? 'bg-[#2E8B57] text-white border-[#2E8B57]' : 'text-gray-600 border-gray-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={attachSummary} onChange={e => setAttachSummary(e.target.checked)} className="accent-[#2E8B57]" />
            <span className="text-sm text-gray-700">Attach AI-MSHM Clinical Summary PDF</span>
          </label>

          <button onClick={() => setSuccess(true)} disabled={!selectedPatient || !urgency || !selectedFMC}
            className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#256D46] disabled:opacity-50">
            Send Referral & Notify Patient
          </button>
        </div>

        {/* Right — Letter Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1E1E2E]">Referral Letter Preview</h3>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={editLetter} onChange={e => { setEditLetter(e.target.checked); setLetterOverride(letterContent); }} className="accent-[#2E8B57]" />
              Edit Letter
            </label>
          </div>
          {editLetter ? (
            <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-serif leading-relaxed resize-none min-h-[400px] focus:ring-2 focus:ring-[#2E8B57] outline-none"
              value={letterOverride} onChange={e => setLetterOverride(e.target.value)} />
          ) : (
            <div className="border border-gray-200 rounded-xl p-6 font-serif text-sm leading-relaxed whitespace-pre-wrap text-[#1E1E2E]">
              {letterContent}
            </div>
          )}
        </div>
      </div>
    </PHCLayout>
  );
}
