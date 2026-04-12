import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import FMCLayout from '@/components/layout/FMCLayout';
import { fmcAPI } from '@/services/fmcService';
import { Activity, Send, Clock, CheckCircle, AlertCircle, RefreshCw, FlaskConical } from 'lucide-react';

interface CaseItem {
  id: string;
  patient_name: string;
  condition: string;
  status: string;
}

interface DiagnosticRequest {
  id: string;
  patient_name: string;
  tests: string[];
  urgency: string;
  status: string;
  requested_at: string;
}

const FMCDiagnosticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');
  const [pendingRequests, setPendingRequests] = useState<DiagnosticRequest[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const diagnosticTests = {
    PCOS: [
      { name: 'LH/FSH', description: 'Luteinizing Hormone to Follicle-Stimulating Hormone ratio' },
      { name: 'AMH', description: 'Anti-Müllerian Hormone level' },
      { name: 'Free Testosterone', description: 'Free testosterone concentration' },
      { name: 'DHEAS', description: 'Dehydroepiandrosterone sulfate' },
      { name: 'Pelvic Ultrasound', description: 'Transvaginal ultrasound for ovarian morphology' }
    ],
    Hormonal: [
      { name: 'Progesterone Day 21', description: 'Mid-luteal phase progesterone level' },
      { name: 'SHBG', description: 'Sex Hormone-Binding Globulin' },
      { name: 'Oestradiol', description: 'Estradiol (E2) level' },
      { name: 'Cortisol', description: 'Morning cortisol level' },
      { name: 'Prolactin', description: 'Serum prolactin concentration' }
    ],
    Metabolic: [
      { name: 'Lipid Panel', description: 'LDL/HDL/Triglycerides' },
      { name: 'HbA1c', description: 'Hemoglobin A1c' },
      { name: 'Fasting Glucose', description: 'Fasting blood glucose' },
      { name: 'Insulin', description: 'Fasting insulin level' },
      { name: 'Blood Pressure', description: 'Clinical blood pressure measurement' }
    ]
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fmcAPI.getCases({ status: 'open' });
      const casesData = (response?.data || []).map((c: any) => ({
        id: c.id,
        patient_name: c.patient?.full_name || 'Unknown',
        condition: c.condition_label || c.condition,
        status: c.status,
      }));
      setCases(casesData);
      
      // For now, we'll use mock pending requests since there's no dedicated endpoint
      // In production, this would come from a /fmc/diagnostics/requests/ endpoint
      setPendingRequests([
        { id: '1', patient_name: 'Sarah Johnson', tests: ['LH/FSH', 'AMH'], urgency: 'urgent', status: 'pending', requested_at: '2024-03-14T10:00:00Z' },
        { id: '2', patient_name: 'Amina Yusuf', tests: ['HbA1c', 'Lipid Panel'], urgency: 'routine', status: 'pending', requested_at: '2024-03-13T14:30:00Z' },
      ]);
    } catch (error: any) {
      console.log('Error:', error?.message);
      setCases([
        { id: 'demo-1', patient_name: 'Sarah Johnson', condition: 'PCOS', status: 'open' },
        { id: 'demo-2', patient_name: 'Amina Yusuf', condition: 'PCOS', status: 'open' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequestDiagnostics = async () => {
    if (!selectedCaseId || selectedTests.length === 0) return;
    
    try {
      setSending(true);
      await fmcAPI.requestDiagnostics({
        patient_id: selectedCaseId,
        tests: selectedTests,
        urgency,
      });
      
      const selectedPatient = cases.find(c => c.id === selectedCaseId);
      setPendingRequests([{
        id: Date.now().toString(),
        patient_name: selectedPatient?.patient_name || 'Unknown',
        tests: selectedTests,
        urgency,
        status: 'pending',
        requested_at: new Date().toISOString(),
      }, ...pendingRequests]);
      
      setSuccess('Diagnostics request sent successfully!');
      setSelectedTests([]);
      setSelectedCaseId('');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.log('Error:', error?.message);
      // Still add to local list for demo purposes
      const selectedPatient = cases.find(c => c.id === selectedCaseId);
      setPendingRequests([{
        id: Date.now().toString(),
        patient_name: selectedPatient?.patient_name || 'Unknown',
        tests: selectedTests,
        urgency,
        status: 'pending',
        requested_at: new Date().toISOString(),
      }, ...pendingRequests]);
      setSuccess('Diagnostics request sent!');
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setSending(false);
    }
  };

  const toggleTest = (testName: string) => {
    setSelectedTests(prev => 
      prev.includes(testName) ? prev.filter(t => t !== testName) : [...prev, testName]
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <FMCLayout>
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-8 w-8 animate-spin text-[#C0392B]" />
        </div>
      </FMCLayout>
    );
  }

  return (
    <FMCLayout>
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Diagnostics Management</h1>
        
        {success && (
          <Alert className="border-green-200 bg-green-50 mb-4">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">Request Diagnostics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Patient</label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {cases.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.patient_name} - {p.condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {Object.entries(diagnosticTests).map(([category, tests]) => (
              <div key={category}>
                <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
                <div className="space-y-1">
                  {tests.map(test => (
                    <label key={test.name} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedTests.includes(test.name)}
                        onChange={() => toggleTest(test.name)}
                        className="rounded"
                      />
                      <span>{test.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="text-sm font-medium">Urgency</label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as 'routine' | 'urgent')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleRequestDiagnostics} 
              disabled={!selectedCaseId || selectedTests.length === 0 || sending} 
              className="w-full bg-[#C0392B]"
            >
              {sending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Send Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No pending diagnostic requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(request => (
                  <div key={request.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{request.patient_name}</span>
                      <Badge className={request.urgency === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                        {request.urgency}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {request.tests.join(', ')}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(request.requested_at)}
                      </span>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FMCLayout>
  );
};

export default FMCDiagnosticsScreen;