"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Navbar({ primaryColor }: { primaryColor: string }) {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 px-8 h-18 flex items-center justify-between border border-slate-200/50 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl transition-all duration-700 animate-fade-in-up">
      <div className="flex items-center space-x-3 cursor-pointer group">
        <div 
          style={{ backgroundColor: primaryColor }}
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
        >
          <Zap className="h-6 w-6 text-white" fill="currentColor" />
        </div>
        <span className="text-xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap italic">
          BrandBoost AI
        </span>
      </div>
      
      <div className="hidden lg:flex items-center space-x-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        <NavLink href="#features" primaryColor={primaryColor}>Features</NavLink>
        <NavLink href="#how-it-works" primaryColor={primaryColor}>How It Works</NavLink>
        <NavLink href="#pricing" primaryColor={primaryColor}>Pricing</NavLink>
        <NavLink href="#testimonials" primaryColor={primaryColor}>Reviews</NavLink>
      </div>

      <div className="hover:scale-105 active:scale-95 transition-transform">
        <Link 
          href="#download" 
          style={{ backgroundColor: primaryColor }}
          className="px-6 py-2.5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl"
        >
          Get App
        </Link>
      </div>
    </nav>
  );
}

function NavLink({ href, children, primaryColor }: { href: string; children: React.ReactNode, primaryColor: string }) {
  return (
    <Link href={href} className="hover:text-slate-900 transition-colors relative group">
      {children}
      <span 
        style={{ backgroundColor: primaryColor }}
        className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" 
      />
    </Link>
  );
}
