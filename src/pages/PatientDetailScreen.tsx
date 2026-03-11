import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Heart,
  Moon,
  Footprints,
  Brain,
  TestTube,
  Shield,
  Stethoscope,
  BarChart3,
  History,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock patient data
const patientData = {
  id: "1",
  name: "Sarah Johnson",
  age: 28,
  email: "sarah.j@email.com",
  riskScore: 0.78,
  riskTier: "High",
  lastActivity: "2 hours ago",
  memberSince: "January 2024",
  
  demographics: {
    height: "165 cm",
    weight: "62 kg",
    bmi: 22.8,
    ethnicity: "White/Caucasian",
  },
  
  behavioralData: {
    checkInStreak: 12,
    avgFatigue: 6.2,
    avgMood: 5.8,
    avgPain: 4.1,
    lastCheckIn: "Today, 8:30 AM",
  },
  
  wearableData: {
    avgHRV: 42,
    hrvTrend: "decreasing",
    avgSteps: 6500,
    avgSleep: 6.8,
    lastSync: "2 hours ago",
  },
  
  clinicalData: {
    lastLabDate: "Feb 15, 2024",
    lhFshRatio: 2.8,
    freeTestosterone: "48 pg/mL",
    fastingInsulin: "18 mIU/L",
    mfgScore: 12,
    lastUltrasound: "Jan 20, 2024",
    ovarianVolume: "12.4 mL",
  },
  
  shapValues: [
    { feature: "LH/FSH Ratio", value: "+0.14", direction: "positive", pct: 70 },
    { feature: "Fasting Insulin", value: "+0.11", direction: "positive", pct: 55 },
    { feature: "Cycle Irregularity", value: "+0.09", direction: "positive", pct: 45 },
    { feature: "Ovarian Volume", value: "+0.07", direction: "positive", pct: 35 },
    { feature: "BMI", value: "−0.04", direction: "negative", pct: 20 },
  ],
  
  inferenceHistory: [
    { date: "Mar 10, 2024", score: 0.78, tier: "High" },
    { date: "Mar 3, 2024", score: 0.72, tier: "High" },
    { date: "Feb 25, 2024", score: 0.65, tier: "Moderate" },
    { date: "Feb 18, 2024", score: 0.58, tier: "Moderate" },
    { date: "Feb 11, 2024", score: 0.52, tier: "Moderate" },
  ],
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Critical": return "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]";
    case "High": return "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]";
    case "Moderate": return "bg-[hsl(38_90%_55%)]/10 text-[hsl(38_90%_55%)]";
    default: return "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]";
  }
};

const PatientDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [expandedSections, setExpandedSections] = useState<string[]>(["shap"]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const SectionHeader = ({ id, title, icon: Icon, badge }: { id: string; title: string; icon: React.ElementType; badge?: string }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-display font-semibold text-foreground">{title}</span>
        {badge && <Badge className="bg-secondary text-muted-foreground border-0 text-[10px]">{badge}</Badge>}
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
            <button onClick={() => navigate("/clinician/patients")} className="p-1.5 rounded-lg hover:bg-secondary">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <p className="font-display font-bold text-foreground">Patient Detail</p>
              <p className="text-xs text-muted-foreground">Full clinical view</p>
            </div>
            <Button variant="clinical" size="sm" onClick={() => navigate(`/clinician/patient/${id}/export`)}>
              <Download className="h-4 w-4 mr-1.5" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Patient Header Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-[hsl(var(--warning))]/30 border-l-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="gradient-clinical text-primary-foreground font-display font-bold text-lg">
                    {patientData.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display font-bold text-lg text-foreground">{patientData.name}</h2>
                    <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{patientData.age} years</span>
                    <span>{patientData.demographics.ethnicity}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {patientData.lastActivity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-display text-foreground">{patientData.riskScore.toFixed(2)}</div>
                  <Badge className={getTierColor(patientData.riskTier)}>{patientData.riskTier} Risk</Badge>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
                {[
                  { label: "BMI", value: patientData.demographics.bmi },
                  { label: "Avg HRV", value: `${patientData.wearableData.avgHRV}ms` },
                  { label: "mFG Score", value: patientData.clinicalData.mfgScore },
                  { label: "LH/FSH", value: patientData.clinicalData.lhFshRatio },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-2 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-display font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Layers Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Tabs defaultValue="behavioral" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
              <TabsTrigger value="wearable">Wearable</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="behavioral" className="mt-3">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Check-in Streak", value: `${patientData.behavioralData.checkInStreak} days`, icon: Activity },
                      { label: "Avg Fatigue", value: `${patientData.behavioralData.avgFatigue}/10`, icon: Brain },
                      { label: "Avg Mood", value: `${patientData.behavioralData.avgMood}/10`, icon: Heart },
                      { label: "Avg Pain", value: `${patientData.behavioralData.avgPain}/10`, icon: AlertTriangle },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                        <p className="font-display font-bold text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Last check-in: {patientData.behavioralData.lastCheckIn}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="wearable" className="mt-3">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Avg HRV", value: `${patientData.wearableData.avgHRV}ms`, icon: Heart, trend: patientData.wearableData.hrvTrend },
                      { label: "Avg Steps", value: patientData.wearableData.avgSteps.toLocaleString(), icon: Footprints },
                      { label: "Avg Sleep", value: `${patientData.wearableData.avgSleep}h`, icon: Moon },
                      { label: "Last Sync", value: patientData.wearableData.lastSync, icon: Clock },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-display font-bold text-foreground">{item.value}</p>
                          {item.trend && (
                            item.trend === "decreasing" 
                              ? <TrendingDown className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
                              : <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="clinical" className="mt-3">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "LH/FSH Ratio", value: patientData.clinicalData.lhFshRatio, status: "elevated" },
                        { label: "Free Testosterone", value: patientData.clinicalData.freeTestosterone, status: "elevated" },
                        { label: "Fasting Insulin", value: patientData.clinicalData.fastingInsulin, status: "elevated" },
                        { label: "mFG Score", value: patientData.clinicalData.mfgScore, status: "elevated" },
                      ].map(item => (
                        <div key={item.label} className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="font-display font-bold text-foreground">{item.value}</p>
                            <Badge className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-0 text-[9px]">
                              HIGH
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                      <p>Last labs: {patientData.clinicalData.lastLabDate}</p>
                      <p>Ovarian volume: {patientData.clinicalData.ovarianVolume} ({patientData.clinicalData.lastUltrasound})</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* SHAP Values */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <SectionHeader id="shap" title="SHAP Feature Contributions" icon={BarChart3} />
            {expandedSections.includes("shap") && (
              <CardContent className="px-4 pb-4 pt-0">
                <div className="space-y-3">
                  {patientData.shapValues.map((item, i) => (
                    <div key={item.feature}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{item.feature}</span>
                        <span className={`text-sm font-bold font-display ${
                          item.direction === "positive" ? "text-[hsl(var(--destructive))]" : "text-[hsl(var(--success))]"
                        }`}>
                          {item.value}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            item.direction === "positive" ? "bg-[hsl(var(--destructive))]" : "bg-[hsl(var(--success))]"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Inference History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <SectionHeader id="history" title="Inference History" icon={History} badge={`${patientData.inferenceHistory.length} records`} />
            {expandedSections.includes("history") && (
              <CardContent className="px-4 pb-4 pt-0">
                <div className="space-y-2">
                  {patientData.inferenceHistory.map((record, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{record.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-foreground">{record.score.toFixed(2)}</span>
                        <Badge className={`${getTierColor(record.tier)} text-[10px]`}>{record.tier}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline-clinical" size="lg">
              <FileText className="h-4 w-4 mr-2" />
              View Full Timeline
            </Button>
            <Button variant="clinical" size="lg" onClick={() => navigate(`/clinician/patient/${id}/export`)}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
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
            <p className="text-xs text-muted-foreground leading-relaxed">
              This patient has consented to share their health data with your practice. 
              Any actions taken on this record are logged for HIPAA compliance.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDetailScreen;
