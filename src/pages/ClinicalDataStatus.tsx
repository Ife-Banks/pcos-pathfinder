import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  Brain,
  ArrowRight,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { settingsService } from "@/services/settingsService";
import { menstrualService } from "@/services/menstrualService";
import { checkinService } from "@/services/checkinService";

interface DataCategory {
  icon: React.ElementType;
  label: string;
  detail: string;
  complete: boolean;
  partial: boolean;
  route: string;
}

const ClinicalDataStatus = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    height_cm: number | null;
    weight_kg: number | null;
    bmi: number | null;
  } | null>(null);
  const [menstrualData, setMenstrualData] = useState<{
    cycle_count: number;
    has_data: boolean;
  } | null>(null);
  const [checkinData, setCheckinData] = useState<{
    streak_days: number;
    has_data: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, menstrualRes, checkinRes] = await Promise.allSettled([
          settingsService.getProfile(),
          menstrualService.getCycleHistory(),
          checkinService.getTodayStatus(),
        ]);

        if (profileRes.status === "fulfilled") {
          setProfileData({
            height_cm: profileRes.value.data.height_cm,
            weight_kg: profileRes.value.data.weight_kg,
            bmi: profileRes.value.data.bmi,
          });
        }

        if (menstrualRes.status === "fulfilled") {
          const history = menstrualRes.value.data;
          const cycles = history.cycles || [];
          setMenstrualData({
            cycle_count: cycles.length,
            has_data: cycles.length > 0,
          });
        } else {
          setMenstrualData({ cycle_count: 0, has_data: false });
        }

        if (checkinRes.status === "fulfilled") {
          setCheckinData({
            streak_days: checkinRes.value.data?.streak_days || 0,
            has_data: true,
          });
        } else {
          setCheckinData({ streak_days: 0, has_data: false });
        }
      } catch (err) {
        // API errors handled gracefully - show empty states
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hasBodyMetrics = profileData?.bmi != null;
  const hasMenstrualData = menstrualData?.has_data ?? false;
  const hasSymptomData = checkinData?.has_data ?? false;

  const dataCategories: DataCategory[] = [
    {
      icon: Activity,
      label: "Body Metrics",
      detail: hasBodyMetrics
        ? `BMI: ${profileData?.bmi?.toFixed(1)}, ${profileData?.weight_kg}kg`
        : "Not recorded",
      complete: hasBodyMetrics,
      partial: false,
      route: "/settings/profile",
    },
    {
      icon: Brain,
      label: "Symptom Tracking",
      detail: hasSymptomData
        ? `${checkinData?.streak_days || 0}-day streak`
        : "No data",
      complete: hasSymptomData && (checkinData?.streak_days ?? 0) >= 7,
      partial: hasSymptomData && (checkinData?.streak_days ?? 0) < 7,
      route: "/check-in/morning",
    },
    {
      icon: ClipboardList,
      label: "Menstrual History",
      detail: hasMenstrualData
        ? `${menstrualData?.cycle_count} cycles logged`
        : "No data",
      complete: hasMenstrualData && (menstrualData?.cycle_count ?? 0) >= 3,
      partial: hasMenstrualData && (menstrualData?.cycle_count ?? 0) < 3,
      route: "/cycle-history",
    },
  ];

  const overallComplete = dataCategories.filter((c) => c.complete).length;
  const overallPct = Math.round((overallComplete / dataCategories.length) * 100);

  const getCompletenessBadge = () => {
    if (overallPct === 100)
      return { label: "Complete", className: "bg-accent/10 text-accent border-0" };
    if (overallPct >= 50)
      return { label: "Partial", className: "bg-warning/10 text-warning border-0" };
    return { label: "Incomplete", className: "bg-destructive/10 text-destructive border-0" };
  };

  const badge = getCompletenessBadge();

  if (loading) {
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
        </header>
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

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

        {overallPct < 100 && (
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground text-center">
              Complete more daily check-ins and log menstrual cycles to improve your data completeness score.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalDataStatus;