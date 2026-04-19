"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Palette, CheckCircle, Smartphone } from "lucide-react";
import { deleteTheme, setThemeAsDefault, importThemes, updateThemeStatus } from './actions';
import ThemeFormModal from "@/components/admin/ThemeFormModal";
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";
import ImportModal from "@/components/admin/ImportModal";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ThemeManagementClient({ initialThemes }: { initialThemes: any[] }) {
  const [themes, setThemes] = useState(initialThemes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredThemes = themes.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || 
                          (statusFilter === 'active' && t.isActive) || 
                          (statusFilter === 'disabled' && !t.isActive) ||
                          (statusFilter === 'default' && t.isDefault);
    return matchesSearch && matchesFilter;
  });

  const handleCreate = () => {
    setSelectedTheme(null);
    setIsModalOpen(true);
  };

  const handleEdit = (theme: any) => {
    setSelectedTheme(theme);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this theme?")) {
      try {
        await deleteTheme(id);
        setThemes(themes.filter(t => t.id !== id));
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    console.log(`UI DEBUG - handleSetDefault - ID: ${id}`);
    try {
      await setThemeAsDefault(id);
      setThemes(themes.map(t => ({
        ...t,
        isDefault: t.id === id,
        isActive: t.id === id ? true : t.isActive
      })));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    console.log(`UI DEBUG - handleToggleStatus - ID: ${id}, Current: ${currentStatus}`);
    try {
      await updateThemeStatus(id, !currentStatus);
      setThemes(themes.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = filteredThemes.map(t => ({
        name: t.name,
        primaryColor: t.primaryColor,
        secondaryColor: t.secondaryColor,
        darkPrimaryColor: t.darkPrimaryColor,
        darkSecondaryColor: t.darkSecondaryColor,
        isDefault: t.isDefault
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'themes_export.json';
      a.click();
    } else {
      const headers = "Name,Primary,Secondary,DarkPrimary,DarkSecondary,IsDefault\n";
      const csv = dataToExport.map(t => `${t.name},${t.primaryColor},${t.secondaryColor},${t.darkPrimaryColor},${t.darkSecondaryColor},${t.isDefault}`).join('\n');
      const blob = new Blob([headers + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'themes_export.csv';
      a.click();
    }
  };

  const handleImport = async (data: any[]) => {
    await importThemes(data);
    window.location.reload();
  };

  const ColorPreview = ({ color1, color2, label }: { color1: string, color2: string, label: string }) => (
    <div className="flex flex-col space-y-1">
        <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{label}</span>
        <div className="flex items-center -space-x-2">
            <div className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" style={{ backgroundColor: color1 }} />
            <div className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" style={{ backgroundColor: color2 }} />
        </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">App Theme Management</h1>
          <p className="text-sm text-slate-500">Coordinate the visual identity of your platform across all surfaces.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Theme</span>
        </button>
      </div>

      <DataManagementToolbar 
        onSearch={setSearchTerm}
        onFilterChange={setStatusFilter}
        filterOptions={[
            { label: 'Active Only', value: 'active' },
            { label: 'Disabled Only', value: 'disabled' },
            { label: 'Primary System', value: 'default' }
        ]}
        onExport={handleExport}
        onImport={() => setIsImportOpen(true)}
        dataCount={filteredThemes.length}
        itemName="themes"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Theme Identity</th>
                <th className="px-4 py-4">Light Palette</th>
                <th className="px-4 py-4">Dark Palette</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Default</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredThemes.map((theme) => (
                <tr key={theme.id.toString()} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                        <Palette className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">{theme.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Signature Palette</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                     <ColorPreview label="Light" color1={theme.primaryColor} color2={theme.secondaryColor} />
                  </td>
                  <td className="px-4 py-4">
                     <ColorPreview label="Dark" color1={theme.darkPrimaryColor} color2={theme.darkSecondaryColor} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                        onClick={() => handleToggleStatus(theme.id.toString(), theme.isActive)}
                        className={cn(
                            "relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                            theme.isActive ? "bg-green-600" : "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <span className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            theme.isActive ? "translate-x-5" : "translate-x-0"
                        )} />
                    </button>
                  </td>
                  <td 
                    onClick={() => !theme.isDefault && handleSetDefault(theme.id.toString())}
                    className={cn(
                        "px-4 py-4 text-center transition-colors truncate",
                        !theme.isDefault ? "cursor-pointer hover:bg-blue-50/50" : ""
                    )}
                  >
                     <div className="flex flex-col items-center justify-center">
                        {theme.isDefault ? (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                        ) : (
                            <div className={cn(
                                "h-5 w-5 rounded-full border-2 transition-all flex items-center justify-center group",
                                "border-slate-200 group-hover:border-blue-400"
                            )}>
                                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-40 transition-opacity" />
                            </div>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                        onClick={() => handleEdit(theme)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {!theme.isDefault && (
                        <button 
                          onClick={() => handleDelete(theme.id.toString())}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredThemes.length === 0 && (
          <div className="py-24 text-center">
             <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 mb-4 shadow-inner">
                <Palette className="h-8 w-8 text-slate-300" />
             </div>
             <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">No themes detected</p>
          </div>
        )}
      </div>

      <ThemeFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        theme={selectedTheme}
      />

      <ImportModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        title="Themes"
        templateData={[
            { name: "Ocean Night", primaryColor: "#0F172A", secondaryColor: "#334155", darkPrimaryColor: "#1E293B", darkSecondaryColor: "#0F172A", isDefault: false },
            { name: "Forest Green", primaryColor: "#064E3B", secondaryColor: "#065F46", darkPrimaryColor: "#059669", darkSecondaryColor: "#064E3B", isDefault: false }
        ]}
      />
    </div>
  );
}
