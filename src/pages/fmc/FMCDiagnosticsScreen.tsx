import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FMCMobileNav from '@/components/fmc/FMCMobileNav';
import { 
  ArrowLeft, 
  Activity, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Plus,
  Search
} from 'lucide-react';

const FMCDiagnosticsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [selectedPatient, setSelectedPatient] = useState(id || '');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [urgency, setUrgency] = useState('routine');
  const [customTest, setCustomTest] = useState('');
  const [showCustomTest, setShowCustomTest] = useState(false);
  
  // Mock data
  const patients = [
    { id: 'P-00123', name: 'Sarah Johnson', age: 28, tier: 'critical' },
    { id: 'P-00124', name: 'Maria Garcia', age: 32, tier: 'critical' },
    { id: 'P-00125', name: 'Amina Yusuf', age: 25, tier: 'high' },
  ];

  const diagnosticTests = {
    PCOS: [
      { name: 'LH/FSH', description: 'Luteinizing Hormone to Follicle-Stimulating Hormone ratio' },
      { name: 'AMH', description: 'Anti-Müllerian Hormone level' },
      { name: 'Free Testosterone', description: 'Free testosterone concentration' },
      { name: 'DHEAS', description: 'Dehydroepiandrosterone sulfate' },
      { name: 'Pelvic Ultrasound', description: 'Transvaginal ultrasound for ovarian morphology' }
    ],
    Hormonal: [
      { name: 'Progesterone Day 21', description: 'Mid-luteal phase progesterone level' },
      { name: 'SHBG', description: 'Sex Hormone-Binding Globulin' },
      { name: 'Oestradiol', description: 'Estradiol (E2) level' },
      { name: 'Cortisol', description: 'Morning cortisol level' },
      { name: 'Prolactin', description: 'Serum prolactin concentration' }
    ],
    Metabolic: [
      { name: 'Lipid Panel (LDL/HDL/TG)', description: 'Complete lipid profile' },
      { name: 'hs-CRP', description: 'High-sensitivity C-reactive protein' },
      { name: 'HbA1c', description: 'Glycated hemoglobin A1c' },
      { name: 'Blood Pressure (clinical)', description: 'Clinical blood pressure measurement' }
    ]
  };

  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'REQ-001',
      patientId: 'P-00123',
      patientName: 'Sarah Johnson',
      tests: ['AMH', 'Free Testosterone', 'LH/FSH'],
      requestDate: '2024-03-14',
      urgency: 'urgent',
      daysElapsed: 2,
      status: 'pending'
    },
    {
      id: 'REQ-002',
      patientId: 'P-00124',
      patientName: 'Maria Garcia',
      tests: ['Lipid Panel', 'HbA1c'],
      requestDate: '2024-03-13',
      urgency: 'routine',
      daysElapsed: 3,
      status: 'pending'
    }
  ]);

  const [receivedResults, setReceivedResults] = useState([
    {
      id: 'RES-001',
      patientId: 'P-00125',
      patientName: 'Amina Yusuf',
      test: 'Progesterone Day 21',
      value: '12.4 ng/mL',
      referenceRange: '5-20 ng/mL',
      status: 'normal',
      receivedDate: '2024-03-14',
      inferenceTriggered: true
    },
    {
      id: 'RES-002',
      patientId: 'P-00125',
      patientName: 'Amina Yusuf',
      test: 'SHBG',
      value: '45 nmol/L',
      referenceRange: '30-100 nmol/L',
      status: 'normal',
      receivedDate: '2024-03-14',
      inferenceTriggered: true
    }
  ]);

  const handleSendRequest = () => {
    if (!selectedPatient || selectedTests.length === 0) {
      alert('Please select a patient and at least one test');
      return;
    }
    
    const patient = patients.find(p => p.id === selectedPatient);
    const newRequest = {
      id: `REQ-${Date.now()}`,
      patientId: selectedPatient,
      patientName: patient?.name,
      tests: [...selectedTests],
      requestDate: new Date().toISOString().split('T')[0],
      urgency: urgency,
      daysElapsed: 0,
      status: 'pending'
    };
    
    setPendingRequests(prev => [newRequest, ...prev]);
    setSelectedTests([]);
    setCustomTest('');
    setShowCustomTest(false);
    
    alert(`Diagnostic request sent to ${patient?.name} for: ${selectedTests.join(', ')}`);
  };

  const handleAddCustomTest = () => {
    if (customTest.trim()) {
      setSelectedTests(prev => [...prev, customTest.trim()]);
      setCustomTest('');
      setShowCustomTest(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    return urgency === 'urgent' ? 'text-red-600' : 'text-gray-600';
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
              <h1 className="text-xl font-semibold text-gray-900">Diagnostics Management</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Request Builder */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Builder</h2>
            
            {/* Patient Selector */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-900">Select Patient</Label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-600"
              >
                <option value="">Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.id} - {patient.name} (Age {patient.age}) - {patient.tier.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-900">Select Diagnostic Tests</Label>
              <div className="space-y-4 mt-2">
                {Object.entries(diagnosticTests).map(([category, tests]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        category === 'PCOS' ? 'bg-purple-500' : 
                        category === 'Hormonal' ? 'bg-rose-500' : 'bg-teal-500'
                      }`}></div>
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {tests.map((test) => (
                        <label key={test.name} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedTests.includes(test.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTests(prev => [...prev, test.name]);
                              } else {
                                setSelectedTests(prev => prev.filter(t => t !== test.name));
                              }
                            }}
                            className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-600"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{test.name}</p>
                            <p className="text-sm text-gray-600">{test.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Test Input */}
              <div className="mt-4">
                {showCustomTest ? (
                  <div className="flex gap-2">
                    <Input
                      value={customTest}
                      onChange={(e) => setCustomTest(e.target.value)}
                      placeholder="Enter custom test name..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <Button onClick={handleAddCustomTest} className="bg-red-600 text-white">
                      Add
                    </Button>
                    <Button variant="outline" onClick={() => setShowCustomTest(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomTest(true)}
                    className="border-dashed border-gray-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Test
                  </Button>
                )}
              </div>
            </div>

            {/* Selected Tests Summary */}
            {selectedTests.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">Selected Tests ({selectedTests.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTests.map((test) => (
                    <span key={test} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {test}
                      <button
                        onClick={() => setSelectedTests(prev => prev.filter(t => t !== test))}
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Urgency and Send */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-900">Request Urgency</Label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <Button
                onClick={handleSendRequest}
                disabled={!selectedPatient || selectedTests.length === 0}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Request to Patient
              </Button>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h2>
            
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending diagnostic requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{request.patientName}</h3>
                        <p className="text-sm text-gray-600">{request.patientId}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency.toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-500">{request.daysElapsed} days since request</p>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-900">Tests Requested:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {request.tests.map((test) => (
                          <span key={test} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Requested: {request.requestDate}</p>
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Awaiting patient upload</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Received Results */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Received Results</h2>
            
            {receivedResults.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No test results received yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedResults.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{result.patientName}</h3>
                        <p className="text-sm text-gray-600">{result.patientId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.inferenceTriggered && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs">Inference triggered</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Test</p>
                        <p className="font-medium">{result.test}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Value</p>
                        <p className="font-medium">{result.value}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reference Range</p>
                        <p className="text-sm">{result.referenceRange}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">Received: {result.receivedDate}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <FMCMobileNav />
    </div>
  );
};

export default FMCDiagnosticsScreen;
