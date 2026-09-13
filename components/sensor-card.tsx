"use client";

import { motion } from "motion/react";

interface SensorCardProps {
  label: string;
  value: string | number;
  unit: string;
  className?: string; // For additional grid span/colors
  status?: "optimal" | "warning" | "critical";
  onClick: () => void;
}

export function SensorCard({ label, value, unit, status = "optimal", onClick, className = "" }: SensorCardProps) {
  const statusColors = {
    optimal: "border-white/10 bg-[#15151A] hover:border-cyan-500/30",
    warning: "border-yellow-500/30 bg-[#15151A] hover:border-yellow-500/50",
    critical: "border-red-500/30 bg-[#15151A] hover:border-red-500/50",
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-xl border p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] ${statusColors[status]} ${className}`}
    >
      <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2 truncate">
        {label}
      </div>
      <div className="font-mono text-xl text-white font-medium">
        {value} <span className="text-xs opacity-50">{unit}</span>
      </div>
    </div>
  );
}
