import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Send, Calendar, Save, ArrowUpRight, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';
import {
  mockPatients, mockSymptomEntries, mockPCOSLabMarkers,
  mockHormonalMarkers, mockMetabolicMarkers, mockSentAdvice,
  mockAppointments, adviceTemplates, mockStaff
} from '@/data/phcMockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const tierBadge = (tier: string) => {
  switch (tier) {
    case 'Low': return 'bg-green-100 text-green-800';
    case 'Moderate': return 'bg-amber-100 text-amber-800';
    case 'High': return 'bg-red-100 text-red-700';
    case 'Critical': return 'bg-red-600 text-white';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const statusBadge = (status: string) => {
  switch (status) { case 'New': return 'bg-green-100 text-green-800'; case 'Under Review': return 'bg-amber-100 text-amber-800'; case 'Action Taken': return 'bg-blue-100 text-blue-800'; case 'Discharged': return 'bg-gray-100 text-gray-600'; default: return 'bg-gray-100 text-gray-600'; }
};

const labStatusColor = (s: string) => {
  switch (s) { case 'Normal': return 'text-green-600'; case 'Flagged': return 'text-amber-600'; case 'Critical': return 'text-red-600'; case 'Missing': return 'text-gray-400'; default: return 'text-gray-600'; }
};

const condGaugeColor = (cond: string) => {
  switch (cond) { case 'PCOS': return '#9333ea'; case 'Hormonal': return '#e11d48'; case 'Metabolic': return '#0d9488'; default: return '#6b7280'; }
};

export default function PHCPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const patient = mockPatients.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState(0);
  const [adviceCondition, setAdviceCondition] = useState<'PCOS' | 'Hormonal Health' | 'Metabolic Health'>('PCOS');
  const [adviceText, setAdviceText] = useState('');
  const [caseStatus, setCaseStatus] = useState(patient?.status || 'New');
  const [internalNotes, setInternalNotes] = useState('');
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  if (!patient) {
    return <PHCLayout><div className="p-12 text-center"><p className="text-gray-500">Patient not found</p></div></PHCLayout>;
  }

  const needsEscalation = ['High', 'Critical'].includes(patient.pcosTier) || ['High', 'Critical'].includes(patient.hormonalTier) || ['High', 'Critical'].includes(patient.metabolicTier);
  const escalationConditions = [
    ...((['High', 'Critical'].includes(patient.pcosTier)) ? [`PCOS: ${patient.pcosTier}`] : []),
    ...((['High', 'Critical'].includes(patient.hormonalTier)) ? [`Hormonal: ${patient.hormonalTier}`] : []),
    ...((['High', 'Critical'].includes(patient.metabolicTier)) ? [`Metabolic: ${patient.metabolicTier}`] : []),
  ];

  const tabs = ['Overview', 'Symptom Log', 'Clinical Data', 'Actions'];

  const ScoreGauge = ({ score, tier, color, label }: { score: number; tier: string; color: string; label: string }) => {
    const isLocked = ['High', 'Critical'].includes(tier);
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${isLocked ? 'border-red-200 bg-red-50' : ''}`}>
        {isLocked ? (
          <div className="text-center">
            <div className="w-[60px] h-[60px] rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <p className="text-sm font-semibold text-red-700">{label}</p>
            <span className={`${tierBadge(tier)} rounded-full px-2 py-0.5 text-[10px] font-semibold mt-1 inline-block`}>{tier}</span>
            <p className="text-xs text-red-600 mt-2">Escalation Required. Clinical details not accessible at PHC level.</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto mb-2" style={{ border: `4px solid ${color}`, color }}>
              <span className="text-lg font-bold">{score.toFixed(2)}</span>
            </div>
            <p className="text-sm font-semibold text-[#1E1E2E]">{label}</p>
            <span className={`${tierBadge(tier)} rounded-full px-2 py-0.5 text-[10px] font-semibold mt-1 inline-block`}>{tier}</span>
          </div>
        )}
      </div>
    );
  };

  const LabTable = ({ markers, panelName }: { markers: typeof mockPCOSLabMarkers; panelName: string }) => {
    const filled = markers.filter(m => m.status !== 'Missing').length;
    return (
      <div className="mb-4">
        <button onClick={() => setExpandedAccordion(expandedAccordion === panelName ? null : panelName)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-[#1E1E2E]">{panelName}</span>
            <span className="text-xs text-gray-500">{filled}/{markers.length} markers — {Math.round(filled / markers.length * 100)}%</span>
          </div>
          {expandedAccordion === panelName ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedAccordion === panelName && (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-gray-500 border-b"><th className="px-3 py-2">Biomarker</th><th className="px-3 py-2">Value</th><th className="px-3 py-2">Unit</th><th className="px-3 py-2">Ref Range</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Status</th></tr></thead>
              <tbody>
                {markers.map((m, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-3 py-2 font-medium">{m.name}</td>
                    <td className="px-3 py-2">{m.value ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{m.unit}</td>
                    <td className="px-3 py-2 text-gray-500">{m.referenceRange}</td>
                    <td className="px-3 py-2 text-gray-500">{m.dateCollected ?? '—'}</td>
                    <td className={`px-3 py-2 font-semibold ${labStatusColor(m.status)}`}>{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <PHCLayout>
      <button onClick={() => navigate('/phc/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#2E8B57] mb-4">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Escalation Banner */}
      {needsEscalation && (
        <div className="bg-red-600 text-white rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">⚠ {escalationConditions.join(', ')} — Escalation Required</p>
              <p className="text-sm text-red-100 mt-1">This patient's score exceeds the scope of Primary Health Centre management. This case must be escalated to a Federal Medical Centre immediately.</p>
              <button onClick={() => navigate(`/phc/refer/${patient.id}`)}
                className="mt-3 bg-white text-red-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-50 w-full sm:w-auto">
                Escalate to FMC Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4 sticky top-14 z-20">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E8B57] font-bold text-lg">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-[#1E1E2E]">{patient.firstName} {patient.lastName}</h2>
              <span className="text-sm text-gray-500">{patient.id}</span>
              <span className={`${statusBadge(patient.status)} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>{patient.status}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
              <span>Age {patient.age}</span>
              <span>BMI {patient.bmi}</span>
              <span>{patient.referralSource}</span>
            </div>
            <div className="flex gap-3 mt-2">
              {[
                { label: 'PCOS', score: patient.pcosScore, tier: patient.pcosTier, color: '#9333ea' },
                { label: 'Hormonal', score: patient.hormonalScore, tier: patient.hormonalTier, color: '#e11d48' },
                { label: 'Metabolic', score: patient.metabolicScore, tier: patient.metabolicTier, color: '#0d9488' },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-xs text-gray-600">{c.label}: </span>
                  {['High', 'Critical'].includes(c.tier) ? (
                    <span className={`${tierBadge(c.tier)} rounded-full px-1.5 py-0.5 text-[10px] font-semibold`}>ESC</span>
                  ) : (
                    <span className="text-xs font-semibold">{c.score.toFixed(2)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === i ? 'bg-[#E8F5E9] text-[#2E8B57]' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ScoreGauge score={patient.pcosScore} tier={patient.pcosTier} color="#9333ea" label="PCOS Score" />
              <ScoreGauge score={patient.hormonalScore} tier={patient.hormonalTier} color="#e11d48" label="Hormonal Score" />
              <ScoreGauge score={patient.metabolicScore} tier={patient.metabolicTier} color="#0d9488" label="Metabolic Score" />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Patient Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Last check-in:</span> <span className="font-medium">{patient.lastCheckIn || 'Never'}</span></div>
                <div><span className="text-gray-500">Registered:</span> <span className="font-medium">{patient.registeredAt}</span></div>
                <div><span className="text-gray-500">Assigned to:</span> <span className="font-medium">{patient.assignedTo || 'Unassigned'}</span></div>
                <div><span className="text-gray-500">Referral source:</span> <span className="font-medium">{patient.referralSource}</span></div>
              </div>
            </div>
          </>
        )}

        {activeTab === 1 && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Symptom Check-Ins (Last 30 Days)</h3>
              <div className="space-y-3">
                {mockSymptomEntries.map(e => (
                  <div key={e.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: condGaugeColor(e.conditionTrack) }} />
                        <span className="text-sm font-medium">{e.date} — {e.session}</span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{e.cyclePhase}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(e.scores).map(([k, v]) => (
                        <span key={k} className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-xs">
                          <span className="text-gray-500">{k}:</span> <span className="font-semibold">{v}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {patient.cycleDay && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Cycle Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-gray-500">Cycle day:</span> <span className="font-medium">{patient.cycleDay}</span></div>
                  <div><span className="text-gray-500">CLV:</span> <span className="font-medium">{patient.clv} days</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Last 4 durations:</span> <span className="font-medium">{patient.cycleDurations?.join(', ')} days</span></div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-[#1E1E2E] mb-4 border-l-4 border-[#2E8B57] pl-3">Clinical Data</h3>
            <LabTable markers={mockPCOSLabMarkers} panelName="PCOS Lab Markers" />
            <LabTable markers={mockHormonalMarkers} panelName="Hormonal Markers" />
            <LabTable markers={mockMetabolicMarkers} panelName="Metabolic Markers" />
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-4">
            {/* Section A — Lifestyle Advice */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Send Health Advice to Patient</h3>
              <div className="flex gap-2 mb-3">
                {(['PCOS', 'Hormonal Health', 'Metabolic Health'] as const).map(c => (
                  <button key={c} onClick={() => setAdviceCondition(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${adviceCondition === c ? 'bg-[#2E8B57] text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                {adviceTemplates[adviceCondition].map((t, i) => (
                  <button key={i} onClick={() => setAdviceText(prev => prev ? `${prev}\n\n${t}` : t)}
                    className="block w-full text-left text-xs text-gray-700 bg-gray-50 hover:bg-[#E8F5E9] border border-gray-100 rounded-lg px-3 py-2 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent outline-none resize-none"
                rows={4}
                maxLength={500}
                placeholder="Compose your advice..."
                value={adviceText}
                onChange={e => setAdviceText(e.target.value)}
              />
              <div className="flex justify-between items-center mt-1 mb-3">
                <span className="text-xs text-gray-400">{adviceText.length}/500</span>
              </div>
              <button onClick={() => { toast({ title: `Advice sent to ${patient.id}` }); setAdviceText(''); }}
                className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#256D46] flex items-center justify-center gap-2">
                <Send size={16} /> Send to Patient App
              </button>

              {mockSentAdvice.filter(a => a.patientId === patient.id).length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Sent Messages</h4>
                  {mockSentAdvice.filter(a => a.patientId === patient.id).map(a => (
                    <div key={a.id} className="border border-gray-50 rounded-lg p-2 mb-2 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">{a.sentAt.split('T')[0]}</span><span className={a.readByPatient ? 'text-green-600' : 'text-gray-400'}>{a.readByPatient ? 'Read' : 'Unread'}</span></div>
                      <p className="text-gray-700 mt-1">{a.message.slice(0, 80)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section B — Booking */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Book Follow-Up Appointment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] outline-none" />
                <input type="time" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] outline-none" />
              </div>
              <div className="flex gap-2 mt-3">
                {['In-Person', 'Phone Call', 'Home Visit'].map(t => (
                  <button key={t} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 hover:bg-[#E8F5E9] hover:border-[#2E8B57]">{t}</button>
                ))}
              </div>
              <button onClick={() => toast({ title: 'Appointment booked' })}
                className="mt-3 w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#256D46] flex items-center justify-center gap-2">
                <Calendar size={16} /> Book Appointment
              </button>
            </div>

            {/* Section C — Case Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Update Case Status</h3>
              <select value={caseStatus} onChange={e => {
                if (e.target.value === 'Discharged') { setShowDischargeModal(true); }
                else setCaseStatus(e.target.value);
              }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] outline-none">
                {['New', 'Under Review', 'Action Taken', 'Discharged'].map(s => <option key={s}>{s}</option>)}
              </select>
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-3 focus:ring-2 focus:ring-[#2E8B57] outline-none resize-none" rows={3} maxLength={1000} placeholder="Internal PHC notes (not visible to patient)..." value={internalNotes} onChange={e => setInternalNotes(e.target.value)} />
              <button onClick={() => toast({ title: 'Case updated' })}
                className="mt-3 w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#256D46] flex items-center justify-center gap-2">
                <Save size={16} /> Save Changes
              </button>
            </div>

            {/* Section D — Escalation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3 border-l-4 border-[#2E8B57] pl-3">Escalate to Federal Medical Centre</h3>
              <button onClick={() => navigate(`/phc/refer/${patient.id}`)}
                className="w-full border border-[#2E8B57] text-[#2E8B57] rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#E8F5E9] flex items-center justify-center gap-2">
                <ArrowUpRight size={16} /> Go to Referral Form →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discharge Modal */}
      {showDischargeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-[#1E1E2E] mb-2">Confirm Discharge</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to discharge this patient? This will mark the case as resolved at PHC level.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDischargeModal(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => { setCaseStatus('Discharged'); setShowDischargeModal(false); toast({ title: 'Patient discharged' }); }}
                className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium">Confirm Discharge</button>
            </div>
          </div>
        </div>
      )}
    </PHCLayout>
  );
}
