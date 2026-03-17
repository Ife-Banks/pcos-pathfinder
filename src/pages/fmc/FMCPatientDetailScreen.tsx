import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FMCMobileNav from '@/components/fmc/FMCMobileNav';
import { 
  ArrowLeft, 
  User, 
  Activity, 
  FileText, 
  TrendingUp, 
  MessageSquare,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Send,
  FileDown
} from 'lucide-react';

const FMCPatientDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [caseStatus, setCaseStatus] = useState('active');
  const [internalNotes, setInternalNotes] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Mock patient data
  const patient = {
    id: id || 'P-00123',
    name: 'Sarah Johnson',
    age: 28,
    bmi: 24.8,
    referringPHC: 'City General Hospital',
    referralDate: '2024-03-14',
    referralUrgency: 'urgent',
    assignedClinician: 'Dr. Adekunle',
    scores: {
      pcos: { value: 0.89, tier: 'critical', lastUpdated: '2 hours ago' },
      hormonal: { value: 0.76, tier: 'high', lastUpdated: '2 hours ago' },
      metabolic: { value: 0.82, tier: 'critical', lastUpdated: '2 hours ago' }
    },
    dataCompleteness: {
      passive: 92,
      active: 85,
      clinical: 78
    },
    shapDrivers: {
      pcos: ['Elevated LH/FSH ratio', 'Irregular menstrual cycles', 'High androgen levels'],
      hormonal: ['Night sweats frequency', 'Muscle weakness severity', 'Breast tenderness'],
      metabolic: ['Elevated blood pressure', 'High waist circumference', 'Insulin resistance markers']
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'data', label: 'Full Data', icon: Activity },
    { id: 'history', label: 'Risk History', icon: TrendingUp },
    { id: 'phc-notes', label: 'PHC Notes', icon: MessageSquare },
    { id: 'actions', label: 'Case Actions', icon: FileText }
  ];

  const clinicians = [
    { id: 'C-001', name: 'Dr. Adekunle', specialty: 'Gynaecology', activeCases: 5, status: 'available' },
    { id: 'C-002', name: 'Dr. Okonkwo', specialty: 'Endocrinology', activeCases: 8, status: 'available' },
    { id: 'C-003', name: 'Dr. Bello', specialty: 'Internal Medicine', activeCases: 12, status: 'at_capacity' }
  ];

  const diagnosticTests = {
    PCOS: ['LH/FSH', 'AMH', 'Free Testosterone', 'DHEAS', 'Pelvic Ultrasound'],
    Hormonal: ['Progesterone Day 21', 'SHBG', 'Oestradiol', 'Cortisol', 'Prolactin'],
    Metabolic: ['Lipid Panel (LDL/HDL/TG)', 'hs-CRP', 'HbA1c', 'Blood Pressure (clinical)']
  };

  const getScoreColor = (tier: string) => {
    switch(tier) {
      case 'low': return 'text-green-600 border-green-200';
      case 'moderate': return 'text-amber-600 border-amber-200';
      case 'high': return 'text-orange-500 border-orange-300';
      case 'critical': return 'text-red-600 border-red-300';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const getScoreBadgeColor = (tier: string) => {
    switch(tier) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-amber-100 text-amber-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignClinician = (clinician: any) => {
    // Simulate assignment
    console.log('Assigning to:', clinician.name);
    setShowAssignModal(false);
  };

  const handleRequestDiagnostics = () => {
    if (selectedTests.length === 0) {
      alert('Please select at least one diagnostic test');
      return;
    }
    alert(`Requesting diagnostics: ${selectedTests.join(', ')}`);
    setSelectedTests([]);
  };

  const handleRequestAppointment = () => {
    if (!appointmentDate) {
      alert('Please select an appointment date');
      return;
    }
    alert(`Appointment requested for: ${appointmentDate}`);
    setAppointmentDate('');
  };

  const handleUpdateCaseStatus = () => {
    alert(`Case status updated to: ${caseStatus}`);
  };

  const handleGeneratePDF = () => {
    alert('Generating comprehensive clinical summary PDF...');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src="/api/placeholder/32/32" alt="AI-MSHM" className="w-8 h-8" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI-MSHM</h2>
              <p className="text-xs text-gray-600">FMC Portal</p>
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
              onClick={() => navigate('/fmc/dashboard')}
              className="text-gray-600 hover:text-red-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Patient Detail View</h1>
            </div>
          </div>
        </header>

        {/* Patient Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-gray-600">{patient.id} • Age {patient.age} • BMI {patient.bmi}</p>
              <p className="text-gray-600">From: {patient.referringPHC} • Referred: {patient.referralDate} ({patient.referralUrgency})</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Assigned Clinician:</p>
                <p className="font-medium text-gray-900">{patient.assignedClinician}</p>
              </div>
              
              <Button
                onClick={() => setShowAssignModal(true)}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Reassign
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Tri-condition Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(patient.scores).map(([condition, data]) => (
                  <div key={condition} className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{condition} Score</h3>
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-20 h-20 rounded-full border-4 ${getScoreColor(data.tier)} flex items-center justify-center`}>
                        <span className="text-xl font-bold">{data.value.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(data.tier)}`}>
                        {data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Last updated: {data.lastUpdated}</p>
                  </div>
                ))}
              </div>

              {/* Data Completeness */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Completeness</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Passive Layer</span>
                      <span>{patient.dataCompleteness.passive}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${patient.dataCompleteness.passive}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Layer</span>
                      <span>{patient.dataCompleteness.active}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full" 
                        style={{ width: `${patient.dataCompleteness.active}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Clinical Layer</span>
                      <span>{patient.dataCompleteness.clinical}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${patient.dataCompleteness.clinical}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SHAP Drivers */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key SHAP Drivers</h3>
                <div className="space-y-4">
                  {Object.entries(patient.shapDrivers).map(([condition, drivers]) => (
                    <div key={condition}>
                      <h4 className="font-medium text-gray-900 mb-2 capitalize">{condition}</h4>
                      <div className="space-y-1">
                        {drivers.map((driver, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span>{driver}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Full Data Tab */}
          {activeTab === 'data' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Passive Layer */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Passive Layer Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">HRV Trend (90-day)</h4>
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">HRV Chart</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">BBT Sequence</h4>
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">BBT Chart</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">rPPG Sessions</h4>
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">rPPG Log</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Layer */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Layer Data</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Symptom Logs</h4>
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Symptom Timeline</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">mFG Score History</h4>
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">mFG Chart</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Layer */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Layer Data</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Biomarker</th>
                        <th className="px-4 py-2 text-left">Value</th>
                        <th className="px-4 py-2 text-left">Reference Range</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-2">Testosterone</td>
                        <td className="px-4 py-2">89 ng/dL</td>
                        <td className="px-4 py-2">15-70</td>
                        <td className="px-4 py-2">2024-03-14</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">High</span>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">LH/FSH Ratio</td>
                        <td className="px-4 py-2">3.2</td>
                        <td className="px-4 py-2">&lt; 2</td>
                        <td className="px-4 py-2">2024-03-14</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">High</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Risk History Tab */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Timelines</h3>
                <div className="space-y-6">
                  {Object.entries(patient.scores).map(([condition, data]) => (
                    <div key={condition}>
                      <h4 className="font-medium text-gray-900 mb-2 capitalize">{condition} Risk Score</h4>
                      <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">{condition} Timeline Chart</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inference Log</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-red-600 pl-4">
                    <p className="font-medium">2024-03-14 14:30 - Critical escalation detected</p>
                    <p className="text-sm text-gray-600">PCOS score increased from 0.78 to 0.89. New clinical data processed.</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <p className="font-medium">2024-03-12 09:15 - High risk confirmed</p>
                    <p className="text-sm text-gray-600">Metabolic score reached 0.82 threshold. Referral initiated.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHC Notes Tab */}
          {activeTab === 'phc-notes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Reason for Referral</h4>
                    <p className="text-gray-600 mt-1">
                      Patient's PCOS Risk Score has reached Critical tier (0.89) with elevated androgen levels and 
                      significant menstrual irregularities. Clinical review at FMC level required for specialist management.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Urgency Rationale</h4>
                    <p className="text-gray-600 mt-1">
                      Urgent referral recommended due to rapid score escalation and patient reporting severe symptoms.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">PHC Actions Taken</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">2024-03-14 - Lifestyle Advice Sent</p>
                    <p className="text-sm text-gray-600">Advised on diet modifications and exercise regimen.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">2024-03-13 - Initial Assessment</p>
                    <p className="text-sm text-gray-600">Completed physical measurements and symptom evaluation.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">2024-03-12 - Patient Registration</p>
                    <p className="text-sm text-gray-600">Walk-in registration completed, baseline assessment initiated.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">PHC Clinical Notes</h3>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Patient presents with significant hirsutism (mFG score 18), irregular menses (6-8 week cycles), 
                    and elevated BMI. Family history positive for Type 2 diabetes. Patient reports increasing 
                    fatigue and night sweats over past 3 months.
                  </p>
                  <p className="text-gray-600">
                    Initial blood work shows elevated testosterone (89 ng/dL) and LH/FSH ratio of 3.2. 
                    Pelvic ultrasound not yet performed. Patient motivated for treatment but requires 
                    specialist management for optimal outcomes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Case Actions Tab */}
          {activeTab === 'actions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Assign/Reassign Clinician */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign / Reassign Clinician</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Currently Assigned:</p>
                    <p className="text-gray-600">{patient.assignedClinician}</p>
                  </div>
                  <Button
                    onClick={() => setShowAssignModal(true)}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Reassign Clinician
                  </Button>
                </div>
              </div>

              {/* Request Additional Diagnostics */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Additional Diagnostics</h3>
                <div className="space-y-4">
                  {Object.entries(diagnosticTests).map(([category, tests]) => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tests.map((test) => (
                          <label key={test} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedTests.includes(test)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTests([...selectedTests, test]);
                                } else {
                                  setSelectedTests(selectedTests.filter(t => t !== test));
                                }
                              }}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-600"
                            />
                            <span className="text-sm">{test}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-4">
                    <select className="border border-gray-300 rounded-lg px-3 py-2">
                      <option>Routine</option>
                      <option>Urgent</option>
                    </select>
                    <Button
                      onClick={handleRequestDiagnostics}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Request to Patient
                    </Button>
                  </div>
                </div>
              </div>

              {/* Request Patient Appointment */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Patient Appointment</h3>
                <div className="flex items-center gap-4">
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <Button
                    onClick={handleRequestAppointment}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Request Appointment
                  </Button>
                </div>
              </div>

              {/* Case Status Update */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Status Update</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Case Status</Label>
                    <select
                      value={caseStatus}
                      onChange={(e) => setCaseStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="active">Active</option>
                      <option value="under_treatment">Under Treatment</option>
                      <option value="resolved">Resolved</option>
                      <option value="referred_externally">Referred Externally</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Internal FMC Notes</Label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={4}
                      placeholder="Add internal notes for FMC staff..."
                    />
                  </div>
                  
                  <Button
                    onClick={handleUpdateCaseStatus}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Update Case Status
                  </Button>
                </div>
              </div>

              {/* Generate Clinical Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Clinical Summary</h3>
                <p className="text-gray-600 mb-4">
                  Generate a comprehensive clinical summary PDF including all risk scores, SHAP values, and complete patient data.
                </p>
                <Button
                  onClick={handleGeneratePDF}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Generate Full Clinical Summary PDF
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Clinician</h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {clinicians.map((clinician) => (
                <div
                  key={clinician.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    clinician.status === 'available' 
                      ? 'border-gray-200 hover:border-red-300 hover:bg-red-50' 
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => clinician.status === 'available' && handleAssignClinician(clinician)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{clinician.name}</p>
                      <p className="text-sm text-gray-600">{clinician.specialty}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        clinician.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {clinician.status === 'available' ? 'Available' : 'At Capacity'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {clinician.activeCases} active cases
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAssignModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <FMCMobileNav />
    </div>
  );
};

export default FMCPatientDetailScreen;
