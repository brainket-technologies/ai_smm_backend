import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Layers, Search, ShieldCheck, ShieldAlert, Zap, Filter, LayoutGrid } from "lucide-react";

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
  
  // Group flags by module
  const groupedFlags = flags.reduce((acc: any, flag) => {
    if (!acc[flag.moduleName]) acc[flag.moduleName] = [];
    acc[flag.moduleName].push(flag);
    return acc;
  }, {});

  const totalEnabled = flags.filter(f => f.isEnabled).length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Feature Management</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Surgically enable or disable application modules across all platforms in real-time. Changes are applied instantly to all active users.
          </p>
        </div>
        <div className="flex items-center space-x-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="px-4 py-2 bg-blue-50 dark:bg-blue-600/10 rounded-xl">
              <p className="text-[10px] font-black uppercase text-blue-600">Active Features</p>
              <p className="text-xl font-black">{totalEnabled}/{flags.length}</p>
           </div>
           <div className="px-4 py-2">
              <p className="text-[10px] font-black uppercase text-gray-400">Global Sync</p>
              <div className="flex items-center space-x-2">
                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-sm font-bold text-green-600">Live</span>
              </div>
           </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(groupedFlags).map(([moduleName, moduleFlags]: [string, any]) => (
          <div key={moduleName} className="bg-[var(--card-background)] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
            
            {/* Module Header */}
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-900/50">
               <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-600 shadow-sm">
                     <LayoutGrid className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black capitalize">{moduleName.replace('_', ' ')}</h3>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{moduleFlags.length} Features</p>
                  </div>
               </div>
               <div className={`h-2 w-2 rounded-full ${moduleFlags.some((f: any) => f.isEnabled) ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>

            {/* Features List */}
            <div className="p-6 space-y-3 flex-1">
               {moduleFlags.map((flag: any) => (
                 <div key={flag.id.toString()} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors group border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-gray-600 dark:text-gray-300 capitalize">{flag.featureKey.split('_').slice(1).join(' ')}</span>
                       <span className="text-[9px] font-mono text-gray-400 uppercase">{flag.featureKey}</span>
                    </div>
                    
                    <form action={toggleFeature.bind(null, flag.id, flag.isEnabled || false)}>
                       <button 
                        type="submit"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                           flag.isEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                       >
                         <span
                           className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                             flag.isEnabled ? 'translate-x-6' : 'translate-x-1'
                           }`}
                         />
                       </button>
                    </form>
                 </div>
               ))}
            </div>

            {/* Card Footer */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
               <button className="text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                  Bulk Edit
               </button>
               <Zap className="h-4 w-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {flags.length === 0 && (
        <div className="p-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
           <Layers className="h-16 w-16 text-slate-200 mx-auto mb-6" />
           <h3 className="text-xl font-bold mb-2">No Feature Flags Initialized</h3>
           <p className="text-gray-400 max-w-sm mx-auto">Please seed your database to populate the system feature modules.</p>
        </div>
      )}
    </div>
  );
}
