import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PHCMobileNav from '@/components/phc/PHCMobileNav';
import { 
  Home, 
  Users, 
  UserPlus, 
  MessageCircle, 
  ArrowUpRight, 
  BarChart3, 
  Settings, 
  Bell,
  Search,
  Filter,
  ChevronDown,
  Eye,
  AlertTriangle
} from 'lucide-react';
import logo from '@/assets/logo.png';

// Mock data for demonstration
const mockPatients = [
  {
    id: "P-00123",
    name: "Sarah Johnson",
    age: 28,
    initials: "SJ",
    conditions: ["PCOS", "Hormonal"],
    pcosScore: 0.42,
    hormonalScore: 0.38,
    metabolicScore: 0.25,
    referredDate: "3 days ago",
    status: "New",
    tier: "moderate"
  },
  {
    id: "P-00124", 
    name: "Maria Garcia",
    age: 32,
    initials: "MG",
    conditions: ["Metabolic"],
    pcosScore: 0.18,
    hormonalScore: 0.22,
    metabolicScore: 0.35,
    referredDate: "1 day ago",
    status: "Under Review",
    tier: "low"
  },
  {
    id: "P-00125",
    name: "Amina Yusuf",
    age: 25,
    initials: "AY",
    conditions: ["PCOS", "Hormonal", "Metabolic"],
    pcosScore: 0.78, // High - would show escalation
    hormonalScore: 0.45,
    metabolicScore: 0.52,
    referredDate: "5 days ago",
    status: "Action Taken",
    tier: "high" // This would be escalated
  }
];

const PHCDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Risk Score ↓");
  const [patients, setPatients] = useState(mockPatients);
  const [alertsCount, setAlertsCount] = useState(3);

  // Mock stats
  const stats = {
    totalActive: 47,
    moderateRisk: 12,
    lowRisk: 35,
    newReferralsToday: 3
  };

  const filters = ["All", "Moderate", "Low", "New Today", "Awaiting Review", "Action Taken"];
  const sortOptions = ["Risk Score ↓", "Date Referred", "Last Check-In"];

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-red-600";
    if (score >= 0.4) return "text-amber-600";
    return "text-green-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.7) return "bg-red-100 text-red-700";
    if (score >= 0.4) return "bg-amber-100 text-amber-800";
    return "bg-green-100 text-green-800";
  };

  const getConditionColor = (condition: string) => {
    switch(condition) {
      case "PCOS": return "bg-purple-100 text-purple-800";
      case "Hormonal": return "bg-rose-100 text-rose-800";
      case "Metabolic": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "New": return "bg-green-100 text-green-800";
      case "Under Review": return "bg-amber-100 text-amber-800";
      case "Action Taken": return "bg-blue-100 text-blue-800";
      case "Discharged": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handlePatientReview = (patientId: string) => {
    navigate(`/phc/patients/${patientId}`);
  };

  const handleEscalate = (patientId: string) => {
    navigate(`/phc/refer/${patientId}`);
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="AI-MSHM" className="w-8 h-8" />
            <div>
              <h2 className="text-lg font-bold text-[#1E1E2E]">AI-MSHM</h2>
              <p className="text-xs text-gray-600">PHC Portal</p>
            </div>
          </div>
          
          {/* Facility Info */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-[#1E1E2E]">City General Hospital</p>
            <p className="text-xs text-gray-600">Primary Health Centre</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {[
              { icon: Home, label: "Dashboard", href: "/phc/dashboard", active: true },
              { icon: Users, label: "Patients", href: "/phc/patients" },
              { icon: UserPlus, label: "Register Patient", href: "/phc/register" },
              { icon: MessageCircle, label: "Send Advice", href: "/phc/advice" },
              { icon: ArrowUpRight, label: "Refer to FMC", href: "/phc/refer" },
              { icon: BarChart3, label: "Analytics", href: "/phc/analytics" },
              { icon: Settings, label: "Settings", href: "/phc/settings" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active 
                    ? "bg-[#2E8B57] text-white" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#1E1E2E]"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Info */}
        <div className="mt-auto p-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-[#2E8B57] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">JD</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#1E1E2E]">Dr. James Davis</p>
              <p className="text-xs text-gray-600">Staff ID: PHC-0234</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#1E1E2E]">Good morning, James</h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Alerts Bell */}
              <button 
                onClick={() => navigate('/phc/alerts')}
                className="relative p-2 text-gray-600 hover:text-[#2E8B57] transition-colors"
              >
                <Bell className="h-5 w-5" />
                {alertsCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{alertsCount}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-[#2E8B57] p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Active Patients</h3>
              <p className="text-2xl font-bold text-[#1E1E2E]">{stats.totalActive}</p>
              <p className="text-xs text-gray-600">Minor Risk cases</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-[#F59E0B] p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Moderate Risk</h3>
              <p className="text-2xl font-bold text-amber-600">{stats.moderateRisk}</p>
              <p className="text-xs text-gray-600">Require attention</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-[#2E8B57] p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Low Risk</h3>
              <p className="text-2xl font-bold text-green-600">{stats.lowRisk}</p>
              <p className="text-xs text-gray-600">Continue monitoring</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-[#2E8B57] p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">New Referrals Today</h3>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-[#1E1E2E]">{stats.newReferralsToday}</p>
                {stats.newReferralsToday > 0 && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <p className="text-xs text-gray-600">Referred to this PHC today</p>
            </div>
          </div>

          {/* Patient Queue Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1E1E2E] border-l-4 border-[#2E8B57] pl-3">
                  Minor Risk Patient Queue
                </h2>
              </div>
              
              <div className="flex items-center gap-3 mt-4 lg:mt-0">
                <Button 
                  onClick={() => navigate('/phc/register')}
                  className="bg-[#2E8B57] text-white rounded-lg px-4 py-2 hover:bg-[#256D46]"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register Walk-In Patient
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E8B57]"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedFilter === filter
                          ? "bg-[#2E8B57] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <div className="relative">
                    <button className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-lg text-sm">
                      {sortBy}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition Flags</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PCOS Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hormonal Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metabolic Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className={`hover:bg-gray-50 ${patient.tier === 'high' ? 'border-l-4 border-red-500' : ''}`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#2E8B57] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">{patient.initials}</span>
                          </div>
                          <span className="text-sm font-medium text-[#1E1E2E]">{patient.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{patient.age}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {patient.conditions.map((condition) => (
                            <span key={condition} className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(condition)}`}>
                              {condition}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {patient.tier === 'high' ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            ESCALATE
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getScoreColor(patient.pcosScore)}`}>
                              {patient.pcosScore.toFixed(2)}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getScoreBadge(patient.pcosScore).split(' ')[0]}`}></div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getScoreColor(patient.hormonalScore)}`}>
                            {patient.hormonalScore.toFixed(2)}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${getScoreBadge(patient.hormonalScore).split(' ')[0]}`}></div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getScoreColor(patient.metabolicScore)}`}>
                            {patient.metabolicScore.toFixed(2)}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${getScoreBadge(patient.metabolicScore).split(' ')[0]}`}></div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{patient.referredDate}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {patient.tier === 'high' ? (
                          <Button
                            onClick={() => handleEscalate(patient.id)}
                            className="bg-red-600 text-white rounded-lg px-3 py-1 text-xs hover:bg-red-700"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Escalate to FMC
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handlePatientReview(patient.id)}
                            className="bg-[#2E8B57] text-white rounded-lg px-3 py-1 text-xs hover:bg-[#256D46]"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing 1 to {patients.length} of {patients.length} patients
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <PHCMobileNav />
    </div>
  );
};

export default PHCDashboard;
