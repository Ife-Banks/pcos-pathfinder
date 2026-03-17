import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FMCMobileNav from '@/components/fmc/FMCMobileNav';
import { 
  ArrowLeft, 
  UserPlus, 
  Users, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const FMCAssignmentScreen = () => {
  const navigate = useNavigate();
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedClinician, setSelectedClinician] = useState<any>(null);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  
  // Mock data
  const [unassignedPatients, setUnassignedPatients] = useState([
    {
      id: 'P-00123',
      name: 'Sarah Johnson',
      age: 28,
      tier: 'critical',
      scores: { pcos: 0.89, hormonal: 0.76, metabolic: 0.82 },
      referringPHC: 'City General Hospital',
      referralDate: '2024-03-14',
      referralUrgency: 'urgent',
      timeSinceReferral: '2 hours ago'
    },
    {
      id: 'P-00125',
      name: 'Amina Yusuf',
      age: 25,
      tier: 'high',
      scores: { pcos: 0.67, hormonal: 0.58, metabolic: 0.62 },
      referringPHC: 'Ikeja PHC',
      referralDate: '2024-03-12',
      referralUrgency: 'priority',
      timeSinceReferral: '2 days ago'
    },
    {
      id: 'P-00127',
      name: 'Grace Okafor',
      age: 31,
      tier: 'critical',
      scores: { pcos: 0.85, hormonal: 0.72, metabolic: 0.78 },
      referringPHC: 'Lagos Mainland PHC',
      referralDate: '2024-03-13',
      referralUrgency: 'urgent',
      timeSinceReferral: '1 day ago'
    }
  ]);

  const [clinicians, setClinicians] = useState([
    { 
      id: 'C-001', 
      name: 'Dr. Adekunle', 
      specialty: 'Gynaecology', 
      activeCases: 5, 
      status: 'available',
      maxCapacity: 10
    },
    { 
      id: 'C-002', 
      name: 'Dr. Okonkwo', 
      specialty: 'Endocrinology', 
      activeCases: 8, 
      status: 'available',
      maxCapacity: 12
    },
    { 
      id: 'C-003', 
      name: 'Dr. Bello', 
      specialty: 'Internal Medicine', 
      activeCases: 12, 
      status: 'at_capacity',
      maxCapacity: 12
    },
    { 
      id: 'C-004', 
      name: 'Dr. Eze', 
      specialty: 'Gynaecology', 
      activeCases: 3, 
      status: 'available',
      maxCapacity: 10
    }
  ]);

  const stats = {
    criticalUnassigned: unassignedPatients.filter(p => p.tier === 'critical').length,
    highUnassigned: unassignedPatients.filter(p => p.tier === 'high').length,
    totalUnassigned: unassignedPatients.length,
    availableClinicians: clinicians.filter(c => c.status === 'available').length
  };

  const handleAssignPatient = (patient: any, clinician: any) => {
    setUnassignedPatients(prev => prev.filter(p => p.id !== patient.id));
    setClinicians(prev => prev.map(c => 
      c.id === clinician.id 
        ? { ...c, activeCases: c.activeCases + 1, status: c.activeCases + 1 >= c.maxCapacity ? 'at_capacity' : 'available' }
        : c
    ));
    setShowAssignModal(false);
    setSelectedPatient(null);
    setSelectedClinician(null);
  };

  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    
    // Simulate auto-assignment algorithm
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const availableClinicians = clinicians.filter(c => c.status === 'available');
    let updatedPatients = [...unassignedPatients];
    let updatedClinicians = [...clinicians];
    
    // Sort patients by urgency (critical first)
    updatedPatients.sort((a, b) => {
      if (a.tier === 'critical' && b.tier !== 'critical') return -1;
      if (a.tier !== 'critical' && b.tier === 'critical') return 1;
      return 0;
    });
    
    // Assign patients to clinicians with lowest load
    updatedPatients.forEach((patient, index) => {
      const clinicianIndex = index % availableClinicians.length;
      const clinician = availableClinicians[clinicianIndex];
      
      updatedClinicians = updatedClinicians.map(c => 
        c.id === clinician.id 
          ? { ...c, activeCases: c.activeCases + 1, status: c.activeCases + 1 >= c.maxCapacity ? 'at_capacity' : 'available' }
          : c
      );
    });
    
    setUnassignedPatients([]);
    setClinicians(updatedClinicians);
    setIsAutoAssigning(false);
  };

  const getTierBadgeColor = (tier: string) => {
    return tier === 'critical' 
      ? 'bg-red-600 text-white' 
      : 'bg-orange-500 text-white';
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-500';
    return 'text-amber-500';
  };

  const getLoadPercentage = (active: number, max: number) => {
    return (active / max) * 100;
  };

  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
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
              <h1 className="text-xl font-semibold text-gray-900">Clinician Assignment</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border-l-4 border-red-600">
              <p className="text-sm text-gray-600">Critical Unassigned</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalUnassigned}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
              <p className="text-sm text-gray-600">High Unassigned</p>
              <p className="text-2xl font-bold text-orange-500">{stats.highUnassigned}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-gray-600">
              <p className="text-sm text-gray-600">Total Unassigned</p>
              <p className="text-2xl font-bold text-gray-700">{stats.totalUnassigned}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
              <p className="text-sm text-gray-600">Available Clinicians</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableClinicians}</p>
            </div>
          </div>

          {/* Auto-Assign Button */}
          {stats.totalUnassigned > 0 && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Auto-Assignment Available</h3>
                  <p className="text-sm text-gray-600">
                    System can optimally assign all {stats.totalUnassigned} unassigned patients to available clinicians
                  </p>
                </div>
                <Button
                  onClick={handleAutoAssign}
                  disabled={isAutoAssigning || stats.availableClinicians === 0}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isAutoAssigning ? 'Assigning...' : 'Auto-Assign All'}
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unassigned Patients */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Unassigned Patients</h2>
              
              {unassignedPatients.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Patients Assigned</h3>
                  <p className="text-gray-600">Great job! No unassigned patients remaining.</p>
                </div>
              ) : (
                unassignedPatients.map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-lg p-4 border-2 ${
                      patient.tier === 'critical' ? 'border-red-200' : 'border-orange-200'
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(patient.tier)}`}>
                          {patient.tier.toUpperCase()}
                        </span>
                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                        <span className="text-gray-600">{patient.age} years</span>
                      </div>
                      
                      <span className="text-sm text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {patient.timeSinceReferral}
                      </span>
                    </div>
                    
                    <div className="flex gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">PCOS:</span>
                        <span className={`ml-1 font-medium ${getScoreColor(patient.scores.pcos)}`}>
                          {patient.scores.pcos.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Hormonal:</span>
                        <span className={`ml-1 font-medium ${getScoreColor(patient.scores.hormonal)}`}>
                          {patient.scores.hormonal.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Metabolic:</span>
                        <span className={`ml-1 font-medium ${getScoreColor(patient.scores.metabolic)}`}>
                          {patient.scores.metabolic.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>From: {patient.referringPHC}</p>
                        <p>Urgency: {patient.referralUrgency}</p>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowAssignModal(true);
                        }}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Clinician Roster */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Clinician Roster</h2>
              
              {clinicians.map((clinician, index) => (
                <motion.div
                  key={clinician.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-lg p-4 border-2 ${
                    clinician.status === 'available' ? 'border-gray-200' : 'border-gray-300'
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{clinician.name}</h3>
                      <p className="text-sm text-gray-600">{clinician.specialty}</p>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      clinician.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {clinician.status === 'available' ? 'Available' : 'At Capacity'}
                    </span>
                  </div>
                  
                  {/* Case Load Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Case Load</span>
                      <span className="font-medium">{clinician.activeCases}/{clinician.maxCapacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getLoadColor(getLoadPercentage(clinician.activeCases, clinician.maxCapacity))}`}
                        style={{ width: `${getLoadPercentage(clinician.activeCases, clinician.maxCapacity)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className={clinician.activeCases > 0 ? 'font-medium' : ''}>
                        {clinician.activeCases} active cases
                      </span>
                    </div>
                    
                    {clinician.status === 'available' && (
                      <Button
                        onClick={() => {
                          setSelectedClinician(clinician);
                          setShowAssignModal(true);
                        }}
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Patient
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Case Load Summary Chart */}
          <div className="mt-8 bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Load Summary</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Cases per Clinician Chart</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedPatient ? 'Assign Clinician' : 'Select Patient'}
            </h3>
            
            {selectedPatient && !selectedClinician && (
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedPatient.name} ({selectedPatient.id})</p>
                  <p className="text-sm text-gray-600">Tier: {selectedPatient.tier.toUpperCase()}</p>
                  <p className="text-sm text-gray-600">Urgency: {selectedPatient.referralUrgency}</p>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {clinicians.filter(c => c.status === 'available').map((clinician) => (
                    <div
                      key={clinician.id}
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors"
                      onClick={() => setSelectedClinician(clinician)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{clinician.name}</p>
                          <p className="text-sm text-gray-600">{clinician.specialty}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            Available
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {clinician.activeCases}/{clinician.maxCapacity} cases
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPatient && selectedClinician && (
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">Assign {selectedPatient.name} to:</p>
                  <p className="text-lg font-semibold">{selectedClinician.name}</p>
                  <p className="text-sm text-gray-600">{selectedClinician.specialty}</p>
                </div>

                <Button
                  onClick={() => handleAssignPatient(selectedPatient, selectedClinician)}
                  className="w-full bg-red-600 text-white hover:bg-red-700"
                >
                  Confirm Assignment
                </Button>
              </div>
            )}

            {selectedClinician && !selectedPatient && (
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedClinician.name}</p>
                  <p className="text-sm text-gray-600">{selectedClinician.specialty}</p>
                  <p className="text-sm text-gray-600">Current load: {selectedClinician.activeCases}/{selectedClinician.maxCapacity}</p>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {unassignedPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-gray-600">{patient.id} • {patient.age} years</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${getTierBadgeColor(patient.tier)}`}>
                            {patient.tier.toUpperCase()}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {patient.timeSinceReferral}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPatient(null);
                  setSelectedClinician(null);
                }}
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

export default FMCAssignmentScreen;
