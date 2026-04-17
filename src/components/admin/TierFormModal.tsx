"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Shield, Info, Globe, HardDrive, MessageSquare, Image, Users, Package, Briefcase, Search, Video, Monitor, LayoutGrid } from 'lucide-react';
import { upsertTier } from '@/app/admin/(dashboard)/subscriptions/actions';

interface TierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: any; 
  availableFeatures: { moduleName: string; featureKey: string }[];
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'google_my_business', name: 'Google Business' },
];

export default function TierFormModal({ isOpen, onClose, tier, availableFeatures }: TierFormModalProps) {
  const [formData, setFormData] = useState<any>({
    tierKey: '',
    name: '',
    priceAmount: 0,
    pricePeriod: 'month',
    badge: '',
    isActive: true,
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
      max_concurrent_devices: 0,
      max_business_accounts: 0,
      allowed_platforms: []
    },
    permissions: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState('');

  useEffect(() => {
    if (tier) {
      setFormData({
        ...tier,
        priceAmount: Number(tier.priceAmount || 0),
        highlightFeatures: Array.isArray(tier.highlightFeatures) ? tier.highlightFeatures : [],
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
          max_concurrent_devices: 0,
          max_business_accounts: 0,
          allowed_platforms: [],
          ...(tier.limits || {})
        },
        permissions: tier.permissions || []
      });
    } else {
      setFormData({
        tierKey: '',
        name: '',
        priceAmount: 0,
        pricePeriod: 'month',
        badge: '',
        isActive: true,
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
          max_concurrent_devices: 0,
          max_business_accounts: 0,
          allowed_platforms: []
        },
        permissions: []
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

  const addHighlight = () => {
    if (currentHighlight.trim()) {
      setFormData({
        ...formData,
        highlightFeatures: [...formData.highlightFeatures, currentHighlight.trim()]
      });
      setCurrentHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData({
      ...formData,
      highlightFeatures: formData.highlightFeatures.filter((_: any, i: number) => i !== index)
    });
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

  const groupedFeatures = availableFeatures.reduce((acc: any, feature) => {
    if (!acc[feature.moduleName]) acc[feature.moduleName] = [];
    acc[feature.moduleName].push(feature.featureKey);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[var(--card-background)] w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/10">
          <div>
            <h2 className="text-2xl font-bold">{tier ? 'Edit' : 'Create'} Subscription Tier</h2>
            <p className="text-sm text-gray-500">Define pricing, limits and feature access.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Section: Basic Settings */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
              <Shield className="h-5 w-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">General Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Tier Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="e.g. Professional Plan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Tier Key (Unique ID)</label>
                <input 
                  required
                  disabled={!!tier}
                  value={formData.tierKey}
                  onChange={(e) => setFormData({...formData, tierKey: e.target.value.toLowerCase().replace(/ /g, '_')})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                  placeholder="e.g. pro_plan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Price Amount (INR)</label>
                <input 
                  type="number"
                  value={formData.priceAmount}
                  onChange={(e) => setFormData({...formData, priceAmount: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Price Period</label>
                <select 
                  value={formData.pricePeriod}
                  onChange={(e) => setFormData({...formData, pricePeriod: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                  <option value="forever">Forever / Free</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Badge Label</label>
                <input 
                  value={formData.badge}
                  onChange={(e) => setFormData({...formData, badge: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="e.g. Most Popular"
                />
              </div>
              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                   <div className="relative">
                      <input 
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                   </div>
                   <span className="text-sm font-bold">Active and Visible</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                   <div className="relative">
                      <input 
                        type="checkbox"
                        checked={formData.limits.unlimited}
                        onChange={(e) => setFormData({...formData, limits: {...formData.limits, unlimited: e.target.checked}})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                   </div>
                   <span className="text-sm font-bold">Unlimited Plan</span>
                </label>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section: Platform Selection */}
          <div className="space-y-6">
             <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <Globe className="h-5 w-5" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Allowed Social Platforms</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center justify-center space-x-3 p-4 rounded-2xl border transition-all ${
                      formData.limits.allowed_platforms.includes(p.id)
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-gray-500 hover:border-blue-500/50"
                    }`}
                  >
                    <Check className={`h-4 w-4 ${formData.limits.allowed_platforms.includes(p.id) ? "opacity-100" : "opacity-0"}`} />
                    <span className="text-sm font-bold">{p.name}</span>
                  </button>
                ))}
             </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section: Usage Limits */}
          <div className="space-y-6">
             <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <HardDrive className="h-5 w-5" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Granular Usage Limits (-1 for unlimited)</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                <LimitField 
                  icon={<LayoutGrid className="h-4 w-4" />}
                  label="Daily Posts" 
                  value={formData.limits.daily_posts} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, daily_posts: val}})} 
                />
                <LimitField 
                  icon={<MessageSquare className="h-4 w-4" />}
                  label="Daily AI Chats" 
                  value={formData.limits.daily_ai_chats} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, daily_ai_chats: val}})} 
                />
                <LimitField 
                  icon={<Image className="h-4 w-4" />}
                  label="Daily AI Images" 
                  value={formData.limits.daily_ai_images} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, daily_ai_images: val}})} 
                />
                <LimitField 
                  icon={<Users className="h-4 w-4" />}
                  label="Max Customers" 
                  value={formData.limits.max_customers} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, max_customers: val}})} 
                />
                <LimitField 
                  icon={<Package className="h-4 w-4" />}
                  label="Max Products" 
                  value={formData.limits.max_products} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, max_products: val}})} 
                />
                <LimitField 
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Max Services" 
                  value={formData.limits.max_services} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, max_services: val}})} 
                />
                <LimitField 
                  icon={<Search className="h-4 w-4" />}
                  label="AI Keywords Search" 
                  value={formData.limits.max_keyword_searches} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, max_keyword_searches: val}})} 
                />
                <LimitField 
                  icon={<HardDrive className="h-4 w-4" />}
                  label="Storage (MB)" 
                  value={formData.limits.max_storage_mb} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, max_storage_mb: val}})} 
                />
                <LimitField 
                  icon={<Video className="h-4 w-4" />}
                  label="Video Length (S)" 
                  value={formData.limits.max_video_length_seconds} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, max_video_length_seconds: val}})} 
                />
                <LimitField 
                  icon={<Monitor className="h-4 w-4" />}
                  label="Concurrent Devices" 
                  value={formData.limits.max_concurrent_devices} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, max_concurrent_devices: val}})} 
                />
                <LimitField 
                  icon={<Users className="h-4 w-4" />}
                  label="Business Accounts" 
                  value={formData.limits.max_business_accounts} 
                  onChange={(val) => setFormData({...formData, limits: {...formData.limits, max_business_accounts: val}})} 
                />
             </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section: Dynamic Highlights */}
          <div className="space-y-6">
             <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <Plus className="h-5 w-5" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Plan Highlight Features</h3>
             </div>
             <div className="space-y-4">
                <div className="flex space-x-2">
                   <input 
                    value={currentHighlight}
                    onChange={(e) => setCurrentHighlight(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                    className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. AI Viral Content Generator"
                   />
                   <button 
                    type="button"
                    onClick={addHighlight}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95"
                   >
                     Add
                   </button>
                </div>
                <div className="flex flex-wrap gap-3">
                   {formData.highlightFeatures.map((h: string, i: number) => (
                     <div key={i} className="flex items-center space-x-2 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-left-2 duration-300">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-sm font-semibold">{h}</span>
                        <button type="button" onClick={() => removeHighlight(i)} className="ml-2 p-1 hover:text-red-500 transition-colors">
                           <Trash2 className="h-3 w-3" />
                        </button>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Section: Permissions Checklist */}
          <div className="space-y-8 pb-10">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Shield className="h-5 w-5" />
                  <h3 className="font-bold uppercase tracking-widest text-xs">Feature Access (Permissions)</h3>
                </div>
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, permissions: availableFeatures.map(f => f.featureKey)})}
                    className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-600/10 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50"
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, permissions: []})}
                    className="text-[10px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-600/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/50"
                  >
                    Clear All
                  </button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedFeatures).map(([module, fKeys]: [string, any]) => (
                  <div key={module} className="p-6 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
                     <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800">
                        <h4 className="text-sm font-black capitalize flex items-center">
                           <LayoutGrid className="h-4 w-4 mr-2 text-slate-400" />
                           {module.replace('_', ' ')}
                        </h4>
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full font-bold text-blue-600">
                           {fKeys.filter((k: string) => formData.permissions.includes(k)).length}/{fKeys.length}
                        </span>
                     </div>
                     <div className="grid grid-cols-1 gap-2.5">
                        {fKeys.map((k: string) => (
                           <label key={k} className="flex items-center space-x-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-all">
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                formData.permissions.includes(k) 
                                  ? "bg-blue-600 border-blue-600 text-white" 
                                  : "border-slate-200 dark:border-slate-700 bg-transparent"
                              }`}>
                                 {formData.permissions.includes(k) && <Check className="h-3 w-3" />}
                                 <input 
                                   type="checkbox"
                                   checked={formData.permissions.includes(k)}
                                   onChange={() => togglePermission(k)}
                                   className="sr-only"
                                 />
                              </div>
                              <span className={`text-[11px] font-semibold transition-colors ${
                                formData.permissions.includes(k) ? "text-blue-600" : "text-gray-500"
                              }`}>
                                {k.split('_').slice(1).join(' ')}
                              </span>
                           </label>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-end space-x-4">
           <button 
            type="button" 
            onClick={onClose}
            className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
           >
             Cancel
           </button>
           <button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl shadow-blue-600/30 flex items-center space-x-3 active:scale-95 transition-all disabled:opacity-50"
           >
             {isLoading ? (
               <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <Check className="h-5 w-5" />
             )}
             <span>{isLoading ? 'Processing...' : 'Save Subscription Plan'}</span>
           </button>
        </div>
      </div>
    </div>
  );
}

function LimitField({ icon, label, value, onChange }: { icon: React.ReactNode, label: string, value: number, onChange: (val: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
         <div className="text-slate-400">{icon}</div>
         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      </div>
      <input 
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-black text-blue-600 dark:text-blue-400"
      />
    </div>
  );
}
