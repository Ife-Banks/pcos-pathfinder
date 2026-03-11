import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Check,
  Calendar,
  User,
  Activity,
  Shield,
  Stethoscope,
  Clock,
  BarChart3,
  History,
  Heart,
  TestTube,
  Printer,
  Mail,
  Share2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  included: boolean;
}

const ClinicianExportScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [dateRange, setDateRange] = useState("30");

  const [sections, setSections] = useState<ExportSection[]>([
    { id: "demographics", title: "Patient Demographics", description: "Age, BMI, ethnicity, contact info", icon: User, included: true },
    { id: "risk", title: "Risk Assessment Summary", description: "Current score, tier, confidence level", icon: Activity, included: true },
    { id: "shap", title: "SHAP Analysis", description: "Feature contributions and explanations", icon: BarChart3, included: true },
    { id: "behavioral", title: "Behavioral Data", description: "Check-in history, symptoms, patterns", icon: Heart, included: true },
    { id: "wearable", title: "Wearable Data", description: "HRV, sleep, activity metrics", icon: Activity, included: true },
    { id: "clinical", title: "Clinical Data", description: "Lab results, ultrasound findings, mFG scores", icon: TestTube, included: true },
    { id: "history", title: "Inference History", description: "Risk score timeline and trends", icon: History, included: true },
    { id: "referral", title: "Referral Template", description: "Pre-filled referral documentation", icon: FileText, included: false },
  ]);

  const toggleSection = (sectionId: string) => {
    setSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, included: !s.included } : s)
    );
  };

  const selectAll = () => {
    setSections(prev => prev.map(s => ({ ...s, included: true })));
  };

  const deselectAll = () => {
    setSections(prev => prev.map(s => ({ ...s, included: false })));
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
    }, 2500);
  };

  const includedCount = sections.filter(s => s.included).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Clinical Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="gradient-clinical px-4 py-2">
          <div className="max-w-2xl mx-auto flex items-center gap-2 text-primary-foreground">
            <Stethoscope className="h-4 w-4" />
            <span className="text-sm font-display font-semibold">Clinician Portal</span>
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <p className="font-display font-bold text-foreground">Export Clinical Report</p>
              <p className="text-xs text-muted-foreground">Patient: Sarah Johnson</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Export Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-2 border-dashed">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl gradient-clinical flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">Clinical Report PDF</p>
                    <p className="text-sm text-muted-foreground">AI-MSHM Comprehensive Assessment</p>
                  </div>
                </div>
                <Badge className="bg-secondary text-foreground">
                  {includedCount} sections
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="font-display font-semibold text-foreground text-sm">Sarah Johnson</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Generated</p>
                    <p className="font-display font-semibold text-foreground text-sm">
                      {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Date Range */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Data Range
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">Time Period</p>
                    <p className="text-xs text-muted-foreground">Select data range to include</p>
                  </div>
                </div>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Report Sections
            </h3>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-primary font-semibold hover:underline">
                Select All
              </button>
              <span className="text-muted-foreground">|</span>
              <button onClick={deselectAll} className="text-xs text-muted-foreground font-semibold hover:underline hover:text-foreground">
                Clear
              </button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {sections.map((section, i) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
                >
                  <Checkbox
                    id={section.id}
                    checked={section.included}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <section.icon className="h-4 w-4 text-primary" />
                  </div>
                  <Label htmlFor={section.id} className="flex-1 cursor-pointer">
                    <p className="font-display font-semibold text-foreground text-sm">{section.title}</p>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </Label>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Export Options */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Export Actions
          </h3>
          
          {exported ? (
            <Card className="border-[hsl(var(--success))]/30">
              <CardContent className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="h-16 w-16 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="h-8 w-8 text-[hsl(var(--success))]" />
                </motion.div>
                <p className="font-display font-bold text-foreground text-lg mb-1">Report Generated!</p>
                <p className="text-sm text-muted-foreground mb-4">Your PDF is ready for download</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-1.5" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-1.5" />
                    Email
                  </Button>
                  <Button variant="clinical" size="sm">
                    <Download className="h-4 w-4 mr-1.5" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" disabled={exporting}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" disabled={exporting}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="clinical" 
                onClick={handleExport}
                disabled={exporting || includedCount === 0}
              >
                {exporting ? (
                  <span className="animate-pulse">Generating...</span>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1.5" />
                    Export
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>

        {/* HIPAA Notice */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35 }}
          className="bg-[hsl(var(--clinical-blue))]/5 border border-[hsl(var(--clinical-blue))]/20 rounded-xl p-4"
        >
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-[hsl(var(--clinical-blue))] shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-semibold text-foreground text-sm mb-1">Secure Document</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This report contains Protected Health Information (PHI). Handle according to your 
                institution's HIPAA policies. All exports are logged and tracked for compliance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicianExportScreen;
