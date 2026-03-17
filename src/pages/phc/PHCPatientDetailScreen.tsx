import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PHCMobileNav from '@/components/phc/PHCMobileNav';
import { 
  ArrowLeft, 
  AlertTriangle, 
  User, 
  Activity, 
  FileText, 
  MessageCircle, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Send,
  Phone,
  Video,
  Home,
  ArrowUpRight
} from 'lucide-react';

const PHCPatientDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCondition, setSelectedCondition] = useState('PCOS');
  const [messageText, setMessageText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('1_week');
  const [caseStatus, setCaseStatus] = useState('under_review');
  const [internalNotes, setInternalNotes] = useState('');
  
  // Mock patient data
  const patient = {
    id: id || 'P-00123',
    name: 'Sarah Johnson',
    initials: 'SJ',
    age: 28,
    bmi: 24.8,
    referringSource: 'Self-referred via app',
    referralDate: '2024-03-12',
    assignedTo: 'Dr. James Davis',
    status: 'Under Review',
    scores: {
      pcos: { value: 0.42, tier: 'moderate', lastUpdated: '2 hours ago' },
      hormonal: { value: 0.28, tier: 'low', lastUpdated: '2 hours ago' },
      metabolic: { value: 0.35, tier: 'moderate', lastUpdated: '2 hours ago' }
    },
    dataCompleteness: {
      passive: 85,
      active: 72,
      clinical: 45
    },
    lastCheckIn: '2024-03-14 08:30 AM',
    daysAtPHC: 3
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'symptoms', label: 'Symptom Log', icon: Activity },
    { id: 'clinical', label: 'Clinical Data', icon: FileText },
    { id: 'actions', label: 'Actions', icon: MessageCircle }
  ];

  const adviceTemplates = {
    PCOS: [
      "Reduce refined carbohydrates and sugars — this helps manage insulin resistance common in PCOS",
      "Aim for 150 minutes of moderate aerobic exercise per week (e.g. brisk walking, cycling)",
      "Maintain a consistent sleep schedule — sleep disruption worsens hormonal balance",
      "Track your menstrual cycle monthly using the AI-MSHM app",
      "Manage stress with daily relaxation techniques — chronic stress elevates androgens"
    ],
    'Hormonal Health': [
      "Track your night sweats — note the time they occur and how long they last",
      "Avoid caffeine after 2pm — caffeine disrupts hormonal sleep patterns",
      "Include magnesium-rich foods in your diet (spinach, nuts, seeds) to reduce muscle weakness",
      "Practice pelvic floor exercises to help manage pelvic pressure and breast soreness",
      "Discuss your symptoms with a gynaecologist if night sweats persist more than 3 weeks"
    ],
    'Metabolic Health': [
      "Reduce your daily sodium intake to help manage blood pressure",
      "Walk for 30 minutes daily — consistent low-intensity activity helps metabolic regulation",
      "Keep a food diary for 2 weeks to identify blood sugar trigger foods",
      "Monitor your waist circumference monthly — log it in your AI-MSHM app",
      "Avoid long periods of sitting — take a 5-minute walk every hour if possible"
    ]
  };

  const getScoreColor = (tier: string) => {
    switch(tier) {
      case 'low': return 'text-green-600 border-green-200';
      case 'moderate': return 'text-amber-600 border-amber-200';
      case 'high': return 'text-red-600 border-red-200';
      case 'critical': return 'text-red-700 border-red-300';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const getScoreBadgeColor = (tier: string) => {
    switch(tier) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-amber-100 text-amber-800';
      case 'high': return 'bg-red-100 text-red-700';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-green-100 text-green-800';
      case 'Under Review': return 'bg-amber-100 text-amber-800';
      case 'Action Taken': return 'bg-blue-100 text-blue-800';
      case 'Discharged': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendAdvice = () => {
    // Simulate sending advice
    alert(`Advice sent to ${patient.id}: ${messageText}`);
    setMessageText('');
  };

  const handleBookAppointment = () => {
    // Simulate booking appointment
    alert('Appointment booked successfully');
  };

  const handleCaseStatusUpdate = () => {
    // Simulate case status update
    alert(`Case status updated to: ${caseStatus}`);
  };

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
              <h1 className="text-xl font-semibold text-[#1E1E2E]">Patient Detail View</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {/* Patient Header Card */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#2E8B57] rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">{patient.initials}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E1E2E]">{patient.name}</h2>
                  <p className="text-sm text-gray-600">{patient.id} • Age {patient.age} • BMI {patient.bmi}</p>
                  <p className="text-sm text-gray-600">{patient.referringSource}</p>
                  <p className="text-sm text-gray-600">Referred: {patient.referralDate}</p>
                </div>
              </div>
              
              <div className="flex-1">
                {/* Tri-Condition Score Mini-Strip */}
                <div className="flex gap-4 mb-4">
                  {Object.entries(patient.scores).map(([condition, data]) => (
                    <div key={condition} className="flex-1 text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full border-4 ${getScoreColor(data.tier)} flex items-center justify-center mb-1`}>
                        <span className="text-xs font-bold">{data.value.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-600 capitalize">{condition}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getScoreBadgeColor(data.tier)}`}>
                        {data.tier}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="ml-2 font-medium">{patient.assignedTo}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
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
                      ? 'border-[#2E8B57] text-[#2E8B57]'
                      : 'border-transparent text-gray-600 hover:text-[#1E1E2E]'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(patient.scores).map(([condition, data]) => (
                    <div key={condition} className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="text-lg font-semibold text-[#1E1E2E] mb-4 capitalize">{condition} Score</h3>
                      <div className="flex items-center justify-center mb-4">
                        <div className={`w-16 h-16 rounded-full border-4 ${getScoreColor(data.tier)} flex items-center justify-center`}>
                          <span className="text-lg font-bold">{data.value.toFixed(2)}</span>
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
                  <h3 className="text-lg font-semibold text-[#1E1E2E] mb-4">Data Completeness</h3>
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

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-[#1E1E2E] mb-2">Last Check-in</h3>
                    <p className="text-sm text-gray-600">{patient.lastCheckIn}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-[#1E1E2E] mb-2">Days at PHC</h3>
                    <p className="text-sm text-gray-600">{patient.daysAtPHC} days</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Symptoms Tab */}
            {activeTab === 'symptoms' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex gap-2 mb-6">
                  {['All', 'PCOS Symptoms', 'Hormonal Symptoms', 'Metabolic Symptoms'].map((filter) => (
                    <button
                      key={filter}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Mock symptom entries */}
                <div className="space-y-4">
                  {[
                    {
                      date: '2024-03-14',
                      session: 'Morning',
                      conditions: ['PCOS', 'Hormonal'],
                      scores: { fatigue: 3, pelvicPressure: 2, breastSoreness: 4, nightSweats: 1 },
                      cyclePhase: 'Follicular'
                    },
                    {
                      date: '2024-03-13',
                      session: 'Evening',
                      conditions: ['Metabolic'],
                      scores: { bloodPressure: 2, bloating: 3, acne: 2 },
                      cyclePhase: 'Follicular'
                    }
                  ].map((entry, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-[#1E1E2E]">{entry.date} - {entry.session}</p>
                          <p className="text-sm text-gray-600">Cycle Phase: {entry.cyclePhase}</p>
                        </div>
                        <div className="flex gap-1">
                          {entry.conditions.map((condition) => (
                            <span key={condition} className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(entry.scores).map(([symptom, score]) => (
                          <span key={symptom} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            {symptom}: {score}/10
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Clinical Data Tab */}
            {activeTab === 'clinical' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* PCOS Lab Markers */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-[#1E1E2E] mb-4">PCOS Lab Markers</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Biomarker Name</th>
                          <th className="px-4 py-2 text-left">Value</th>
                          <th className="px-4 py-2 text-left">Unit</th>
                          <th className="px-4 py-2 text-left">Reference Range</th>
                          <th className="px-4 py-2 text-left">Date Collected</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-4 py-2">Testosterone</td>
                          <td className="px-4 py-2">45</td>
                          <td className="px-4 py-2">ng/dL</td>
                          <td className="px-4 py-2">15-70</td>
                          <td className="px-4 py-2">2024-03-10</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Normal</span>
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td className="px-4 py-2">LH/FSH Ratio</td>
                          <td className="px-4 py-2">2.1</td>
                          <td className="px-4 py-2">ratio</td>
                          <td className="px-4 py-2">&lt; 2</td>
                          <td className="px-4 py-2">2024-03-10</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">Flagged</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">PCOS Panel: 7/11 markers — 64%</p>
                </div>

                {/* Hormonal Markers */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-[#1E1E2E] mb-4">Hormonal Markers</h3>
                  <div className="text-center py-8 text-gray-500">
                    No hormonal markers recorded yet
                  </div>
                </div>

                {/* Metabolic Markers */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-[#1E1E2E] mb-4">Metabolic Markers</h3>
                  <div className="text-center py-8 text-gray-500">
                    No metabolic markers recorded yet
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Section A - Lifestyle Advice */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-[#1E1E2E] mb-4">Send Health Advice to Patient</h3>
                  
                  {/* Condition Selector */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Condition Track</Label>
                    <div className="flex gap-2 mt-2">
                      {['PCOS', 'Hormonal Health', 'Metabolic Health'].map((condition) => (
                        <button
                          key={condition}
                          onClick={() => setSelectedCondition(condition)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedCondition === condition
                              ? 'bg-[#2E8B57] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Library */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Advice Templates</Label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {adviceTemplates[selectedCondition as keyof typeof adviceTemplates].map((template, index) => (
                        <button
                          key={index}
                          onClick={() => setMessageText(prev => prev ? `${prev} ${template}` : template)}
                          className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Composer */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-[#1E1E2E]">Message</Label>
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value.slice(0, 500))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                        rows={4}
                        placeholder="Type your health advice message..."
                      />
                      <p className="text-xs text-gray-500 mt-1">{messageText.length}/500 characters</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-[#1E1E2E]">Follow-up Reminder</Label>
                      <select
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                      >
                        <option value="1_week">1 week</option>
                        <option value="2_weeks">2 weeks</option>
                        <option value="1_month">1 month</option>
                        <option value="custom">Custom date</option>
                      </select>
                    </div>

                    <Button
                      onClick={handleSendAdvice}
                      className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46]"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send to Patient App
                    </Button>
                  </div>
                </div>

                {/* Section B - Booking */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-[#1E1E2E] mb-4">Book Follow-Up Appointment</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium text-[#1E1E2E]">Date</Label>
                      <Input type="date" className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-[#1E1E2E]">Time</Label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]">
                        <option>9:00 AM</option>
                        <option>9:15 AM</option>
                        <option>9:30 AM</option>
                        <option>9:45 AM</option>
                        <option>10:00 AM</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Appointment Type</Label>
                    <div className="flex gap-2 mt-2">
                      {['In-Person', 'Phone Call', 'Home Visit'].map((type) => (
                        <button
                          key={type}
                          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Notes (optional)</Label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                      rows={3}
                      placeholder="Add any notes for the appointment..."
                    />
                  </div>

                  <Button
                    onClick={handleBookAppointment}
                    className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46]"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>

                {/* Section C - Case Management */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-[#1E1E2E] mb-4">Update Case Status</h3>
                  
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Case Status</Label>
                    <select
                      value={caseStatus}
                      onChange={(e) => setCaseStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                    >
                      <option value="new">New</option>
                      <option value="under_review">Under Review</option>
                      <option value="action_taken">Action Taken</option>
                      <option value="discharged">Discharged</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm font-medium text-[#1E1E2E]">Internal PHC Notes</Label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                      rows={4}
                      placeholder="Add internal notes (not visible to patient)..."
                    />
                  </div>

                  <Button
                    onClick={handleCaseStatusUpdate}
                    className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46]"
                  >
                    Save Changes
                  </Button>
                </div>

                {/* Section D - Escalation */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-[#1E1E2E] mb-4">Escalate to Federal Medical Centre</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If you believe this patient requires specialist care beyond the PHC scope, you can escalate them to a Federal Medical Centre.
                  </p>
                  
                  <Button
                    onClick={() => navigate(`/phc/refer/${patient.id}`)}
                    className="w-full border border-[#2E8B57] text-[#2E8B57] rounded-lg hover:bg-[#2E8B57] hover:text-white"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Go to Referral Form →
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
      
      <PHCMobileNav />
    </div>
  );
};

export default PHCPatientDetailScreen;
