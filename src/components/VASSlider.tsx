import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VASSliderProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  colorStops?: string[];
}

const defaultColorStops = [
  "hsl(155 60% 42%)",  // 0 - green/success
  "hsl(155 60% 42%)",  // 1
  "hsl(80 50% 45%)",   // 2
  "hsl(50 70% 50%)",   // 3
  "hsl(38 90% 55%)",   // 4 - warning
  "hsl(30 80% 50%)",   // 5
  "hsl(20 75% 50%)",   // 6
  "hsl(10 70% 50%)",   // 7
  "hsl(0 72% 55%)",    // 8 - destructive
  "hsl(0 72% 50%)",    // 9
  "hsl(0 80% 45%)",    // 10
];

const VASSlider = ({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 10,
  lowLabel = "None",
  highLabel = "Severe",
}: VASSliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const currentColor = defaultColorStops[Math.round(value)] || defaultColorStops[0];

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display font-semibold text-foreground">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <motion.div
          key={value}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="min-w-[3rem] text-right"
        >
          <span
            className="text-2xl font-bold font-display"
            style={{ color: currentColor }}
          >
            {value}
          </span>
          <span className="text-xs text-muted-foreground">/{max}</span>
        </motion.div>
      </div>

      <div className="relative pt-1 pb-2">
        {/* Track background */}
        <div className="h-3 rounded-full bg-secondary overflow-hidden relative">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: currentColor }}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Native range input overlay */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ top: "4px" }}
        />

        {/* Thumb indicator */}
        <motion.div
          className="absolute top-1 h-3 w-3 -ml-1.5"
          style={{ left: `${percentage}%` }}
          initial={false}
          animate={{ left: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div
            className="h-5 w-5 -mt-1 rounded-full border-2 bg-card shadow-md"
            style={{ borderColor: currentColor }}
          />
        </motion.div>

        {/* Tick marks */}
        <div className="flex justify-between px-0.5 mt-2">
          {Array.from({ length: max - min + 1 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 w-1 rounded-full",
                i <= value ? "bg-muted-foreground/40" : "bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">{lowLabel}</span>
        <span className="text-xs text-muted-foreground">{highLabel}</span>
      </div>
    </div>
  );
};

export default VASSlider;
