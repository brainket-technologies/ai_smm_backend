"use client";

import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Users, 
  User, 
  Image as ImageIcon, 
  Hash,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  MoreVertical,
  Plus
} from "lucide-react";
import { toast } from "react-hot-toast";
import DataManagementToolbar from '@/components/admin/DataManagementToolbar';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    imageUrl: '',
    target: 'all', // 'all' or 'user'
    userId: '',
    channelId: 'smm_post_alerts',
    sound: '',
  });

  React.useEffect(() => {
    fetchUsers();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        headers: { 'apikey': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '' }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'apikey': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '' }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const channels = [
    { id: 'smm_post_alerts', name: 'Post Alerts' },
    { id: 'smm_billing', name: 'Billing' },
    { id: 'smm_marketing', name: 'Marketing' },
    { id: 'smm_engagement', name: 'Engagement' },
    { id: 'smm_reviews', name: 'Reviews' },
    { id: 'smm_festivals', name: 'Festivals' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast.error("Title and Body are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Notification sent successfully!");
        setFormData({ ...formData, title: '', body: '', imageUrl: '', userId: '', sound: '' });
        fetchHistory();
        setShowForm(false);
      } else {
        toast.error(result.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Push Notifications</h1>
          <p className="text-sm text-slate-500 font-medium">Broadcast alerts and targeted messages to your users.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-accent/20"
        >
          <Plus className="h-4 w-4" />
          <span>{showForm ? 'Cancel' : 'Send New'}</span>
        </button>
      </div>

      {/* Send Form Section */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2.5 bg-accent/10 rounded-xl border border-accent/20">
              <Send className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compose Notification</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Recipient Target</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, target: 'all' })}
                      className={cn(
                        "flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all",
                        formData.target === 'all' 
                          ? "bg-white dark:bg-slate-700 text-accent shadow-sm ring-1 ring-slate-200 dark:ring-slate-600" 
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      <Users className="h-3.5 w-3.5 mr-2" />
                      All Users
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, target: 'user' })}
                      className={cn(
                        "flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all",
                        formData.target === 'user' 
                          ? "bg-white dark:bg-slate-700 text-accent shadow-sm ring-1 ring-slate-200 dark:ring-slate-600" 
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      <User className="h-3.5 w-3.5 mr-2" />
                      Specific User
                    </button>
                  </div>
                </div>

                {formData.target === 'user' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Select User</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-accent transition-colors" />
                      <select
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
                      >
                        <option value="">-- Select Recipient --</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name || 'No Name'} ({u.email || u.phone})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Notification Category</label>
                  <select
                    value={formData.channelId}
                    onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
                  >
                    {channels.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Sound Alert (Optional)</label>
                  <div className="relative group">
                    <Bell className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-accent transition-colors" />
                    <input
                      type="text"
                      placeholder="e.g. fast_alert (res/raw resource name)"
                      value={formData.sound}
                      onChange={(e) => setFormData({ ...formData, sound: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Content Details</label>
                  <input
                    type="text"
                    placeholder="Enter catchy title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all mb-4"
                  />
                  <textarea
                    placeholder="Enter detailed message..."
                    rows={5}
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Image Media URL (Optional)</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-accent transition-colors" />
                    <input
                      type="text"
                      placeholder="https://example.com/promo.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-accent/20 mt-6"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Broadcast Notification
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Toolbar */}
      <DataManagementToolbar
        onSearch={setSearchQuery}
        onFilterChange={() => {}}
        filterOptions={[]}
        onExport={() => {}}
        onImport={() => {}}
        dataCount={filteredHistory.length}
        itemName="notifications"
      />

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Status & Category</th>
                <th className="px-6 py-4">Notification Content</th>
                <th className="px-6 py-4 text-center">Targeting</th>
                <th className="px-6 py-4 text-right">Sent Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-wider w-fit">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Delivered</span>
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.title}</span>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
                        {item.message}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        item.isGlobal 
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20" 
                          : "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20"
                      )}>
                        {item.isGlobal ? 'Global Broadcast' : 'Direct User'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">No Logs Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try broadcasting your first notification above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
