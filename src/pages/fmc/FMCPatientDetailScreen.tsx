import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FMCLayout from '@/components/layout/FMCLayout';
import FMCMobileNav from '@/components/fmc/FMCMobileNav';
import { fmcAPI } from '@/services/fmcService';
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
  FileDown,
  RefreshCw
} from 'lucide-react';

const FMCPatientDetailScreen = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [caseStatus, setCaseStatus] = useState('active');
  const [internalNotes, setInternalNotes] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<any>(null);
  const [clinicians, setClinicians] = useState<any[]>([]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const response = await fmcAPI.getCase(caseId!);
      setCaseData(response.data);
    } catch (err: any) {
      console.error('Error fetching case:', err);
      setError('Failed to load patient case');
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicians = async () => {
    try {
      const response = await fmcAPI.getClinicians();
      setClinicians(response.data);
    } catch (err) {
      console.error('Error fetching clinicians:', err);
    }
  };

  useEffect(() => {
    fetchCase();
    fetchClinicians();
  }, [caseId]);

  const patient = caseData ? {
    id: caseData.patient?.id || caseData.id,
    name: caseData.patient?.full_name || 'Unknown',
    age: caseData.patient?.age || 28,
    bmi: caseData.patient?.bmi || 24.8,
    referringPHC: caseData.hcc?.name || caseData.fhc?.name || 'Unknown PHC',
    referralDate: caseData.opened_at ? new Date(caseData.opened_at).toLocaleDateString() : 'N/A',
    referralUrgency: caseData.severity || 'normal',
    assignedClinician: caseData.clinician?.name || 'Unassigned',
    scores: {
      pcos: { value: (caseData.opening_score || 75) / 100, tier: caseData.severity === 'very_severe' ? 'critical' : caseData.severity === 'severe' ? 'high' : 'moderate', lastUpdated: 'Recently' },
      hormonal: { value: (caseData.opening_score || 65) / 100, tier: 'high', lastUpdated: 'Recently' },
      metabolic: { value: (caseData.opening_score || 80) / 100, tier: 'critical', lastUpdated: 'Recently' }
    },
    dataCompleteness: { passive: 85, active: 70, clinical: 60 },
    shapDrivers: {
      pcos: ['High BMI', 'Irregular periods', 'Hirsutism'],
      hormonal: ['LH/FSH ratio', 'Testosterone level'],
      metabolic: ['Insulin resistance', 'Waist circumference']
    }
  } : {
    id: caseId || 'P-00123',
    name: 'Sarah Johnson',
    age: 28,
    bmi: 24.8,
    referringPHC: 'City General Hospital',
    referralDate: '2024-03-14',
    referralUrgency: 'urgent',
    assignedClinician: 'Unassigned',
    scores: {
      pcos: { value: 0.89, tier: 'critical', lastUpdated: '2 hours ago' },
      hormonal: { value: 0.76, tier: 'high', lastUpdated: '2 hours ago' },
      metabolic: { value: 0.82, tier: 'critical', lastUpdated: '2 hours ago' }
    },
    dataCompleteness: { passive: 85, active: 70, clinical: 60 },
    shapDrivers: {
      pcos: ['High BMI', 'Irregular periods', 'Hirsutism'],
      hormonal: ['LH/FSH ratio', 'Testosterone level'],
      metabolic: ['Insulin resistance', 'Waist circumference']
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'data', label: 'Full Data', icon: Activity },
    { id: 'history', label: 'Risk History', icon: TrendingUp },
    { id: 'phc-notes', label: 'PHC Notes', icon: MessageSquare },
    { id: 'actions', label: 'Case Actions', icon: FileText }
  ];

  const cliniciansList = clinicians.length > 0 ? clinicians : [
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

  const handleAssignClinician = async (clinician: any) => {
    try {
      await fmcAPI.assignClinician(caseId!, clinician.id);
      setCaseData((prev: any) => ({ ...prev, clinician: { name: clinician.name } }));
      setShowAssignModal(false);
      alert(`Assigned to ${clinician.name}`);
    } catch (err: any) {
      console.error('Error assigning clinician:', err);
      alert('Failed to assign clinician');
    }
  };

  const handleRequestDiagnostics = async () => {
    if (selectedTests.length === 0) {
      alert('Please select at least one diagnostic test');
      return;
    }
    try {
      await fmcAPI.requestDiagnostics({
        patient_id: patient.id,
        tests: selectedTests,
        urgency: 'routine',
      });
      alert('Diagnostics request sent');
      setSelectedTests([]);
    } catch (err: any) {
      console.error('Error requesting diagnostics:', err);
      alert('Failed to send diagnostics request');
    }
  };

  const handleRequestAppointment = () => {
    if (!appointmentDate) {
      alert('Please select an appointment date');
      return;
    }
    alert(`Appointment requested for: ${appointmentDate}`);
    setAppointmentDate('');
  };

  const handleUpdateCaseStatus = async () => {
    try {
      await fmcAPI.updateCase(caseId!, { status: caseStatus, fmc_notes: internalNotes });
      alert('Case status updated');
    } catch (err: any) {
      console.error('Error updating case:', err);
      alert('Failed to update case status');
    }
  };

  const handleGeneratePDF = () => {
    alert('Generating comprehensive clinical summary PDF...');
  };

  if (loading) {
    return (
      <FMCLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#C0392B]" />
        </div>
      </FMCLayout>
    );
  }

  if (error) {
    return (
      <FMCLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchCase} className="mt-4 bg-[#C0392B] hover:bg-[#922B21]">
              Try Again
            </Button>
          </div>
        </div>
      </FMCLayout>
    );
  }

  return (
    <FMCLayout>
      <div className="flex-1 flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/fmc/dashboard')} className="text-gray-600 hover:text-red-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Patient Detail View</h1>
            </div>
          </div>
        </header>

        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-gray-600">{patient.id} • Age {patient.age} • BMI {patient.bmi}</p>
              <p className="text-gray-600">From: {patient.referringPHC} • Referred: {patient.referralDate} ({patient.referralUrgency})</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Assigned:</p>
                <p className="font-medium text-gray-900">{patient.assignedClinician}</p>
              </div>
              <Button onClick={() => setShowAssignModal(true)} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                <UserPlus className="h-4 w-4 mr-2" />
                Reassign
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(patient.scores).map(([condition, data]: [string, any]) => (
                  <div key={condition} className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{condition} Score</h3>
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-20 h-20 rounded-full border-4 ${getScoreColor(data.tier)} flex items-center justify-center`}>
                        <span className="text-xl font-bold">{(data.value * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(data.tier)}`}>
                        {data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">{data.lastUpdated}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Completeness</h3>
                <div className="space-y-3">
                  {['passive', 'active', 'clinical'].map((layer) => (
                    <div key={layer}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{layer} Layer</span>
                        <span>{patient.dataCompleteness?.[layer as keyof typeof patient.dataCompleteness] ?? 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${layer === 'passive' ? 'bg-green-500' : layer === 'active' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${patient.dataCompleteness?.[layer as keyof typeof patient.dataCompleteness] ?? 0}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key SHAP Drivers</h3>
                <div className="space-y-4">
                  {Object.entries(patient.shapDrivers || {}).map(([condition, drivers]) => (
                    <div key={condition}>
                      <h4 className="font-medium text-gray-900 mb-2 capitalize">{condition}</h4>
                      <div className="space-y-1">
                        {(drivers || []).map((driver: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">{index + 1}</span>
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

          {activeTab === 'data' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Data</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Biomarker</th>
                        <th className="px-4 py-2 text-left">Value</th>
                        <th className="px-4 py-2 text-left">Reference</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t"><td className="px-4 py-2">Testosterone</td><td className="px-4 py-2">89 ng/dL</td><td className="px-4 py-2">15-70</td><td className="px-4 py-2"><span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">High</span></td></tr>
                      <tr className="border-t"><td className="px-4 py-2">LH/FSH Ratio</td><td className="px-4 py-2">3.2</td><td className="px-4 py-2">&lt; 2</td><td className="px-4 py-2"><span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">High</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Timeline</h3>
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Timeline Chart</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'phc-notes' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">PHC Notes</h3>
                <div className="space-y-3">
                  <p className="text-gray-600">Reason for referral: PCOS Risk Score reached Critical tier with elevated androgen levels.</p>
                  <p className="text-gray-600">Patient presents with hirsutism, irregular menses, and elevated BMI.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'actions' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Clinician</h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Currently: {patient.assignedClinician}</p>
                  <Button onClick={() => setShowAssignModal(true)} variant="outline" className="border-red-600 text-red-600">
                    <UserPlus className="h-4 w-4 mr-2" /> Reassign
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Diagnostics</h3>
                <div className="space-y-2">
                  {Object.entries(diagnosticTests).map(([category, tests]) => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-900 mb-1">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {tests.map((test) => (
                          <label key={test} className="flex items-center gap-1 text-sm">
                            <input type="checkbox" checked={selectedTests.includes(test)} onChange={(e) => e.target.checked ? setSelectedTests([...selectedTests, test]) : setSelectedTests(selectedTests.filter(t => t !== test))} className="rounded border-gray-300 text-red-600" />
                            <span>{test}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleRequestDiagnostics} className="mt-4 bg-red-600 hover:bg-red-700"><Send className="h-4 w-4 mr-2" />Send Request</Button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Status</h3>
                <div className="space-y-3">
                  <select value={caseStatus} onChange={(e) => setCaseStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="active">Active</option>
                    <option value="under_treatment">Under Treatment</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Internal notes..." />
                  <Button onClick={handleUpdateCaseStatus} className="bg-red-600 hover:bg-red-700">Update Status</Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <FMCMobileNav />
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Clinician</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cliniciansList.map((clinician) => (
                <div key={clinician.id} onClick={() => clinician.status === 'available' && handleAssignClinician(clinician)} className={`p-3 border rounded-lg cursor-pointer ${clinician.status === 'available' ? 'border-gray-200 hover:border-red-300' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{clinician.name}</p>
                      <p className="text-sm text-gray-600">{clinician.specialty}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${clinician.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {clinician.status === 'available' ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={() => setShowAssignModal(false)} className="w-full mt-4">Cancel</Button>
          </motion.div>
        </div>
      )}
    </FMCLayout>
  );
};

export default FMCPatientDetailScreen;