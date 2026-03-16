import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function PHCLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ facilityId: '', staffId: '', email: '', password: '' });
  const [twoFACode, setTwoFACode] = useState('');

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    if (!form.facilityId || !form.staffId || !form.email || !form.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    if (twoFACode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate('/phc/dashboard');
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 font-['Inter',sans-serif]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-1 bg-[#2E8B57]" />
          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#2E8B57] flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <h1 className="text-xl font-semibold text-[#1E1E2E]">AI-MSHM</h1>
              <span className="inline-block mt-2 bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-semibold">
                Primary Health Centre
              </span>
            </div>

            {step === 1 ? (
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facility ID</label>
                  <input
                    className={inputCls}
                    placeholder="Facility ID or Name"
                    value={form.facilityId}
                    onChange={e => setForm({ ...form, facilityId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
                  <input
                    className={inputCls}
                    placeholder="Staff ID / Employee Number"
                    value={form.staffId}
                    onChange={e => setForm({ ...form, staffId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="staff@phc.gov.ng"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      className={inputCls}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#256D46] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Access PHC Portal
                </button>
              </form>
            ) : (
              <form onSubmit={handleStep2} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">A verification code has been sent to your registered device.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">2FA Code</label>
                  <input
                    className={`${inputCls} text-center text-lg tracking-[0.5em]`}
                    placeholder="000000"
                    maxLength={6}
                    value={twoFACode}
                    onChange={e => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#256D46] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Verify & Sign In
                </button>
                <button type="button" onClick={() => setStep(1)}
                  className="w-full text-sm text-gray-500 hover:text-[#2E8B57]">
                  ← Back to credentials
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <a href="/login" className="text-sm text-[#2E8B57] hover:underline">Wrong portal? Switch role</a>
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-3 text-center">
            <p className="text-xs text-gray-400">AI-MSHM v2.0 — Confidential Staff Access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
