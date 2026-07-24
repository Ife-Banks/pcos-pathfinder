import { phcAPI } from '@/services/phcService';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneInput from '@/components/ui/PhoneInput';
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
  gender: 'female' | 'male';
  nationality: string;
  ethnicity: string;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
  genotype: 'AA' | 'AS' | 'AC' | 'SS' | 'SC' | '';
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
  gender: 'female', nationality: '', ethnicity: '', blood_group: '', genotype: '',
  height_cm: null, weight_kg: null, waist_cm: null,
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
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');
  const [lookupFound, setLookupFound] = useState(false);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleLookup = async () => {
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setLookupMessage('');
    setLookupFound(false);
    try {
      const isEmail = lookupQuery.includes('@');
      const params = isEmail ? { email: lookupQuery.trim() } : { phone: lookupQuery.trim() };
      const res = await phcAPI.lookupPatient(params);
      const body = res;
      if (body?.data) {
        const d = body.data;
        setForm(prev => ({
          ...prev,
          first_name: d.first_name || prev.first_name,
          last_name: d.last_name || prev.last_name,
          email: d.email || prev.email,
          phone: d.phone || prev.phone,
          date_of_birth: d.date_of_birth || prev.date_of_birth,
          gender: d.gender || prev.gender,
          ethnicity: d.ethnicity || prev.ethnicity,
          height_cm: d.height_cm ?? prev.height_cm,
          weight_kg: d.weight_kg ?? prev.weight_kg,
          cycle_regularity: d.cycle_regularity || prev.cycle_regularity,
          typical_cycle_length: d.typical_cycle_length ?? prev.typical_cycle_length,
          acanthosis_nigricans: d.has_skin_changes === true ? true : d.has_skin_changes === false ? false : prev.acanthosis_nigricans,
        }));
        setLookupFound(true);
        if (d.registered_hcc) {
          setLookupMessage(`Patient found and already registered at ${d.registered_hcc}.`);
        } else {
          setLookupMessage('Patient found. Fields pre-filled.');
        }
      } else {
        setLookupMessage('No patient found. Fill in the form manually.');
      }
    } catch {
      setLookupMessage('Lookup failed. Fill in the form manually.');
    } finally {
      setLookupLoading(false);
    }
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

  const isStep1Valid = Boolean(
    form.first_name?.trim() &&
    form.last_name?.trim() &&
    form.email?.trim() &&
    form.phone?.trim() &&
    /^\+234\d{10}$/.test(form.phone) &&
    form.nationality &&
    form.ethnicity &&
    form.blood_group &&
    form.genotype
  );
  const isStep2Valid = true; // Measurements are optional for walk-ins
  const isStep3Valid = true; // Symptoms are optional for walk-ins

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
      const body = await phcAPI.registerWalkInComprehensive({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        date_of_birth: form.date_of_birth || undefined,
        gender: form.gender,
        nationality: form.nationality || undefined,
        ethnicity: form.ethnicity || undefined,
        blood_group: form.blood_group || undefined,
        genotype: form.genotype || undefined,
        condition: 'pcos',
        severity: 'moderate',
        height_cm: form.height_cm ?? undefined,
        weight_kg: form.weight_kg ?? undefined,
        waist_cm: form.waist_cm ?? undefined,
        acanthosis_nigricans: form.acanthosis_nigricans === true ? 'yes' : form.acanthosis_nigricans === false ? 'no' : 'not_sure',
        cycle_regularity: form.cycle_regularity ?? undefined,
        typical_cycle_length: form.gender === 'female' ? form.typical_cycle_length ?? undefined : undefined,
        last_period_date: form.gender === 'female' && form.last_period_date ? form.last_period_date : undefined,
        bleeding_intensity: form.bleeding_intensity ? ['spotting', 'light', 'medium', 'heavy'][form.bleeding_intensity - 1] : undefined,
        night_sweats: form.night_sweats ?? undefined,
        fatigue_level: form.persistent_fatigue === true ? 'severe' : form.persistent_fatigue === false ? 'none' : undefined,
        family_history: form.family_history.length > 0 ? form.family_history : [],
        consent_given: true,
      });
      
      if (body?.patient_id) {
        setSuccess({
          patient_id: body.patient_id,
          full_name: body.patient_name || `${form.first_name} ${form.last_name}`,
          temp_password: body.temp_password || '',
          queue_record_id: body.phc_record_id || body.record_id || '',
        });

        try {
          await phcAPI.sendCredentials(body.patient_id, form.phone);
        } catch (err) {
          console.error('Failed to send credentials:', err);
        }
      }
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: unknown; status?: number } };
      console.error('Registration error status:', err.response?.status);
      console.error('Registration error data:', JSON.stringify(err.response?.data, null, 2));
      const data = err.response?.data as Record<string, unknown> | undefined;
      const msg = (data?.message || data?.detail || err.message || 'Registration failed. Please try again.') as string;
      setSubmitError(`Error ${err.response?.status || ''}: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    if (!success) return;
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
            <span className={`ml-2 text-sm hidden sm:inline ${active ? 'text-[#2E8B57] font-medium' : 'text-gray-700'}`}>{s}</span>
            {i < 3 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > stepNum ? 'bg-[#2E8B57]' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );

  const renderDemographics = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-blue-800">Already have the patient's phone or email? Look them up to pre-fill.</p>
        <div className="flex gap-2">
          <Input
            placeholder="Phone number or email"
            value={lookupQuery}
            onChange={e => { setLookupQuery(e.target.value); setLookupMessage(''); setLookupFound(false); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleLookup(); } }}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleLookup} disabled={lookupLoading || !lookupQuery.trim()}>
            {lookupLoading ? 'Looking up...' : 'Look up'}
          </Button>
        </div>
        {lookupMessage && (
          <p className={`text-sm ${lookupFound ? 'text-green-700' : 'text-gray-600'}`}>{lookupMessage}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input id="first_name" value={form.first_name} onChange={e => updateField('first_name', e.target.value)} placeholder="Enter first name" />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input id="last_name" value={form.last_name} onChange={e => updateField('last_name', e.target.value)} placeholder="Enter last name" />
        </div>
      </div>
      <div>
        <Label htmlFor="dob">Date of Birth *</Label>
        <Input id="dob" type="date" value={form.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} max={new Date().toISOString().split('T')[0]} />
        {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <PhoneInput value={form.phone} onChange={(value) => updateField('phone', value)} />
      </div>
      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input id="email" type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="Enter email address" />
      </div>
      <div>
        <Label>Gender *</Label>
        <div className="flex gap-2 mt-2">
          {(['female', 'male' ] as const).map(g => (
            <PillButton key={g} label={g.charAt(0).toUpperCase() + g.slice(1)} selected={form.gender === g} onClick={() => updateField('gender', g)} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nationality">Nationality *</Label>
          <select
            id="nationality"
            value={form.nationality}
            onChange={(e) => updateField('nationality', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] bg-white"
          >
            <option value="">Select nationality</option>
            <option value="nigerian">Nigerian</option>
            <option value="ghanaian">Ghanaian</option>
            <option value="kenyan">Kenyan</option>
            <option value="ethiopian">Ethiopian</option>
            <option value="south_african">South African</option>
            <option value="cameroonian">Cameroonian</option>
            <option value="senegalese">Senegalese</option>
            <option value="togolese">Togolese</option>
            <option value="beninese">Beninese</option>
            <option value="ugandan">Ugandan</option>
            <option value="tanzanian">Tanzanian</option>
            <option value="american">American (USA)</option>
            <option value="british">British (UK)</option>
            <option value="canadian">Canadian</option>
            <option value="indian">Indian</option>
            <option value="chinese">Chinese</option>
            <option value="other">Other</option>
            <option value="prefer_not">Prefer not to say</option>
          </select>
        </div>
        <div>
          <Label htmlFor="ethnicity">Ethnicity *</Label>
          <select
            id="ethnicity"
            value={form.ethnicity}
            onChange={(e) => updateField('ethnicity', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] bg-white"
          >
            <option value="">Select ethnicity</option>
            <option value="african">African</option>
            <option value="asian">Asian</option>
            <option value="caucasian">White / Caucasian</option>
            <option value="hispanic">Hispanic / Latino</option>
            <option value="middle_eastern">Middle Eastern</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="blood_group">Blood Group *</Label>
          <select
            id="blood_group"
            value={form.blood_group}
            onChange={(e) => updateField('blood_group', e.target.value as FormData['blood_group'])}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] bg-white"
          >
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        <div>
          <Label htmlFor="genotype">Genotype *</Label>
          <select
            id="genotype"
            value={form.genotype}
            onChange={(e) => updateField('genotype', e.target.value as FormData['genotype'])}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] bg-white"
          >
            <option value="">Select genotype</option>
            <option value="AA">AA</option>
            <option value="AS">AS</option>
            <option value="AC">AC</option>
            <option value="SS">SS</option>
            <option value="SC">SC</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPhysical = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="height">Height</Label>
            <select
              value={heightUnit}
              onChange={(e) => {
                const newUnit = e.target.value as 'cm' | 'ft';
                if (newUnit === heightUnit) return;
                if (form.height_cm !== null) {
                  const converted = newUnit === 'ft' ? form.height_cm / 30.48 : form.height_cm * 30.48;
                  updateField('height_cm', Math.round(converted * 10) / 10);
                }
                setHeightUnit(newUnit);
              }}
              className="px-4 py-2.5 text-base border-2 border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-[#2E8B57] font-semibold cursor-pointer min-w-[80px]"
            >
              <option value="cm">cm</option>
              <option value="ft">ft</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const delta = heightUnit === 'cm' ? 1 : 0.1;
              const currentDisplayVal = form.height_cm ? (heightUnit === 'cm' ? form.height_cm : form.height_cm / 30.48) : 0;
              const newDisplayVal = currentDisplayVal - delta;
              updateField('height_cm', heightUnit === 'cm' ? newDisplayVal : newDisplayVal * 30.48);
            }}>-</Button>
            <Input id="height" type="number" value={form.height_cm ? (heightUnit === 'cm' ? form.height_cm : parseFloat((form.height_cm / 30.48).toFixed(2))) : ''} onChange={e => {
              const val = parseFloat(e.target.value);
              updateField('height_cm', isNaN(val) ? null : heightUnit === 'cm' ? val : val * 30.48);
            }} placeholder={heightUnit === 'cm' ? 'Enter height' : 'Enter height'} className="text-center" />
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const delta = heightUnit === 'cm' ? 1 : 0.1;
              const currentDisplayVal = form.height_cm ? (heightUnit === 'cm' ? form.height_cm : form.height_cm / 30.48) : 0;
              const newDisplayVal = currentDisplayVal + delta;
              updateField('height_cm', heightUnit === 'cm' ? newDisplayVal : newDisplayVal * 30.48);
            }}>+</Button>
          </div>
          <p className="text-sm text-gray-700 font-medium mt-1">Select unit from dropdown above</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="weight">Weight</Label>
            <select
              value={weightUnit}
              onChange={(e) => {
                const newUnit = e.target.value as 'kg' | 'lbs';
                if (newUnit === weightUnit) return;
                if (form.weight_kg !== null) {
                  const converted = newUnit === 'lbs' ? form.weight_kg / 0.453592 : form.weight_kg * 0.453592;
                  updateField('weight_kg', Math.round(converted * 10) / 10);
                }
                setWeightUnit(newUnit);
              }}
              className="px-4 py-2.5 text-base border-2 border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-[#2E8B57] font-semibold cursor-pointer min-w-[80px]"
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const delta = 1;
              const currentDisplayVal = form.weight_kg ? (weightUnit === 'kg' ? form.weight_kg : form.weight_kg / 0.453592) : 0;
              const newDisplayVal = currentDisplayVal - delta;
              updateField('weight_kg', weightUnit === 'kg' ? newDisplayVal : newDisplayVal * 0.453592);
            }}>-</Button>
            <Input id="weight" type="number" value={form.weight_kg ? (weightUnit === 'kg' ? form.weight_kg : parseFloat((form.weight_kg / 0.453592).toFixed(1))) : ''} onChange={e => {
              const val = parseFloat(e.target.value);
              updateField('weight_kg', isNaN(val) ? null : weightUnit === 'kg' ? val : val * 0.453592);
            }} placeholder={weightUnit === 'kg' ? 'Enter weight' : 'Enter weight'} className="text-center" />
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const delta = 1;
              const currentDisplayVal = form.weight_kg ? (weightUnit === 'kg' ? form.weight_kg : form.weight_kg / 0.453592) : 0;
              const newDisplayVal = currentDisplayVal + delta;
              updateField('weight_kg', weightUnit === 'kg' ? newDisplayVal : newDisplayVal * 0.453592);
            }}>+</Button>
          </div>
          <p className="text-sm text-gray-700 font-medium mt-1">Select unit from dropdown above</p>
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
        }} placeholder="Enter waist circumference" />
      </div>
      <div>
        <Label>Acanthosis Nigricans *</Label>
        <p className="text-gray-700 font-medium text-xs mb-2">Dark, velvety patches on neck/underarms/groin?</p>
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
      {form.gender === 'female' && (
        <div>
          <Label>Cycle Regularity *</Label>
          <div className="flex gap-2 mt-2">
            {(['regular', 'irregular', 'not_sure'] as const).map(r => (
              <PillButton key={r} label={r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' ')} selected={form.cycle_regularity === r} onClick={() => updateField('cycle_regularity', r)} />
            ))}
          </div>
        </div>
      )}
      {form.gender === 'female' && (
        <>
          <div>
            <Label htmlFor="cycle_length">Typical Cycle Length (days)</Label>
            <Input id="cycle_length" type="number" value={form.typical_cycle_length ?? ''} onChange={e => {
              const val = parseInt(e.target.value);
              updateField('typical_cycle_length', isNaN(val) ? null : val);
            }} placeholder="Enter number of days" />
          </div>
          <div>
            <Label htmlFor="last_period">Last Period Start Date</Label>
            <Input id="last_period" type="date" value={form.last_period_date} onChange={e => updateField('last_period_date', e.target.value)} />
          </div>
        </>
      )}
      {form.gender === 'female' && <div>
        <Label>Bleeding Intensity</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[1, 2, 3, 4].map((val, i) => (
            <PillButton key={val} label={['Spotting', 'Light', 'Medium', 'Heavy'][i]} selected={form.bleeding_intensity === val} onClick={() => updateField('bleeding_intensity', val)} />
          ))}
        </div>
      </div>}
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
          {(form.gender === 'male' 
            ? ['Metabolic-Associated Male Hypogonadism (MAMH)', 'Cardiovascular Disease', 'Hypertension', 'Type 2 Diabetes', 'Endocrine Cancer', 'Chronic Stress & Anxiety', 'Infertility', 'None']
            : ['Polyendocrine Metabolic Ovarian Syndrome (PMOS)', 'Cardiovascular Disease', 'Hypertension', 'Type 2 Diabetes', 'Endocrine Cancer', 'Chronic Stress & Anxiety', 'Infertility', 'None']
          ).map(h => (
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
            <p><span className="text-gray-700 font-medium">Name:</span> {form.first_name} {form.last_name}</p>
            <p><span className="text-gray-700 font-medium">DOB:</span> {form.date_of_birth}</p>
            <p><span className="text-gray-700 font-medium">Phone:</span> {form.phone}</p>
            <p><span className="text-gray-700 font-medium">Email:</span> {form.email || 'Auto-generated'}</p>
            <p><span className="text-gray-700 font-medium">Gender:</span> {form.gender}</p>
            <p><span className="text-gray-700 font-medium">Blood Group:</span> {form.blood_group || 'N/A'}</p>
            <p><span className="text-gray-700 font-medium">Genotype:</span> {form.genotype || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Ruler size={18} /> Physical</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-gray-700 font-medium">Height:</span> {form.height_cm ? `${form.height_cm.toFixed(1)} cm (${(form.height_cm / 30.48).toFixed(2)} ft)` : 'N/A'}</p>
            <p><span className="text-gray-700 font-medium">Weight:</span> {form.weight_kg ? `${form.weight_kg.toFixed(1)} kg (${(form.weight_kg / 0.453592).toFixed(1)} lbs)` : 'N/A'}</p>
            <p><span className="text-gray-700 font-medium">BMI:</span> {bmiData ? `${bmiData.value} (${bmiData.category})` : 'N/A'}</p>
            <p><span className="text-gray-700 font-medium">Acanthosis:</span> {form.acanthosis_nigricans === true ? 'Yes' : form.acanthosis_nigricans === false ? 'No' : 'Not Sure'}</p>
            {form.waist_cm && <p><span className="text-gray-700 font-medium">Waist:</span> {form.waist_cm} cm</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Activity size={18} /> Symptoms</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-gray-700 font-medium">Cycle:</span> {form.cycle_regularity}</p>
            {form.typical_cycle_length && <p><span className="text-gray-700 font-medium">Cycle Length:</span> {form.typical_cycle_length} days</p>}
            {form.last_period_date && <p><span className="text-gray-700 font-medium">Last Period:</span> {form.last_period_date}</p>}
            <p><span className="text-gray-700 font-medium">Bleeding:</span> {['Spotting', 'Light', 'Medium', 'Heavy'][form.bleeding_intensity! - 1]}</p>
            <p><span className="text-gray-700 font-medium">Night Sweats:</span> {form.night_sweats}</p>
            <p><span className="text-gray-700 font-medium">Fatigue:</span> {form.persistent_fatigue ? 'Yes' : 'No'}</p>
            <p className="col-span-2"><span className="text-gray-700 font-medium">Family History:</span> {form.family_history.join(', ') || 'None'}</p>
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
        <p className="text-gray-700 font-medium mt-1">{success.full_name}</p>
        <p className="text-sm text-gray-400">ID: {success.queue_record_id.slice(-8)}</p>
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
      <p className="text-sm text-gray-700 font-medium">Initial assessment is being computed. Check the patient record for risk scores.</p>
      <div className="flex gap-4 justify-center">
        <Button onClick={() => navigate(`/phc/patients/${success.queue_record_id}`)} className="bg-[#2E8B57] hover:bg-[#247049]">View Patient Record</Button>
        <Button variant="outline" onClick={resetWizard}>Register Another</Button>
      </div>
    </motion.div>
  );

  if (success) return <><div className="max-w-lg mx-auto">{renderSuccess()}</div></>;

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Register PHC/Walk-In Patient</h1>
          <p className="text-gray-700 font-medium">Create a new patient record for a walk-in visit</p>
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
            <Button 
              onClick={handleNext} 
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className="bg-[#2E8B57] hover:bg-[#247049] disabled:opacity-50"
            >
              Next <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!form.consent || loading} className="bg-[#2E8B57] hover:bg-[#247049]">
              {loading ? 'Creating patient record, please wait...' : 'Create Patient Record & Run Assessment'}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
