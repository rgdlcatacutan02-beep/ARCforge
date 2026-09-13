"use client";

import { useDashboardStore, CameraConfig } from "@/store/useDashboardStore";
import { useState } from "react";
import { VideoOff, Plus, Trash2, Edit2, Settings, Wifi, WifiOff } from "lucide-react";
import { motion } from "motion/react";

export default function LiveNodesPage() {
  const store = useDashboardStore();
  const [editingCamera, setEditingCamera] = useState<CameraConfig | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState<Partial<CameraConfig>>({});

  const handleSave = async () => {
    if (isAdding) {
      // Optimistic update
      const tempId = Math.random().toString(36).substring(2, 9);
      store.addCamera({
        name: formData.name || 'New Camera',
        location: formData.location || 'Unknown',
        streamUrl: formData.streamUrl || '',
        status: 'online',
        enabled: true
      });
      
      setIsAdding(false);
      
      // Actual API call
      try {
        await fetch('/api/cameras', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name || 'New Camera',
            location: formData.location || 'Unknown',
            streamUrl: formData.streamUrl || '',
            status: 'online',
            enabled: true
          }),
        });
      } catch (err) {
        console.error('Failed to add camera:', err);
      }
    } else if (editingCamera) {
      // Optimistic update
      store.updateCamera(editingCamera.id, formData);
      
      const idToUpdate = editingCamera.id;
      setEditingCamera(null);
      
      // Actual API call
      try {
        await fetch(`/api/cameras/${idToUpdate}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } catch (err) {
        console.error('Failed to update camera:', err);
      }
    }
    setFormData({});
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    store.deleteCamera(id);
    
    // Actual API call
    try {
      await fetch(`/api/cameras/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete camera:', err);
    }
  };

  const handleEdit = (cam: CameraConfig) => {
    setEditingCamera(cam);
    setFormData({ ...cam });
  };

  return (
    <div className="flex flex-col gap-6 p-1 md:p-4 max-w-7xl mx-auto h-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-cyan-500">⦿</span> Live Camera Matrix
          </h1>
          <p className="text-white/50 text-sm mt-1">Monitor multi-node real-time video streams</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setFormData({ name: '', location: '', streamUrl: '' }); setEditingCamera(null); }}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-sm flex items-center gap-2 transition-colors border border-cyan-400/50"
        >
          <Plus size={16} /> Add Camera
        </button>
      </div>

      {(isAdding || editingCamera) && (
        <div className="bg-[#15151A] rounded-xl border border-white/10 p-5 mb-4">
          <div className="flex justify-between flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-[10px] uppercase font-bold text-white/50">Camera Name</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="e.g. Node-Cam-02" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-[10px] uppercase font-bold text-white/50">Location</label>
              <input type="text" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} className="bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none focus:border-cyan-500" placeholder="e.g. Grow Tank B" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[300px]">
              <label className="text-[10px] uppercase font-bold text-white/50">Stream URL (MJPEG / IP)</label>
              <input type="text" value={formData.streamUrl || ''} onChange={e => setFormData({ ...formData, streamUrl: e.target.value })} className="bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none focus:border-cyan-500 font-mono" placeholder="http://192.168.1.x:81/stream" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setIsAdding(false); setEditingCamera(null); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-sm transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm transition-colors font-bold">Save Node</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {store.cameras.map(cam => (
          <div key={cam.id} className="bg-[#15151A] rounded-xl border border-white/10 overflow-hidden flex flex-col group h-[300px] relative">
            <div className="absolute top-3 left-3 z-10 flex gap-2">
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 text-white ${cam.status === 'online' ? 'bg-red-600 animate-pulse' : 'bg-gray-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${cam.status === 'online' ? 'bg-white' : 'bg-gray-300'}`}></div> {cam.status === 'online' ? 'LIVE' : 'OFFLINE'}
              </div>
            </div>
            
            <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(cam)} className="w-8 h-8 bg-black/60 backdrop-blur-md rounded border border-white/10 text-white flex items-center justify-center hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(cam.id)} className="w-8 h-8 bg-black/60 backdrop-blur-md rounded border border-white/10 text-white flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
               {cam.streamUrl && cam.enabled ? (
                 <>
                   <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${cam.streamUrl})` }} />
                 </>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
                    <VideoOff size={32} strokeWidth={1} className="text-white/20 mb-2 relative z-10" />
                    <span className="text-white/30 text-xs font-mono tracking-wider relative z-10">NO SIGNAL</span>
                 </div>
               )}
            </div>
            <div className="p-3 bg-[#0A0A0B] border-t border-white/10 flex justify-between items-center z-10 shrink-0">
               <div>
                  <div className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">{cam.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1 mt-0.5">
                    <Wifi size={10} /> {cam.location}
                  </div>
               </div>
               <div className="text-[10px] text-white/30 font-mono truncate max-w-[100px]">{cam.streamUrl || 'Unconfigured'}</div>
            </div>
          </div>
        ))}

        {store.cameras.length === 0 && (
          <div className="col-span-full bg-[#15151A] rounded-xl border border-white/10 p-12 flex flex-col items-center justify-center text-center">
            <VideoOff size={48} className="text-white/10 mb-4" />
            <h3 className="text-white font-semibold mb-2">No Cameras Found</h3>
            <p className="text-white/40 text-sm max-w-sm mb-6">There are no cameras configured in the system. Add your first edge node to begin live monitoring.</p>
            <button 
              onClick={() => { setIsAdding(true); setFormData({ name: '', location: '', streamUrl: '' }); setEditingCamera(null); }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg text-sm transition-colors border border-white/10"
            >
              Add Camera Node
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
