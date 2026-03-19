import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Activity, 
  FileText, 
  Pill,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Heart,
  Droplet,
  Thermometer,
  Weight,
  Ruler,
  Download,
  Edit,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";
import { PatientDetail, TimelineEvent, TreatmentPlan, Prescription, Message } from "@/types/clinician";

const ClinicianPatientDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchPatientDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clinicianAPI.getPatient(id!);
      setPatient(response.data);
      
      // Fetch related data
      const [timelineRes, plansRes, prescriptionsRes, messagesRes] = await Promise.all([
        clinicianAPI.getPatientTimeline(id!),
        clinicianAPI.getPatientTreatmentPlans(id!),
        clinicianAPI.getPatientPrescriptions(id!),
        clinicianAPI.getPatientMessages(id!)
      ]);
      
      setTimeline(timelineRes.data);
      setTreatmentPlans(plansRes.data);
      setPrescriptions(prescriptionsRes.data);
      setMessages(messagesRes.data);
      
    } catch (error: any) {
      console.error('Error fetching patient detail:', error);
      setError('Failed to load patient information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-amber-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'checkin': return <Activity className="h-4 w-4" />;
      case 'prescription': return <Pill className="h-4 w-4" />;
      case 'treatment': return <FileText className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatientDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Patient not found'}</AlertDescription>
        </Alert>
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
                <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
                <p className="text-gray-600">Patient ID: {patient.id.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message Patient
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Patient Overview Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Patient Info */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{patient.full_name}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Age: {patient.age}</span>
                      <span>•</span>
                      <span>{patient.gender}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{patient.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Joined: {new Date(patient.date_joined).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Risk Score */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getRiskColor(patient.risk_score)}`}>
                  <span className="text-2xl font-bold">{patient.risk_score}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Risk Score</p>
                <Badge className={getRiskColor(patient.risk_score)}>
                  {patient.risk_level}
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Check-in</span>
                  <span className="font-medium">{patient.last_checkin || 'Never'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Plans</span>
                  <span className="font-medium">{treatmentPlans.filter(p => p.status === 'active').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prescriptions</span>
                  <span className="font-medium">{prescriptions.filter(p => p.status === 'active').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unread Messages</span>
                  <span className="font-medium">{messages.filter(m => !m.is_read).length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="treatment">Treatment Plans</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clinical Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Clinical Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Weight: {patient.clinical_data?.weight || 'N/A'} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Height: {patient.clinical_data?.height || 'N/A'} cm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">BMI: {patient.clinical_data?.bmi || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Glucose: {patient.clinical_data?.glucose || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.conditions?.map((condition, index) => (
                        <Badge key={index} variant="secondary">
                          {condition}
                        </Badge>
                      )) || <span className="text-sm text-gray-500">No conditions recorded</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {timeline.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="flex-shrink-0">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-gray-600 text-xs">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    {timeline.length === 0 && (
                      <p className="text-sm text-gray-500">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Patient Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 pb-4 border-b last:border-b-0"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        {event.metadata && (
                          <div className="mt-2 text-xs text-gray-500">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {timeline.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No timeline events recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Plans Tab */}
          <TabsContent value="treatment" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Treatment Plans</h3>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Treatment Plan
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treatmentPlans.map((plan, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{plan.title}</h4>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(plan.status)}`} />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span>{new Date(plan.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span>{plan.duration} weeks</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {treatmentPlans.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Treatment Plans</h3>
                    <p className="text-gray-600 mb-4">Create a treatment plan to get started</p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Treatment Plan
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Prescriptions</h3>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((prescription, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{prescription.medication}</h4>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(prescription.status)}`} />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{prescription.dosage}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prescribed:</span>
                        <span>{new Date(prescription.date_prescribed).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span>{prescription.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusColor(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {prescriptions.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions</h3>
                    <p className="text-gray-600 mb-4">Create a prescription to get started</p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Prescription
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClinicianPatientDetailScreen;
