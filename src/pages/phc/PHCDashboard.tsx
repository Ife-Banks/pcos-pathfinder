import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, AlertTriangle } from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';
import { mockPatients, mockStaff, mockAlerts } from '@/data/phcMockData';

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
  switch (status) {
    case 'New': return 'bg-green-100 text-green-800';
    case 'Under Review': return 'bg-amber-100 text-amber-800';
    case 'Action Taken': return 'bg-blue-100 text-blue-800';
    case 'Discharged': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const conditionBadge = (flag: string) => {
  switch (flag) {
    case 'PCOS': return 'bg-purple-100 text-purple-800';
    case 'Hormonal': return 'bg-rose-100 text-rose-800';
    case 'Metabolic': return 'bg-teal-100 text-teal-800';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const scoreDot = (tier: string) => {
  if (tier === 'Low') return 'bg-green-500';
  if (tier === 'Moderate') return 'bg-amber-500';
  return 'bg-red-500';
};

const isEscalationNeeded = (p: typeof mockPatients[0]) =>
  ['High', 'Critical'].includes(p.pcosTier) ||
  ['High', 'Critical'].includes(p.hormonalTier) ||
  ['High', 'Critical'].includes(p.metabolicTier);

const daysAgo = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
};

export default function PHCDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const stats = useMemo(() => {
    const lowMod = mockPatients.filter(p => !['High', 'Critical'].includes(p.pcosTier) || !['High', 'Critical'].includes(p.hormonalTier));
    return {
      total: mockPatients.length,
      moderate: mockPatients.filter(p => p.pcosTier === 'Moderate' || p.hormonalTier === 'Moderate' || p.metabolicTier === 'Moderate').length,
      low: mockPatients.filter(p => p.pcosTier === 'Low' && p.hormonalTier === 'Low' && p.metabolicTier === 'Low').length,
      newToday: mockPatients.filter(p => p.referredDate === '2026-03-16').length,
    };
  }, []);

  const filters = ['All', 'Moderate', 'Low', 'New Today', 'Awaiting Review', 'Action Taken'];

  const filtered = useMemo(() => {
    let list = mockPatients;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p => p.firstName.toLowerCase().includes(s) || p.lastName.toLowerCase().includes(s) || p.id.toLowerCase().includes(s));
    }
    switch (filter) {
      case 'Moderate': list = list.filter(p => p.pcosTier === 'Moderate' || p.hormonalTier === 'Moderate' || p.metabolicTier === 'Moderate'); break;
      case 'Low': list = list.filter(p => p.pcosTier === 'Low' && p.hormonalTier === 'Low' && p.metabolicTier === 'Low'); break;
      case 'New Today': list = list.filter(p => p.referredDate === '2026-03-16'); break;
      case 'Awaiting Review': list = list.filter(p => p.status === 'New' || p.status === 'Under Review'); break;
      case 'Action Taken': list = list.filter(p => p.status === 'Action Taken'); break;
    }
    return list;
  }, [search, filter]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <PHCLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E1E2E]">{greeting}, {mockStaff.firstName}</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Active Patients', value: stats.total, sub: 'Minor Risk cases', color: '#2E8B57' },
          { label: 'Moderate Risk', value: stats.moderate, sub: 'Require attention', color: '#F59E0B' },
          { label: 'Low Risk', value: stats.low, sub: 'Continue monitoring', color: '#2E8B57' },
          { label: 'New Referrals Today', value: stats.newToday, sub: 'Referred to this PHC today', color: '#2E8B57', pulse: stats.newToday > 0 },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border-l-4 p-4" style={{ borderLeftColor: s.color }}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              {s.pulse && <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57] animate-pulse" />}
            </div>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Patient Queue */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3">Minor Risk Patient Queue</h2>
            <button onClick={() => navigate('/phc/register')}
              className="bg-[#2E8B57] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#256D46] flex items-center gap-2 w-fit">
              <UserPlus size={16} />
              Register Walk-In Patient
            </button>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent outline-none"
                placeholder="Search by patient name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f ? 'bg-[#2E8B57] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#E8F5E9] text-[#1E1E2E]">
                <th className="text-left px-4 py-3 font-semibold">Patient ID</th>
                <th className="text-left px-4 py-3 font-semibold">Age</th>
                <th className="text-left px-4 py-3 font-semibold">Conditions</th>
                <th className="text-left px-4 py-3 font-semibold">PCOS</th>
                <th className="text-left px-4 py-3 font-semibold">Hormonal</th>
                <th className="text-left px-4 py-3 font-semibold">Metabolic</th>
                <th className="text-left px-4 py-3 font-semibold">Referred</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const escalate = isEscalationNeeded(p);
                return (
                  <tr key={p.id} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''} ${escalate ? 'border-l-4 border-l-red-500' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E8B57] text-xs font-semibold">
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <span className="font-medium text-[#1E1E2E]">{p.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.age}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.conditionFlags.map(f => (
                          <span key={f} className={`${conditionBadge(f)} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>{f}</span>
                        ))}
                      </div>
                    </td>
                    {(['pcos', 'hormonal', 'metabolic'] as const).map(cond => {
                      const score = p[`${cond}Score` as keyof typeof p] as number;
                      const tier = p[`${cond}Tier` as keyof typeof p] as string;
                      const isHighCrit = ['High', 'Critical'].includes(tier);
                      return (
                        <td key={cond} className="px-4 py-3">
                          {isHighCrit ? (
                            <span className={`${tierBadge(tier)} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>ESCALATE</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${scoreDot(tier)}`} />
                              <span className="text-gray-700">{score.toFixed(2)}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <span className="text-gray-600" title={p.referredDate}>{daysAgo(p.referredDate)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${statusBadge(p.status)} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {escalate ? (
                        <button onClick={() => navigate(`/phc/refer/${p.id}`)}
                          className="bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-700 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Escalate
                        </button>
                      ) : (
                        <button onClick={() => navigate(`/phc/patients/${p.id}`)}
                          className="bg-[#2E8B57] text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[#256D46]">
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-gray-50">
          {filtered.map(p => {
            const escalate = isEscalationNeeded(p);
            return (
              <div key={p.id} className={`p-4 ${escalate ? 'border-l-4 border-l-red-500' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E8B57] text-xs font-semibold">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1E1E2E]">{p.id}</p>
                      <p className="text-xs text-gray-500">Age {p.age}</p>
                    </div>
                  </div>
                  <span className={`${statusBadge(p.status)} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>{p.status}</span>
                </div>
                <div className="flex gap-1 flex-wrap mb-2">
                  {p.conditionFlags.map(f => (
                    <span key={f} className={`${conditionBadge(f)} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>{f}</span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  {(['pcos', 'hormonal', 'metabolic'] as const).map(cond => {
                    const score = p[`${cond}Score` as keyof typeof p] as number;
                    const tier = p[`${cond}Tier` as keyof typeof p] as string;
                    const isHighCrit = ['High', 'Critical'].includes(tier);
                    return (
                      <div key={cond} className="text-center">
                        <p className="text-gray-400 capitalize text-[10px]">{cond}</p>
                        {isHighCrit ? (
                          <span className={`${tierBadge(tier)} rounded-full px-1.5 py-0.5 text-[10px] font-semibold`}>ESC</span>
                        ) : (
                          <p className="font-semibold text-gray-700">{score.toFixed(2)}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {escalate ? (
                  <button onClick={() => navigate(`/phc/refer/${p.id}`)}
                    className="w-full bg-red-600 text-white rounded-lg px-3 py-2 text-xs font-medium">
                    Escalate to FMC
                  </button>
                ) : (
                  <button onClick={() => navigate(`/phc/patients/${p.id}`)}
                    className="w-full bg-[#2E8B57] text-white rounded-lg px-3 py-2 text-xs font-medium">
                    Review
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Search size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No patients found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </PHCLayout>
  );
}
