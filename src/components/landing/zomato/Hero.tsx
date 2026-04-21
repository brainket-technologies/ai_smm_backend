"use client";

import Link from "next/link";
import { Search, MapPin, ChevronDown, Zap } from "lucide-react";

export function ZomatoHeader({ primaryColor }: { primaryColor: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div 
            style={{ backgroundColor: primaryColor }}
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
          >
            <Zap className="h-5 w-5 text-white fill-current" />
          </div>
          <span className="text-xl font-bold text-slate-950 tracking-tighter italic">SMM AI STUDIO</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-widest text-slate-500">
          <Link href="#features" className="hover:text-slate-950 transition-colors">Digital Studio</Link>
          <Link href="#planner" className="hover:text-slate-950 transition-colors">Planner</Link>
          <Link href="#pricing" className="hover:text-slate-950 transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center space-x-6">
          <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Log In</button>
          <button 
            style={{ backgroundColor: primaryColor }}
            className="px-6 py-2.5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-emerald-500/10"
          >
            Join Free
          </button>
        </div>
      </div>
    </header>
  );
}

export function ZomatoHero({ primaryColor, heroImage }: { primaryColor: string, heroImage: string }) {
  return (
    <section className="relative h-[85vh] flex flex-col items-center justify-center pt-20">
      <div className="absolute inset-0 -z-10">
        <img 
          src={heroImage} 
          className="w-full h-full object-cover"
          alt="Hero Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/50 to-white" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-12 leading-[0.8] tracking-tighter italic uppercase animate-fade-in-up">
          Manage All Your <br />
          <span style={{ color: primaryColor }}>Social Media</span> <br />
          in One Place
        </h1>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row items-center border border-slate-100 animate-fade-in-up animation-delay-300">
          <div className="flex-1 flex items-center px-6 py-4 space-x-3 md:border-r border-slate-100">
             <MapPin style={{ color: primaryColor }} className="h-5 w-5" />
             <input 
               type="text" 
               placeholder="Enter your brand username..."
               className="w-full bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-300"
             />
          </div>
          <div className="flex-1 flex items-center px-6 py-4 space-x-3">
             <Search className="h-5 w-5 text-slate-300" />
             <span className="text-slate-400 font-medium">Generate AI Post Strategy</span>
             <ChevronDown className="h-4 w-4 text-slate-300 ml-auto" />
          </div>
        </div>

        <p className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-fade-in-up animation-delay-600">
            The #1 AI Studio for Agencies & Creators
        </p>
      </div>
    </section>
  );
}
