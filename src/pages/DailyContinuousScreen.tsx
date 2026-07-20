import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smile, Target, ChevronRight, Check, Clock, Timer } from "lucide-react";
import apiClient from "@/services/apiClient";
import { isToolCompleteToday, markToolCompleteToday, canLogNow, getTimeUntilNextLog, formatTimeRemaining, TOOL_FREQUENCIES, recordToolLog } from "@/utils/weekUtils";

interface TodayStatus {
  affect_completed?: boolean;
  focus_completed?: boolean;
}

interface ContinuousTool {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  route: string;
  gradient: string;
  completed: boolean;
  frequency: string;
  intervalHours: number;
  canLog: boolean;
  timeUntilNext: number;
}

const TEAL_PRIMARY = '#00897B';

const DailyContinuousScreen = () => {
  const navigate = useNavigate();
  const [todayStatus, setTodayStatus] = useState<TodayStatus>({});
  const [tick, setTick] = useState(0);

  const loadStatus = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const res = await apiClient.get('/mood/history');
      const logs: any[] = res?.data?.data?.logs ?? [];
      const todayLog = logs.find((l: any) =>
        typeof l.logDate === 'string' && l.logDate.startsWith(today)
      ) ?? null;

      const affectDone = todayLog?.affectValence != null;
      const focusDone = todayLog?.cognitiveLoadScore != null;

      if (affectDone) markToolCompleteToday('affect');
      if (focusDone) markToolCompleteToday('focus');

      setTodayStatus({
        affect_completed: affectDone || isToolCompleteToday('affect'),
        focus_completed: focusDone || isToolCompleteToday('focus'),
      });
    } catch (err) {
      console.warn('Mood history failed:', err);
      setTodayStatus({
        affect_completed: isToolCompleteToday('affect'),
        focus_completed: isToolCompleteToday('focus'),
      });
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const handleFocus = () => loadStatus();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadStatus]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const getTools = (): ContinuousTool[] => [
    {
      id: "affect",
      title: "Mood Check",
      subtitle: "How are you feeling right now?",
      description: "A quick pulse-check on your mood and energy. Log this every few hours - it unlocks again every hour - to build an accurate picture of your day.",
      icon: Smile,
      route: "/weekly-tools/mood-check",
      gradient: "bg-purple-500",
      completed: todayStatus.affect_completed === true,
      frequency: "Every hour",
      intervalHours: TOOL_FREQUENCIES.affect,
      canLog: canLogNow('affect', TOOL_FREQUENCIES.affect),
      timeUntilNext: getTimeUntilNextLog('affect', TOOL_FREQUENCIES.affect),
    },
    {
      id: "focus",
      title: "Focus & Memory",
      subtitle: "How sharp do you feel right now?",
      description: "Rate your concentration and memory in the moment. It unlocks again every 4 hours so we can track how your focus shifts across the day.",
      icon: Target,
      route: "/weekly-tools/focus-memory",
      gradient: "bg-orange-500",
      completed: todayStatus.focus_completed === true,
      frequency: "Every 4 hours",
      intervalHours: TOOL_FREQUENCIES.focus,
      canLog: canLogNow('focus', TOOL_FREQUENCIES.focus),
      timeUntilNext: getTimeUntilNextLog('focus', TOOL_FREQUENCIES.focus),
    },
  ];

  const tools = getTools();
  const completedCount = tools.filter((t) => t.completed).length;
  const allComplete = tools.every((t) => t.completed);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: '#4F46E5' }}>
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 text-white transition duration-200 ease-in-out rounded-full px-3 py-2 hover:bg-white hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xl font-bold font-[var(--font-display)]">
              Daily Continuous
            </span>
          </button>
        </div>
        <p className="text-white/70 text-sm ml-8">Hourly mood & cognitive tracking</p>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-5 mb-6 border-2"
            style={{ backgroundColor: '#F0FFF4', borderColor: '#27AE60' }}
          >
            <h3 className="text-lg font-bold text-[#27AE60] mb-2">All hourly check-ins complete!</h3>
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
          {tools.map((tool, idx) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate(tool.route)}
              className={`w-full rounded-2xl border bg-white p-5 text-left hover:shadow-md transition-all group ${
                tool.canLog ? 'border-gray-200' : 'border-gray-100 opacity-75'
              }`}
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
                    {tool.canLog ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Due
                      </span>
                    ) : tool.completed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        <Timer className="w-3 h-3" />
                        {formatTimeRemaining(tool.timeUntilNext)}
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
                    {!tool.canLog && tool.timeUntilNext > 0 && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Timer className="w-3 h-3" />
                        Next in {formatTimeRemaining(tool.timeUntilNext)}
                      </span>
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
            <span className="text-sm font-medium text-gray-700">Today's Progress</span>
            <span className="text-xs text-gray-500">
              {completedCount}/2 completed
            </span>
          </div>
          <div className="flex gap-2">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={`flex-1 h-2 rounded-full ${
                  tool.completed ? '' : 'bg-gray-200'
                }`}
                style={tool.completed ? { backgroundColor: '#4F46E5' } : {}}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyContinuousScreen;
