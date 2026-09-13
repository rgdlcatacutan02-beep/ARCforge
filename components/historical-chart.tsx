"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

const mockData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  temp: 24 + Math.sin(i / 3) * 2 + Math.random(),
  ph: 7.2 + Math.cos(i / 4) * 0.4 + Math.random() * 0.1,
  do: 6.8 + Math.sin(i / 5) * 1.5 + Math.random() * 0.2
}));

export function HistoricalChart() {
  const [data, setData] = useState(mockData);
  const [metric, setMetric] = useState<'temp' | 'ph' | 'do'>('temp');

  return (
    <div className="w-full h-[250px] bg-[#15151A] rounded-xl border border-white/10 p-4 mb-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-sm font-bold text-white uppercase tracking-widest">Historical Telemetry</h3>
         <div className="flex gap-2">
            <button onClick={() => setMetric('temp')} className={`px-2 py-1 text-[10px] rounded border ${metric === 'temp' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-transparent text-white/50 border-white/10'}`}>Temp</button>
            <button onClick={() => setMetric('ph')} className={`px-2 py-1 text-[10px] rounded border ${metric === 'ph' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-transparent text-white/50 border-white/10'}`}>pH</button>
            <button onClick={() => setMetric('do')} className={`px-2 py-1 text-[10px] rounded border ${metric === 'do' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-transparent text-white/50 border-white/10'}`}>DO</button>
         </div>
      </div>
      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="time" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#15151A', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey={metric} 
              stroke={metric === 'temp' ? '#06b6d4' : metric === 'ph' ? '#3b82f6' : '#6366f1'} 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
