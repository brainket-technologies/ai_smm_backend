"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 px-8 h-18 flex items-center justify-between border border-white/5 bg-slate-950/40 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/80 transition-all duration-700 animate-fade-in-up">
      <div className="flex items-center space-x-3 cursor-pointer group">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          <Zap className="h-6 w-6 text-slate-900" fill="currentColor" />
        </div>
        <span className="text-xl font-black text-white tracking-tighter uppercase whitespace-nowrap italic">
          BrandBoost AI
        </span>
      </div>
      
      <div className="hidden lg:flex items-center space-x-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
        <NavLink href="#features">Features</NavLink>
        <NavLink href="#how-it-works">How It Works</NavLink>
        <NavLink href="#pricing">Pricing</NavLink>
        <NavLink href="#testimonials">Reviews</NavLink>
      </div>

      <div className="hover:scale-105 active:scale-95 transition-transform">
        <Link href="#download" className="px-6 py-2.5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-xl shadow-white/5">
          Get App
        </Link>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-white transition-colors relative group">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300" />
    </Link>
  );
}
