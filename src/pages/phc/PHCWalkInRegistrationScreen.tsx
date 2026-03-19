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
import PHCLayout from "@/components/phc/PHCLayout";
import { 
  ArrowLeft, 
  UserPlus, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Users,
  Activity,
  Heart,
  Clock,
  Save,
  Send,
  Smartphone
} from "lucide-react";
import { phcAPI } from "@/services/phcService";
import { WalkInForm, WalkInResponse } from "@/types/phc";

const PHCWalkInRegistrationScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<WalkInForm>({
    full_name: '',
    email: '',
    age: undefined,
    condition: '',
    severity: '',
    notes: '',
  });
  const [registrationResponse, setRegistrationResponse] = useState<WalkInResponse | null>(null);
  const [isSendingCredentials, setIsSendingCredentials] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const conditions = [
    { value: 'pcos', label: 'PCOS (Polycystic Ovary Syndrome)' },
    { value: 'maternal', label: 'Maternal Health' },
    { value: 'cardiovascular', label: 'Cardiovascular Health' },
    { value: 'general', label: 'General Health Check' },
    { value: 'other', label: 'Other' },
  ];

  const severityLevels = [
    { value: 'mild', label: 'Low Risk (Mild)', color: 'bg-green-100 text-green-800' },
    { value: 'moderate', label: 'Moderate Risk', color: 'bg-amber-100 text-amber-800' },
    { value: 'severe', label: 'High Risk (Severe)', color: 'bg-red-100 text-red-800' },
  ];

  const handleInputChange = (field: keyof WalkInForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'age' ? (e.target.value ? parseInt(e.target.value) : undefined) : e.target.value;
    setRegistrationData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSelectChange = (field: keyof WalkInForm) => (value: string) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!registrationData.full_name.trim()) {
      errors.push('Full name is required');
    }
    
    if (registrationData.email && !/\S+@\S+\.\S+/.test(registrationData.email)) {
      errors.push('Email is invalid');
    }
    
    if (!registrationData.age || registrationData.age < 0 || registrationData.age > 120) {
      errors.push('Valid age is required');
    }
    
    if (!registrationData.condition) {
      errors.push('Condition is required');
    }
    
    if (!registrationData.severity) {
      errors.push('Severity level is required');
    }
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    
    return true;
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await phcAPI.registerWalkIn(registrationData);
      setRegistrationResponse(response.data);
      
      // Reset form
      setRegistrationData({
        full_name: '',
        email: '',
        age: undefined,
        condition: '',
        severity: '',
        notes: '',
      });
      
      setSuccess('Walk-in patient registered successfully!');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCredentials = async () => {
    if (!registrationResponse || !phoneNumber.trim()) {
      setError('Phone number is required to send credentials');
      return;
    }
    
    try {
      setIsSendingCredentials(true);
      setError(null);
      
      await phcAPI.sendCredentials(registrationResponse.patient_id, phoneNumber);
      
      setSuccess('Credentials sent successfully!');
      setPhoneNumber('');
      setIsSendingCredentials(false);
      
    } catch (error: any) {
      console.error('Error sending credentials:', error);
      setError('Failed to send credentials. Please try again.');
      setIsSendingCredentials(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const level = severityLevels.find(s => s.value === severity);
    return level ? level.color : 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'pcos': return 'bg-purple-100 text-purple-800';
      case 'maternal': return 'bg-pink-100 text-pink-800';
      case 'cardiovascular': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PHCLayout>
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
                  <h1 className="text-2xl font-bold text-gray-900">Walk-In Patient Registration</h1>
                  <p className="text-gray-600">Register new patients visiting the PHC</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#2E8B57]" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegistration} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={registrationData.full_name}
                    onChange={handleInputChange('full_name')}
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={registrationData.email}
                    onChange={handleInputChange('email')}
                    placeholder="patient@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={registrationData.age || ''}
                    onChange={handleInputChange('age')}
                    placeholder="Enter patient's age"
                    min="0"
                    max="120"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="condition">Primary Condition *</Label>
                  <Select value={registrationData.condition} onValueChange={handleSelectChange('condition')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="severity">Risk Severity Level *</Label>
                <Select value={registrationData.severity} onValueChange={handleSelectChange('severity')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map((level) => (
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
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  value={registrationData.notes}
                  onChange={handleInputChange('notes')}
                  placeholder="Enter initial clinical observations, symptoms, or notes..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-[#2E8B57] hover:bg-[#236F47]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Register Patient
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRegistrationData({
                      full_name: '',
                      email: '',
                      age: undefined,
                      condition: '',
                      severity: '',
                      notes: '',
                    });
                    setError(null);
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Registration Response */}
        {registrationResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Registration Successful
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Patient Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium ml-2">{registrationResponse.patient_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Patient ID:</span>
                      <span className="font-medium ml-2">{registrationResponse.patient_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Risk Score:</span>
                      <span className="font-medium ml-2">{registrationResponse.initial_risk_score}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-green-100 text-green-800 ml-2">
                        {registrationResponse.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {registrationResponse.temp_password && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> A temporary password has been generated for this patient. 
                      Send it to the patient's phone number so they can access the system.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone-number">Patient Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone-number"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+234XXXXXXXXXX"
                      />
                      <Button
                        onClick={handleSendCredentials}
                        disabled={isSendingCredentials || !phoneNumber.trim()}
                        className="bg-[#2E8B57] hover:bg-[#236F47]"
                      >
                        {isSendingCredentials ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Credentials
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/phc/patient/${registrationResponse.patient_id}`)}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      View Patient Record
                    </Button>
                    <Button
                      onClick={() => navigate('/phc/dashboard')}
                      className="bg-[#2E8B57] hover:bg-[#236F47]"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Registrations</p>
                  <p className="text-2xl font-bold text-[#2E8B57]">3</p>
                </div>
                <Calendar className="h-6 w-6 text-[#2E8B57]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-[#2E8B57]">12</p>
                </div>
                <Activity className="h-6 w-6 text-[#2E8B57]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-[#2E8B57]">48</p>
                </div>
                <Heart className="h-6 w-6 text-[#2E8B57]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </PHCLayout>
  );
};

export default PHCWalkInRegistrationScreen;
