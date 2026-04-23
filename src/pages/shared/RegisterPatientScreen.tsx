import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserPlus,
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerAPI, RegisterPatientData } from '@/services/registerService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RegisterPatientScreenProps {
  facility: string;  // 'phc', 'fmc', 'sth', etc.
  themeColor: string;  // Tailwind color class
  facilityName: string;  // Display name
}

const CONDITION_OPTIONS = [
  { value: 'general', label: 'General Checkup' },
  { value: 'pcos', label: 'PCOS' },
  { value: 'maternal', label: 'Maternal Health' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'cardiovascular', label: 'Cardiovascular' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'severe', label: 'Severe' },
];

const RegisterPatientScreen: React.FC<RegisterPatientScreenProps> = ({
  facility,
  themeColor,
  facilityName,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [registeredPatient, setRegisteredPatient] = useState<RegisterPatientData | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  
  const [formData, setFormData] = useState<RegisterPatientData>({
    full_name: '',
    email: '',
    phone: '',
    age: undefined,
    condition: 'general',
    severity: 'moderate',
    notes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.email && !formData.phone) {
      newErrors.email = 'Email or phone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      const res = await registerAPI.registerPatient(facility, formData);
      
      if (res.data) {
        setMessage({ 
          type: 'success', 
          text: 'Patient registered successfully!' 
        });
        setRegisteredPatient(formData);
        setTempPassword(res.data.temp_password);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.message || 'Failed to register patient' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterPatientData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || undefined : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Success view - show credentials
  if (registeredPatient && tempPassword) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-${themeColor}-50 via-${themeColor}-100 to-${themeColor}-200 flex items-center justify-center p-4`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className={`w-16 h-16 bg-${themeColor}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <CheckCircle className={`w-8 h-8 text-${themeColor}-600`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Complete!
            </h2>
            <p className="text-gray-600 mb-6">
              Patient has been registered at {facilityName}
            </p>
          </div>

          <div className={`bg-${themeColor}-50 rounded-xl p-4 mb-6`}>
            <h3 className="font-semibold text-gray-900 mb-2">Patient Details</h3>
            <p className="text-gray-700">{registeredPatient.full_name}</p>
            {registeredPatient.email && (
              <p className="text-gray-600 text-sm">{registeredPatient.email}</p>
            )}
            {registeredPatient.phone && (
              <p className="text-gray-600 text-sm">{registeredPatient.phone}</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">Share this password with the patient</p>
                <p className="text-amber-900 font-mono text-lg font-bold mt-1 tracking-wider">
                  {tempPassword}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  They should change it on first login
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={() => {
                setRegisteredPatient(null);
                setTempPassword('');
                setFormData({
                  full_name: '',
                  email: '',
                  phone: '',
                  age: undefined,
                  condition: 'general',
                  severity: 'moderate',
                  notes: '',
                });
              }}
              className={`flex-1 bg-${themeColor}-600 hover:bg-${themeColor}-700`}
            >
              Register Another
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Registration form
  return (
    <div className={`min-h-screen bg-gradient-to-br from-${themeColor}-50 via-${themeColor}-100 to-${themeColor}-200 flex items-center justify-center p-4`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Register Patient
            </h1>
            <p className="text-gray-600 text-sm">{facilityName}</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {message && (
            <Alert 
              variant={message.type === 'success' ? 'default' : 'destructive'} 
              className="mb-6"
            >
              {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange('full_name')}
                  className={`pl-10 ${errors.full_name ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="patient@example.com (optional)"
                  value={formData.email}
                  onChange={handleChange('email')}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={formData.age || ''}
                  onChange={handleChange('age')}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={handleChange('condition')}
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background"
                  disabled={loading}
                >
                  {CONDITION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="severity"
                  value={formData.severity}
                  onChange={handleChange('severity')}
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background"
                  disabled={loading}
                >
                  {SEVERITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  className="w-full min-h-[80px] pl-10 pt-2 rounded-md border border-input bg-background"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full bg-${themeColor}-600 hover:bg-${themeColor}-700`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Patient
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPatientScreen;