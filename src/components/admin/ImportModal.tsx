"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, FileType, FileJson, AlertCircle, Download, CheckCircle2 } from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  title: string;
  templateData: any[];
}

export default function ImportModal({
  isOpen,
  onClose,
  onImport,
  title,
  templateData
}: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
            setError(null);
        } else {
            setError("Please upload a valid CSV or JSON file.");
            setFile(null);
        }
    }
  };

  const downloadTemplate = (format: 'csv' | 'json') => {
    let content = '';
    let fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_template`;

    if (format === 'json') {
      content = JSON.stringify(templateData, null, 2);
      fileName += '.json';
    } else {
      const headers = Object.keys(templateData[0]).join(',');
      const rows = templateData.map(obj => Object.values(obj).join(',')).join('\n');
      content = `${headers}\n${rows}`;
      fileName += '.csv';
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const processImport = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          let data: any[] = [];

          if (file.name.endsWith('.json')) {
            data = JSON.parse(content);
          } else {
            // Simple CSV Parser
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            data = lines.slice(1).filter(line => line.trim() !== '').map(line => {
              const values = line.split(',');
              return headers.reduce((obj: any, header, i) => {
                obj[header.trim()] = values[i]?.trim();
                return obj;
              }, {});
            });
          }

          if (!Array.isArray(data)) {
            throw new Error("Invalid file format. Data must be an array.");
          }

          await onImport(data);
          setSuccess(true);
          setTimeout(() => {
            onClose();
            setSuccess(false);
            setFile(null);
          }, 1500);
        } catch (err: any) {
          setError(err.message || "Failed to parse file.");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError("Failed to read file.");
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <Upload className="h-5 w-5 text-blue-600" />
             <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import {title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Instructions & Template */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
             <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider">Before you upload</p>
                   <p className="text-sm text-slate-600 dark:text-slate-400">Ensure your file follows the required format. Download a template below to get started.</p>
                   <div className="flex items-center space-x-3 pt-2">
                       <button 
                        onClick={() => downloadTemplate('csv')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold hover:text-blue-600 transition-all"
                       >
                          <Download className="h-3.5 w-3.5" />
                          <span>CSV Template</span>
                       </button>
                       <button 
                        onClick={() => downloadTemplate('json')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold hover:text-blue-600 transition-all"
                       >
                          <Download className="h-3.5 w-3.5" />
                          <span>JSON Template</span>
                       </button>
                   </div>
                </div>
             </div>
          </div>

          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all cursor-pointer group"
          >
             <input 
               type="file" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleFileChange}
               accept=".csv,application/json"
             />
             
             {file ? (
                <div className="flex flex-col items-center text-center">
                    {file.name.endsWith('.json') ? <FileJson className="h-10 w-10 text-amber-500" /> : <FileType className="h-10 w-10 text-green-500" />}
                    <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
             ) : (
                <>
                    <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                        <Upload className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-700 dark:text-white">Click or drag file to upload</p>
                        <p className="text-xs text-slate-400 mt-1">Accepts CSV or JSON files</p>
                    </div>
                </>
             )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center space-x-2 text-red-600 text-xs font-bold animate-pulse">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-900/30 rounded-lg flex items-center justify-center space-x-2 text-green-600 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Import Successful!</span>
            </div>
          )}

          <div className="pt-2">
            <button 
                onClick={processImport}
                disabled={!file || isUploading || success}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
                {isUploading ? (
                   <div className="h-4 w-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                   <span>Start Import</span>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
