"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Globe } from "lucide-react";
import { upsertLanguage } from "@/app/admin/(dashboard)/translations/actions";

interface LanguageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: any | null;
}

export default function LanguageFormModal({ isOpen, onClose, language }: LanguageFormModalProps) {
  const [formData, setFormData] = useState({
    displayName: '',
    languageCode: '',
    countryCode: '',
    flagUrl: '',
    isActive: true,
    isDefault: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (language) {
      setFormData({
        displayName: language.displayName || '',
        languageCode: language.languageCode || '',
        countryCode: language.countryCode || '',
        flagUrl: language.flagUrl || '',
        isActive: language.isActive ?? true,
        isDefault: language.isDefault ?? false
      });
    } else {
      setFormData({
        displayName: '',
        languageCode: '',
        countryCode: '',
        flagUrl: '',
        isActive: true,
        isDefault: false
      });
    }
  }, [language, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertLanguage(language ? BigInt(language.id) : null, formData);
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
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {language ? 'Edit Language' : 'Add Language'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Display Name</label>
                <input 
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    placeholder="e.g. English (UK)"
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-medium"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Language Code</label>
                    <input 
                        required
                        value={formData.languageCode}
                        onChange={(e) => setFormData({...formData, languageCode: e.target.value.toLowerCase()})}
                        placeholder="en"
                        className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-mono font-bold"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Country Code</label>
                    <input 
                        required
                        value={formData.countryCode}
                        onChange={(e) => setFormData({...formData, countryCode: e.target.value.toLowerCase()})}
                        placeholder="gb"
                        className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-mono font-bold"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Flag Image URL</label>
                <input 
                    value={formData.flagUrl}
                    onChange={(e) => setFormData({...formData, flagUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:bg-white dark:focus:bg-slate-900 transition-all text-sm"
                />
            </div>

              <div className="flex items-center pt-2 pl-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set as Default Language</span>
                </label>
              </div>
            </div>
  
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                <>
                    <Save className="h-4 w-4" />
                    <span>{isSubmitting ? 'SAVING...' : 'Save Configuration'}</span>
                </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
