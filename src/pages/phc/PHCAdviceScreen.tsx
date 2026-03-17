import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PHCMobileNav from '@/components/phc/PHCMobileNav';
import { 
  ArrowLeft, 
  MessageCircle, 
  Search, 
  Send, 
  Calendar,
  CheckCircle,
  RotateCcw,
  Filter
} from 'lucide-react';

const PHCAdviceScreen = () => {
  const navigate = useNavigate();
  
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('PCOS');
  const [messageText, setMessageText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('1_week');
  const [dateFilter, setDateFilter] = useState('last_7_days');
  
  // Mock patients data
  const patients = [
    { id: 'P-00123', name: 'Sarah Johnson', age: 28, tiers: { pcos: 'moderate', hormonal: 'low', metabolic: 'moderate' } },
    { id: 'P-00124', name: 'Maria Garcia', age: 32, tiers: { pcos: 'low', hormonal: 'low', metabolic: 'moderate' } },
    { id: 'P-00125', name: 'Amina Yusuf', age: 25, tiers: { pcos: 'moderate', hormonal: 'moderate', metabolic: 'low' } },
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

  const sentMessages = [
    {
      id: 1,
      date: '2024-03-14',
      patientId: 'P-00123',
      patientName: 'Sarah Johnson',
      condition: 'PCOS',
      message: 'Reduce refined carbohydrates and sugars — this helps manage insulin resistance common in PCOS',
      readStatus: 'Read',
      followUpDate: '2024-03-21'
    },
    {
      id: 2,
      date: '2024-03-13',
      patientId: 'P-00124',
      patientName: 'Maria Garcia',
      condition: 'Metabolic Health',
      message: 'Walk for 30 minutes daily — consistent low-intensity activity helps metabolic regulation',
      readStatus: 'Unread',
      followUpDate: '2024-03-20'
    },
    {
      id: 3,
      date: '2024-03-12',
      patientId: 'P-00125',
      patientName: 'Amina Yusuf',
      condition: 'Hormonal Health',
      message: 'Track your night sweats — note the time they occur and how long they last',
      readStatus: 'Read',
      followUpDate: '2024-03-19'
    }
  ];

  const getTierBadgeColor = (tier: string) => {
    switch(tier) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-amber-100 text-amber-800';
      case 'high': return 'bg-red-100 text-red-700';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendAdvice = () => {
    if (!selectedPatient || !messageText) {
      alert('Please select a patient and enter a message');
      return;
    }
    
    // Simulate sending advice
    const patient = patients.find(p => p.id === selectedPatient);
    alert(`Advice sent to ${patient?.name}: ${messageText}`);
    setMessageText('');
  };

  const handleResend = (messageId: number) => {
    alert(`Resending message ${messageId}`);
  };

  const handleMarkFollowUpDone = (messageId: number) => {
    alert(`Marking follow-up done for message ${messageId}`);
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
              <h1 className="text-xl font-semibold text-[#1E1E2E]">Send Health Advice</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Patient Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for patient..."
                className="pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Template Library */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-[#1E1E2E] mb-4">Template Library</h2>
                
                {/* Condition Selector Tabs */}
                <div className="flex gap-2 mb-4">
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

                {/* Template List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {adviceTemplates[selectedCondition as keyof typeof adviceTemplates].map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setMessageText(prev => prev ? `${prev} ${template}` : template)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Composer */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-[#1E1E2E] mb-4">Compose Message</h2>
                
                {/* Patient Selector */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-[#1E1E2E]">Select Patient</Label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.id} - {patient.name} (Age {patient.age})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient Info Display */}
                {selectedPatient && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const patient = patients.find(p => p.id === selectedPatient);
                      return (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[#1E1E2E]">{patient?.name}</p>
                            <p className="text-sm text-gray-600">{patient?.id} • Age {patient?.age}</p>
                          </div>
                          <div className="flex gap-1">
                            {Object.entries(patient?.tiers || {}).map(([condition, tier]) => (
                              <span key={condition} className={`text-xs px-2 py-1 rounded-full ${getTierBadgeColor(tier)}`}>
                                {condition}: {tier}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Condition Track */}
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

                {/* Message Textarea */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-[#1E1E2E]">Message</Label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value.slice(0, 500))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                    rows={6}
                    placeholder="Type your health advice message..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{messageText.length}/500 characters</p>
                </div>

                {/* Follow-up Reminder */}
                <div className="mb-4">
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

                {/* Send Button */}
                <Button
                  onClick={handleSendAdvice}
                  className="w-full bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46]"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to Patient App
                </Button>
              </div>
            </div>
          </div>

          {/* Sent Messages Log */}
          <div className="mt-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1E1E2E]">Sent Messages Log</h2>
                
                {/* Date Filter */}
                <div className="flex gap-2">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#2E8B57]"
                  >
                    <option value="last_7_days">Last 7 days</option>
                    <option value="last_30_days">Last 30 days</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>

              {/* Messages Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Date Sent</th>
                      <th className="px-4 py-2 text-left">Patient ID</th>
                      <th className="px-4 py-2 text-left">Condition</th>
                      <th className="px-4 py-2 text-left">Message Preview</th>
                      <th className="px-4 py-2 text-left">Read by Patient</th>
                      <th className="px-4 py-2 text-left">Follow-up Date</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentMessages.map((message) => (
                      <tr key={message.id} className="border-t">
                        <td className="px-4 py-2">{message.date}</td>
                        <td className="px-4 py-2">
                          <div>
                            <p className="font-medium">{message.patientId}</p>
                            <p className="text-xs text-gray-600">{message.patientName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {message.condition}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <p className="truncate max-w-xs" title={message.message}>
                            {message.message.substring(0, 80)}...
                          </p>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            message.readStatus === 'Read' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {message.readStatus}
                          </span>
                        </td>
                        <td className="px-4 py-2">{message.followUpDate}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResend(message.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="Resend"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleMarkFollowUpDone(message.id)}
                              className="text-green-600 hover:text-green-800 text-sm"
                              title="Mark Follow-up Done"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <PHCMobileNav />
    </div>
  );
};

export default PHCAdviceScreen;
