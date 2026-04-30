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
  CheckCircle2
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
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
          'apikey': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '' // Ensure this is set or passed via auth
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Notification sent successfully!");
        setFormData({ ...formData, title: '', body: '', imageUrl: '', userId: '', sound: '' });
        fetchHistory();
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

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20">
          <Bell className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Push Notifications</h1>
          <p className="text-gray-500 text-sm font-medium">Broadcast alerts and targeted messages to your users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-[#0D1512] border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="space-y-4">
              {/* Target Selection */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Recipients</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, target: 'all' })}
                    className={`flex items-center justify-center p-4 rounded-2xl border transition-all ${
                      formData.target === 'all' 
                        ? 'bg-accent/10 border-accent text-white font-bold' 
                        : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    All Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, target: 'user' })}
                    className={`flex items-center justify-center p-4 rounded-2xl border transition-all ${
                      formData.target === 'user' 
                        ? 'bg-accent/10 border-accent text-white font-bold' 
                        : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Specific User
                  </button>
                </div>
              </div>

              {formData.target === 'user' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Select User</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <select
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
                    >
                      <option value="" className="bg-[#0D1512]">-- Select a user --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id} className="bg-[#0D1512]">
                          {u.name || 'No Name'} ({u.email || u.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Channel Selection */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Notification Category</label>
                <select
                  value={formData.channelId}
                  onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
                >
                  {channels.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#0D1512]">{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Sound Name */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Custom Sound (Optional)</label>
                <div className="relative">
                  <Bell className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input
                    type="text"
                    placeholder="e.g. notification_sound (without extension)"
                    value={formData.sound}
                    onChange={(e) => setFormData({ ...formData, sound: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
              </div>

              {/* Title & Body */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Content</label>
                <input
                  type="text"
                  placeholder="Notification Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all mb-4"
                />
                <textarea
                  placeholder="Message body..."
                  rows={4}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Image URL (Optional)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-black py-5 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-accent/20"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send Notification
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info / Preview Section */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
              Guidelines
            </h3>
            <ul className="space-y-3 text-xs text-gray-500 font-medium">
              <li className="flex items-start">
                <div className="h-1 w-1 rounded-full bg-gray-700 mt-1.5 mr-2" />
                Broadcast messages reach all active app users instantly.
              </li>
              <li className="flex items-start">
                <div className="h-1 w-1 rounded-full bg-gray-700 mt-1.5 mr-2" />
                Include images for 2x higher engagement rates.
              </li>
              <li className="flex items-start">
                <div className="h-1 w-1 rounded-full bg-gray-700 mt-1.5 mr-2" />
                Specify correct channels to avoid user irritation.
              </li>
            </ul>
          </div>

          <div className="bg-accent/5 border border-accent/10 rounded-3xl p-6">
             <h3 className="text-sm font-bold text-accent mb-4 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Live Status
            </h3>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-gray-500">Service Status</span>
              <span className="text-emerald-500 flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-2" />
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="mt-12">
        <div className="flex items-center space-x-3 mb-6">
          <Hash className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        </div>

        <div className="bg-[#0D1512] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Title</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Target</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-600 font-medium">
                      No notifications sent yet.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm font-bold text-white group-hover:text-accent transition-colors">
                        {item.title}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black uppercase text-accent tracking-wider">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.isGlobal ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                        }`}>
                          {item.isGlobal ? 'Broadcast' : 'Direct'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-400 max-w-xs truncate">
                        {item.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
