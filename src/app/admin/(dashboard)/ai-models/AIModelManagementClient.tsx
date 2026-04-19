"use client";

import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Edit2, 
  Database, 
  Cpu, 
  Zap, 
  DollarSign, 
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Save,
  Globe,
  Settings2,
  Box
} from 'lucide-react';
import { upsertAIModel, toggleModelStatus, deleteAIModel } from './actions';
import DataManagementToolbar from '@/components/admin/DataManagementToolbar';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type AIModel = {
  id: string;
  modelKey: string;
  provider: string;
  modelType: string;
  isActive: boolean;
  apiKey: string | null;
  contextWindow: number | null;
  maxTokens: number | null;
  inputCostPer1k: number;
  outputCostPer1k: number;
  config: any;
  createdAt: string;
};

export default function AIModelManagementClient({ initialModels }: { initialModels: AIModel[] }) {
  const [models, setModels] = useState<AIModel[]>(initialModels);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Partial<AIModel> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredModels = models.filter(m =>
    m.modelKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.modelType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleModelStatus(id, currentStatus);
    if (res.success) {
      setModels(models.map(m => m.id === id ? { ...m, isActive: !currentStatus } : m));
    } else {
      alert(res.error || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this AI model configuration? This cannot be undone.")) return;
    const res = await deleteAIModel(id);
    if (res.success) {
      setModels(models.filter(m => m.id !== id));
    } else {
      alert(res.error || "Failed to delete model");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await upsertAIModel(editingModel);
    if (res.success) {
      // For simplicity, we'll re-fetch or reload. 
      // Ideally update local state with returned object or re-trigger server action.
      window.location.reload(); 
    } else {
      alert(res.error || "Failed to save model");
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingModel({
      modelKey: '',
      provider: 'OpenAI',
      modelType: 'text-generation',
      isActive: true,
      apiKey: '',
      contextWindow: 128000,
      maxTokens: 4096,
      inputCostPer1k: 0,
      outputCostPer1k: 0,
      config: {}
    });
    setIsModalOpen(true);
  };

  const openEditModal = (model: AIModel) => {
    setEditingModel(model);
    setIsModalOpen(true);
  };

  const handleExport = (format: 'csv' | 'json') => {
    const fname = `ai_models_${Date.now()}.${format}`;
    const content = format === 'json'
      ? "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(models, null, 2))
      : "data:text/csv;charset=utf-8," + encodeURIComponent(['ID,Provider,Key,Type,Status,InputCost,OutputCost', ...models.map(m => `"${m.id}","${m.provider}","${m.modelKey}","${m.modelType}","${m.isActive}","${m.inputCostPer1k}","${m.outputCostPer1k}"`)].join('\n'));
    
    const el = document.createElement('a');
    el.setAttribute("href", content);
    el.setAttribute("download", fname);
    document.body.appendChild(el);
    el.click();
    el.remove();
  };

  const getProviderBadge = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes('openai')) return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    if (p.includes('anthropic')) return "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
    if (p.includes('google')) return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
    return "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-accent" />
            <span>AI Model Engine</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">Configure and manage AI providers, models, and usage costs.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-2xl transition-all shadow-lg shadow-accent/25 font-black uppercase tracking-widest text-[10px]"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Model</span>
        </button>
      </div>

      {/* Toolbar */}
      <DataManagementToolbar
        onSearch={setSearchQuery}
        onFilterChange={() => {}}
        filterOptions={[]}
        onExport={handleExport as any}
        onImport={() => alert("Import not implemented")}
        dataCount={filteredModels.length}
        itemName="models"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-5">Model Details</th>
                <th className="px-6 py-5">Core Specs</th>
                <th className="px-6 py-5">Cost Structure ($/1K)</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredModels.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform">
                         {m.provider.toLowerCase().includes('openai') ? <Zap className="h-6 w-6 text-emerald-500" /> : <Cpu className="h-6 w-6 text-accent" />}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{m.modelKey}</span>
                           <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border", getProviderBadge(m.provider))}>
                              {m.provider}
                           </span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{m.modelType}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex flex-col space-y-1.5 text-[11px]">
                        <div className="flex items-center text-slate-500">
                           <Globe className="h-3.5 w-3.5 mr-1.5 opacity-50 text-accent" />
                           <span className="font-bold">Context:</span>
                           <span className="ml-1 text-slate-900 dark:text-slate-200 font-mono tracking-tighter">{(m.contextWindow || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-slate-500">
                           <Database className="h-3.5 w-3.5 mr-1.5 opacity-50 text-accent" />
                           <span className="font-bold">Max Out:</span>
                           <span className="ml-1 text-slate-900 dark:text-slate-200 font-mono tracking-tighter">{(m.maxTokens || 0).toLocaleString()}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter w-12 text-right">Input:</span>
                           <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tighter">${m.inputCostPer1k}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter w-12 text-right">Output:</span>
                           <span className="text-[12px] font-black text-amber-600 dark:text-amber-400 font-mono tracking-tighter">${m.outputCostPer1k}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleToggleStatus(m.id, m.isActive)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-2 ring-accent/20",
                          m.isActive ? "bg-accent shadow-inner shadow-accent/30" : "bg-slate-200 dark:bg-slate-700"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out",
                          m.isActive ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-2.5 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
                        title="Edit Configuration"
                      >
                        <Edit2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title="Delete Model"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredModels.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center">
             <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-100 dark:ring-slate-800 transition-all group-hover:rotate-12 duration-500">
                <Box className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2">Engines Depleted</h3>
             <p className="text-sm text-slate-500 font-medium">No AI models found matching your search.</p>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && editingModel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => !isLoading && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingModel.id ? 'Edit AI Model' : 'New AI Model'}
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Model Key</label>
                      <input 
                        required
                        value={editingModel.modelKey || ''}
                        onChange={(e) => setEditingModel({...editingModel, modelKey: e.target.value})}
                        placeholder="e.g. gpt-4o"
                        className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm font-medium dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Provider</label>
                      <select 
                        value={editingModel.provider || ''}
                        onChange={(e) => setEditingModel({...editingModel, provider: e.target.value})}
                        className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm font-medium dark:text-white"
                      >
                         <option>OpenAI</option>
                         <option>Anthropic</option>
                         <option>Google</option>
                         <option>Meta</option>
                         <option>Mistral</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Intelligence Type</label>
                      <select 
                        value={editingModel.modelType || ''}
                        onChange={(e) => setEditingModel({...editingModel, modelType: e.target.value})}
                        className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm font-medium dark:text-white"
                      >
                         <option value="text-generation">Text Generation</option>
                         <option value="image-generation">Image Generation</option>
                         <option value="video-generation">Video Generation</option>
                         <option value="caption-generation">Caption Generation</option>
                         <option value="audio-generation">Audio Generation</option>
                         <option value="embedding">Embedding</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">API Key</label>
                      <input 
                        type="password"
                        value={editingModel.apiKey || ''}
                        onChange={(e) => setEditingModel({...editingModel, apiKey: e.target.value})}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm font-mono dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Input Cost ($/1K)</label>
                        <input 
                          type="number" step="0.0001"
                          value={editingModel.inputCostPer1k || 0}
                          onChange={(e) => setEditingModel({...editingModel, inputCostPer1k: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm font-mono dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Output Cost ($/1K)</label>
                        <input 
                          type="number" step="0.0001"
                          value={editingModel.outputCostPer1k || 0}
                          onChange={(e) => setEditingModel({...editingModel, outputCostPer1k: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm font-mono dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Context Window</label>
                        <input 
                          type="number"
                          value={editingModel.contextWindow || ''}
                          onChange={(e) => setEditingModel({...editingModel, contextWindow: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm font-mono dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Max Tokens</label>
                        <input 
                          type="number"
                          value={editingModel.maxTokens || ''}
                          onChange={(e) => setEditingModel({...editingModel, maxTokens: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-accent transition-all text-sm font-mono dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                       <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Active Status</span>
                       <button 
                        type="button"
                        onClick={() => setEditingModel({...editingModel, isActive: !editingModel.isActive})}
                        className={cn(
                          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
                          editingModel.isActive ? "bg-accent" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200",
                          editingModel.isActive ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 dark:bg-accent text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Engine Data</span>
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
