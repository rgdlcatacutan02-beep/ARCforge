"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { VideoOff, Maximize2, Camera } from "lucide-react";
import { EditableValue } from "@/components/editable-value";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export function DashboardCameras() {
  const store = useDashboardStore();
  const [activeCamIndex, setActiveCamIndex] = useState(0);

  if (!store.cameras || store.cameras.length === 0) {
    return (
      <section className="col-span-1 md:col-span-12 lg:col-span-8 row-span-4 bg-[#15151A] rounded-xl border border-white/10 relative overflow-hidden group min-h-[400px] flex flex-col justify-center items-center">
        <VideoOff size={48} className="text-white/20 mb-4" />
        <p className="text-white/40 text-sm">No cameras configured.</p>
      </section>
    );
  }

  // Ensure index is within bounds if cameras are removed
  const safeIndex = activeCamIndex >= store.cameras.length ? Math.max(0, store.cameras.length - 1) : activeCamIndex;
  const activeCam = store.cameras[safeIndex];

  return (
    <section className="col-span-1 md:col-span-12 lg:col-span-8 row-span-4 bg-[#15151A] rounded-xl border border-white/10 relative overflow-hidden group min-h-[400px] flex flex-col">
      {/* Main Camera View */}
      <div className="flex-1 relative bg-black flex flex-col">
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 text-white ${activeCam.status === 'online' ? 'bg-red-600 animate-pulse' : 'bg-gray-600'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${activeCam.status === 'online' ? 'bg-white' : 'bg-gray-300'}`}></div> {activeCam.status === 'online' ? 'LIVE' : 'OFFLINE'}
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] border border-white/10 text-white flex gap-2 items-center">
            <EditableValue disabled={store.role !== 'admin'} type="text" value={activeCam.name} onChange={(v) => store.updateCamera(activeCam.id, { name: v })} />
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20">
          <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-white/60 tracking-widest border border-white/10 flex items-center gap-2">
            URL: <EditableValue disabled={store.role !== 'admin'} type="text" value={activeCam.streamUrl} onChange={(v) => store.updateCamera(activeCam.id, { streamUrl: v })} className="w-[100px] truncate block text-cyan-400 font-bold" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCam.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full absolute inset-0 flex items-center justify-center bg-cover bg-center" 
            style={{ backgroundImage: activeCam.streamUrl && activeCam.enabled ? `url(${activeCam.streamUrl})` : 'none' }}
          >
            {(!activeCam.streamUrl || !activeCam.enabled) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 to-transparent pointer-events-none"></div>
                
                <motion.div
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-6 relative z-10"
                >
                  <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full scale-150"></div>
                  <VideoOff size={64} strokeWidth={1} className="text-cyan-400/60 relative z-10" />
                </motion.div>
                
                <div className="text-cyan-400/80 font-mono tracking-[0.3em] text-sm uppercase relative z-10 shadow-black drop-shadow-md">Awaiting Video Feed</div>
                <div className="text-cyan-400/40 font-mono text-[10px] mt-3 tracking-widest uppercase relative z-10 flex gap-2 items-center">
                  <span>System Standby // </span>
                  <span className="truncate border-b border-cyan-400/20 border-dashed pb-0.5">
                    {activeCam.name}
                  </span>
                </div>
                
                {/* Scanning line effect */}
                <motion.div
                  className="absolute left-0 right-0 h-[1px] bg-cyan-400/30 blur-[1px] z-10"
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute left-0 right-0 h-[50px] bg-gradient-to-b from-transparent to-cyan-500/5 blur-[2px] z-10 pointer-events-none"
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none"></div>
        
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">Crayfish Activity Monitor</h3>
              <p className="text-xs text-white/40 font-mono mt-1">{activeCam.location}</p>
            </div>
            <div className="flex gap-2 text-white shrink-0">
               <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/10 transition-colors backdrop-blur-sm text-sm sm:text-base cursor-pointer pointer-events-auto">
                 <Camera size={16} />
               </button>
               <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/10 transition-colors backdrop-blur-sm text-sm sm:text-base cursor-pointer pointer-events-auto">
                 <Maximize2 size={16} />
               </button>
            </div>
          </div>
          
          {/* Camera Selection Thumbnail Bar */}
          {store.cameras.length > 1 && (
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 pointer-events-auto">
              {store.cameras.map((cam, idx) => (
                <button
                  key={cam.id}
                  onClick={() => setActiveCamIndex(idx)}
                  className={`relative shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-all ${idx === safeIndex ? 'border-cyan-500 scale-100 opacity-100' : 'border-white/10 scale-95 opacity-50 hover:opacity-100 hover:border-white/30'}`}
                >
                  {cam.streamUrl && cam.enabled ? (
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${cam.streamUrl})` }} />
                  ) : (
                    <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                      <VideoOff size={16} className="text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1">
                    <div className="text-[8px] font-bold text-white truncate text-center">{cam.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
