import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  ChevronRight,
  Calendar,
  Shield,
  Stethoscope,
  Building2,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// Mock data for high/critical risk referral
const referralData = {
  riskScore: 0.78,
  riskTier: "High",
  urgencyLevel: "Urgent",
  urgencyDescription: "Recommend consultation within 2 weeks",
  specialist: {
    type: "Reproductive Endocrinologist",
    reason: "Elevated androgen levels and irregular cycles suggest PCOS requiring specialist evaluation",
  },
  recommendedActions: [
    "Complete hormone panel (FSH, LH, testosterone, DHEA-S)",
    "Pelvic ultrasound to assess ovarian morphology",
    "Fasting glucose and insulin levels",
    "Lipid profile assessment",
  ],
  nearbyProviders: [
    {
      name: "Dr. Sarah Chen, MD",
      specialty: "Reproductive Endocrinology",
      clinic: "Women's Health Specialists",
      address: "123 Medical Center Dr, Suite 400",
      phone: "(555) 123-4567",
      distance: "2.3 miles",
      nextAvailable: "March 15, 2024",
    },
    {
      name: "Dr. Michael Torres, MD",
      specialty: "OB/GYN, PCOS Specialist",
      clinic: "Metro Women's Care",
      address: "456 Healthcare Blvd, Floor 2",
      phone: "(555) 987-6543",
      distance: "4.1 miles",
      nextAvailable: "March 18, 2024",
    },
  ],
  keyFindings: [
    { label: "LH/FSH Ratio", value: "2.8", status: "elevated" },
    { label: "Free Testosterone", value: "48 pg/mL", status: "elevated" },
    { label: "Cycle Length", value: "45+ days", status: "irregular" },
    { label: "mFG Score", value: "12", status: "elevated" },
  ],
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "Critical": return { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]", border: "border-[hsl(var(--destructive))]/30" };
    case "Urgent": return { bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]", border: "border-[hsl(var(--warning))]/30" };
    default: return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" };
  }
};

const ClinicalReferralScreen = () => {
  const navigate = useNavigate();
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const urgencyColors = getUrgencyColor(referralData.urgencyLevel);

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone.replace(/[^0-9]/g, ""));
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Clinical Referral</h1>
          <p className="text-xs text-muted-foreground">Specialist recommendation</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Urgency Alert */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`${urgencyColors.border} border-2`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl ${urgencyColors.bg} flex items-center justify-center shrink-0`}>
                  <AlertTriangle className={`h-6 w-6 ${urgencyColors.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${urgencyColors.bg} ${urgencyColors.text} border-0`}>
                      {referralData.urgencyLevel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Risk Score: {referralData.riskScore.toFixed(2)}</span>
                  </div>
                  <p className="font-display font-bold text-foreground">{referralData.riskTier} Risk Detected</p>
                  <p className="text-sm text-muted-foreground mt-1">{referralData.urgencyDescription}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Specialist */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Recommended Specialist
          </h3>
          <Card className="border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg gradient-clinical flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-display font-bold text-foreground">{referralData.specialist.type}</p>
                  <p className="text-xs text-muted-foreground">Based on your clinical profile</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/50 rounded-lg p-3">
                {referralData.specialist.reason}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Findings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Key Clinical Findings
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {referralData.keyFindings.map((finding, i) => (
                  <div key={finding.label} className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">{finding.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-foreground">{finding.value}</p>
                      <Badge 
                        className={`text-[10px] border-0 ${
                          finding.status === "elevated" || finding.status === "irregular" 
                            ? "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" 
                            : "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                        }`}
                      >
                        {finding.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Recommended Evaluations
          </h3>
          <Card>
            <CardContent className="p-4 space-y-2.5">
              {referralData.recommendedActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground">{action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Nearby Providers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Nearby Specialists
          </h3>
          <div className="space-y-3">
            {referralData.nearbyProviders.map((provider, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-foreground">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                    </div>
                    <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-0 text-[10px]">
                      {provider.distance}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span>{provider.clinic}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{provider.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Next available: {provider.nextAvailable}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => copyPhone(provider.phone)}>
                      {copiedPhone === provider.phone ? (
                        <>
                          <Check className="h-4 w-4 mr-1.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-1.5" />
                          {provider.phone}
                        </>
                      )}
                    </Button>
                    <Button variant="clinical" size="sm">
                      Book
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline-clinical" size="lg" onClick={() => navigate("/clinical-summary")}>
              <FileText className="h-4 w-4 mr-2" />
              View Summary
            </Button>
            <Button variant="clinical" size="lg" onClick={() => navigate("/clinical-summary")}>
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35 }}
          className="bg-secondary/50 rounded-xl p-4"
        >
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This referral recommendation is based on AI analysis and should be discussed with your 
              healthcare provider. The final decision on specialist consultation rests with you and 
              your primary care physician.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicalReferralScreen;
