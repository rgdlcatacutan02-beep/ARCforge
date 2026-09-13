"use client";

import { useState } from "react";

export function EditableValue({ value, onChange, type = "text", suffix = "", className = "", disabled = false }: { value: any, onChange: (val: any) => void, type?: string, suffix?: string, className?: string, disabled?: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value);

  if (isEditing) {
    return (
      <input 
        autoFocus
        type={type}
        step="any"
        value={tempVal}
        disabled={disabled}
        onChange={(e) => setTempVal(e.target.value)}
        onBlur={() => {
           onChange(type === "number" ? Number(tempVal) : tempVal);
           setIsEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onChange(type === "number" ? Number(tempVal) : tempVal);
            setIsEditing(false);
          }
        }}
        className={`bg-[#0f0f12] text-white border border-cyan-500 rounded px-1 min-w-[60px] outline-none ${className}`}
        style={{ width: `max(60px, ${String(tempVal).length + 2}ch)` }}
      />
    )
  }

  return (
    <span 
      onClick={() => { if (!disabled) { setIsEditing(true); setTempVal(value); } }} 
      className={`${!disabled ? 'cursor-pointer hover:text-cyan-400 hover:underline decoration-cyan-500/50 underline-offset-4' : 'cursor-default opacity-80'} transition-colors ${className}`} 
      title={disabled ? "Read only" : "Click to edit"}
    >
      {value}<span className="text-xs opacity-50 ml-1 decoration-transparent">{suffix}</span>
    </span>
  );
}
