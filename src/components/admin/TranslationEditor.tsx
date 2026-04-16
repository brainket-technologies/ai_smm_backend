"use client";

import { useState } from "react";
import { Plus, Trash2, Search, Save, History, AlertCircle } from "lucide-react";

interface TranslationEditorProps {
  initialTranslations: Record<string, string>;
  languageCode: string;
  saveAction: (formData: FormData) => Promise<void>;
}

export default function TranslationEditor({ 
  initialTranslations, 
  languageCode,
  saveAction 
}: TranslationEditorProps) {
  const [translations, setTranslations] = useState<[string, string][]>(
    Object.entries(initialTranslations)
  );
  const [search, setSearch] = useState("");
  const [isPending, setIsPending] = useState(false);

  const filteredTranslations = translations.filter(([key, value]) => 
    key.toLowerCase().includes(search.toLowerCase()) || 
    value.toLowerCase().includes(search.toLowerCase())
  );

  const addRow = () => {
    setTranslations([["", ""], ...translations]);
  };

  const removeRow = (index: number) => {
    const newTranslations = [...translations];
    newTranslations.splice(index, 1);
    setTranslations(newTranslations);
  };

  const updateKey = (index: number, newKey: string) => {
    const newTranslations = [...translations];
    newTranslations[index][0] = newKey;
    setTranslations(newTranslations);
  };

  const updateValue = (index: number, newValue: string) => {
    const newTranslations = [...translations];
    newTranslations[index][1] = newValue;
    setTranslations(newTranslations);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData();
    formData.append("languageCode", languageCode);
    
    translations.forEach(([key, value]) => {
      if (key.trim()) {
        formData.append("keys[]", key.trim());
        formData.append("values[]", value);
      }
    });

    try {
      await saveAction(formData);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save translations. Please check console.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--card-background)] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
           <input 
            placeholder="Search keywords or translations..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 text-sm"
           />
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
           <button 
            onClick={addRow}
            type="button"
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-6 py-3 rounded-xl font-bold transition-all text-sm"
           >
              <Plus className="h-4 w-4" />
              <span>Add Key</span>
           </button>
           <button 
            type="submit"
            form="translation-form"
            disabled={isPending}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 ${isPending ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 text-sm`}
           >
              {isPending ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isPending ? "Saving..." : "Save All"}</span>
           </button>
        </div>
      </div>

      <form id="translation-form" onSubmit={handleSubmit}>
        <div className="bg-[var(--card-background)] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-gray-500">
             <div className="col-span-5 px-2">Identifier (Key)</div>
             <div className="col-span-6 px-2">Value (Localized)</div>
             <div className="col-span-1 text-center font-bold">Action</div>
          </div>

          <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTranslations.length > 0 ? filteredTranslations.map(([key, value], idx) => (
              <div key={idx} className="grid grid-cols-12 p-3 items-center group hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all">
                <div className="col-span-5 px-2">
                   <input 
                    value={key}
                    onChange={(e) => updateKey(idx, e.target.value)}
                    placeholder="New string key..."
                    className="w-full bg-transparent font-mono text-xs text-gray-600 dark:text-gray-300 outline-none focus:text-blue-600"
                   />
                </div>
                <div className="col-span-6 px-2">
                   <input 
                    value={value}
                    onChange={(e) => updateValue(idx, e.target.value)}
                    placeholder="Enter translated text..."
                    className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg text-sm transition-all focus:ring-1 focus:ring-blue-500 outline-none border border-transparent focus:border-blue-500/20"
                   />
                </div>
                <div className="col-span-1 flex justify-center">
                   <button 
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                </div>
              </div>
            )) : (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-4">
                 <AlertCircle className="h-10 w-10 opacity-20" />
                 <p className="italic text-sm">No translations found matching your search</p>
                 <button onClick={() => setSearch("")} className="text-blue-600 font-bold text-xs hover:underline">Clear Search</button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
           <div className="flex items-center space-x-3 text-xs text-gray-500">
              <History className="h-4 w-4" />
              <span>Tip: Meaningful keys (like `dashboard_title`) help maintainability.</span>
           </div>
           <p className="text-xs font-bold text-gray-400">
             Total Strings: <span className="text-blue-600">{translations.length}</span>
           </p>
        </div>
      </form>
    </div>
  );
}
