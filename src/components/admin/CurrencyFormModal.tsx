"use client";

import React, { useState, useEffect } from 'react';
import { X, Save } from "lucide-react";
import { upsertCurrency } from "@/app/admin/(dashboard)/currencies/actions";

interface CurrencyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: any | null;
}

export default function CurrencyFormModal({ isOpen, onClose, currency }: CurrencyFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    symbol: '',
    exchangeRate: 1,
    status: true,
    isDefault: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currency) {
      setFormData({
        name: currency.name || '',
        code: currency.code || '',
        symbol: currency.symbol || '',
        exchangeRate: currency.exchangeRate || 1,
        status: currency.status ?? true,
        isDefault: currency.isDefault ?? false
      });
    } else {
      setFormData({
        name: '',
        code: '',
        symbol: '',
        exchangeRate: 1,
        status: true,
        isDefault: false
      });
    }
  }, [currency, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertCurrency(currency ? BigInt(currency.id) : null, formData);
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {currency ? 'Edit Currency' : 'Add Currency'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Name</label>
                    <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. US Dollar"
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-medium"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">ISO Code</label>
                    <input 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="USD"
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-bold font-mono"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Symbol</label>
                    <input 
                    required
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                    placeholder="$"
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-bold"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Exchange Rate</label>
                    <input 
                    required
                    type="number"
                    step="0.000001"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData({...formData, exchangeRate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-bold"
                    />
                </div>
            </div>

            <div className="flex items-center pt-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Currency</span>
                </label>
            </div>
          </div>

          <div className="pt-2">
            <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:opacity-90 disabled:opacity-60 text-white py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
            >
                {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
