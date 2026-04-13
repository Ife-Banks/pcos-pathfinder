import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Activity,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";

const specializations = [
  { value: "general_practice", label: "General Practice" },
  { value: "family_medicine", label: "Family Medicine" },
  { value: "internal_medicine", label: "Internal Medicine" },
  { value: "preventive_medicine", label: "Preventive Medicine" },
  { value: "obstetrics_gynae", label: "Obstetrics & Gynaecology" },
  { value: "reproductive_endocrinology", label: "Reproductive Endocrinology & Infertility" },
  { value: "gynecologic_oncology", label: "Gynecologic Oncology" },
  { value: "endocrinology", label: "Endocrinology" },
  { value: "diabetology", label: "Diabetology" },
  { value: "cardiology", label: "Cardiology" },
  { value: "hypertension", label: "Hypertension & Vascular Medicine" },
  { value: "obesity_medicine", label: "Obesity Medicine" },
  { value: "behavioral_medicine", label: "Behavioral Medicine" },
  { value: "gastroenterology", label: "Gastroenterology" },
  { value: "hepatology", label: "Hepatology" },
  { value: "sleep_medicine", label: "Sleep Medicine" },
  { value: "pulmonology", label: "Pulmonology" },
  { value: "ent", label: "ENT" },
  { value: "maternal_fetal_medicine", label: "Maternal-Fetal Medicine" },
  { value: "adolescent_medicine", label: "Adolescent Medicine" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "clinical_psychology", label: "Clinical Psychology" },
  { value: "community_mental_health", label: "Community Mental Health" },
  { value: "dermatology", label: "Dermatology" },
  { value: "nutrition", label: "Nutrition & Dietetics" },
  { value: "community_health", label: "Community Health" },
  { value: "public_health", label: "Public Health & Epidemiology" },
];

const downstreamDiseases = [
  { key: "type2_diabetes", name: "Type 2 Diabetes / Metabolic Syndrome", icon: Activity },
  { key: "cardiovascular_disease", name: "Cardiovascular Disease (CVD, Hypertension)", icon: Heart },
  { key: "obesity", name: "Obesity", icon: Activity },
  { key: "infertility", name: "Infertility & Reproductive Complications", icon: Baby },
  { key: "endometrial_hyperplasia", name: "Endometrial Hyperplasia / Cancer", icon: AlertTriangle },
  { key: "fatty_liver", name: "Nonalcoholic Fatty Liver Disease (NAFLD)", icon: Activity },
  { key: "sleep_apnea", name: "Sleep Apnea", icon: Brain },
  { key: "pregnancy_complications", name: "Pregnancy Complications (GDM, Pre-eclampsia)", icon: Baby },
  { key: "mental_health", name: "Mental Health (Depression, Anxiety)", icon: Brain },
  { key: "dermatologic", name: "Dermatologic Manifestations (Acne, Hirsutism)", icon: AlertTriangle },
];

const ClinicianOnboardingScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    specialization: "",
    downstream_expertise: [] as string[],
    license_number: "",
    years_of_experience: 0,
    bio: "",
  });

  const getDiseaseIcon = (DiseaseClass: any) => {
    const Icon = DiseaseClass;
    return <Icon className="w-5 h-5" />;
  };

  const toggleDisease = (disease: string) => {
    setFormData(prev => {
      const current = prev.downstream_expertise;
      if (current.includes(disease)) {
        return { ...prev, downstream_expertise: current.filter(d => d !== disease) };
      } else {
        return { ...prev, downstream_expertise: [...current, disease] };
      }
    });
  };

  const canProceed = () => {
    if (step === 1) return formData.specialization !== "";
    if (step === 2) return formData.downstream_expertise.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await clinicianAPI.completeOnboarding(formData);
      navigate("/clinician/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
            <Stethoscope className="w-8 h-8 text-pink-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Set up your specialization to start receiving patient referrals</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  s <= step ? "bg-pink-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Select Your Primary Specialization"}
              {step === 2 && "Choose Your Areas of Expertise"}
              {step === 3 && "Additional Information"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "This helps route patients with specific conditions to you"}
              {step === 2 && "Select the downstream PCOS-related diseases you can manage"}
              {step === 3 && "Optional details to help patients know more about you"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {specializations.map((spec) => (
                  <button
                    key={spec.value}
                    onClick={() => setFormData({ ...formData, specialization: spec.value })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.specialization === spec.value
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    <div className="font-medium text-sm">{spec.label}</div>
                    {formData.specialization === spec.value && (
                      <Check className="w-4 h-4 text-pink-500 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Select at least one condition you can treat. Patients with these conditions will be routed to you.
                </p>
                {downstreamDiseases.map((disease) => (
                  <button
                    key={disease.key}
                    onClick={() => toggleDisease(disease.key)}
                    className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                      formData.downstream_expertise.includes(disease.key)
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      formData.downstream_expertise.includes(disease.key)
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {getDiseaseIcon(disease.icon)}
                    </div>
                    <span className="font-medium flex-1 text-left">{disease.name}</span>
                    {formData.downstream_expertise.includes(disease.key) && (
                      <Check className="w-5 h-5 text-pink-500" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="license">Medical License Number (Optional)</Label>
                  <Input
                    id="license"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="e.g., MDN/2024/001234"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience (Optional)</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell patients a bit about yourself..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="flex-1" />
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !canProceed()}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Complete Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicianOnboardingScreen;