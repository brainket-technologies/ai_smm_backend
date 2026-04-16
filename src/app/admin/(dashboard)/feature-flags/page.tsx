import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Layers, Plus, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";

async function getFeatureFlags() {
  return await prisma.appFeatureFlag.findMany({
    orderBy: { moduleName: 'asc' }
  });
}

async function toggleFeature(id: bigint, isEnabled: boolean) {
  "use server";
  await prisma.appFeatureFlag.update({
    where: { id },
    data: { isEnabled: !isEnabled }
  });
  revalidatePath("/admin/feature-flags");
}

export default async function FeatureFlagsPage() {
  const flags = await getFeatureFlags();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Feature Flags</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Control the visibility and availability of app modules in real-time.
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20">
          <Plus className="h-5 w-5" />
          <span>Add New Flag</span>
        </button>
      </div>

      <div className="bg-[var(--card-background)] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold uppercase tracking-widest text-gray-500">
           <div className="col-span-4 px-4">Module Name</div>
           <div className="col-span-4">Feature Key</div>
           <div className="col-span-2 text-center">Status</div>
           <div className="col-span-2 text-right px-4">Actions</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {flags.map((flag) => (
            <div key={flag.id.toString()} className="grid grid-cols-12 gap-4 p-5 items-center group hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-all">
              <div className="col-span-4 px-4">
                 <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                       <Layers className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{flag.moduleName}</span>
                 </div>
              </div>
              <div className="col-span-4">
                 <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
                    {flag.featureKey}
                 </code>
              </div>
              <div className="col-span-2 flex justify-center">
                 <form action={toggleFeature.bind(null, flag.id, flag.isEnabled || false)}>
                   <button 
                    type="submit"
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                        flag.isEnabled 
                        ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500" 
                        : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500"
                    }`}
                   >
                     {flag.isEnabled ? (
                        <>
                          <ShieldCheck className="h-3 w-3" />
                          <span>Enabled</span>
                        </>
                     ) : (
                        <>
                          <ShieldAlert className="h-3 w-3" />
                          <span>Disabled</span>
                        </>
                     )}
                   </button>
                 </form>
              </div>
              <div className="col-span-2 text-right px-4">
                 <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                 </button>
              </div>
            </div>
          ))}

          {flags.length === 0 && (
            <div className="p-20 text-center text-gray-400 italic">
               No feature flags found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
