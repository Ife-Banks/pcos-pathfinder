import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Ruler,
  Scale,
  Activity,
  Watch,
  Settings,
  ChevronRight,
  Shield,
  Bell,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock user data
const userData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  age: 28,
  height: 165,
  weight: 62,
  bmi: 22.8,
  ethnicity: "White/Caucasian",
  joinDate: "January 2024",
  wearables: ["Apple Watch"],
};

const dataCompleteness = {
  overall: 78,
  categories: [
    { label: "Profile Info", percent: 100, color: "bg-[hsl(var(--success))]" },
    { label: "Clinical Data", percent: 65, color: "bg-primary" },
    { label: "Wearable Sync", percent: 82, color: "bg-[hsl(var(--clinical-blue))]" },
    { label: "Check-ins", percent: 64, color: "bg-[hsl(var(--warning))]" },
  ],
};

const CompletenessRing = ({ percent }: { percent: number }) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <motion.circle
          cx="40" cy="40" r="36"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-display text-foreground">{percent}%</span>
        <span className="text-[10px] text-muted-foreground">Complete</span>
      </div>
    </div>
  );
};

const MyProfileScreen = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { icon: Bell, label: "Notification Settings", route: "/settings/notifications" },
    { icon: Shield, label: "Data & Privacy", route: "/settings/privacy" },
    { icon: Smartphone, label: "Connected Devices", route: "/settings/devices" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-bold text-foreground flex-1">My Profile</h1>
        <button onClick={() => navigate("/settings/privacy")} className="p-1.5 rounded-lg hover:bg-secondary">
          <Settings className="w-5 h-5 text-primary" />
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src="" alt={userData.name} />
                  <AvatarFallback className="gradient-primary text-primary-foreground text-xl font-display font-bold">
                    {userData.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-foreground text-lg">{userData.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {userData.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Member since {userData.joinDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demographics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Demographics
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Calendar, label: "Age", value: `${userData.age} years` },
                  { icon: User, label: "Ethnicity", value: userData.ethnicity.split("/")[0] },
                  { icon: Ruler, label: "Height", value: `${userData.height} cm` },
                  { icon: Scale, label: "Weight", value: `${userData.weight} kg` },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-display font-semibold text-sm text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">BMI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-foreground">{userData.bmi}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] font-semibold">
                    Normal
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wearable Connections */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Wearable Connections
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg gradient-clinical flex items-center justify-center">
                  <Watch className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-foreground text-sm">{userData.wearables[0]}</p>
                  <p className="text-xs text-muted-foreground">Last synced 2 hours ago</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={() => navigate("/settings/devices")}
              >
                Manage Devices
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Completeness */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Data Completeness Overview
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-6">
                <CompletenessRing percent={dataCompleteness.overall} />
                <div className="flex-1 space-y-2.5">
                  {dataCompleteness.categories.map((cat, i) => (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{cat.label}</span>
                        <span className="text-xs font-semibold text-foreground">{cat.percent}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${cat.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percent}%` }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Settings
          </h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.route)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left"
                >
                  <link.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 font-display font-medium text-foreground text-sm">{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sign Out */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button 
            variant="outline" 
            className="w-full text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/20 hover:bg-[hsl(var(--destructive))]/5"
            onClick={() => navigate("/welcome")}
          >
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MyProfileScreen;
