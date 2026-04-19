 "use client";

import React, { useState } from 'react';
import { 
  Smartphone, 
  Mail, 
  HardDrive, 
  Bell, 
  Plus, 
  Save, 
  X, 
  Settings2, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Server,
  Cloud,
  FileJson,
  ExternalLink,
  Edit2,
  Trash2
} from 'lucide-react';
import { upsertExternalServiceConfig, toggleExternalServiceStatus, deleteExternalServiceConfig } from './actions';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type ExternalConfig = {
  id?: string;
  category: string;
  provider: string;
  config: any;
  isActive: boolean;
  updatedAt?: string;
};

const CATEGORIES = [
  { id: 'OTP', label: 'OTP Services', icon: Smartphone },
  { id: 'MAIL', label: 'Mail / SMTP', icon: Mail },
  { id: 'STORAGE', label: 'Cloud Storage', icon: HardDrive },
  { id: 'NOTIFICATION', label: 'Notifications', icon: Bell },
];

const PROVIDERS: Record<string, { id: string; label: string; icon: any }[]> = {
  OTP: [{ id: 'msg91', label: 'MSG91', icon: Zap }],
  MAIL: [{ id: 'smtp', label: 'SMTP Server', icon: Server }],
  STORAGE: [
    { id: 's3', label: 'AWS S3 / R2', icon: Cloud },
    { id: 'cloudinary', label: 'Cloudinary', icon: Cloud },
  ],
  NOTIFICATION: [{ id: 'firebase', label: 'Firebase Cloud Messaging', icon: FlameIcon }],
};

function FlameIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

export default function ExternalServiceManagement({ initialConfigs }: { initialConfigs: ExternalConfig[] }) {
  const [configs, setConfigs] = useState<ExternalConfig[]>(initialConfigs);
  const [activeCategory, setActiveCategory] = useState('OTP');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Partial<ExternalConfig> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredConfigs = configs.filter(c => c.category === activeCategory);
  
  // Available providers for current category that ARE NOT yet configured
  const availableProviders = PROVIDERS[activeCategory].filter(p => 
    !configs.find(c => c.category === activeCategory && c.provider === p.id)
  );

  const handleToggleStatus = async (id: string, category: string, currentStatus: boolean) => {
    // Some categories might prefer exclusive active (e.g. only 1 active storage)
    const exclusive = category === 'STORAGE' || category === 'OTP';
    const res = await toggleExternalServiceStatus(id, category, currentStatus, exclusive);
    if (res.success) {
      if (exclusive && !currentStatus) {
        // If we activated an exclusive one, deactivate others in state
        setConfigs(configs.map(c => 
          c.category === category 
            ? { ...c, isActive: c.id === id } 
            : c
        ));
      } else {
        setConfigs(configs.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      }
    } else {
      alert(res.error || "Failed to update status");
    }
  };

  const openEditModal = (config: ExternalConfig) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const openAddModal = (providerId: string) => {
    setEditingConfig({
      category: activeCategory,
      provider: providerId,
      config: {},
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await upsertExternalServiceConfig(editingConfig);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || "Failed to save configuration");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200/50 dark:border-slate-700/30">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                isActive 
                  ? "bg-white dark:bg-slate-900 text-accent shadow-sm translate-y-[-1px]" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:hover:bg-slate-800"
              )}
            >
              <Icon className={cn("h-4.5 w-4.5", isActive ? "text-accent" : "text-slate-400")} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Configured Service Cards */}
        {filteredConfigs.map((c) => {
          const providerInfo = PROVIDERS[activeCategory].find(p => p.id === c.provider);
          const Icon = providerInfo?.icon || Settings2;
          
          return (
            <div key={c.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="h-7 w-7 text-accent" />
                  </div>
                  <button 
                    onClick={() => handleToggleStatus(c.id!, c.category, c.isActive)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      c.isActive ? "bg-accent shadow-inner shadow-accent/20" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                      c.isActive ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">{providerInfo?.label || c.provider}</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configured Provider</p>
              </div>

              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-y border-slate-100 dark:border-slate-800">
                <div className="flex items-center text-xs font-medium text-slate-500 gap-2">
                   <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                   <span>Keys secured and active</span>
                </div>
              </div>

              <div className="p-4 mt-auto flex items-center gap-2">
                <button 
                  onClick={() => openEditModal(c)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-black uppercase tracking-widest hover:bg-accent transition-colors active:scale-[0.98]"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Configuration
                </button>
              </div>
            </div>
          );
        })}

        {/* Available Providers to Add */}
        {availableProviders.map((p) => {
          const Icon = p.icon;
          return (
            <button 
              key={p.id}
              onClick={() => openAddModal(p.id)}
              className="bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center group hover:border-accent/40 hover:bg-accent/[0.02] transition-all"
            >
              <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform mb-4">
                <Icon className="h-7 w-7 text-slate-300 group-hover:text-accent opacity-50 group-hover:opacity-100" />
              </div>
              <h4 className="text-sm font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest">Add {p.label}</h4>
            </button>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {isModalOpen && editingConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-300" onClick={() => !isLoading && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <form onSubmit={handleSubmit}>
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Settings2 className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">
                      {PROVIDERS[activeCategory].find(p => p.id === editingConfig.provider)?.label}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Settings Configuration</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Form Fields Based on Provider */}
                {editingConfig.provider === 'msg91' && (
                  <>
                    <Field label="Auth Key" type="password" path="authKey" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="Enter MSG91 Auth Key" />
                    <Field label="Template ID" path="templateId" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="e.g. 64c..." />
                    <Field label="Sender ID" path="senderId" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="e.g. BKTMSG" />
                  </>
                )}

                {editingConfig.provider === 'smtp' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Field label="Host" path="host" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="smtp.gmail.com" />
                    </div>
                    <Field label="Port" path="port" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="587" />
                    <Field label="Encryption" path="encryption" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="tls" />
                    <div className="md:col-span-2 space-y-4 pt-2 border-t border-slate-50 dark:border-slate-800 mt-2">
                       <Field label="User" path="user" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="email@example.com" />
                       <Field label="Password" type="password" path="pass" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="********" />
                    </div>
                  </div>
                )}

                {editingConfig.provider === 's3' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                       <Field label="Region" path="region" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="us-east-1" />
                       <Field label="Bucket Name" path="bucket" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="my-assets" />
                    </div>
                    <Field label="Access Key" path="accessKey" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="AKIA..." />
                    <Field label="Secret Key" type="password" path="secretKey" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="********" />
                    <Field label="Endpoint (Optional for R2)" path="endpoint" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="https://<id>.r2.cloudflarestorage.com" />
                  </>
                )}

                {editingConfig.provider === 'cloudinary' && (
                  <>
                    <Field label="Cloud Name" path="cloudName" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="Enter cloud name" />
                    <Field label="API Key" path="apiKey" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="Enter API key" />
                    <Field label="API Secret" type="password" path="apiSecret" editingConfig={editingConfig} setEditingConfig={setEditingConfig} placeholder="********" />
                  </>
                )}

                {editingConfig.provider === 'firebase' && (
                   <div className="space-y-4">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           <FileJson className="h-3 w-3" />
                           Service Account JSON
                        </label>
                        <textarea 
                          rows={10}
                          value={editingConfig.config?.json || ''}
                          onChange={(e) => setEditingConfig({
                            ...editingConfig, 
                            config: { ...editingConfig.config, json: e.target.value }
                          })}
                          placeholder='{ "type": "service_account", ... }'
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-accent/30 outline-none transition-all text-xs font-mono text-slate-600 dark:text-slate-300"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium italic">Paste the entire contents of your Firebase service account key file here.</p>
                   </div>
                )}
              </div>

              <div className="p-8 bg-slate-50/50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 dark:bg-accent text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10 dark:shadow-accent/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Provider Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, path, editingConfig, setEditingConfig, type = "text", placeholder = "" }: any) {
  return (
    <div className="flex flex-col space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <input 
        type={type}
        value={editingConfig.config?.[path] || ''}
        onChange={(e) => setEditingConfig({
          ...editingConfig, 
          config: { ...editingConfig.config, [path]: e.target.value }
        })}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-accent/30 outline-none transition-all text-xs font-bold text-slate-700 dark:text-slate-200"
      />
    </div>
  );
}
