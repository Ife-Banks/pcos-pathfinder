import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sun, Moon, Activity, TrendingUp, Calendar, AlertCircle,
  ChevronRight, Bell, User, Heart, BarChart3, ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

// Mock data
const mockRiskScore = 0.42;
const mockDataCompleteness = 72;
const mockStreak = 5;

const getRiskTier = (score: number) => {
  if (score < 0.25) return { label: "Low", color: "hsl(155 60% 42%)", bg: "bg-success-light" };
  if (score < 0.5) return { label: "Moderate", color: "hsl(38 90% 55%)", bg: "bg-warning-light" };
  if (score < 0.75) return { label: "High", color: "hsl(20 75% 50%)", bg: "bg-destructive/10" };
  return { label: "Critical", color: "hsl(0 72% 55%)", bg: "bg-destructive/10" };
};

const RiskGauge = ({ score }: { score: number }) => {
  const tier = getRiskTier(score);
  const angle = score * 180; // 0-180 degrees

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-28 overflow-hidden">
        {/* Arc background */}
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(155 60% 42%)" />
              <stop offset="33%" stopColor="hsl(50 70% 50%)" />
              <stop offset="66%" stopColor="hsl(30 80% 50%)" />
              <stop offset="100%" stopColor="hsl(0 72% 55%)" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(200 18% 90%)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: score }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
          {/* Needle */}
          <motion.line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="hsl(210 25% 12%)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ transformOrigin: "100px 100px" }}
            initial={{ rotate: -90 }}
            animate={{ rotate: angle - 90 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
          <circle cx="100" cy="100" r="4" fill="hsl(210 25% 12%)" />
        </svg>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center -mt-2"
      >
        <span className="text-3xl font-bold font-display" style={{ color: tier.color }}>
          {score.toFixed(2)}
        </span>
        <p className="text-xs text-muted-foreground mt-1">
          Risk Tier: <span className="font-semibold" style={{ color: tier.color }}>{tier.label}</span>
        </p>
      </motion.div>
    </div>
  );
};

const CompletenessRing = ({ percent }: { percent: number }) => {
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(200 18% 90%)" strokeWidth="4" />
        <motion.circle
          cx="24" cy="24" r="20"
          fill="none"
          stroke="hsl(190 65% 38%)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-display text-foreground">
        {percent}%
      </span>
    </div>
  );
};

const DashboardScreen = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const isMorning = new Date().getHours() < 14;

  const quickActions = [
    {
      icon: isMorning ? Sun : Moon,
      title: isMorning ? "Morning Check-In" : "Evening Check-In",
      subtitle: isMorning ? "Log fatigue & pressure" : "Log soreness & acne",
      route: isMorning ? "/check-in/morning" : "/check-in/evening",
      gradient: "gradient-primary",
      urgent: true,
    },
    {
      icon: Calendar,
      title: "Period Tracking",
      subtitle: "Log your cycle",
      route: "/dashboard",
      gradient: "gradient-clinical",
      urgent: false,
    },
    {
      icon: ClipboardCheck,
      title: "Weekly Tools",
      subtitle: "mFG & PHQ-4 due",
      route: "/dashboard",
      gradient: "gradient-primary",
      urgent: false,
    },
    {
      icon: BarChart3,
      title: "Risk Trends",
      subtitle: "View your history",
      route: "/dashboard",
      gradient: "gradient-clinical",
      urgent: false,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI-MSHM" className="h-8 w-8" />
            <div>
              <p className="text-sm text-muted-foreground">{greeting}</p>
              <p className="font-display font-bold text-foreground">Sarah</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center"
            >
              <User className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 px-6 py-6 max-w-md mx-auto w-full space-y-6">
        {/* Risk Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-foreground">PCOS Risk Score</h2>
            <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              Updated today
            </span>
          </div>
          <RiskGauge score={mockRiskScore} />
        </motion.div>

        {/* Data Completeness + Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <CompletenessRing percent={mockDataCompleteness} />
            <div>
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="font-display font-bold text-foreground text-sm">Completeness</p>
              <p className="text-xs text-muted-foreground mt-0.5">3 missing inputs</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Check-in Streak</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-display text-foreground">{mockStreak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div
                  key={d}
                  className={`h-1.5 flex-1 rounded-full ${
                    d <= mockStreak ? "gradient-primary" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-display font-bold text-foreground mb-3">Quick Actions</h3>
          <div className="space-y-2.5">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                onClick={() => navigate(action.route)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all group text-left"
              >
                <div className={`h-11 w-11 rounded-xl ${action.gradient} flex items-center justify-center shrink-0`}>
                  <action.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-foreground text-sm">{action.title}</p>
                    {action.urgent && (
                      <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Today's Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border border-border p-5"
        >
          <h3 className="font-display font-bold text-foreground mb-3">Today's Summary</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "HRV", value: "42ms", icon: Heart, color: "text-primary" },
              { label: "Fatigue", value: "—", icon: TrendingUp, color: "text-muted-foreground" },
              { label: "Mood", value: "—", icon: Sun, color: "text-muted-foreground" },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-secondary/50">
                <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
                <p className="text-lg font-bold font-display text-foreground">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
          {/* Pending actions hint */}
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-warning-light">
            <AlertCircle className="h-4 w-4 text-warning shrink-0" />
            <p className="text-xs text-foreground">
              Complete your {isMorning ? "morning" : "evening"} check-in to update today's data.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Nav */}
      <nav className="sticky bottom-0 bg-card/90 backdrop-blur-lg border-t border-border px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          {[
            { icon: Activity, label: "Home", route: "/dashboard", active: true },
            { icon: Calendar, label: "Cycle", route: "/cycle-history", active: false },
            { icon: BarChart3, label: "Results", route: "/risk-score", active: false },
            { icon: User, label: "Profile", route: "/profile", active: false },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-display font-semibold">{item.label}</span>
              {item.active && <div className="h-0.5 w-4 rounded-full gradient-primary" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DashboardScreen;
