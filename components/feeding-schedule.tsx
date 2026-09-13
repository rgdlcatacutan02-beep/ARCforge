"use client";

import { useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Plus, Trash2, Edit2, Check, X, Send, Droplet } from "lucide-react";
import { ProToggle } from "@/components/pro-toggle";

export function FeedingSchedule() {
  const store = useDashboardStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ time: "12:00", amount: 50, enabled: true });

  const handleSave = () => {
    if (isAdding) {
      store.addFeedingSchedule(formData);
      setIsAdding(false);
    } else if (editingId) {
      store.updateFeedingSchedule(editingId, formData);
      setEditingId(null);
    }
    setFormData({ time: "12:00", amount: 50, enabled: true });
  };

  const handleEdit = (sched: any) => {
    setEditingId(sched.id);
    setFormData({ time: sched.time, amount: sched.amount, enabled: sched.enabled });
    setIsAdding(false);
  };

  return (
    <section className={`col-span-1 md:col-span-12 lg:col-span-4 row-span-2 bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col ${store.role !== 'admin' ? 'opacity-70 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
             <Droplet size={16} />
           </div>
           <div>
             <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Auto Feeder</h3>
             <div className="text-[10px] text-white/50 font-mono mt-1">STATUS: {store.feederStatus}</div>
           </div>
        </div>
        <button 
           onClick={() => {
             store.setKey('feederStatus', 'DISPENSING');
             setTimeout(() => store.setKey('feederStatus', 'IDLE'), 3000);
           }}
           className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-400 px-3 py-1.5 flex items-center justify-center gap-1 rounded text-xs font-bold transition-all">
           <Send size={12} /> FEED NOW
        </button>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-semibold text-white/60">Daily Schedule</div>
          {store.role === 'admin' && !isAdding && !editingId && (
            <button 
              onClick={() => { setIsAdding(true); setFormData({ time: "12:00", amount: 50, enabled: true }); setEditingId(null); }}
              className="text-cyan-400 hover:text-cyan-300 p-1 flex items-center gap-1 rounded transition-colors text-xs font-bold"
            >
              <Plus size={12} /> ADD
            </button>
          )}
        </div>
        
        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
          {store.feedingSchedule.map((sched, idx) => (
            <div key={sched.id || `sched-${idx}`} className="flex flex-col bg-white/5 border border-white/5 rounded-lg p-2 group">
              {(editingId && editingId === sched.id) ? (
                <div className="flex gap-2 items-center">
                  <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="bg-black/50 border border-white/10 rounded p-1 text-xs text-white outline-none w-[70px]" />
                  <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="bg-black/50 border border-white/10 rounded p-1 text-xs text-white outline-none w-[50px]" />
                  <span className="text-xs text-white/40">g</span>
                  <div className="flex ml-auto gap-1">
                    <button onClick={handleSave} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Check size={14} /></button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-400 text-sm font-bold">{sched.time}</span>
                    <span className="text-xs text-white/70">{sched.amount}g</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {store.role === 'admin' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(sched)} className="p-1 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => store.deleteFeedingSchedule(sched.id)} className="p-1 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                    <ProToggle 
                      value={sched.enabled} 
                      onChange={() => {
                        store.updateFeedingSchedule(sched.id, { enabled: !sched.enabled });
                      }} 
                      colorClass="cyan" 
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAdding && (
             <div className="flex gap-2 items-center bg-white/5 border border-cyan-500/50 rounded-lg p-2">
                <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="bg-black/50 border border-white/10 rounded p-1 text-xs text-white outline-none w-[70px]" />
                <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="bg-black/50 border border-white/10 rounded p-1 text-xs text-white outline-none w-[50px]" />
                <span className="text-xs text-white/40">g</span>
                <div className="flex ml-auto gap-1">
                  <button onClick={handleSave} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Check size={14} /></button>
                  <button onClick={() => setIsAdding(false)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><X size={14} /></button>
                </div>
             </div>
          )}

          {store.feedingSchedule.length === 0 && !isAdding && (
            <div className="text-center py-4 text-white/40 text-xs">No feeding schedules.</div>
          )}
        </div>
      </div>
    </section>
  );
}
