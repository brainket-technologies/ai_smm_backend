"use client";

import React, { useState, useEffect } from 'react';
import { X, Save } from "lucide-react";
import { upsertPlatform } from "@/app/admin/(dashboard)/platforms/actions";

interface PlatformFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: any | null;
}

export default function PlatformFormModal({ isOpen, onClose, platform }: PlatformFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    nameKey: '',
    logo: '',
    url: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (platform) {
      setFormData({
        name: platform.name || '',
        nameKey: platform.nameKey || '',
        logo: platform.logo || '',
        url: platform.url || '',
        isActive: platform.isActive ?? true
      });
    } else {
      setFormData({
        name: '',
        nameKey: '',
        logo: '',
        url: '',
        isActive: true
      });
    }
  }, [platform, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertPlatform(platform ? BigInt(platform.id) : null, formData);
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
            {platform ? 'Edit Platform' : 'New Platform'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Platform Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Instagram"
                  className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-medium"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Internal Key</label>
                    <input 
                    required
                    value={formData.nameKey}
                    onChange={(e) => setFormData({...formData, nameKey: e.target.value})}
                    placeholder="instagram"
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-mono"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Logo URL</label>
                    <input 
                    required
                    value={formData.logo}
                    onChange={(e) => setFormData({...formData, logo: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm truncate"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Official Website URL</label>
                <input 
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://facebook.com"
                  className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm"
                />
            </div>
          </div>

          <div className="pt-2">
            <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
                {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                <>
                    <Save className="h-4 w-4" />
                    <span>Save Platform Info</span>
                </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
