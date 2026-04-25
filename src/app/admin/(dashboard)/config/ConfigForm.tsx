"use client";

import { 
  Settings, Save, AlertTriangle, Smartphone, Tablet, Globe, 
  ShieldAlert, Mail, Link as LinkIcon, Clock, Cpu, 
  CheckCircle2, Zap
} from "lucide-react";
import { updateConfig, autoSetConfig } from "./actions";

interface ConfigFormProps {
  config: any;
  platforms: any[];
}

export default function ConfigForm({ config, platforms }: ConfigFormProps) {
  const getPlatData = (plat: string) => platforms.find(p => p.platform === plat) || {};
  const androidData = getPlatData('android') as any;
  const iosData = getPlatData('ios') as any;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500 mt-4">
      
      {/* Clean Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Configure global parameters and platform versions.</p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <span className={`h-2 w-2 rounded-full ${config.maintenanceMode ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {config.maintenanceMode ? 'Maintenance active' : 'System Live'}
            </span>
        </div>
      </div>

      <form action={updateConfig} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Settings Forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* General Config Card */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                <Globe className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold">General Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">App Name</label>
                <input 
                  name="appName"
                  defaultValue={config.appName}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Support Email</label>
                <input 
                  name="supportEmail"
                  defaultValue={config.supportEmail || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">API Base URL</label>
                <input 
                  name="apiBaseUrl"
                  defaultValue={config.apiBaseUrl || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-mono text-xs"
                  placeholder="https://ai-smm-backend.vercel.app"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Free Trial Days</label>
                <div className="relative">
                    <input 
                      type="number"
                      name="freeTrialDays"
                      defaultValue={config.freeTrialDays || 7}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-bold"
                    />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <Globe className="h-4 w-4 text-emerald-500" />
                <span>Landing Page Appearance</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Hero Title</label>
                  <input 
                    name="heroTitle"
                    defaultValue={config.heroTitle || ""}
                    placeholder="Elevate Your Social Influence with AI"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-medium text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Landing Primary Color</label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="color"
                      defaultValue={config.primaryColor || "#2ECC71"}
                      className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                      onChange={(e) => {
                        const input = e.target.parentElement?.querySelector('input[name="primaryColor"]') as HTMLInputElement;
                        if (input) input.value = e.target.value;
                      }}
                    />
                    <input 
                      name="primaryColor"
                      defaultValue={config.primaryColor || "#2ECC71"}
                      placeholder="#2ECC71"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Pricing Section Title</label>
                  <input 
                    name="pricingTitle"
                    defaultValue={config.pricingTitle || ""}
                    placeholder="Simple, Transparent Pricing"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Hero Subtitle</label>
                <textarea 
                  name="heroSubtitle"
                  defaultValue={config.heroSubtitle || ""}
                  rows={2}
                  placeholder="Tell your users why they should use your app..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-medium text-xs resize-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Landing Page URL</label>
                <input 
                  name="landingPageUrl"
                  defaultValue={config.landingPageUrl || ""}
                  placeholder="https://ai-smm-backend.vercel.app/"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-medium text-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Admin Panel URL</label>
                <input 
                  name="adminPanelUrl"
                  defaultValue={config.adminPanelUrl || ""}
                  placeholder="https://ai-smm-backend.vercel.app/admin"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all font-medium text-xs"
                />
              </div>
            </div>
          </section>
          
          {/* Android Section */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
             <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                <Smartphone className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold">Android Application</h2>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Version</label>
                    <input name="android_appVersion" defaultValue={androidData.appVersion || "1.0.0"} className="w-full bg-transparent border-0 focus:ring-0 font-bold p-0 text-sm text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Build Code</label>
                    <input type="number" name="android_appVersionCode" defaultValue={androidData.appVersionCode || 1} className="w-full bg-transparent border-0 focus:ring-0 font-bold p-0 text-sm text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1.5 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                    <label className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Min Version</label>
                    <input name="android_forceUpdateVersion" defaultValue={androidData.forceUpdateVersion || "1.0.0"} className="w-full bg-transparent border-0 focus:ring-0 font-bold p-0 text-sm text-amber-600" />
                </div>
                <div className="space-y-1.5 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                    <label className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Min Build</label>
                    <input type="number" name="android_forceUpdateVersionCode" defaultValue={androidData.forceUpdateVersionCode || 1} className="w-full bg-transparent border-0 focus:ring-0 font-bold p-0 text-sm text-amber-600" />
                </div>
             </div>
             <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Store URL</label>
                    <input name="android_storeUrl" defaultValue={androidData.storeUrl || ""} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Update Notes</label>
                    <textarea name="android_updateDescription" defaultValue={androidData.updateDescription || ""} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium resize-none text-slate-900 dark:text-white" rows={2} />
                </div>
             </div>
          </section>

          {/* iOS Section */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
             <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                <Tablet className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold">iOS Application</h2>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Version</label>
                    <input name="ios_appVersion" defaultValue={iosData.appVersion || "1.0.0"} className="w-full bg-transparent border-0 focus:ring-0 font-bold p-0 text-sm text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Build Code</label>
                    <input type="number" name="ios_appVersionCode" defaultValue={iosData.appVersionCode || 1} className="w-full bg-transparent border-0 focus:ring-0 font-bold p-0 text-sm text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1.5 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Min Version</label>
                    <input name="ios_forceUpdateVersion" defaultValue={iosData.forceUpdateVersion || "1.0.0"} className="w-full bg-transparent border-0 focus:ring-0 font-bold p-0 text-sm text-blue-600" />
                </div>
                <div className="space-y-1.5 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Min Build</label>
                    <input type="number" name="ios_forceUpdateVersionCode" defaultValue={iosData.forceUpdateVersionCode || 1} className="w-full bg-transparent border-0 focus:ring-0 font-bold p-0 text-sm text-blue-600" />
                </div>
             </div>
             <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Store URL</label>
                    <input name="ios_storeUrl" defaultValue={iosData.storeUrl || ""} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Update Notes</label>
                    <textarea name="ios_updateDescription" defaultValue={iosData.updateDescription || ""} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium resize-none text-slate-900 dark:text-white" rows={2} />
                </div>
             </div>
          </section>
        </div>

        {/* Right: Controls Panel */}
        <div className="lg:col-span-4 space-y-8">
            
            {/* Actions Card */}
            <div className="bg-slate-900 dark:bg-white rounded-2xl p-6 text-white dark:text-slate-900 shadow-lg space-y-6">
                <h3 className="font-bold">Sync Actions</h3>
                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Configuration</span>
                </button>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center uppercase tracking-widest font-bold">Instantly applies changes</p>
                
                <div className="pt-4 border-t border-slate-800 dark:border-slate-100 mt-4 text-center">
                    <button 
                      type="button"
                      onClick={() => autoSetConfig()}
                      className="w-full bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-900 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-slate-700"
                    >
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span>Auto-Configure URLs</span>
                    </button>
                  <p className="text-[9px] text-slate-500 text-center mt-2">Auto-detects & sets your current domain</p>
                </div>
            </div>

            {/* Protocol Toggles */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center space-x-2">
                    <Cpu className="h-3 w-3" />
                    <span>System Protocols</span>
                 </h3>

                 <div className="space-y-5">
                    {[
                      { name: "Maintenance Mode", key: "maintenanceMode", icon: AlertTriangle, color: "amber" },
                      { name: "Global AI Responses", key: "globalAiEnabled", icon: Zap, color: "emerald" },
                      { name: "Developer Mode", key: "developerMode", icon: ShieldAlert, color: "rose" }
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`h-8 w-8 rounded-lg bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500`}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name={item.key}
                                    defaultChecked={(config as any)[item.key] || false}
                                    className="sr-only peer" 
                                />
                                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    ))}

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 pt-5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Lockdown Message</label>
                      <textarea 
                        name="maintenanceMessage"
                        defaultValue={config.maintenanceMessage || ""}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium resize-none text-slate-900 dark:text-white"
                        placeholder="Maintenance notification..."
                      />
                    </div>
                 </div>
            </div>
        </div>
      </form>
    </div>
  );
}
