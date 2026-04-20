"use client";

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Mail, 
  HardDrive, 
  Bell, 
  Settings2, 
  Zap, 
  Server,
  Cloud,
  FileJson,
  FileUp,
  Edit2,
  CreditCard,
  Shield,
  Globe,
  Apple
} from 'lucide-react';
import { getExternalServiceConfigs, upsertExternalServiceConfig, toggleExternalServiceStatus } from './service-actions';

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
  displayName?: string;
  mode?: string;
  isDefault?: boolean;
};

const CATEGORIES = [
  { id: 'otp', label: 'OTP Services', icon: Smartphone },
  { id: 'mail', label: 'Mail / SMTP', icon: Mail },
  { id: 'storage', label: 'Cloud Storage', icon: HardDrive },
  { id: 'notification', label: 'Notifications', icon: Bell },
  { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
  { id: 'ads', label: 'Ad Networks', icon: Globe },
  { id: 'login', label: 'App Login', icon: Shield },
];

const PROVIDERS: Record<string, { id: string; label: string; icon: any }[]> = {
  otp: [
    { id: 'msg91', label: 'MSG91', icon: Zap },
    { id: 'firebase', label: 'Firebase Auth/OTP', icon: FlameIcon }
  ],
  mail: [{ id: 'smtp', label: 'SMTP Server', icon: Server }],
  storage: [
    { id: 's3', label: 'AWS S3 / R2', icon: Cloud },
    { id: 'cloudflare', label: 'Cloudflare R2', icon: Cloud },
    { id: 'cloudinary', label: 'Cloudinary', icon: Cloud },
    { id: 'firebase', label: 'Firebase Storage', icon: FlameIcon },
    { id: 'local_storage', label: 'Local Server (Manual)', icon: HardDrive },
  ],
  notification: [{ id: 'firebase', label: 'Firebase Cloud Messaging', icon: FlameIcon }],
  payment: [
    { id: 'razorpay', label: 'Razorpay', icon: CreditCard },
    { id: 'stripe', label: 'Stripe', icon: Shield },
    { id: 'paypal', label: 'PayPal', icon: Globe },
    { id: 'flutterwave', label: 'Flutterwave', icon: CreditCard },
    { id: 'paystack', label: 'Paystack', icon: CreditCard },
  ],
  ads: [
    { id: 'admob', label: 'Google AdMob', icon: Zap },
    { id: 'facebook', label: 'Facebook Audience Network', icon: Globe },
  ],
  login: [
    { id: 'otp_login', label: 'Phone OTP Login', icon: Smartphone },
    { id: 'password', label: 'Email/Password Login', icon: Shield },
    { id: 'google', label: 'Google Sign-In', icon: Globe },
    { id: 'apple', label: 'Apple Login', icon: AppleIcon },
  ],
};

function AppleIcon(props: any) {
  return (
    <Apple {...props} className="text-slate-900 dark:text-slate-50" />
  );
}

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
  const [activeCategory, setActiveCategory] = useState('otp');
  const [formStates, setFormStates] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, [activeCategory]);

  const fetchConfigs = async () => {
    const res = await getExternalServiceConfigs();
    const data = res.success ? res.data : [];
    
    setConfigs(data);
    
    // Reset/Initialize form states for the current category
    const initialForms: Record<string, any> = {};
    PROVIDERS[activeCategory].forEach(p => {
      const existing = data.find(c => c.category === activeCategory && c.provider === p.id);
      initialForms[p.id] = existing ? { ...existing } : {
        category: activeCategory,
        provider: p.id,
        config: {},
        isActive: true,
        mode: 'test',
        isDefault: false
      };
    });
    setFormStates(initialForms);
  };

  const handleMethodChange = (providerId: string, method: string, field: string, value: any) => {
    setFormStates(prev => {
      const currentConfig = prev[providerId]?.config || {};
      const newMethods = { ...currentConfig.methods };
      if (!newMethods[method]) newMethods[method] = {};
      newMethods[method][field] = value;
      
      return {
        ...prev,
        [providerId]: {
          ...prev[providerId],
          config: { ...currentConfig, methods: newMethods }
        }
      };
    });
  };

  const handleFieldChange = (providerId: string, field: string, value: any, isConfig = false) => {
    setFormStates(prev => {
      const currentProvider = prev[providerId];
      if (!currentProvider) return prev;

      let updatedState = { ...currentProvider };

      if (isConfig) {
        // Support nested fields like "test.keyId"
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          const currentConfig = { ...(updatedState.config || {}) };
          currentConfig[parent] = { 
            ...(currentConfig[parent] || {}), 
            [child]: value 
          };
          updatedState.config = currentConfig;
        } else {
          updatedState.config = { ...updatedState.config, [field]: value };
        }
      } else {
        updatedState = { ...updatedState, [field]: value };
      }

      const updated = {
        ...prev,
        [providerId]: updatedState
      };

      // If user is manually editing the 'json' field, try to sync individual fields (existing logic)
      if (isConfig && field === 'json' && value) {
        try {
          const parsed = JSON.parse(value);
          const fieldsToSync = {
            projectId: parsed.project_id,
            clientEmail: parsed.client_email,
            privateKey: parsed.private_key,
            apiKey: parsed.apiKey, 
            authDomain: parsed.authDomain
          };

          Object.entries(fieldsToSync).forEach(([k, v]) => {
            if (v) updated[providerId].config[k] = v;
          });
        } catch (e) {}
      }

      return updated;
    });
  };

  const handleJsonUpload = async (providerId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        
        // Map common Firebase keys to our internal fields
        const configUpdates: any = {
          json: JSON.stringify(parsed, null, 2),
          projectId: parsed.project_id || parsed.project_info?.project_id || '',
          clientEmail: parsed.client_email || '',
          privateKey: parsed.private_key || '',
          apiKey: parsed.apiKey || parsed.client?.[0]?.api_key?.[0]?.current_key || '',
          authDomain: parsed.authDomain || (parsed.project_info?.project_id ? `${parsed.project_info.project_id}.firebaseapp.com` : '')
        };

        // If it's a google-services.json, try to find the Web Client ID (type 3)
        if (parsed.client?.[0]?.oauth_client) {
          const webClient = parsed.client[0].oauth_client.find((c: any) => c.client_type === 3);
          if (webClient) {
            configUpdates.clientId = webClient.client_id;
          }
        }
        
        // Also support direct client_id if present
        if (parsed.client_id) configUpdates.clientId = parsed.client_id;

        setFormStates(prev => ({
          ...prev,
          [providerId]: {
            ...prev[providerId],
            config: {
              ...prev[providerId].config,
              ...configUpdates
            }
          }
        }));

        // Give state a moment to update then save
        setTimeout(() => {
          saveProviderConfig(providerId);
        }, 100);

      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleToggleDefault = async (providerId: string) => {
    const current = formStates[providerId];
    if (!current) return;

    // Local optimistic update
    setFormStates(prev => {
      const next = { ...prev };
      // Turn off others in this category (though state is currently category-scoped)
      Object.keys(next).forEach(pid => {
        if (next[pid].category === activeCategory) {
          next[pid] = { ...next[pid], isDefault: pid === providerId };
        }
      });
      return next;
    });

    // We save immediately when default is toggled to ensure it's applied app-wide
    const res = await upsertExternalServiceConfig({ 
      ...current, 
      isDefault: true, 
      isActive: true 
    });
    
    if (res.success) {
      fetchConfigs();
    } else {
      alert(`Failed to set as default: ${res.error || 'Unknown error'}`);
      fetchConfigs(); // Rollback
    }
  };

  const handleToggleActive = async (providerId: string) => {
    const current = formStates[providerId];
    if (!current) return;

    const newActive = !current.isActive;

    // Optimistic update
    setFormStates(prev => ({
      ...prev,
      [providerId]: { ...prev[providerId], isActive: newActive }
    }));

    const res = await upsertExternalServiceConfig({ ...current, isActive: newActive });
    if (!res.success) {
      alert(`Failed to update: ${res.error || 'Unknown error'}`);
      fetchConfigs(); // rollback
    } else {
      fetchConfigs();
    }
  };

  const saveProviderConfig = async (providerId: string) => {
    const payload = formStates[providerId];
    if (!payload) return;

    setIsLoading(true);
    const res = await upsertExternalServiceConfig(payload);
    if (res.success) {
      fetchConfigs();
    } else {
      alert(`Failed to save: ${res.error || 'Unknown error'}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl w-fit">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                isActive 
                  ? "bg-white dark:bg-slate-900 text-accent shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="columns-1 lg:columns-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        {PROVIDERS[activeCategory].map((p) => {
          const config = formStates[p.id];
          if (!config) return null;

          const Icon = p.icon;

          return (
            <div key={p.id} className="break-inside-avoid mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-fit">
              {/* Card Header */}
              <div className="p-5 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                    config.id ? "bg-accent/10" : "bg-slate-100 dark:bg-slate-800"
                  )}>
                    <Icon className={cn("h-5 w-5", config.id ? "text-accent" : "text-slate-400")} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{p.label}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        config.id ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {config.id ? 'Connected' : 'Not Setup'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Default toggle — hidden for 'login' category */}
                {activeCategory !== 'login' && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Default</span>

                    {activeCategory !== 'login' && (
                      <button 
                        onClick={() => handleToggleDefault(p.id)}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          config.isDefault ? "bg-emerald-500 shadow-inner" : "bg-slate-200 dark:bg-slate-700"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200",
                          config.isDefault ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    )}
                  </div>
                )}

                {/* Active toggle — shown ONLY for login category */}
                {activeCategory === 'login' && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Active</span>
                    <button
                      onClick={() => handleToggleActive(p.id)}
                      className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        config.isActive ? "bg-emerald-500 shadow-inner" : "bg-slate-200 dark:bg-slate-700"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200",
                        config.isActive ? "translate-x-5" : "translate-x-1"
                      )} />
                    </button>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-tight",
                      config.isActive ? "text-emerald-500" : "text-slate-400"
                    )}>
                      {config.isActive ? 'ON' : 'OFF'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body (Form) */}
              <div className="p-6 space-y-5">
                {(activeCategory === 'payment' || activeCategory === 'otp') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment</label>
                      <select 
                        value={config.mode || 'test'}
                        onChange={(e) => handleFieldChange(p.id, 'mode', e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                      >
                        <option value="test">Test Mode</option>
                        <option value="live">Live Mode</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Name</label>
                      <input 
                        type="text"
                        value={config.displayName || ''}
                        onChange={(e) => handleFieldChange(p.id, 'displayName', e.target.value)}
                        placeholder="e.g. Primary Portal"
                        className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  {p.id === 'msg91' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Key</label>
                        <input 
                          type="password"
                          value={config.config?.authKey || ''}
                          onChange={(e) => handleFieldChange(p.id, 'authKey', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Template ID</label>
                          <input 
                            type="text"
                            value={config.config?.templateId || ''}
                            onChange={(e) => handleFieldChange(p.id, 'templateId', e.target.value, true)}
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender ID</label>
                          <input 
                            type="text"
                            value={config.config?.senderId || 'BKTMSG'}
                            onChange={(e) => handleFieldChange(p.id, 'senderId', e.target.value, true)}
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {p.id === 'firebase' && (activeCategory === 'storage' || activeCategory === 'notification' || activeCategory === 'otp') && (
                    <div className="flex flex-col space-y-4">
                      {activeCategory === 'storage' && (
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Bucket URL</label>
                          <input 
                            type="text"
                            value={config.config?.bucketUrl || ''}
                            onChange={(e) => handleFieldChange(p.id, 'bucketUrl', e.target.value, true)}
                            placeholder="gs://your-project.appspot.com"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                      )}


                      {activeCategory === 'otp' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Key</label>
                            <input 
                              type="text"
                              value={config.config?.apiKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'apiKey', e.target.value, true)}
                              className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Domain</label>
                            <input 
                              type="text"
                              value={config.config?.authDomain || ''}
                              onChange={(e) => handleFieldChange(p.id, 'authDomain', e.target.value, true)}
                              placeholder="project-id.firebaseapp.com"
                              className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project ID</label>
                            <input 
                              type="text"
                              value={config.config?.projectId || ''}
                              onChange={(e) => handleFieldChange(p.id, 'projectId', e.target.value, true)}
                              className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                            />
                          </div>
                        </div>
                      )}

                      {(activeCategory === 'notification' || activeCategory === 'storage') && (
                        <div className="grid grid-cols-1 gap-4 mb-4">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project ID</label>
                            <input 
                              type="text"
                              value={config.config?.projectId || ''}
                              onChange={(e) => handleFieldChange(p.id, 'projectId', e.target.value, true)}
                              className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Email</label>
                            <input 
                              type="text"
                              value={config.config?.clientEmail || ''}
                              onChange={(e) => handleFieldChange(p.id, 'clientEmail', e.target.value, true)}
                              className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Private Key</label>
                            <textarea 
                              rows={4}
                              value={config.config?.privateKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'privateKey', e.target.value, true)}
                              className="bg-slate-50 dark:bg-slate-800 text-[11px] font-mono p-3 rounded-xl outline-none border-2 border-transparent focus:border-accent/30 shadow-sm"
                              placeholder="-----BEGIN PRIVATE KEY-----\n..."
                            />
                          </div>
                        </div>
                      )}

                      {(activeCategory === 'notification' || activeCategory === 'storage' || activeCategory === 'otp' || activeCategory === 'login') && (
                        <div className="flex flex-col space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-4">
                          <div className="flex items-center justify-between mt-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Account JSON</label>
                            <label className="cursor-pointer group flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-accent/10 border border-slate-200 dark:border-slate-700 rounded-lg transition-all">
                              <FileUp className="h-3 w-3 text-slate-500 group-hover:text-accent" />
                              <span className="text-[10px] font-black text-slate-500 group-hover:text-accent uppercase tracking-tight">Upload JSON</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept=".json"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleJsonUpload(p.id, file);
                                }}
                              />
                            </label>
                          </div>
                          <textarea 
                            rows={4}
                            value={config.config?.json || ''}
                            onChange={(e) => handleFieldChange(p.id, 'json', e.target.value, true)}
                            className="bg-slate-50 dark:bg-slate-800 text-[10px] font-mono p-3 rounded-xl outline-none border-2 border-transparent focus:border-accent/20 min-h-[120px] shadow-inner"
                            placeholder='{ "project_id": "...", ... }'
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {p.id === 'razorpay' && (
                    <div className="space-y-6">
                      {/* Test Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Test / Sandbox Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 bg-amber-50/30 dark:bg-amber-900/5 rounded-xl border border-amber-100/50 dark:border-amber-900/10">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Key ID</label>
                            <input 
                              type="text"
                              value={config.config?.test?.keyId || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.keyId', e.target.value, true)}
                              placeholder="rzp_test_..."
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Key Secret</label>
                            <input 
                              type="password"
                              value={config.config?.test?.keySecret || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.keySecret', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-emerald-500" />
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Production / Live Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Key ID</label>
                            <input 
                              type="text"
                              value={config.config?.live?.keyId || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.keyId', e.target.value, true)}
                              placeholder="rzp_live_..."
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Key Secret</label>
                            <input 
                              type="password"
                              value={config.config?.live?.keySecret || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.keySecret', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {p.id === 's3' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</label>
                          <input 
                            type="text"
                            value={config.config?.region || ''}
                            onChange={(e) => handleFieldChange(p.id, 'region', e.target.value, true)}
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bucket</label>
                          <input 
                            type="text"
                            value={config.config?.bucket || ''}
                            onChange={(e) => handleFieldChange(p.id, 'bucket', e.target.value, true)}
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Key</label>
                        <input 
                          type="text"
                          value={config.config?.accessKey || ''}
                          onChange={(e) => handleFieldChange(p.id, 'accessKey', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                        <input 
                          type="password"
                          value={config.config?.secretKey || ''}
                          onChange={(e) => handleFieldChange(p.id, 'secretKey', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                    </div>
                  )}

                  {/* ── AdMob fields ── */}
                  {p.id === 'admob' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">App ID</label>
                        <input
                          type="text"
                          value={config.config?.appId || ''}
                          onChange={(e) => handleFieldChange(p.id, 'appId', e.target.value, true)}
                          placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Banner Ad Unit ID</label>
                          <input
                            type="text"
                            value={config.config?.bannerUnitId || ''}
                            onChange={(e) => handleFieldChange(p.id, 'bannerUnitId', e.target.value, true)}
                            placeholder="ca-app-pub-xxx/xxx"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interstitial Ad Unit ID</label>
                          <input
                            type="text"
                            value={config.config?.interstitialUnitId || ''}
                            onChange={(e) => handleFieldChange(p.id, 'interstitialUnitId', e.target.value, true)}
                            placeholder="ca-app-pub-xxx/xxx"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rewarded Ad Unit ID</label>
                          <input
                            type="text"
                            value={config.config?.rewardedUnitId || ''}
                            onChange={(e) => handleFieldChange(p.id, 'rewardedUnitId', e.target.value, true)}
                            placeholder="ca-app-pub-xxx/xxx"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Native Ad Unit ID</label>
                          <input
                            type="text"
                            value={config.config?.nativeUnitId || ''}
                            onChange={(e) => handleFieldChange(p.id, 'nativeUnitId', e.target.value, true)}
                            placeholder="ca-app-pub-xxx/xxx"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5 col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">App Open Ad Unit ID</label>
                          <input
                            type="text"
                            value={config.config?.appOpenUnitId || ''}
                            onChange={(e) => handleFieldChange(p.id, 'appOpenUnitId', e.target.value, true)}
                            placeholder="ca-app-pub-xxx/xxx"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Facebook Audience Network fields ── */}
                  {p.id === 'facebook' && activeCategory === 'ads' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">App ID</label>
                        <input
                          type="text"
                          value={config.config?.appId || ''}
                          onChange={(e) => handleFieldChange(p.id, 'appId', e.target.value, true)}
                          placeholder="Your Facebook App ID"
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Banner Placement ID</label>
                          <input
                            type="text"
                            value={config.config?.bannerPlacementId || ''}
                            onChange={(e) => handleFieldChange(p.id, 'bannerPlacementId', e.target.value, true)}
                            placeholder="XXXXXXXXXX_XXXXXXXXXX"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interstitial Placement ID</label>
                          <input
                            type="text"
                            value={config.config?.interstitialPlacementId || ''}
                            onChange={(e) => handleFieldChange(p.id, 'interstitialPlacementId', e.target.value, true)}
                            placeholder="XXXXXXXXXX_XXXXXXXXXX"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Native Placement ID</label>
                          <input
                            type="text"
                            value={config.config?.nativePlacementId || ''}
                            onChange={(e) => handleFieldChange(p.id, 'nativePlacementId', e.target.value, true)}
                            placeholder="XXXXXXXXXX_XXXXXXXXXX"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rewarded Placement ID</label>
                          <input
                            type="text"
                            value={config.config?.rewardedPlacementId || ''}
                            onChange={(e) => handleFieldChange(p.id, 'rewardedPlacementId', e.target.value, true)}
                            placeholder="XXXXXXXXXX_XXXXXXXXXX"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {p.id === 'smtp' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SMTP Host</label>
                        <input 
                          type="text"
                          value={config.config?.host || ''}
                          onChange={(e) => handleFieldChange(p.id, 'host', e.target.value, true)}
                          placeholder="e.g., smtp.gmail.com"
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Port</label>
                        <input 
                          type="text"
                          value={config.config?.port || ''}
                          onChange={(e) => handleFieldChange(p.id, 'port', e.target.value, true)}
                          placeholder="e.g., 587"
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure</label>
                        <select 
                          value={config.config?.secure || 'false'}
                          onChange={(e) => handleFieldChange(p.id, 'secure', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        >
                          <option value="false">TLS / StartTLS</option>
                          <option value="true">SSL</option>
                        </select>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                        <input 
                          type="text"
                          value={config.config?.user || ''}
                          onChange={(e) => handleFieldChange(p.id, 'user', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                        <input 
                          type="password"
                          value={config.config?.pass || ''}
                          onChange={(e) => handleFieldChange(p.id, 'pass', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                    </div>
                  )}

                  {p.id === 'cloudflare' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account ID</label>
                        <input 
                          type="text"
                          value={config.config?.accountId || ''}
                          onChange={(e) => handleFieldChange(p.id, 'accountId', e.target.value, true)}
                          placeholder="e.g., 01d5e6ef06459ccd65c6cf090b257f3a"
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bucket Name</label>
                          <input 
                            type="text"
                            value={config.config?.bucket || ''}
                            onChange={(e) => handleFieldChange(p.id, 'bucket', e.target.value, true)}
                            placeholder="e.g., smm-app"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public URL</label>
                          <input 
                            type="text"
                            value={config.config?.publicUrl || ''}
                            onChange={(e) => handleFieldChange(p.id, 'publicUrl', e.target.value, true)}
                            placeholder="https://pub-....r2.dev"
                            className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endpoint URL</label>
                        <input 
                          type="text"
                          value={config.config?.endpoint || ''}
                          onChange={(e) => handleFieldChange(p.id, 'endpoint', e.target.value, true)}
                          placeholder="https://<account-id>.r2.cloudflarestorage.com"
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Key ID</label>
                        <input 
                          type="text"
                          value={config.config?.accessKey || ''}
                          onChange={(e) => handleFieldChange(p.id, 'accessKey', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Access Key</label>
                        <input 
                          type="password"
                          value={config.config?.secretKey || ''}
                          onChange={(e) => handleFieldChange(p.id, 'secretKey', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                    </div>
                  )}

                  {p.id === 'cloudinary' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloud Name</label>
                        <input 
                          type="text"
                          value={config.config?.cloudName || ''}
                          onChange={(e) => handleFieldChange(p.id, 'cloudName', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Key</label>
                        <input 
                          type="text"
                          value={config.config?.apiKey || ''}
                          onChange={(e) => handleFieldChange(p.id, 'apiKey', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Secret</label>
                        <input 
                          type="password"
                          value={config.config?.apiSecret || ''}
                          onChange={(e) => handleFieldChange(p.id, 'apiSecret', e.target.value, true)}
                          className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold p-2.5 rounded-xl outline-none border-2 border-transparent focus:border-accent/30"
                        />
                      </div>
                    </div>
                  )}

                  {p.id === 'stripe' && (
                    <div className="space-y-6">
                      {/* Test Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Test / Sandbox Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 bg-amber-50/30 dark:bg-amber-900/5 rounded-xl border border-amber-100/50 dark:border-amber-900/10">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Publishable Key</label>
                            <input 
                              type="text"
                              value={config.config?.test?.publishableKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.publishableKey', e.target.value, true)}
                              placeholder="pk_test_..."
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Secret Key</label>
                            <input 
                              type="password"
                              value={config.config?.test?.secretKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.secretKey', e.target.value, true)}
                              placeholder="sk_test_..."
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Webhook Secret</label>
                            <input 
                              type="password"
                              value={config.config?.test?.webhookSecret || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.webhookSecret', e.target.value, true)}
                              placeholder="whsec_..."
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-emerald-500" />
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Production / Live Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Publishable Key</label>
                            <input 
                              type="text"
                              value={config.config?.live?.publishableKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.publishableKey', e.target.value, true)}
                              placeholder="pk_live_..."
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Secret Key</label>
                            <input 
                              type="password"
                              value={config.config?.live?.secretKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.secretKey', e.target.value, true)}
                              placeholder="sk_live_..."
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Webhook Secret</label>
                            <input 
                              type="password"
                              value={config.config?.live?.webhookSecret || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.webhookSecret', e.target.value, true)}
                              placeholder="whsec_..."
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {p.id === 'paypal' && (
                    <div className="space-y-6">
                      {/* Test Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Test / Sandbox Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 bg-amber-50/30 dark:bg-amber-900/5 rounded-xl border border-amber-100/50 dark:border-amber-900/10">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Client ID</label>
                            <input 
                              type="text"
                              value={config.config?.test?.clientId || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.clientId', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Secret Key</label>
                            <input 
                              type="password"
                              value={config.config?.test?.secretKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.secretKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-emerald-500" />
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Production / Live Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Client ID</label>
                            <input 
                              type="text"
                              value={config.config?.live?.clientId || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.clientId', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Secret Key</label>
                            <input 
                              type="password"
                              value={config.config?.live?.secretKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.secretKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {p.id === 'flutterwave' && (
                    <div className="space-y-6">
                      {/* Test Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Test / Sandbox Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 bg-amber-50/30 dark:bg-amber-900/5 rounded-xl border border-amber-100/50 dark:border-amber-900/10">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Public Key</label>
                            <input 
                              type="text"
                              value={config.config?.test?.publicKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.publicKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Secret Key</label>
                            <input 
                              type="password"
                              value={config.config?.test?.secretKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.secretKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Encryption Key</label>
                            <input 
                              type="password"
                              value={config.config?.test?.encryptionKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.encryptionKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-emerald-500" />
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Production / Live Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Public Key</label>
                            <input 
                              type="text"
                              value={config.config?.live?.publicKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.publicKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Secret Key</label>
                            <input 
                              type="password"
                              value={config.config?.live?.secretKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.secretKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Encryption Key</label>
                            <input 
                              type="password"
                              value={config.config?.live?.encryptionKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.encryptionKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {p.id === 'paystack' && (
                    <div className="space-y-6">
                      {/* Test Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Test / Sandbox Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 bg-amber-50/30 dark:bg-amber-900/5 rounded-xl border border-amber-100/50 dark:border-amber-900/10">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Public Key</label>
                            <input 
                              type="text"
                              value={config.config?.test?.publicKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.publicKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Secret Key</label>
                            <input 
                              type="password"
                              value={config.config?.test?.secretKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'test.secretKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-amber-500/30 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-3 w-3 text-emerald-500" />
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Production / Live Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Public Key</label>
                            <input 
                              type="text"
                              value={config.config?.live?.publicKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.publicKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Secret Key</label>
                            <input 
                              type="password"
                              value={config.config?.live?.secretKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'live.secretKey', e.target.value, true)}
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500/30 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Separate Cards for OTP and Password ── */}
                  {(p.id === 'otp_login' || p.id === 'password') && activeCategory === 'login' && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        config.isActive ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-slate-100 dark:bg-slate-800"
                      )}>
                        <Shield className={cn("h-4 w-4", config.isActive ? "text-emerald-600" : "text-slate-400")} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {p.id === 'otp_login' ? 'Allow users to log in via a one-time password sent to their phone/email.' : 'Allow users to log in using their email and password.'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Toggle the Active switch in the card header to enable or disable.</p>
                      </div>
                    </div>
                  )}

                  {/* ── Google Sign-In Card ── */}
                  {activeCategory === 'login' && p.id === 'google' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex flex-col space-y-4">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Web Client ID</label>
                            <input 
                              type="text"
                              value={config.config?.clientId || ''}
                              onChange={(e) => handleFieldChange(p.id, 'clientId', e.target.value, true)}
                              placeholder="YOUR_GOOGLE_CLIENT_ID"
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-accent/30"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Secret (Optional)</label>
                            <input 
                              type="password"
                              value={config.config?.clientSecret || ''}
                              onChange={(e) => handleFieldChange(p.id, 'clientSecret', e.target.value, true)}
                              placeholder="•••••••••••••••••••••••••"
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-accent/30"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ── Apple Login Card ── */}
                  {activeCategory === 'login' && p.id === 'apple' && (
                    <div className="space-y-4">
                      {/* ... existing apple login fields ... (omitted for brevity in replacement, but I will include them to keep the file intact) */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div className="space-y-4">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service ID</label>
                            <input 
                              type="text"
                              value={config.config?.clientId || ''}
                              onChange={(e) => handleFieldChange(p.id, 'clientId', e.target.value, true)}
                              placeholder="YOUR_APPLE_CLIENT_ID"
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-accent/30"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team ID</label>
                            <input 
                              type="text"
                              value={config.config?.teamId || ''}
                              onChange={(e) => handleFieldChange(p.id, 'teamId', e.target.value, true)}
                              placeholder="YOUR_APPLE_TEAM_ID"
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-accent/30"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key ID</label>
                            <input 
                              type="text"
                              value={config.config?.keyId || ''}
                              onChange={(e) => handleFieldChange(p.id, 'keyId', e.target.value, true)}
                              placeholder="YOUR_APPLE_KEY_ID"
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-accent/30"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Private Key (.p8)</label>
                            <textarea 
                              rows={4}
                              value={config.config?.privateKey || ''}
                              onChange={(e) => handleFieldChange(p.id, 'privateKey', e.target.value, true)}
                              placeholder="YOUR_APPLE_PRIVATE_KEY"
                              className="bg-white dark:bg-slate-900 text-[11px] font-mono p-3 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-accent/30"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Local Storage (Manual) Card ── */}
                  {activeCategory === 'storage' && p.id === 'local_storage' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div className="space-y-4">
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Directory</label>
                            <input 
                              type="text"
                              value={config.config?.uploadPath || ''}
                              onChange={(e) => handleFieldChange(p.id, 'uploadPath', e.target.value, true)}
                              placeholder="e.g., public/uploads"
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-accent/30"
                            />
                            <p className="text-[9px] text-slate-400">Path relative to project root where files will be saved.</p>
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public URL Prefix</label>
                            <input 
                              type="text"
                              value={config.config?.publicPath || ''}
                              onChange={(e) => handleFieldChange(p.id, 'publicPath', e.target.value, true)}
                              placeholder="e.g., /uploads"
                              className="bg-white dark:bg-slate-900 text-[11px] font-bold p-2.5 rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-accent/30"
                            />
                            <p className="text-[9px] text-slate-400">The base URL prefix used to serve these files.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!['msg91', 'firebase', 'razorpay', 's3', 'smtp', 'cloudinary', 'stripe', 'paypal', 'cloudflare', 'flutterwave', 'paystack', 'admob', 'facebook', 'google', 'apple', 'otp_login', 'password'].includes(p.id) && (
                    <p className="text-[10px] text-slate-400 italic">Configuration fields for {p.label} will appear here.</p>
                  )}
                </div>
              </div>

              {/* Card Footer — hidden for simple login methods (no form config to save) */}
              {!(activeCategory === 'login' && (p.id === 'otp_login' || p.id === 'password')) && (
                <div className="mt-auto p-5 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className={cn(
                      "text-[10px] font-black uppercase mt-1 tracking-tight",
                      config.id ? "text-emerald-500" : "text-slate-400"
                    )}>
                      {config.id ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                  <button 
                    onClick={() => saveProviderConfig(p.id)}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? 'Wait...' : 'Save Settings'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
