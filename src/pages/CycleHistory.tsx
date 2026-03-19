import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { menstrualService, HistoryResponse, Cycle, CycleAggregates, CriterionFlags } from "@/services/menstrualService";

const PRIMARY_PURPLE = '#4A3F8F';

const bleedingScoreColors: Record<number, string> = {
  1: '#FADADD', // Spotting
  2: '#F4A7B9', // Light
  3: '#E91E8C', // Medium
  4: '#C2185B', // Heavy
};

const bleedingScoreLabels: Record<number, string> = {
  1: 'Spotting',
  2: 'Light',
  3: 'Medium',
  4: 'Heavy',
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CycleHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HistoryResponse['data'] | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await menstrualService.getCycleHistory();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      console.error('Error fetching cycle history:', err);
      setError(err.message || 'Failed to load cycle history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getDayBleedingScore = (date: Date): { score: number; cycle: Cycle } | null => {
    if (!data?.cycles) return null;
    
    for (const cycle of data.cycles) {
      const startDate = new Date(cycle.periodStartDate);
      const endDate = new Date(cycle.periodEndDate);
      
      if (date >= startDate && date <= endDate) {
        const dayIndex = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const score = cycle.bleedingScores[dayIndex];
        if (score) {
          return { score, cycle };
        }
      }
    }
    return null;
  };

  const hasUnusualBleeding = (cycle: Cycle): boolean => {
    return cycle.unusualBleeding;
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`;
  };

  const formatLoggedAt = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
  };

  const renderStatsBar = () => {
    if (!data) return null;
    
    const clvColor = data.aggregates.CLV > 7 ? '#E74C3C' : '#27AE60';
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
          <div className="text-2xl font-bold text-gray-900 font-[var(--font-display)]">{data.total}</div>
          <div className="text-xs text-gray-500">Cycles Logged</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
          <div className="text-2xl font-bold text-gray-900 font-[var(--font-display)]">
            {data.aggregates.n_cycles < 2 ? '—' : data.aggregates.mean_cycle_len.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Avg. Cycle Length</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
          <div className="text-2xl font-bold text-gray-900 font-[var(--font-display)]">{data.aggregates.mean_menses_len.toFixed(1)}</div>
          <div className="text-xs text-gray-500">Avg. Period Length</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center relative group cursor-help">
          <div className="text-2xl font-bold font-[var(--font-display)]" style={{ color: clvColor }}>{data.aggregates.CLV.toFixed(1)}</div>
          <div className="text-xs text-gray-500">Cycle Variability (CLV)</div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            Cycle Length Variability. Values above 7 days may indicate irregular ovulation.
          </div>
        </div>
      </div>
    );
  };

  const renderCriterionBanner = () => {
    if (!data?.criterion_flags) return null;
    
    const flags = data.criterion_flags;
    const isPositive = flags.criterion_1_positive === 1;
    
    const getPillBadge = (condition: string, triggered: boolean) => {
      if (!triggered) return null;
      
      const labels: Record<string, string> = {
        'oligomenorrhea': 'Oligomenorrhea (cycle >35 days)',
        'amenorrhea_risk': 'Amenorrhea Risk (<8 periods/year)',
        'irregular_cycle_pattern': 'Irregular Pattern (CLV >7 days)',
      };
      
      return (
        <span
          key={condition}
          className="inline-block px-3 py-1 text-sm rounded-full bg-amber-100 text-amber-800"
        >
          {labels[condition] || condition}
        </span>
      );
    };

    return (
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          borderLeft: `4px solid ${isPositive ? '#E67E22' : '#27AE60'}`,
          backgroundColor: isPositive ? '#FFFBF0' : '#F0FFF4',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{isPositive ? '⚠️' : '✅'}</span>
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: isPositive ? '#E67E22' : '#27AE60' }}
            >
              {isPositive ? 'Cycle Pattern Detected — Rotterdam Criterion 1' : 'No Cycle Irregularity Detected'}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{flags.summary}</p>
            
            {isPositive && (
              <div className="flex flex-wrap gap-2 mt-3">
                {flags.criteria.map((c) => getPillBadge(c.condition, c.triggered))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 font-[var(--font-display)]">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayInfo = getDayBleedingScore(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative aspect-square flex items-center justify-center rounded-lg text-sm",
                  !isCurrentMonth && "opacity-30",
                  isCurrentMonth && !dayInfo && "hover:bg-gray-50 text-gray-700"
                )}
              >
                {dayInfo && (
                  <div
                    className="absolute inset-0.5 rounded-md"
                    style={{ backgroundColor: bleedingScoreColors[dayInfo.score] }}
                  />
                )}
                <span className={cn("relative z-10 font-medium", dayInfo ? 'text-white' : 'text-gray-900')}>
                  {format(day, 'd')}
                </span>
                {isToday && (
                  <div
                    className="absolute inset-0 rounded-lg border-2"
                    style={{ borderColor: PRIMARY_PURPLE }}
                  />
                )}
                {dayInfo && dayInfo.cycle.unusualBleeding && isSameDay(day, new Date(dayInfo.cycle.periodEndDate)) && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-100">
          {[1, 2, 3, 4].map((score) => (
            <div key={score} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: bleedingScoreColors[score] }}
              />
              <span className="text-xs text-gray-500">{bleedingScoreLabels[score]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecentPeriods = () => {
    if (!data?.cycles || data.cycles.length === 0) return null;
    
    const sortedCycles = [...data.cycles].sort(
      (a, b) => new Date(b.periodStartDate).getTime() - new Date(a.periodStartDate).getTime()
    );

    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3 font-[var(--font-display)]">Recent Periods</h3>
        <div className="space-y-3">
          {sortedCycles.map((cycle) => {
            const isExpanded = expandedCycle === cycle.id;
            
            return (
              <motion.div
                key={cycle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-200 bg-white p-4 cursor-pointer"
                onClick={() => setExpandedCycle(isExpanded ? null : cycle.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDateRange(cycle.periodStartDate, cycle.periodEndDate)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {cycle.mensesLength} days • Cycle {cycle.cycleNumber}
                  </span>
                </div>
                
                <div className="flex gap-1 mb-2">
                  {cycle.bleedingScores.map((score, i) => (
                    <div
                      key={i}
                      className="h-2 flex-1 rounded-full"
                      style={{ backgroundColor: bleedingScoreColors[score] }}
                    />
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {cycle.hasOvulationPeak && (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Ovulation Detected
                    </span>
                  )}
                  {cycle.unusualBleeding && (
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                      Unusual Bleeding
                    </span>
                  )}
                  {cycle.cycleLength !== null && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      Cycle: {cycle.cycleLength} days
                    </span>
                  )}
                  {cycle.cycleLength === null && cycle.cycleNumber === 1 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      First Cycle
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Period Duration:</span>
                          <span className="ml-2 text-gray-900 font-medium">{cycle.mensesLength} days</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Menses Score:</span>
                          <span className="ml-2 text-gray-900 font-medium">{cycle.totalMensesScore}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg. Cycle Length:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {data.aggregates.n_cycles < 2 ? '—' : data.aggregates.mean_cycle_len.toFixed(1) + ' days'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">CLV:</span>
                          <span className="ml-2 text-gray-900 font-medium">{data.aggregates.CLV.toFixed(1)} days</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Ovulation Peak:</span>
                          <span className="ml-2 text-gray-900 font-medium">{cycle.hasOvulationPeak ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Unusual Bleeding:</span>
                          <span className="ml-2 text-gray-900 font-medium">{cycle.unusualBleeding ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Logged on:</span>
                          <span className="ml-2 text-gray-900 font-medium">{formatLoggedAt(cycle.loggedAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">📅</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No cycles logged yet</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Log your first period to start tracking your cycle health
      </p>
      <Button
        onClick={() => navigate('/period-logging')}
        className="rounded-full"
        style={{ backgroundColor: PRIMARY_PURPLE }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Log Period
      </Button>
    </div>
  );

  const renderLoadingState = () => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-3 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
          </div>
        ))}
      </div>
      
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
        <div className="grid grid-cols-7 gap-1 mb-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded" />
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-2 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Could not load cycle history</h3>
      <p className="text-sm text-gray-500 mb-6">{error}</p>
      <Button
        onClick={fetchHistory}
        variant="outline"
      >
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: PRIMARY_PURPLE }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-white/80 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white font-[var(--font-display)]">Cycle History</h1>
          </div>
          <Button size="sm" variant="secondary" className="rounded-full gap-1" onClick={() => navigate("/period-logging")}>
            <Plus className="w-4 h-4" /> Log Period
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {loading && renderLoadingState()}
        
        {!loading && error && renderErrorState()}
        
        {!loading && !error && data && (
          <>
            {data.total === 0 ? (
              renderEmptyState()
            ) : (
              <>
                {renderStatsBar()}
                {renderCriterionBanner()}
                {renderCalendar()}
                {renderRecentPeriods()}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CycleHistory;