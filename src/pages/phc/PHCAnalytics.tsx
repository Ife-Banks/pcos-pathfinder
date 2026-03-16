import { useState } from 'react';
import PHCLayout from '@/components/phc/PHCLayout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Download } from 'lucide-react';

const riskData = [{ name: 'Low', value: 3, color: '#2E8B57' }, { name: 'Moderate', value: 5, color: '#F59E0B' }];
const conditionData = [
  { name: 'PCOS', count: 5, pct: 62, color: '#9333ea' },
  { name: 'Hormonal', count: 3, pct: 38, color: '#e11d48' },
  { name: 'Metabolic', count: 4, pct: 50, color: '#0d9488' },
];
const escalationData = [
  { date: 'Mar 1', count: 0 }, { date: 'Mar 4', count: 1 }, { date: 'Mar 7', count: 0 },
  { date: 'Mar 10', count: 2 }, { date: 'Mar 13', count: 1 }, { date: 'Mar 16', count: 1 },
];
const heatmapData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
  day, '8am': Math.floor(Math.random() * 8), '10am': Math.floor(Math.random() * 12), '12pm': Math.floor(Math.random() * 10),
  '2pm': Math.floor(Math.random() * 8), '4pm': Math.floor(Math.random() * 5),
}));
const staffData = [
  { name: 'Amina Ibrahim', advice: 12, reviewed: 6, booked: 4, escalated: 2, discharged: 1 },
  { name: 'Chidi Okafor', advice: 8, reviewed: 4, booked: 3, escalated: 1, discharged: 0 },
  { name: 'Fatimah Yusuf', advice: 5, reviewed: 3, booked: 2, escalated: 0, discharged: 2 },
];

export default function PHCAnalytics() {
  const [range, setRange] = useState('This Month');

  return (
    <PHCLayout>
      <h1 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3 mb-4">Facility Analytics</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['This Week', 'This Month', 'Last 3 Months', 'Custom'].map(r => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${range === r ? 'bg-[#2E8B57] text-white' : 'bg-gray-100 text-gray-600'}`}>{r}</button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Active Patients', value: 8, sub: 'Minor Risk cases registered', color: '#2E8B57' },
          { label: 'Moderate Risk', value: 5, sub: 'Requiring attention', color: '#F59E0B' },
          { label: 'Escalated to FMC', value: 3, sub: 'High/Critical escalations', color: '#EF4444' },
          { label: 'Avg Days to Action', value: 2.4, sub: 'From referral to PHC action', color: '#2E8B57' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border-l-4 p-4" style={{ borderLeftColor: s.color }}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3">Risk Tier Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3">Most Flagged Conditions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={conditionData} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {conditionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3">Escalations Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={escalationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2E8B57" strokeWidth={2} dot={{ fill: '#2E8B57', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-[#1E1E2E] mb-3">Patient Check-In Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr><th className="px-2 py-1 text-left text-gray-500">Day</th>
                {['8am', '10am', '12pm', '2pm', '4pm'].map(t => <th key={t} className="px-2 py-1 text-gray-500">{t}</th>)}</tr></thead>
              <tbody>
                {heatmapData.map(row => (
                  <tr key={row.day}>
                    <td className="px-2 py-1 font-medium">{row.day}</td>
                    {['8am', '10am', '12pm', '2pm', '4pm'].map(t => {
                      const v = (row as any)[t] as number;
                      const opacity = Math.min(v / 12, 1);
                      return <td key={t} className="px-2 py-1"><div className="w-8 h-6 rounded mx-auto flex items-center justify-center text-[10px]" style={{ backgroundColor: `rgba(46,139,87,${opacity * 0.8 + 0.1})`, color: opacity > 0.4 ? 'white' : '#1E1E2E' }}>{v}</div></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#1E1E2E]">Staff Actions Summary</h3>
          <button className="border border-[#2E8B57] text-[#2E8B57] rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 hover:bg-[#E8F5E9]">
            <Download size={14} /> Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-[#E8F5E9] text-[#1E1E2E]">
              <th className="text-left px-4 py-2.5 font-semibold">Staff Member</th>
              <th className="text-left px-4 py-2.5 font-semibold">Advice Sent</th>
              <th className="text-left px-4 py-2.5 font-semibold">Reviewed</th>
              <th className="text-left px-4 py-2.5 font-semibold">Booked</th>
              <th className="text-left px-4 py-2.5 font-semibold">Escalated</th>
              <th className="text-left px-4 py-2.5 font-semibold">Discharged</th>
            </tr></thead>
            <tbody>
              {staffData.map((s, i) => (
                <tr key={s.name} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-2.5 font-medium">{s.name}</td>
                  <td className="px-4 py-2.5">{s.advice}</td>
                  <td className="px-4 py-2.5">{s.reviewed}</td>
                  <td className="px-4 py-2.5">{s.booked}</td>
                  <td className="px-4 py-2.5">{s.escalated}</td>
                  <td className="px-4 py-2.5">{s.discharged}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PHCLayout>
  );
}
