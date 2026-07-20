import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, ChevronRight, Check, Clock, Moon } from "lucide-react";
import apiClient from "@/services/apiClient";
import { isToolCompleteToday, markToolCompleteToday } from "@/utils/weekUtils";

interface TodayStatus {
  phq4_completed?: boolean;
  sleep_completed?: boolean;
}

interface DailyTool {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  route: string;
  gradient: string;
  completed: boolean;
  frequency: string;
}

const TEAL_PRIMARY = '#00897B';

const DailyToolsScreen = () => {
  const navigate = useNavigate();
  const [todayStatus, setTodayStatus] = useState<TodayStatus>({});

  const loadDailyStatus = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const res = await apiClient.get('/mood/history');
      const logs: any[] = res?.data?.data?.logs ?? [];
      const todayLog = logs.find((l: any) =>
        typeof l.logDate === 'string' && l.logDate.startsWith(today)
      ) ?? null;

      const phq4Done = todayLog?.phq4Item1 != null;
      const sleepDone = todayLog?.sleepSatisfaction != null;

      if (phq4Done) markToolCompleteToday('phq4');
      if (sleepDone) markToolCompleteToday('sleep');

      setTodayStatus({
        phq4_completed: phq4Done || isToolCompleteToday('phq4'),
        sleep_completed: sleepDone || isToolCompleteToday('sleep'),
      });
    } catch (err) {
      console.warn('Mood history failed:', err);
      setTodayStatus({
        phq4_completed: isToolCompleteToday('phq4'),
        sleep_completed: isToolCompleteToday('sleep'),
      });
    }
  }, []);

  useEffect(() => {
    loadDailyStatus();
  }, [loadDailyStatus]);

  useEffect(() => {
    const handleFocus = () => loadDailyStatus();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadDailyStatus]);

  const getTools = (): DailyTool[] => [
    {
      id: "phq4",
      title: "Mental Wellness",
      subtitle: "How have you been feeling emotionally?",
      description: "Answer 4 quick questions about your mood and anxiety over the past week.",
      icon: Brain,
      route: "/weekly-tools/mental-wellness",
      gradient: "bg-emerald-500",
      completed: todayStatus.phq4_completed === true,
      frequency: "Daily",
    },
    {
      id: "sleep",
      title: "Sleep Quality",
      subtitle: "Best looged before bed or first thing after waking.",
      description: "Rate how rested you feel and how many hours you slept. For the most accurate read, log this in the evening before you turn in, or right after you wake up.",
      icon: Moon,
      route: "/weekly-tools/sleep-quality",
      gradient: "bg-blue-500",
      completed: todayStatus.sleep_completed === true,
      frequency: "Daily . nightly",
    },
  ];

  const dailyTools = getTools();
  const completedCount = dailyTools.filter((t) => t.completed).length;
  const allComplete = dailyTools.every((t) => t.completed);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: TEAL_PRIMARY }}>
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 text-white transition duration-200 ease-in-out rounded-full px-3 py-2 hover:bg-white hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xl font-bold font-[var(--font-display)]">
              Daily Tools
            </span>
          </button>
        </div>
        <p className="text-white/70 text-sm ml-8">Quick daily wellness check-ins</p>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-5 mb-6 border-2"
            style={{ backgroundColor: '#F0FFF4', borderColor: '#27AE60' }}
          >
            <h3 className="text-lg font-bold text-[#27AE60] mb-2">All daily check-ins complete!</h3>
            <p className="text-sm text-gray-600 mb-4">View your combined wellness analysis</p>
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
          {dailyTools.map((tool, idx) => (
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
                  className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${tool.gradient}`}
                >
                  <tool.icon className="h-6 w-6 text-white" />
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
            <span className="text-sm font-medium text-gray-700">Today's Progress</span>
            <span className="text-xs text-gray-500">
              {completedCount}/2 completed
            </span>
          </div>
          <div className="flex gap-2">
            {dailyTools.map((tool) => (
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

export default DailyToolsScreen;
