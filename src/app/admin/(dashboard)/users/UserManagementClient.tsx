"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Trash2, 
  CheckCircle, 
  Eye, 
  Star, 
  Filter, 
  AlertCircle, 
  Search,
  CheckCircle2,
  Clock,
  MoreVertical,
  Mail,
  Phone as PhoneIcon,
  Briefcase,
  ShieldAlert
} from 'lucide-react';
import { toggleUserVerification, deleteUser } from './actions';
import DataManagementToolbar from '@/components/admin/DataManagementToolbar';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type PlatformUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  isVerified: boolean;
  createdAt: string;
  businessCount: number;
  subscription?: {
    name: string;
  } | null;
};

export default function UserManagementClient({ initialUsers }: { initialUsers: PlatformUser[] }) {
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<PlatformUser | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredUsers = users.filter(u =>
    (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (u.phone?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'un-verify' : 'verify'} this user?`)) return;
    const res = await toggleUserVerification(id, currentStatus);
    if (res.success) {
      setUsers(users.map(u => u.id === id ? { ...u, isVerified: !currentStatus } : u));
      if (viewingUser?.id === id) {
        setViewingUser({ ...viewingUser, isVerified: !currentStatus });
      }
    } else {
      alert(res.error || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This will soft-delete the account.")) return;
    const res = await deleteUser(id);
    if (res.success) {
      setUsers(users.filter(u => u.id !== id));
      setIsModalOpen(false);
    } else {
      alert(res.error || "Failed to delete user");
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const data = users.map(u => ({ 
      id: u.id, 
      name: u.name, 
      email: u.email, 
      phone: u.phone,
      verified: u.isVerified,
      businesses: u.businessCount,
      joined: u.createdAt 
    }));
    const fname = `users_${Date.now()}.${format}`;
    const content = format === 'json'
      ? "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2))
      : "data:text/csv;charset=utf-8," + encodeURIComponent(['ID,Name,Email,Phone,Verified,Businesses,Joined', ...data.map(u => `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.verified}","${u.businesses}","${u.joined}"`)].join('\n'));
    
    const el = document.createElement('a');
    el.setAttribute("href", content);
    el.setAttribute("download", fname);
    document.body.appendChild(el);
    el.click();
    el.remove();
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-accent" />
            <span>Platform Users</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">Total platform members with standard User roles.</p>
        </div>
      </div>

      {/* Toolbar */}
      <DataManagementToolbar
        onSearch={setSearchQuery}
        onFilterChange={() => {}}
        filterOptions={[]}
        onExport={handleExport as any}
        onImport={() => alert("User import not implemented.")}
        dataCount={filteredUsers.length}
        itemName="users"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Businesses</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 min-w-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={u.image || `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=2ECC71&color=fff`} 
                          alt="" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">{u.name || 'Anonymous User'}</span>
                        <span className="text-[11px] text-slate-400 mt-1 font-medium italic">{u.email}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                          Joined: {mounted ? new Date(u.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {u.phone || 'Not Provided'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {u.isVerified ? (
                        <span className="flex items-center space-x-1 px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ring-green-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ring-amber-500/20">
                          <Clock className="h-3 w-3" />
                          <span>Unverified</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono tracking-tighter">
                          {u.businessCount}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => { setViewingUser(u); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                        title="Quick View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleVerification(u.id, u.isVerified)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          u.isVerified 
                            ? "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20" 
                            : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                        )}
                        title={u.isVerified ? "Revoke Verification" : "Verify User"}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                        title="Delete User"
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

        {filteredUsers.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-100 dark:ring-slate-800">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">No Users Found</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">No results matches your criteria.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-all" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 rounded-[2rem] bg-accent/10 flex items-center justify-center shadow-inner border-2 border-accent/20 overflow-hidden shrink-0">
                    <img 
                      src={viewingUser.image || `https://ui-avatars.com/api/?name=${viewingUser.name || 'User'}&background=2ECC71&color=fff`} 
                      alt="" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{viewingUser.name || 'Anonymous User'}</h2>
                       {viewingUser.isVerified && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                    </div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Status: {viewingUser.isVerified ? 'Verified' : 'Pending Verification'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className="space-y-6">
                   <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-slate-400 mt-1" />
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Email Address</label>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">{viewingUser.email || 'N/A'}</p>
                      </div>
                   </div>
                   <div className="flex items-start space-x-3">
                      <PhoneIcon className="h-5 w-5 text-slate-400 mt-1" />
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Phone Number</label>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">{viewingUser.phone || 'Not Provided'}</p>
                      </div>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="flex items-start space-x-3">
                      <Briefcase className="h-5 w-5 text-slate-400 mt-1" />
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Associated Businesses</label>
                         <p className="text-sm font-bold text-accent">{viewingUser.businessCount} Entities Linked</p>
                      </div>
                   </div>
                   <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-slate-400 mt-1" />
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Joined Date</label>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">
                           {mounted ? new Date(viewingUser.createdAt).toLocaleString() : ''}
                         </p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex w-full md:w-auto gap-3">
                    <button
                      onClick={() => handleToggleVerification(viewingUser.id, viewingUser.isVerified)}
                      className={cn(
                        "flex-1 md:flex-none px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm border",
                        viewingUser.isVerified 
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700"
                          : "bg-green-500 hover:bg-green-600 text-white border-green-500"
                      )}
                    >
                      {viewingUser.isVerified ? 'Revoke Verification' : 'Verify User'}
                    </button>
                    <button
                      onClick={() => handleDelete(viewingUser.id)}
                      className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all border border-red-200 dark:bg-red-900/20 dark:border-red-900/40"
                    >
                      Delete
                    </button>
                 </div>
                 <button
                   onClick={() => setIsModalOpen(false)}
                   className="w-full md:w-auto px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                 >
                   Close Detail
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
