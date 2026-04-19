"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2, ShieldCheck, CreditCard, Cpu, MessageSquare, Image, Settings, Globe, LayoutGrid, Search, Trash } from 'lucide-react';
import FeatureFlagFormModal from './FeatureFlagFormModal';
import DataManagementToolbar from './DataManagementToolbar';
import { deleteFeatureFlag, toggleFeatureAction, deleteModuleAction, toggleModuleAction, importFeatureFlagsAction } from '@/app/admin/(dashboard)/feature-flags/actions';

interface FeatureFlagManagerProps {
    initialFlags: any[];
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

const getModuleIcon = (moduleName: string) => {
    const name = moduleName.toLowerCase();
    const iconClass = "h-4 w-4";
    if (name.includes('auth') || name.includes('user')) return <ShieldCheck className={iconClass} />;
    if (name.includes('payment') || name.includes('subscription')) return <CreditCard className={iconClass} />;
    if (name.includes('ai') || name.includes('model') || name.includes('generat')) return <Cpu className={iconClass} />;
    if (name.includes('chat') || name.includes('message') || name.includes('social')) return <MessageSquare className={iconClass} />;
    if (name.includes('image') || name.includes('media')) return <Image className={iconClass} />;
    if (name.includes('config') || name.includes('system')) return <Settings className={iconClass} />;
    if (name.includes('translation') || name.includes('language')) return <Globe className={iconClass} />;
    return <LayoutGrid className={iconClass} />;
};

export default function FeatureFlagManager({ initialFlags }: FeatureFlagManagerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState<any>(null);
    const [targetModuleName, setTargetModuleName] = useState<string>('');
    
    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filtered Flags
    const filteredFlags = useMemo(() => {
        return initialFlags.filter(flag => {
            const searchLower = searchTerm.toLowerCase();
            const moduleDisplay = flag.moduleName.toLowerCase().replace(/_/g, ' ');
            const featureDisplay = flag.featureKey.toLowerCase().replace(/_/g, ' ');
            
            const matchesSearch = flag.moduleName.toLowerCase().includes(searchLower) || 
                                flag.featureKey.toLowerCase().includes(searchLower) ||
                                moduleDisplay.includes(searchLower) ||
                                featureDisplay.includes(searchLower);
                                
            const matchesStatus = statusFilter === 'all' || 
                                 (statusFilter === 'enabled' && flag.isEnabled) || 
                                 (statusFilter === 'disabled' && !flag.isEnabled);
            return matchesSearch && matchesStatus;
        });
    }, [initialFlags, searchTerm, statusFilter]);

    // Group flags by module
    const groupedFlags = useMemo(() => {
        return filteredFlags.reduce((acc: any, flag) => {
            if (!acc[flag.moduleName]) acc[flag.moduleName] = [];
            acc[flag.moduleName].push(flag);
            return acc;
        }, {});
    }, [filteredFlags]);

    const handleEdit = (flag: any) => {
        setTargetModuleName('');
        setSelectedFlag(flag);
        setIsModalOpen(true);
    };

    const handleAddFeatureToModule = (moduleName: string) => {
        setSelectedFlag(null);
        setTargetModuleName(moduleName);
        setIsModalOpen(true);
    };

    const handleAddModule = () => {
        setSelectedFlag(null);
        setTargetModuleName('');
        setIsModalOpen(true);
    };

    const handleDeleteFeature = async (id: string) => {
        if (confirm("Are you sure you want to delete this feature flag?")) {
            const result = await deleteFeatureFlag(id);
            if (!result.success) alert("Error: " + result.error);
        }
    };

    const handleDeleteModule = async (moduleName: string) => {
        if (confirm(`CAUTION: Are you sure you want to delete the entire [${moduleName.toUpperCase()}] module?`)) {
            const result = await deleteModuleAction(moduleName);
            if (!result.success) alert("Error: " + result.error);
        }
    };

    const handleToggle = async (id: string, isEnabled: boolean) => {
        const result = await toggleFeatureAction(id, isEnabled);
        if (!result.success) alert("Error: " + result.error);
    };

    const handleToggleModule = async (moduleName: string, moduleFlags: any[]) => {
        const isAnyEnabled = moduleFlags.some(f => f.isEnabled);
        const result = await toggleModuleAction(moduleName, !isAnyEnabled);
        if (!result.success) alert("Error: " + result.error);
    };

    const handleExport = (format: 'csv' | 'json') => {
        const data = initialFlags.map(f => ({
            moduleName: f.moduleName,
            featureKey: f.featureKey,
            isEnabled: f.isEnabled
        }));

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feature_flags_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        } else {
            const headers = ['moduleName', 'featureKey', 'isEnabled'];
            const csv = [
                headers.join(','),
                ...data.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feature_flags_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (event: any) => {
                try {
                    let data: any[] = [];
                    if (file.name.endsWith('.json')) {
                        data = JSON.parse(event.target.result);
                    } else {
                        const text = event.target.result;
                        const lines = text.split('\n');
                        const headers = lines[0].split(',');
                        data = lines.slice(1).filter((l: string) => l.trim()).map((line: string) => {
                            const values = line.split(',');
                            return {
                                moduleName: values[0],
                                featureKey: values[1],
                                isEnabled: values[2] === 'true'
                            };
                        });
                    }
                    if (confirm(`Import ${data.length} features?`)) {
                        const result = await importFeatureFlagsAction(data);
                        if (!result.success) alert("Error: " + result.error);
                    }
                } catch (err) {
                    alert("Failed to parse file: " + err);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    return (
        <div className="space-y-4 pb-10">
            {/* Standard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feature Flag Management</h1>
                    <p className="text-sm text-slate-500">Enable or disable system modules and features in real-time.</p>
                </div>
                <button 
                    onClick={handleAddModule}
                    className="flex items-center space-x-2 bg-blue-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Feature</span>
                </button>
            </div>

            <DataManagementToolbar 
                onSearch={setSearchTerm}
                onFilterChange={setStatusFilter}
                filterOptions={[
                    { label: 'Show Online', value: 'enabled' },
                    { label: 'Show Offline', value: 'disabled' },
                ]}
                onExport={handleExport}
                onImport={handleImport}
                dataCount={filteredFlags.length}
                itemName="modules or features"
            />

            {/* Separate Cards for Each Module */}
            <div className="space-y-6">
                {Object.entries(groupedFlags).map(([moduleName, moduleFlags]: [string, any]) => {
                    const isAnyEnabled = moduleFlags.some((f: any) => f.isEnabled);
                    return (
                        <div key={moduleName} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                            
                            {/* Card Header (Standard Style) */}
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
                                        {getModuleIcon(moduleName)}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-base font-bold capitalize text-slate-900 dark:text-white leading-tight">{moduleName.replace('_', ' ')}</h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{moduleFlags.length} Features Tethered</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-[10px] font-black uppercase text-slate-400">Master Control</span>
                                        <button 
                                            onClick={() => handleToggleModule(moduleName, moduleFlags)}
                                            className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition-colors",
                                                isAnyEnabled 
                                                    ? "bg-blue-50 text-blue-600 border-blue-100" 
                                                    : "bg-slate-100 text-slate-400 border-slate-200"
                                            )}
                                        >
                                            {isAnyEnabled ? "Online" : "Offline"}
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-1 border-l border-slate-200 dark:border-slate-700 pl-4">
                                        <button onClick={() => handleAddFeatureToModule(moduleName)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors" title="Add Feature"><Plus className="h-4 w-4"/></button>
                                        <button onClick={() => handleDeleteModule(moduleName)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded transition-colors" title="Delete Module"><Trash2 className="h-4 w-4"/></button>
                                    </div>
                                </div>
                            </div>

                            {/* Features Table Inside Card */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {moduleFlags.map((flag: any) => (
                                            <tr key={flag.id.toString()} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${flag.isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                        <div className="flex flex-col -space-y-0.5">
                                                            <span className={`text-sm font-semibold capitalize transition-colors ${flag.isEnabled ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                                                                {flag.featureKey.split('_').slice(1).join(' ')}
                                                            </span>
                                                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">{flag.featureKey}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button 
                                                        onClick={() => handleToggle(flag.id.toString(), flag.isEnabled)}
                                                        className={cn(
                                                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors",
                                                            flag.isEnabled 
                                                              ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:border-green-900/30" 
                                                              : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                                        )}
                                                    >
                                                        {flag.isEnabled ? "Active" : "Disabled"}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <button onClick={() => handleEdit(flag)} className="p-2 text-slate-300 hover:text-blue-600 rounded transition-colors"><Edit3 className="h-4 w-4"/></button>
                                                        <button onClick={() => handleDeleteFeature(flag.id.toString())} className="p-2 text-slate-300 hover:text-red-500 rounded transition-colors"><Trash2 className="h-4 w-4"/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>


                {filteredFlags.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 text-sm font-medium italic">No features found</p>
                    </div>
                )}

            <FeatureFlagFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                flag={selectedFlag} 
                initialModuleName={targetModuleName}
            />
        </div>
    );
}
