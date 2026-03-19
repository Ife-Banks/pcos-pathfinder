import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scissors, Brain, ChevronRight, Check, Clock, Moon, Activity } from "lucide-react";
import { isToolCompleteThisWeek, areAllToolsComplete, getToolCompletionInfo } from "@/utils/weekUtils";

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

const TEAL_PRIMARY = '#00897B';

const WeeklyToolsScreen = () => {
  const navigate = useNavigate();

  const getTools = (): WeeklyTool[] => {
    const phq4Info = getToolCompletionInfo('phq4');
    const affectInfo = getToolCompletionInfo('affect');
    const focusInfo = getToolCompletionInfo('focus');
    const sleepInfo = getToolCompletionInfo('sleep');
    
    return [
      {
        id: "mfg",
        title: "Hirsutism Score",
        subtitle: "Modified Ferriman-Gallwey (mFG)",
        description: "Quantify hair growth patterns across 8 body zones to assess hyperandrogenism.",
        icon: Scissors,
        route: "/hirsutism",
        gradient: "gradient-clinical",
        completed: false,
        frequency: "Weekly",
      },
      {
        id: "phq4",
        title: "Mental Wellness",
        subtitle: "PHQ-4 Assessment",
        description: "Ultra-brief validated screening for anxiety (GAD-2) and depression (PHQ-2).",
        icon: Brain,
        route: "/weekly-tools/mental-wellness",
        gradient: "bg-emerald-500",
        completed: phq4Info.completed,
        lastCompleted: phq4Info.lastCompleted,
        frequency: "Weekly",
      },
      {
        id: "affect",
        title: "Mood Check",
        subtitle: "Affect Grid",
        description: "Track your mood state using the valence-arousal affect grid model.",
        icon: Activity,
        route: "/weekly-tools/mood-check",
        gradient: "bg-purple-500",
        completed: affectInfo.completed,
        lastCompleted: affectInfo.lastCompleted,
        frequency: "Weekly",
      },
      {
        id: "focus",
        title: "Focus & Memory",
        subtitle: "Cognitive Assessment",
        description: "Measure your focus, memory, and mental fatigue levels.",
        icon: Brain,
        route: "/weekly-tools/focus-memory",
        gradient: "bg-orange-500",
        completed: focusInfo.completed,
        lastCompleted: focusInfo.lastCompleted,
        frequency: "Weekly",
      },
      {
        id: "sleep",
        title: "Sleep Quality",
        subtitle: "Sleep Tracker",
        description: "Log your sleep quality and hours for hormonal health tracking.",
        icon: Moon,
        route: "/weekly-tools/sleep-quality",
        gradient: "bg-blue-500",
        completed: sleepInfo.completed,
        lastCompleted: sleepInfo.lastCompleted,
        frequency: "Weekly",
      },
    ];
  };

  const weeklyTools = getTools();
  const completedCount = weeklyTools.filter((t) => t.completed).length;
  const allComplete = areAllToolsComplete();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate("/dashboard")} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Weekly Tools</h1>
        </div>
        <p className="text-white/70 text-sm ml-8">Clinical assessments due this week</p>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-5 mb-6 border-2"
            style={{ backgroundColor: '#F0FFF4', borderColor: '#27AE60' }}
          >
            <h3 className="text-lg font-bold text-[#27AE60] mb-2">All weekly check-ins complete! 🎉</h3>
            <p className="text-sm text-gray-600 mb-4">View your combined mood & cognitive risk analysis</p>
            <button
              onClick={() => navigate('/weekly-tools/results')}
              className="w-full py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: '#27AE60' }}
            >
              View Combined Results
            </button>
          </motion.div>
        )}

        <div className="space-y-4">
          {weeklyTools.map((tool, idx) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate(tool.route)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: tool.gradient.replace('bg-', '').includes('gradient') ? undefined : tool.gradient }}
                >
                  {tool.gradient === 'gradient-clinical' ? (
                    <div className="h-12 w-12 rounded-xl gradient-clinical flex items-center justify-center">
                      <Scissors className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <tool.icon className="h-6 w-6 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900 font-[var(--font-display)]">
                      {tool.title}
                    </h3>
                    {tool.completed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Due
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-2">{tool.subtitle}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tool.frequency}
                    </span>
                    {tool.completed && tool.lastCompleted && (
                      <span>Completed today</span>
                    )}
                    {!tool.completed && tool.lastCompleted && (
                      <span>Not done this week</span>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0 mt-1" />
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">This Week's Progress</span>
            <span className="text-xs text-gray-500">
              {completedCount}/5 completed
            </span>
          </div>
          <div className="flex gap-2">
            {weeklyTools.map((tool) => (
              <div
                key={tool.id}
                className={`flex-1 h-2 rounded-full ${
                  tool.completed ? '' : 'bg-gray-200'
                }`}
                style={tool.completed ? { backgroundColor: TEAL_PRIMARY } : {}}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WeeklyToolsScreen;