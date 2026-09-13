"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useState, useMemo } from "react";
import { 
  Zap, 
  Sun, 
  BatteryCharging, 
  Battery, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Power, 
  ArrowRight, 
  Gauge, 
  Layers,
  Flame,
  CheckCircle2
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend 
} from "recharts";
import { ProToggle } from "@/components/pro-toggle";
import { motion } from "motion/react";

export default function EnergyPage() {
  const store = useDashboardStore();
  const [powerSavingMode, setPowerSavingMode] = useState(false);

  // Active loads breakdown based on current pump & aerator states
  const loadsBreakdown = useMemo(() => {
    const mainPumpWatts = store.pumpAStatus ? 42 : 0;
    const aeratorWatts = store.aeratorStatus ? 35 : 0;
    const heaterWatts = store.thermalStatus ? 85 : 0;
    const gatewayWatts = 9.5; // RPi 4B + ESP32 cams idle + sensor array
    const totalConsumption = mainPumpWatts + aeratorWatts + heaterWatts + gatewayWatts;

    return {
      mainPumpWatts,
      aeratorWatts,
      heaterWatts,
      gatewayWatts,
      totalConsumption: +totalConsumption.toFixed(1),
      netPower: +(store.solarGeneration - totalConsumption).toFixed(1)
    };
  }, [store.pumpAStatus, store.aeratorStatus, store.thermalStatus, store.solarGeneration]);

  // Battery autonomy calculation (assuming 24V 100Ah LiFePO4 battery = 2400Wh nominal capacity)
  const batteryStats = useMemo(() => {
    const totalCapacityWh = 2400;
    const remainingWh = (totalCapacityWh * store.batterySoc) / 100;
    const dischargeWatts = Math.max(loadsBreakdown.totalConsumption, 15);
    const autonomyHours = +(remainingWh / dischargeWatts).toFixed(1);

    return {
      totalCapacityWh,
      remainingWh: Math.round(remainingWh),
      autonomyHours,
      cellVoltage: +(store.batteryVoltage / 8).toFixed(2) // 8S LiFePO4
    };
  }, [store.batterySoc, store.batteryVoltage, loadsBreakdown.totalConsumption]);

  // 24h Solar vs Consumption profile
  const dailyProfile = useMemo(() => {
    const hours = [
      "00:00", "02:00", "04:00", "06:00", "08:00", "10:00", 
      "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"
    ];

    return hours.map((hour, idx) => {
      // Solar curve peaks at noon (indices 5, 6)
      let solar = 0;
      if (idx >= 3 && idx <= 8) {
        const peakFactor = Math.sin(((idx - 3) / 6) * Math.PI);
        solar = Math.round(peakFactor * 180 + Math.random() * 15);
      }
      const load = Math.round(loadsBreakdown.totalConsumption + (Math.random() * 8 - 4));
      return { hour, solar, load };
    });
  }, [loadsBreakdown.totalConsumption]);

  return (
    <div className="col-span-1 md:col-span-12 flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <Zap size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Solar & LiFePO4 Energy Hub</h1>
              <p className="text-white/40 text-xs">Autonomous microgrid monitoring: PV generation, MPPT telemetry & battery health</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#15151A] px-4 py-2 rounded-xl border border-white/10">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-white/40">Power Saver Mode</span>
            <span className={`text-[10px] font-mono ${powerSavingMode ? 'text-green-400' : 'text-white/40'}`}>
              {powerSavingMode ? 'ACTIVE (LOAD SHED)' : 'STANDARD'}
            </span>
          </div>
          <ProToggle
            value={powerSavingMode}
            onChange={() => setPowerSavingMode(!powerSavingMode)}
            colorClass="green"
          />
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solar Generation */}
        <div className="bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400">PV Array Output</span>
              <div className="text-3xl font-mono font-bold text-white mt-1">
                {store.solarGeneration.toFixed(1)} <span className="text-sm text-white/40 font-normal">W</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <Sun size={20} />
            </div>
          </div>
          <div className="text-[10px] text-white/40 border-t border-white/5 pt-3 mt-4 flex justify-between font-mono">
            <span>MPPT Eff: 97.4%</span>
            <span className="text-green-400">STATUS: BULK</span>
          </div>
        </div>

        {/* Battery State of Charge */}
        <div className="bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-green-400">Battery SOC</span>
              <div className="text-3xl font-mono font-bold text-white mt-1">
                {Math.round(store.batterySoc)}<span className="text-sm text-white/40 font-normal">%</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center">
              <BatteryCharging size={20} />
            </div>
          </div>
          <div className="text-[10px] text-white/40 border-t border-white/5 pt-3 mt-4 flex justify-between font-mono">
            <span>Pack: {store.batteryVoltage.toFixed(2)}V</span>
            <span className="text-cyan-400">Cell: {batteryStats.cellVoltage}V</span>
          </div>
        </div>

        {/* System Load */}
        <div className="bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">Total System Load</span>
              <div className="text-3xl font-mono font-bold text-white mt-1">
                {loadsBreakdown.totalConsumption} <span className="text-sm text-white/40 font-normal">W</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Activity size={20} />
            </div>
          </div>
          <div className="text-[10px] text-white/40 border-t border-white/5 pt-3 mt-4 flex justify-between font-mono">
            <span>Net: {loadsBreakdown.netPower > 0 ? `+${loadsBreakdown.netPower}W` : `${loadsBreakdown.netPower}W`}</span>
            <span className={loadsBreakdown.netPower >= 0 ? "text-green-400" : "text-amber-400"}>
              {loadsBreakdown.netPower >= 0 ? "NET CHARGING" : "DISCHARGING"}
            </span>
          </div>
        </div>

        {/* Off-Grid Autonomy */}
        <div className="bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Est. Autonomy</span>
              <div className="text-3xl font-mono font-bold text-white mt-1">
                {batteryStats.autonomyHours} <span className="text-sm text-white/40 font-normal">Hours</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-[10px] text-white/40 border-t border-white/5 pt-3 mt-4 flex justify-between font-mono">
            <span>Stored: {batteryStats.remainingWh} Wh</span>
            <span className="text-green-400">RELIABLE</span>
          </div>
        </div>
      </div>

      {/* Interactive Microgrid Power Flow Diagram */}
      <div className="bg-[#15151A] rounded-xl border border-white/10 p-6 flex flex-col">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Microgrid Power Flow Diagram</h3>
        <p className="text-white/40 text-xs mb-6">Real-time energy distribution from photovoltaic source to farm loads</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Node 1: Solar Array */}
          <div className="bg-[#0A0A0B] rounded-xl border border-orange-500/30 p-4 text-center relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-2">
              <Sun size={20} />
            </div>
            <div className="text-xs font-bold text-white uppercase">Solar Array</div>
            <div className="text-lg font-mono font-bold text-orange-400 mt-1">{store.solarGeneration.toFixed(1)} W</div>
            <div className="text-[10px] text-white/40 font-mono">2x 100W Monocrystalline</div>
          </div>

          {/* Node 2: MPPT Controller */}
          <div className="bg-[#0A0A0B] rounded-xl border border-cyan-500/30 p-4 text-center relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-2">
              <Gauge size={20} />
            </div>
            <div className="text-xs font-bold text-white uppercase">MPPT Controller</div>
            <div className="text-lg font-mono font-bold text-cyan-400 mt-1">97.4% Eff.</div>
            <div className="text-[10px] text-white/40 font-mono">24V / 20A SmartSolar</div>
          </div>

          {/* Node 3: LiFePO4 Storage */}
          <div className="bg-[#0A0A0B] rounded-xl border border-green-500/30 p-4 text-center relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-2">
              <BatteryCharging size={20} />
            </div>
            <div className="text-xs font-bold text-white uppercase">LiFePO4 Storage</div>
            <div className="text-lg font-mono font-bold text-green-400 mt-1">{Math.round(store.batterySoc)}% SOC</div>
            <div className="text-[10px] text-white/40 font-mono">{store.batteryVoltage.toFixed(2)}V • {store.batteryTemp.toFixed(1)}°C</div>
          </div>

          {/* Node 4: System Loads */}
          <div className="bg-[#0A0A0B] rounded-xl border border-purple-500/30 p-4 text-center relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-2">
              <Activity size={20} />
            </div>
            <div className="text-xs font-bold text-white uppercase">System Loads</div>
            <div className="text-lg font-mono font-bold text-purple-400 mt-1">{loadsBreakdown.totalConsumption} W</div>
            <div className="text-[10px] text-white/40 font-mono">Pumps • Aeration • RPi</div>
          </div>
        </div>
      </div>

      {/* Solar vs Consumption Profile Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Solar Generation vs Load Curve</h3>
              <p className="text-white/40 text-xs mt-0.5">24-hour diurnal power balance comparison (Watts)</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-1 rounded">
              HARVEST POSITIVE
            </span>
          </div>

          <div className="h-[280px] w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={dailyProfile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="hour" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} unit="W" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0F0F12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="solar" name="Solar Generation (W)" stroke="#f97316" strokeWidth={2} fill="url(#solarFill)" />
                <Area type="monotone" dataKey="load" name="Farm Power Load (W)" stroke="#06b6d4" strokeWidth={2} fill="url(#loadFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Load Breakdown Card */}
        <div className="bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-3">Active Load Distribution</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#0A0A0B] p-3 rounded-lg border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white">Main Pump A (Submersible)</div>
                  <div className="text-[10px] text-white/40">{store.pumpAStatus ? 'ONLINE' : 'OFFLINE'}</div>
                </div>
                <span className="font-mono text-xs font-bold text-cyan-400">{loadsBreakdown.mainPumpWatts} W</span>
              </div>

              <div className="flex justify-between items-center bg-[#0A0A0B] p-3 rounded-lg border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white">Aerator Unit 01 (Venturi)</div>
                  <div className="text-[10px] text-white/40">{store.aeratorStatus ? 'ONLINE' : 'IDLE'}</div>
                </div>
                <span className="font-mono text-xs font-bold text-blue-400">{loadsBreakdown.aeratorWatts} W</span>
              </div>

              <div className="flex justify-between items-center bg-[#0A0A0B] p-3 rounded-lg border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white">Thermal Reg Loop</div>
                  <div className="text-[10px] text-white/40">{store.thermalStatus ? 'HEATING' : 'STANDBY'}</div>
                </div>
                <span className="font-mono text-xs font-bold text-orange-400">{loadsBreakdown.heaterWatts} W</span>
              </div>

              <div className="flex justify-between items-center bg-[#0A0A0B] p-3 rounded-lg border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white">RPi Gateway & ESP32 Cameras</div>
                  <div className="text-[10px] text-white/40">Continuous Monitoring</div>
                </div>
                <span className="font-mono text-xs font-bold text-green-400">{loadsBreakdown.gatewayWatts} W</span>
              </div>
            </div>
          </div>

          <div className="bg-green-950/20 border border-green-500/30 rounded-lg p-3 mt-4 flex items-center justify-between">
            <div className="text-[10px] text-green-400 font-bold uppercase">Battery Cell Balancing</div>
            <span className="text-xs font-mono text-green-400 flex items-center gap-1">
              <CheckCircle2 size={14} /> &plusmn;0.01V DELTA OK
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
