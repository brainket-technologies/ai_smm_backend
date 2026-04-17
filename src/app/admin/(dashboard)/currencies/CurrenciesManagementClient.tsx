"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, TrendingUp, Search, Info, CheckCircle } from "lucide-react";
import { deleteCurrency, toggleCurrencyStatus, setDefaultCurrency, importCurrencies } from './actions';
import CurrencyFormModal from "@/components/admin/CurrencyFormModal";
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";
import ImportModal from "@/components/admin/ImportModal";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function CurrenciesManagementClient({ initialCurrencies }: { initialCurrencies: any[] }) {
  const [currencies, setCurrencies] = useState(initialCurrencies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCurrencies = currencies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || 
                          (statusFilter === 'active' && c.status) || 
                          (statusFilter === 'inactive' && !c.status);
    return matchesSearch && matchesFilter;
  });

  const handleCreate = () => {
    setSelectedCurrency(null);
    setIsModalOpen(true);
  };

  const handleEdit = (curr: any) => {
    setSelectedLanguage(curr); 
    setIsModalOpen(true);
  };

  const setSelectedLanguage = (curr: any) => {
    setSelectedCurrency(curr);
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this currency?")) {
      try {
        await deleteCurrency(BigInt(id));
        setCurrencies(currencies.filter(c => c.id !== id));
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultCurrency(BigInt(id));
      setCurrencies(currencies.map(c => ({
        ...c,
        isDefault: c.id === id,
        status: c.id === id ? true : c.status
      })));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleLanguageStatus(id, currentStatus);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const toggleLanguageStatus = async (id: string, currentStatus: boolean) => {
    await toggleCurrencyStatus(BigInt(id), !currentStatus);
    setCurrencies(currencies.map(c => c.id === id ? { ...c, status: !currentStatus } : c));
  }

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = filteredCurrencies.map(c => ({
        name: c.name,
        code: c.code,
        symbol: c.symbol,
        exchangeRate: c.exchangeRate,
        status: c.status,
        isDefault: c.isDefault
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'currencies_export.json';
      a.click();
    } else {
      const headers = "Name,Code,Symbol,ExchangeRate,Status,IsDefault\n";
      const csv = dataToExport.map(c => `${c.name},${c.code},${c.symbol},${c.exchangeRate},${c.status},${c.isDefault}`).join('\n');
      const blob = new Blob([headers + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'currencies_export.csv';
      a.click();
    }
  };

  const handleImport = async (data: any[]) => {
    await importCurrencies(data);
    window.location.reload();
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Currency Management</h1>
          <p className="text-sm text-slate-500">Manage global currencies and exchange rates.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Currency</span>
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
        dataCount={filteredCurrencies.length}
        itemName="currencies"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Currency</th>
                <th className="px-4 py-4">ISO Code</th>
                <th className="px-4 py-4">Exchange Rate</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Default</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCurrencies.map((curr) => (
                <tr key={curr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center text-sm font-bold border",
                        curr.isDefault ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/5 dark:border-primary/10" : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                      )}>
                        {curr.symbol}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{curr.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                      {curr.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{curr.exchangeRate}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleToggleStatus(curr.id, curr.status)}
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors",
                        curr.status 
                          ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:border-green-900/30" 
                          : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                      )}
                    >
                      {curr.status ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {curr.isDefault ? (
                      <span className="inline-flex items-center text-primary bg-primary/10 dark:bg-primary/5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-primary/20 dark:border-primary/10">
                        Primary
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleSetDefault(curr.id)}
                        className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase"
                      >
                        Set Primary
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                        onClick={() => handleEdit(curr)}
                         className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {!curr.isDefault && (
                        <button 
                          onClick={() => handleDelete(curr.id)}
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

        {filteredCurrencies.length === 0 && (
          <div className="py-20 text-center">
             <p className="text-slate-400 text-sm font-medium italic">No currencies found</p>
          </div>
        )}
      </div>

      <CurrencyFormModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            window.location.reload(); 
        }}
        currency={selectedCurrency}
      />

      <ImportModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        title="Currencies"
        templateData={[
            { name: "Euro", code: "EUR", symbol: "€", exchangeRate: 0.92, status: true, isDefault: false },
            { name: "Pound Sterling", code: "GBP", symbol: "£", exchangeRate: 0.78, status: true, isDefault: false }
        ]}
      />
    </div>
  );
}
