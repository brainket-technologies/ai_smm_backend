"use client";

import React, { useState } from 'react';
import { Plus, CreditCard, Edit2, Trash2, Check, X, Shield, Star, Rocket, Sparkles } from 'lucide-react';
import TierFormModal from './TierFormModal';
import { deleteTier } from '@/app/admin/(dashboard)/subscriptions/actions';

interface SubscriptionManagerProps {
  initialTiers: any[];
  availableFeatures: { moduleName: string; feature_key: string }[];
}

export default function SubscriptionManager({ initialTiers, availableFeatures }: SubscriptionManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);

  const openEdit = (tier: any) => {
    setEditingTier(tier);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingTier(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (tierKey: string) => {
    if (confirm(`Are you sure you want to delete the "${tierKey}" tier? This cannot be undone.`)) {
      const result = await deleteTier(tierKey);
      if (!result.success) alert(result.error);
    }
  };

  const getTierIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('free')) return <Shield className="h-8 w-8 text-slate-400" />;
    if (k.includes('basic')) return <CreditCard className="h-8 w-8 text-green-500" />;
    if (k.includes('pro')) return <Star className="h-8 w-8 text-blue-500" />;
    if (k.includes('premium')) return <Rocket className="h-8 w-8 text-purple-500" />;
    return <Sparkles className="h-8 w-8 text-amber-500" />;
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Subscription Management</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Control the monetization of your platform by defining precise usage limits, feature access, and pricing for your users.
          </p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] font-bold transition-all active:scale-95 shadow-xl shadow-blue-600/20"
        >
          <Plus className="h-5 w-5" />
          <span>New Subscription Tier</span>
        </button>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialTiers.map((tier) => (
          <div key={tier.id.toString()} className="group bg-[var(--card-background)] rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-blue-500/20 transition-all relative overflow-hidden flex flex-col">
            
            {/* Status & Actions */}
            <div className="flex items-center justify-between mb-8">
               <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tier.isActive ? 'bg-green-50 text-green-600 dark:bg-green-600/10' : 'bg-red-50 text-red-600 dark:bg-red-600/10'}`}>
                  {tier.isActive ? 'Active' : 'Paused'}
               </div>
               <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(tier)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-600/10 text-blue-600 rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(tier.tierKey)} className="p-2 hover:bg-red-50 dark:hover:bg-red-600/10 text-red-600 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
               </div>
            </div>

            {/* Title & Icon */}
            <div className="mb-8">
               <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  {getTierIcon(tier.tierKey)}
               </div>
               <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-3xl font-black">{tier.name}</h3>
                    {tier.badge && (
                      <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.2em]">
                    KEY: {tier.tierKey}
                  </p>
               </div>
            </div>

            {/* Price */}
            <div className="mb-10 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
               <div className="flex items-baseline">
                  <span className="text-4xl font-black">₹{tier.priceAmount?.toString()}</span>
                  <span className="text-gray-400 font-bold ml-1 uppercase text-xs">/{tier.pricePeriod}</span>
               </div>
            </div>

            {/* Features Preview */}
            <div className="flex-1 space-y-6 mb-10">
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Plan Highlights</div>
               <div className="space-y-4">
                  {tier.highlightFeatures && tier.highlightFeatures.slice(0, 4).map((h: string, i: number) => (
                    <div key={i} className="flex items-start text-sm">
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 mr-4 flex-shrink-0" />
                      <span className="font-medium">{h}</span>
                    </div>
                  ))}
                  {tier.highlightFeatures?.length > 4 && (
                    <p className="text-xs text-gray-400 font-bold pl-6">+{tier.highlightFeatures.length - 4} more features...</p>
                  )}
               </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Daily Posts</p>
                  <p className="text-sm font-bold">{tier.limits?.daily_posts === -1 ? '∞' : tier.limits?.daily_posts || 0}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">AI Chats</p>
                  <p className="text-sm font-bold">{tier.limits?.daily_ai_chats === -1 ? '∞' : tier.limits?.daily_ai_chats || 0}</p>
               </div>
            </div>
          </div>
        ))}

        {initialTiers.length === 0 && (
          <div className="col-span-full p-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
             <div className="h-20 w-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold mb-2">No Tiers Found</h3>
             <p className="text-gray-400 max-w-sm mx-auto">Create your first subscription tier to start monetizing your AI features.</p>
          </div>
        )}
      </div>

      <TierFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tier={editingTier}
        availableFeatures={availableFeatures as any}
      />
    </div>
  );
}
