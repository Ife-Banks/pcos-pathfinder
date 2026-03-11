import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  Database,
  FileText,
  Trash2,
  Download,
  Lock,
  Users,
  AlertTriangle,
  ChevronRight,
  Check,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DataLayer {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  examples: string[];
  visible: boolean;
}

const DataPrivacyScreen = () => {
  const navigate = useNavigate();
  
  const [dataLayers, setDataLayers] = useState<DataLayer[]>([
    {
      id: "behavioral",
      icon: Eye,
      title: "Behavioral Data",
      description: "Daily check-ins, mood, symptoms",
      examples: ["Morning/evening check-ins", "Fatigue levels", "Pain tracking"],
      visible: true,
    },
    {
      id: "wearable",
      icon: Database,
      title: "Wearable Data",
      description: "HRV, steps, sleep patterns",
      examples: ["Heart rate variability", "Sleep stages", "Activity metrics"],
      visible: true,
    },
    {
      id: "clinical",
      icon: FileText,
      title: "Clinical Data",
      description: "Lab results, ultrasound, assessments",
      examples: ["Lab test results", "Ultrasound findings", "mFG scores"],
      visible: true,
    },
  ]);

  const [consentSettings, setConsentSettings] = useState({
    shareWithClinician: true,
    anonymizedResearch: false,
    modelImprovement: true,
  });

  const toggleDataLayer = (id: string) => {
    setDataLayers(prev =>
      prev.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Data & Privacy</h1>
          <p className="text-xs text-muted-foreground">Control your health data</p>
        </div>
        <Shield className="w-5 h-5 text-primary" />
      </header>

      <div className="p-4 space-y-4">
        {/* Data Layer Visibility */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Data Layer Visibility
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Control which data layers are used in your risk score calculation and visible to connected clinicians.
          </p>
          <div className="space-y-3">
            {dataLayers.map((layer, i) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Card className={layer.visible ? "border-primary/30" : "opacity-60"}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        layer.visible ? "gradient-primary" : "bg-secondary"
                      }`}>
                        <layer.icon className={`h-5 w-5 ${layer.visible ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-display font-semibold text-foreground text-sm">{layer.title}</p>
                          <Switch 
                            checked={layer.visible} 
                            onCheckedChange={() => toggleDataLayer(layer.id)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{layer.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {layer.examples.map(ex => (
                            <span key={ex} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Consent Management */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Consent Management
          </h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {/* Share with Clinician */}
              <div className="flex items-center gap-4 p-4">
                <Users className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-foreground text-sm">Share with Clinician</p>
                  <p className="text-xs text-muted-foreground">Allow your connected healthcare providers to view your data</p>
                </div>
                <Switch 
                  checked={consentSettings.shareWithClinician}
                  onCheckedChange={(v) => setConsentSettings({...consentSettings, shareWithClinician: v})}
                />
              </div>

              {/* Anonymized Research */}
              <div className="flex items-center gap-4 p-4">
                <Database className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-foreground text-sm">Anonymized Research</p>
                  <p className="text-xs text-muted-foreground">Contribute to PCOS research (fully anonymized)</p>
                </div>
                <Switch 
                  checked={consentSettings.anonymizedResearch}
                  onCheckedChange={(v) => setConsentSettings({...consentSettings, anonymizedResearch: v})}
                />
              </div>

              {/* Model Improvement */}
              <div className="flex items-center gap-4 p-4">
                <Lock className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-foreground text-sm">Model Improvement</p>
                  <p className="text-xs text-muted-foreground">Help improve AI predictions with your anonymized patterns</p>
                </div>
                <Switch 
                  checked={consentSettings.modelImprovement}
                  onCheckedChange={(v) => setConsentSettings({...consentSettings, modelImprovement: v})}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Your Data Rights
          </h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {/* Download Data */}
              <button className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left">
                <Download className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="font-display font-semibold text-foreground text-sm">Export My Data</p>
                  <p className="text-xs text-muted-foreground">Download all your health data as a file</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Delete Data */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center gap-4 p-4 hover:bg-destructive/5 transition-colors text-left">
                    <Trash2 className="h-5 w-5 text-[hsl(var(--destructive))] shrink-0" />
                    <div className="flex-1">
                      <p className="font-display font-semibold text-[hsl(var(--destructive))] text-sm">Delete All Data</p>
                      <p className="text-xs text-muted-foreground">Permanently erase your account and data</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-[hsl(var(--destructive))]" />
                      Delete All Data?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All your health data, check-in history, risk scores, 
                      and account information will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/90">
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35 }}
          className="bg-[hsl(var(--success))]/5 border border-[hsl(var(--success))]/20 rounded-xl p-4"
        >
          <div className="flex gap-3">
            <Lock className="h-5 w-5 text-[hsl(var(--success))] shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-semibold text-foreground text-sm mb-1">Your Data is Protected</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All health data is encrypted at rest and in transit. We comply with HIPAA regulations 
                and never sell your personal information to third parties.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button variant="clinical" size="lg" className="w-full" onClick={() => navigate(-1)}>
            Save Privacy Settings
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default DataPrivacyScreen;
