import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Languages, Plus, Trash2, Edit3, Save, Globe } from "lucide-react";
import Link from "next/link";

async function getLanguages() {
  const languages = await prisma.appTranslation.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  return languages.map(lang => ({
    ...lang,
    id: lang.id.toString()
  }));
}

export default async function TranslationsPage() {
  const languages = await getLanguages();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Localization Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage app languages, translations, and default localization settings.
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20">
          <Plus className="h-5 w-5" />
          <span>Add Language</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((lang) => (
          <div key={lang.id.toString()} className="bg-[var(--card-background)] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            {lang.isDefault && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-sm">
                Default
              </div>
            )}
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-14 w-14 rounded-full border-4 border-slate-50 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                 {lang.flagUrl ? (
                    <img src={lang.flagUrl} alt={lang.displayName || ""} className="h-full w-full object-cover" />
                 ) : (
                    <span>{lang.languageCode.toUpperCase()}</span>
                 )}
              </div>
              <div>
                <h3 className="font-bold text-lg">{lang.displayName}</h3>
                <p className="text-sm text-gray-400 font-mono uppercase">{lang.languageCode}-{lang.countryCode}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 mb-6">
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Status</span>
                  <span className={lang.isActive ? "text-green-500 text-sm font-bold" : "text-red-500 text-sm font-bold"}>
                    {lang.isActive ? "● Active" : "● Inactive"}
                  </span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Total Strings</span>
                  <span className="text-sm font-bold">
                    {Object.keys(lang.translations as object || {}).length}
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <Link 
                href={`/admin/translations/${lang.languageCode}`}
                className="flex-1 flex items-center justify-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95"
               >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Strings</span>
               </Link>
               <button className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 className="h-5 w-5" />
               </button>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Card */}
        <button className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center space-y-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
              <Plus className="h-8 w-8" />
            </div>
            <div className="text-center">
              <h3 className="font-bold">Add New Language</h3>
              <p className="text-sm text-gray-400">Expand your app's global reach</p>
            </div>
        </button>
      </div>
    </div>
  );
}
