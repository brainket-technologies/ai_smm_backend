"use client";

import React, { useState } from 'react';
import { Search, Filter, Download, Upload, FileJson, FileType, Check, ChevronDown } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface DataManagementToolbarProps {
  onSearch: (term: string) => void;
  onFilterChange: (value: string) => void;
  filterOptions: FilterOption[];
  onExport: (format: 'csv' | 'json') => void;
  onImport: () => void;
  dataCount: number;
  itemName: string;
}

export default function DataManagementToolbar({
  onSearch,
  onFilterChange,
  filterOptions,
  onExport,
  onImport,
  dataCount,
  itemName
}: DataManagementToolbarProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
      
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input 
          type="text"
          placeholder={`Search ${itemName}...`}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="flex items-center space-x-2 w-full md:w-auto">
        <div className="relative group w-full md:w-40">
           <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <select 
             className="w-full pl-9 pr-6 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium appearance-none outline-none focus:ring-1 focus:ring-primary"
             onChange={(e) => {
                setActiveFilter(e.target.value);
                onFilterChange(e.target.value);
             }}
             value={activeFilter}
           >
             <option value="all">All Status</option>
             {filterOptions.map((opt) => (
               <option key={opt.value} value={opt.value}>{opt.label}</option>
             ))}
           </select>
           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
            
            {/* Export Menu */}
            <div className="relative">
                <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 hover:text-primary transition-colors text-sm font-medium"
                title="Export Data"
                >
                    <Download className="h-4 w-4" />
                    <span className="hidden lg:inline">Export</span>
                </button>
                
                {isExportOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)} />
                        <div className="absolute top-full mt-2 right-0 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-20 overflow-hidden">
                            <button 
                                onClick={() => { onExport('csv'); setIsExportOpen(false); }}
                                className="w-full px-4 py-2.5 text-xs font-bold text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                            >
                                <FileType className="h-3.5 w-3.5 text-primary" />
                                <span>CSV File</span>
                            </button>
                            <button 
                                onClick={() => { onExport('json'); setIsExportOpen(false); }}
                                className="w-full px-4 py-2.5 text-xs font-bold text-left hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2"
                            >
                                <FileJson className="h-3.5 w-3.5 text-amber-500" />
                                <span>JSON File</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Import Button */}
            <button 
              onClick={onImport}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 hover:text-primary transition-colors text-sm font-medium"
              title="Import Data"
            >
                <Upload className="h-4 w-4" />
                <span className="hidden lg:inline">Import</span>
            </button>
        </div>

        <div className="hidden lg:flex items-center text-xs font-semibold text-slate-400 px-3 border-l border-slate-200 dark:border-slate-800 ml-2">
            {dataCount} {dataCount === 1 ? 'item' : 'items'}
        </div>
      </div>
    </div>
  );
}
