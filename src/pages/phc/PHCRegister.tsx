import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import PHCLayout from '@/components/phc/PHCLayout';

export default function PHCRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', phone: '', email: '', gender: 'Female',
    ethnicity: 'African', country: 'Nigeria',
    familyHistory: [] as string[],
    height: '', weight: '', waist: '', hip: '',
    acanthosisNigricans: '', skinTags: '', scalpThinning: '',
    cycleRegularity: '', cycleLength: '', periodsLast12: '', lastPeriodDate: '',
    bleedingIntensity: '', acneSeverity: '',
    nightSweats: '', breastSoreness: '', muscleWeakness: '', crampSeverity: 5,
    fatigue: '', highBP: '', abdominalWeight: '',
    hypoglycaemia: [] as string[],
    consent1: false, consent2: false, sendSMS: true,
  });

  const u = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));
  const toggleArray = (key: string, val: string) => {
    const arr = (form as any)[key] as string[];
    u(key, arr.includes(val) ? arr.filter((v: string) => v !== val) : [...arr, val]);
  };

  const bmi = (() => {
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    if (!h || !w) return null;
    if (unitSystem === 'metric') return w / ((h / 100) ** 2);
    const hInches = h; // simplified
    return (w / (hInches ** 2)) * 703;
  })();

  const bmiLabel = bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese') : '';
  const bmiColor = bmi ? (bmi < 18.5 ? 'text-blue-600 bg-blue-50' : bmi < 25 ? 'text-green-600 bg-green-50' : bmi < 30 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50') : '';

  const whr = form.waist && form.hip ? (parseFloat(form.waist) / parseFloat(form.hip)) : null;

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent outline-none";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  const Segment = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${value === o ? 'bg-[#2E8B57] text-white border-[#2E8B57]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
          {o}
        </button>
      ))}
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <PHCLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <CheckCircle2 size={64} className="mx-auto text-[#2E8B57] mb-4" />
          <h2 className="text-xl font-semibold text-[#1E1E2E] mb-2">Patient Registered Successfully</h2>
          <p className="text-sm text-gray-500 mb-6">Patient ID: P-00{Math.floor(Math.random() * 900 + 100)}</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'PCOS', score: 0.35, color: '#9333ea' },
              { label: 'Hormonal', score: 0.22, color: '#e11d48' },
              { label: 'Metabolic', score: 0.41, color: '#0d9488' },
            ].map(g => (
              <div key={g.label} className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-1" style={{ border: `4px solid ${g.color}`, color: g.color }}>
                  <span className="text-lg font-bold">{g.score}</span>
                </div>
                <p className="text-xs text-gray-600">{g.label}</p>
              </div>
            ))}
          </div>
          {form.sendSMS && <p className="text-sm text-green-600 mb-6">✓ SMS sent to {form.phone}</p>}
          <div className="flex gap-3">
            <button onClick={() => navigate('/phc/dashboard')} className="flex-1 bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium">View Patient Record</button>
            <button onClick={() => { setSuccess(false); setStep(1); setForm({ ...form, firstName: '', lastName: '', dob: '', phone: '', email: '' }); }}
              className="flex-1 border border-[#2E8B57] text-[#2E8B57] rounded-lg px-4 py-2.5 text-sm font-medium">Register Another</button>
          </div>
        </div>
      </PHCLayout>
    );
  }

  return (
    <PHCLayout>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          {['Patient Info', 'Measurements', 'Health History', 'Review & Consent'].map((s, i) => (
            <span key={i} className={`${step > i ? 'text-[#2E8B57] font-semibold' : step === i + 1 ? 'text-[#1E1E2E] font-semibold' : ''}`}>{s}</span>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-[#2E8B57] rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3">Step 1 of 4 — Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelCls}>First Name *</label><input className={inputCls} value={form.firstName} onChange={e => u('firstName', e.target.value)} /></div>
              <div><label className={labelCls}>Last Name *</label><input className={inputCls} value={form.lastName} onChange={e => u('lastName', e.target.value)} /></div>
              <div><label className={labelCls}>Date of Birth *</label><input type="date" className={inputCls} value={form.dob} onChange={e => u('dob', e.target.value)} /></div>
              <div><label className={labelCls}>Phone Number *</label><input type="tel" className={inputCls} value={form.phone} onChange={e => u('phone', e.target.value)} /></div>
              <div><label className={labelCls}>Email (Optional)</label><input type="email" className={inputCls} value={form.email} onChange={e => u('email', e.target.value)} placeholder="For app account login" /></div>
              <div><label className={labelCls}>Gender</label><Segment options={['Female', 'Intersex', 'Prefer not to say']} value={form.gender} onChange={v => u('gender', v)} /></div>
              <div><label className={labelCls}>Ethnicity</label>
                <select className={inputCls} value={form.ethnicity} onChange={e => u('ethnicity', e.target.value)}>
                  {['African', 'Asian', 'Caucasian', 'Hispanic', 'Middle Eastern', 'Other', 'Prefer not to say'].map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Country</label><input className={inputCls} value={form.country} onChange={e => u('country', e.target.value)} /></div>
            </div>
            <div>
              <label className={labelCls}>Family History</label>
              <div className="flex flex-wrap gap-2">
                {['PCOS', 'Type 2 Diabetes', 'Cardiovascular Disease', 'Hypertension', 'None known'].map(h => (
                  <button key={h} type="button" onClick={() => toggleArray('familyHistory', h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.familyHistory.includes(h) ? 'bg-[#2E8B57] text-white border-[#2E8B57]' : 'bg-white text-gray-600 border-gray-300'}`}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!form.firstName || !form.lastName || !form.dob || !form.phone}
              className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#256D46] disabled:opacity-50 flex items-center justify-center gap-2">
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3">Step 2 of 4 — Body Measurements</h2>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setUnitSystem('metric')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${unitSystem === 'metric' ? 'bg-[#2E8B57] text-white border-[#2E8B57]' : 'text-gray-600 border-gray-300'}`}>Metric (cm/kg)</button>
              <button onClick={() => setUnitSystem('imperial')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${unitSystem === 'imperial' ? 'bg-[#2E8B57] text-white border-[#2E8B57]' : 'text-gray-600 border-gray-300'}`}>Imperial (ft-in/lbs)</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelCls}>Height ({unitSystem === 'metric' ? 'cm' : 'inches'})</label><input type="number" className={inputCls} value={form.height} onChange={e => u('height', e.target.value)} /></div>
              <div><label className={labelCls}>Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})</label><input type="number" className={inputCls} value={form.weight} onChange={e => u('weight', e.target.value)} /></div>
            </div>
            {bmi && (
              <div className={`inline-flex items-center gap-2 ${bmiColor} rounded-full px-3 py-1 text-sm font-semibold`}>
                BMI: {bmi.toFixed(1)} — {bmiLabel}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelCls}>Waist Circumference ({unitSystem === 'metric' ? 'cm' : 'in'})</label><input type="number" className={inputCls} value={form.waist} onChange={e => u('waist', e.target.value)} placeholder="Measure at belly button level" /></div>
              <div><label className={labelCls}>Hip Circumference (optional)</label><input type="number" className={inputCls} value={form.hip} onChange={e => u('hip', e.target.value)} /></div>
            </div>
            {whr && (
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${whr > 0.85 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                WHR: {whr.toFixed(2)} {whr > 0.85 && '— Metabolic risk marker detected'}
              </div>
            )}
            <div><label className={labelCls}>Acanthosis Nigricans</label><p className="text-xs text-gray-500 mb-2">Does the patient have dark, velvety skin patches on the neck, underarms, or groin?</p><Segment options={['Yes', 'No', 'Not sure']} value={form.acanthosisNigricans} onChange={v => u('acanthosisNigricans', v)} /></div>
            <div><label className={labelCls}>Skin Tags</label><Segment options={['Yes', 'No']} value={form.skinTags} onChange={v => u('skinTags', v)} /></div>
            <div><label className={labelCls}>Scalp Hair Thinning</label><Segment options={['Yes', 'No', 'Unsure']} value={form.scalpThinning} onChange={v => u('scalpThinning', v)} /></div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-center gap-2"><ArrowLeft size={16} /> Back</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2">Next Step <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3">Step 3 of 4 — Health History</h2>
            <h4 className="text-sm font-semibold text-gray-600">PCOS / Cycle</h4>
            <Segment options={['Regular', 'Irregular', 'Not sure']} value={form.cycleRegularity} onChange={v => u('cycleRegularity', v)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelCls}>Typical Cycle Length (days)</label><input type="number" className={inputCls} value={form.cycleLength} onChange={e => u('cycleLength', e.target.value)} placeholder="e.g. 28" min={15} max={90} /></div>
              <div>
                <label className={labelCls}>Periods in Last 12 Months</label>
                <input type="number" className={inputCls} value={form.periodsLast12} onChange={e => u('periodsLast12', e.target.value)} min={0} max={15} />
                {parseInt(form.periodsLast12) < 8 && form.periodsLast12 && <p className="text-xs text-amber-600 mt-1">This may indicate irregular ovulation</p>}
              </div>
              <div><label className={labelCls}>Last Period Start Date</label><input type="date" className={inputCls} value={form.lastPeriodDate} onChange={e => u('lastPeriodDate', e.target.value)} /></div>
            </div>
            <div><label className={labelCls}>Bleeding Intensity</label><Segment options={['Spotting', 'Light', 'Medium', 'Heavy', 'Very Heavy']} value={form.bleedingIntensity} onChange={v => u('bleedingIntensity', v)} /></div>
            <div><label className={labelCls}>Acne Severity</label><Segment options={['None', 'Mild', 'Moderate', 'Severe']} value={form.acneSeverity} onChange={v => u('acneSeverity', v)} /></div>

            <h4 className="text-sm font-semibold text-gray-600 pt-2">Hormonal Imbalance</h4>
            <div><label className={labelCls}>Night Sweats</label><Segment options={['None', 'Occasional (1–2/week)', 'Frequent (3+/week)', 'Every night']} value={form.nightSweats} onChange={v => u('nightSweats', v)} /></div>
            <div><label className={labelCls}>Breast Soreness</label><Segment options={['None', 'Mild', 'Moderate', 'Severe']} value={form.breastSoreness} onChange={v => u('breastSoreness', v)} /></div>
            <div><label className={labelCls}>Muscle Weakness</label><Segment options={['None', 'Mild', 'Moderate', 'Significant']} value={form.muscleWeakness} onChange={v => u('muscleWeakness', v)} /></div>
            <div>
              <label className={labelCls}>Cramp Severity (0–10)</label>
              <input type="range" min={0} max={10} value={form.crampSeverity} onChange={e => u('crampSeverity', parseInt(e.target.value))}
                className="w-full accent-[#2E8B57]" />
              <div className="flex justify-between text-xs text-gray-400"><span>None</span><span>{form.crampSeverity}</span><span>Severe</span></div>
            </div>

            <h4 className="text-sm font-semibold text-gray-600 pt-2">Metabolic Health</h4>
            <div><label className={labelCls}>Persistent Fatigue</label><Segment options={['None', 'Mild', 'Moderate', 'Severe — affecting daily activities']} value={form.fatigue} onChange={v => u('fatigue', v)} /></div>
            <div><label className={labelCls}>Known High Blood Pressure</label><Segment options={['Yes', 'No', 'Not sure']} value={form.highBP} onChange={v => u('highBP', v)} /></div>
            <div><label className={labelCls}>Abdominal Weight</label><Segment options={['No', 'Mild bloating', 'Significant abdominal weight']} value={form.abdominalWeight} onChange={v => u('abdominalWeight', v)} /></div>
            <div>
              <label className={labelCls}>Reactive Hypoglycaemia Symptoms</label>
              <div className="flex flex-wrap gap-2">
                {['Heart palpitations', 'Sudden shakiness', 'Intense hunger spikes', 'None'].map(s => (
                  <button key={s} type="button" onClick={() => toggleArray('hypoglycaemia', s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${form.hypoglycaemia.includes(s) ? 'bg-[#2E8B57] text-white border-[#2E8B57]' : 'text-gray-600 border-gray-300'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-center gap-2"><ArrowLeft size={16} /> Back</button>
              <button onClick={() => setStep(4)} className="flex-1 bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2">Next Step <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3">Step 4 of 4 — Review & Create Account</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-500">Name:</span> {form.firstName} {form.lastName}</div>
                <div><span className="text-gray-500">DOB:</span> {form.dob}</div>
                <div><span className="text-gray-500">Phone:</span> {form.phone}</div>
                <div><span className="text-gray-500">Gender:</span> {form.gender}</div>
                <div><span className="text-gray-500">Ethnicity:</span> {form.ethnicity}</div>
                {bmi && <div><span className="text-gray-500">BMI:</span> {bmi.toFixed(1)}</div>}
                <div><span className="text-gray-500">Cycle:</span> {form.cycleRegularity}, {form.cycleLength} days</div>
                <div><span className="text-gray-500">Acne:</span> {form.acneSeverity || 'Not specified'}</div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.consent1} onChange={e => u('consent1', e.target.checked)} className="mt-1 accent-[#2E8B57]" />
                <span className="text-sm text-gray-700">I confirm this patient has provided verbal consent for their health data to be stored and processed by AI-MSHM</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.consent2} onChange={e => u('consent2', e.target.checked)} className="mt-1 accent-[#2E8B57]" />
                <span className="text-sm text-gray-700">I confirm this patient understands their data will be used to generate AI-powered health risk assessments</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.sendSMS} onChange={e => u('sendSMS', e.target.checked)} className="accent-[#2E8B57]" />
                <span className="text-sm text-gray-700">Send account login details to patient via SMS</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 text-sm flex items-center justify-center gap-2"><ArrowLeft size={16} /> Back</button>
              <button onClick={handleSubmit} disabled={!form.consent1 || !form.consent2 || loading}
                className="flex-1 bg-[#2E8B57] text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Patient & Run Assessment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </PHCLayout>
  );
}
