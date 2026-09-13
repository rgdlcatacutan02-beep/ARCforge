"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { Save, Copy, Terminal, UserPlus, FileEdit, Trash2, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProToggle } from "@/components/pro-toggle";
import { SystemContact } from "@/store/useDashboardStore";

export default function SettingsPage() {
  const store = useDashboardStore();
  const [localName, setLocalName] = useState(store.projectName);
  const [localIcon, setLocalIcon] = useState(store.projectIcon);
  const [localLogoUrl, setLocalLogoUrl] = useState(store.projectLogoUrl);
  const [copied, setCopied] = useState(false);
  
  // Contact Form State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRole, setContactRole] = useState("admin");

  const startEditContact = (contact: SystemContact) => {
    setEditingContactId(contact.id);
    setContactName(contact.name);
    setContactPhone(contact.phone);
    setContactRole(contact.role);
    setIsAddingContact(false);
  };

  const cancelContactForm = () => {
    setIsAddingContact(false);
    setEditingContactId(null);
    setContactName("");
    setContactPhone("");
    setContactRole("admin");
  };

  const saveContact = () => {
    if (!contactName || !contactPhone) return;

    if (editingContactId) {
      store.updateContact(editingContactId, { name: contactName, phone: contactPhone, role: contactRole });
    } else {
      store.addContact({ name: contactName, phone: contactPhone, role: contactRole });
    }
    cancelContactForm();
  };

  if (store.role !== 'admin') {
    return (
      <div className="col-span-1 md:col-span-12">
        <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
        <div className="bg-[#15151A] rounded-xl border border-white/10 p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-red-500 mb-4 text-4xl">🔒</div>
          <h3 className="text-white font-semibold text-lg mb-2">Access Denied</h3>
          <p className="text-white/40 text-sm max-w-md mx-auto text-center">
            You need Admin privileges to view and edit system settings. Toggle your role in the top header.
          </p>
        </div>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
  const ingestUrl = `${origin}/api/ingest?key=sk_live_938xj290n1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(ingestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLocalLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="col-span-1 md:col-span-12 flex flex-col gap-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">System Settings</h2>
        <p className="text-white/40 text-sm">Configure global project branding and parameters.</p>
      </div>

      <section className="bg-[#15151A] rounded-xl border border-white/10 p-6 flex flex-col max-w-3xl">
        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-4">Branding</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Project Name</label>
                <input 
                  type="text" 
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="bg-[#0A0A0B] text-white w-full px-4 py-2.5 rounded-lg border border-white/10 font-medium focus:outline-none focus:border-cyan-500 transition-colors" 
                  placeholder="E.g. AquaForge AI"
                />
              </div>

              <div>
                 <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Project Icon / Emoji</label>
                 <div className="flex gap-4 items-center">
                    <input 
                      type="text" 
                      value={localIcon}
                      onChange={(e) => setLocalIcon(e.target.value)}
                      className="bg-[#0A0A0B] text-white w-20 px-4 py-2.5 rounded-lg border border-white/10 font-medium text-center focus:outline-none focus:border-cyan-500 transition-colors" 
                      placeholder="💧"
                    />
                    <div className="text-[10px] text-white/40 leading-tight">Enter an emoji or symbol to use as<br/>the project logo if no image is uploaded.</div>
                 </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Custom Logo Image</label>
              <div className="bg-[#0A0A0B] rounded-lg border border-white/10 border-dashed p-4 flex flex-col justify-center items-center h-[126px] hover:border-cyan-500/50 transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload a custom logo image"
                />
                
                {localLogoUrl ? (
                  <div className="relative w-16 h-16 rounded overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={localLogoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-white/5 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 text-white/50">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <div className="text-xs text-white/60">Click or drag to upload</div>
                  </div>
                )}
              </div>
              {localLogoUrl && (
                <div className="mt-2 text-right text-[10px]">
                  <button type="button" className="text-red-400 hover:text-red-300 transition-colors" onClick={() => setLocalLogoUrl('')}>Remove image</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row bg-[#0A0A0B] p-4 rounded-lg border border-cyan-500/20 sm:items-center justify-between gap-4">
            <div className="text-sm text-cyan-400">Preview:</div>
            
            <div className="flex items-center justify-center gap-3 bg-[#0F0F12] p-3 rounded-lg border border-white/5">
              <motion.div 
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-gradient-to-br from-cyan-900/40 to-blue-900/40 overflow-hidden"
                animate={{
                  boxShadow: ["0px 0px 15px rgba(6,182,212,0.3)", "0px 0px 30px rgba(6,182,212,0.6)", "0px 0px 15px rgba(6,182,212,0.3)"]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {localLogoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={localLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <motion.div 
                    className="text-xl"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {localIcon || '💧'}
                  </motion.div>
                )}
              </motion.div>
              
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1 truncate max-w-[200px]">
                {localName || 'AquaForge AI'}
              </h1>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button 
              onClick={() => {
                store.setKey('projectName', localName);
                store.setKey('projectIcon', localIcon);
                store.setKey('projectLogoUrl', localLogoUrl);
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#15151A] rounded-xl border border-white/10 p-6 flex flex-col max-w-3xl">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
          <h3 className="text-lg font-semibold text-white">Essential Settings</h3>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Notification Contacts</label>
                <div className="text-[10px] text-white/40">Manage the list of contacts who receive SMS system alerts.</div>
              </div>
              {!isAddingContact && !editingContactId && (
                <button 
                  onClick={() => setIsAddingContact(true)}
                  className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus size={14} /> Add Contact
                </button>
              )}
            </div>

            <div className="bg-[#0A0A0B] rounded-lg border border-white/5 overflow-hidden">
              <AnimatePresence>
                {store.contacts.map((contact) => (
                  <motion.div 
                    key={contact.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between p-3 border-b border-white/5 last:border-b-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{contact.name}</div>
                      <div className="text-xs text-white/50 font-mono mt-0.5">{contact.phone} <span className="ml-2 uppercase text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{contact.role}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => startEditContact(contact)}
                         className="p-1.5 text-white/40 hover:text-cyan-400 hover:bg-white/5 rounded transition-colors"
                         title="Edit Contact"
                       >
                         <FileEdit size={16} />
                       </button>
                       <button 
                         onClick={() => store.deleteContact(contact.id)}
                         className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                         title="Delete Contact"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {store.contacts.length === 0 && !isAddingContact && !editingContactId && (
                <div className="p-6 text-center text-sm text-white/30">No notification contacts have been added.</div>
              )}
            </div>

            <AnimatePresence>
              {(isAddingContact || editingContactId) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#0A0A0B] p-4 rounded-lg border border-cyan-500/30"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                    <h4 className="text-sm font-semibold text-white">{editingContactId ? 'Edit Contact' : 'New Contact'}</h4>
                    <button onClick={cancelContactForm} className="text-white/40 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] uppercase text-white/50 mb-1">Name</label>
                      <input 
                        type="text" 
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="bg-[#15151A] text-white w-full px-3 py-2 rounded border border-white/10 text-sm focus:outline-none focus:border-cyan-500" 
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-white/50 mb-1">Phone Number</label>
                      <input 
                        type="text" 
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="bg-[#15151A] text-white w-full px-3 py-2 rounded border border-white/10 text-sm font-mono focus:outline-none focus:border-cyan-500" 
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-white/50 mb-1">Role / Subsystem</label>
                      <select 
                        value={contactRole}
                        onChange={(e) => setContactRole(e.target.value)}
                        className="bg-[#15151A] text-white w-full px-3 py-2 rounded border border-white/10 text-sm focus:outline-none focus:border-cyan-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="technician">Technician</option>
                        <option value="manager">Facility Manager</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={cancelContactForm}
                      className="px-3 py-1.5 rounded text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={saveContact}
                      className="bg-cyan-600 hover:bg-cyan-500 px-4 py-1.5 rounded text-xs font-semibold text-white transition-colors"
                    >
                      {editingContactId ? 'Update Contact' : 'Save Contact'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white mb-4">Master Alert Triggers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Object.entries(store.alerts).map(([key, active]) => (
                  <div key={key} className="bg-[#0A0A0B] p-4 rounded-lg border border-white/5 flex items-center justify-between">
                     <div>
                        <div className="text-sm font-medium text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} Alerts</div>
                        <div className="text-[10px] text-white/40">Toggle SMS notifications</div>
                     </div>
                     <ProToggle 
                        value={active as boolean} 
                        onChange={() => store.setAlert(key as keyof typeof store.alerts, !active)} 
                        colorClass="green" 
                     />
                  </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#15151A] rounded-xl border border-white/10 p-6 flex flex-col max-w-3xl">
        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-2">
          <Terminal size={20} className="text-cyan-400" />
          Hardware Integration
        </h3>
        
        <div className="space-y-6">
          <p className="text-sm text-white/60 leading-relaxed">
            Connect your external sensors, RPi Zero 2W, ESP32 S3 Cams, and Solar Inverters to the dashboard by sending REST API POST requests to your ingestion endpoint.
          </p>

          <div>
             <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Ingestion Endpoint URL</label>
             <div className="flex items-stretch gap-2">
                <input 
                  type="text" 
                  readOnly
                  value={ingestUrl}
                  className="bg-[#0A0A0B] text-cyan-400 w-full px-4 py-2.5 rounded-lg border border-cyan-500/30 font-mono text-xs focus:outline-none" 
                />
                <button 
                  onClick={handleCopy}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white shrink-0 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Copy size={16} className={copied ? "text-green-400" : ""} />
                </button>
             </div>
             {copied && <p className="text-[10px] text-green-400 mt-2 font-bold absolute">Copied to clipboard!</p>}
          </div>

          <div className="bg-[#0A0A0B] p-4 rounded-lg border border-white/5">
             <div className="text-xs font-mono text-white/40 mb-2">Example RPi Python Request (Sensors & Solar):</div>
             <pre className="text-[10px] sm:text-xs font-mono text-green-400 overflow-x-auto">
{`import requests

url = "${ingestUrl}"
payload = {
    "device_id": "rpi0_main",
    "metrics": {
        "solarGeneration": 145.2,
        "batterySoc": 84,
        "dissolvedOxygen": 6.8,
        "turbidity": 3.1
    }
}
requests.post(url, json=payload)`}
             </pre>
          </div>

          <div className="bg-[#0A0A0B] p-4 rounded-lg border border-white/5">
             <div className="text-xs font-mono text-white/40 mb-2">Example ESP32 S3 Cam Config:</div>
             <pre className="text-[10px] sm:text-xs font-mono text-blue-400 overflow-x-auto">
{`// Set up MJPEG Stream URL for dashboard ingestion
const char* streamUrl = "http://YOUR_ESP32_IP:81/stream";

// In Dashboard: Set "URL" field in "Live Nodes" to this IP!`}
             </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
