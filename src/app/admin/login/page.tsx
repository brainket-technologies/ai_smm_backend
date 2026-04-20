"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (data.success) {
        localStorage.setItem("admin_token", data.data.token);
        Cookies.set("admin_token", data.data.token, { expires: 30 }); // 30 days
        window.location.href = "/admin/dashboard";
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      
      {/* Left Column: Brand & Hero */}
      <div className="hidden md:flex md:w-[55%] bg-gradient-to-br from-[#1B2E28] via-[#142822] to-[#0F1F1A] p-16 flex-col justify-between relative overflow-hidden">
        {/* Abstract Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] border-[1px] border-white/20 rounded-full translate-x-1/2 -translate-y-1/2" />
           <div className="absolute top-0 right-0 w-[600px] h-[600px] border-[1px] border-white/20 rounded-full translate-x-1/2 -translate-y-1/2" />
           <div className="absolute top-0 right-0 w-[400px] h-[400px] border-[1px] border-white/20 rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="h-16 w-16 bg-white flex items-center justify-center rounded-2xl mb-12 shadow-2xl">
             <ShieldCheck className="h-10 w-10 text-[#1B2E28]" />
          </div>
          
          <div className="space-y-6 max-w-lg">
            <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
              Hello <br />
              BrandBoost! 👋
            </h1>
            <p className="text-xl text-gray-300 font-medium leading-relaxed opacity-90">
              Control your AI social automation engine. Optimize performance, manage master data, and save tons of time!
            </p>
          </div>
        </div>

        <div className="relative z-10 text-gray-500 text-sm font-medium tracking-wide">
          © {new Date().getFullYear()} BrandBoost AI. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-8 md:p-24 bg-white min-h-screen">
        <div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome Back!</h2>
            <p className="text-gray-500 text-sm">
              Use your credentials to access the Control Center. <br />
              Authorized Super Admins only.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center text-red-600 text-sm animate-in shake-in duration-300">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form 
            onSubmit={handleLogin}
            className="space-y-10"
          >
            <div className="space-y-12">
                {/* Email Field */}
                <div className="relative group bg-gray-50/50 border border-gray-100 focus-within:border-accent focus-within:bg-white rounded-xl transition-all p-4">
                    <label className="absolute -top-7 left-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest transition-all">
                        Admin Email
                    </label>
                    <div className="flex items-center px-0">
                        <Mail className="h-5 w-5 text-gray-400 mr-4 flex-shrink-0" />
                        <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@ai.com"
                            className="w-full bg-transparent text-slate-900 dark:text-white text-base focus:outline-none placeholder:text-slate-400 caret-emerald-500"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="relative group bg-gray-50/50 border border-gray-100 focus-within:border-accent focus-within:bg-white rounded-xl transition-all p-4">
                    <label className="absolute -top-7 left-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest transition-all">
                        Password
                    </label>
                    <div className="flex items-center">
                        <Lock className="h-5 w-5 text-gray-400 mr-4 flex-shrink-0" />
                        <input 
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full bg-transparent text-slate-900 dark:text-white text-base focus:outline-none placeholder:text-slate-400 caret-emerald-500"
                        />
                    </div>
                </div>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gray-950 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center group transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-black/10"
            >
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : (
                <>
                    <span>Login Now</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
                )}
            </button>
          </form>

          <footer className="pt-12 border-t border-gray-50 flex items-center justify-between">
             <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Global Master Admin</span>
             <div className="flex space-x-4">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-accent/60" />
                <div className="h-2 w-2 rounded-full bg-accent/30" />
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
