"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { VideoOff, Droplet, Send } from "lucide-react";
import { ProToggle } from "@/components/pro-toggle";
import { HistoricalChart } from "@/components/historical-chart";
import { SensorDetailModal } from "@/components/sensor-detail-modal";
import { DashboardCameras } from "@/components/dashboard-cameras";
import { FeedingSchedule } from "@/components/feeding-schedule";
import { SensorCard } from "@/components/sensor-card";
import { db } from "@/lib/firebase";
import { doc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { EditableValue } from "@/components/editable-value";

export default function Dashboard() {
  const store = useDashboardStore();

  useEffect(() => {
    // Real-time listener for IoT device updates via Firestore
    const unsub = onSnapshot(doc(db, "system_status", "latest"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        useDashboardStore.setState((state) => ({
          ...state,
          solarGeneration: data.solarGeneration ?? state.solarGeneration,
          batteryVoltage: data.batteryVoltage ?? state.batteryVoltage,
          batterySoc: data.batterySoc ?? state.batterySoc,
          dissolvedOxygen: data.dissolvedOxygen ?? state.dissolvedOxygen,
          waterPh: data.waterPh ?? state.waterPh,
          temperature: data.temperature ?? state.temperature,
          turbidity: data.turbidity ?? state.turbidity
        }));
      }
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
    });

    // Real-time listener for cameras
    const unsubCameras = onSnapshot(collection(db, "cameras"), (snap) => {
      const cams = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      useDashboardStore.getState().setCameras(cams as any);
    }, (error) => {
       console.error("Firestore cameras onSnapshot error:", error);
    });

    // Mock data interval if no live hardware connected yet
    const interval = setInterval(() => {
      useDashboardStore.setState((state) => ({
        solarGeneration: +(140 + Math.random() * 5).toFixed(1),
        batteryVoltage: +(25.5 + Math.random() * 0.2).toFixed(2),
        batteryTemp: +(28.0 + Math.random() * 1).toFixed(1),
        dissolvedOxygen: +(6.5 + Math.random() * 0.5).toFixed(2),
        waterPh: +(7.0 + Math.random() * 0.3).toFixed(2),
        temperature: +(24.0 + Math.random() * 1.0).toFixed(1),
        turbidity: +(3.0 + Math.random() * 0.5).toFixed(1)
      }));
    }, 4000);
    
    return () => {
      clearInterval(interval);
      unsub();
      unsubCameras();
    };
  }, []);

  return (
    <>
      {store.role === 'admin' ? (
        <div className="col-span-1 md:col-span-12 flex items-center justify-between bg-cyan-900/10 border border-cyan-500/20 p-3 rounded-xl mb-2">
           <div className="text-xs text-cyan-400">💡 <strong>Tip:</strong> Click on camera settings or phone numbers to edit, or use manual overrides below.</div>
        </div>
      ) : (
        <div className="col-span-1 md:col-span-12 flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl mb-2">
           <div className="text-xs text-white/50">🔒 <strong>View Only:</strong> You are viewing the dashboard in read-only mode. Toggle to Admin in the top right to enable controls.</div>
        </div>
      )}
      
      {/* Solar Performance Card */}
      <section 
        onClick={() => store.setSelectedSensorPanel('solarGeneration')}
        className="col-span-1 md:col-span-12 lg:col-span-4 row-span-2 bg-[#15151A] rounded-xl border border-white/10 p-5 relative overflow-hidden cursor-pointer hover:border-orange-500/50 transition-colors group">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] uppercase text-orange-400 font-bold tracking-widest mb-1 group-hover:text-orange-300 transition-colors">Solar Generation</div>
            <div className="text-3xl font-mono font-bold text-white flex items-end">
              {store.solarGeneration.toFixed(1)}<span className="text-sm text-white/40 ml-1 mb-1">W</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
            <span className="text-orange-400 text-xl group-hover:scale-110 transition-transform">☀</span>
          </div>
        </div>
        
        <div className="mt-8 relative h-16 w-full">
           <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
             <path 
               d="M0,100 L0,50 Q25,20 50,50 T100,50 L100,100 Z" 
               fill="url(#gradient)" 
               opacity="0.3" 
             />
             <path 
               d="M0,50 Q25,20 50,50 T100,50" 
               fill="none" 
               stroke="#f97316" 
               strokeWidth="2" 
               className="drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
             />
             <defs>
               <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                 <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
               </linearGradient>
             </defs>
           </svg>
        </div>
      </section>

      {/* Battery Status Matrix */}
      <section className="col-span-1 md:col-span-12 lg:col-span-4 row-span-2 bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col cursor-pointer hover:border-green-500/50 transition-colors group">
        <div className="text-[10px] uppercase text-green-400 font-bold tracking-widest mb-4 group-hover:text-green-300 transition-colors">Battery (LiFePO4)</div>
        <div className="flex items-center gap-6">
          <div 
            onClick={() => store.setSelectedSensorPanel('batterySoc')}
            className="relative w-24 h-24 shrink-0 transition-transform hover:scale-105">
            <svg className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle 
                cx="48" cy="48" r="40" fill="transparent" 
                stroke="#22c55e" 
                strokeWidth="8" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * (store.batterySoc / 100))} 
                strokeLinecap="round" 
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-lg font-bold font-mono text-white flex items-baseline">
                {Math.round(store.batterySoc)}<span className="text-xs opacity-50 ml-1">%</span>
              </div>
              <div className="text-[8px] text-white/50">SOC</div>
            </div>
          </div>
          <div className="flex-1 space-y-3 min-w-0">
            <div 
              onClick={(e) => { e.stopPropagation(); store.setSelectedSensorPanel('batteryVoltage'); }}
              className="flex justify-between border-b border-white/5 pb-1 gap-2 hover:bg-white/5 rounded px-1 -mx-1 transition-colors cursor-pointer">
              <span className="text-[10px] text-white/40 shrink-0 mt-0.5">Voltage</span>
              <span className="text-xs font-mono text-white truncate text-right">
                {store.batteryVoltage.toFixed(2)}<span className="text-xs opacity-50 ml-1">V</span>
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1 gap-2">
              <span className="text-[10px] text-white/40 shrink-0">Temp</span>
              <span className="text-xs font-mono text-white truncate text-right">
                {store.batteryTemp.toFixed(1)}<span className="text-xs opacity-50 ml-1">°C</span>
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[10px] text-white/40 shrink-0">Status</span>
              <span className="text-xs font-mono text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] truncate text-right">
                {store.batteryStatus}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Water Quality Section */}
      <section className="col-span-1 md:col-span-12 lg:col-span-4 row-span-2 grid grid-cols-2 gap-4">
        <SensorCard 
          label="Dissolved Oxygen"
          value={store.dissolvedOxygen.toFixed(2)}
          unit="mg/L"
          status={store.dissolvedOxygen < 3 ? "critical" : "optimal"}
          onClick={() => store.setSelectedSensorPanel('dissolvedOxygen')}
        />
        <SensorCard 
          label="Water pH"
          value={store.waterPh.toFixed(2)}
          unit="pH"
          status={(store.waterPh < 5 || store.waterPh > 9) ? "critical" : (store.waterPh < 6.5 || store.waterPh > 8 ) ? "warning" : "optimal"}
          onClick={() => store.setSelectedSensorPanel('waterPh')}
        />
        <SensorCard 
          label="Temperature"
          value={store.temperature.toFixed(1)}
          unit="°C"
          status={store.temperature > 30 ? "critical" : "optimal"}
          onClick={() => store.setSelectedSensorPanel('temperature')}
        />
        <SensorCard 
          label="Turbidity"
          value={store.turbidity.toFixed(1)}
          unit="NTU"
          status={store.turbidity > 25 ? "critical" : "optimal"}
          onClick={() => store.setSelectedSensorPanel('turbidity')}
        />
      </section>

      {/* Main Vision Interface */}
      <DashboardCameras />

      {/* Control Systems */}
      <section className={`col-span-1 md:col-span-12 lg:col-span-4 row-span-4 bg-[#15151A] rounded-xl border border-white/10 flex flex-col p-5 ${store.role !== 'admin' ? 'opacity-70 pointer-events-none' : ''}`}>
        <div className="text-[10px] uppercase text-white/40 font-bold tracking-widest mb-4 flex justify-between">
          <span>Manual Overrides {store.role !== 'admin' && '(Locked)'}</span>
          <span className="text-cyan-400 cursor-pointer hover:underline" onClick={() => {
            store.setKey('pumpAStatus', !store.pumpAStatus);
            store.setKey('aeratorStatus', !store.aeratorStatus);
            store.setKey('thermalStatus', !store.thermalStatus);
          }}>Toggle All</span>
        </div>
        
        <div className="space-y-3 flex-1">
          <div 
            onClick={() => store.setKey('pumpAStatus', !store.pumpAStatus)}
            className="bg-white/5 rounded-lg p-3 flex items-center justify-between border border-white/5 transition-colors hover:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${store.pumpAStatus ? 'bg-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-white/5'}`}>
                <span className={store.pumpAStatus ? 'text-cyan-400' : 'text-white/40'}>♒</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">Main Pump A</div>
                <div className={`text-[10px] font-mono font-bold ${store.pumpAStatus ? 'text-green-400' : 'text-white/30'}`}>
                  {store.pumpAStatus ? 'RUNNING - 42W' : 'OFFLINE'}
                </div>
              </div>
            </div>
            <ProToggle 
              value={store.pumpAStatus} 
              onChange={() => store.setKey('pumpAStatus', !store.pumpAStatus)} 
              colorClass="cyan" 
            />
          </div>

          <div 
            onClick={() => store.setKey('aeratorStatus', !store.aeratorStatus)}
            className="bg-white/5 rounded-lg p-3 flex items-center justify-between border border-white/5 transition-colors hover:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${store.aeratorStatus ? 'bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-white/5'}`}>
                <span className={store.aeratorStatus ? 'text-blue-400' : 'text-white/40'}>≋</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">Aerator Unit 01</div>
                <div className={`text-[10px] font-mono font-bold ${store.aeratorStatus ? 'text-green-400' : 'text-white/30'}`}>
                  {store.aeratorStatus ? 'RUNNING' : 'IDLE (SCHED)'}
                </div>
              </div>
            </div>
            <ProToggle 
              value={store.aeratorStatus} 
              onChange={() => store.setKey('aeratorStatus', !store.aeratorStatus)} 
              colorClass="blue" 
            />
          </div>

          <div 
            onClick={() => store.setKey('thermalStatus', !store.thermalStatus)}
            className="bg-white/5 rounded-lg p-3 flex items-center justify-between border border-white/5 transition-colors hover:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${store.thermalStatus ? 'bg-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'bg-white/5'}`}>
                <span className={store.thermalStatus ? 'text-orange-400' : 'text-white/40'}>♨</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">Thermal Reg.</div>
                <div className={`text-[10px] font-mono font-bold ${store.thermalStatus ? 'text-orange-400' : 'text-red-400/60'}`}>
                  {store.thermalStatus ? 'HEATING' : 'OFFLINE'}
                </div>
              </div>
            </div>
            <ProToggle 
              value={store.thermalStatus} 
              onChange={() => store.setKey('thermalStatus', !store.thermalStatus)} 
              colorClass="orange" 
            />
          </div>
        </div>
        
        <div className="mt-4 p-4 rounded-lg bg-red-950/20 border border-red-500/30 flex items-center justify-between">
          <div className="text-[10px] text-red-500 font-bold uppercase tracking-tighter leading-tight drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">Critical<br/>Shutdown</div>
          <button 
            onClick={() => {
              store.setKey('pumpAStatus', false);
              store.setKey('aeratorStatus', false);
              store.setKey('thermalStatus', false);
            }}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] tracking-wider uppercase font-bold rounded shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all transform hover:scale-105 active:scale-95">
            Kill Switch
          </button>
        </div>
      </section>

      {/* Historical Analytics */}
      <section className="col-span-1 md:col-span-12 lg:col-span-8 row-span-2">
         <HistoricalChart />
      </section>

      {/* Automated Feeding System */}
      <FeedingSchedule />

      {/* SMS Alert System */}
      <section className={`col-span-1 md:col-span-12 lg:col-span-12 bg-indigo-950/20 rounded-xl border border-indigo-500/30 p-5 mt-2 ${store.role !== 'admin' ? 'opacity-70 pointer-events-none hidden' : ''}`}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-lg">⚙</span>
            <div className="text-[10px] uppercase text-indigo-400 font-bold tracking-widest">Essential Settings & SMS Alerts</div>
          </div>
          <div className="flex items-center gap-2" onClick={() => store.setKey('smsActive', !store.smsActive)}>
            <span className="text-[10px] font-mono text-white/40">MASTER ALERTS STATUS:</span>
            <span className={`text-[10px] font-mono ${store.smsActive ? 'text-green-400' : 'text-white/40'}`}>
              {store.smsActive ? 'ACTIVE' : 'DISABLED'}
            </span>
            <ProToggle 
              value={store.smsActive} 
              onChange={() => store.setKey('smsActive', !store.smsActive)} 
              colorClass="green" 
            />
          </div>
        </div>
        
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${store.smsActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="bg-[#15151A] rounded flex flex-col justify-center p-3 border border-white/5">
            <label className="text-[10px] text-white/50 mb-1 font-semibold uppercase">Destinations</label>
            <div className="bg-[#0A0A0B] text-white/80 text-xs w-full px-3 py-2 rounded-lg border border-white/10 font-mono">
               {store.contacts.length > 0 ? (
                 <div className="flex flex-col gap-1">
                   {store.contacts.map(c => (
                     <div key={c.id} className="flex justify-between items-center gap-2 border-b border-white/5 last:border-0 pb-1 last:pb-0">
                       <span className="truncate">{c.name}</span>
                       <span className="text-white/40">{c.phone}</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <span className="text-white/40 italic">No contacts registered.</span>
               )}
            </div>
            <div className="text-[8px] text-white/30 mt-2">Required for critical system interruption alerts.</div>
          </div>
          
          <div className="bg-[#15151A] rounded flex flex-col justify-center p-3 border border-white/5 col-span-1 md:col-span-2">
            <label className="text-[10px] text-white/50 mb-2 font-semibold uppercase">Trigger Conditions (SMS)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {Object.entries(store.alerts).map(([key, active]) => (
                  <div key={key} className="flex justify-between items-center gap-3">
                     <div className="flex flex-col">
                        <span className="text-[11px] text-white/80 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} Alerts</span>
                     </div>
                     <ProToggle 
                        value={active as boolean} 
                        onChange={() => store.setAlert(key as keyof typeof store.alerts, !active as boolean)} 
                        colorClass="green" 
                     />
                  </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      <SensorDetailModal />
    </>
  );
}
