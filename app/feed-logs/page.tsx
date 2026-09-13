"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useState } from "react";
import { Calendar, Filter, Droplet } from "lucide-react";

export default function FeedLogsPage() {
  const store = useDashboardStore();
  
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // In a real app, this data would come from the backend or Firestore
  // We'll mock it based on the schedules, assuming they ran for the past few days.
  const [logs] = useState(() => {
    const mockLogs = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        // generate two logs per day to match default schedule
        mockLogs.push({
            id: `log-${i}-1`,
            date: d.toISOString().split("T")[0],
            time: "08:00",
            amount: 50,
            enabled: true,
            status: "Success",
        });
        mockLogs.push({
            id: `log-${i}-2`,
            date: d.toISOString().split("T")[0],
            time: "18:00",
            amount: 50,
            enabled: true,
            status: "Success",
        });
    }
    return mockLogs;
  });

  const filteredLogs = logs.filter(log => {
      let pass = true;
      if (startDate && log.date < startDate) pass = false;
      if (endDate && log.date > endDate) pass = false;
      return pass;
  });

  return (
    <div className="flex flex-col gap-6 p-1 md:p-4 max-w-5xl mx-auto h-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Droplet className="text-cyan-400" /> Feeding Logs
          </h1>
          <p className="text-white/50 text-sm mt-1">Review historical feeder activity and schedules</p>
        </div>
      </div>

      <div className="bg-[#15151A] rounded-xl border border-white/10 p-5">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full border-b border-white/10 pb-5 mb-5">
            <div className="flex items-center gap-2 text-white/70 bg-[#0A0A0B] p-2 rounded-lg border border-white/5 flex-1 w-full sm:w-auto">
                <Calendar size={16} className="text-white/40" />
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-sm w-full outline-none focus:text-white"
                />
            </div>
            <span className="text-white/30 hidden sm:block">to</span>
            <div className="flex items-center gap-2 text-white/70 bg-[#0A0A0B] p-2 rounded-lg border border-white/5 flex-1 w-full sm:w-auto">
                <Calendar size={16} className="text-white/40" />
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-sm w-full outline-none focus:text-white"
                />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="text-xs text-white/50 hover:text-white mt-2 sm:mt-0 px-3 py-2 bg-white/5 rounded-lg whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
                <thead className="text-xs text-white/40 uppercase font-bold border-b border-white/10">
                    <tr>
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Scheduled Time</th>
                        <th className="pb-3 pr-4">Amount (g)</th>
                        <th className="pb-3 pr-4 text-center">Enabled</th>
                        <th className="pb-3 pr-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 pr-4 font-mono">{log.date}</td>
                            <td className="py-3 pr-4 font-mono">{log.time}</td>
                            <td className="py-3 pr-4">{log.amount}g</td>
                            <td className="py-3 pr-4 text-center">
                                {log.enabled ? (
                                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Yes</span>
                                ) : (
                                    <span className="bg-white/5 text-white/40 border border-white/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold">No</span>
                                )}
                            </td>
                            <td className="py-3 pr-4">
                               <span className={`text-xs font-semibold ${log.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>
                                  {log.status}
                               </span>
                            </td>
                        </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-white/40">
                                No feeding logs found for the selected date range.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
