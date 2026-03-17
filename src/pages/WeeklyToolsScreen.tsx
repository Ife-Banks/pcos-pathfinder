import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scissors, Brain, ChevronRight, Check, Clock } from "lucide-react";

interface WeeklyTool {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  route: string;
  gradient: string;
  completed: boolean;
  lastCompleted?: string;
  frequency: string;
}

const WeeklyToolsScreen = () => {
  const navigate = useNavigate();

  // Mock completion status - in real app this would come from state/API
  const weeklyTools: WeeklyTool[] = [
    {
      id: "mfg",
      title: "Hirsutism Score",
      subtitle: "Modified Ferriman-Gallwey (mFG)",
      description: "Quantify hair growth patterns across 8 body zones to assess hyperandrogenism.",
      icon: Scissors,
      route: "/hirsutism",
      gradient: "gradient-clinical",
      completed: false,
      lastCompleted: "7 days ago",
      frequency: "Weekly",
    },
    {
      id: "phq4",
      title: "Mental Wellness",
      subtitle: "PHQ-4 Assessment",
      description: "Ultra-brief validated screening for anxiety (GAD-2) and depression (PHQ-2).",
      icon: Brain,
      route: "/phq4",
      gradient: "gradient-primary",
      completed: false,
      lastCompleted: "7 days ago",
      frequency: "Weekly",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary-foreground/80 hover:text-primary-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground font-[var(--font-display)]">
            Weekly Tools
          </h1>
        </div>
        <p className="text-primary-foreground/70 text-sm ml-8">
          Clinical assessments due this week
        </p>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-[hsl(var(--info-light))] border border-[hsl(var(--info))]/20 p-4 mb-6"
        >
          <p className="text-sm text-foreground font-medium mb-1">Weekly Clinical Assessments</p>
          <p className="text-xs text-foreground/70">
            Complete both assessments once per week to track your symptoms over time.
            Your responses help build a longitudinal picture for accurate PCOS risk scoring.
          </p>
        </motion.div>

        {/* Tool Cards */}
        <div className="space-y-4">
          {weeklyTools.map((tool, idx) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate(tool.route)}
              className="w-full rounded-2xl border border-border bg-card p-5 text-left hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-12 w-12 rounded-xl ${tool.gradient} flex items-center justify-center shrink-0`}
                >
                  <tool.icon className="h-6 w-6 text-primary-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-foreground font-[var(--font-display)]">
                      {tool.title}
                    </h3>
                    {tool.completed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--success-light))] text-[hsl(var(--success))] text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--warning-light))] text-[hsl(var(--warning))] text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Due
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{tool.subtitle}</p>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tool.frequency}
                    </span>
                    {tool.lastCompleted && (
                      <span>Last: {tool.lastCompleted}</span>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Completion Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">This Week's Progress</span>
            <span className="text-xs text-muted-foreground">
              {weeklyTools.filter((t) => t.completed).length}/{weeklyTools.length} completed
            </span>
          </div>
          <div className="flex gap-2">
            {weeklyTools.map((tool) => (
              <div
                key={tool.id}
                className={`flex-1 h-2 rounded-full ${
                  tool.completed ? "gradient-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WeeklyToolsScreen;
