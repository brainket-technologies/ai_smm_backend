"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Eye, FileText, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { createStaticPage, updateStaticPage } from '@/app/admin/(dashboard)/pages/actions';
import RichTextEditor from './RichTextEditor';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

interface PageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  page?: any; 
}

export default function PageEditorModal({ isOpen, onClose, page }: PageEditorModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        content: page.content || '',
        isActive: page.isActive ?? true
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        isActive: true
      });
    }
  }, [page, isOpen]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    setFormData({ ...formData, title, slug: page ? formData.slug : slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (page) {
        await updateStaticPage(BigInt(page.id), formData);
      } else {
        await createStaticPage(formData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save page:", error);
      alert("Error saving page.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[85vh] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center space-x-3">
             <FileText className="h-5 w-5 text-primary" />
             <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{page ? 'Edit' : 'Create'} Static Page</h2>
                <p className="text-xs text-slate-500">Manage informational content and legal pages.</p>
             </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={cn(
                    "flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-colors border",
                    isPreviewMode 
                        ? "bg-primary border-primary text-white" 
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50"
                )}
            >
                <Eye className="h-3.5 w-3.5" />
                <span>{isPreviewMode ? 'Editor' : 'Preview'}</span>
            </button>
            {page && (
              <button 
                  onClick={() => window.open(`/pages/${formData.slug}`, '_blank')}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 transition-colors"
                  title="View Live Version"
              >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Live</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400">
                <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Editor Side */}
            <div className={cn(
                "flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar",
                isPreviewMode && "hidden lg:block lg:w-1/2 lg:border-r border-slate-100 dark:border-slate-800"
            )}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Page Title</label>
                        <input 
                            required
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="e.g. Terms of Service"
                            className="w-full px-4 py-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-1 focus:ring-primary transition-all font-bold text-md"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Slug / URL Path</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input 
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                placeholder="terms-of-service"
                                className="w-full pl-9 pr-4 py-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 outline-none focus:ring-1 focus:ring-primary transition-all font-mono text-xs"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 flex flex-col h-[calc(100%-100px)]">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Page Content</label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Published</span>
                            <div className="relative">
                                <input 
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className="sr-only peer"
                                />
                                <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                            </div>
                        </label>
                    </div>
                    <RichTextEditor 
                        value={formData.content}
                        onChange={(content) => setFormData({...formData, content: content})}
                        placeholder="Type page content here (HTML supported)..."
                    />
                </div>
            </div>

            {/* Preview Side */}
            <div className={cn(
                "flex-1 bg-white dark:bg-slate-950 overflow-y-auto p-10 custom-scrollbar",
                !isPreviewMode && "hidden"
            )}>
                <article className="max-w-none prose prose-sm dark:prose-invert">
                    <h1 className="text-2xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">{formData.title || "Untitled Page"}</h1>
                    <div 
                        className="whitespace-pre-wrap text-slate-600 dark:text-slate-400"
                        dangerouslySetInnerHTML={{ __html: formData.content || "<p class='italic opacity-40'>Preview will appear here...</p>" }}
                    />
                </article>
            </div>
            
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end space-x-3">
           <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-semibold text-slate-500 hover:bg-slate-200 transition-colors"
           >
             Cancel
           </button>
           <button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:opacity-90 text-white px-6 py-2 rounded-md font-bold text-sm flex items-center space-x-2 transition-all disabled:opacity-50"
           >
             {isLoading ? (
               <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <Save className="h-4 w-4" />
             )}
             <span>{isLoading ? 'Saving...' : page ? 'Update' : 'Publish'}</span>
           </button>
        </div>

      </div>
    </div>
  );
}
