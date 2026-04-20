import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { 
  Settings, Save, AlertTriangle, Smartphone, Tablet, Globe, 
  ShieldAlert, Mail, Link as LinkIcon, Clock, Cpu, 
  CheckCircle2, AlertCircle, Zap, ShieldCheck
} from "lucide-react";

async function getConfig() {
  const config = await prisma.appConfig.findFirst({
    where: { id: BigInt(1) }
  });
  
  const platforms = await prisma.appPlatformConfig.findMany();
  
  return { config, platforms };
}

async function updateConfig(formData: FormData) {
  "use server";
  
  // Update App Config
  const appName = formData.get("appName") as string;
  const maintenanceMode = formData.get("maintenanceMode") === "on";
  const maintenanceMessage = formData.get("maintenanceMessage") as string;
  const developerMode = formData.get("developerMode") === "on";
  const globalAiEnabled = formData.get("globalAiEnabled") === "on";
  const supportEmail = formData.get("supportEmail") as string;
  const apiBaseUrl = formData.get("apiBaseUrl") as string;
  const freeTrialDays = parseInt(formData.get("freeTrialDays") as string) || 7;

  await prisma.appConfig.update({
    where: { id: BigInt(1) },
    data: {
      appName,
      maintenanceMode,
      maintenanceMessage,
      developerMode,
      globalAiEnabled,
      supportEmail,
      apiBaseUrl,
      freeTrialDays
    }
  });

  // Update Platforms
  const platforms = ['android', 'ios'];
  for (const plat of platforms) {
    const appVersion = formData.get(`${plat}_appVersion`) as string;
    const appVersionCode = parseInt(formData.get(`${plat}_appVersionCode`) as string) || 1;
    const forceUpdateVersion = formData.get(`${plat}_forceUpdateVersion`) as string;
    const forceUpdateVersionCode = parseInt(formData.get(`${plat}_forceUpdateVersionCode`) as string) || 1;
    const storeUrl = formData.get(`${plat}_storeUrl`) as string;
    const updateDescription = formData.get(`${plat}_updateDescription`) as string;

    await prisma.appPlatformConfig.upsert({
      where: { platform: plat },
      update: {
        appVersion,
        appVersionCode,
        forceUpdateVersion,
        forceUpdateVersionCode,
        storeUrl,
        updateDescription,
      },
      create: {
        platform: plat,
        appVersion,
        appVersionCode,
        forceUpdateVersion,
        forceUpdateVersionCode,
        storeUrl,
        updateDescription,
      }
    });
  }

  revalidatePath("/admin/config");
}

export default async function ConfigPage() {
  const { config, platforms } = await getConfig();

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="h-24 w-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Missing</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-sm font-medium">Please initialize the database using the seed script to start configuring your application.</p>
      </div>
    );
  }

  const getPlatData = (plat: string) => platforms.find(p => p.platform === plat) || {};
  const androidData = getPlatData('android') as any;
  const iosData = getPlatData('ios') as any;

  return (
    <div className="min-h-screen space-y-10 max-w-7xl mx-auto pb-24 animate-in fade-in duration-1000">
      
      {/* Premium Hero Header */}
      <header className="relative py-12 px-10 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-emerald-500/5 group">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-45">
            <Settings className="h-64 w-64 text-emerald-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Zap className="h-3 w-3 fill-current" />
                    <span>Global Control Center</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                    System <span className="text-emerald-500">Config</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg text-sm font-medium leading-relaxed">
                    Orchestrate your entire application ecosystem. Manage global engine settings, versioning protocols, and operational safety.
                </p>
            </div>
            
            <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase">System Status</span>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className={`h-2 w-2 rounded-full ${config.maintenanceMode ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{config.maintenanceMode ? 'Maintenance' : 'Operational'}</span>
                    </div>
                </div>
            </div>
        </div>
      </header>

      <form action={updateConfig} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-10">
          
          {/* General Engine Card */}
          <section className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-10 transition-all hover:bg-white dark:hover:bg-slate-900 duration-500 group">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <Globe className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">General Engine</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Global Foundation</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Application Identity</label>
                <div className="relative group/input">
                    <input 
                      name="appName"
                      defaultValue={config.appName}
                      placeholder="e.g. AI Social Hero"
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Operational Support</label>
                <div className="relative group/input">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors" />
                    <input 
                      name="supportEmail"
                      defaultValue={config.supportEmail || ""}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      placeholder="support@domain.com"
                    />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Endpoint Gateway (API)</label>
                    <div className="relative group/input">
                        <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          name="apiBaseUrl"
                          defaultValue={config.apiBaseUrl || ""}
                          className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-xs text-slate-600 dark:text-slate-400"
                          placeholder="https://api.gateway.com"
                        />
                    </div>
                </div>
                <div className="space-y-3 text-emerald-600">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Retainment Window (Trial)</label>
                    <div className="relative group/input">
                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        <input 
                          type="number"
                          name="freeTrialDays"
                          defaultValue={config.freeTrialDays || 7}
                          className="w-full pl-14 pr-16 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-black text-lg"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-slate-400">Days</span>
                    </div>
                </div>
            </div>
          </section>

          {/* Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Android Module */}
              <section className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 overflow-hidden relative group">
                 <div className="absolute -bottom-10 -right-10 opacity-5 -rotate-12 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-0">
                    <Smartphone className="h-40 w-40 text-emerald-500" />
                 </div>
                 <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Android</h2>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tighter">Google Play</span>
                 </div>
                 
                 <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Current Ver</label>
                            <input name="android_appVersion" defaultValue={androidData.appVersion || "1.0.0"} className="w-full px-3 py-2 rounded-xl bg-transparent border-b border-transparent focus:border-emerald-500 outline-none font-black text-slate-800 dark:text-slate-100 text-sm transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Build ID</label>
                            <input type="number" name="android_appVersionCode" defaultValue={androidData.appVersionCode || 1} className="w-full px-3 py-2 rounded-xl bg-transparent border-b border-transparent focus:border-emerald-500 outline-none font-black text-slate-800 dark:text-slate-100 text-sm transition-all" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <div className="space-y-1.5 text-amber-600">
                            <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest pl-1">Critical Min</label>
                            <input name="android_forceUpdateVersion" defaultValue={androidData.forceUpdateVersion || "1.0.0"} className="w-full px-3 py-2 rounded-xl bg-transparent border-b border-transparent focus:border-amber-500 outline-none font-black text-amber-600 text-sm transition-all" />
                        </div>
                        <div className="space-y-1.5 text-amber-600">
                            <label className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest pl-1">Min Build</label>
                            <input type="number" name="android_forceUpdateVersionCode" defaultValue={androidData.forceUpdateVersionCode || 1} className="w-full px-3 py-2 rounded-xl bg-transparent border-b border-transparent focus:border-amber-500 outline-none font-black text-amber-600 text-sm transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Store URL</label>
                        <input name="android_storeUrl" defaultValue={androidData.storeUrl || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none font-medium text-[10px] text-slate-500 truncate" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Changelog Directive</label>
                        <textarea name="android_updateDescription" defaultValue={androidData.updateDescription || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none font-medium text-[10px] text-slate-500 resize-none h-20" />
                    </div>
                 </div>
              </section>

              {/* iOS Module */}
              <section className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 overflow-hidden relative group">
                 <div className="absolute -bottom-10 -right-10 opacity-5 -rotate-12 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-0">
                    <Tablet className="h-40 w-40 text-blue-500" />
                 </div>
                 <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                            <Tablet className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">iOS</h2>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tighter">App Store</span>
                 </div>
                 
                 <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Current Ver</label>
                            <input name="ios_appVersion" defaultValue={iosData.appVersion || "1.0.0"} className="w-full px-3 py-2 rounded-xl bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-slate-800 dark:text-slate-100 text-sm transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Build ID</label>
                            <input type="number" name="ios_appVersionCode" defaultValue={iosData.appVersionCode || 1} className="w-full px-3 py-2 rounded-xl bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-slate-800 dark:text-slate-100 text-sm transition-all" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                        <div className="space-y-1.5 text-indigo-600">
                            <label className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest pl-1">Critical Min</label>
                            <input name="ios_forceUpdateVersion" defaultValue={iosData.forceUpdateVersion || "1.0.0"} className="w-full px-3 py-2 rounded-xl bg-transparent border-b border-transparent focus:border-indigo-500 outline-none font-black text-indigo-600 text-sm transition-all" />
                        </div>
                        <div className="space-y-1.5 text-indigo-600">
                            <label className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest pl-1">Min Build</label>
                            <input type="number" name="ios_forceUpdateVersionCode" defaultValue={iosData.forceUpdateVersionCode || 1} className="w-full px-3 py-2 rounded-xl bg-transparent border-b border-transparent focus:border-indigo-500 outline-none font-black text-indigo-600 text-sm transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Store URL</label>
                        <input name="ios_storeUrl" defaultValue={iosData.storeUrl || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none font-medium text-[10px] text-slate-500 truncate" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Changelog Directive</label>
                        <textarea name="ios_updateDescription" defaultValue={iosData.updateDescription || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none font-medium text-[10px] text-slate-500 resize-none h-20" />
                    </div>
                 </div>
              </section>
          </div>
        </div>

        {/* Control Center Side Panel */}
        <div className="xl:col-span-4 space-y-10">
            
            {/* Sync Command Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 scale-125 group-hover:rotate-12 transition-transform duration-700">
                    <ShieldCheck className="h-32 w-32" />
                </div>
                <div className="relative z-10 space-y-10">
                    <div>
                        <h3 className="text-2xl font-black mb-3 italic">Sync Command</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider">Submit configuration to the primary node. This action is atomic across all clusters.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <button 
                          type="submit"
                          className="w-full group/btn relative bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-5 rounded-3xl font-black text-sm active:scale-95 transition-all flex items-center justify-center space-x-3 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                          <Save className="h-5 w-5" />
                          <span>SYNCHRONIZE</span>
                        </button>
                        <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-[0.25em]">Press to apply changes instantly</p>
                    </div>
                </div>
            </div>

            {/* High Priority Protocols */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
                 <div className="flex items-center space-x-3">
                    <Cpu className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Protocols</h3>
                 </div>

                 <div className="space-y-6">
                    {[
                      { name: "Maintenance", key: "maintenanceMode", icon: AlertTriangle, color: "amber", desc: "Locks app for all users" },
                      { name: "Global AI Engine", key: "globalAiEnabled", icon: Zap, color: "emerald", desc: "Activates neural responses" },
                      { name: "Developer Mode", key: "developerMode", icon: ShieldAlert, color: "rose", desc: "Exposes diagnostic hooks" }
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 group/protocol transition-all hover:border-emerald-500/20">
                            <div className="flex items-center space-x-4">
                                <div className={`h-11 w-11 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500 border border-${item.color}-500/20 transition-all group-hover/protocol:scale-105`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{item.name}</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-none mt-1">{item.desc}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                name={item.key}
                                defaultChecked={(config as any)[item.key] || false}
                                className="sr-only peer" 
                              />
                              <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    ))}

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center space-x-2 px-1">
                        <Mail className="h-3 w-3 text-amber-500" />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lock Message</label>
                      </div>
                      <textarea 
                        name="maintenanceMessage"
                        defaultValue={config.maintenanceMessage || ""}
                        rows={3}
                        className="w-full px-5 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all resize-none text-[10px] font-bold text-slate-600 dark:text-slate-400 italic"
                        placeholder="Communication for maintenance downtime..."
                      />
                    </div>
                 </div>
                 
                 <div className="p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                    <div className="flex items-start space-x-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed uppercase tracking-tight">System validation active. All changes are digitally signed and verified before persistence.</p>
                    </div>
                 </div>
            </div>
        </div>
      </form>
    </div>
  );
}
