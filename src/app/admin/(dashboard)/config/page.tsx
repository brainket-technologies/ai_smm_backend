import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Settings, Save, AlertTriangle, Smartphone, Tablet, Globe, ShieldAlert, Mail, Link as LinkIcon, Clock } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold italic">Missing Configuration</h2>
        <p className="text-gray-500 mt-2">Please run the seed script to initialize the system settings.</p>
      </div>
    );
  }

  const getPlatData = (plat: string) => platforms.find(p => p.platform === plat) || {};

  const androidData = getPlatData('android') as any;
  const iosData = getPlatData('ios') as any;

  return (
    <div className="space-y-8 max-w-6xl pb-20 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            System Configuration
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Manage global app behavior, platform versions, and system maintenance.
          </p>
        </div>
        <div className="h-14 w-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-600/20 shadow-inner">
          <Settings className="h-7 w-7" />
        </div>
      </div>

      <form action={updateConfig} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Global Settings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main App Settings Card */}
          <section className="bg-[var(--card-background)] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8 relative overflow-hidden">
            <div className="flex items-center space-x-3 mb-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-bold">General Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-400">App Name</label>
                <div className="relative group">
                    <input 
                    name="appName"
                    defaultValue={config.appName}
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-400">Support Email</label>
                <div className="relative group">
                    <input 
                    name="supportEmail"
                    defaultValue={config.supportEmail || ""}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                    placeholder="support@example.com"
                    />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400">API Base URL</label>
                    <input 
                    name="apiBaseUrl"
                    defaultValue={config.apiBaseUrl || ""}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400">Free Trial Days</label>
                    <div className="relative flex items-center">
                        <input 
                        type="number"
                        name="freeTrialDays"
                        defaultValue={config.freeTrialDays || 7}
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                        />
                        <Clock className="absolute right-4 h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Maintenance & Switches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "Global AI", key: "globalAiEnabled", icon: Save, desc: "AI Switch", color: "blue" },
                  { name: "Developer", key: "developerMode", icon: ShieldAlert, desc: "Debug Tools", color: "red" },
                  { name: "Maintenance", key: "maintenanceMode", icon: AlertTriangle, desc: "App Lockdown", color: "amber" }
                ].map((item) => (
                    <div key={item.key} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-500/10 text-${item.color}-600`}>
                                <item.icon className="h-4 w-4" />
                            </div>
                            <input 
                                type="checkbox" 
                                name={item.key}
                                defaultChecked={(config as any)[item.key] || false}
                                className="w-10 h-5 rounded-full bg-slate-300 appearance-none checked:bg-blue-600 relative transition-all cursor-pointer before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-6 before:transition-all"
                            />
                        </div>
                        <h4 className="font-black text-sm">{item.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400">Maintenance Message</label>
              <textarea 
                name="maintenanceMessage"
                defaultValue={config.maintenanceMessage || ""}
                rows={3}
                className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none font-medium"
                placeholder="Message shown during maintenance..."
              />
            </div>
          </section>

          {/* Android Section */}
          <section className="bg-white dark:bg-slate-950 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Smartphone className="h-6 w-6 text-green-500" />
                    <h2 className="text-xl font-black">Android Version Control</h2>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase">Play Store</span>
             </div>
             
             {(() => {
                const data = androidData;
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Current Ver</label>
                                <input name="android_appVersion" defaultValue={data.appVersion || "1.0.0"} className="w-full px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Ver Code</label>
                                <input type="number" name="android_appVersionCode" defaultValue={data.appVersionCode || 1} className="w-full px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-bold" />
                            </div>
                            <div className="space-y-1.5 text-amber-600">
                                <label className="text-[10px] font-black text-amber-500 uppercase">Min Ver</label>
                                <input name="android_forceUpdateVersion" defaultValue={data.forceUpdateVersion || "1.0.0"} className="w-full px-4 py-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10 outline-none font-bold italic" />
                            </div>
                            <div className="space-y-1.5 text-amber-600">
                                <label className="text-[10px] font-black text-amber-500 uppercase">Min Code</label>
                                <input type="number" name="android_forceUpdateVersionCode" defaultValue={data.forceUpdateVersionCode || 1} className="w-full px-4 py-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10 outline-none font-bold italic" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Store URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input name="android_storeUrl" defaultValue={data.storeUrl || ""} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-medium text-sm" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Update Note</label>
                            <textarea name="android_updateDescription" defaultValue={data.updateDescription || ""} className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-medium text-xs resize-none" rows={2} />
                        </div>
                    </div>
                )
             })()}
          </section>

          {/* iOS Section */}
          <section className="bg-white dark:bg-slate-950 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Tablet className="h-6 w-6 text-blue-500" />
                    <h2 className="text-xl font-black">iOS Version Control</h2>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-black uppercase">App Store</span>
             </div>
             
             {(() => {
                const data = iosData;
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Current Ver</label>
                                <input name="ios_appVersion" defaultValue={data.appVersion || "1.0.0"} className="w-full px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Ver Code</label>
                                <input type="number" name="ios_appVersionCode" defaultValue={data.appVersionCode || 1} className="w-full px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-bold" />
                            </div>
                            <div className="space-y-1.5 text-blue-600">
                                <label className="text-[10px] font-black text-blue-500 uppercase">Min Ver</label>
                                <input name="ios_forceUpdateVersion" defaultValue={data.forceUpdateVersion || "1.0.0"} className="w-full px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 outline-none font-bold italic" />
                            </div>
                            <div className="space-y-1.5 text-blue-600">
                                <label className="text-[10px] font-black text-blue-500 uppercase">Min Code</label>
                                <input type="number" name="ios_forceUpdateVersionCode" defaultValue={data.forceUpdateVersionCode || 1} className="w-full px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 outline-none font-bold italic" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Store URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input name="ios_storeUrl" defaultValue={data.storeUrl || ""} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-medium text-sm" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Update Note</label>
                            <textarea name="ios_updateDescription" defaultValue={data.updateDescription || ""} className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none font-medium text-xs resize-none" rows={2} />
                        </div>
                    </div>
                )
             })()}
          </section>
        </div>

        {/* Right Column: Actions & Help */}
        <div className="space-y-8">
            <div className="bg-slate-900 dark:bg-white rounded-3xl p-8 text-white dark:text-slate-900 shadow-2xl relative group overflow-hidden">
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-600 blur-[80px] opacity-30 group-hover:opacity-60 transition-all"></div>
                <h3 className="text-xl font-bold mb-2">Save Settings</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-8 leading-relaxed font-medium">Changes here will reflect across the entire platform and user apps instantly.</p>
                <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                <Save className="h-5 w-5" />
                <span>SYNC CHANGES</span>
                </button>
            </div>

            <div className="bg-[var(--card-background)] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-6">
                <h4 className="font-bold flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <span>Deployment Protocol</span>
                </h4>
                <ul className="space-y-4">
                    {[
                        "Maintenance kills all active sessions.",
                        "Vers Codes must increment.",
                        "Force updates are blocking.",
                        "Free trial affects new signups."
                    ].map((txt, i) => (
                        <li key={i} className="flex items-start space-x-3 text-[11px] font-medium text-gray-500 uppercase tracking-tight">
                            <span className="h-1.5 w-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mt-1 shrink-0"></span>
                            <span>{txt}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </form>
    </div>
  );
}
