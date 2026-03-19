import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Pill,
  User,
  Search,
  Filter,
  Download,
  Package,
  AlertCircle
} from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";
import { Prescription, PatientSummary } from "@/types/clinician";

const ClinicianPrescriptionsScreen = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    patient_id: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    side_effects: '',
    contraindications: '',
    refills: '',
    date_prescribed: '',
  });

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clinicianAPI.getPrescriptions();
      setPrescriptions(response.data);
      
      // Fetch patients for dropdown
      const patientsResponse = await clinicianAPI.getPatients();
      setPatients(patientsResponse.data);
      
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to load prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async () => {
    try {
      const prescriptionData = {
        ...formData,
        date_prescribed: new Date(formData.date_prescribed).toISOString(),
        refills: parseInt(formData.refills),
      };
      
      await clinicianAPI.createPrescription(prescriptionData);
      setIsCreateDialogOpen(false);
      setFormData({
        patient_id: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        side_effects: '',
        contraindications: '',
        refills: '',
        date_prescribed: '',
      });
      fetchPrescriptions();
      
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      setError('Failed to create prescription. Please try again.');
    }
  };

  const handleUpdatePrescription = async (prescriptionId: string, updates: Partial<Prescription>) => {
    try {
      await clinicianAPI.updatePrescription(prescriptionId, updates);
      fetchPrescriptions();
    } catch (error: any) {
      console.error('Error updating prescription:', error);
      setError('Failed to update prescription. Please try again.');
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await clinicianAPI.deletePrescription(prescriptionId);
        fetchPrescriptions();
      } catch (error: any) {
        console.error('Error deleting prescription:', error);
        setError('Failed to delete prescription. Please try again.');
      }
    }
  };

  const handleRefillPrescription = async (prescriptionId: string) => {
    try {
      await clinicianAPI.refillPrescription(prescriptionId);
      fetchPrescriptions();
    } catch (error: any) {
      console.error('Error refilling prescription:', error);
      setError('Failed to refill prescription. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'expired': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prescription.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prescription.patient_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeCount = prescriptions.filter(p => p.status === 'active').length;
  const pendingCount = prescriptions.filter(p => p.status === 'pending').length;
  const expiredCount = prescriptions.filter(p => p.status === 'expired').length;

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                onClick={() => navigate('/clinician/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
                <p className="text-gray-600">Manage patient medications</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Prescription</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patient">Patient</Label>
                      <Select value={formData.patient_id} onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date_prescribed">Date Prescribed</Label>
                      <Input
                        id="date_prescribed"
                        type="date"
                        value={formData.date_prescribed}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_prescribed: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="medication">Medication</Label>
                    <Input
                      id="medication"
                      value={formData.medication}
                      onChange={(e) => setFormData(prev => ({ ...prev, medication: e.target.value }))}
                      placeholder="e.g., Metformin"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        value={formData.dosage}
                        onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                        placeholder="e.g., Twice daily"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 30 days"
                      />
                    </div>
                    <div>
                      <Label htmlFor="refills">Refills</Label>
                      <Input
                        id="refills"
                        type="number"
                        value={formData.refills}
                        onChange={(e) => setFormData(prev => ({ ...prev, refills: e.target.value }))}
                        placeholder="e.g., 3"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Take with food, avoid alcohol..."
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="side_effects">Side Effects</Label>
                    <Textarea
                      id="side_effects"
                      value={formData.side_effects}
                      onChange={(e) => setFormData(prev => ({ ...prev, side_effects: e.target.value }))}
                      placeholder="Nausea, headache, dizziness..."
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contraindications">Contraindications</Label>
                    <Textarea
                      id="contraindications"
                      value={formData.contraindications}
                      onChange={(e) => setFormData(prev => ({ ...prev, contraindications: e.target.value }))}
                      placeholder="Pregnancy, liver disease, allergies..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreatePrescription}>
                      Create Prescription
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                  <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                </div>
                <Pill className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                </div>
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-gray-600">{expiredCount}</p>
                </div>
                <AlertCircle className="h-6 w-6 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by medication, dosage, or patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prescriptions Grid */}
        {filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? "No prescriptions match your search criteria" 
                  : "Create your first prescription to get started"}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prescription
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrescriptions.map((prescription, index) => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(prescription.status)}
                        <Badge className={getStatusColor(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </div>
                      {prescription.urgency && (
                        <Badge className={getUrgencyColor(prescription.urgency)}>
                          {prescription.urgency}
                        </Badge>
                      )}
                    </div>

                    {/* Medication Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{prescription.medication}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <User className="h-4 w-4" />
                      <span>{prescription.patient_name}</span>
                    </div>

                    {/* Dosage and Frequency */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dosage:</span>
                        <span className="font-medium">{prescription.dosage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="font-medium">{prescription.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{prescription.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refills:</span>
                        <span className="font-medium">{prescription.refills || 0}</span>
                      </div>
                    </div>

                    {/* Instructions */}
                    {prescription.instructions && (
                      <div className="text-sm text-gray-600 mb-4">
                        <p className="font-medium mb-1">Instructions:</p>
                        <p className="line-clamp-2">{prescription.instructions}</p>
                      </div>
                    )}

                    {/* Date Info */}
                    <div className="text-xs text-gray-500 mb-4">
                      <p>Prescribed: {new Date(prescription.date_prescribed).toLocaleDateString()}</p>
                      {prescription.expiry_date && (
                        <p>Expires: {new Date(prescription.expiry_date).toLocaleDateString()}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {prescription.status === 'active' && prescription.refills > 0 && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleRefillPrescription(prescription.id)}
                        >
                          Refill
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicianPrescriptionsScreen;
