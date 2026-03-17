import { useState } from 'react';
import { Send, X } from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';
import { mockPatients, adviceTemplates, mockSentAdvice } from '@/data/phcMockData';
import { useToast } from '@/hooks/use-toast';

export default function PHCAdvice() {
  const { toast } = useToast();
  const [condition, setCondition] = useState<'PCOS' | 'Hormonal Health' | 'Metabolic Health'>('PCOS');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState('1 week');
  const [dateFilter, setDateFilter] = useState('Last 7 days');

  const filteredPatients = mockPatients.filter(p => {
    const s = patientSearch.toLowerCase();
    return p.firstName.toLowerCase().includes(s) || p.lastName.toLowerCase().includes(s) || p.id.toLowerCase().includes(s);
  });

  const addTemplate = (t: string) => {
    if (!selectedTemplates.includes(t)) {
      setSelectedTemplates([...selectedTemplates, t]);
      setMessage(prev => prev ? `${prev}\n\n${t}` : t);
    }
  };

  const removeTemplate = (t: string) => {
    setSelectedTemplates(selectedTemplates.filter(st => st !== t));
    setMessage(prev => prev.replace(t, '').replace(/\n\n\n+/g, '\n\n').trim());
  };

  const handleSend = () => {
    if (!selectedPatient || !message) return;
    toast({ title: `Advice sent to ${selectedPatient}` });
    setMessage('');
    setSelectedTemplates([]);
  };

  return (
    <PHCLayout>
      <h1 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3 mb-6">Send Health Advice</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Template Library */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3">Template Library</h3>
          <div className="flex gap-2 mb-3">
            {(['PCOS', 'Hormonal Health', 'Metabolic Health'] as const).map(c => (
              <button key={c} onClick={() => setCondition(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${condition === c ? 'bg-[#2E8B57] text-white' : 'bg-gray-100 text-gray-600'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {adviceTemplates[condition].map((t, i) => (
              <button key={i} onClick={() => addTemplate(t)}
                className={`block w-full text-left text-xs bg-gray-50 hover:bg-[#E8F5E9] border border-gray-100 rounded-lg px-3 py-2.5 transition-colors ${selectedTemplates.includes(t) ? 'bg-[#E8F5E9] border-[#2E8B57]' : ''}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Right — Composer */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] outline-none"
              value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
              <option value="">Select patient...</option>
              {mockPatients.map(p => (
                <option key={p.id} value={p.id}>{p.id} — {p.firstName} {p.lastName}, Age {p.age}</option>
              ))}
            </select>
          </div>

          {selectedTemplates.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTemplates.map((t, i) => (
                <span key={i} className="bg-[#E8F5E9] text-[#2E8B57] rounded-full px-2 py-1 text-[10px] flex items-center gap-1">
                  {t.slice(0, 30)}...
                  <button onClick={() => removeTemplate(t)}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}

          <div>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] outline-none resize-none" rows={6} maxLength={500} placeholder="Compose your advice message..." value={message} onChange={e => setMessage(e.target.value)} />
            <p className="text-xs text-gray-400 text-right">{message.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up reminder</label>
            <div className="flex gap-2">
              {['1 week', '2 weeks', '1 month'].map(f => (
                <button key={f} onClick={() => setFollowUp(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${followUp === f ? 'bg-[#2E8B57] text-white border-[#2E8B57]' : 'text-gray-600 border-gray-300'}`}>{f}</button>
              ))}
            </div>
          </div>

          <button onClick={handleSend} disabled={!selectedPatient || !message}
            className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#256D46] disabled:opacity-50 flex items-center justify-center gap-2">
            <Send size={16} /> Send to Patient App
          </button>
        </div>
      </div>

      {/* Sent Messages Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#1E1E2E]">Sent Messages</h3>
          <div className="flex gap-2">
            {['Last 7 days', 'Last 30 days', 'All'].map(f => (
              <button key={f} onClick={() => setDateFilter(f)}
                className={`px-2 py-1 rounded text-xs ${dateFilter === f ? 'bg-[#2E8B57] text-white' : 'text-gray-500'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-[#E8F5E9] text-[#1E1E2E]">
              <th className="text-left px-3 py-2 font-semibold">Date</th>
              <th className="text-left px-3 py-2 font-semibold">Patient</th>
              <th className="text-left px-3 py-2 font-semibold">Condition</th>
              <th className="text-left px-3 py-2 font-semibold">Message</th>
              <th className="text-left px-3 py-2 font-semibold">Read</th>
            </tr></thead>
            <tbody>
              {mockSentAdvice.map(a => (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="px-3 py-2">{a.sentAt.split('T')[0]}</td>
                  <td className="px-3 py-2 font-medium">{a.patientId}</td>
                  <td className="px-3 py-2">{a.condition}</td>
                  <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate">{a.message}</td>
                  <td className="px-3 py-2"><span className={a.readByPatient ? 'text-green-600' : 'text-gray-400'}>{a.readByPatient ? 'Read' : 'Unread'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PHCLayout>
  );
}
