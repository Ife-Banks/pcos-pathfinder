import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, FileImage, Cpu, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

type UploadStatus = "idle" | "uploading" | "processing" | "complete" | "error";

const UltrasoundUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);

  const processingSteps = [
    "Validating DICOM metadata…",
    "Segmenting ovarian structures…",
    "Counting follicles via CNN…",
    "Measuring ovarian volume…",
    "Generating morphology report…",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus("idle");
      setUploadProgress(0);
      setProcessingStep(0);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setStatus("uploading");
    setUploadProgress(0);
  };

  // Simulate upload progress
  useEffect(() => {
    if (status !== "uploading") return;
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("processing");
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [status]);

  // Simulate CNN processing steps
  useEffect(() => {
    if (status !== "processing") return;
    const interval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(interval);
          setStatus("complete");
          toast({ title: "Analysis complete", description: "Ultrasound processed successfully." });
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [status]);

  const statusConfig = {
    idle: { color: "text-muted-foreground", bg: "bg-secondary" },
    uploading: { color: "text-primary", bg: "bg-primary/10" },
    processing: { color: "text-warning", bg: "bg-warning/10" },
    complete: { color: "text-accent", bg: "bg-accent/10" },
    error: { color: "text-destructive", bg: "bg-destructive/10" },
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">Ultrasound Upload</h1>
          <p className="text-xs text-muted-foreground">DICOM or image files</p>
        </div>
        <FileImage className="w-5 h-5 text-primary" />
      </header>

      <div className="p-4 space-y-4">
        {/* Upload Area */}
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <motion.div
              className="w-16 h-16 rounded-2xl gradient-clinical flex items-center justify-center"
              animate={status === "uploading" ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Upload className="w-7 h-7 text-primary-foreground" />
            </motion.div>
            <div>
              <p className="font-display font-bold text-foreground">
                {file ? file.name : "Upload Ultrasound"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {file
                  ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                  : "DICOM (.dcm), PNG, or JPEG accepted"}
              </p>
            </div>
            {status === "idle" && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".dcm,.dicom,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button variant="outline-clinical" size="sm" asChild>
                  <span>{file ? "Change File" : "Choose File"}</span>
                </Button>
              </label>
            )}
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {status === "uploading" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground font-display">Uploading…</p>
                  <span className="text-sm text-primary font-semibold">
                    {Math.min(Math.round(uploadProgress), 100)}%
                  </span>
                </div>
                <Progress value={Math.min(uploadProgress, 100)} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* CNN Processing Indicator */}
        {(status === "processing" || status === "complete") && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary" />
                  <p className="font-display font-bold text-foreground text-sm">CNN Processing</p>
                  {status === "processing" && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin ml-auto" />
                  )}
                  {status === "complete" && (
                    <Badge className="ml-auto bg-accent/10 text-accent border-0">Done</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {processingSteps.map((step, i) => {
                    const isDone = status === "complete" || i < processingStep;
                    const isCurrent = status === "processing" && i === processingStep;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: i <= processingStep || status === "complete" ? 1 : 0.3, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2.5"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            isDone ? "text-foreground" : isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {step}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Complete Summary */}
        {status === "complete" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4 space-y-2">
                <p className="font-display font-bold text-foreground text-sm">Analysis Summary</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Follicle Count", value: "14" },
                    { label: "Left Ovary Vol.", value: "11.2 mL" },
                    { label: "Right Ovary Vol.", value: "12.8 mL" },
                    { label: "PCO Morphology", value: "Detected" },
                  ].map((item) => (
                    <div key={item.label} className="bg-card rounded-lg p-2.5">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-display font-bold text-foreground text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error State */}
        {status === "error" && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-display font-semibold text-foreground text-sm">Upload Failed</p>
                <p className="text-xs text-muted-foreground">Please try again or use a different file.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom CTA */}
      {file && status === "idle" && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-4">
          <Button variant="clinical" size="lg" className="w-full" onClick={handleUpload}>
            Upload & Analyze
          </Button>
        </div>
      )}

      {status === "complete" && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-4">
          <Button variant="clinical" size="lg" className="w-full" onClick={() => navigate("/clinical-status")}>
            View Clinical Status
          </Button>
        </div>
      )}
    </div>
  );
};

export default UltrasoundUpload;
