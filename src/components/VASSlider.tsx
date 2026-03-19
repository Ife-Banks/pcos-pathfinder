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
  step?: number;
  lowLabel?: string;
  highLabel?: string;
}

const getColorForValue = (value: number, min: number, max: number): string => {
  const percentage = ((value - min) / (max - min)) * 100;
  if (percentage <= 30) return '#27AE60';  // Green
  if (percentage <= 60) return '#F59E0B';  // Amber
  if (percentage <= 80) return '#E67E22';  // Orange
  return '#E74C3C';  // Red
};

const VASSlider = ({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  lowLabel = "None",
  highLabel = "Severe",
}: VASSliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const currentColor = getColorForValue(value, min, max);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (step < 1) {
      onChange(Math.round(newValue * 10) / 10);
    } else {
      onChange(Math.round(newValue));
    }
  };

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
            {step < 1 ? value.toFixed(1) : value}
          </span>
          <span className="text-xs text-muted-foreground">/{max}</span>
        </motion.div>
      </div>

      <div className="relative pt-1 pb-2">
        {/* Track background */}
        <div className="h-3 rounded-full bg-gray-200 overflow-hidden relative">
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
          step={step}
          value={value}
          onChange={handleChange}
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
            className="h-5 w-5 -mt-1 rounded-full border-2 bg-white shadow-md"
            style={{ borderColor: currentColor }}
          />
        </motion.div>
      </div>

      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">{lowLabel}</span>
        <span className="text-xs text-muted-foreground">{highLabel}</span>
      </div>
    </div>
  );
};

export default VASSlider;
