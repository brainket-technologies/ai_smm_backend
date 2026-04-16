import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Settings, Save, AlertTriangle } from "lucide-react";

async function getConfig() {
  return await prisma.appConfig.findFirst({
    where: { id: BigInt(1) }
  });
}

async function updateConfig(formData: FormData) {
  "use server";
  
  const appName = formData.get("appName") as string;
  const maintenanceMode = formData.get("maintenanceMode") === "on";
  const maintenanceMessage = formData.get("maintenanceMessage") as string;
  const supportEmail = formData.get("supportEmail") as string;
  const apiBaseUrl = formData.get("apiBaseUrl") as string;
  const globalAiEnabled = formData.get("globalAiEnabled") === "on";

  await prisma.appConfig.update({
    where: { id: BigInt(1) },
    data: {
      appName,
      maintenanceMode,
      maintenanceMessage,
      supportEmail,
      apiBaseUrl,
      globalAiEnabled
    }
  });

  revalidatePath("/admin/config");
}

export default async function ConfigPage() {
  const config = await getConfig();

  if (!config) {
    return <div>Configuration not found. Please run seed script.</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage global settings, maintenance status, and API endpoints.
          </p>
        </div>
        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
          <Settings className="h-6 w-6" />
        </div>
      </div>

      <form action={updateConfig} className="space-y-6">
        <div className="bg-[var(--card-background)] rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          {/* Main settings section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">App Name</label>
              <input 
                name="appName"
                defaultValue={config.appName}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. BrandBoost AI"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Support Email</label>
              <input 
                name="supportEmail"
                defaultValue={config.supportEmail || ""}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="support@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">API Base URL</label>
            <input 
              name="apiBaseUrl"
              defaultValue={config.apiBaseUrl || ""}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="https://api.example.com/v1"
            />
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Maintenance Toggle Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
               <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-amber-100 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Maintenance Mode</h3>
                    <p className="text-xs text-gray-500">Redirect users to a maintenance screen</p>
                  </div>
               </div>
               <input 
                type="checkbox" 
                name="maintenanceMode"
                defaultChecked={config.maintenanceMode || false}
                className="w-12 h-6 rounded-full bg-slate-200 appearance-none checked:bg-amber-500 relative transition-all cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-7 before:transition-all"
               />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Maintenance Message</label>
              <textarea 
                name="maintenanceMessage"
                defaultValue={config.maintenanceMessage || ""}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="We're currently updating the app. Please check back in a few minutes."
              />
            </div>
          </div>

          {/* AI Toggle */}
          <div className="flex items-center justify-between p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20">
             <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                  <Save className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">Global AI Enabled</h3>
                  <p className="text-xs text-gray-500">Master switch for all AI generations</p>
                </div>
             </div>
             <input 
              type="checkbox" 
              name="globalAiEnabled"
              defaultChecked={config.globalAiEnabled || true}
              className="w-12 h-6 rounded-full bg-slate-200 appearance-none checked:bg-blue-600 relative transition-all cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-7 before:transition-all"
             />
          </div>

        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Save className="h-5 w-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
