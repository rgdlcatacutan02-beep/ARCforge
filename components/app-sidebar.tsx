"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { motion } from "motion/react";

const navItems = [
  { title: "Dashboard", url: "/", icon: "▤", type: "Monitoring" },
  { title: "Live Nodes", url: "/cameras", icon: "⦿", type: "Monitoring" },
  { title: "Energy Hub", url: "/energy", icon: "⚡", type: "Monitoring" },
  { title: "Automation", url: "/automation", icon: "⚙", type: "Operations" },
  { title: "Feeding Logs", url: "/feed-logs", icon: "📋", type: "Operations" },
  { title: "Analytics", url: "/analytics", icon: "📈", type: "Operations" },
  { title: "Alerts", url: "/alerts", icon: "🔔", type: "Operations" },
];

export function AppSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const store = useDashboardStore();

  return (
    <aside className="w-64 border-r border-white/10 flex flex-col bg-[#0F0F12] shrink-0 h-full">
      <div className="p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-gradient-to-br from-cyan-900/40 to-blue-900/40 overflow-hidden"
            animate={{
              boxShadow: ["0px 0px 15px rgba(6,182,212,0.3)", "0px 0px 30px rgba(6,182,212,0.6)", "0px 0px 15px rgba(6,182,212,0.3)"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {store.projectLogoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={store.projectLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <motion.div 
                className="text-lg"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {store.projectIcon || '💧'}
              </motion.div>
            )}
          </motion.div>
          <h1 className="text-xl font-bold tracking-tight text-white line-clamp-1">
            {(!store.projectName || store.projectName === 'AquaForge AI') ? 'ARCforge' : store.projectName}
          </h1>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-white/50 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 mt-4 px-2">Monitoring</div>
        {navItems.filter(i => i.type === 'Monitoring').map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-white/10 text-white border border-white/10 shadow-[inset_2px_0_0_rgba(6,182,212,1)]" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={`text-lg ${isActive ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : ''}`}>{item.icon}</span>
              {item.title}
            </Link>
          );
        })}

        <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 mt-8 px-2">Operations</div>
        {navItems.filter(i => i.type === 'Operations').map((item) => {
          const isActive = pathname === item.url;
          const activeAlertsCount = store.systemAlerts?.filter(a => a.status === 'active').length || 0;
          return (
            <Link
              key={item.title}
              href={item.url}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-white/10 text-white border border-white/10 shadow-[inset_2px_0_0_rgba(6,182,212,1)]" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={`text-lg ${isActive ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : ''}`}>{item.icon}</span>
              {item.title}
              {item.title === 'Alerts' && activeAlertsCount > 0 && (
                <span className="ml-auto min-w-4 h-4 px-1 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-pulse">
                  {activeAlertsCount}
                </span>
              )}
            </Link>
          );
        })}
        {store.role === 'admin' && (
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-1 ${
              pathname === '/settings' 
                ? "bg-white/10 text-white border border-white/10 shadow-[inset_2px_0_0_rgba(6,182,212,1)]" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className={`text-lg ${pathname === '/settings' ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : ''}`}>⛭</span>
            Settings
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="bg-[#15151A] rounded-lg p-3 border border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-xs">
            N
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Master Node Status</div>
            <div className="text-xs font-mono text-green-400 truncate">RPi-4B-GW: ONLINE</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
