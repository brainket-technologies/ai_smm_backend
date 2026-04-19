"use client";

import React, { useState, useEffect } from 'react';
import { X, Check, Zap } from 'lucide-react';
import { upsertFeatureFlag } from '@/app/admin/(dashboard)/feature-flags/actions';

interface FeatureFlagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  flag?: any; 
  initialModuleName?: string;
}

export default function FeatureFlagFormModal({ isOpen, onClose, flag, initialModuleName }: FeatureFlagFormModalProps) {
  const [formData, setFormData] = useState<any>({
    moduleName: '',
    featureKey: '',
    isEnabled: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (flag) {
      setFormData({
        id: flag.id,
        moduleName: flag.moduleName,
        featureKey: flag.featureKey,
        isEnabled: flag.isEnabled,
      });
    } else {
      setFormData({
        moduleName: initialModuleName || '',
        featureKey: '',
        isEnabled: true,
      });
    }
  }, [flag, isOpen, initialModuleName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await upsertFeatureFlag(formData);
    setIsLoading(false);
    if (result.success) {
      onClose();
      window.location.reload(); 
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Standard Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{flag ? 'Edit Feature Flag' : 'Add Feature Flag'}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Standard Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Module Name</label>
              <input 
                required
                value={formData.moduleName}
                onChange={(e) => setFormData({...formData, moduleName: e.target.value.toLowerCase()})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 transition-all text-sm font-medium"
                placeholder="e.g. auth, api"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Feature Key</label>
              <input 
                required
                value={formData.featureKey}
                onChange={(e) => setFormData({...formData, featureKey: e.target.value.toLowerCase().replace(/ /g, '_')})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 transition-all text-sm font-mono font-medium"
                placeholder="e.g. login_v2"
              />
            </div>
            
          </div>
          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:opacity-90 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Wait...' : (flag ? 'Save Changes' : 'Add Feature')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
