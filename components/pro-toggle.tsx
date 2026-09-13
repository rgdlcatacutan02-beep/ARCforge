"use client";

import { motion } from "motion/react";

export function ProToggle({ 
  value, 
  onChange, 
  colorClass = "cyan" 
}: { 
  value: boolean; 
  onChange: () => void;
  colorClass?: "cyan" | "blue" | "orange" | "green";
}) {
  const bgColors = {
    cyan: "bg-cyan-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
  };
  
  const ringColors = {
    cyan: "ring-cyan-500/50",
    blue: "ring-blue-500/50",
    orange: "ring-orange-500/50",
    green: "ring-green-500/50",
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#15151A] ${ringColors[colorClass]} ${
        value ? bgColors[colorClass] : 'bg-[#0A0A0B] border border-white/10'
      }`}
      style={{
        boxShadow: value ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.5)'
      }}
      type="button"
      role="switch"
      aria-checked={value}
    >
      <motion.div 
        layout
        initial={false}
        animate={{
          x: value ? 20 : 2,
        }}
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`absolute top-[2px] w-5 h-5 rounded-full flex items-center justify-center bg-white shadow-[0_2px_4px_rgba(0,0,0,0.3),_inset_0_-2px_4px_rgba(0,0,0,0.05)] border border-black/5`}
      >
        <motion.div
           initial={false}
           animate={{ scale: value ? 1 : 0, opacity: value ? 1 : 0 }}
           className={`w-1.5 h-1.5 rounded-full ${bgColors[colorClass]}`}
        />
      </motion.div>
    </button>
  );
}
