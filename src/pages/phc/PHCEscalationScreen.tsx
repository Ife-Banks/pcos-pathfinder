import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Heart,
  Search,
  Filter,
  Eye,
  Send,
  Hospital,
  Ambulance,
  Phone,
  Mail,
  Calendar,
  TrendingUp
} from "lucide-react";
import { phcAPI } from "@/services/phcService";
import { PHCRecord } from "@/types/phc";

const PHCEscalationScreen = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PHCRecord[]>([]);
  const [fmcs, setFmcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<PHCRecord | null>(null);
  const [isEscalating, setIsEscalating] = useState(false);
  
  const [escalationForm, setEscalationForm] = useState({
    urgency: 'medium',
    notes: '',
    target_fmc: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only records that can be escalated (not already escalated or discharged)
      const response = await phcAPI.getQueue({ status: 'under_review' });
      setRecords(response.data);
      
    } catch (error: any) {
      console.error('Error fetching records:', error);
      setError('Failed to load patient records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFMCs = async () => {
    try {
      const response = await phcAPI.getFMCs();
      setFmcs(response.data);
    } catch (error: any) {
      console.error('Error fetching FMCs:', error);
      // FMCs are optional, so don't set error
    }
  };

  const handleEscalate = async () => {
    if (!selectedRecord) return;
    
    try {
      setError(null);
      setSuccess(null);
      setIsEscalating(true);
      
      await phcAPI.escalateRecord(selectedRecord.id, {
        urgency: escalationForm.urgency,
        notes: escalationForm.notes,
      });
      
      setSuccess('Patient escalated to FMC successfully!');
      
      // Remove from records list
      setRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
      
      // Reset form
      setSelectedRecord(null);
      setEscalationForm({
        urgency: 'medium',
        notes: '',
        target_fmc: '',
      });
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Error escalating record:', error);
      setError('Failed to escalate patient. Please try again.');
    } finally {
      setIsEscalating(false);
    }
  };

  const handleSelectRecord = (record: PHCRecord) => {
    setSelectedRecord(record);
    setEscalationForm(prev => ({
      ...prev,
      notes: `Patient: ${record.patient.full_name}\nCondition: ${record.condition_label}\nRisk Score: ${record.latest_score}\n\n`,
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-amber-100 text-amber-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'pcos': return 'bg-purple-100 text-purple-800';
      case 'maternal': return 'bg-pink-100 text-pink-800';
      case 'cardiovascular': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeSinceReferred = (date: string) => {
    const now = new Date();
    const referralDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - referralDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getHighRiskPatients = () => {
    return records.filter(record => 
      record.severity === 'severe' || 
      record.latest_score >= 70
    );
  };

  const getModerateRiskPatients = () => {
    return records.filter(record => 
      record.severity === 'moderate' || 
      (record.latest_score >= 40 && record.latest_score < 70)
    );
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || record.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  const severityLevels = [
    { value: 'all', label: 'All Severities' },
    { value: 'mild', label: 'Low Risk' },
    { value: 'moderate', label: 'Moderate Risk' },
    { value: 'severe', label: 'High Risk' },
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - Routine', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Medium - Priority', color: 'bg-amber-100 text-amber-800' },
    { value: 'high', label: 'High - Urgent', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical - Emergency', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    fetchRecords();
    fetchFMCs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E8B57]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/phc/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Referral to FMC</h1>
                <p className="text-gray-600">Escalate patients to Federal Medical Centre</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success/Error Alerts */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Urgent Cases Alert */}
        {getHighRiskPatients().length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <Ambulance className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{getHighRiskPatients().length} high-risk patients</strong> require immediate escalation to FMC for specialized care.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#2E8B57]" />
                    Patients for Escalation
                  </span>
                  <Badge className="bg-[#2E8B57] text-white">
                    {filteredRecords.length} patients
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredRecords.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No patients available for escalation</p>
                    </div>
                  ) : (
                    filteredRecords.map((record) => (
                      <div
                        key={record.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedRecord?.id === record.id ? 'bg-red-50' : ''
                        }`}
                        onClick={() => handleSelectRecord(record)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {record.patient.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {record.patient.full_name}
                              </h4>
                              {(record.severity === 'severe' || record.latest_score >= 70) && (
                                <Badge className="bg-red-500 text-white text-xs">
                                  HIGH RISK
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2 mb-2">
                              <Badge className={getConditionColor(record.condition)}>
                                {record.condition_label}
                              </Badge>
                              <Badge className={getSeverityColor(record.severity)}>
                                {record.severity_label}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>
                                <span>Risk Score:</span>
                                <span className="font-medium ml-1">{record.latest_score}</span>
                              </div>
                              <div>
                                <span>Referred:</span>
                                <span className="font-medium ml-1">{getTimeSinceReferred(record.opened_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Escalation Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                  Escalation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRecord ? (
                  <>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">
                        {selectedRecord.patient.full_name}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Condition:</span>
                          <span className="font-medium">{selectedRecord.condition_label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Risk Score:</span>
                          <span className="font-medium">{selectedRecord.latest_score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Severity:</span>
                          <span className="font-medium">{selectedRecord.severity_label}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="urgency">Urgency Level</Label>
                      <Select 
                        value={escalationForm.urgency} 
                        onValueChange={(value) => setEscalationForm(prev => ({ ...prev, urgency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {urgencyLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <Badge className={level.color}>
                                  {level.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="escalation-notes">Escalation Notes</Label>
                      <Textarea
                        id="escalation-notes"
                        value={escalationForm.notes}
                        onChange={(e) => setEscalationForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Provide detailed clinical justification for escalation..."
                        rows={6}
                      />
                    </div>
                    
                    {fmcs.length > 0 && (
                      <div>
                        <Label htmlFor="target-fmc">Target FMC (Optional)</Label>
                        <Select 
                          value={escalationForm.target_fmc} 
                          onValueChange={(value) => setEscalationForm(prev => ({ ...prev, target_fmc: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Auto-assign to nearest FMC" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Auto-assign to nearest FMC</SelectItem>
                            {fmcs.map((fmc) => (
                              <SelectItem key={fmc.id} value={fmc.id}>
                                {fmc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Escalating this patient will transfer them to FMC for specialized care. 
                        The PHC will no longer be able to modify this patient's record.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleEscalate}
                        disabled={isEscalating || !escalationForm.notes.trim()}
                        className="bg-red-600 hover:bg-red-700 flex-1"
                      >
                        {isEscalating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Escalating...
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Escalate to FMC
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedRecord(null);
                          setEscalationForm({
                            urgency: 'medium',
                            notes: '',
                            target_fmc: '',
                          });
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                    <p className="text-gray-600">Choose a patient from the list to begin escalation</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Escalation Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">High Risk Patients</span>
                    <Badge className="bg-red-100 text-red-800">
                      {getHighRiskPatients().length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Moderate Risk Patients</span>
                    <Badge className="bg-amber-100 text-amber-800">
                      {getModerateRiskPatients().length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Available FMCs</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {fmcs.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PHCEscalationScreen;
