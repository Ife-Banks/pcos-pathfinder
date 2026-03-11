import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  User,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Shield,
  Stethoscope,
  LogOut,
  Bell,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/logo.png";

interface Patient {
  id: string;
  name: string;
  age: number;
  riskScore: number;
  riskTier: "Low" | "Moderate" | "High" | "Critical";
  trend: "increasing" | "decreasing" | "stable";
  lastActivity: string;
  dataCompleteness: number;
  flagged: boolean;
}

const mockPatients: Patient[] = [
  { id: "1", name: "Sarah Johnson", age: 28, riskScore: 0.78, riskTier: "High", trend: "increasing", lastActivity: "2 hours ago", dataCompleteness: 85, flagged: true },
  { id: "2", name: "Emily Chen", age: 32, riskScore: 0.82, riskTier: "Critical", trend: "stable", lastActivity: "1 day ago", dataCompleteness: 92, flagged: true },
  { id: "3", name: "Maria Garcia", age: 25, riskScore: 0.45, riskTier: "Moderate", trend: "decreasing", lastActivity: "3 hours ago", dataCompleteness: 78, flagged: false },
  { id: "4", name: "Jessica Williams", age: 30, riskScore: 0.22, riskTier: "Low", trend: "stable", lastActivity: "5 hours ago", dataCompleteness: 65, flagged: false },
  { id: "5", name: "Amanda Brown", age: 27, riskScore: 0.68, riskTier: "High", trend: "increasing", lastActivity: "Yesterday", dataCompleteness: 88, flagged: true },
  { id: "6", name: "Rachel Taylor", age: 34, riskScore: 0.35, riskTier: "Moderate", trend: "decreasing", lastActivity: "2 days ago", dataCompleteness: 72, flagged: false },
];

const getRiskTierColor = (tier: string) => {
  switch (tier) {
    case "Critical": return { bg: "bg-[hsl(var(--destructive))]/10", text: "text-[hsl(var(--destructive))]", border: "border-[hsl(var(--destructive))]/30" };
    case "High": return { bg: "bg-[hsl(var(--warning))]/10", text: "text-[hsl(var(--warning))]", border: "border-[hsl(var(--warning))]/30" };
    case "Moderate": return { bg: "bg-[hsl(38_90%_55%)]/10", text: "text-[hsl(38_90%_55%)]", border: "border-[hsl(38_90%_55%)]/30" };
    default: return { bg: "bg-[hsl(var(--success))]/10", text: "text-[hsl(var(--success))]", border: "border-[hsl(var(--success))]/30" };
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "increasing": return <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />;
    case "decreasing": return <TrendingDown className="h-3.5 w-3.5 text-[hsl(var(--success))]" />;
    default: return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const PatientPanelScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === "all" || patient.riskTier.toLowerCase() === filterTier.toLowerCase();
    return matchesSearch && matchesTier;
  });

  const riskTierCounts = {
    critical: mockPatients.filter(p => p.riskTier === "Critical").length,
    high: mockPatients.filter(p => p.riskTier === "High").length,
    moderate: mockPatients.filter(p => p.riskTier === "Moderate").length,
    low: mockPatients.filter(p => p.riskTier === "Low").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Clinical Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="gradient-clinical px-4 py-2">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground">
              <Stethoscope className="h-4 w-4" />
              <span className="text-sm font-display font-semibold">Clinician Portal</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <button 
                onClick={() => navigate("/clinician/login")}
                className="p-1.5 rounded-lg hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <img src={logo} alt="AI-MSHM" className="h-8 w-8" />
            <div>
              <p className="font-display font-bold text-foreground">Patient Panel</p>
              <p className="text-xs text-muted-foreground">Dr. Michael Smith, MD</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Risk Tier Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Critical", count: riskTierCounts.critical, color: "bg-[hsl(var(--destructive))]" },
              { label: "High", count: riskTierCounts.high, color: "bg-[hsl(var(--warning))]" },
              { label: "Moderate", count: riskTierCounts.moderate, color: "bg-[hsl(38_90%_55%)]" },
              { label: "Low", count: riskTierCounts.low, color: "bg-[hsl(var(--success))]" },
            ].map((tier, i) => (
              <motion.button
                key={tier.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setFilterTier(filterTier === tier.label.toLowerCase() ? "all" : tier.label.toLowerCase())}
                className={`p-3 rounded-xl border text-center transition-all ${
                  filterTier === tier.label.toLowerCase() 
                    ? "border-primary bg-primary/5" 
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${tier.color} mx-auto mb-2`} />
                <p className="text-lg font-bold font-display text-foreground">{tier.count}</p>
                <p className="text-[10px] text-muted-foreground">{tier.label}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Patient List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Consented Patients ({filteredPatients.length})
            </h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            {filteredPatients.map((patient, i) => {
              const tierColors = getRiskTierColor(patient.riskTier);
              return (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      patient.flagged ? tierColors.border + " border-l-4" : ""
                    }`}
                    onClick={() => navigate(`/clinician/patient/${patient.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback className={`${tierColors.bg} ${tierColors.text} font-display font-bold`}>
                            {patient.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-display font-bold text-foreground truncate">{patient.name}</p>
                            {patient.flagged && (
                              <AlertTriangle className={`h-4 w-4 ${tierColors.text} shrink-0`} />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{patient.age} years</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {patient.lastActivity}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-lg font-bold font-display text-foreground">
                              {patient.riskScore.toFixed(2)}
                            </span>
                            {getTrendIcon(patient.trend)}
                          </div>
                          <Badge className={`${tierColors.bg} ${tierColors.text} border-0 text-[10px]`}>
                            {patient.riskTier}
                          </Badge>
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>

                      {/* Data Completeness Bar */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Data Completeness</span>
                          <span className="font-semibold text-foreground">{patient.dataCompleteness}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full gradient-primary" 
                            style={{ width: `${patient.dataCompleteness}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* HIPAA Notice */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="bg-[hsl(var(--clinical-blue))]/5 border border-[hsl(var(--clinical-blue))]/20 rounded-xl p-4"
        >
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-[hsl(var(--clinical-blue))] shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are viewing Protected Health Information (PHI) of patients who have consented to share 
              their data with your practice. All access is logged and subject to HIPAA compliance review.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientPanelScreen;
