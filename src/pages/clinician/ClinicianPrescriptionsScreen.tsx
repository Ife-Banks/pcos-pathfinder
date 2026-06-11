import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Plus, Search, User, CheckCircle, XCircle, AlertTriangle, Pill, ChevronRight
} from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";

interface PatientGroup {
  patientId: string;
  patientName: string;
  totalCount: number;
  activeCount: number;
  latestMedication: string;
  latestDate: string;
}

const ClinicianPrescriptionsScreen = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<PatientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rxRes, casesRes] = await Promise.all([
        clinicianAPI.getPrescriptions(),
        clinicianAPI.getMyCases(),
      ]);

      const caseMap = new Map<string, string>();
      for (const c of (casesRes.data || [])) {
        if (c.patient?.id) caseMap.set(String(c.patient.id).trim(), c.patient.full_name || 'Unknown');
      }

      const groupMap = new Map<string, PatientGroup>();
      for (const p of (rxRes.data || [])) {
        const pid = String(p.patient_id).trim();
        const name = caseMap.get(pid) || p.patient_name || 'Unknown';
        const medName = p.medications?.[0]?.name || 'Unnamed medication';

        if (!groupMap.has(pid)) {
          groupMap.set(pid, {
            patientId: pid,
            patientName: name,
            totalCount: 0,
            activeCount: 0,
            latestMedication: medName,
            latestDate: p.created_at,
          });
        }
        const g = groupMap.get(pid)!;
        g.totalCount += 1;
        if (p.is_active) g.activeCount += 1;
        if (p.created_at > g.latestDate) {
          g.latestDate = p.created_at;
          g.latestMedication = medName;
        }
      }

      setGroups(Array.from(groupMap.values()));
    } catch {
      setError('Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = groups.filter(g =>
    g.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalActive = groups.reduce((n, g) => n + g.activeCount, 0);
  const totalInactive = groups.reduce((n, g) => n + (g.totalCount - g.activeCount), 0);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
              <p className="text-sm text-gray-500">Select a patient to view or manage their prescriptions</p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => alert('Select a patient below to add a prescription.')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{totalActive}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-gray-400">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{totalInactive}</p>
              </div>
              <XCircle className="h-6 w-6 text-gray-400" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Patients</p>
                <p className="text-2xl font-bold text-blue-600">{groups.length}</p>
              </div>
              <User className="h-6 w-6 text-blue-400" />
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patient list */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-700 mb-1">No prescriptions yet</h3>
              <p className="text-sm text-gray-500 mb-4">Create a prescription to get started.</p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/clinician/patients')}
              >
                <Plus className="h-4 w-4 mr-2" /> Go to Patients
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((group) => (
              <Card
                key={group.patientId}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/clinician/prescriptions/patient/${group.patientId}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{group.patientName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Latest: <span className="text-gray-700">{group.latestMedication}</span>
                        <span className="mx-2">·</span>
                        {group.totalCount} prescription{group.totalCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {group.activeCount > 0 && (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {group.activeCount} active
                      </span>
                    )}
                    {group.totalCount - group.activeCount > 0 && (
                      <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        {group.totalCount - group.activeCount} inactive
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicianPrescriptionsScreen;