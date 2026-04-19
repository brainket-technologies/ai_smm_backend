"use client";

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  CheckCircle, 
  Eye, 
  Star, 
  Filter, 
  AlertCircle, 
  Search,
  CheckCircle2,
  Clock,
  MoreVertical
} from 'lucide-react';
import { updateFeedbackStatus, deleteFeedback } from './actions';
import DataManagementToolbar from '@/components/admin/DataManagementToolbar';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type Feedback = {
  id: string;
  userId: string | null;
  subject: string | null;
  message: string;
  rating: number | null;
  status: string;
  createdAt: string;
  user?: {
    name: string | null;
    email: string | null;
    businesses: { name: string }[];
  } | null;
};

export default function FeedbackManagementClient({ initialFeedbacks }: { initialFeedbacks: Feedback[] }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState<Feedback | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredFeedbacks = feedbacks.filter(f =>
    (f.user?.name?.toLowerCase() || f.user?.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (f.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    f.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.user?.businesses.some(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const res = await updateFeedbackStatus(id, newStatus);
    if (res.success) {
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f));
      if (viewingFeedback?.id === id) {
        setViewingFeedback({ ...viewingFeedback, status: newStatus });
      }
    } else {
      alert(res.error || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    const res = await deleteFeedback(id);
    if (res.success) {
      setFeedbacks(feedbacks.filter(f => f.id !== id));
      setIsModalOpen(false);
    } else {
      alert(res.error || "Failed to delete feedback");
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const data = feedbacks.map(f => ({ 
      id: f.id, 
      name: f.user?.name, 
      email: f.user?.email, 
      subject: f.subject, 
      message: f.message, 
      rating: f.rating, 
      status: f.status, 
      date: f.createdAt 
    }));
    const fname = `feedback_${Date.now()}.${format}`;
    const content = format === 'json'
      ? "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2))
      : "data:text/csv;charset=utf-8," + encodeURIComponent(['ID,Name,Email,Subject,Rating,Status,Date', ...data.map(f => `"${f.id}","${f.name || ''}","${f.email || ''}","${f.subject}","${f.rating}","${f.status}","${f.date}"`)].join('\n'));
    
    const el = document.createElement('a');
    el.setAttribute("href", content);
    el.setAttribute("download", fname);
    document.body.appendChild(el);
    el.click();
    el.remove();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            <span>Resolved</span>
          </span>
        );
      case 'reviewed':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Eye className="h-3 w-3" />
            <span>Reviewed</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              "h-3 w-3", 
              i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"
            )} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">User Feedback</h1>
          <p className="text-sm text-slate-500 font-medium">Monitor and respond to suggestions, bug reports, and reviews.</p>
        </div>
      </div>

      {/* Toolbar */}
      <DataManagementToolbar
        onSearch={setSearchQuery}
        onFilterChange={() => {}}
        filterOptions={[]}
        onExport={handleExport as any}
        onImport={() => alert("Feedback import not available.")}
        dataCount={filteredFeedbacks.length}
        itemName="submissions"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Sender Info</th>
                <th className="px-6 py-4">Feedback Content</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFeedbacks.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">{f.user?.name || 'Anonymous'}</span>
                        {f.userId && (
                          <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase rounded border border-blue-500/20">Verified</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 font-medium italic">{f.user?.email}</span>
                      {f.user?.businesses && f.user.businesses.length > 0 && (
                        <div className="flex flex-wrap items-center mt-2 gap-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg w-full max-w-[250px]">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Businesses:</span>
                          <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                            {f.user.businesses.map(b => b.name).join(", ")}
                          </span>
                        </div>
                      )}
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                        {mounted ? new Date(f.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[300px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{f.subject || 'No Subject'}</span>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {f.message}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {renderStars(f.rating)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {getStatusBadge(f.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => { setViewingFeedback(f); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                        title="View Submission"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                        title="Delete Feedback"
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

        {filteredFeedbacks.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">No Feedback Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusted your search or filters.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {isModalOpen && viewingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-all" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shadow-inner">
                    <MessageSquare className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Feedback Detail</h2>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Submission ID: {viewingFeedback.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(viewingFeedback.rating)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sender Info</label>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{viewingFeedback.user?.name || 'Anonymous'}</p>
                  <p className="text-sm text-blue-600 font-medium italic">{viewingFeedback.user?.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date Submitted</label>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {mounted ? new Date(viewingFeedback.createdAt).toLocaleString() : ''}
                  </p>
                </div>
                {viewingFeedback.user?.businesses && viewingFeedback.user.businesses.length > 0 && (
                  <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Associated Businesses</label>
                    <p className="text-lg font-bold text-slate-900 dark:text-white text-emerald-500 leading-tight">
                      {viewingFeedback.user.businesses.map(b => b.name).join(", ")}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Linked Entities: Verified</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2 block">Subject</label>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">{viewingFeedback.subject || 'No Subject'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2 block">Message</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {viewingFeedback.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <label className="text-xs font-bold text-slate-500">Status:</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                    {['pending', 'reviewed', 'resolved'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(viewingFeedback.id, s)}
                        className={cn(
                          "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                          viewingFeedback.status === s
                            ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => handleDelete(viewingFeedback.id)}
                        className="flex-1 md:flex-none px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20"
                    >
                        Delete
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
