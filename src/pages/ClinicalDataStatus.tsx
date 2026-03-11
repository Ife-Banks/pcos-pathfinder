import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  XCircle,
  FlaskConical,
  FileImage,
  Brain,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BiomarkerStatus {
  key: string;
  label: string;
  unit: string;
  present: boolean;
  value?: string;
}

const BIOMARKER_STATUS: BiomarkerStatus[] = [
  { key: "lh", label: "LH", unit: "mIU/mL", present: true, value: "8.2" },
  { key: "fsh", label: "FSH", unit: "mIU/mL", present: true, value: "5.1" },
  { key: "amh", label: "AMH", unit: "ng/mL", present: false },
  { key: "testosterone", label: "Testosterone", unit: "ng/dL", present: true, value: "45" },
  { key: "dheas", label: "DHEAS", unit: "µg/dL", present: false },
  { key: "tsh", label: "TSH", unit: "mIU/L", present: true, value: "2.1" },
  { key: "fasting_insulin", label: "Fasting Insulin", unit: "µIU/mL", present: false },
  { key: "glucose", label: "Glucose", unit: "mg/dL", present: true, value: "95" },
  { key: "hba1c", label: "HbA1c", unit: "%", present: true, value: "5.4" },
];

const ClinicalDataStatus = () => {
  const navigate = useNavigate();

  const presentCount = BIOMARKER_STATUS.filter((b) => b.present).length;
  const totalCount = BIOMARKER_STATUS.length;
  const completeness = Math.round((presentCount / totalCount) * 100);

  const hasUltrasound = true;
  const hasMenstrualData = true;
  const hasSymptomData = true;

  const dataCategories = [
    {
      icon: FlaskConical,
      label: "Lab Results",
      detail: `${presentCount}/${totalCount} biomarkers`,
      complete: presentCount === totalCount,
      partial: presentCount > 0,
      route: "/lab-results",
    },
    {
      icon: FileImage,
      label: "Ultrasound / DICOM",
      detail: hasUltrasound ? "Processed" : "Not uploaded",
      complete: hasUltrasound,
      partial: false,
      route: "/ultrasound-upload",
    },
    {
      icon: Brain,
      label: "Symptom Tracking",
      detail: hasSymptomData ? "7-day streak" : "No data",
      complete: hasSymptomData,
      partial: false,
      route: "/check-in/morning",
    },
    {
      icon: ClipboardList,
      label: "Menstrual History",
      detail: hasMenstrualData ? "3 cycles logged" : "No data",
      complete: hasMenstrualData,
      partial: false,
      route: "/cycle-history",
    },
  ];

  const overallComplete =
    dataCategories.filter((c) => c.complete).length;
  const overallPct = Math.round((overallComplete / dataCategories.length) * 100);

  const getCompletnessBadge = () => {
    if (overallPct === 100)
      return { label: "Complete", className: "bg-accent/10 text-accent border-0" };
    if (overallPct >= 50)
      return { label: "Partial", className: "bg-warning/10 text-warning border-0" };
    return { label: "Incomplete", className: "bg-destructive/10 text-destructive border-0" };
  };

  const badge = getCompletnessBadge();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Clinical Data</h1>
          <p className="text-xs text-muted-foreground">Data completeness overview</p>
        </div>
        <Badge className={badge.className}>{badge.label}</Badge>
      </header>

      <div className="p-4 space-y-4">
        {/* Overall Completeness */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-lg">Data Completeness</p>
                <span className="text-2xl font-display font-bold">{overallPct}%</span>
              </div>
              <Progress
                value={overallPct}
                className="h-2.5 bg-primary-foreground/20 [&>div]:bg-primary-foreground"
              />
              <p className="text-sm text-primary-foreground/80">
                {overallComplete}/{dataCategories.length} categories complete
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories */}
        <div className="space-y-2.5">
          {dataCategories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className="border-border cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => navigate(cat.route)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      cat.complete ? "bg-accent/10" : cat.partial ? "bg-warning/10" : "bg-secondary"
                    }`}
                  >
                    <cat.icon
                      className={`w-5 h-5 ${
                        cat.complete
                          ? "text-accent"
                          : cat.partial
                          ? "text-warning"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-foreground">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.detail}</p>
                  </div>
                  {cat.complete ? (
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Biomarker Detail */}
        <div>
          <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
            Biomarker Breakdown
          </h2>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {BIOMARKER_STATUS.map((bm) => (
                <div key={bm.key} className="px-4 py-3 flex items-center gap-3">
                  {bm.present ? (
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive/60 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{bm.label}</p>
                  </div>
                  {bm.present ? (
                    <span className="text-sm font-semibold text-foreground">
                      {bm.value} <span className="text-xs text-muted-foreground font-normal">{bm.unit}</span>
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-xs border-destructive/30 text-destructive">
                      Missing
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {presentCount < totalCount && (
          <Button
            variant="outline-clinical"
            size="lg"
            className="w-full"
            onClick={() => navigate("/lab-results")}
          >
            Add Missing Lab Results
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClinicalDataStatus;
