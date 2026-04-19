"use client";

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  Search,
  CheckCircle2,
  X,
  Save,
  Layers,
  History,
  Terminal,
  Type
} from 'lucide-react';
import { upsertAIPrompt, togglePromptStatus, deleteAIPrompt } from './actions';
import DataManagementToolbar from '@/components/admin/DataManagementToolbar';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type AIPrompt = {
  id: string;
  promptKey: string;
  moduleName: string | null;
  systemInstruction: string | null;
  userPromptTemplate: string | null;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AIPromptManagementClient({ initialPrompts }: { initialPrompts: AIPrompt[] }) {
  const [prompts, setPrompts] = useState<AIPrompt[]>(initialPrompts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Partial<AIPrompt> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPrompts = prompts.filter(p =>
    p.promptKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.moduleName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await togglePromptStatus(id, currentStatus);
    if (res.success) {
      setPrompts(prompts.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    } else {
      alert(res.error || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt template? This may break features using it.")) return;
    const res = await deleteAIPrompt(id);
    if (res.success) {
      setPrompts(prompts.filter(p => p.id !== id));
    } else {
      alert(res.error || "Failed to delete prompt");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await upsertAIPrompt(editingPrompt);
    if (res.success) {
      window.location.reload(); 
    } else {
      alert(res.error || "Failed to save prompt");
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPrompt({
      promptKey: '',
      moduleName: 'General',
      systemInstruction: '',
      userPromptTemplate: '',
      version: 1,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prompt: AIPrompt) => {
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleExport = (format: 'csv' | 'json') => {
    const fname = `ai_prompts_${Date.now()}.${format}`;
    const content = format === 'json'
      ? "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prompts, null, 2))
      : "data:text/csv;charset=utf-8," + encodeURIComponent(['ID,Module,Key,Version,Status', ...prompts.map(p => `"${p.id}","${p.moduleName}","${p.promptKey}","${p.version}","${p.isActive}"`)].join('\n'));
    
    const el = document.createElement('a');
    el.setAttribute("href", content);
    el.setAttribute("download", fname);
    document.body.appendChild(el);
    el.click();
    el.remove();
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Terminal className="h-8 w-8 text-accent" />
            <span>AI Prompt Engineering</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">Manage global system instructions and user prompt templates.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-lg transition-all font-bold text-sm shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Prompt</span>
        </button>
      </div>

      {/* Toolbar */}
      <DataManagementToolbar
        onSearch={setSearchQuery}
        onFilterChange={() => {}}
        filterOptions={[]}
        onExport={handleExport as any}
        onImport={() => alert("Prompt import not implemented")}
        dataCount={filteredPrompts.length}
        itemName="prompts"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Prompt Reference</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4 text-center">Version</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPrompts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                         <FileText className="h-4.5 w-4.5 text-slate-400 group-hover:text-accent transition-colors" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight font-mono">{p.promptKey}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {p.moduleName || 'Unassigned'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono font-bold text-slate-500">v{p.version}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleToggleStatus(p.id, p.isActive)}
                        className={cn(
                          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
                          p.isActive ? "bg-accent" : "bg-slate-200 dark:bg-slate-800"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                          p.isActive ? "translate-x-5.5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="Edit Prompt"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Prompt"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPrompts.length === 0 && (
          <div className="py-20 text-center">
             <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                <History className="h-8 w-8 text-slate-300" />
             </div>
             <p className="text-slate-500 text-sm font-medium">No prompts configured for this criteria.</p>
          </div>
        )}
      </div>

      {/* Edit/Add Modal - Simplified Version */}
      {isModalOpen && editingPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => !isLoading && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  {editingPrompt.id ? 'Refine Prompt Engineering' : 'Initialize New Protocol'}
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-5">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Unique Prompt Identifier</label>
                      <input 
                        required
                        value={editingPrompt.promptKey || ''}
                        onChange={(e) => setEditingPrompt({...editingPrompt, promptKey: e.target.value})}
                        placeholder="e.g. marketing_seo_post"
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm font-mono dark:text-white"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Functional Module</label>
                      <input 
                        required
                        value={editingPrompt.moduleName || ''}
                        onChange={(e) => setEditingPrompt({...editingPrompt, moduleName: e.target.value})}
                        placeholder="e.g. Marketing"
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm font-bold dark:text-white"
                      />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">System Instruction (Persona & Constraints)</label>
                   <textarea 
                     rows={4}
                     value={editingPrompt.systemInstruction || ''}
                     onChange={(e) => setEditingPrompt({...editingPrompt, systemInstruction: e.target.value})}
                     placeholder="Define the AI's persona, rules, and tone..."
                     className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm leading-relaxed dark:text-white resize-none font-medium"
                   />
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">User Prompt Template (Data Placeholders)</label>
                   <textarea 
                     rows={5}
                     value={editingPrompt.userPromptTemplate || ''}
                     onChange={(e) => setEditingPrompt({...editingPrompt, userPromptTemplate: e.target.value})}
                     placeholder="Use {businessName}, {inputData} as variables..."
                     className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm leading-relaxed dark:text-white resize-none font-medium"
                   />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Protocol Version:</span>
                       <input 
                         type="number"
                         value={editingPrompt.version || 1}
                         onChange={(e) => setEditingPrompt({...editingPrompt, version: parseInt(e.target.value)})}
                         className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center text-xs font-mono font-bold dark:text-white"
                       />
                    </div>
                    <div className="flex items-center space-x-2">
                       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">isActive:</span>
                       <button 
                        type="button"
                        onClick={() => setEditingPrompt({...editingPrompt, isActive: !editingPrompt.isActive})}
                        className={cn(
                          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
                          editingPrompt.isActive ? "bg-accent shadow-sm" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200",
                          editingPrompt.isActive ? "translate-x-5.5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-lg font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-slate-400 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Deploy Protocol</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
