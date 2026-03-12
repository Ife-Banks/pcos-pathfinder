import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarIcon, Droplets, Check } from "lucide-react";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type BleedingIntensity = "spotting" | "light" | "medium" | "heavy";

interface DayLog {
  date: Date;
  intensity: BleedingIntensity;
}

const intensityOptions: { value: BleedingIntensity; label: string; ordinal: number; drops: number; color: string }[] = [
  { value: "spotting", label: "Spotting", ordinal: 1, drops: 1, color: "text-pink-300" },
  { value: "light", label: "Light", ordinal: 2, drops: 2, color: "text-pink-400" },
  { value: "medium", label: "Medium", ordinal: 3, drops: 3, color: "text-pink-500" },
  { value: "heavy", label: "Heavy", ordinal: 4, drops: 4, color: "text-pink-600" },
];

const PeriodLogging = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [dailyLogs, setDailyLogs] = useState<DayLog[]>([]);
  const [step, setStep] = useState<"dates" | "intensity" | "review">("dates");

  const handleDatesContinue = () => {
    if (!startDate || !endDate) return;
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    setDailyLogs(days.map((d) => ({ date: d, intensity: "medium" })));
    setStep("intensity");
  };

  const updateIntensity = (date: Date, intensity: BleedingIntensity) => {
    setDailyLogs((prev) =>
      prev.map((log) => (isSameDay(log.date, date) ? { ...log, intensity } : log))
    );
  };

  const handleSave = () => {
    toast({ title: "Period logged", description: `${dailyLogs.length} days recorded successfully.` });
    navigate("/cycle-history");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-clinical px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/dashboard")} className="text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground font-[var(--font-display)]">Log Period</h1>
        </div>
        <p className="text-primary-foreground/70 text-sm ml-8">Track your menstrual cycle — Criterion 1: Ovulatory Dysfunction</p>
      </div>

      <div className="px-6 py-6 max-w-lg mx-auto">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-6">
          {["dates", "intensity", "review"].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                step === s ? "gradient-primary text-primary-foreground" : 
                  ["dates", "intensity", "review"].indexOf(step) > i ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {["dates", "intensity", "review"].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < 2 && <div className={cn("flex-1 h-0.5", ["dates", "intensity", "review"].indexOf(step) > i ? "bg-primary/30" : "bg-border")} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Date Selection */}
          {step === "dates" && (
            <motion.div key="dates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold text-foreground mb-1 font-[var(--font-display)]">Period Dates</h2>
              <p className="text-sm text-muted-foreground mb-6">Select when your period started and ended.</p>

              <div className="space-y-4">
                {/* Start Date */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">When did your last period begin?</label>
                  <p className="text-xs text-muted-foreground mb-2">Required field — date picker</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12", !startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(d) => { setStartDate(d); if (endDate && d && d > endDate) setEndDate(undefined); }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">When did your period stop?</label>
                  <p className="text-xs text-muted-foreground mb-2">Required field — date picker</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12", !endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button onClick={handleDatesContinue} disabled={!startDate || !endDate} className="w-full mt-6 h-12 gradient-primary text-primary-foreground rounded-xl">
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Daily Intensity */}
          {step === "intensity" && (
            <motion.div key="intensity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold text-foreground mb-1 font-[var(--font-display)]">How heavy was your flow today?</h2>
              <p className="text-sm text-muted-foreground mb-6">Segmented selector: Spotting | Light | Medium | Heavy. Encoded as ordinal 1–4.</p>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {dailyLogs.map((log) => (
                  <div key={log.date.toISOString()} className="rounded-xl border border-border bg-card p-4">
                    <div className="text-sm font-medium text-foreground mb-3">{format(log.date, "EEE, MMM d")}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {intensityOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateIntensity(log.date, opt.value)}
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-xs font-medium",
                            log.intensity === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          <div className="flex">
                            {Array.from({ length: opt.drops }).map((_, i) => (
                              <Droplets key={i} className={cn("w-3 h-3", log.intensity === opt.value ? "text-primary" : opt.color)} />
                            ))}
                          </div>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep("dates")} className="flex-1 h-12 rounded-xl">Back</Button>
                <Button onClick={() => setStep("review")} className="flex-1 h-12 gradient-primary text-primary-foreground rounded-xl">Review</Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === "review" && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold text-foreground mb-1 font-[var(--font-display)]">Review & Save</h2>
              <p className="text-sm text-muted-foreground mb-6">Confirm your period details before saving.</p>

              <div className="rounded-xl border border-border bg-card p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-semibold text-foreground">{dailyLogs.length} days</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Start</span>
                  <span className="text-sm font-semibold text-foreground">{startDate && format(startDate, "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">End</span>
                  <span className="text-sm font-semibold text-foreground">{endDate && format(endDate, "MMM d, yyyy")}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Daily Flow</h3>
                <div className="space-y-2">
                  {dailyLogs.map((log) => {
                    const opt = intensityOptions.find((o) => o.value === log.intensity)!;
                    return (
                      <div key={log.date.toISOString()} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{format(log.date, "EEE, MMM d")}</span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          {Array.from({ length: opt.drops }).map((_, i) => (
                            <Droplets key={i} className="w-3 h-3 text-primary" />
                          ))}
                          {opt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("intensity")} className="flex-1 h-12 rounded-xl">Back</Button>
                <Button onClick={handleSave} className="flex-1 h-12 gradient-primary text-primary-foreground rounded-xl">Save Period</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PeriodLogging;
