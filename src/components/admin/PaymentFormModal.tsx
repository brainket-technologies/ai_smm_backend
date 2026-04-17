"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Settings, Info, Image as ImageIcon } from "lucide-react";
import { upsertPaymentMethod } from "@/app/admin/(dashboard)/payments/actions";

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: any | null;
}

export default function PaymentFormModal({ isOpen, onClose, paymentMethod }: PaymentFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    type: 'gateway',
    mode: 'test',
    image: '',
    isActive: true,
    isDefault: false,
    config: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configJson, setConfigJson] = useState('{}');

  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        name: paymentMethod.name || '',
        displayName: paymentMethod.displayName || '',
        type: paymentMethod.type || 'gateway',
        mode: paymentMethod.mode || 'test',
        image: paymentMethod.image || '',
        isActive: paymentMethod.isActive ?? true,
        isDefault: paymentMethod.isDefault ?? false,
        config: paymentMethod.config || {}
      });
      setConfigJson(JSON.stringify(paymentMethod.config || {}, null, 2));
    } else {
      setFormData({
        name: '',
        displayName: '',
        type: 'gateway',
        mode: 'test',
        image: '',
        isActive: true,
        isDefault: false,
        config: {}
      });
      setConfigJson('{}');
    }
  }, [paymentMethod, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const parsedConfig = JSON.parse(configJson);
      await upsertPaymentMethod(paymentMethod ? BigInt(paymentMethod.id) : null, {
        ...formData,
        config: parsedConfig
      });
      onClose();
    } catch (error: any) {
      alert(error.message || "Invalid JSON in configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {paymentMethod ? 'Edit Payment Gateway' : 'Add Payment Gateway'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Basic Info */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Gateway Name (Internal)</label>
                    <input 
                        required
                        disabled={!!paymentMethod}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase()})}
                        placeholder="e.g. stripe_v2"
                        className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-mono"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Display Name</label>
                    <input 
                        required
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        placeholder="e.g. Credit/Debit Card"
                        className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-medium"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Gateway Logo URL</label>
                    <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            placeholder="https://logo-url.com/stripe.png"
                            className="w-full pl-10 pr-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:bg-white dark:focus:bg-slate-900 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Type</label>
                        <select 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm"
                        >
                            <option value="gateway">Gateway</option>
                            <option value="manual">Manual</option>
                            <option value="wallet">Wallet</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Mode</label>
                        <select 
                            value={formData.mode}
                            onChange={(e) => setFormData({...formData, mode: e.target.value})}
                            className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm"
                        >
                            <option value="test">Sandbox / Test</option>
                            <option value="live">Production / Live</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center space-x-6 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Default</span>
                    </label>
                </div>
            </div>

            {/* Right Column: JSON Config */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                        <Settings className="h-3 w-3" />
                        <span>API Configuration (JSON)</span>
                    </label>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Credentials</div>
                </div>
                <div className="h-[240px] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-slate-900 group">
                    <textarea 
                        value={configJson}
                        onChange={(e) => setConfigJson(e.target.value)}
                        className="w-full h-full p-4 bg-transparent text-slate-300 text-xs font-mono outline-none resize-none focus:ring-0"
                        placeholder='{ "api_key": "...", "secret": "..." }'
                    />
                </div>
                <div className="p-3 bg-primary/10 dark:bg-primary/5 rounded-lg border border-primary/20 dark:border-primary/900/30 flex items-start space-x-2">
                    <Info className="h-3.5 w-3.5 text-primary mt-0.5" />
                    <p className="text-[10px] text-primary/80 dark:text-primary/70 font-medium">
                        Configure gateway-specific keys here (e.g., publishable_key, secret_key, merchant_id).
                    </p>
                </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:opacity-90 dark:bg-primary dark:text-white text-white py-3 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
            >
                {isSubmitting ? (
                   <div className="h-4 w-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                ) : (
                   <>
                    <Save className="h-4 w-4" />
                    <span>Save Configuration</span>
                   </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
