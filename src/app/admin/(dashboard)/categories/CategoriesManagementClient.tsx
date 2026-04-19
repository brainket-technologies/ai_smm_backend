"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, FolderTree, Tag, Hash, Building2, ShoppingBag, Wrench, ChevronDown, ChevronRight } from "lucide-react";
import { deleteCategory, deleteSubcategory, upsertCategory, upsertSubcategory, toggleCategoryStatus, toggleSubcategoryStatus } from './actions';
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function CategoriesManagementClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Used for 'type' filtering

  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Modals
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [activeParentCatId, setActiveParentCatId] = useState<string | null>(null);
  const [activeParentType, setActiveParentType] = useState<string>('business');

  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || c.type === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getThemeVars = (type: string) => {
    if (type === 'product') return { icon: <ShoppingBag className="h-5 w-5 text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/20", border: 'border-blue-200 dark:border-blue-800' };
    if (type === 'service') return { icon: <Wrench className="h-5 w-5 text-amber-500" />, bg: "bg-amber-50 dark:bg-amber-900/20", border: 'border-amber-200 dark:border-amber-800' };
    return { icon: <Building2 className="h-5 w-5 text-green-500" />, bg: "bg-green-50 dark:bg-green-900/20", border: 'border-green-200 dark:border-green-800' };
  };

  const handleDeleteCat = async (id: string) => {
    if (confirm("Are you sure? This will delete all subcategories inside it!")) {
      const res = await deleteCategory(id);
      if (res.success) setCategories(categories.filter(c => c.id !== id));
      else alert(res.error);
    }
  };

  const handleDeleteSub = async (catId: string, subId: string) => {
    if (confirm("Delete this subcategory?")) {
      const res = await deleteSubcategory(subId);
      if (res.success) {
        setCategories(categories.map(c => c.id === catId ? { ...c, subCategories: c.subCategories.filter((s:any) => s.id !== subId)} : c));
      } else alert(res.error);
    }
  };

  const handleToggleCatStatus = async (id: string, currentStatus: boolean | null | undefined) => {
    const statusToPass = currentStatus ?? true;
    const newStatus = !statusToPass;
    const res = await toggleCategoryStatus(id, statusToPass);
    if (res.success) {
      setCategories(categories.map(c => {
        if (c.id === id) {
          return { 
            ...c, 
            isActive: newStatus,
            // the backend cascades FALSE downwards securely via raw SQL, reflect this inside local state instantly:
            subCategories: newStatus === false ? c.subCategories.map((s:any) => ({...s, isActive: false})) : c.subCategories 
          };
        }
        return c;
      }));
    } else alert(res.error);
  };

  const handleToggleSubStatus = async (catId: string, subId: string, currentStatus: boolean | null | undefined) => {
    const statusToPass = currentStatus ?? true;
    const res = await toggleSubcategoryStatus(subId, statusToPass);
    if (res.success) {
      setCategories(categories.map(c => c.id === catId ? 
        { ...c, subCategories: c.subCategories.map((s:any) => s.id === subId ? { ...s, isActive: !statusToPass } : s) } 
        : c));
    } else alert(res.error);
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Taxonomy & Categories</h1>
          <p className="text-sm text-slate-500">Manage classification structures separately across Business, Products, and Services.</p>
        </div>
        <button 
          onClick={() => { setEditingCat(null); setIsCatModalOpen(true); }}
          className="flex items-center space-x-2 bg-blue-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </button>
      </div>

      <DataManagementToolbar 
        onSearch={setSearchTerm}
        onFilterChange={setStatusFilter}
        filterOptions={[
            { label: 'Business Categories', value: 'business' },
            { label: 'Product Categories', value: 'product' },
            { label: 'Service Categories', value: 'service' }
        ]}
        onExport={() => {}}
        onImport={() => {}}
        dataCount={filteredCategories.length}
        itemName="nodes"
      />

      <div className="space-y-3">
        {filteredCategories.map(cat => {
            const theme = getThemeVars(cat.type);
            const isExpanded = expandedCats[cat.id];
            
            return (
                <div key={cat.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm transition-all">
                    
                    {/* Category Header Row */}
                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center space-x-4 cursor-pointer flex-1" onClick={() => toggleExpand(cat.id)}>
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            </button>
                            <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg border", theme.bg, theme.border)}>
                                {theme.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{cat.name}</h3>
                                <div className="flex items-center space-x-2 mt-0.5">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{cat.type} MODULE</span>
                                    <span className="text-[10px] text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                        {cat.subCategories?.length || 0} Subs
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full max-w-[200px] justify-end">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleCatStatus(cat.id, cat.isActive); }}
                                className={cn(
                                    "relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mr-2",
                                    cat.isActive !== false ? "bg-green-600" : "bg-slate-200 dark:bg-slate-700"
                                )}
                            >
                                <span className={cn(
                                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    cat.isActive !== false ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                            <button 
                                onClick={() => { setActiveParentCatId(cat.id); setActiveParentType(cat.type); setEditingSub(null); setIsSubModalOpen(true); }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-md transition-colors mr-2"
                            >
                                <Plus className="h-3 w-3" />
                                <span>Add Sub</span>
                            </button>
                            <button onClick={() => { setEditingCat(cat); setIsCatModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                                <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteCat(cat.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Subcategories Dropdown */}
                    {isExpanded && (
                        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-4">
                            {cat.subCategories?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {cat.subCategories.map((sub: any) => (
                                        <div key={sub.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                            <div className="flex items-center space-x-2">
                                                <Hash className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sub.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleToggleSubStatus(cat.id, sub.id, sub.isActive); }}
                                                    className={cn(
                                                        "relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                        sub.isActive !== false ? "bg-green-600" : "bg-slate-200 dark:bg-slate-700"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                        sub.isActive !== false ? "translate-x-4" : "translate-x-0"
                                                    )} />
                                                </button>
                                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                                                    <button onClick={() => { setActiveParentCatId(cat.id); setActiveParentType(cat.type); setEditingSub(sub); setIsSubModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteSub(cat.id, sub.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Subcategories</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        })}
      </div>

      {categories.length === 0 && (
         <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 mb-4 shadow-inner">
               <FolderTree className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">No categorisation structures present.</p>
         </div>
      )}

      <CategoryModal isOpen={isCatModalOpen} onClose={() => { setIsCatModalOpen(false); window.location.reload(); }} editingCat={editingCat} />
      <SubCategoryModal isOpen={isSubModalOpen} onClose={() => { setIsSubModalOpen(false); window.location.reload(); }} editingSub={editingSub} parentId={activeParentCatId} parentType={activeParentType} />
    </div>
  );
}

// ------------------------------------
// Category Modal
// ------------------------------------
function CategoryModal({ isOpen, onClose, editingCat }: any) {
    const [name, setName] = useState('');
    const [type, setType] = useState('business');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if(editingCat) { setName(editingCat.name); setType(editingCat.type); }
        else { setName(''); setType('business'); }
    }, [editingCat, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const res = await upsertCategory({ id: editingCat?.id, name, type });
        setLoading(false);
        if(res.success) onClose();
        else alert(res.error);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingCat ? 'Edit Category' : 'New Category'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Category Name</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-blue-500" placeholder="e.g. Real Estate" />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">System Segment (Type)</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} disabled={!!editingCat} className="w-full px-4 py-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold uppercase outline-none focus:border-blue-500 disabled:opacity-50">
                            <option value="business">Business</option>
                            <option value="product">Product</option>
                            <option value="service">Service</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Warning: Core architecture type cannot be changed after creation.</p>
                    </div>
                    <div className="pt-4 flex items-center justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-bold text-sm transition-all shadow-sm">
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ------------------------------------
// SubCategory Modal
// ------------------------------------
function SubCategoryModal({ isOpen, onClose, editingSub, parentId, parentType }: any) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if(editingSub) setName(editingSub.name);
        else setName(''); 
    }, [editingSub, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const res = await upsertSubcategory({ id: editingSub?.id, categoryId: parentId, name, type: parentType });
        setLoading(false);
        if(res.success) onClose();
        else alert(res.error);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingSub ? 'Edit Subcategory' : 'Add Subcategory'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Node Name</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-blue-500" placeholder="e.g. Specialized Tooling" />
                    </div>
                    <div className="pt-4 flex items-center justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-bold text-sm transition-all shadow-sm">
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
