import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Calendar,
  Send,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmcAPI } from "@/services/fmcService";

interface PatientCase {
  id: string;
  patient_name: string;
  patient_age: number;
  condition: string;
  severity: string;
  assigned_clinician: string;
  opened_at: string;
  risk_scores: {
    pcos: number;
    hormonal: number;
    metabolic: number;
  };
}

const FMCDischargeScreen = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const [loading, setLoading] = useState(true);
  const [patientCase, setPatientCase] = useState<PatientCase | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    condition_confirmed: "",
    diagnostic_basis: "",
    treatment_summary: "",
    follow_up_plan: "",
    closing_score: "",
    discharge_letter: "",
  });

  useEffect(() => {
    const fetchCase = async () => {
      if (!caseId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fmcAPI.getCase(caseId);
        if (res.data) {
          setPatientCase(res.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [caseId]);

  const handleSubmit = async () => {
    if (!caseId) return;
    setSubmitting(true);
    try {
      await fmcAPI.fullDischarge(caseId, {
        condition_confirmed: formData.condition_confirmed,
        diagnostic_basis: formData.diagnostic_basis,
        treatment_summary: formData.treatment_summary,
        follow_up_plan: formData.follow_up_plan,
        closing_score: parseFloat(formData.closing_score) || 0,
        discharge_letter: formData.discharge_letter,
      });
      navigate("/fmc/dashboard");
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    formData.condition_confirmed &&
    formData.diagnostic_basis &&
    formData.treatment_summary &&
    formData.follow_up_plan &&
    formData.closing_score;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading case...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Case Discharge</h1>
            <p className="text-sm text-gray-500">Close patient case with outcome summary</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {patientCase && (
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{patientCase.patient_name}</h3>
                <Badge className={`text-xs ${
                  patientCase.severity === "critical" ? "bg-red-100 text-red-700" :
                  patientCase.severity === "high" ? "bg-orange-100 text-orange-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {patientCase.severity.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Age:</span> {patientCase.patient_age}
                </div>
                <div>
                  <span className="text-gray-500">Condition:</span> {patientCase.condition}
                </div>
                <div>
                  <span className="text-gray-500">Clinician:</span> {patientCase.assigned_clinician || "N/A"}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Current Risk Scores</p>
                <div className="flex gap-4">
                  <span className="text-sm">PCOS: <span className="font-medium">{patientCase.risk_scores.pcos}</span></span>
                  <span className="text-sm">Hormonal: <span className="font-medium">{patientCase.risk_scores.hormonal}</span></span>
                  <span className="text-sm">Metabolic: <span className="font-medium">{patientCase.risk_scores.metabolic}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Final Diagnosis
              </h3>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Condition Confirmed</Label>
                  <Select
                    value={formData.condition_confirmed}
                    onValueChange={(v) => setFormData({ ...formData, condition_confirmed: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select confirmed condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcos_confirmed">PCOS Confirmed</SelectItem>
                      <SelectItem value="hormonal_imbalance">Hormonal Imbalance</SelectItem>
                      <SelectItem value="metabolic_syndrome">Metabolic Syndrome</SelectItem>
                      <SelectItem value="multiple">Multiple Conditions</SelectItem>
                      <SelectItem value="none_confirmed">None Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Diagnostic Basis</Label>
                  <Select
                    value={formData.diagnostic_basis}
                    onValueChange={(v) => setFormData({ ...formData, diagnostic_basis: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagnostic basis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinical_criteria">Clinical Criteria</SelectItem>
                      <SelectItem value="lab_results">Lab Results</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                      <SelectItem value="combined">Combined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Treatment Summary</h3>
              <Textarea
                placeholder="Summarize treatment provided..."
                rows={4}
                value={formData.treatment_summary}
                onChange={(e) => setFormData({ ...formData, treatment_summary: e.target.value })}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Follow-up Plan</h3>
              <Select
                value={formData.follow_up_plan}
                onValueChange={(v) => setFormData({ ...formData, follow_up_plan: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select follow-up plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discharged_to_phc">Discharged to PHC Monitoring</SelectItem>
                  <SelectItem value="self_monitor">Self-monitor with App</SelectItem>
                  <SelectItem value="specialist_followup">Specialist Follow-up Required</SelectItem>
                  <SelectItem value="tertiary_referral">Tertiary Referral</SelectItem>
                </SelectContent>
              </Select>

              <div>
                <Label className="text-sm">Closing Risk Score (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 25"
                  value={formData.closing_score}
                  onChange={(e) => setFormData({ ...formData, closing_score: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Discharge Letter
              </h3>
              <Textarea
                placeholder="Write discharge letter to patient..."
                rows={6}
                value={formData.discharge_letter}
                onChange={(e) => setFormData({ ...formData, discharge_letter: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                This letter will be sent to the patient and the referring PHC.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={!isFormValid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Discharging...
              </span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Discharge Patient
              </>
            )}
          </Button>
        </div>

        {(!isFormValid || !caseId) && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>Fill in all required fields to discharge the patient.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FMCDischargeScreen;