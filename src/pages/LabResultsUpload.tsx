import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FlaskConical, Upload, FileText, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Biomarker {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
  category: "hormonal" | "metabolic";
}

const BIOMARKERS: Biomarker[] = [
  { key: "lh", label: "LH", unit: "mIU/mL", placeholder: "e.g. 8.2", category: "hormonal" },
  { key: "fsh", label: "FSH", unit: "mIU/mL", placeholder: "e.g. 5.1", category: "hormonal" },
  { key: "amh", label: "AMH", unit: "ng/mL", placeholder: "e.g. 4.5", category: "hormonal" },
  { key: "testosterone", label: "Testosterone", unit: "ng/dL", placeholder: "e.g. 45", category: "hormonal" },
  { key: "dheas", label: "DHEAS", unit: "µg/dL", placeholder: "e.g. 280", category: "hormonal" },
  { key: "tsh", label: "TSH", unit: "mIU/L", placeholder: "e.g. 2.1", category: "hormonal" },
  { key: "fasting_insulin", label: "Fasting Insulin", unit: "µIU/mL", placeholder: "e.g. 12", category: "metabolic" },
  { key: "glucose", label: "Glucose", unit: "mg/dL", placeholder: "e.g. 95", category: "metabolic" },
  { key: "hba1c", label: "HbA1c", unit: "%", placeholder: "e.g. 5.4", category: "metabolic" },
];

const LabResultsUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"manual" | "upload">("manual");

  const filledCount = Object.values(values).filter((v) => v.trim() !== "").length;

  const handleChange = (key: string, val: string) => {
    if (val !== "" && !/^\d*\.?\d*$/.test(val)) return;
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      toast({ title: "PDF attached", description: file.name });
    } else if (file) {
      toast({ title: "Invalid file", description: "Please upload a PDF.", variant: "destructive" });
    }
  };

  const handleSubmit = () => {
    toast({ title: "Lab results saved", description: `${filledCount} biomarkers recorded.` });
    navigate("/clinical-status");
  };

  const hormonalMarkers = BIOMARKERS.filter((b) => b.category === "hormonal");
  const metabolicMarkers = BIOMARKERS.filter((b) => b.category === "metabolic");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Lab Results</h1>
          <p className="text-xs text-muted-foreground">{filledCount}/9 biomarkers entered</p>
        </div>
        <FlaskConical className="w-5 h-5 text-primary" />
      </header>

      <div className="p-4 space-y-4 pb-28">
        {/* Tab Switcher */}
        <div className="flex gap-2 bg-secondary rounded-xl p-1">
          {(["manual", "upload"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold font-display transition-all ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {tab === "manual" ? "Manual Entry" : "PDF Upload"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "manual" ? (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Hormonal */}
              <div>
                <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                  Hormonal Panel
                </h2>
                <div className="space-y-2.5">
                  {hormonalMarkers.map((bm) => (
                    <Card key={bm.key} className="border-border shadow-none">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-sm text-foreground">{bm.label}</p>
                          <p className="text-xs text-muted-foreground">{bm.unit}</p>
                        </div>
                        <Input
                          inputMode="decimal"
                          placeholder={bm.placeholder}
                          value={values[bm.key] || ""}
                          onChange={(e) => handleChange(bm.key, e.target.value)}
                          className="w-28 text-right h-9 text-sm"
                        />
                        {values[bm.key]?.trim() && (
                          <Check className="w-4 h-4 text-accent shrink-0" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Metabolic */}
              <div>
                <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                  Metabolic Panel
                </h2>
                <div className="space-y-2.5">
                  {metabolicMarkers.map((bm) => (
                    <Card key={bm.key} className="border-border shadow-none">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-sm text-foreground">{bm.label}</p>
                          <p className="text-xs text-muted-foreground">{bm.unit}</p>
                        </div>
                        <Input
                          inputMode="decimal"
                          placeholder={bm.placeholder}
                          value={values[bm.key] || ""}
                          onChange={(e) => handleChange(bm.key, e.target.value)}
                          className="w-28 text-right h-9 text-sm"
                        />
                        {values[bm.key]?.trim() && (
                          <Check className="w-4 h-4 text-accent shrink-0" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                <CardContent className="p-8 flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">Upload Lab Report PDF</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll extract biomarker values automatically
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button variant="outline-clinical" size="sm" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </CardContent>
              </Card>

              {pdfFile && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-accent/30 bg-accent/5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <FileText className="w-5 h-5 text-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{pdfFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(pdfFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <Badge className="bg-accent/10 text-accent border-0">Ready</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <div className="bg-secondary/50 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Supported formats: PDF lab reports from major diagnostic labs. Values will be extracted and you can review before saving.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-4">
        <Button
          variant="clinical"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={filledCount === 0 && !pdfFile}
        >
          {pdfFile ? "Upload & Extract" : `Save ${filledCount} Result${filledCount !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
};

export default LabResultsUpload;
