import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import FMCLayout from '@/components/layout/FMCLayout';
import { fmcAPI } from '@/services/fmcService';
import { UserPlus, Users, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface Case {
  id: string;
  name: string;
  age: number;
  tier: string;
  referringPHC: string;
  severity: string;
}

interface Clinician {
  id: string;
  name: string;
  specialty: string;
  activeCases: number;
  status: string;
}

const FMCAssignmentScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesRes, cliniciansRes] = await Promise.all([
        fmcAPI.getCases({ status: 'open' }),
        fmcAPI.getClinicians()
      ]);
      
      const openCases = (casesRes?.data || []).map((c: any) => ({
        id: c.id,
        name: c.patient?.full_name || 'Unknown',
        age: c.patient?.age || 25,
        tier: c.severity === 'very_severe' ? 'critical' : c.severity === 'severe' ? 'high' : 'moderate',
        severity: c.severity,
        referringPHC: c.hcc?.name || c.fhc || 'Unknown'
      }));
      setCases(openCases);
      
      setClinicians((cliniciansRes?.data || []).map((c: any) => ({
        id: c.id,
        name: c.name || c.full_name || 'Unknown',
        specialty: c.specialization || 'General',
        activeCases: c.active_cases || 0,
        status: c.is_verified ? 'available' : 'off_duty',
      })));
    } catch (error: any) {
      console.log('Error fetching data:', error?.message);
      setCases([
        { id: '1', name: 'Sarah Johnson', age: 28, tier: 'critical', severity: 'very_severe', referringPHC: 'Surulere PHC' },
        { id: '2', name: 'Amina Yusuf', age: 25, tier: 'high', severity: 'severe', referringPHC: 'Ikeja PHC' }
      ]);
      setClinicians([
        { id: '1', name: 'Dr. Adekunle', specialty: 'Gynaecology', activeCases: 5, status: 'available' },
        { id: '2', name: 'Dr. Okonkwo', specialty: 'Endocrinology', activeCases: 8, status: 'available' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const unassignedCases = cases.filter(c => !cases.some(assigned => assigned.id === c.id));
  const availableClinicians = clinicians.filter(c => c.status === 'available');

  const stats = {
    criticalUnassigned: cases.filter(c => c.tier === 'critical').length,
    highUnassigned: cases.filter(c => c.tier === 'high').length,
    totalUnassigned: cases.length,
    availableClinicians: availableClinicians.length
  };

  const handleAssign = async (clinicianId: string) => {
    if (!selectedCase) return;
    
    try {
      setAssigning(true);
      setAssignError(null);
      await fmcAPI.assignClinician(selectedCase.id, clinicianId);
      
      setCases(cases.filter(c => c.id !== selectedCase.id));
      setAssignSuccess(true);
      setSelectedCase(null);
      
      setTimeout(() => {
        setAssignSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error assigning:', error);
      setAssignError(error?.response?.data?.message || 'Failed to assign clinician');
    } finally {
      setAssigning(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
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
        <h1 className="text-xl font-bold text-gray-900 mb-4">Clinician Assignment</h1>
        
        {assignSuccess && (
          <Alert className="border-green-200 bg-green-50 mb-4">
            <AlertDescription className="text-green-800">Patient assigned successfully!</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Critical Unassigned</p>
              <p className="text-xl font-bold text-red-600">{stats.criticalUnassigned}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">High Unassigned</p>
              <p className="text-xl font-bold text-orange-600">{stats.highUnassigned}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Total Unassigned</p>
              <p className="text-xl font-bold text-blue-600">{stats.totalUnassigned}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Available</p>
              <p className="text-xl font-bold text-green-600">{stats.availableClinicians}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-3">Unassigned Patients ({cases.length})</h2>
            {cases.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                  <p className="mt-2 text-gray-500">All Assigned</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {cases.map(patient => (
                  <Card key={patient.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-gray-500">{patient.referringPHC}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTierColor(patient.tier)}>
                            {patient.tier.toUpperCase()}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="bg-[#C0392B] hover:bg-[#922B21]"
                                onClick={() => setSelectedCase(patient)}
                              >
                                <UserPlus className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign to Clinician</DialogTitle>
                              </DialogHeader>
                              {assignError && (
                                <Alert variant="destructive" className="mb-2">
                                  <AlertDescription>{assignError}</AlertDescription>
                                </Alert>
                              )}
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {availableClinicians.length === 0 ? (
                                  <p className="text-gray-500 text-center py-4">No available clinicians</p>
                                ) : (
                                  availableClinicians.map(clinician => (
                                    <div
                                      key={clinician.id}
                                      onClick={() => handleAssign(clinician.id)}
                                      className="p-3 border rounded-lg cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors"
                                    >
                                      <div className="flex justify-between">
                                        <div>
                                          <p className="font-medium">{clinician.name}</p>
                                          <p className="text-sm text-gray-500">{clinician.specialty}</p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800">
                                          {clinician.activeCases} cases
                                        </Badge>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                              {assigning && (
                                <div className="flex items-center justify-center py-2">
                                  <RefreshCw className="h-4 w-4 animate-spin text-[#C0392B]" />
                                  <span className="ml-2 text-sm">Assigning...</span>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold mb-3">Available Clinicians ({availableClinicians.length})</h2>
            <div className="space-y-2">
              {availableClinicians.map(clinician => (
                <Card key={clinician.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{clinician.name}</p>
                        <p className="text-sm text-gray-500">{clinician.specialty}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {clinician.activeCases} active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FMCLayout>
  );
};

export default FMCAssignmentScreen;