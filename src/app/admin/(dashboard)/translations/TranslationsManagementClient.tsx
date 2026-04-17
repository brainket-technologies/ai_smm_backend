"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Globe, Languages, CheckCircle } from "lucide-react";
import Link from "next/link";
import { deleteLanguage, toggleLanguageStatus, setDefaultLanguage, importLanguages } from './actions';
import LanguageFormModal from "@/components/admin/LanguageFormModal";
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";
import ImportModal from "@/components/admin/ImportModal";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function TranslationsManagementClient({ initialLanguages }: { initialLanguages: any[] }) {
  const [languages, setLanguages] = useState(initialLanguages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLanguages = languages.filter(lang => {
    const matchesSearch = lang.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lang.languageCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || 
                          (statusFilter === 'active' && lang.isActive) || 
                          (statusFilter === 'inactive' && !lang.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleCreate = () => {
    setSelectedLanguage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lang: any) => {
    setSelectedLanguage(lang);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this language?")) {
      try {
        await deleteLanguage(BigInt(id));
        setLanguages(languages.filter(l => l.id !== id));
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleLanguageStatus(BigInt(id), !currentStatus);
      setLanguages(languages.map(l => l.id === id ? { ...l, isActive: !currentStatus } : l));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultLanguage(BigInt(id));
      setLanguages(languages.map(l => ({
        ...l,
        isDefault: l.id === id,
        isActive: l.id === id ? true : l.isActive
      })));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = filteredLanguages.map(l => ({
        name: l.displayName,
        code: l.languageCode,
        country: l.countryCode,
        active: l.isActive,
        default: l.isDefault
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'languages_export.json';
      a.click();
    } else {
      const headers = "DisplayName,LanguageCode,CountryCode,IsActive,IsDefault\n";
      const csv = dataToExport.map(l => `${l.name},${l.code},${l.country},${l.active},${l.default}`).join('\n');
      const blob = new Blob([headers + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'languages_export.csv';
      a.click();
    }
  };

  const handleImport = async (data: any[]) => {
    await importLanguages(data);
    window.location.reload(); 
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Localization Management</h1>
          <p className="text-sm text-slate-500">Manage app languages, translations, and default settings.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Language</span>
        </button>
      </div>

      <DataManagementToolbar 
        onSearch={setSearchTerm}
        onFilterChange={setStatusFilter}
        filterOptions={[
            { label: 'Active Only', value: 'active' },
            { label: 'Inactive Only', value: 'inactive' }
        ]}
        onExport={handleExport}
        onImport={() => setIsImportOpen(true)}
        dataCount={filteredLanguages.length}
        itemName="languages"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Language</th>
                <th className="px-4 py-4">Locale Code</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Default</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLanguages.map((lang) => (
                <tr key={lang.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-3">
                       <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                          {lang.flagUrl ? (
                             <img src={lang.flagUrl} alt={lang.displayName} className="h-full w-full object-cover" />
                          ) : (
                             <Globe className="h-4 w-4 text-slate-400" />
                          )}
                       </div>
                       <span className="font-semibold text-slate-900 dark:text-white text-sm">{lang.displayName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                      {lang.languageCode}-{lang.countryCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleToggleStatus(lang.id, lang.isActive)}
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors",
                        lang.isActive 
                          ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:border-green-900/30" 
                          : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                      )}
                    >
                      {lang.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {lang.isDefault ? (
                      <span className="inline-flex items-center text-primary bg-primary/10 dark:bg-primary/5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-primary/20 dark:border-primary/10">
                        Primary
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleSetDefault(lang.id)}
                        className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase"
                      >
                        Set Primary
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Link 
                        href={`/admin/translations/${lang.languageCode}`}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 rounded transition-colors"
                        title="Edit Strings"
                      >
                        <Languages className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => handleEdit(lang)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 rounded transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {!lang.isDefault && (
                        <button 
                          onClick={() => handleDelete(lang.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
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

        {filteredLanguages.length === 0 && (
          <div className="py-20 text-center">
             <p className="text-slate-400 text-sm font-medium italic">No languages configured</p>
          </div>
        )}
      </div>

      <LanguageFormModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            window.location.reload(); 
        }}
        language={selectedLanguage}
      />

      <ImportModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        title="Languages"
        templateData={[
            { displayName: "Spanish", languageCode: "es", countryCode: "es", isActive: true, isDefault: false },
            { displayName: "French", languageCode: "fr", countryCode: "fr", isActive: true, isDefault: false }
        ]}
      />
    </div>
  );
}
