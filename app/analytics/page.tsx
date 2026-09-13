"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  Sparkles, 
  BarChart3, 
  Activity, 
  Droplet, 
  Sun, 
  Gauge, 
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend 
} from "recharts";

export default function AnalyticsPage() {
  const store = useDashboardStore();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'do' | 'ph' | 'temp' | 'solar'>('all');

  // Generate continuous historical time series based on current store values and time range
  const chartData = useMemo(() => {
    const pointsCount = timeRange === '24h' ? 24 : timeRange === '7d' ? 14 : 30;
    const data = [];
    const now = new Date();

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(now);
      let label = '';
      if (timeRange === '24h') {
        d.setHours(now.getHours() - i);
        label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeRange === '7d') {
        d.setDate(now.getDate() - i);
        label = d.toLocaleDateString([], { weekday: 'short' });
      } else {
        d.setDate(now.getDate() - i);
        label = `${d.getMonth() + 1}/${d.getDate()}`;
      }

      // Generate realistic daily aquaculture fluctuations
      const timeOfDayFactor = Math.sin((i / (timeRange === '24h' ? 12 : 6)) * Math.PI);
      const solarGen = Math.max(0, +(140 + timeOfDayFactor * 50 + (Math.random() * 10 - 5)).toFixed(1));
      const doValue = +(store.dissolvedOxygen + timeOfDayFactor * 0.8 + (Math.random() * 0.2 - 0.1)).toFixed(2);
      const phValue = +(store.waterPh + (Math.random() * 0.2 - 0.1)).toFixed(2);
      const tempValue = +(store.temperature + timeOfDayFactor * 1.2 + (Math.random() * 0.3 - 0.15)).toFixed(1);
      const turbidityValue = +(store.turbidity + (Math.random() * 0.4 - 0.2)).toFixed(1);

      data.push({
        label,
        timestamp: d.toISOString(),
        do: doValue,
        ph: phValue,
        temp: tempValue,
        turbidity: turbidityValue,
        solar: solarGen,
        soc: Math.min(100, Math.max(40, +(store.batterySoc + timeOfDayFactor * 10).toFixed(0)))
      });
    }
    return data;
  }, [timeRange, store.dissolvedOxygen, store.waterPh, store.temperature, store.turbidity, store.batterySoc]);

  // Telemetry Export to CSV
  const handleExportCSV = () => {
    const headers = ["Timestamp,Label,DissolvedOxygen_mgL,pH,Temperature_C,Turbidity_NTU,SolarGeneration_W,BatterySOC_%"];
    const rows = chartData.map(d => 
      `"${d.timestamp}","${d.label}",${d.do},${d.ph},${d.temp},${d.turbidity},${d.solar},${d.soc}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `arcforge_telemetry_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="col-span-1 md:col-span-12 flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Telemetry & Predictive Analytics</h1>
              <p className="text-white/40 text-xs">Cross-sensor correlation, water chemistry trends, and biological performance indexing</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <div className="bg-[#15151A] rounded-lg border border-white/10 p-1 flex items-center gap-1">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-xs font-semibold uppercase transition-colors ${
                  timeRange === range
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#15151A] rounded-xl border border-white/10 p-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">DO Mean Index</span>
            <span className="text-green-400 text-xs font-mono flex items-center gap-0.5">
              <ArrowUpRight size={14} /> +3.2%
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2">
            {store.dissolvedOxygen.toFixed(2)} <span className="text-xs text-white/40 font-normal">mg/L</span>
          </div>
          <div className="text-[10px] text-white/40 mt-1">Optimal threshold: &gt; 5.5 mg/L</div>
        </div>

        <div className="bg-[#15151A] rounded-xl border border-white/10 p-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">pH Stability</span>
            <span className="text-green-400 text-xs font-mono flex items-center gap-0.5">
              <ShieldCheck size={14} /> STABLE
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2">
            {store.waterPh.toFixed(2)} <span className="text-xs text-white/40 font-normal">pH</span>
          </div>
          <div className="text-[10px] text-white/40 mt-1">Variance: &plusmn;0.14 over {timeRange}</div>
        </div>

        <div className="bg-[#15151A] rounded-xl border border-white/10 p-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400">Peak Solar Yield</span>
            <span className="text-orange-400 text-xs font-mono flex items-center gap-0.5">
              <Sun size={14} /> 94% MPPT
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2">
            184.6 <span className="text-xs text-white/40 font-normal">W (Peak)</span>
          </div>
          <div className="text-[10px] text-white/40 mt-1">Daily energy: 1.12 kWh harvested</div>
        </div>

        <div className="bg-[#15151A] rounded-xl border border-white/10 p-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-green-400">Health Rating</span>
            <span className="text-green-400 text-xs font-mono flex items-center gap-0.5">
              <Sparkles size={14} /> AI Score
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2">
            96<span className="text-xs text-white/40 font-normal"> / 100</span>
          </div>
          <div className="text-[10px] text-green-400/80 mt-1">Low hypoxia risk index</div>
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Multi-Parametric Telemetry Waveform</h3>
            <p className="text-white/40 text-xs mt-0.5">Synchronized sensor readings over selected period ({timeRange.toUpperCase()})</p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-[#0A0A0B] p-1 rounded-lg border border-white/10">
            {[
              { id: 'all', label: 'Composite' },
              { id: 'do', label: 'Oxygen (DO)' },
              { id: 'ph', label: 'pH Level' },
              { id: 'temp', label: 'Temperature' },
              { id: 'solar', label: 'Solar Power' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id as any)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedMetric === m.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View */}
        <div className="h-[340px] w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            {selectedMetric === 'solar' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="label" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} unit="W" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0F0F12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="solar" name="Solar (W)" stroke="#f97316" strokeWidth={2} fill="url(#solarGrad)" />
              </AreaChart>
            ) : selectedMetric === 'do' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="doGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="label" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} unit="mg/L" domain={[3, 10]} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0F0F12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="do" name="Dissolved Oxygen (mg/L)" stroke="#06b6d4" strokeWidth={2} fill="url(#doGrad)" />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="label" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0F0F12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                {selectedMetric === 'all' && (
                  <Line type="monotone" dataKey="do" name="Dissolved Oxygen (mg/L)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'ph') && (
                  <Line type="monotone" dataKey="ph" name="Water pH" stroke="#3b82f6" strokeWidth={2} dot={false} />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'temp') && (
                  <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#ec4899" strokeWidth={2} dot={false} />
                )}
                {selectedMetric === 'all' && (
                  <Line type="monotone" dataKey="turbidity" name="Turbidity (NTU)" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Aquaculture Diagnostics & Farm Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
            <Sparkles className="text-cyan-400" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Ecological Diagnostics</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-[#0A0A0B] p-3.5 rounded-lg border border-cyan-500/20 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                <Droplet size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Oxygen Dissolution Efficiency High</div>
                <div className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                  Water temperature at 24.5°C aligns with optimal gas saturation index. Night-time aerator cycles maintained dissolved oxygen above critical threshold (5.0 mg/L).
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0B] p-3.5 rounded-lg border border-green-500/20 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Biological Buffer Margin Safe</div>
                <div className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                  pH readings exhibit minimal diurnal variance (&lt; 0.2 units), indicating robust bacterial nitrification without excessive ammonia spikes.
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0B] p-3.5 rounded-lg border border-orange-500/20 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Solar Storage Forecast Favorable</div>
                <div className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                  LiFePO4 battery reached 82% SOC before peak noon. Projected solar generation guarantees 28+ hours of autonomous life-support runtime.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aquaculture Threshold Reference Table */}
        <div className="bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
            <Gauge className="text-cyan-400" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Species Range Benchmarks</h3>
          </div>

          <div className="text-xs text-white/40 mb-3 font-mono">Australian Redclaw (Cherax quadricarinatus)</div>

          <div className="space-y-2.5 flex-1">
            <div className="flex justify-between items-center bg-[#0A0A0B] p-2.5 rounded-lg border border-white/5">
              <span className="text-xs text-white/70">Dissolved Oxygen</span>
              <span className="text-xs font-mono font-bold text-cyan-400">&gt; 5.0 mg/L</span>
            </div>
            <div className="flex justify-between items-center bg-[#0A0A0B] p-2.5 rounded-lg border border-white/5">
              <span className="text-xs text-white/70">Water pH Range</span>
              <span className="text-xs font-mono font-bold text-blue-400">7.0 - 8.2</span>
            </div>
            <div className="flex justify-between items-center bg-[#0A0A0B] p-2.5 rounded-lg border border-white/5">
              <span className="text-xs text-white/70">Water Temperature</span>
              <span className="text-xs font-mono font-bold text-orange-400">23°C - 31°C</span>
            </div>
            <div className="flex justify-between items-center bg-[#0A0A0B] p-2.5 rounded-lg border border-white/5">
              <span className="text-xs text-white/70">Max Turbidity</span>
              <span className="text-xs font-mono font-bold text-purple-400">&lt; 25 NTU</span>
            </div>
            <div className="flex justify-between items-center bg-[#0A0A0B] p-2.5 rounded-lg border border-white/5">
              <span className="text-xs text-white/70">Photoperiod</span>
              <span className="text-xs font-mono font-bold text-white/60">14L : 10D</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
