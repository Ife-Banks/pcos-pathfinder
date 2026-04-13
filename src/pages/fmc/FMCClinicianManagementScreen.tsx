import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Search, 
  Plus, 
  Stethoscope,
  CheckCircle,
  XCircle,
  Trash2,
  Mail,
  Shield,
  Loader2,
  Activity
} from "lucide-react";
import { fmcAPI } from "@/services/fmcService";

interface Clinician {
  id: string;
  user_email: string;
  user_full_name: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  is_verified: boolean;
  created_at: string;
}

const specializations = [
  { value: "general_practice", label: "General Practice" },
  { value: "obstetrics_gynae", label: "Obstetrics & Gynaecology" },
  { value: "endocrinology", label: "Endocrinology" },
  { value: "cardiology", label: "Cardiology" },
  { value: "internal_medicine", label: "Internal Medicine" },
  { value: "reproductive_health", label: "Reproductive Health" },
  { value: "midwifery", label: "Midwifery" },
  { value: "nursing", label: "Nursing" },
  { value: "other", label: "Other" },
];

const FMCClinicianManagementScreen = () => {
  const navigate = useNavigate();
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    specialization: "general_practice",
    license_number: "",
    years_of_experience: 0,
    bio: "",
  });

  const fetchClinicians = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fmcAPI.getClinicians();
      const data = response?.data || response || [];
      setClinicians(data.map((c: any) => ({
        id: c.id,
        user_email: c.user_email || c.email || "",
        user_full_name: c.user_full_name || c.full_name || "",
        specialization: c.specialization || "general_practice",
        license_number: c.license_number || "",
        years_of_experience: c.years_of_experience || 0,
        is_verified: c.is_verified !== false,
        created_at: c.created_at || "",
      })));
    } catch (err: any) {
      console.error("Error fetching clinicians:", err);
      setError(err?.message || "Failed to fetch clinicians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicians();
  }, []);

  const handleCreateClinician = async () => {
    if (!formData.full_name || !formData.email) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const response = await fmcAPI.createClinician(formData);
      const newClinician = response?.data || response;
      setClinicians([{ 
        ...newClinician, 
        is_verified: false 
      }, ...clinicians]);
      setSuccess("Clinician account created! Credentials will be sent via email.");
      setIsCreateOpen(false);
      setFormData({
        full_name: "",
        email: "",
        specialization: "general_practice",
        license_number: "",
        years_of_experience: 0,
        bio: "",
      });
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error("Error creating clinician:", err);
      setError(err?.message || "Failed to create clinician account");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyClinician = async (clinicianId: string) => {
    try {
      await fmcAPI.verifyClinician(clinicianId);
      setClinicians(clinicians.map(c => 
        c.id === clinicianId ? { ...c, is_verified: true } : c
      ));
      setSuccess("Clinician verified successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error verifying clinician:", err);
      setError(err?.message || "Failed to verify clinician");
    }
  };

  const filteredClinicians = clinicians.filter(c =>
    c.user_full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSpecializationLabel = (value: string) => {
    const spec = specializations.find(s => s.value === value);
    return spec?.label || value;
  };

  const getSpecializationBadgeColor = (specialization: string) => {
    switch (specialization) {
      case "obstetrics_gynae": return "bg-purple-100 text-purple-800";
      case "endocrinology": return "bg-pink-100 text-pink-800";
      case "cardiology": return "bg-red-100 text-red-800";
      case "reproductive_health": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C0392B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clinician Management</h1>
            <p className="text-gray-600">Manage clinicians affiliated with this FMC</p>
          </div>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#C0392B] hover:bg-[#922B21]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Clinician
          </Button>
        </div>

        {/* Alerts */}
        {success && (
          <Alert className="border-green-200 bg-green-50 mb-4">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-[#C0392B]">{clinicians.length}</p>
              <p className="text-xs text-gray-600">Total Clinicians</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {clinicians.filter(c => c.is_verified).length}
              </p>
              <p className="text-xs text-gray-600">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {clinicians.filter(c => !c.is_verified).length}
              </p>
              <p className="text-xs text-gray-600">Pending Verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {clinicians.filter(c => c.specialization === "obstetrics_gynae").length}
              </p>
              <p className="text-xs text-gray-600">Gynaecologists</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search clinicians by name, email, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clinicians List */}
        <div className="space-y-3">
          {filteredClinicians.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Stethoscope className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No clinicians found</p>
              </CardContent>
            </Card>
          ) : (
            filteredClinicians.map(clinician => (
              <Card key={clinician.id} className={!clinician.is_verified ? 'opacity-75' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-[#C0392B] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium">
                          {(clinician.user_full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">Dr. {clinician.user_full_name}</p>
                        <p className="text-sm text-gray-500 truncate">{clinician.user_email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className={getSpecializationBadgeColor(clinician.specialization)}>
                            {getSpecializationLabel(clinician.specialization)}
                          </Badge>
                          {clinician.license_number && (
                            <span className="text-xs text-gray-400">Lic: {clinician.license_number}</span>
                          )}
                          {clinician.years_of_experience > 0 && (
                            <span className="text-xs text-gray-400">{clinician.years_of_experience} yrs exp</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {clinician.is_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {!clinician.is_verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyClinician(clinician.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          Verify
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/fmc/patient-detail/`)}
                        className="text-[#C0392B]"
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Clinician</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Full Name *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Dr. John Doe"
                />
              </div>
              <div>
                <Label className="text-sm">Email Address *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <Label className="text-sm">Specialization *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                >
                  {specializations.map(spec => (
                    <option key={spec.value} value={spec.value}>{spec.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm">Medical License Number</Label>
                <Input
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="e.g., MDC/2024/001234"
                />
              </div>
              <div>
                <Label className="text-sm">Years of Experience</Label>
                <Input
                  type="number"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-sm">Bio / Notes</Label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 min-h-[80px] bg-white"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief description of the clinician's background..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateClinician} 
                disabled={saving}
                className="bg-[#C0392B] hover:bg-[#922B21]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Clinician"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FMCClinicianManagementScreen;