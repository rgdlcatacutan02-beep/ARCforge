"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useEffect, useState, useMemo } from "react";
import { X, AlertCircle, CheckCircle, Download, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, AreaChart, Area, ReferenceLine
} from "recharts";

type SensorConfig = {
  id: string;
  label: string;
  unit: string;
  optMin: number;
  optMax: number;
  critMin: number;
  critMax: number;
  color: string;
  field: string;
};

const SENSOR_CONFIGS: Record<string, SensorConfig> = {
  temperature: { id: "temperature", label: "Temperature", unit: "°C", optMin: 20, optMax: 25, critMin: 15, critMax: 30, color: "#818cf8", field: "temperature" },
  waterPh: { id: "waterPh", label: "Water pH", unit: "pH", optMin: 6.5, optMax: 7.5, critMin: 6.0, critMax: 8.5, color: "#3b82f6", field: "waterPh" },
  turbidity: { id: "turbidity", label: "Turbidity", unit: "NTU", optMin: 0, optMax: 5, critMin: 0, critMax: 10, color: "#a855f7", field: "turbidity" },
  dissolvedOxygen: { id: "dissolvedOxygen", label: "Dissolved Oxygen", unit: "mg/L", optMin: 5, optMax: 8, critMin: 4, critMax: 15, color: "#06b6d4", field: "dissolvedOxygen" },
  solarGeneration: { id: "solarGeneration", label: "Solar Generation", unit: "W", optMin: 50, optMax: 500, critMin: 0, critMax: 1000, color: "#f59e0b", field: "solarGeneration" },
  batteryVoltage: { id: "batteryVoltage", label: "Battery Voltage", unit: "V", optMin: 24, optMax: 28, critMin: 21, critMax: 29, color: "#10b981", field: "batteryVoltage" },
  batterySoc: { id: "batterySoc", label: "Battery SoC", unit: "%", optMin: 20, optMax: 100, critMin: 10, critMax: 100, color: "#10b981", field: "batterySoc" },
};

export function SensorDetailModal() {
  const { selectedSensorPanel, setSelectedSensorPanel, ...store } = useDashboardStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);

  const config = selectedSensorPanel ? SENSOR_CONFIGS[selectedSensorPanel] : null;

  // Real-time listener for telemetry historical data
  useEffect(() => {
    if (!selectedSensorPanel) return;

    if (db) {
      const q = query(collection(db, "telemetry"), orderBy("timestamp", "desc"), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedLogs = snapshot.docs.map(doc => {
          const data = doc.data();
          const date = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
          return {
            id: doc.id,
            timestamp: date,
            timeLabel: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            dateLabel: date.toLocaleDateString(),
            value: data.metrics?.[config!.field] ?? data[config!.field] ?? 0,
            raw: data
          };
        }).reverse(); // Ascending for chart

        setLogs(fetchedLogs);
      }, (error) => {
        console.error("Error fetching sensor logs:", error);
      });
      return () => unsubscribe();
    }
  }, [selectedSensorPanel, config]);

  // Mock real-time data generator if DB is empty or not producing enough frequent events
  useEffect(() => {
    if (!selectedSensorPanel) return;
    
    // Periodically push current store value into mock logs if it changes over time to simulate SSE/Websocket fast stream
    const interval = setInterval(() => {
       setIsLive(true); // just a flicker indicator
       setTimeout(() => setIsLive(false), 200);

       const currentVal = (store as any)[selectedSensorPanel];

       setLogs(prev => {
         // Only push mock if no DB data or if we want to augment for visual stream effect
         const now = new Date();
         const newLog = {
           id: Math.random().toString(),
           timestamp: now,
           timeLabel: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
           dateLabel: now.toLocaleDateString(),
           value: currentVal
         };
         
         // Only append if the last DB pull is older than a few seconds or empty
         if (prev.length === 0 || now.getTime() - prev[prev.length - 1].timestamp.getTime() > 3000) {
            const newLogs = [...prev, newLog];
            if (newLogs.length > 50) newLogs.shift();
            return newLogs;
         }
         return prev;
       });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedSensorPanel, store]);

  const stats = useMemo(() => {
    if (!selectedSensorPanel || !config) return { min: 0, max: 0, avg: 0 };
    const currentValCopy = (store as any)[selectedSensorPanel] || 0;
    if (logs.length === 0) return { min: currentValCopy, max: currentValCopy, avg: currentValCopy };
    const values = logs.map(l => l.value as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { min, max, avg };
  }, [logs, selectedSensorPanel, config, store]);

  if (!selectedSensorPanel || !config) return null;

  const currentVal = (store as any)[selectedSensorPanel] || 0;

  const isSafe = currentVal >= config.optMin && currentVal <= config.optMax;
  const isCrit = currentVal <= config.critMin || currentVal >= config.critMax;

  const statusColor = isCrit ? "text-red-500" : isSafe ? "text-green-500" : "text-yellow-500";

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-[#0A0A0B] border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl shadow-cyan-900/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-[#15151A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                {/* Dynamic icon based on sensor type */}
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.color, boxShadow: `0 0 10px ${config.color}` }}></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{config.label} Live Analytics</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs font-mono text-white/50">
                     <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-green-500/30'}`}></span>
                     WS_STREAM_CONNECTED
                  </div>
                  <span className="text-white/20 text-xs">|</span>
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Node: Primary Matrix</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white/70 transition-colors">
                <Download size={14} /> Export CSV
              </button>
              <button 
                onClick={() => setSelectedSensorPanel(null)}
                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                title="Close Panel"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">
             {/* Left Column: Stats & Chart */}
             <div className="flex-1 flex flex-col gap-6">
                
                {/* Primary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#15151A] rounded-xl border border-white/10 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 font-mono text-4xl">{config.unit}</div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Current Value</div>
                    <div className="text-3xl font-mono font-bold text-white mt-2">
                      {currentVal.toFixed(2)}<span className="text-sm text-white/50 ml-1">{config.unit}</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#15151A] rounded-xl border border-white/10 p-4">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Status</div>
                    <div className={`text-sm font-bold flex items-center gap-2 mt-3 uppercase tracking-wider ${statusColor}`}>
                      {isCrit ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                      {isCrit ? "CRITICAL" : isSafe ? "OPTIMAL" : "WARNING"}
                    </div>
                  </div>

                  <div className="bg-[#15151A] rounded-xl border border-white/10 p-4">
                     <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">24h Average</div>
                     <div className="text-xl font-mono font-bold text-white/80 mt-2">
                        {stats.avg.toFixed(2)}<span className="text-xs text-white/50 ml-1">{config.unit}</span>
                     </div>
                  </div>

                  <div className="bg-[#15151A] rounded-xl border border-white/10 p-4">
                     <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Min / Max (24h)</div>
                     <div className="text-lg font-mono font-bold text-white/80 mt-2">
                        {stats.min.toFixed(1)} <span className="text-white/30 text-sm">/</span> {stats.max.toFixed(1)}
                     </div>
                  </div>
                </div>

                {/* Real-time Chart */}
                <div className="bg-[#15151A] rounded-xl border border-white/10 p-4 flex-1 min-h-[300px] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} className="text-white/40" /> Live Telemetry Series
                    </h3>
                  </div>
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <AreaChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis 
                          dataKey="timeLabel" 
                          stroke="#ffffff40" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          minTickGap={30}
                        />
                        <YAxis 
                          stroke="#ffffff40" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          domain={[
                            (dataMin: number) => Math.min(config.critMin, dataMin) * 0.8,
                            (dataMax: number) => Math.max(config.critMax, dataMax) * 1.2
                          ]} 
                        />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid react-white/10', borderRadius: '8px', fontSize: '12px' }}
                          itemStyle={{ color: config.color, fontWeight: 'bold' }}
                          labelStyle={{ color: '#ffffff80', marginBottom: '4px' }}
                        />
                        <ReferenceLine y={config.optMax} stroke="#22c55e" strokeOpacity={0.3} strokeDasharray="3 3" />
                        <ReferenceLine y={config.optMin} stroke="#22c55e" strokeOpacity={0.3} strokeDasharray="3 3" />
                        <ReferenceLine y={config.critMax} stroke="#ef4444" strokeOpacity={0.3} strokeDasharray="3 3" />
                        <ReferenceLine y={config.critMin} stroke="#ef4444" strokeOpacity={0.3} strokeDasharray="3 3" />

                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={config.color} 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                          isAnimationActive={false} // Disable animation for live streaming performance
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
             </div>

             {/* Right Column: Server-Sent Event Logs */}
             <div className="w-full lg:w-80 bg-[#15151A] rounded-xl border border-white/10 p-0 flex flex-col overflow-hidden shrink-0">
               <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1A1A20]">
                 <h3 className="text-sm font-bold text-white uppercase tracking-widest">Event Register</h3>
                 <div className="text-[10px] font-mono text-white/40 uppercase bg-black/50 px-2 py-1 rounded">
                   {logs.length} events
                 </div>
               </div>
               <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
                  <div className="flex flex-col gap-1">
                    {[...logs].reverse().map((log, i) => {
                       const logIsSafe = log.value >= config.optMin && log.value <= config.optMax;
                       const logIsCrit = log.value <= config.critMin || log.value >= config.critMax;
                       
                       return (
                         <div key={log.id + i} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors border-b border-transparent hover:border-white/5 group">
                           <div className="flex flex-col">
                             <span className="text-white/80 font-mono text-sm">{typeof log.value === 'number' ? log.value.toFixed(2) : log.value}</span>
                             <span className="text-white/30 font-mono text-[10px]">{log.dateLabel} {log.timeLabel}</span>
                           </div>
                           <div className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                             logIsCrit ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                             logIsSafe ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                             'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                           }`}>
                             {logIsCrit ? "CRIT" : logIsSafe ? "OK" : "WARN"}
                           </div>
                         </div>
                       );
                    })}
                  </div>
               </div>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
