import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';

export interface SystemContact {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export interface CameraConfig {
  id: string;
  name: string;
  location: string;
  streamUrl: string;
  status: 'online' | 'offline';
  enabled: boolean;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  subsystem: 'Water Quality' | 'Power & Solar' | 'Pumps & Aeration' | 'Master Gateway' | 'Feeder';
  title: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  parameter: 'temperature' | 'waterPh' | 'dissolvedOxygen' | 'turbidity' | 'batterySoc';
  operator: '>' | '<' | '>=';
  threshold: number;
  unit: string;
  targetActuator: 'aerator' | 'mainPump' | 'heater' | 'feeder' | 'powerSaving';
  action: 'ACTIVATE' | 'DEACTIVATE' | 'LOCKOUT';
  enabled: boolean;
  lastTriggered?: string;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  ruleName: string;
  triggerReason: string;
  actionTaken: string;
  status: 'EXECUTED' | 'OVERRIDDEN' | 'FAILED';
}

interface DashboardState {
  solarGeneration: number;
  batterySoc: number;
  batteryVoltage: number;
  batteryTemp: number;
  batteryStatus: string;
  dissolvedOxygen: number;
  waterPh: number;
  temperature: number;
  turbidity: number;
  
  cameras: CameraConfig[];
  
  pumpAStatus: boolean;
  aeratorStatus: boolean;
  thermalStatus: boolean;
  smsActive: boolean;
  alerts: {
    sensorMalfunction: boolean;
    powerInterruption: boolean;
    pumpFailure: boolean;
    waterQuality: boolean;
  };
  systemAlerts: SystemAlert[];
  automationRules: AutomationRule[];
  automationLogs: AutomationLog[];
  
  feedingSchedule: { id: string; time: string; amount: number; enabled: boolean }[];
  feederStatus: string;
  role: 'admin' | 'viewer';
  projectName: string;
  projectIcon: string;
  projectLogoUrl: string;
  contacts: SystemContact[];
  
  user: User | null;
  authInitialized: boolean;
  selectedSensorPanel: string | null;

  setKey: (key: keyof DashboardState, value: any) => void;
  setSelectedSensorPanel: (sensorId: string | null) => void;
  setAlert: (key: keyof DashboardState['alerts'], value: boolean) => void;
  addContact: (contact: Omit<SystemContact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<SystemContact>) => void;
  deleteContact: (id: string) => void;
  
  // Alert actions
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  clearResolvedAlerts: () => void;
  addAlert: (alert: Omit<SystemAlert, 'id' | 'timestamp' | 'status'>) => void;

  // Automation actions
  toggleAutomationRule: (id: string) => void;
  updateAutomationRule: (id: string, updates: Partial<AutomationRule>) => void;
  addAutomationLog: (log: Omit<AutomationLog, 'id' | 'timestamp'>) => void;

  // Camera actions
  addCamera: (camera: Omit<CameraConfig, 'id'>) => void;
  updateCamera: (id: string, updates: Partial<CameraConfig>) => void;
  deleteCamera: (id: string) => void;
  setCameras: (cameras: CameraConfig[]) => void;
  
  // Feeding actions
  addFeedingSchedule: (schedule: { time: string; amount: number; enabled: boolean }) => void;
  updateFeedingSchedule: (id: string, updates: Partial<{ time: string; amount: number; enabled: boolean }>) => void;
  deleteFeedingSchedule: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      solarGeneration: 142.8,
      batterySoc: 82,
      batteryVoltage: 25.62,
      batteryTemp: 28.4,
      batteryStatus: 'CHARGING',
      dissolvedOxygen: 6.82,
      waterPh: 7.14,
      temperature: 24.5,
      turbidity: 3.2,
      cameras: [
        {
          id: '1',
          name: 'NODE-CAM-01',
          location: 'REAR TANK',
          streamUrl: '',
          status: 'online',
          enabled: true
        }
      ],
      pumpAStatus: true,
      aeratorStatus: false,
      thermalStatus: false,
      smsActive: true,
      role: 'admin',
      projectName: 'ARCforge',
      projectIcon: '💧',
      projectLogoUrl: '',
      contacts: [
        { id: '1', name: 'Primary Admin', phone: '(555) 019-2834', role: 'admin' }
      ],
      systemAlerts: [
        {
          id: 'alt-01',
          timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          severity: 'warning',
          subsystem: 'Water Quality',
          title: 'Elevated Turbidity Detected',
          message: 'Turbidity spiked to 4.8 NTU in Grow Tank Alpha. Biofilter flow rate verified.',
          status: 'active'
        },
        {
          id: 'alt-02',
          timestamp: new Date(Date.now() - 1000 * 60 * 54).toISOString(),
          severity: 'info',
          subsystem: 'Power & Solar',
          title: 'MPPT Peak Absorption Mode',
          message: 'Solar generation peaked above 150W. Battery absorption stage initiated at 25.6V.',
          status: 'active'
        },
        {
          id: 'alt-03',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          severity: 'critical',
          subsystem: 'Pumps & Aeration',
          title: 'Night Aeration Threshold Triggered',
          message: 'Dissolved Oxygen dipped below 5.2 mg/L at 03:00. Backup aerator unit engaged automatically.',
          status: 'resolved'
        }
      ],
      automationRules: [
        {
          id: 'rule-01',
          name: 'Critical Dissolved Oxygen Defense',
          description: 'Automatically engage Aerator Unit 01 when DO levels fall below safe threshold.',
          parameter: 'dissolvedOxygen',
          operator: '<',
          threshold: 4.5,
          unit: 'mg/L',
          targetActuator: 'aerator',
          action: 'ACTIVATE',
          enabled: true,
          lastTriggered: '1 hour ago'
        },
        {
          id: 'rule-02',
          name: 'High Water Temperature Aeration Booster',
          description: 'Accelerate aeration to increase gas exchange when summer pond temperature exceeds 28°C.',
          parameter: 'temperature',
          operator: '>',
          threshold: 28.0,
          unit: '°C',
          targetActuator: 'aerator',
          action: 'ACTIVATE',
          enabled: true,
          lastTriggered: 'Yesterday'
        },
        {
          id: 'rule-03',
          name: 'Thermal Regulation Sub-cooling Protection',
          description: 'Engage thermal regulator heating loop when water drops below optimal crayfish nursery range.',
          parameter: 'temperature',
          operator: '<',
          threshold: 21.0,
          unit: '°C',
          targetActuator: 'heater',
          action: 'ACTIVATE',
          enabled: false,
          lastTriggered: 'Never'
        },
        {
          id: 'rule-04',
          name: 'Battery Deep Discharge Protection',
          description: 'Shed non-critical recirculating pumps when battery SOC drops below 20% to safeguard gateway monitoring.',
          parameter: 'batterySoc',
          operator: '<',
          threshold: 20,
          unit: '%',
          targetActuator: 'powerSaving',
          action: 'ACTIVATE',
          enabled: true,
          lastTriggered: '3 days ago'
        }
      ],
      automationLogs: [
        {
          id: 'log-01',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          ruleName: 'Critical Dissolved Oxygen Defense',
          triggerReason: 'DO measured 4.48 mg/L (< 4.5 mg/L threshold)',
          actionTaken: 'Aerator Unit 01 switched to HIGH (100% duty cycle)',
          status: 'EXECUTED'
        },
        {
          id: 'log-02',
          timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
          ruleName: 'Turbidity Regulation Routine',
          triggerReason: 'Turbidity 4.2 NTU checked against nominal profile',
          actionTaken: 'Filter backwash duration scheduled for midnight',
          status: 'EXECUTED'
        },
        {
          id: 'log-03',
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          ruleName: 'Manual Operator Intervention',
          triggerReason: 'Main Pump A toggled via Dashboard UI override',
          actionTaken: 'Relay 01 manually engaged by Admin Root',
          status: 'OVERRIDDEN'
        }
      ],
      user: null,
      authInitialized: false,
      selectedSensorPanel: null,
      feedingSchedule: [
        { id: '1', time: '08:00', amount: 50, enabled: true },
        { id: '2', time: '18:00', amount: 50, enabled: true }
      ],
      feederStatus: 'IDLE',
      alerts: {
        sensorMalfunction: true,
        powerInterruption: true,
        pumpFailure: true,
        waterQuality: false,
      },
      setSelectedSensorPanel: (sensorId) => set((state) => ({ ...state, selectedSensorPanel: sensorId })),
      setKey: (key, value) => set((state) => ({ ...state, [key]: value })),
      setAlert: (key, value) => set((state) => ({ 
        ...state,
        alerts: { ...state.alerts, [key]: value } 
      })),
      addContact: (contact) => set((state) => ({
        ...state,
        contacts: [...state.contacts, { ...contact, id: Math.random().toString(36).substring(2, 9) }]
      })),
      updateContact: (id, updates) => set((state) => ({
        ...state,
        contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c))
      })),
      deleteContact: (id) => set((state) => ({
        ...state,
        contacts: state.contacts.filter((c) => c.id !== id)
      })),

      // Alert actions
      acknowledgeAlert: (id) => set((state) => ({
        ...state,
        systemAlerts: state.systemAlerts.map(a => a.id === id ? { ...a, status: 'acknowledged' as const } : a)
      })),
      resolveAlert: (id) => set((state) => ({
        ...state,
        systemAlerts: state.systemAlerts.map(a => a.id === id ? { ...a, status: 'resolved' as const } : a)
      })),
      clearResolvedAlerts: () => set((state) => ({
        ...state,
        systemAlerts: state.systemAlerts.filter(a => a.status !== 'resolved')
      })),
      addAlert: (alert) => set((state) => ({
        ...state,
        systemAlerts: [
          {
            ...alert,
            id: `alt-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toISOString(),
            status: 'active'
          },
          ...state.systemAlerts
        ]
      })),

      // Automation actions
      toggleAutomationRule: (id) => set((state) => ({
        ...state,
        automationRules: state.automationRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
      })),
      updateAutomationRule: (id, updates) => set((state) => ({
        ...state,
        automationRules: state.automationRules.map(r => r.id === id ? { ...r, ...updates } : r)
      })),
      addAutomationLog: (log) => set((state) => ({
        ...state,
        automationLogs: [
          {
            ...log,
            id: `log-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toISOString()
          },
          ...state.automationLogs.slice(0, 49)
        ]
      })),

      addCamera: (camera) => set((state) => ({
        ...state,
        cameras: [...state.cameras, { ...camera, id: Math.random().toString(36).substring(2, 9) }]
      })),
      updateCamera: (id, updates) => set((state) => ({
        ...state,
        cameras: state.cameras.map((c) => (c.id === id ? { ...c, ...updates } : c))
      })),
      deleteCamera: (id) => set((state) => ({
        ...state,
        cameras: state.cameras.filter((c) => c.id !== id)
      })),
      setCameras: (cameras) => set((state) => ({
        ...state,
        cameras
      })),
      addFeedingSchedule: (schedule) => set((state) => ({
        ...state,
        feedingSchedule: [...state.feedingSchedule, { ...schedule, id: Math.random().toString(36).substring(2, 9) }].sort((a, b) => a.time.localeCompare(b.time))
      })),
      updateFeedingSchedule: (id, updates) => set((state) => ({
        ...state,
        feedingSchedule: state.feedingSchedule.map((s) => (s.id === id ? { ...s, ...updates } : s)).sort((a, b) => a.time.localeCompare(b.time))
      })),
      deleteFeedingSchedule: (id) => set((state) => ({
        ...state,
        feedingSchedule: state.feedingSchedule.filter((s) => s.id !== id)
      })),
    }),
    {
      name: 'dashboard-storage',
      version: 3,
      migrate: (persistedState: any) => {
        if (persistedState) {
          if (persistedState.projectName === 'AquaForge AI' || !persistedState.projectName) {
            persistedState.projectName = 'ARCforge';
          }
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state && (state.projectName === 'AquaForge AI' || !state.projectName)) {
          state.projectName = 'ARCforge';
        }
      },
      partialize: (state) => ({
        projectName: state.projectName,
        projectIcon: state.projectIcon,
        projectLogoUrl: state.projectLogoUrl,
        contacts: state.contacts,
        cameras: state.cameras,
        smsActive: state.smsActive,
        pumpAStatus: state.pumpAStatus,
        aeratorStatus: state.aeratorStatus,
        thermalStatus: state.thermalStatus,
        feedingSchedule: state.feedingSchedule,
        alerts: state.alerts,
        systemAlerts: state.systemAlerts,
        automationRules: state.automationRules,
        role: state.role
      }),
    }
  )
);


