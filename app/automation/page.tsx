"use client";

import { useDashboardStore, AutomationRule } from "@/store/useDashboardStore";
import { useState } from "react";
import { 
  Settings2, 
  Cpu, 
  Zap, 
  Play, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  ShieldAlert, 
  Droplet,
  Power,
  RotateCw,
  Plus
} from "lucide-react";
import { ProToggle } from "@/components/pro-toggle";
import { motion, AnimatePresence } from "motion/react";

export default function AutomationPage() {
  const store = useDashboardStore();
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [showKillSwitchConfirm, setShowKillSwitchConfirm] = useState(false);
  const [testActionMessage, setTestActionMessage] = useState<string | null>(null);

  const rules = store.automationRules || [];
  const logs = store.automationLogs || [];

  const handleToggleRule = (id: string) => {
    store.toggleAutomationRule(id);
  };

  const handleExecuteManualAction = (actionName: string, actuator: string) => {
    store.addAutomationLog({
      ruleName: 'Manual Operator Directive',
      triggerReason: `Operator initiated test trigger: ${actionName}`,
      actionTaken: `${actuator} command dispatched successfully`,
      status: 'EXECUTED'
    });

    setTestActionMessage(`Dispatched: ${actionName} (${actuator})`);
    setTimeout(() => setTestActionMessage(null), 3000);
  };

  const handleEmergencyKillSwitch = () => {
    store.setKey('pumpAStatus', false);
    store.setKey('aeratorStatus', false);
    store.setKey('thermalStatus', false);
    
    store.addAutomationLog({
      ruleName: 'EMERGENCY SHUTDOWN',
      triggerReason: 'Operator initiated hardware master kill-switch',
      actionTaken: 'ALL AC/DC ACTUATOR RELAYS DE-ENERGIZED',
      status: 'OVERRIDDEN'
    });

    store.addAlert({
      severity: 'critical',
      subsystem: 'Pumps & Aeration',
      title: 'Emergency Master Shutdown Executed',
      message: 'All pumps, aerators, and heating elements were forced offline via manual kill-switch.'
    });

    setShowKillSwitchConfirm(false);
  };

  return (
    <div className="col-span-1 md:col-span-12 flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Cpu size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Automation Engine & Edge Logic</h1>
              <p className="text-white/40 text-xs">Autonomous fail-safe closed-loop regulation routines running on edge Raspberry Pi</p>
            </div>
          </div>
        </div>

        {/* Emergency Kill Switch Modal Trigger */}
        <div className="flex items-center gap-3">
          {testActionMessage && (
            <span className="text-xs font-mono text-green-400 bg-green-950/40 border border-green-500/30 px-3 py-1.5 rounded-lg animate-fade-in">
              {testActionMessage}
            </span>
          )}

          {store.role === 'admin' && (
            <button
              onClick={() => setShowKillSwitchConfirm(true)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <AlertOctagon size={16} /> Emergency Kill Switch
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Kill Switch */}
      <AnimatePresence>
        {showKillSwitchConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#15151A] border border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-950/40"
            >
              <div className="flex items-center gap-3 text-red-400 mb-3">
                <AlertOctagon size={28} />
                <h3 className="text-lg font-bold text-white">Execute Emergency Shutdown?</h3>
              </div>
              <p className="text-xs text-white/60 leading-relaxed mb-6">
                This command immediately cuts power to Main Pump A, Aerator Unit 01, and Thermal Regulation loops across all tanks. Use in case of electrical malfunction or biofilter breach.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowKillSwitchConfirm(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmergencyKillSwitch}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                >
                  Confirm Shutdown
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-[#15151A] rounded-xl border p-5 transition-all flex flex-col justify-between ${
              rule.enabled 
                ? 'border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]' 
                : 'border-white/10 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rule.enabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/40'}`}>
                    <Cpu size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">{rule.name}</h3>
                </div>
                
                <ProToggle
                  value={rule.enabled}
                  onChange={() => handleToggleRule(rule.id)}
                  colorClass="cyan"
                />
              </div>

              <p className="text-xs text-white/50 leading-relaxed mb-4">{rule.description}</p>

              {/* Logic Condition Badge */}
              <div className="bg-[#0A0A0B] p-3 rounded-lg border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-white/70">
                  <span className="text-indigo-400 font-bold">IF</span>
                  <span className="text-white capitalize">{rule.parameter}</span>
                  <span className="text-cyan-400 font-bold">{rule.operator}</span>
                  <span className="text-white font-bold">{rule.threshold} {rule.unit}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70">
                  <span className="text-green-400 font-bold">THEN</span>
                  <span className="text-green-300 font-semibold">{rule.action}</span>
                  <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-white/50 uppercase">{rule.targetActuator}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/40 border-t border-white/5 pt-3 mt-4">
              <span className="flex items-center gap-1">
                <Clock size={12} /> Last triggered: {rule.lastTriggered || 'Never'}
              </span>
              <span className={`font-mono font-semibold ${rule.enabled ? 'text-green-400' : 'text-white/30'}`}>
                {rule.enabled ? 'EDGE LOGIC ARMED' : 'STANDBY'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Actuator Diagnostics */}
      <div className="bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="text-cyan-400" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Manual Actuator Relay Override Tests</h3>
          </div>
          <span className="text-[10px] font-mono text-white/40">ADMIN ACCESS ONLY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleExecuteManualAction('Pulse Aerator Unit for 30s', 'Aerator Unit 01')}
            disabled={store.role !== 'admin'}
            className="p-3 bg-[#0A0A0B] hover:bg-white/5 border border-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-left transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Pulse Aerator</span>
              <Play size={12} className="text-cyan-400" />
            </div>
            <p className="text-[10px] text-white/40">Force 30s high-velocity oxygenation cycle</p>
          </button>

          <button
            onClick={() => handleExecuteManualAction('Trigger Auto Feeder Pulse', 'Auto Feeder Servo')}
            disabled={store.role !== 'admin'}
            className="p-3 bg-[#0A0A0B] hover:bg-white/5 border border-green-500/20 hover:border-green-500/50 rounded-lg text-left transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-green-400 transition-colors">Dispense Feed (25g)</span>
              <Droplet size={12} className="text-green-400" />
            </div>
            <p className="text-[10px] text-white/40">Rotate feeder auger for 4 revolutions</p>
          </button>

          <button
            onClick={() => handleExecuteManualAction('Cycle Recirculating Main Pump', 'Main Pump A')}
            disabled={store.role !== 'admin'}
            className="p-3 bg-[#0A0A0B] hover:bg-white/5 border border-blue-500/20 hover:border-blue-500/50 rounded-lg text-left transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Cycle Main Pump</span>
              <RotateCw size={12} className="text-blue-400" />
            </div>
            <p className="text-[10px] text-white/40">Restart submersible pump relay</p>
          </button>

          <button
            onClick={() => handleExecuteManualAction('Toggle Heating Loop Relay', 'Thermal Reg Heater')}
            disabled={store.role !== 'admin'}
            className="p-3 bg-[#0A0A0B] hover:bg-white/5 border border-orange-500/20 hover:border-orange-500/50 rounded-lg text-left transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">Test Heater Relay</span>
              <Zap size={12} className="text-orange-400" />
            </div>
            <p className="text-[10px] text-white/40">Check 24V DC inline heating element</p>
          </button>
        </div>
      </div>

      {/* Real-time Execution Log */}
      <div className="bg-[#15151A] rounded-xl border border-white/10 p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="text-cyan-400" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Automation Execution Register</h3>
          </div>
          <span className="text-[10px] font-mono text-white/40">{logs.length} logged events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/70">
            <thead className="text-[10px] text-white/40 uppercase font-bold border-b border-white/10">
              <tr>
                <th className="pb-3 pr-4">Timestamp</th>
                <th className="pb-3 pr-4">Rule / Source</th>
                <th className="pb-3 pr-4">Trigger Cause</th>
                <th className="pb-3 pr-4">Action Taken</th>
                <th className="pb-3 pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4 font-mono text-white/40 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-white">{log.ruleName}</td>
                  <td className="py-3 pr-4 text-white/60 font-mono text-[11px]">{log.triggerReason}</td>
                  <td className="py-3 pr-4 text-cyan-400 font-mono text-[11px]">{log.actionTaken}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.status === 'EXECUTED' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : log.status === 'OVERRIDDEN'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
