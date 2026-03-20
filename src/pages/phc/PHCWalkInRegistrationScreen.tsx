import { phcAPI } from '@/services/phcService';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PHCLayout from '@/components/phc/PHCLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ArrowLeft, ArrowRight, User, Ruler, Activity, ClipboardList, ShieldCheck, Copy, Check } from 'lucide-react';

const STEPS = ['Demographics', 'Physical', 'Symptoms', 'Review'];

interface FormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  gender: 'female' | 'male' | 'other';
  height_cm: number | null;
  weight_kg: number | null;
  waist_cm: number | null;
  acanthosis_nigricans: boolean | null;
  cycle_regularity: 'regular' | 'irregular' | 'not_sure' | null;
  typical_cycle_length: number | null;
  last_period_date: string;
  bleeding_intensity: number | null;
  night_sweats: 'none' | 'occasional' | 'frequent' | null;
  persistent_fatigue: boolean | null;
  family_history: string[];
  consent: boolean;
}

const initialFormData: FormData = {
  first_name: '', last_name: '', date_of_birth: '', phone: '', email: '',
  gender: 'female', height_cm: null, weight_kg: null, waist_cm: null,
  acanthosis_nigricans: null, cycle_regularity: null, typical_cycle_length: null,
  last_period_date: '', bleeding_intensity: null, night_sweats: null,
  persistent_fatigue: null, family_history: [], consent: false,
};


export default function PHCWalkInRegistrationScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    patient_id: string;
    full_name: string;
    temp_password: string;
    queue_record_id: string;
    baseline_risk: {
      pcos_score: number;
      pcos_tier: string;
      hormonal_score: number;
      hormonal_tier: string;
      metabolic_score: number;
      metabolic_tier: string;
    };
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [useMetric, setUseMetric] = useState(true);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const bmiData = useMemo(() => {
    if (!form.height_cm || !form.weight_kg) return null;
    const hM = form.height_cm / 100;
    const bmi = form.weight_kg / (hM * hM);
    let cat = 'Normal';
    if (bmi < 18.5) cat = 'Underweight';
    else if (bmi >= 25 && bmi < 30) cat = 'Overweight';
    else if (bmi >= 30) cat = 'Obese';
    return { value: bmi.toFixed(1), category: cat };
  }, [form.height_cm, form.weight_kg]);

  const isStep1Valid = !!(form.first_name && form.last_name && form.date_of_birth && form.phone && form.gender);
  const isStep2Valid = !!(form.height_cm && form.weight_kg && form.acanthosis_nigricans !== null);
  const isStep3Valid = !!(form.cycle_regularity && form.bleeding_intensity && form.night_sweats && form.persistent_fatigue !== null);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    const dob = new Date(form.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 13 || (age === 13 && today < new Date(dob.setFullYear(today.getFullYear())))) {
      errs.date_of_birth = 'Patient must be at least 13 years old';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.consent) return;
    setLoading(true);
    setSubmitError('');
    try {
      const body = await phcAPI.registerWalkIn({ first_name: form.first_name, last_name: form.last_name, email: form.email || undefined, phone: form.phone, date_of_birth: form.date_of_birth, height_cm: form.height_cm ?? undefined, weight_kg: form.weight_kg ?? undefined, acanthosis_nigricans: form.acanthosis_nigricans ?? undefined, cycle_regularity: form.cycle_regularity ?? undefined, typical_cycle_length: form.gender === 'female' ? form.typical_cycle_length ?? undefined : undefined, last_period_date: form.gender === 'female' && form.last_period_date ? form.last_period_date : undefined, bleeding_intensity: form.bleeding_intensity ?? undefined, night_sweats: form.night_sweats ?? undefined, persistent_fatigue: form.persistent_fatigue ?? undefined, family_history: form.family_history.length > 0 ? form.family_history : undefined });
      if (body?.status === 'success' || body?.phc_record_id) { setSuccess(body as unknown as { patient_id: string; full_name: string; temp_password: string; queue_record_id: string; baseline_risk: { pcos_score: number; pcos_tier: string; hormonal_score: number; hormonal_tier: string; metabolic_score: number; metabolic_tier: string; }; }); }
    } catch (e: unknown) {
      const err = e as { message?: string };
      setSubmitError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(success.temp_password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetWizard = () => {
    setForm(initialFormData);
    setStep(1);
    setSuccess(null);
    setErrors({});
    setSubmitError('');
  };

  const PillButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selected ? 'bg-[#2E8B57] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
    >
      {label}
    </button>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => {
        const stepNum = i + 1;
        const done = step > stepNum;
        const active = step === stepNum;
        return (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${done ? 'bg-[#2E8B57] text-white' : active ? 'bg-[#2E8B57] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {done ? <CheckCircle size={16} /> : stepNum}
            </div>
            <span className={`ml-2 text-sm hidden sm:inline ${active ? 'text-[#2E8B57] font-medium' : 'text-gray-500'}`}>{s}</span>
            {i < 3 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > stepNum ? 'bg-[#2E8B57]' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );

  const renderDemographics = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input id="first_name" value={form.first_name} onChange={e => updateField('first_name', e.target.value)} placeholder="Jane" />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input id="last_name" value={form.last_name} onChange={e => updateField('last_name', e.target.value)} placeholder="Doe" />
        </div>
      </div>
      <div>
        <Label htmlFor="dob">Date of Birth *</Label>
        <Input id="dob" type="date" value={form.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} max={new Date().toISOString().split('T')[0]} />
        {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input id="phone" type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+91 9876543210" />
      </div>
      <div>
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="jane@example.com" />
        <p className="text-gray-500 text-xs mt-1">Leave blank to auto-generate</p>
      </div>
      <div>
        <Label>Gender *</Label>
        <div className="flex gap-2 mt-2">
          {(['female', 'male', 'other'] as const).map(g => (
            <PillButton key={g} label={g.charAt(0).toUpperCase() + g.slice(1)} selected={form.gender === g} onClick={() => updateField('gender', g)} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderPhysical = () => (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setUseMetric(true)} className={`px-4 py-2 rounded-full text-sm font-medium ${useMetric ? 'bg-[#2E8B57] text-white' : 'bg-gray-100'}`}>Metric (cm/kg)</button>
        <button onClick={() => setUseMetric(false)} className={`px-4 py-2 rounded-full text-sm font-medium ${!useMetric ? 'bg-[#2E8B57] text-white' : 'bg-gray-100'}`}>Imperial (ft/lbs)</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height">{useMetric ? 'Height (cm)' : 'Height (ft)'}</Label>
          <Input id="height" type="number" value={form.height_cm ?? ''} onChange={e => {
            const val = parseFloat(e.target.value);
            updateField('height_cm', isNaN(val) ? null : useMetric ? val : val * 30.48);
          }} placeholder={useMetric ? '170' : '5.6'} />
        </div>
        <div>
          <Label htmlFor="weight">{useMetric ? 'Weight (kg)' : 'Weight (lbs)'}</Label>
          <Input id="weight" type="number" value={form.weight_kg ?? ''} onChange={e => {
            const val = parseFloat(e.target.value);
            updateField('weight_kg', isNaN(val) ? null : useMetric ? val : val * 0.453592);
          }} placeholder={useMetric ? '65' : '143'} />
        </div>
      </div>
      {bmiData && (
        <div className={`p-4 rounded-lg ${bmiData.category === 'Obese' ? 'bg-red-50 border border-red-200' : bmiData.category === 'Overweight' ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
          <p className="font-semibold">BMI: {bmiData.value} — {bmiData.category}</p>
        </div>
      )}
      <div>
        <Label htmlFor="waist">Waist Circumference (cm, optional)</Label>
        <Input id="waist" type="number" value={form.waist_cm ?? ''} onChange={e => {
          const val = parseFloat(e.target.value);
          updateField('waist_cm', isNaN(val) ? null : val);
        }} placeholder="80" />
      </div>
      <div>
        <Label>Acanthosis Nigricans *</Label>
        <p className="text-gray-500 text-xs mb-2">Dark, velvety patches on neck/underarms/groin?</p>
        <div className="flex gap-2">
          {[true, false, null].map((v, i) => (
            <PillButton key={i} label={v === true ? 'Yes' : v === false ? 'No' : 'Not Sure'} selected={form.acanthosis_nigricans === v && v !== null || (v === null && form.acanthosis_nigricans === null)} onClick={() => updateField('acanthosis_nigricans', v === null ? null : v)} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderSymptoms = () => (
    <div className="space-y-4">
      <div>
        <Label>Cycle Regularity *</Label>
        <div className="flex gap-2 mt-2">
          {(['regular', 'irregular', 'not_sure'] as const).map(r => (
            <PillButton key={r} label={r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' ')} selected={form.cycle_regularity === r} onClick={() => updateField('cycle_regularity', r)} />
          ))}
        </div>
      </div>
      {form.gender === 'female' && (
        <>
          <div>
            <Label htmlFor="cycle_length">Typical Cycle Length (days)</Label>
            <Input id="cycle_length" type="number" value={form.typical_cycle_length ?? ''} onChange={e => {
              const val = parseInt(e.target.value);
              updateField('typical_cycle_length', isNaN(val) ? null : val);
            }} placeholder="28" />
          </div>
          <div>
            <Label htmlFor="last_period">Last Period Start Date</Label>
            <Input id="last_period" type="date" value={form.last_period_date} onChange={e => updateField('last_period_date', e.target.value)} />
          </div>
        </>
      )}
      <div>
        <Label>Bleeding Intensity *</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[1, 2, 3, 4].map((val, i) => (
            <PillButton key={val} label={['Spotting', 'Light', 'Medium', 'Heavy'][i]} selected={form.bleeding_intensity === val} onClick={() => updateField('bleeding_intensity', val)} />
          ))}
        </div>
      </div>
      <div>
        <Label>Night Sweats *</Label>
        <div className="flex gap-2 mt-2">
          {(['none', 'occasional', 'frequent'] as const).map(n => (
            <PillButton key={n} label={n.charAt(0).toUpperCase() + n.slice(1)} selected={form.night_sweats === n} onClick={() => updateField('night_sweats', n)} />
          ))}
        </div>
      </div>
      <div>
        <Label>Persistent Fatigue *</Label>
        <div className="flex gap-2 mt-2">
          {[true, false].map(v => (
            <PillButton key={String(v)} label={v ? 'Yes' : 'No'} selected={form.persistent_fatigue === v} onClick={() => updateField('persistent_fatigue', v)} />
          ))}
        </div>
      </div>
      <div>
        <Label>Family History</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['PCOS', 'Type 2 Diabetes', 'Cardiovascular Disease', 'None'].map(h => (
            <label key={h} className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={form.family_history.includes(h)} onChange={e => {
                if (e.target.checked) updateField('family_history', [...form.family_history, h]);
                else updateField('family_history', form.family_history.filter(x => x !== h));
              }} className="rounded" />
              <span className="text-sm">{h}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><User size={18} /> Demographics</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-gray-500">Name:</span> {form.first_name} {form.last_name}</p>
            <p><span className="text-gray-500">DOB:</span> {form.date_of_birth}</p>
            <p><span className="text-gray-500">Phone:</span> {form.phone}</p>
            <p><span className="text-gray-500">Email:</span> {form.email || 'Auto-generated'}</p>
            <p><span className="text-gray-500">Gender:</span> {form.gender}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Ruler size={18} /> Physical</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-gray-500">Height:</span> {form.height_cm?.toFixed(1)} cm</p>
            <p><span className="text-gray-500">Weight:</span> {form.weight_kg?.toFixed(1)} kg</p>
            <p><span className="text-gray-500">BMI:</span> {bmiData ? `${bmiData.value} (${bmiData.category})` : 'N/A'}</p>
            <p><span className="text-gray-500">Acanthosis:</span> {form.acanthosis_nigricans === true ? 'Yes' : form.acanthosis_nigricans === false ? 'No' : 'Not Sure'}</p>
            {form.waist_cm && <p><span className="text-gray-500">Waist:</span> {form.waist_cm} cm</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Activity size={18} /> Symptoms</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-gray-500">Cycle:</span> {form.cycle_regularity}</p>
            {form.typical_cycle_length && <p><span className="text-gray-500">Cycle Length:</span> {form.typical_cycle_length} days</p>}
            {form.last_period_date && <p><span className="text-gray-500">Last Period:</span> {form.last_period_date}</p>}
            <p><span className="text-gray-500">Bleeding:</span> {['Spotting', 'Light', 'Medium', 'Heavy'][form.bleeding_intensity! - 1]}</p>
            <p><span className="text-gray-500">Night Sweats:</span> {form.night_sweats}</p>
            <p><span className="text-gray-500">Fatigue:</span> {form.persistent_fatigue ? 'Yes' : 'No'}</p>
            <p className="col-span-2"><span className="text-gray-500">Family History:</span> {form.family_history.join(', ') || 'None'}</p>
          </div>
        </CardContent>
      </Card>
      <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
        <input type="checkbox" checked={form.consent} onChange={e => updateField('consent', e.target.checked)} className="mt-1 rounded" />
        <span className="text-sm">I confirm the patient has given consent for their health data to be stored and used for risk assessment.</span>
      </label>
    </div>
  );

  const renderSuccess = () => (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6 py-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle size={48} className="text-[#2E8B57]" />
      </motion.div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Patient Registered Successfully</h2>
        <p className="text-gray-500 mt-1">{success.full_name} — ID: {success.queue_record_id}</p>
      </div>
      <div className="flex justify-center gap-4 flex-wrap">
        {[
          { label: 'PCOS', score: success.baseline_risk.pcos_score, tier: success.baseline_risk.pcos_tier },
          { label: 'Hormonal', score: success.baseline_risk.hormonal_score, tier: success.baseline_risk.hormonal_tier },
          { label: 'Metabolic', score: success.baseline_risk.metabolic_score, tier: success.baseline_risk.metabolic_tier },
        ].map(({ label, score, tier }) => (
          <div key={label} className="p-4 border rounded-lg min-w-[140px]">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{score}</p>
            <span className={`text-xs px-2 py-1 rounded ${tier === 'high' ? 'bg-red-100 text-red-700' : tier === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{tier}</span>
          </div>
        ))}
      </div>
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800 flex items-center gap-2"><ShieldCheck size={18} /> Share these login credentials with the patient</p>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 bg-white px-3 py-2 rounded border font-mono">{success.temp_password}</code>
            <Button size="sm" variant="outline" onClick={copyPassword}>{copied ? <Check size={16} /> : <Copy size={16} />}</Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-4 justify-center">
        <Button onClick={() => navigate(`/phc/patients/${success.queue_record_id}`)} className="bg-[#2E8B57] hover:bg-[#247049]">View Patient Record</Button>
        <Button variant="outline" onClick={resetWizard}>Register Another</Button>
      </div>
    </motion.div>
  );

  if (success) return <PHCLayout><div className="max-w-lg mx-auto">{renderSuccess()}</div></PHCLayout>;

  return (
    <PHCLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Register Walk-In Patient</h1>
          <p className="text-gray-500">Create a new patient record for a walk-in visit</p>
        </div>
        {renderStepIndicator()}
        {submitError && <Alert variant="destructive" className="mb-4"><AlertDescription>{submitError}</AlertDescription></Alert>}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="mb-6"><CardContent className="pt-4">
              {step === 1 && renderDemographics()}
              {step === 2 && renderPhysical()}
              {step === 3 && renderSymptoms()}
              {step === 4 && renderReview()}
            </CardContent></Card>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-between">
          {step > 1 ? <Button variant="outline" onClick={() => setStep(s => s - 1)}><ArrowLeft size={16} className="mr-2" />Back</Button> : <div />}
          {step < 4 ? (
            <Button onClick={handleNext} disabled={step === 1 ? !isStep1Valid : step === 2 ? !isStep2Valid : !isStep3Valid} className="bg-[#2E8B57] hover:bg-[#247049]">
              Next <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!form.consent || loading} className="bg-[#2E8B57] hover:bg-[#247049]">
              {loading ? 'Creating...' : 'Create Patient Record & Run Assessment'}
            </Button>
          )}
        </div>
      </div>
    </PHCLayout>
  );
}
