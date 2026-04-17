"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Globe, ExternalLink } from "lucide-react";
import { deletePlatform, togglePlatformStatus, importPlatforms } from './actions';
import PlatformFormModal from "@/components/admin/PlatformFormModal";
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";
import ImportModal from "@/components/admin/ImportModal";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PlatformsManagementClient({ initialPlatforms }: { initialPlatforms: any[] }) {
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPlatforms = platforms.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || 
                          (statusFilter === 'active' && p.isActive) || 
                          (statusFilter === 'inactive' && !p.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleCreate = () => {
    setSelectedPlatform(null);
    setIsModalOpen(true);
  };

  const handleEdit = (p: any) => {
    setSelectedPlatform(p);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this platform?")) {
      try {
        await deletePlatform(BigInt(id));
        setPlatforms(platforms.filter(p => p.id !== id));
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await togglePlatformStatus(BigInt(id), !currentStatus);
      setPlatforms(platforms.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = filteredPlatforms.map(p => ({
        name: p.name,
        nameKey: p.nameKey,
        url: p.url,
        logo: p.logo,
        status: p.isActive ? 'Active' : 'Paused'
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'platforms_export.json';
      a.click();
    } else {
      const headers = "Name,Key,URL,Logo,Status\n";
      const csv = dataToExport.map(p => `${p.name},${p.nameKey},${p.url},${p.logo},${p.status}`).join('\n');
      const blob = new Blob([headers + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'platforms_export.csv';
      a.click();
    }
  };

  const handleImport = async (data: any[]) => {
    await importPlatforms(data);
    window.location.reload();
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Social Platforms</h1>
          <p className="text-sm text-slate-500">Enable or disable social media channels and manage their settings.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="w-full md:w-auto bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Platform</span>
        </button>
      </div>

      <DataManagementToolbar 
        onSearch={setSearchTerm}
        onFilterChange={setStatusFilter}
        filterOptions={[
            { label: 'Active Only', value: 'active' },
            { label: 'Paused Only', value: 'inactive' }
        ]}
        onExport={handleExport}
        onImport={() => setIsImportOpen(true)}
        dataCount={filteredPlatforms.length}
        itemName="platforms"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Platform</th>
                <th className="px-4 py-4">Integrations</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPlatforms.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                         {p.logo ? (
                            <img src={p.logo} alt={p.name} className="h-full w-full object-contain p-1" />
                         ) : (
                            <Globe className="h-4 w-4 text-slate-400" />
                         )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{p.nameKey}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a 
                      href={p.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleToggleStatus(p.id, p.isActive)}
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors",
                        p.isActive 
                          ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:border-green-900/30" 
                          : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-900/30"
                      )}
                    >
                      {p.isActive ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
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

        {filteredPlatforms.length === 0 && (
          <div className="py-20 text-center">
             <p className="text-slate-400 text-sm font-medium italic">No platforms configured</p>
          </div>
        )}
      </div>

      <PlatformFormModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            window.location.reload(); 
        }}
        platform={selectedPlatform}
      />

      <ImportModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        title="Platforms"
        templateData={[
            { name: "Youtube", logo: "https://youtube.com/favicon.ico", url: "https://youtube.com", nameKey: "youtube", isActive: true },
            { name: "Snapchat", logo: "https://snapchat.com/favicon.ico", url: "https://snapchat.com", nameKey: "snapchat", isActive: false }
        ]}
      />
    </div>
  );
}
