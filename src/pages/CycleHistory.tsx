import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Droplets, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BleedingIntensity = "spotting" | "light" | "medium" | "heavy";

interface PeriodEntry {
  startDate: Date;
  endDate: Date;
  days: { date: Date; intensity: BleedingIntensity }[];
}

// Mock historical data
const mockPeriods: PeriodEntry[] = [
  {
    startDate: new Date(2026, 2, 1),
    endDate: new Date(2026, 2, 5),
    days: [
      { date: new Date(2026, 2, 1), intensity: "light" },
      { date: new Date(2026, 2, 2), intensity: "medium" },
      { date: new Date(2026, 2, 3), intensity: "heavy" },
      { date: new Date(2026, 2, 4), intensity: "medium" },
      { date: new Date(2026, 2, 5), intensity: "spotting" },
    ],
  },
  {
    startDate: new Date(2026, 1, 1),
    endDate: new Date(2026, 1, 6),
    days: [
      { date: new Date(2026, 1, 1), intensity: "light" },
      { date: new Date(2026, 1, 2), intensity: "medium" },
      { date: new Date(2026, 1, 3), intensity: "heavy" },
      { date: new Date(2026, 1, 4), intensity: "heavy" },
      { date: new Date(2026, 1, 5), intensity: "medium" },
      { date: new Date(2026, 1, 6), intensity: "light" },
    ],
  },
  {
    startDate: new Date(2026, 0, 3),
    endDate: new Date(2026, 0, 7),
    days: [
      { date: new Date(2026, 0, 3), intensity: "light" },
      { date: new Date(2026, 0, 4), intensity: "medium" },
      { date: new Date(2026, 0, 5), intensity: "heavy" },
      { date: new Date(2026, 0, 6), intensity: "medium" },
      { date: new Date(2026, 0, 7), intensity: "spotting" },
    ],
  },
];

const intensityColors: Record<BleedingIntensity, string> = {
  spotting: "bg-pink-200",
  light: "bg-pink-300",
  medium: "bg-pink-400",
  heavy: "bg-pink-500",
};

const intensityLabels: Record<BleedingIntensity, string> = {
  spotting: "Spotting",
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CycleHistory = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getDayPeriodInfo = (date: Date) => {
    for (const period of mockPeriods) {
      const dayLog = period.days.find((d) => isSameDay(d.date, date));
      if (dayLog) return { intensity: dayLog.intensity, period };
    }
    return null;
  };

  const selectedDayInfo = selectedDay ? getDayPeriodInfo(selectedDay) : null;

  // Cycle stats
  const avgCycleLength = useMemo(() => {
    if (mockPeriods.length < 2) return null;
    const sorted = [...mockPeriods].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    let total = 0;
    for (let i = 1; i < sorted.length; i++) {
      total += differenceInDays(sorted[i].startDate, sorted[i - 1].startDate);
    }
    return Math.round(total / (sorted.length - 1));
  }, []);

  const avgPeriodLength = useMemo(() => {
    const total = mockPeriods.reduce((acc, p) => acc + p.days.length, 0);
    return Math.round(total / mockPeriods.length);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-clinical px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-primary-foreground/80 hover:text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-primary-foreground font-[var(--font-display)]">Cycle History</h1>
          </div>
          <Button size="sm" variant="secondary" className="rounded-full gap-1" onClick={() => navigate("/period-logging")}>
            <Plus className="w-4 h-4" /> Log Period
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {/* Cycle Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-2xl font-bold text-foreground font-[var(--font-display)]">{mockPeriods.length}</div>
            <div className="text-xs text-muted-foreground">Cycles Logged</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-2xl font-bold text-foreground font-[var(--font-display)]">{avgCycleLength ?? "—"}</div>
            <div className="text-xs text-muted-foreground">Avg. Cycle (days)</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-2xl font-bold text-foreground font-[var(--font-display)]">{avgPeriodLength}</div>
            <div className="text-xs text-muted-foreground">Avg. Period (days)</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-foreground font-[var(--font-display)]">{format(currentMonth, "MMMM yyyy")}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const info = getDayPeriodInfo(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative aspect-square flex items-center justify-center rounded-lg text-sm transition-all",
                    !isCurrentMonth && "opacity-30",
                    isSelected && "ring-2 ring-primary",
                    isToday && !info && "font-bold text-primary",
                    !info && isCurrentMonth && "hover:bg-muted text-foreground",
                  )}
                >
                  {info && (
                    <div className={cn("absolute inset-0.5 rounded-md", intensityColors[info.intensity], "opacity-60")} />
                  )}
                  <span className={cn("relative z-10", info && "font-semibold text-foreground")}>{format(day, "d")}</span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
            {(["spotting", "light", "medium", "heavy"] as BleedingIntensity[]).map((int) => (
              <div key={int} className="flex items-center gap-1">
                <div className={cn("w-3 h-3 rounded-sm", intensityColors[int])} />
                <span className="text-xs text-muted-foreground">{intensityLabels[int]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Detail */}
        {selectedDay && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2 font-[var(--font-display)]">{format(selectedDay, "EEEE, MMMM d")}</h3>
            {selectedDayInfo ? (
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-sm", intensityColors[selectedDayInfo.intensity])} />
                <span className="text-sm text-foreground font-medium">{intensityLabels[selectedDayInfo.intensity]} flow</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  Day {selectedDayInfo.period.days.findIndex((d) => isSameDay(d.date, selectedDay)) + 1} of {selectedDayInfo.period.days.length}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No period logged for this day.</p>
            )}
          </motion.div>
        )}

        {/* Recent Periods List */}
        <h3 className="text-base font-semibold text-foreground mb-3 font-[var(--font-display)]">Recent Periods</h3>
        <div className="space-y-3">
          {mockPeriods.map((period, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
                  {format(period.startDate, "MMM d")} – {format(period.endDate, "MMM d, yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">{period.days.length} days</span>
              </div>
              <div className="flex gap-1">
                {period.days.map((d, i) => (
                  <div key={i} className={cn("h-2 flex-1 rounded-full", intensityColors[d.intensity])} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CycleHistory;
