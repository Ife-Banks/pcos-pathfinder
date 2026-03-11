import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  FileText,
  User,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock clinical summary data
const summaryData = {
  patient: {
    name: "Sarah Johnson",
    age: 28,
    id: "PT-2024-0892",
    dateGenerated: "March 10, 2024",
  },
  riskAssessment: {
    currentScore: 0.68,
    tier: "High",
    previousScore: 0.52,
    trend: "increasing",
    confidence: 0.89,
  },
  shapDrivers: [
    { feature: "LH/FSH Ratio", contribution: 0.14, direction: "positive", value: "2.8" },
    { feature: "Fasting Insulin", contribution: 0.11, direction: "positive", value: "18 mIU/L" },
    { feature: "Cycle Irregularity", contribution: 0.09, direction: "positive", value: "Yes" },
    { feature: "Ovarian Volume", contribution: 0.07, direction: "positive", value: "12.4 mL" },
    { feature: "BMI", contribution: -0.04, direction: "negative", value: "22.8" },
  ],
  clinicalData: {
    hormones: [
      { label: "LH", value: "14.2 mIU/mL", status: "elevated" },
      { label: "FSH", value: "5.1 mIU/mL", status: "normal" },
      { label: "Total Testosterone", value: "68 ng/dL", status: "elevated" },
      { label: "Free Testosterone", value: "48 pg/mL", status: "elevated" },
      { label: "DHEA-S", value: "320 μg/dL", status: "normal" },
    ],
    metabolic: [
      { label: "Fasting Glucose", value: "98 mg/dL", status: "normal" },
      { label: "Fasting Insulin", value: "18 mIU/L", status: "elevated" },
      { label: "HOMA-IR", value: "4.4", status: "elevated" },
      { label: "HbA1c", value: "5.4%", status: "normal" },
    ],
  },
  referralTemplate: `
CLINICAL REFERRAL REQUEST

Patient: Sarah Johnson
DOB: March 15, 1996
MRN: PT-2024-0892

Referring Diagnosis: Suspected Polycystic Ovary Syndrome (PCOS)

Clinical Indication:
Patient presents with irregular menstrual cycles (45+ days), clinical signs of hyperandrogenism (mFG score: 12), and biochemical evidence of elevated androgens. AI-assisted risk assessment indicates high probability (0.68) of PCOS based on integrated multi-modal data analysis.

Key Findings:
- LH/FSH ratio: 2.8 (elevated)
- Free testosterone: 48 pg/mL (elevated)
- Evidence of insulin resistance (HOMA-IR: 4.4)
- Ovarian volume: 12.4 mL on imaging

Requested Consultation:
Reproductive Endocrinology evaluation for PCOS diagnosis confirmation and management recommendations.

Urgency: Within 2 weeks recommended

Thank you for your consultation.
  `.trim(),
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Critical": return "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]";
    case "High": return "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]";
    case "Moderate": return "bg-[hsl(38_90%_55%)]/10 text-[hsl(38_90%_55%)]";
    default: return "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]";
  }
};

const ClinicalSummaryScreen = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>(["risk", "shap"]);
  const [downloading, setDownloading] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 2000);
  };

  const SectionHeader = ({ id, title, icon: Icon }: { id: string; title: string; icon: React.ElementType }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-display font-semibold text-foreground">{title}</span>
      </div>
      {expandedSections.includes(id) ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Clinical Summary</h1>
          <p className="text-xs text-muted-foreground">PDF Preview</p>
        </div>
        <Button variant="clinical" size="sm" onClick={handleDownload} disabled={downloading}>
          {downloading ? (
            <span className="animate-pulse">Generating...</span>
          ) : (
            <>
              <Download className="h-4 w-4 mr-1.5" />
              PDF
            </>
          )}
        </Button>
      </header>

      <div className="p-4 space-y-4">
        {/* Document Header Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-2 border-dashed border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground">AI-MSHM Clinical Report</h2>
                  <p className="text-sm text-muted-foreground">PCOS Risk Assessment Summary</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>Generated: {summaryData.patient.dateGenerated}</p>
                  <p>ID: {summaryData.patient.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="font-display font-semibold text-foreground text-sm">{summaryData.patient.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-display font-semibold text-foreground text-sm">{summaryData.patient.age} years</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Score Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <SectionHeader id="risk" title="Risk Assessment" icon={Activity} />
            {expandedSections.includes("risk") && (
              <CardContent className="px-4 pb-4 pt-0">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Risk Score</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold font-display text-foreground">
                        {summaryData.riskAssessment.currentScore.toFixed(2)}
                      </span>
                      <Badge className={getTierColor(summaryData.riskAssessment.tier)}>
                        {summaryData.riskAssessment.tier} Risk
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">vs Previous</p>
                    <div className="flex items-center gap-1">
                      {summaryData.riskAssessment.trend === "increasing" ? (
                        <TrendingUp className="h-4 w-4 text-[hsl(var(--destructive))]" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-[hsl(var(--success))]" />
                      )}
                      <span className={`font-display font-semibold ${
                        summaryData.riskAssessment.trend === "increasing" 
                          ? "text-[hsl(var(--destructive))]" 
                          : "text-[hsl(var(--success))]"
                      }`}>
                        {summaryData.riskAssessment.trend === "increasing" ? "+" : "-"}
                        {Math.abs(summaryData.riskAssessment.currentScore - summaryData.riskAssessment.previousScore).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Model confidence: {(summaryData.riskAssessment.confidence * 100).toFixed(0)}%</span>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* SHAP Drivers Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <SectionHeader id="shap" title="Risk Drivers (SHAP Analysis)" icon={BarChart3} />
            {expandedSections.includes("shap") && (
              <CardContent className="px-4 pb-4 pt-0">
                <div className="space-y-3">
                  {summaryData.shapDrivers.map((driver, i) => (
                    <div key={driver.feature} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{driver.feature}</span>
                          <span className="text-xs text-muted-foreground">{driver.value}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              driver.direction === "positive" 
                                ? "bg-[hsl(var(--destructive))]" 
                                : "bg-[hsl(var(--success))]"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.abs(driver.contribution) * 500}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-bold font-display min-w-[50px] text-right ${
                        driver.direction === "positive" 
                          ? "text-[hsl(var(--destructive))]" 
                          : "text-[hsl(var(--success))]"
                      }`}>
                        {driver.direction === "positive" ? "+" : ""}{driver.contribution.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Lab Results Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <SectionHeader id="labs" title="Clinical Data" icon={FileText} />
            {expandedSections.includes("labs") && (
              <CardContent className="px-4 pb-4 pt-0 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Hormones</p>
                  <div className="grid grid-cols-2 gap-2">
                    {summaryData.clinicalData.hormones.map(item => (
                      <div key={item.label} className="p-2 bg-secondary/30 rounded-lg">
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-semibold text-foreground text-sm">{item.value}</span>
                          {item.status === "elevated" && (
                            <span className="text-[9px] px-1 rounded bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
                              HIGH
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Metabolic</p>
                  <div className="grid grid-cols-2 gap-2">
                    {summaryData.clinicalData.metabolic.map(item => (
                      <div key={item.label} className="p-2 bg-secondary/30 rounded-lg">
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-semibold text-foreground text-sm">{item.value}</span>
                          {item.status === "elevated" && (
                            <span className="text-[9px] px-1 rounded bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
                              HIGH
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Referral Template Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <SectionHeader id="referral" title="Referral Template" icon={AlertTriangle} />
            {expandedSections.includes("referral") && (
              <CardContent className="px-4 pb-4 pt-0">
                <pre className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-4 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                  {summaryData.referralTemplate}
                </pre>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4" />
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
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            This report is generated by AI-MSHM for informational purposes. Risk scores are model predictions 
            and should be interpreted alongside clinical judgment. This document does not constitute a medical 
            diagnosis. Always consult qualified healthcare providers for diagnosis and treatment decisions.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicalSummaryScreen;
