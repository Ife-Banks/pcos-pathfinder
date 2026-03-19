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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MessageSquare, 
  Heart, 
  Activity, 
  Calendar, 
  Send,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Users,
  Target,
  Apple,
  Dumbbell,
  Moon,
  Coffee,
  AlertTriangle
} from "lucide-react";
import { phcAPI } from "@/services/phcService";
import { PHCRecord, AdviceTemplate } from "@/types/phc";

const PHCAdviceInterventionScreen = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PHCRecord[]>([]);
  const [templates, setTemplates] = useState<AdviceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('compose');
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<AdviceTemplate | null>(null);
  
  const [adviceForm, setAdviceForm] = useState({
    patient_id: '',
    condition: '',
    message: '',
    followup_date: '',
  });

  const [templateForm, setTemplateForm] = useState({
    title: '',
    condition: '',
    message: '',
    is_active: true,
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await phcAPI.getQueue();
      setRecords(response.data);
      
    } catch (error: any) {
      console.error('Error fetching records:', error);
      setError('Failed to load patient records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await phcAPI.getAdviceTemplates();
      setTemplates(response.data);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      // Templates are optional, so don't set error
    }
  };

  const handleSendAdvice = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      await phcAPI.sendAdvice(adviceForm);
      
      setSuccess('Advice sent successfully!');
      setAdviceForm({
        patient_id: '',
        condition: '',
        message: '',
        followup_date: '',
      });
      
      // Refresh records
      await fetchRecords();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Error sending advice:', error);
      setError('Failed to send advice. Please try again.');
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      await phcAPI.createAdviceTemplate(templateForm);
      
      setSuccess('Template created successfully!');
      setTemplateForm({
        title: '',
        condition: '',
        message: '',
        is_active: true,
      });
      
      // Refresh templates
      await fetchTemplates();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Error creating template:', error);
      setError('Failed to create template. Please try again.');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        setError(null);
        
        await phcAPI.deleteAdviceTemplate(templateId);
        
        // Refresh templates
        await fetchTemplates();
        
        setSuccess('Template deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
        
      } catch (error: any) {
        console.error('Error deleting template:', error);
        setError('Failed to delete template. Please try again.');
      }
    }
  };

  const handleUseTemplate = (template: AdviceTemplate) => {
    setSelectedTemplate(template);
    setAdviceForm(prev => ({
      ...prev,
      condition: template.condition,
      message: template.message,
    }));
    setActiveTab('compose');
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

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'pcos': return <Heart className="h-4 w-4 text-purple-600" />;
      case 'maternal': return <Activity className="h-4 w-4 text-pink-600" />;
      case 'cardiovascular': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCondition = conditionFilter === 'all' || record.condition === conditionFilter;
    
    return matchesSearch && matchesCondition;
  });

  const conditions = [
    { value: 'all', label: 'All Conditions' },
    { value: 'pcos', label: 'PCOS' },
    { value: 'maternal', label: 'Maternal Health' },
    { value: 'cardiovascular', label: 'Cardiovascular' },
  ];

  const defaultTemplates: AdviceTemplate[] = [
    {
      id: 'pcos-diet',
      title: 'PCOS Dietary Guidelines',
      condition: 'pcos',
      message: 'Focus on low-glycemic foods, increase fiber intake, and reduce processed foods. Include whole grains, lean proteins, and plenty of vegetables. Consider small, frequent meals to help manage insulin levels.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'pcos-exercise',
      title: 'PCOS Exercise Routine',
      condition: 'pcos',
      message: 'Aim for 150 minutes of moderate exercise per week. Include both cardio (walking, swimming) and strength training. Regular exercise can help improve insulin sensitivity and manage weight.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'maternal-nutrition',
      title: 'Maternal Nutrition',
      condition: 'maternal',
      message: 'Ensure adequate intake of folic acid, iron, and calcium. Eat a variety of fruits, vegetables, and lean proteins. Avoid raw or undercooked foods and limit caffeine intake.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cardiovascular-lifestyle',
      title: 'Heart-Healthy Lifestyle',
      condition: 'cardiovascular',
      message: 'Adopt a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins. Limit sodium, saturated fats, and added sugars. Aim for at least 30 minutes of moderate exercise most days.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    fetchRecords();
    fetchTemplates();
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
                <h1 className="text-2xl font-bold text-gray-900">Lifestyle Advice & Intervention</h1>
                <p className="text-gray-600">Provide guidance and support to patients</p>
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">Compose Advice</TabsTrigger>
            <TabsTrigger value="templates">Advice Templates</TabsTrigger>
            <TabsTrigger value="history">Advice History</TabsTrigger>
          </TabsList>

          {/* Compose Advice Tab */}
          <TabsContent value="compose" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Selection */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Patient</CardTitle>
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
                      <Select value={conditionFilter} onValueChange={setConditionFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
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
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {filteredRecords.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No patients found</p>
                        </div>
                      ) : (
                        filteredRecords.map((record) => (
                          <div
                            key={record.id}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                              adviceForm.patient_id === record.id ? 'bg-green-50' : ''
                            }`}
                            onClick={() => setAdviceForm(prev => ({ 
                              ...prev, 
                              patient_id: record.id,
                              condition: record.condition 
                            }))}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {record.patient.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {record.patient.full_name}
                                </h4>
                                <div className="flex gap-2 mb-2">
                                  <Badge className={getConditionColor(record.condition)}>
                                    {record.condition_label}
                                  </Badge>
                                  <Badge className={getSeverityColor(record.severity)}>
                                    {record.severity_label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Risk Score: {record.latest_score}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Advice Composition */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-[#2E8B57]" />
                      Compose Lifestyle Advice
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTemplate && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Using template: <strong>{selectedTemplate.title}</strong>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div>
                      <Label htmlFor="advice-message">Advice Message</Label>
                      <Textarea
                        id="advice-message"
                        value={adviceForm.message}
                        onChange={(e) => setAdviceForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Provide personalized lifestyle advice and recommendations..."
                        rows={6}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="followup-date">Follow-up Date</Label>
                      <Input
                        id="followup-date"
                        type="date"
                        value={adviceForm.followup_date}
                        onChange={(e) => setAdviceForm(prev => ({ ...prev, followup_date: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSendAdvice}
                        disabled={!adviceForm.patient_id || !adviceForm.message.trim()}
                        className="bg-[#2E8B57] hover:bg-[#236F47]"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Advice
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAdviceForm({
                            patient_id: '',
                            condition: '',
                            message: '',
                            followup_date: '',
                          });
                          setSelectedTemplate(null);
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Apple className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Nutrition</h4>
                          <p className="text-sm text-gray-600">Focus on whole foods, fruits, and vegetables</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Exercise</h4>
                          <p className="text-sm text-gray-600">30 minutes of moderate activity daily</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Moon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Sleep</h4>
                          <p className="text-sm text-gray-600">7-9 hours of quality sleep per night</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Coffee className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Stress Management</h4>
                          <p className="text-sm text-gray-600">Practice relaxation techniques daily</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Advice Templates</h3>
              <Button className="bg-[#2E8B57] hover:bg-[#236F47]">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Template Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template-title">Template Title</Label>
                    <Input
                      id="template-title"
                      value={templateForm.title}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., PCOS Dietary Guidelines"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-condition">Condition</Label>
                    <Select value={templateForm.condition} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcos">PCOS</SelectItem>
                        <SelectItem value="maternal">Maternal Health</SelectItem>
                        <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="template-message">Message Template</Label>
                    <Textarea
                      id="template-message"
                      value={templateForm.message}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter the advice message template..."
                      rows={4}
                    />
                  </div>
                  
                  <Button onClick={handleCreateTemplate} className="bg-[#2E8B57] hover:bg-[#236F47]">
                    Create Template
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Templates */}
              <div className="space-y-4">
                <h4 className="font-semibold">Existing Templates</h4>
                {[...defaultTemplates, ...templates].map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold">{template.title}</h5>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleUseTemplate(template)}>
                            Use
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge className={getConditionColor(template.condition)}>
                        {template.condition}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {template.message}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#2E8B57]" />
                  Advice History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Advice History</h3>
                  <p className="text-gray-600">Advice history will appear here once you start sending advice to patients.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PHCAdviceInterventionScreen;
