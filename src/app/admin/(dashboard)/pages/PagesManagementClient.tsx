"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Search, FileText, Globe, ExternalLink } from "lucide-react";
import { deleteStaticPage, togglePageStatus, importStaticPages } from './actions';
import PageEditorModal from "@/components/admin/PageEditorModal";
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";
import ImportModal from "@/components/admin/ImportModal";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PagesManagementClient({ initialPages }: { initialPages: any[] }) {
  // Normalize IDs to strings
  const normalizedPages = initialPages.map(p => ({ ...p, id: p.id.toString() }));
  const [pages, setPages] = useState(normalizedPages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPages = pages.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || 
                          (statusFilter === 'active' && p.isActive) || 
                          (statusFilter === 'inactive' && !p.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleCreate = () => {
    setSelectedPage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (p: any) => {
    setSelectedPage(p);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      try {
        await deleteStaticPage(id);
        setPages(pages.filter(p => p.id !== id));
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await togglePageStatus(id, !currentStatus);
      setPages(pages.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = filteredPages.map(p => ({
        title: p.title,
        slug: p.slug,
        status: p.isActive ? 'Published' : 'Draft',
        updatedAt: p.updatedAt
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pages_export.json';
      a.click();
    } else {
      const headers = "Title,Slug,Status,LastUpdated\n";
      const csv = dataToExport.map(p => `${p.title},${p.slug},${p.status},${p.updatedAt}`).join('\n');
      const blob = new Blob([headers + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pages_export.csv';
      a.click();
    }
  };

  const handleImport = async (data: any[]) => {
    await importStaticPages(data);
    window.location.reload();
  };

  return (
    <div className="space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Static Pages CMS</h1>
          <p className="text-sm text-slate-500">Manage informational content, legal pages, and draft publications.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:opacity-90 text-white rounded-lg transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Page</span>
        </button>
      </div>

      <DataManagementToolbar 
        onSearch={setSearchTerm}
        onFilterChange={setStatusFilter}
        filterOptions={[
            { label: 'Published Only', value: 'active' },
            { label: 'Drafts Only', value: 'inactive' }
        ]}
        onExport={handleExport}
        onImport={() => setIsImportOpen(true)}
        dataCount={filteredPages.length}
        itemName="pages"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Page Information</th>
                <th className="px-4 py-4">Slug / Path</th>
                <th className="px-4 py-4 text-center">Visibility</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                         <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                         <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{p.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Last updated: {p.updatedAt?.split('T')[0] || 'Unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono py-1 px-2 bg-slate-50 dark:bg-slate-950 rounded text-slate-500 border border-slate-200 dark:border-slate-800">
                      /{p.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleToggleStatus(p.id, p.isActive)}
                      className={cn(
                        "relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        p.isActive ? "bg-green-600" : "bg-slate-200 dark:bg-slate-700"
                      )}
                    >
                      <span className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        p.isActive ? "translate-x-5" : "translate-x-0"
                      )} />
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                         onClick={() => window.open(`/pages/${p.slug}`, '_blank')}
                         className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                         title="View Live Page"
                      >
                         <ExternalLink className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
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

        {filteredPages.length === 0 && (
          <div className="py-20 text-center">
             <p className="text-slate-400 text-sm font-medium italic">No static pages found</p>
          </div>
        )}
      </div>

      <PageEditorModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            window.location.reload(); 
        }}
        page={selectedPage}
      />

      <ImportModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        title="Pages"
        templateData={[
            { title: "Privacy Policy", slug: "privacy-policy", content: "<h1>Privacy Policy</h1><p>Our commitment to your privacy.</p>", isActive: true },
            { title: "Sitemap", slug: "sitemap", content: "<ul><li>Home</li></ul>", isActive: false }
        ]}
      />
    </div>
  );
}
