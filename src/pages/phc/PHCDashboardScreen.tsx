import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PHCMobileNav from '@/components/phc/PHCMobileNav';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationPanel } from '@/components/NotificationPanel';
import { phcAPI } from '@/services/phcService';
import { useAuth } from '@/context/AuthContext';
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
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import logo from '@/assets/logo.png';

const PHCDashboardScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Risk Score ↓");
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phcProfile, setPhcProfile] = useState<any>(null);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const { unreadCount, wsConnected } = useNotifications();

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [queueData, profileData] = await Promise.all([
        phcAPI.getQueue(),
        phcAPI.getPHCProfile(),
      ]);
      
      // Handle both { data: [...] } and [...] response formats
      const patientList = queueData?.data || queueData || [];
      setPatients(patientList);
      
      // Set PHC profile for header
      if (profileData?.data) {
        setPhcProfile(profileData.data);
      } else if (profileData) {
        setPhcProfile(profileData);
      }
    } catch (err: any) {
      console.error('Error fetching queue:', err);
      setError(err?.response?.data?.message || 'Failed to load patient queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Calculate stats from real data
  const stats = {
    totalActive: patients.length,
    moderateRisk: patients.filter(p => p.severity === 'moderate').length,
    lowRisk: patients.filter(p => p.severity === 'mild').length,
    newReferralsToday: patients.filter(p => {
      if (!p.opened_at) return false;
      const opened = new Date(p.opened_at);
      const today = new Date();
      return opened.toDateString() === today.toDateString();
    }).length,
  };

  const filters = ["All", "Moderate", "Low", "New Today", "Awaiting Review", "Action Taken"];
  const sortOptions = ["Risk Score ↓", "Date Referred", "Last Check-In"];

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-amber-600";
    return "text-green-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return "bg-red-100 text-red-700";
    if (score >= 40) return "bg-amber-100 text-amber-800";
    return "bg-green-100 text-green-800";
  };

  const getConditionColor = (condition: string) => {
    switch(condition?.toLowerCase()) {
      case "pcos": return "bg-purple-100 text-purple-800";
      case "maternal": return "bg-rose-100 text-rose-800";
      case "cardiovascular": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "new": return "bg-green-100 text-green-800";
      case "under_review": return "bg-amber-100 text-amber-800";
      case "action_taken": return "bg-blue-100 text-blue-800";
      case "discharged": return "bg-gray-100 text-gray-800";
      case "escalated": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "new": return "New";
      case "under_review": return "Under Review";
      case "action_taken": return "Action Taken";
      case "discharged": return "Discharged";
      case "escalated": return "Escalated";
      default: return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "moderate": return "border-l-4 border-amber-500";
      case "mild": return "";
      default: return "";
    }
  };

  const handlePatientReview = (patientId: string) => {
    navigate(`/phc/patients/${patientId}`);
  };

  const handleEscalate = (patientId: string) => {
    navigate(`/phc/refer/${patientId}`);
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
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
            <p className="text-sm font-medium text-[#1E1E2E]">{phcProfile?.name || 'Loading...'}</p>
            <p className="text-xs text-gray-600">Primary Health Centre</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {[
              { icon: Home, label: "Dashboard", href: "/phc/dashboard", active: true },
              { icon: Users, label: "Patients", href: "/phc/dashboard" },
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
              <h1 className="text-2xl font-semibold text-[#1E1E2E]">Good morning, {user?.full_name?.split(' ')[0] || 'Staff'}</h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchQueue}
                className="p-2 text-gray-600 hover:text-[#2E8B57] transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Alerts Bell */}
              <button 
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2 text-gray-600 hover:text-[#2E8B57] transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{unreadCount > 99 ? '99+' : unreadCount}</span>
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

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchQueue} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#2E8B57]" />
                <p className="text-gray-500 mt-2">Loading patient queue...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && patients.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No patients in queue</p>
                <p className="text-sm text-gray-400">New patients will appear here when detected</p>
              </div>
            )}

            {/* Patient Table */}
            {!isLoading && !error && patients.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => (
                      <tr 
                        key={patient.id} 
                        className={`hover:bg-gray-50 ${getSeverityColor(patient.severity)}`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#2E8B57] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {getInitials(patient.patient?.full_name)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1E1E2E]">
                                {patient.patient?.full_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {patient.patient?.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(patient.condition)}`}>
                            {patient.condition?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            patient.severity === 'moderate' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {patient.severity?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getScoreColor(patient.latest_score || patient.opening_score || 0)}`}>
                              {patient.latest_score || patient.opening_score || 'N/A'}
                            </span>
                            {(patient.latest_score || patient.opening_score) && (
                              <div className={`w-2 h-2 rounded-full ${
                                (patient.latest_score || 0) >= 70 
                                  ? 'bg-red-500' 
                                  : (patient.latest_score || 0) >= 40 
                                    ? 'bg-amber-500' 
                                    : 'bg-green-500'
                              }`}></div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(patient.opened_at)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                            {getStatusLabel(patient.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Button
                            onClick={() => handlePatientReview(patient.id)}
                            className="bg-[#2E8B57] text-white rounded-lg px-3 py-1 text-xs hover:bg-[#256D46]"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && patients.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <PHCMobileNav />
      
      <NotificationPanel 
        isOpen={isNotificationPanelOpen} 
        onClose={() => setIsNotificationPanelOpen(false)} 
      />
    </div>
  );
};

export default PHCDashboardScreen;
