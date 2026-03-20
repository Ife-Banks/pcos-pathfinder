import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Eye,
  Database,
  FileText,
  Trash2,
  Download,
  Lock,
  Users,
  AlertTriangle,
  ChevronRight,
  Loader2,
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
import { settingsService, PrivacySettings } from "@/services/settingsService";
import { toast } from "@/hooks/use-toast";

const TEAL = '#00897B';

const DataPrivacyScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsService.getPrivacySettings();
      setSettings(res.data);
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return;
      }
      toast({ title: 'Error', description: 'Unable to load privacy settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.savePrivacySettings(settings);
      toast({ title: 'Privacy settings saved ✓', description: 'Your preferences have been updated.' });
    } catch {
      toast({ title: 'Failed to save', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await settingsService.exportData();
      toast({ title: 'Data export requested', description: 'You will receive an email with the download link.' });
    } catch {
      toast({ title: 'Export failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await settingsService.deleteAccount();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    } catch {
      toast({ title: 'Failed to delete account', description: 'Please try again.', variant: 'destructive' });
      setDeleting(false);
    }
  };

  const dataLayers = [
    {
      id: "behavioral_data_enabled" as const,
      icon: Eye,
      title: "Behavioral Data",
      description: "Daily check-ins, mood, symptoms",
      examples: ["Morning/evening check-ins", "Fatigue levels", "Pain tracking"],
      key: "behavioral_data_enabled" as keyof PrivacySettings,
    },
    {
      id: "wearable_data_enabled" as const,
      icon: Database,
      title: "Wearable Data",
      description: "HRV, steps, sleep patterns",
      examples: ["Heart rate variability", "Sleep stages", "Activity metrics"],
      key: "wearable_data_enabled" as keyof PrivacySettings,
    },
    {
      id: "clinical_data_enabled" as const,
      icon: FileText,
      title: "Clinical Data",
      description: "Lab results, ultrasound, assessments",
      examples: ["Lab test results", "Ultrasound findings", "mFG scores"],
      key: "clinical_data_enabled" as keyof PrivacySettings,
    },
  ];

  const consentItems = [
    {
      id: "share_with_clinician" as const,
      icon: Users,
      title: "Share with Clinician",
      description: "Allow your connected healthcare providers to view your data",
      key: "share_with_clinician" as keyof PrivacySettings,
    },
    {
      id: "anonymized_research" as const,
      icon: Database,
      title: "Anonymized Research",
      description: "Contribute to PCOS research (fully anonymized)",
      key: "anonymized_research" as keyof PrivacySettings,
    },
    {
      id: "model_improvement" as const,
      icon: Lock,
      title: "Model Improvement",
      description: "Help improve AI predictions with your anonymized patterns",
      key: "model_improvement" as keyof PrivacySettings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-gray-900">Data & Privacy</h1>
          <p className="text-xs text-gray-500">Control your health data</p>
        </div>
        <Shield className="w-5 h-5" style={{ color: TEAL }} />
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-24 bg-gray-100 rounded" />
              </div>
            ))}
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Data Layer Visibility
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Control which data layers are used in your risk score calculation and visible to connected clinicians.
              </p>
              <div className="space-y-3">
                {dataLayers.map((layer, i) => {
                  const enabled = settings ? Boolean(settings[layer.key]) : true;
                  return (
                    <motion.div
                      key={layer.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <Card className={enabled ? "border-gray-200" : "opacity-60"}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${enabled ? '' : 'bg-gray-100'}`}
                              style={enabled ? { background: `linear-gradient(135deg, ${TEAL}, #00695C)` } : {}}>
                              <layer.icon className={`h-5 w-5 ${enabled ? 'text-white' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-display font-semibold text-gray-900 text-sm">{layer.title}</p>
                                <Switch
                                  checked={enabled}
                                  onCheckedChange={(v) => {
                                    if (!settings) return;
                                    setSettings({ ...settings, [layer.key]: v });
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mb-2">{layer.description}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {layer.examples.map(ex => (
                                  <span key={ex} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                    {ex}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Consent Management
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-0 divide-y divide-gray-100">
                  {consentItems.map((item) => {
                    const enabled = settings ? Boolean(settings[item.key]) : false;
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-4">
                        <item.icon className="h-5 w-5 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-gray-900 text-sm">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(v) => {
                            if (!settings) return;
                            setSettings({ ...settings, [item.key]: v });
                          }}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3">
                Your Data Rights
              </h3>
              <Card className="border border-gray-200">
                <CardContent className="p-0 divide-y divide-gray-100">
                  <button
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                    onClick={handleExport}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <Loader2 className="h-5 w-5 text-gray-400 shrink-0 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 shrink-0" style={{ color: TEAL }} />
                    )}
                    <div className="flex-1">
                      <p className="font-display font-semibold text-gray-900 text-sm">Export My Data</p>
                      <p className="text-xs text-gray-500">Download all your health data as a file</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="w-full flex items-center gap-4 p-4 hover:bg-red-50 transition-colors text-left">
                        <Trash2 className="h-5 w-5 text-red-500 shrink-0" />
                        <div className="flex-1">
                          <p className="font-display font-semibold text-red-600 text-sm">Delete All Data</p>
                          <p className="text-xs text-gray-500">Permanently erase your account and data</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Delete All Data
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently erase your account and all health data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                        >
                          {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                          Yes, Delete Everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4"
            >
              <div className="flex gap-3">
                <Lock className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-semibold text-gray-900 text-sm mb-1">Your Data is Protected</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    All health data is encrypted at rest and in transit. We comply with HIPAA regulations and never sell your personal information.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Button
                size="lg"
                className="w-full rounded-xl text-white"
                style={{ backgroundColor: TEAL }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Privacy Settings
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataPrivacyScreen;
