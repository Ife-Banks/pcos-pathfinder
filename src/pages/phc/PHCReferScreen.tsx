import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PHCMobileNav from '@/components/phc/PHCMobileNav';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  FileText, 
  Send,
  CheckCircle,
  AlertTriangle,
  Edit3
} from 'lucide-react';

const PHCReferScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [selectedPatient, setSelectedPatient] = useState(id || '');
  const [urgencyLevel, setUrgencyLevel] = useState('priority');
  const [reasonForEscalation, setReasonForEscalation] = useState('');
  const [phcClinicalNotes, setPhcClinicalNotes] = useState('');
  const [selectedFMC, setSelectedFMC] = useState('');
  const [specialistTypes, setSpecialistTypes] = useState<string[]>([]);
  const [attachSummary, setAttachSummary] = useState(true);
  const [editLetter, setEditLetter] = useState(false);
  const [customLetterText, setCustomLetterText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Mock data
  const patients = [
    { 
      id: 'P-00123', 
      name: 'Sarah Johnson', 
      age: 28, 
      bmi: 24.8,
      scores: { pcos: 0.78, hormonal: 0.45, metabolic: 0.52 },
      highScoreCondition: 'PCOS',
      highScoreTier: 'Critical'
    },
    { 
      id: 'P-00124', 
      name: 'Maria Garcia', 
      age: 32, 
      bmi: 27.2,
      scores: { pcos: 0.42, hormonal: 0.38, metabolic: 0.35 },
      highScoreCondition: 'PCOS',
      highScoreTier: 'Moderate'
    },
  ];

  const fmcList = [
    { id: 'FMC-001', name: 'Federal Medical Centre, Lagos', distance: '2.5 km', specialties: ['Gynaecology', 'Endocrinology', 'Internal Medicine'] },
    { id: 'FMC-002', name: 'National Hospital, Abuja', distance: '450 km', specialties: ['Gynaecology', 'Endocrinology', 'General Physician'] },
    { id: 'FMC-003', name: 'University Teaching Hospital, Ibadan', distance: '120 km', specialties: ['Gynaecology', 'Internal Medicine'] },
  ];

  const urgencyOptions = [
    { value: 'urgent', label: 'Urgent — Within 24 hours', color: 'text-red-600' },
    { value: 'priority', label: 'Priority — Within 1 week', color: 'text-amber-600' },
    { value: 'routine', label: 'Routine — Within 2 weeks', color: 'text-green-600' },
  ];

  const specialistOptions = ['Gynaecologist', 'Endocrinologist', 'Internal Medicine', 'General Physician', 'Other'];

  const handleSendReferral = () => {
    if (!selectedPatient || !selectedFMC || !urgencyLevel || !phcClinicalNotes) {
      alert('Please fill all required fields');
      return;
    }
    
    // Simulate sending referral
    setShowSuccess(true);
  };

  const generateLetterText = () => {
    if (!selectedPatient) return '';
    
    const patient = patients.find(p => p.id === selectedPatient);
    const fmc = fmcList.find(f => f.id === selectedFMC);
    const urgency = urgencyOptions.find(u => u.value === urgencyLevel);
    
    const letter = `${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
City General Hospital
123 Hospital Road, Lagos, Nigeria

To: The Medical Officer,
${fmc?.name || 'Selected Federal Medical Centre'}

Re: Referral of Patient ${patient?.id} — ${urgency?.label || 'Priority'} Referral

Dear Doctor,

We are referring the above-named patient (Age: ${patient?.age}, BMI: ${patient?.bmi}) from City General Hospital to your facility for specialist evaluation.

The AI-MSHM system has flagged a ${patient?.highScoreCondition} Risk Score of ${patient?.scores[patient?.highScoreCondition as keyof typeof patient.scores]?.toFixed(2)} at ${patient?.highScoreTier} tier, which exceeds the clinical management scope of a Primary Health Centre.

Reason for Referral: ${reasonForEscalation || `AI-MSHM Risk Score has reached ${patient?.highScoreTier} tier for ${patient?.highScoreCondition}. Clinical review at a Federal Medical Centre level is required.`}

PHC Assessment & Actions Taken: ${phcClinicalNotes}

We respectfully request that this patient be reviewed by ${specialistTypes.join(', ') || 'a specialist'} at your earliest convenience.

Yours sincerely,
Dr. James Davis
Staff ID: PHC-0234
City General Hospital
Primary Health Centre`;

    return letter;
  };

  if (showSuccess) {
    const patient = patients.find(p => p.id === selectedPatient);
    const fmc = fmcList.find(f => f.id === selectedFMC);
    const urgency = urgencyOptions.find(u => u.value === urgencyLevel);

    return (
      <div className="flex min-h-screen bg-[#F9FAFB]">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#1E1E2E] mb-4">
              Referral Sent Successfully
            </h1>
            
            <div className="bg-white rounded-xl p-6 mb-6 text-left">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Patient:</span>
                  <span className="ml-2 font-medium">{patient?.name} ({patient?.id})</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Referred to:</span>
                  <span className="ml-2 font-medium">{fmc?.name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Priority:</span>
                  <span className="ml-2 font-medium">{urgency?.label}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                ✓ The patient has been notified via the AI-MSHM app
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/phc/patients/${selectedPatient}`)}
                className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46]"
              >
                View Patient Record
              </Button>
              
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setSelectedPatient('');
                  setReasonForEscalation('');
                  setPhcClinicalNotes('');
                  setSelectedFMC('');
                  setSpecialistTypes([]);
                }}
                variant="outline"
                className="w-full border border-[#2E8B57] text-[#2E8B57] rounded-lg"
              >
                Refer Another Patient
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
              <h1 className="text-xl font-semibold text-[#1E1E2E]">Escalate Patient to Federal Medical Centre</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Referral Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-[#1E1E2E] mb-4">Referral Form</h2>
                
                {/* Patient Selector */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-[#1E1E2E]">Patient *</Label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.id} - {patient.name} (Age {patient.age})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient Summary */}
                {selectedPatient && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    {(() => {
                      const patient = patients.find(p => p.id === selectedPatient);
                      return (
                        <div>
                          <h3 className="font-medium text-[#1E1E2E] mb-2">{patient?.name}</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Age:</span>
                              <span className="ml-2">{patient?.age}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">BMI:</span>
                              <span className="ml-2">{patient?.bmi}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">PCOS Score:</span>
                              <span className="ml-2">{patient?.scores.pcos.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Hormonal Score:</span>
                              <span className="ml-2">{patient?.scores.hormonal.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Metabolic Score:</span>
                              <span className="ml-2">{patient?.scores.metabolic.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Critical:</span>
                              <span className="ml-2 text-red-600 font-medium">{patient?.highScoreCondition}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Current Condition Tier */}
                {selectedPatient && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Reason for Escalation</Label>
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">
                        {(() => {
                          const patient = patients.find(p => p.id === selectedPatient);
                          return `${patient?.highScoreCondition}: ${patient?.highScoreTier} — Escalation Required`;
                        })()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reason for Escalation */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-[#1E1E2E]">Reason for Escalation *</Label>
                  <textarea
                    value={reasonForEscalation}
                    onChange={(e) => setReasonForEscalation(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                    rows={3}
                    placeholder="Explain why this patient needs escalation..."
                  />
                </div>

                {/* Urgency Level */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-[#1E1E2E]">Urgency Level *</Label>
                  <div className="space-y-2 mt-2">
                    {urgencyOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="urgency"
                          value={option.value}
                          checked={urgencyLevel === option.value}
                          onChange={(e) => setUrgencyLevel(e.target.value)}
                          className="text-[#2E8B57] focus:ring-[#2E8B57]"
                        />
                        <span className={`font-medium ${option.color}`}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* PHC Clinical Notes */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-[#1E1E2E]">PHC Clinical Notes *</Label>
                  <textarea
                    value={phcClinicalNotes}
                    onChange={(e) => setPhcClinicalNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                    rows={4}
                    placeholder="Add your clinical observations and any actions already taken at PHC level..."
                  />
                </div>

                {/* FMC Selector */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-[#1E1E2E]">Select Receiving Federal Medical Centre *</Label>
                  <select
                    value={selectedFMC}
                    onChange={(e) => setSelectedFMC(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                  >
                    <option value="">Select FMC...</option>
                    {fmcList.map((fmc) => (
                      <option key={fmc.id} value={fmc.id}>
                        {fmc.name} ({fmc.distance})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialist Type */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-[#1E1E2E]">Specialist Type Requested</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {specialistOptions.map((specialist) => (
                      <label key={specialist} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={specialistTypes.includes(specialist)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSpecialistTypes([...specialistTypes, specialist]);
                            } else {
                              setSpecialistTypes(specialistTypes.filter(s => s !== specialist));
                            }
                          }}
                          className="rounded border-gray-300 text-[#2E8B57] focus:ring-[#2E8B57]"
                        />
                        <span className="text-sm">{specialist}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Attach Summary */}
                <div className="mb-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={attachSummary}
                      onChange={(e) => setAttachSummary(e.target.checked)}
                      className="rounded border-gray-300 text-[#2E8B57] focus:ring-[#2E8B57]"
                    />
                    <span className="text-sm text-gray-700">
                      Attach AI-MSHM Clinical Summary PDF
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => {/* Preview updates live */}}
                    variant="outline"
                    className="w-full border border-gray-300 text-gray-700 rounded-lg"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Preview Letter →
                  </Button>
                  
                  <Button
                    onClick={handleSendReferral}
                    className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46]"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Referral & Notify Patient
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Panel - Letter Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#1E1E2E]">Referral Letter Preview</h2>
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-gray-400" />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editLetter}
                        onChange={(e) => setEditLetter(e.target.checked)}
                        className="rounded border-gray-300 text-[#2E8B57] focus:ring-[#2E8B57]"
                      />
                      Edit Letter
                    </label>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  {editLetter ? (
                    <textarea
                      value={customLetterText || generateLetterText()}
                      onChange={(e) => setCustomLetterText(e.target.value)}
                      className="w-full h-96 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-[#2E8B57]"
                    />
                  ) : (
                    <div className="font-serif text-sm whitespace-pre-line">
                      {generateLetterText() || 'Select a patient to generate the referral letter...'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <PHCMobileNav />
    </div>
  );
};

export default PHCReferScreen;
