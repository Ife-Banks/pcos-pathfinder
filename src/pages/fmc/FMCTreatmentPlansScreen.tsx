import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FMCLayout from '@/components/layout/FMCLayout';
import { Plus, Pill, Clock, User, RefreshCw, Activity, Save, FileText } from 'lucide-react';
import { fmcAPI } from '@/services/fmcService';

interface TreatmentPlan {
  id: string;
  title: string;
  description: string;
  medications: object | null;
  lifestyle: object | null;
  follow_up_days: number;
  is_active: boolean;
  clinician_name: string;
  created_at: string;
}

interface CaseItem {
  id: string;
  patient_name: string;
  condition: string;
  status: string;
}

const FMCTreatmentPlansScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    follow_up_days: 30,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchCases = async () => {
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
    } catch (err: any) {
      console.log('Error fetching cases:', err?.message);
      setCases([
        { id: 'demo-1', patient_name: 'Sarah Johnson', condition: 'PCOS', status: 'open' },
        { id: 'demo-2', patient_name: 'Amina Yusuf', condition: 'PCOS', status: 'open' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async (caseId: string) => {
    try {
      setLoadingPlans(true);
      const response = await fmcAPI.getTreatmentPlans(caseId);
      const plansData = response?.data || response || [];
      setPlans(plansData.map((plan: any) => ({
        id: plan.id,
        title: plan.title,
        description: plan.description,
        medications: plan.medications,
        lifestyle: plan.lifestyle,
        follow_up_days: plan.follow_up_days,
        is_active: plan.is_active,
        clinician_name: plan.clinician_name || 'Unknown',
        created_at: plan.created_at,
      })));
    } catch (err: any) {
      console.log('Error fetching plans:', err?.message);
      setPlans([
        { id: '1', title: 'Metformin Treatment', description: 'Continue Metformin 500mg twice daily', medications: { drug: 'Metformin', dose: '500mg' }, lifestyle: { diet: 'Low sugar' }, follow_up_days: 30, is_active: true, clinician_name: 'Dr. Adekunle', created_at: '2024-03-01T10:00:00Z' },
        { id: '2', title: 'Lifestyle Modification', description: 'Exercise and diet plan', medications: null, lifestyle: { exercise: '30mins daily' }, follow_up_days: 14, is_active: true, clinician_name: 'Dr. Okonkwo', created_at: '2024-02-15T09:00:00Z' },
      ]);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchPlans(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleCreatePlan = async () => {
    if (!formData.title || !formData.description || !selectedCaseId) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      const response = await fmcAPI.createTreatmentPlan(selectedCaseId, {
        title: formData.title,
        description: formData.description,
        follow_up_days: formData.follow_up_days,
      });
      const createdPlan = response?.data || response;
      setPlans([{
        id: createdPlan.id || Date.now().toString(),
        title: createdPlan.title || formData.title,
        description: createdPlan.description || formData.description,
        medications: createdPlan.medications || null,
        lifestyle: createdPlan.lifestyle || null,
        follow_up_days: createdPlan.follow_up_days || formData.follow_up_days,
        is_active: true,
        clinician_name: createdPlan.clinician_name || 'You',
        created_at: createdPlan.created_at || new Date().toISOString(),
      }, ...plans]);
      setShowForm(false);
      setFormData({ title: '', description: '', follow_up_days: 30 });
      setError(null);
    } catch (err: any) {
      console.log('Error creating plan:', err?.message);
      setError('Failed to create treatment plan');
    }
  };

  const handleToggleActive = async (planId: string, currentStatus: boolean) => {
    try {
      await fmcAPI.updateTreatmentPlan(planId, { is_active: !currentStatus });
      setPlans(plans.map(p =>
        p.id === planId ? { ...p, is_active: !currentStatus } : p
      ));
    } catch (err: any) {
      console.log('Error updating plan:', err?.message);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const activePlans = plans.filter(p => p.is_active);
  const inactivePlans = plans.filter(p => !p.is_active);

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Treatment Plans</h1>
            <p className="text-sm text-gray-500">Manage patient treatment plans</p>
          </div>
        </div>

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">Select Patient</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient case..." />
              </SelectTrigger>
              <SelectContent>
                {cases.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.patient_name} - {c.condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {!selectedCaseId ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Select a patient to view or add treatment plans</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowForm(!showForm)} className="bg-[#C0392B] hover:bg-[#922B21]">
                <Plus className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </div>

            {showForm && (
              <Card className="mb-4">
                <CardHeader><CardTitle className="text-base">Create Treatment Plan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {error && <div className="text-sm text-red-600 p-2 bg-red-50 rounded">{error}</div>}
                  <div>
                    <Label>Plan Title</Label>
                    <Input
                      placeholder="e.g., Metformin Treatment"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the treatment plan..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Follow-up Days</Label>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={formData.follow_up_days}
                      onChange={(e) => setFormData({ ...formData, follow_up_days: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreatePlan} className="bg-[#C0392B] hover:bg-[#922B21]">
                      <Save className="h-4 w-4 mr-2" />
                      Save Plan
                    </Button>
                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {loadingPlans ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-[#C0392B]" />
              </div>
            ) : (
              <>
                <h2 className="font-semibold mb-3">Active Plans ({activePlans.length})</h2>
                {activePlans.length === 0 ? (
                  <Card className="mb-4">
                    <CardContent className="py-8 text-center text-gray-500">No active treatment plans</CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 mb-6">
                    {activePlans.map((plan) => (
                      <Card key={plan.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{plan.title}</h3>
                              <p className="text-sm text-gray-600">{plan.description}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{plan.follow_up_days} days</span>
                            <span className="flex items-center"><User className="h-4 w-4 mr-1" />{plan.clinician_name}</span>
                            <span className="flex items-center"><Activity className="h-4 w-4 mr-1" />{formatDate(plan.created_at)}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-red-600 border-red-300"
                            onClick={() => handleToggleActive(plan.id, plan.is_active)}
                          >
                            Deactivate
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {inactivePlans.length > 0 && (
                  <>
                    <h2 className="font-semibold mb-3 text-gray-500">Inactive Plans ({inactivePlans.length})</h2>
                    <div className="space-y-3">
                      {inactivePlans.map((plan) => (
                        <Card key={plan.id} className="opacity-60">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">{plan.title}</h3>
                                <p className="text-sm text-gray-500">{plan.description}</p>
                              </div>
                              <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </FMCLayout>
  );
};

export default FMCTreatmentPlansScreen;