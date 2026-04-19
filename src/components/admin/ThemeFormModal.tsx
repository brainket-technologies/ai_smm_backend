"use client";

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { upsertTheme } from '@/app/admin/(dashboard)/themes/actions';

interface ThemeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: any;
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

export default function ThemeFormModal({ isOpen, onClose, theme }: ThemeFormModalProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#64748B',
    darkPrimaryColor: '#3B82F6',
    darkSecondaryColor: '#1E293B',
    isDefault: false,
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (theme) {
      setFormData({
        id: theme.id,
        name: theme.name,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        darkPrimaryColor: theme.darkPrimaryColor,
        darkSecondaryColor: theme.darkSecondaryColor,
        isDefault: theme.isDefault,
        isActive: theme.isActive,
      });
    } else {
      setFormData({
        name: '',
        primaryColor: '#3B82F6',
        secondaryColor: '#64748B',
        darkPrimaryColor: '#3B82F6',
        darkSecondaryColor: '#1E293B',
        isDefault: false,
        isActive: true,
      });
    }
  }, [theme, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await upsertTheme(formData.id || null, formData);
      onClose();
      // Only reload if needed, but actions usually revalidatePath
      if (!theme) window.location.reload(); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const ColorField = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="space-y-1 flex-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
      <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 rounded cursor-pointer border-none bg-transparent"
        />
        <input 
          type="text" 
          value={value.toUpperCase()} 
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-xs font-mono font-bold outline-none uppercase text-slate-700 dark:text-slate-300"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in slide-in-from-bottom-2 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {theme ? 'Edit Theme' : 'Add Theme'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Theme Name</label>
                <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Midnight Azure"
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-medium"
                />
            </div>

            {/* Light Colors Row */}
            <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">☀️ Light Mode Palette</span>
                <div className="flex space-x-4">
                    <ColorField label="Primary" value={formData.primaryColor} onChange={(v) => setFormData({...formData, primaryColor: v})} />
                    <ColorField label="Secondary" value={formData.secondaryColor} onChange={(v) => setFormData({...formData, secondaryColor: v})} />
                </div>
            </div>

            {/* Dark Colors Row */}
            <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">🌙 Dark Mode Palette</span>
                <div className="flex space-x-4">
                    <ColorField label="Primary" value={formData.darkPrimaryColor} onChange={(v) => setFormData({...formData, darkPrimaryColor: v})} />
                    <ColorField label="Secondary" value={formData.darkSecondaryColor} onChange={(v) => setFormData({...formData, darkSecondaryColor: v})} />
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center pt-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set as Default Theme</span>
                </label>
            </div>
          </div>

          <div className="pt-2">
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
                {isLoading ? (
                    <div className="h-4 w-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                    <>
                        <Save className="h-4 w-4" />
                        <span>{theme ? 'Update Theme' : 'Create Theme'}</span>
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
