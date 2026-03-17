import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Users, Clock, TrendingUp, UserPlus, Filter, ChevronDown, Search, Bell } from 'lucide-react';
import FMCMobileNav from '@/components/fmc/FMCMobileNav';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationPanel } from '@/components/NotificationPanel';

const FMCDashboardScreen = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const { unreadCount, wsConnected } = useNotifications();
  
  // Mock data
  const [patients, setPatients] = useState([
    {
      id: 'P-00123',
      name: 'Sarah Johnson',
      age: 28,
      scores: { pcos: 0.89, hormonal: 0.76, metabolic: 0.82 },
      tier: 'critical',
      referringPHC: 'City General Hospital',
      referralDate: '2024-03-14',
      referralUrgency: 'urgent',
      assignedClinician: '',
      timeSinceReferral: '2 hours ago'
    },
    {
      id: 'P-00124',
      name: 'Maria Garcia',
      age: 32,
      scores: { pcos: 0.78, hormonal: 0.65, metabolic: 0.71 },
      tier: 'critical',
      referringPHC: 'Lagos Mainland PHC',
      referralDate: '2024-03-13',
      referralUrgency: 'urgent',
      assignedClinician: 'Dr. Adekunle',
      timeSinceReferral: '1 day ago'
    },
    {
      id: 'P-00125',
      name: 'Amina Yusuf',
      age: 25,
      scores: { pcos: 0.67, hormonal: 0.58, metabolic: 0.62 },
      tier: 'high',
      referringPHC: 'Ikeja PHC',
      referralDate: '2024-03-12',
      referralUrgency: 'priority',
      assignedClinician: '',
      timeSinceReferral: '2 days ago'
    },
    {
      id: 'P-00126',
      name: 'Fatima Abdullah',
      age: 30,
      scores: { pcos: 0.72, hormonal: 0.69, metabolic: 0.75 },
      tier: 'high',
      referringPHC: 'Victoria Island PHC',
      referralDate: '2024-03-11',
      referralUrgency: 'routine',
      assignedClinician: 'Dr. Okonkwo',
      timeSinceReferral: '3 days ago'
    }
  ]);

  const [clinicians] = useState([
    { id: 'C-001', name: 'Dr. Adekunle', specialty: 'Gynaecology', activeCases: 5, status: 'available' },
    { id: 'C-002', name: 'Dr. Okonkwo', specialty: 'Endocrinology', activeCases: 8, status: 'available' },
    { id: 'C-003', name: 'Dr. Bello', specialty: 'Internal Medicine', activeCases: 12, status: 'at_capacity' }
  ]);

  // Calculate stats
  const stats = {
    criticalUnassigned: patients.filter(p => p.tier === 'critical' && !p.assignedClinician).length,
    criticalAssigned: patients.filter(p => p.tier === 'critical' && p.assignedClinician).length,
    highUnassigned: patients.filter(p => p.tier === 'high' && !p.assignedClinician).length,
    highAssigned: patients.filter(p => p.tier === 'high' && p.assignedClinician).length,
    totalActive: patients.length
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'critical' && patient.tier === 'critical') ||
                         (selectedFilter === 'high' && patient.tier === 'high') ||
                         (selectedFilter === 'unassigned' && !patient.assignedClinician) ||
                         (selectedFilter === 'assigned' && patient.assignedClinician);
    return matchesSearch && matchesFilter;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'urgency':
        return a.tier === 'critical' ? -1 : b.tier === 'critical' ? 1 : 0;
      case 'time':
        return new Date(a.referralDate).getTime() - new Date(b.referralDate).getTime();
      case 'score':
        return Math.max(b.scores.pcos, b.scores.hormonal, b.scores.metabolic) - 
               Math.max(a.scores.pcos, a.scores.hormonal, a.scores.metabolic);
      default:
        return 0;
    }
  });

  const handleAssignClinician = (patient: any, clinician: any) => {
    setPatients(prev => prev.map(p => 
      p.id === patient.id 
        ? { ...p, assignedClinician: clinician.name }
        : p
    ));
    setShowAssignModal(false);
    setSelectedPatient(null);
  };

  const getTierBadgeColor = (tier: string) => {
    return tier === 'critical' 
      ? 'bg-red-600 text-white border-red-600' 
      : 'bg-orange-500 text-white border-orange-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-500';
    return 'text-amber-500';
  };

  return (
    <div className="flex min-h-screen gradient-surface">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col bg-card border-r border-border">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src="/api/placeholder/32/32" alt="AI-MSHM" className="w-8 h-8" />
            <div>
              <h2 className="text-lg font-bold text-foreground">AI-MSHM</h2>
              <p className="text-xs text-muted-foreground">FMC Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Major Risk Patient Queue</h1>
              <p className="text-sm text-muted-foreground">Federal Medical Centre, Lagos</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground relative"
                onClick={() => setIsNotificationPanelOpen(true)}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-fmc-critical text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Emergency Banner */}
        {stats.criticalUnassigned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-fmc-critical text-primary-foreground px-6 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">
                  {stats.criticalUnassigned} Critical patients are unassigned — assign to a clinician now
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <main className="flex-1 p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-card rounded-lg p-4 border-l-4 border-fmc-critical">
              <p className="text-sm text-muted-foreground">Critical Unassigned</p>
              <p className="text-2xl font-bold text-fmc-critical">{stats.criticalUnassigned}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border-l-4 border-fmc-high">
              <p className="text-sm text-muted-foreground">Critical Assigned</p>
              <p className="text-2xl font-bold text-fmc-high">{stats.criticalAssigned}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border-l-4 border-fmc-high">
              <p className="text-sm text-muted-foreground">High Unassigned</p>
              <p className="text-2xl font-bold text-fmc-high">{stats.highUnassigned}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border-l-4 border-fmc-high/50">
              <p className="text-sm text-muted-foreground">High Assigned</p>
              <p className="text-2xl font-bold text-fmc-high/80">{stats.highAssigned}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border-l-4 border-muted-foreground">
              <p className="text-sm text-muted-foreground">Total Active</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalActive}</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-card rounded-lg p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-input rounded-lg"
                  />
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'high', label: 'High' },
                  { value: 'unassigned', label: 'Unassigned' },
                  { value: 'assigned', label: 'Assigned' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFilter(filter.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedFilter === filter.value
                        ? 'bg-fmc-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-input rounded-lg px-3 py-1 text-sm"
                >
                  <option value="urgency">Urgency</option>
                  <option value="time">Time Since Referral</option>
                  <option value="score">Score</option>
                </select>
              </div>
            </div>
          </div>

          {/* Patient Queue List */}
          <div className="space-y-4">
            {sortedPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-card rounded-lg p-6 border-2 ${
                  patient.tier === 'critical' && !patient.assignedClinician 
                    ? 'border-fmc-critical/30' 
                    : 'border-border'
                } hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => navigate(`/fmc/patients/${patient.id}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(patient.tier)}`}>
                        {patient.tier.toUpperCase()}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
                      <span className="text-muted-foreground">{patient.age} years</span>
                    </div>
                    
                    {/* Scores */}
                    <div className="flex gap-4 mb-3">
                      <div>
                        <span className="text-xs text-muted-foreground">PCOS:</span>
                        <span className={`ml-1 font-medium ${getScoreColor(patient.scores.pcos)}`}>
                          {patient.scores.pcos.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Hormonal:</span>
                        <span className={`ml-1 font-medium ${getScoreColor(patient.scores.hormonal)}`}>
                          {patient.scores.hormonal.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Metabolic:</span>
                        <span className={`ml-1 font-medium ${getScoreColor(patient.scores.metabolic)}`}>
                          {patient.scores.metabolic.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Referral Info */}
                    <div className="text-sm text-muted-foreground">
                      <p>From: {patient.referringPHC}</p>
                      <p>Referred: {patient.referralDate} ({patient.referralUrgency})</p>
                      <p>Time since: {patient.timeSinceReferral}</p>
                    </div>
                  </div>

                  {/* Assignment Status */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Assigned Clinician:</p>
                      <p className={`font-medium ${
                        patient.assignedClinician ? 'text-foreground' : 'text-fmc-critical'
                      }`}>
                        {patient.assignedClinician || 'Unassigned'}
                      </p>
                    </div>
                    
                    {!patient.assignedClinician && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient);
                          setShowAssignModal(true);
                        }}
                        className="bg-fmc-primary text-primary-foreground hover:bg-fmc-primary/90"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Clinician
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {sortedPatients.length === 0 && (
            <div className="bg-card rounded-lg p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </main>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Assign Clinician</h3>
            
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="font-medium text-foreground">{selectedPatient.name} ({selectedPatient.id})</p>
              <p className="text-sm text-muted-foreground">Tier: {selectedPatient.tier.toUpperCase()}</p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {clinicians.map((clinician) => (
                <div
                  key={clinician.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    clinician.status === 'available' 
                      ? 'border-border hover:border-fmc-primary hover:bg-fmc-primary-light' 
                      : 'border-border bg-muted opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => clinician.status === 'available' && handleAssignClinician(selectedPatient, clinician)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{clinician.name}</p>
                      <p className="text-sm text-muted-foreground">{clinician.specialty}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        clinician.status === 'available' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {clinician.status === 'available' ? 'Available' : 'At Capacity'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
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
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPatient(null);
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
      
      <NotificationPanel 
        isOpen={isNotificationPanelOpen} 
        onClose={() => setIsNotificationPanelOpen(false)} 
      />
    </div>
  );
};

export default FMCDashboardScreen;
