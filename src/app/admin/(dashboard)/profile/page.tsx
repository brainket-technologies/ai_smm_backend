"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  MessageSquare,
  Upload
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { admin, loading: adminLoading, refreshAdmin } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      setName(admin.name || "");
      setEmail(admin.email || "");
      setPhone(admin.phone || "");
      setBio(""); // Bio field might need fetching if added to AdminProfile type
      setImagePreview(admin.image || null);
    }
  }, [admin]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
        setError("Image size must be less than 2MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          name,
          email,
          phone,
          bio,
          image: image || undefined
        })
      });

      const data = await resp.json();

      if (data.success) {
        setSuccess("Profile updated successfully!");
        refreshAdmin();
      } else {
        setError(data.message || "Failed to update profile");
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
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-gray-950 dark:text-white">Account Settings</h1>
          <p className="text-gray-500 font-medium">Manage your professional identity and security.</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
          <Shield className="h-3 w-3" />
          <span>Root Administrator</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[var(--card-background)] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-black/5 flex flex-col items-center text-center relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-accent/20 to-transparent opacity-50" />
            
            <div className="relative mt-4">
               <div className="h-32 w-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border-4 border-white dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-500">
                  <img 
                    src={imagePreview || `https://ui-avatars.com/api/?name=${name || 'Admin'}&background=2ECC71&color=fff&size=200`} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
               </div>
               <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
               />
               <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 h-10 w-10 bg-gray-950 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-xl border-2 border-white dark:border-slate-800"
               >
                  <Camera className="h-4 w-4" />
               </button>
            </div>

            <div className="mt-8 space-y-2">
              <h2 className="text-2xl font-bold">{name || "Administrator"}</h2>
              <p className="text-sm font-medium text-gray-400">{email}</p>
            </div>

            <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 my-8" />

            <div className="w-full space-y-4">
               <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-widest">Account Status</span>
                  <span className="text-accent font-bold">VERIFIED</span>
               </div>
               <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-widest">Last Login</span>
                  <span className="text-gray-900 dark:text-gray-300 font-bold">Today, 10:45 AM</span>
               </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-4">
                <Lock className="h-8 w-8 text-accent" />
                <h3 className="text-xl font-bold">Privacy Control</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Your account data is encrypted using industry-standard protocols. Change your password frequently to maintain high security.</p>
             </div>
             <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-accent/10 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          
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

            {/* General Info Section */}
            <div className="bg-[var(--card-background)] rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
              <div className="flex items-center space-x-4">
                 <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">01</div>
                 <h2 className="text-xl font-bold">General Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                      placeholder="Admin Name"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                      placeholder="admin@brandboost.ai"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Professional Bio</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-5 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full h-32 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 pt-4 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                      placeholder="Describe your role and responsibilities..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
               <button 
                type="button" 
                className="px-8 h-14 rounded-2xl text-sm font-bold text-gray-500 hover:bg-slate-100 transition-colors"
               >
                 Cancel Changes
               </button>
               <button 
                type="submit"
                disabled={loading}
                className="px-10 h-14 bg-gray-950 hover:bg-black text-white rounded-2xl font-bold flex items-center shadow-xl shadow-black/10 transition-all active:scale-[0.98] disabled:opacity-50"
               >
                 {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2 text-accent" />}
                 <span>Update My Identity</span>
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
