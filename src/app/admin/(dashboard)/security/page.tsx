"use client";

import { useState } from "react";
import { 
  Shield, 
  Lock, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

export default function SecurityPage() {
  const { admin, loading: adminLoading } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setError("Passwords do not match or are empty");
      return;
    }

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const token = localStorage.getItem("admin_token");
      const resp = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          password: newPassword
        })
      });

      const data = await resp.json();

      if (data.success) {
        setSuccess("Security credentials updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
      } else {
        setError(data.message || "Failed to update security credentials");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-gray-950 dark:text-white">Change Password</h1>
          <p className="text-gray-500 font-medium">Protect your administrative account with strong credentials.</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
          <Shield className="h-3 w-3" />
          <span>Security Guard Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        
        {/* Security Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Notifications */}
          {success && (
            <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center text-green-600 text-sm animate-in slide-in-from-top-4 duration-500">
              <CheckCircle2 className="h-4 w-4 mr-3" />
              <span className="font-bold">{success}</span>
            </div>
          )}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center text-red-600 text-sm animate-in shake-in duration-300">
              <AlertCircle className="h-4 w-4 mr-3" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="bg-[var(--card-background)] rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
            <div className="flex items-center space-x-4">
               <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-lg"><KeyRound className="h-5 w-5" /></div>
               <h2 className="text-xl font-bold">Authentication Credentials</h2>
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-2xl">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-12 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2" />

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Secure Password</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                  <input 
                    type={showNew ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-12 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="Min. 8 characters with symbols"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 space-y-3">
               <h4 className="text-sm font-bold flex items-center text-blue-700 dark:text-blue-400">
                 <AlertCircle className="h-4 w-4 mr-2" /> 
                 Password Requirements
               </h4>
               <ul className="text-xs text-blue-600/70 dark:text-blue-400/60 list-disc list-inside space-y-1 ml-1">
                 <li>Minimum 8 characters long</li>
                 <li>At least one capital letter</li>
                 <li>At least one special character (@, #, $, etc.)</li>
                 <li>Must not be used in the last 3 changes</li>
               </ul>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
             <button 
              type="button" 
              className="px-8 h-14 rounded-2xl text-sm font-bold text-gray-500 hover:bg-slate-100 transition-colors"
              onClick={() => {
                setNewPassword("");
                setConfirmPassword("");
                setCurrentPassword("");
              }}
             >
               Reset Form
             </button>
             <button 
              type="submit"
              disabled={loading}
              className="px-10 h-14 bg-gray-950 hover:bg-black text-white rounded-2xl font-bold flex items-center shadow-xl shadow-black/10 transition-all active:scale-[0.98] disabled:opacity-50"
             >
               {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2 text-accent" />}
               <span>Update Password</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
