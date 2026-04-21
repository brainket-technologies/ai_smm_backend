"use client";

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { upsertTier } from '@/app/admin/(dashboard)/subscriptions/actions';

interface TierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: any; 
  availableFeatures: { moduleName: string; featureKey: string }[];
  availablePlatforms: { id: string; name: string }[];
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

export default function TierFormModal({ isOpen, onClose, tier, availableFeatures, availablePlatforms }: TierFormModalProps) {
  const [formData, setFormData] = useState<any>({
    tierKey: '',
    name: '',
    priceAmount: 0,
    pricePeriod: 'month',
     badge: '',
    subscriptionLimit: 1,
    loginDeviceLimit: 1,
  // Default structure correctly handled
    limits: {
      unlimited: false,
      daily_posts: 0,
      daily_ai_chats: 0,
      daily_ai_images: 0,
      max_customers: 0,
      max_products: 0,
      max_services: 0,
      max_keyword_searches: 0,
      max_storage_mb: 0,
      max_video_length_seconds: 0,
      allowed_platforms: []
    },
    permissions: [],
    highlightFeatures: []
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tier) {
      setFormData({
        ...tier,
        priceAmount: Number(tier.priceAmount || 0),
        subscriptionLimit: Number(tier.subscriptionLimit || 1),
        loginDeviceLimit: Number(tier.loginDeviceLimit || 1),
        limits: {
          ...tier.limits || {}
        },
        highlightFeatures: tier.highlightFeatures || [],
        permissions: tier.permissions || []
      });
    } else {
      setFormData({
        tierKey: '',
        name: '',
        priceAmount: 0,
        pricePeriod: 'month',
        badge: '',
        subscriptionLimit: 1,
        loginDeviceLimit: 1,
        highlightFeatures: [],
        limits: {
          unlimited: false,
          daily_posts: 0,
          daily_ai_chats: 0,
          daily_ai_images: 0,
          max_customers: 0,
          max_products: 0,
          max_services: 0,
          max_keyword_searches: 0,
          max_storage_mb: 0,
          max_video_length_seconds: 0,
          allowed_platforms: []
        },
        permissions: [],
        highlightFeatures: []
      });
    }
  }, [tier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await upsertTier(formData);
    setIsLoading(false);
    if (result.success) {
      onClose();
    } else {
      alert("Error: " + result.error);
    }
  };

  const togglePermission = (pKey: string) => {
    const newPerms = formData.permissions.includes(pKey)
      ? formData.permissions.filter((p: string) => p !== pKey)
      : [...formData.permissions, pKey];
    setFormData({ ...formData, permissions: newPerms });
  };

  const togglePlatform = (pId: string) => {
    const newPlatforms = formData.limits.allowed_platforms.includes(pId)
      ? formData.limits.allowed_platforms.filter((id: string) => id !== pId)
      : [...formData.limits.allowed_platforms, pId];
    setFormData({
      ...formData,
      limits: { ...formData.limits, allowed_platforms: newPlatforms }
    });
  };

  const addHighlight = () => {
    setFormData({
      ...formData,
      highlightFeatures: [...formData.highlightFeatures, '']
    });
  };

  const removeHighlight = (index: number) => {
    const newHighlights = formData.highlightFeatures.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, highlightFeatures: newHighlights });
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...formData.highlightFeatures];
    newHighlights[index] = value;
    setFormData({ ...formData, highlightFeatures: newHighlights });
  };

  const groupedFeatures = availableFeatures.reduce((acc: any, feature) => {
    if (!acc[feature.moduleName]) acc[feature.moduleName] = [];
    acc[feature.moduleName].push(feature.featureKey);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Standard Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{tier ? 'Modify Subscription Tier' : 'Add Subscription Tier'}</span>
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section: Basics */}
          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Basic Info</h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5 focus-within:relative z-10">
                 <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Display Name</label>
                 <input 
                   required
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-blue-500 outline-none transition-all text-sm font-medium shadow-sm"
                   placeholder="e.g. Pro Plan"
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Internal Key</label>
                 <input 
                   required
                   disabled={!!tier}
                   value={formData.tierKey}
                   onChange={(e) => setFormData({...formData, tierKey: e.target.value.toLowerCase().replace(/ /g, '_')})}
                   className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none text-sm font-mono uppercase shadow-sm"
                   placeholder="e.g. pro_tier"
                 />
               </div>
               <div className="space-y-1.5 col-span-2 sm:col-span-1">
                 <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Price (INR)</label>
                 <div className="flex border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-900 overflow-hidden focus-within:border-blue-500 transition-all">
                    <input 
                        type="number"
                        value={formData.priceAmount}
                        onChange={(e) => setFormData({...formData, priceAmount: parseFloat(e.target.value)})}
                        className="flex-1 px-4 py-2.5 w-full bg-transparent outline-none text-sm font-bold"
                    />
                    <select 
                        value={formData.pricePeriod}
                        onChange={(e) => setFormData({...formData, pricePeriod: e.target.value})}
                        className="bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold uppercase outline-none border-l border-slate-200 dark:border-slate-700"
                    >
                        <option value="month">Mo</option>
                        <option value="year">Yr</option>
                        <option value="forever">Life</option>
                    </select>
                 </div>
               </div>
               <div className="space-y-1.5 col-span-2 sm:col-span-1">
                 <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Badge Text</label>
                 <input 
                   value={formData.badge}
                   onChange={(e) => setFormData({...formData, badge: e.target.value})}
                   className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-blue-500 outline-none transition-all text-sm font-medium shadow-sm"
                   placeholder="e.g. Best Value"
                 />
               </div>
             </div>
          </div>

          {/* Section: Limits */}
          <div className="space-y-4">
             <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                 <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Usage Limits <span className="text-[9px] font-normal lowercase ml-1">(Use -1 for unlimited)</span></h3>
                 <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-[10px] font-bold text-slate-500">Global Unlimited</span>
                    <input type="checkbox" checked={formData.limits.unlimited} onChange={(e) => setFormData({...formData, limits: {...formData.limits, unlimited: e.target.checked}})} className="rounded border-slate-300 text-blue-600" />
                 </label>
             </div>
             <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                <LimitSimple label="Daily Posts" value={formData.limits.daily_posts} onChange={(v) => setFormData({...formData, limits: {...formData.limits, daily_posts: v}})} />
                <LimitSimple label="AI Chats" value={formData.limits.daily_ai_chats} onChange={(v) => setFormData({...formData, limits: {...formData.limits, daily_ai_chats: v}})} />
                <LimitSimple label="AI Images" value={formData.limits.daily_ai_images} onChange={(v) => setFormData({...formData, limits: {...formData.limits, daily_ai_images: v}})} />
                <LimitSimple label="Customers" value={formData.limits.max_customers} onChange={(v) => setFormData({...formData, limits: {...formData.limits, max_customers: v}})} />
                <LimitSimple label="Products" value={formData.limits.max_products} onChange={(v) => setFormData({...formData, limits: {...formData.limits, max_products: v}})} />
                <LimitSimple label="Services" value={formData.limits.max_services} onChange={(v) => setFormData({...formData, limits: {...formData.limits, max_services: v}})} />
                <LimitSimple label="Storage(MB)" value={formData.limits.max_storage_mb} onChange={(v) => setFormData({...formData, limits: {...formData.limits, max_storage_mb: v}})} />
                <LimitSimple label="Biz Accounts" value={formData.subscriptionLimit} onChange={(v) => setFormData({...formData, subscriptionLimit: v})} />
                <LimitSimple label="Device Limit" value={formData.loginDeviceLimit} onChange={(v) => setFormData({...formData, loginDeviceLimit: v})} />
                <div className="space-y-1 col-span-3">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Social Platforms</label>
                   <div className="flex flex-wrap gap-2">
                       {availablePlatforms.map(p => (
                          <button key={p.id} type="button" onClick={() => togglePlatform(p.id)} className={cn("px-3 py-1 text-[10px] border rounded font-bold transition-colors", formData.limits.allowed_platforms.includes(p.id) ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900" : "bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 hover:border-slate-400")}>
                              {p.name}
                          </button>
                       ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Section: Highlights */}
          <div className="space-y-4">
             <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Highlight Features (Bullets)</h3>
                <button 
                  type="button" 
                  onClick={addHighlight}
                  className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded border border-blue-100 dark:border-blue-800 transition-colors"
                >
                  + Add Bullet
                </button>
             </div>
             
             <div className="space-y-2">
                {formData.highlightFeatures && formData.highlightFeatures.map((highlight: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <input 
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-blue-500 outline-none transition-all text-xs font-medium shadow-sm"
                      placeholder="e.g. 50 AI Chats/day"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeHighlight(index)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                
                {(!formData.highlightFeatures || formData.highlightFeatures.length === 0) && (
                  <div className="py-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase italic tracking-wider">No highlights defined</p>
                  </div>
                )}
             </div>
          </div>

          {/* Section: Features */}
          <div className="space-y-4">
             <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Feature Toggles</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                 {Object.entries(groupedFeatures).map(([module, fKeys]: [string, any]) => (
                    <div key={module} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-black text-blue-600 block mb-2">{module.replace('_', ' ')}</span>
                        <div className="flex flex-col space-y-2">
                            {fKeys.map((k: string) => (
                                <label key={k} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.permissions.includes(k)} onChange={() => togglePermission(k)} className="rounded border-slate-300 text-blue-600" />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1 truncate" title={k.split('_').slice(1).join(' ')}>{k.split('_').slice(1).join(' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                 ))}
             </div>
          </div>

        </form>

        {/* Standard Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-bold text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm transition-all disabled:opacity-50"
            >
                {isLoading ? 'Saving...' : (tier ? 'Update Tier' : 'Add Tier')}
            </button>
        </div>

      </div>
    </div>
  );
}

function LimitSimple({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis block">{label}</label>
            <input 
                type="number"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-blue-500"
            />
        </div>
    );
}
