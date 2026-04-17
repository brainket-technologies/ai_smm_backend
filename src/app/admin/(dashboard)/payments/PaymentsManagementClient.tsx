"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Shield, CheckCircle, Globe, Settings } from "lucide-react";
import { deletePaymentMethod, togglePaymentStatus, setDefaultPayment, importPayments } from './actions';
import PaymentFormModal from "@/components/admin/PaymentFormModal";
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";
import ImportModal from "@/components/admin/ImportModal";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PaymentsManagementClient({ initialPaymentMethods }: { initialPaymentMethods: any[] }) {
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredMethods = paymentMethods.filter(pm => {
    const matchesSearch = pm.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pm.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || 
                          (statusFilter === 'active' && pm.isActive) || 
                          (statusFilter === 'inactive' && !pm.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleCreate = () => {
    setSelectedPaymentMethod(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pm: any) => {
    setSelectedPaymentMethod(pm);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      try {
        await deletePaymentMethod(BigInt(id));
        setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await togglePaymentStatus(BigInt(id), !currentStatus);
      setPaymentMethods(paymentMethods.map(pm => pm.id === id ? { ...pm, isActive: !currentStatus } : pm));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPayment(BigInt(id));
      setPaymentMethods(paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === id,
        isActive: pm.id === id ? true : pm.isActive
      })));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = filteredMethods.map(pm => ({
        name: pm.name,
        displayName: pm.displayName,
        type: pm.type,
        mode: pm.mode,
        image: pm.image,
        isActive: pm.isActive,
        isDefault: pm.isDefault
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'payment_gateways_export.json';
      a.click();
    } else {
      const headers = "Name,DisplayName,Type,Mode,ImageURL,IsActive,IsDefault\n";
      const csv = dataToExport.map(pm => `${pm.name},${pm.displayName},${pm.type},${pm.mode},${pm.image},${pm.isActive},${pm.isDefault}`).join('\n');
      const blob = new Blob([headers + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'payment_gateways_export.csv';
      a.click();
    }
  };

  const handleImport = async (data: any[]) => {
    await importPayments(data);
    window.location.reload();
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Gateways</h1>
          <p className="text-sm text-slate-500">Configure payment processors, credentials, and manual methods.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Gateway</span>
        </button>
      </div>

      <DataManagementToolbar 
        onSearch={setSearchTerm}
        onFilterChange={setStatusFilter}
        filterOptions={[
            { label: 'Active Only', value: 'active' },
            { label: 'Disabled Only', value: 'inactive' }
        ]}
        onExport={handleExport}
        onImport={() => setIsImportOpen(true)}
        dataCount={filteredMethods.length}
        itemName="gateways"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Gateway Information</th>
                <th className="px-4 py-4">Environment</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Primary</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMethods.map((pm) => (
                <tr key={pm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-3">
                       <div className="h-9 w-9 rounded bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                          {pm.image ? (
                             <img 
                                src={pm.image} 
                                alt={pm.displayName} 
                                className="h-full w-full object-contain"
                             />
                          ) : (
                             <span className="text-xs font-bold text-slate-500">{(pm.displayName||'S').charAt(0)}</span>
                          )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{pm.displayName}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                            <span className="uppercase">{pm.name}</span>
                            <span>•</span>
                            <span className="capitalize">{pm.type}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded border uppercase",
                        pm.mode === 'live' 
                            ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:border-red-900/30" 
                            : "bg-primary/10 text-primary border-primary/20 dark:bg-primary/5 dark:border-primary/10"
                    )}>
                      {pm.mode || 'test'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleToggleStatus(pm.id, pm.isActive)}
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors",
                        pm.isActive 
                          ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:border-green-900/30" 
                          : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                      )}
                    >
                      {pm.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {pm.isDefault ? (
                      <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                    ) : (
                      <button 
                        onClick={() => handleSetDefault(pm.id)}
                        className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase"
                      >
                        Set Default
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                        onClick={() => handleEdit(pm)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(pm.id)}
                        disabled={pm.isDefault}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
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

        {filteredMethods.length === 0 && (
          <div className="py-20 text-center">
             <p className="text-slate-400 text-sm font-medium italic">No payment methods found</p>
          </div>
        )}
      </div>

      <PaymentFormModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            window.location.reload(); 
        }}
        paymentMethod={selectedPaymentMethod}
      />

      <ImportModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        title="Gateways"
        templateData={[
            { name: "paypal_v2", displayName: "PayPal Express", type: "gateway", mode: "test", image: "https://paypal.com/favicon.ico", isActive: true, isDefault: false },
            { name: "manual_bank", displayName: "Bank Transfer", type: "manual", mode: "live", image: "", isActive: true, isDefault: false }
        ]}
      />
    </div>
  );
}
