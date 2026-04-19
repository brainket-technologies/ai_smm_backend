"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, CreditCard, Shield, Star, Rocket, Sparkles, CheckCircle, Zap } from "lucide-react";
import { deleteTier, toggleTierStatus } from './actions';
import TierFormModal from "@/components/admin/TierFormModal";
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SubscriptionsManagementClient({ initialTiers, availableFeatures, availablePlatforms }: { initialTiers: any[], availableFeatures: any[], availablePlatforms: any[] }) {
  const [tiers, setTiers] = useState(initialTiers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTiers = tiers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.tierKey.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || 
                          (statusFilter === 'active' && t.isActive) || 
                          (statusFilter === 'paused' && !t.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleCreate = () => {
    setSelectedTier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tier: any) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
  };

  const handleDelete = async (tierKey: string) => {
    if (confirm(`Are you sure you want to delete the "${tierKey}" tier?`)) {
      try {
        await deleteTier(tierKey);
        setTiers(tiers.filter(t => t.tierKey !== tierKey));
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleTierStatus(id, !currentStatus);
      setTiers(tiers.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getTierIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('free')) return <Shield className="h-5 w-5 text-slate-400" />;
    if (k.includes('basic')) return <CreditCard className="h-5 w-5 text-green-500" />;
    if (k.includes('pro')) return <Star className="h-5 w-5 text-blue-500" />;
    if (k.includes('premium')) return <Rocket className="h-5 w-5 text-purple-500" />;
    return <Sparkles className="h-5 w-5 text-amber-500" />;
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Subscription Tiers</h1>
          <p className="text-sm text-slate-500">Manage pricing, limits, and feature access for your user base.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Tier</span>
        </button>
      </div>

      <DataManagementToolbar 
        onSearch={setSearchTerm}
        onFilterChange={setStatusFilter}
        filterOptions={[
            { label: 'Active Only', value: 'active' },
            { label: 'Paused Only', value: 'paused' }
        ]}
        onExport={() => {}}
        onImport={() => {}}
        dataCount={filteredTiers.length}
        itemName="tiers"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Tier Identity</th>
                <th className="px-4 py-4">Pricing</th>
                <th className="px-4 py-4">Capacity Limits</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                        {getTierIcon(tier.tierKey)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{tier.name}</span>
                            {tier.badge && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 uppercase translate-y-[-1px]">
                                    {tier.badge}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">KEY: {tier.tierKey}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                        <div className="flex items-baseline space-x-1">
                            <span className="text-sm font-black text-slate-900 dark:text-white">₹{tier.priceAmount}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">/{tier.pricePeriod}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Standard Billing</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                     <div className="flex items-center space-x-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Daily Posts</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                                {tier.limits?.daily_posts === -1 ? 'Unlimited' : tier.limits?.daily_posts || 0}
                            </span>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-100 dark:bg-slate-800 mx-1" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">AI Chats</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                                {tier.limits?.daily_ai_chats === -1 ? 'Unlimited' : tier.limits?.daily_ai_chats || 0}
                            </span>
                        </div>
                     </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                        onClick={() => handleToggleStatus(tier.id, tier.isActive)}
                        className={cn(
                            "relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                            tier.isActive ? "bg-green-600" : "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <span className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            tier.isActive ? "translate-x-5" : "translate-x-0"
                        )} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                        onClick={() => handleEdit(tier)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                         onClick={() => handleDelete(tier.tierKey)}
                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

        {filteredTiers.length === 0 && (
          <div className="py-24 text-center">
             <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 mb-4 shadow-inner">
                <CreditCard className="h-8 w-8 text-slate-300" />
             </div>
             <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">No tiers detected</p>
          </div>
        )}
      </div>

      <TierFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tier={selectedTier}
        availableFeatures={availableFeatures}
        availablePlatforms={availablePlatforms}
      />
    </div>
  );
}
