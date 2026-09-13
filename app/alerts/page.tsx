"use client";

import { useDashboardStore, SystemAlert } from "@/store/useDashboardStore";
import { useState } from "react";
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Filter, 
  Clock, 
  Check, 
  Trash2, 
  Plus, 
  ExternalLink,
  Zap,
  Activity,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

export default function AlertsPage() {
  const store = useDashboardStore();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('all');

  const alerts = store.systemAlerts || [];

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && a.status !== 'resolved').length;

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    if (selectedSubsystem !== 'all' && alert.subsystem !== selectedSubsystem) return false;
    return true;
  });

  const handleCreateMockAlert = () => {
    store.addAlert({
      severity: 'warning',
      subsystem: 'Water Quality',
      title: 'Real-time pH Fluctuating',
      message: `Automated optical probe registered pH ${store.waterPh.toFixed(2)} outside 6.8 - 7.6 nominal buffer.`
    });
  };

  const getSeverityBadge = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
            <AlertCircle size={10} /> Critical
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle size={10} /> Warning
          </span>
        );
      case 'info':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
            <Activity size={10} /> Info
          </span>
        );
    }
  };

  const getStatusBadge = (status: SystemAlert['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/60 text-red-300 border border-red-600/40 animate-pulse">
            Active
          </span>
        );
      case 'acknowledged':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-950/60 text-yellow-300 border border-yellow-600/40">
            Acknowledged
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-950/60 text-green-400 border border-green-600/40">
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="col-span-1 md:col-span-12 flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">System Alert Center</h1>
              <p className="text-white/40 text-xs">Real-time incident response, threshold breach notifications & SMS logging</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {store.role === 'admin' && (
            <button
              onClick={handleCreateMockAlert}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> Test Alert
            </button>
          )}
          <button
            onClick={() => store.clearResolvedAlerts()}
            className="px-3 py-2 bg-red-950/20 hover:bg-red-900/30 text-red-400 rounded-lg border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={14} /> Clear Resolved
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#15151A] rounded-xl border border-white/10 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Unresolved Alerts</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">{activeCount}</div>
            <div className="text-[10px] text-white/30 mt-0.5">Requiring attention</div>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${activeCount > 0 ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="bg-[#15151A] rounded-xl border border-white/10 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Critical Severity</div>
            <div className="text-2xl font-mono font-bold text-red-400 mt-1">{criticalCount}</div>
            <div className="text-[10px] text-white/30 mt-0.5">Immediate danger to stock</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="bg-[#15151A] rounded-xl border border-white/10 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Warnings Active</div>
            <div className="text-2xl font-mono font-bold text-amber-400 mt-1">{warningCount}</div>
            <div className="text-[10px] text-white/30 mt-0.5">Parameters near boundary</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-[#15151A] rounded-xl border border-white/10 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">SMS Dispatch</div>
            <div className="text-sm font-mono font-bold text-white mt-1.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${store.smsActive ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-400'}`}></span>
              {store.smsActive ? 'ONLINE' : 'MUTED'}
            </div>
            <div className="text-[10px] text-white/30 mt-0.5">{store.contacts.length} recipients active</div>
          </div>
          <Link href="/settings" className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/20 transition-colors">
            <ExternalLink size={18} />
          </Link>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-[#15151A] rounded-xl border border-white/10 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-white/40 text-xs mr-2">
            <Filter size={14} /> Filter:
          </div>
          
          {['all', 'critical', 'warning', 'info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterSeverity === sev 
                  ? 'bg-cyan-600 text-white border border-cyan-400/50' 
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {sev}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>

          {['all', 'active', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterStatus === st 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSubsystem}
            onChange={(e) => setSelectedSubsystem(e.target.value)}
            className="bg-[#0A0A0B] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 outline-none focus:border-cyan-500"
          >
            <option value="all">All Subsystems</option>
            <option value="Water Quality">Water Quality</option>
            <option value="Power & Solar">Power & Solar</option>
            <option value="Pumps & Aeration">Pumps & Aeration</option>
            <option value="Master Gateway">Master Gateway</option>
          </select>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-[#15151A] rounded-xl border p-4 sm:p-5 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  alert.status === 'active' && alert.severity === 'critical' 
                    ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                    : alert.status === 'active' 
                    ? 'border-amber-500/30' 
                    : 'border-white/10 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="mt-1 shrink-0">
                    {alert.severity === 'critical' ? (
                      <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                        <AlertCircle size={18} />
                      </div>
                    ) : alert.severity === 'warning' ? (
                      <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <AlertTriangle size={18} />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                        <Activity size={18} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-[10px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded text-white/50 border border-white/5">
                        {alert.subsystem}
                      </span>
                      {getStatusBadge(alert.status)}
                      <span className="text-[10px] font-mono text-white/30 flex items-center gap-1 ml-auto">
                        <Clock size={10} />
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 truncate">{alert.title}</h3>
                    <p className="text-xs text-white/60 leading-relaxed">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => store.acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== 'resolved' ? (
                    <button
                      onClick={() => store.resolveAlert(alert.id)}
                      className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Check size={14} /> Resolve
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-green-400/60 flex items-center gap-1 px-2 py-1">
                      <CheckCircle2 size={14} /> Solved
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-[#15151A] rounded-xl border border-white/10 p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20 mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-white font-semibold mb-1">No Alerts Matching Criteria</h3>
              <p className="text-white/40 text-xs max-w-sm">
                All monitoring telemetry parameters in your aquaculture system are currently within safe thresholds.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
