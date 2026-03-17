import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Ruler, Activity, FileText, Check } from 'lucide-react';
import PHCMobileNav from '@/components/phc/PHCMobileNav';

const PHCRegisterScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [demographics, setDemographics] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    gender: 'female',
    ethnicity: '',
    country: 'Nigeria',
    familyHistory: [] as string[]
  });
  
  const [measurements, setMeasurements] = useState({
    unit: 'metric',
    height: '',
    weight: '',
    waistCircumference: '',
    hipCircumference: '',
    acanthosisNigricans: '',
    skinTags: '',
    scalpHairThinning: ''
  });
  
  const [symptoms, setSymptoms] = useState({
    cycleRegularity: '',
    cycleLength: '',
    periodsPerYear: '',
    lastPeriodStart: '',
    bleedingIntensity: '',
    acneSeverity: '',
    nightSweats: '',
    breastSoreness: '',
    muscleWeakness: '',
    crampSeverity: 5,
    fatigueLevel: '',
    highBloodPressure: '',
    abdominalWeight: '',
    hypoglycemiaSymptoms: [] as string[]
  });
  
  const [consent, setConsent] = useState({
    dataConsent: false,
    assessmentConsent: false,
    sendCredentials: true
  });

  const calculateBMI = () => {
    const height = parseFloat(measurements.height);
    const weight = parseFloat(measurements.weight);
    if (!height || !weight) return null;
    const heightInMeters = measurements.unit === 'metric' 
      ? height / 100 // cm to m
      : height * 0.0254; // inches to m
    const weightInKg = measurements.unit === 'metric'
      ? weight
      : weight * 0.453592; // lbs to kg
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const calculateWaistHipRatio = () => {
    const waist = parseFloat(measurements.waistCircumference);
    const hip = parseFloat(measurements.hipCircumference);
    if (!waist || !hip) return null;
    const waistInCm = measurements.unit === 'metric' 
      ? waist
      : waist * 2.54; // inches to cm
    const hipInCm = measurements.unit === 'metric'
      ? hip
      : hip * 2.54; // inches to cm
    return (waistInCm / hipInCm).toFixed(2);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return demographics.firstName && 
               demographics.lastName && 
               demographics.dateOfBirth && 
               demographics.phone && 
               demographics.gender &&
               demographics.ethnicity;
      case 2:
        return measurements.height && measurements.weight;
      case 3:
        return symptoms.cycleRegularity && 
               symptoms.bleedingIntensity && 
               symptoms.acneSeverity &&
               symptoms.nightSweats &&
               symptoms.breastSoreness &&
               symptoms.muscleWeakness &&
               symptoms.fatigueLevel &&
               symptoms.highBloodPressure &&
               symptoms.abdominalWeight;
      case 4:
        return consent.dataConsent && consent.assessmentConsent;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsCreating(false);
      setShowSuccess(true);
    }, 3000);
  };

  if (showSuccess) {
    return (
      <div className="flex min-h-screen bg-[#F9FAFB]">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#1E1E2E] mb-4">
              Patient Registered Successfully
            </h1>
            
            <div className="bg-white rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Patient ID</p>
              <p className="text-xl font-bold text-[#2E8B57] mb-4">P-00456</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">PCOS Risk Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-4 border-purple-200 flex items-center justify-center">
                      <span className="text-xs font-bold">0.42</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">Moderate</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hormonal Risk Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-4 border-rose-200 flex items-center justify-center">
                      <span className="text-xs font-bold">0.28</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Low</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Metabolic Risk Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-4 border-teal-200 flex items-center justify-center">
                      <span className="text-xs font-bold">0.35</span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">Moderate</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                ✓ SMS sent to +234 802 345 6789
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/phc/patients/P-00456')}
                className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46]"
              >
                View Patient Record
              </Button>
              
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setCurrentStep(1);
                  // Reset form
                }}
                variant="outline"
                className="w-full border border-[#2E8B57] text-[#2E8B57] rounded-lg"
              >
                Register Another Patient
              </Button>
            </div>
          </motion.div>
        </div>
        
        <PHCMobileNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src="/api/placeholder/32/32" alt="AI-MSHM" className="w-8 h-8" />
            <div>
              <h2 className="text-lg font-bold text-[#1E1E2E]">AI-MSHM</h2>
              <p className="text-xs text-gray-600">PHC Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/phc/dashboard')}
              className="text-gray-600 hover:text-[#2E8B57]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-[#1E1E2E]">Register Walk-In Patient</h1>
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-[#2E8B57] text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-full h-1 mx-4 ${
                    currentStep > step ? 'bg-[#2E8B57]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between max-w-2xl mt-2">
            <span className="text-xs text-gray-600">Patient Information</span>
            <span className="text-xs text-gray-600">Body Measurements</span>
            <span className="text-xs text-gray-600">Health History</span>
            <span className="text-xs text-gray-600">Review & Consent</span>
          </div>
        </div>

        {/* Form Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/* Step 1: Demographics */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-6 w-6 text-[#2E8B57]" />
                  <h2 className="text-xl font-semibold text-[#1E1E2E]">
                    Step 1 of 4 — Patient Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">First Name *</Label>
                    <Input
                      value={demographics.firstName}
                      onChange={(e) => setDemographics({...demographics, firstName: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Last Name *</Label>
                    <Input
                      value={demographics.lastName}
                      onChange={(e) => setDemographics({...demographics, lastName: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Date of Birth *</Label>
                    <Input
                      type="date"
                      value={demographics.dateOfBirth}
                      onChange={(e) => setDemographics({...demographics, dateOfBirth: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Phone Number *</Label>
                    <Input
                      type="tel"
                      value={demographics.phone}
                      onChange={(e) => setDemographics({...demographics, phone: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1E1E2E]">Email Address</Label>
                  <Input
                    type="email"
                    value={demographics.email}
                    onChange={(e) => setDemographics({...demographics, email: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                    placeholder="Optional — for app account login"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Gender *</Label>
                    <div className="flex gap-2">
                      {['female', 'intersex', 'prefer_not_to_say'].map((option) => (
                        <button
                          key={option}
                          onClick={() => setDemographics({...demographics, gender: option})}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            demographics.gender === option
                              ? 'bg-[#2E8B57] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {option === 'prefer_not_to_say' ? 'Prefer not to say' : 
                           option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Ethnicity *</Label>
                    <select
                      value={demographics.ethnicity}
                      onChange={(e) => setDemographics({...demographics, ethnicity: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                    >
                      <option value="">Select ethnicity</option>
                      <option value="african">African</option>
                      <option value="asian">Asian</option>
                      <option value="caucasian">Caucasian</option>
                      <option value="hispanic">Hispanic</option>
                      <option value="middle_eastern">Middle Eastern</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1E1E2E]">Family History</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['PCOS', 'Type 2 Diabetes', 'Cardiovascular Disease', 'Hypertension', 'None known'].map((condition) => (
                      <label key={condition} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={demographics.familyHistory.includes(condition)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDemographics({...demographics, familyHistory: [...demographics.familyHistory, condition]});
                            } else {
                              setDemographics({...demographics, familyHistory: demographics.familyHistory.filter(h => h !== condition)});
                            }
                          }}
                          className="rounded border-gray-300 text-[#2E8B57] focus:ring-[#2E8B57]"
                        />
                        <span className="text-sm text-gray-700">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Physical Measurements */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Ruler className="h-6 w-6 text-[#2E8B57]" />
                  <h2 className="text-xl font-semibold text-[#1E1E2E]">
                    Step 2 of 4 — Body Measurements
                  </h2>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1E1E2E]">Units</Label>
                  <div className="flex gap-2">
                    {['metric', 'imperial'].map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setMeasurements({...measurements, unit})}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          measurements.unit === unit
                            ? 'bg-[#2E8B57] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {unit === 'metric' ? 'Metric (cm/kg)' : 'Imperial (ft-in/lbs)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Height *</Label>
                    <Input
                      type="number"
                      value={measurements.height}
                      onChange={(e) => setMeasurements({...measurements, height: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                      placeholder={measurements.unit === 'metric' ? '170' : "5'7\""}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Weight *</Label>
                    <Input
                      type="number"
                      value={measurements.weight}
                      onChange={(e) => setMeasurements({...measurements, weight: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                      placeholder={measurements.unit === 'metric' ? '65' : '143'}
                    />
                  </div>
                </div>

                {calculateBMI() && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBMICategory(parseFloat(calculateBMI()!)).color}`}>
                      BMI: {calculateBMI()} — {getBMICategory(parseFloat(calculateBMI()!)).label}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Waist Circumference</Label>
                    <Input
                      type="number"
                      value={measurements.waistCircumference}
                      onChange={(e) => setMeasurements({...measurements, waistCircumference: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                      placeholder="Measure at belly button level"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Hip Circumference</Label>
                    <Input
                      type="number"
                      value={measurements.hipCircumference}
                      onChange={(e) => setMeasurements({...measurements, hipCircumference: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {calculateWaistHipRatio() && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      parseFloat(calculateWaistHipRatio()!) > 0.85 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      Waist-Hip Ratio: {calculateWaistHipRatio()}
                      {parseFloat(calculateWaistHipRatio()!) > 0.85 && ' — Metabolic risk marker detected'}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">
                      Acanthosis Nigricans
                    </Label>
                    <p className="text-xs text-gray-600">
                      Does the patient have dark, velvety skin patches on the neck, underarms, or groin?
                    </p>
                    <div className="flex gap-2">
                      {['yes', 'no', 'not_sure'].map((option) => (
                        <button
                          key={option}
                          onClick={() => setMeasurements({...measurements, acanthosisNigricans: option})}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            measurements.acanthosisNigricans === option
                              ? 'bg-[#2E8B57] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {option === 'not_sure' ? 'Not sure' : option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Skin Tags</Label>
                    <p className="text-xs text-gray-600">
                      Does the patient have small skin tags on the neck or underarms?
                    </p>
                    <div className="flex gap-2">
                      {['yes', 'no'].map((option) => (
                        <button
                          key={option}
                          onClick={() => setMeasurements({...measurements, skinTags: option})}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            measurements.skinTags === option
                              ? 'bg-[#2E8B57] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Scalp Hair Thinning</Label>
                    <p className="text-xs text-gray-600">
                      Is there visible hair thinning or shedding from the scalp?
                    </p>
                    <div className="flex gap-2">
                      {['yes', 'no', 'unsure'].map((option) => (
                        <button
                          key={option}
                          onClick={() => setMeasurements({...measurements, scalpHairThinning: option})}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            measurements.scalpHairThinning === option
                              ? 'bg-[#2E8B57] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Symptoms */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="h-6 w-6 text-[#2E8B57]" />
                  <h2 className="text-xl font-semibold text-[#1E1E2E]">
                    Step 3 of 4 — Health History
                  </h2>
                </div>

                {/* PCOS/Cycle Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#1E1E2E] border-l-4 border-purple-500 pl-3">
                    PCOS / Cycle
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Cycle Regularity</Label>
                      <div className="flex gap-2">
                        {['regular', 'irregular', 'not_sure'].map((option) => (
                          <button
                            key={option}
                            onClick={() => setSymptoms({...symptoms, cycleRegularity: option})}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              symptoms.cycleRegularity === option
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option === 'not_sure' ? 'Not sure' : option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Typical Cycle Length (days)</Label>
                      <Input
                        type="number"
                        value={symptoms.cycleLength}
                        onChange={(e) => setSymptoms({...symptoms, cycleLength: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                        placeholder="28"
                        min="15"
                        max="90"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Periods in Last 12 Months</Label>
                      <Input
                        type="number"
                        value={symptoms.periodsPerYear}
                        onChange={(e) => setSymptoms({...symptoms, periodsPerYear: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                        placeholder="12"
                        min="0"
                        max="15"
                      />
                      {parseInt(symptoms.periodsPerYear) < 8 && symptoms.periodsPerYear && (
                        <p className="text-xs text-amber-600">
                          This may indicate irregular ovulation
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Last Period Start Date</Label>
                      <Input
                        type="date"
                        value={symptoms.lastPeriodStart}
                        onChange={(e) => setSymptoms({...symptoms, lastPeriodStart: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Bleeding Intensity</Label>
                      <div className="flex gap-2 flex-wrap">
                        {['spotting', 'light', 'medium', 'heavy', 'very_heavy'].map((option) => (
                          <button
                            key={option}
                            onClick={() => setSymptoms({...symptoms, bleedingIntensity: option})}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              symptoms.bleedingIntensity === option
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option.replace('_', ' ').charAt(0).toUpperCase() + option.replace('_', ' ').slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Acne Severity</Label>
                      <div className="flex gap-2">
                        {['none', 'mild', 'moderate', 'severe'].map((option) => (
                          <button
                            key={option}
                            onClick={() => setSymptoms({...symptoms, acneSeverity: option})}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              symptoms.acneSeverity === option
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hormonal Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#1E1E2E] border-l-4 border-rose-500 pl-3">
                    Hormonal Imbalance
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Night Sweats Frequency</Label>
                      <div className="flex gap-2 flex-wrap">
                        {['none', 'occasional', 'frequent', 'every_night'].map((option) => (
                          <button
                            key={option}
                            onClick={() => setSymptoms({...symptoms, nightSweats: option})}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              symptoms.nightSweats === option
                                ? 'bg-rose-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option === 'occasional' ? 'Occasional (1-2/week)' :
                             option === 'frequent' ? 'Frequent (3+/week)' :
                             option === 'every_night' ? 'Every night' :
                             option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Breast Soreness</Label>
                      <div className="flex gap-2">
                        {['none', 'mild', 'moderate', 'severe'].map((option) => (
                          <button
                            key={option}
                            onClick={() => setSymptoms({...symptoms, breastSoreness: option})}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              symptoms.breastSoreness === option
                                ? 'bg-rose-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Muscle Weakness</Label>
                      <div className="flex gap-2">
                        {['none', 'mild', 'moderate', 'significant'].map((option) => (
                          <button
                            key={option}
                            onClick={() => setSymptoms({...symptoms, muscleWeakness: option})}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              symptoms.muscleWeakness === option
                                ? 'bg-rose-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Cramp Severity</Label>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={symptoms.crampSeverity}
                          onChange={(e) => setSymptoms({...symptoms, crampSeverity: parseInt(e.target.value)})}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>None</span>
                          <span>Mild</span>
                          <span>Severe</span>
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-medium text-rose-600">{symptoms.crampSeverity}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metabolic Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#1E1E2E] border-l-4 border-teal-500 pl-3">
                    Metabolic Health
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Persistent Fatigue Level</Label>
                      <div className="flex gap-2">
                        {['none', 'mild', 'moderate', 'severe'].map((option) => (
                          <button
                            key={option}
                            onClick={() => setSymptoms({...symptoms, fatigueLevel: option})}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              symptoms.fatigueLevel === option
                                ? 'bg-teal-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option === 'severe' ? 'Severe — affecting daily activities' :
                             option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#1E1E2E]">Known High Blood Pressure</Label>
                      <div className="flex gap-2">
                        {['yes', 'no', 'not_sure'].map((option) => (
                          <button
                            key={option}
                            onClick={() => setSymptoms({...symptoms, highBloodPressure: option})}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              symptoms.highBloodPressure === option
                                ? 'bg-teal-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option === 'not_sure' ? 'Not sure' : option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Abdominal Weight Concentration</Label>
                    <div className="flex gap-2">
                      {['no', 'mild', 'significant'].map((option) => (
                        <button
                          key={option}
                          onClick={() => setSymptoms({...symptoms, abdominalWeight: option})}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            symptoms.abdominalWeight === option
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {option === 'mild' ? 'Mild bloating' :
                           option === 'significant' ? 'Significant abdominal weight' :
                           option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Reactive Hypoglycemia Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['heart_palpitations', 'sudden_shakiness', 'intense_hunger', 'none'].map((symptom) => (
                        <label key={symptom} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={symptoms.hypoglycemiaSymptoms.includes(symptom)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSymptoms({...symptoms, hypoglycemiaSymptoms: [...symptoms.hypoglycemiaSymptoms, symptom]});
                              } else {
                                setSymptoms({...symptoms, hypoglycemiaSymptoms: symptoms.hypoglycemiaSymptoms.filter(s => s !== symptom)});
                              }
                            }}
                            className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700">
                            {symptom === 'heart_palpitations' ? 'Heart palpitations' :
                             symptom === 'sudden_shakiness' ? 'Sudden shakiness' :
                             symptom === 'intense_hunger' ? 'Intense hunger spikes' :
                             'None'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review & Consent */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="h-6 w-6 text-[#2E8B57]" />
                  <h2 className="text-xl font-semibold text-[#1E1E2E]">
                    Step 4 of 4 — Review & Create Account
                  </h2>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-[#1E1E2E] mb-4">Patient Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="ml-2 text-sm font-medium">{demographics.firstName} {demographics.lastName}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Date of Birth:</span>
                        <span className="ml-2 text-sm font-medium">{demographics.dateOfBirth}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="ml-2 text-sm font-medium">{demographics.phone}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{demographics.email || 'Not provided'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Gender:</span>
                        <span className="ml-2 text-sm font-medium capitalize">{demographics.gender.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Ethnicity:</span>
                        <span className="ml-2 text-sm font-medium capitalize">{demographics.ethnicity}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Family History:</span>
                        <span className="ml-2 text-sm font-medium">{demographics.familyHistory.join(', ') || 'None known'}</span>
                      </div>
                      {calculateBMI() && (
                        <div>
                          <span className="text-sm text-gray-600">BMI:</span>
                          <span className="ml-2 text-sm font-medium">{calculateBMI()} ({getBMICategory(parseFloat(calculateBMI()!)).label})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Consent Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-[#1E1E2E] mb-4">Consent & Account Creation</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={consent.dataConsent}
                        onChange={(e) => setConsent({...consent, dataConsent: e.target.checked})}
                        className="mt-1 rounded border-gray-300 text-[#2E8B57] focus:ring-[#2E8B57]"
                      />
                      <span className="text-sm text-gray-700">
                        I confirm this patient has provided verbal consent for their health data to be stored and processed by AI-MSHM
                      </span>
                    </label>
                    
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={consent.assessmentConsent}
                        onChange={(e) => setConsent({...consent, assessmentConsent: e.target.checked})}
                        className="mt-1 rounded border-gray-300 text-[#2E8B57] focus:ring-[#2E8B57]"
                      />
                      <span className="text-sm text-gray-700">
                        I confirm this patient understands their data will be used to generate AI-powered health risk assessments
                      </span>
                    </label>
                    
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={consent.sendCredentials}
                        onChange={(e) => setConsent({...consent, sendCredentials: e.target.checked})}
                        className="mt-1 rounded border-gray-300 text-[#2E8B57] focus:ring-[#2E8B57]"
                      />
                      <span className="text-sm text-gray-700">
                        Send account login details to patient via SMS
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="border border-[#2E8B57] text-[#2E8B57] rounded-lg"
              >
                ← Back
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  disabled={!validateStep()}
                  className="bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46]"
                >
                  Next Step →
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep() || isCreating}
                  className="bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46]"
                >
                  {isCreating ? 'Creating account and running initial assessment...' : 'Create Patient & Run Assessment'}
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
      
      <PHCMobileNav />
    </div>
  );
};

export default PHCRegisterScreen;
