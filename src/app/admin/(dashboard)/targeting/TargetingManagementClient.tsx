"use client";

import React, { useState } from 'react';
import { Globe, Users, Palette, MousePointerClick, Briefcase, Plus, Edit3, Trash2, Tag, Search, ArrowUpDown } from 'lucide-react';
import { deleteTarget, toggleTargetStatus, upsertTarget } from './actions';
import DataManagementToolbar from '@/components/admin/DataManagementToolbar';

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}

export default function TargetingManagementClient({ initialDataMap }: { initialDataMap: any }) {
    const [activeTab, setActiveTab] = useState("targetRegion");
    const [dataMap, setDataMap] = useState(initialDataMap);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [newItemName, setNewItemName] = useState("");

    const TABS = [
        { id: "targetRegion", label: "Target Regions", icon: Globe },
        { id: "targetAgeGroup", label: "Age Groups", icon: Users },
        { id: "modelEthnicity", label: "Ethnicities", icon: Palette },
        { id: "cTAButton", label: "CTA Buttons", icon: MousePointerClick },
        { id: "audienceType", label: "Audience Types", icon: Briefcase }
    ];

    const currentData = dataMap[activeTab] || [];

    // Filter/Sort State (Local only)
    const [searchQuery, setSearchQuery] = useState("");

    const displayedData = currentData
        .filter((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

    const handleSave = async () => {
        if (!newItemName.trim()) return;
        const targetId = editingItem ? editingItem.id : null;
        
        const res = await upsertTarget(activeTab as any, targetId, newItemName.trim());
        if (res.success) {
            // Local state append/replace to avoid harsh flashes
            const updatedList = editingItem
                ? currentData.map((d: any) => d.id === targetId ? { ...d, name: newItemName.trim() } : d)
                : [...currentData, { id: 'temp_' + Date.now(), name: newItemName.trim(), isActive: true }];
            
            setDataMap({ ...dataMap, [activeTab]: updatedList });
            setIsModalOpen(false);
            setNewItemName("");
            setEditingItem(null);
            // hard refresh normally triggers by action revalidatePath, but client side updates first.
        } else {
            alert(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this targeting entry?")) return;
        const res = await deleteTarget(activeTab as any, id);
        if (res.success) {
            setDataMap({ ...dataMap, [activeTab]: currentData.filter((d: any) => d.id !== id) });
        } else {
            alert(res.error);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean | null) => {
        const statusToPass = currentStatus ?? true;
        const res = await toggleTargetStatus(activeTab as any, id, statusToPass);
        if (res.success) {
            setDataMap({
                ...dataMap,
                [activeTab]: currentData.map((d: any) => d.id === id ? { ...d, isActive: !statusToPass } : d)
            });
        } else {
            alert(res.error);
        }
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setNewItemName(item.name);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingItem(null);
        setNewItemName("");
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Targeting Attributes</h1>
                    <p className="text-sm text-slate-500">Configure global parameters assigned structurally across the app algorithms.</p>
                </div>
                <button 
                    onClick={openCreate}
                    className="flex items-center space-x-2 bg-blue-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add {{
                        "targetRegion": "Target Region",
                        "targetAgeGroup": "Age Group",
                        "modelEthnicity": "Ethnicity",
                        "cTAButton": "CTA Button",
                        "audienceType": "Audience Type"
                    }[activeTab]}</span>
                </button>
            </div>

            {/* TABS HEADER */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-2">
                <div className="flex overflow-x-auto space-x-2 scrollbar-hide">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const tabData = dataMap[tab.id] || [];
                        const activeCount = tabData.filter((d: any) => d.isActive !== false).length;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                                <span className={cn(
                                    "ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold",
                                    isActive 
                                        ? "bg-blue-100/50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" 
                                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                )}>
                                    {activeCount}/{tabData.length}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TOOLBAR */}
            <DataManagementToolbar
                onSearch={setSearchQuery}
                onFilterChange={() => {}}
                filterOptions={[]}
                onExport={(format:any) => {
                    const exportData = currentData.map(({ id, name, isActive }: any) => ({ id, name, status: isActive !== false ? 'Active' : 'Hidden' }));
                    const fname = `${activeTab}_${Date.now()}.${format}`;
                    const content = format === 'json' ? "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2)) : "data:text/csv;charset=utf-8," + encodeURIComponent(['ID,Name,Status', ...exportData.map((row: any) => `"${row.id}","${row.name}","${row.status}"`)].join('\n'));
                    
                    const el = document.createElement('a');
                    el.setAttribute("href", content);
                    el.setAttribute("download", fname);
                    document.body.appendChild(el);
                    el.click();
                    el.remove();
                }}
                onImport={() => alert(`Drag and Drop your CSV file here to bulk populate ${TABS.find((t:any) => t.id === activeTab)?.label}. (API Route Extension Pending)`)}
                dataCount={displayedData.length}
                itemName={TABS.find(t => t.id === activeTab)?.label.toLowerCase() || "entries"}
            />

            {/* LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedData.map((item: any) => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500/30 transition-all group flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800 dark:text-white mb-1 pr-2 truncate max-w-[180px]" title={item.name}>{item.name}</span>
                            <div className="flex space-x-2 items-center">
                                {/* iOS Style Toggle */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(item.id, item.isActive); }}
                                    className={cn(
                                        "relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
                                        item.isActive !== false ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                                    )}
                                >
                                    <span className={cn(
                                        "inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                        item.isActive !== false ? "translate-x-4" : "translate-x-0"
                                    )} />
                                </button>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{item.isActive !== false ? 'Active' : 'Hidden'}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button onClick={() => openEdit(item)} className="p-2 bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-blue-900/40 text-slate-500 hover:text-blue-600 rounded-lg transition-colors">
                                <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-900/40 text-slate-500 hover:text-red-600 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                
                {displayedData.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <Tag className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Entries Found</h3>
                        <p className="text-sm text-slate-500 text-center max-w-sm">No {TABS.find(t => t.id === activeTab)?.label} matched your query or none have been created yet.</p>
                        <button onClick={openCreate} className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                            <Plus className="h-4 w-4" />
                            <span>Add New</span>
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                {editingItem ? 'Edit Entry' : 'Add New Entry'}
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">Manage data segment for the {TABS.find(t => t.id === activeTab)?.label} targeting matrix.</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Name Label
                                    </label>
                                    <input
                                        type="text"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Enter value..."
                                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!newItemName.trim()}
                                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
