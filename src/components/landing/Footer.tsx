"use client";

import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SocialIcons } from "./Icons";

export function CTA() {
  return (
    <section className="py-40 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-emerald-500/5 blur-[150px] -z-10" />
      <div className="max-w-5xl mx-auto px-6">
        <div className="p-16 md:p-24 rounded-[60px] bg-white text-slate-950 text-center relative overflow-hidden opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
          <div className="absolute top-0 right-0 p-20 opacity-5 -z-10"><Zap className="h-64 w-64" fill="currentColor" /></div>
          
          <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter uppercase italic leading-[0.85]">
            Start Growing Your <span className="text-emerald-500">Social Media</span> Today
          </h2>
          
          <p className="text-xl font-medium mb-16 max-w-2xl mx-auto opacity-70">
            Join 5,000+ brands using BrandBoost AI to automate their growth. No credit card required.
          </p>

          <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
             <input 
               type="email" 
               placeholder="Enter your email" 
               className="flex-1 px-8 py-5 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
             />
             <button className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 hover:scale-105 active:scale-95 transition-all">
               <span>Get Started</span>
               <ArrowRight className="h-4 w-4" />
             </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-32 bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
          <div className="col-span-1 md:col-span-2 space-y-8 text-center md:text-left opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <Zap className="h-8 w-8 text-emerald-500" fill="currentColor" />
              <span className="text-2xl font-black text-white italic tracking-tighter uppercase">BrandBoost AI</span>
            </div>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
              The world's most advanced AI social media ecosystem. Engineered for elite digital brands.
            </p>
          </div>

          <div className="text-center md:text-left opacity-0 animate-fade-in-up [animation-fill-mode:forwards] animation-delay-200">
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-10 italic">Platform</h4>
            <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <li><Link href="#features" className="hover:text-emerald-500 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing</Link></li>
              <li><Link href="#how-it-works" className="hover:text-emerald-500 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-left opacity-0 animate-fade-in-up [animation-fill-mode:forwards] animation-delay-400">
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-10 italic">Company</h4>
            <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <li><Link href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-emerald-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-10 opacity-0 animate-fade-in-up [animation-fill-mode:forwards] animation-delay-600">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-800">
            © 2026 BrandBoost AI. All Rights Reserved.
          </p>
          
          <div className="flex items-center space-x-10 text-slate-700">
            <FooterSocialLink href="#"><SocialIcons.Instagram /></FooterSocialLink>
            <FooterSocialLink href="#"><SocialIcons.Facebook /></FooterSocialLink>
            <FooterSocialLink href="#"><SocialIcons.LinkedIn /></FooterSocialLink>
            <FooterSocialLink href="#"><SocialIcons.X /></FooterSocialLink>
            <FooterSocialLink href="#"><SocialIcons.YouTube /></FooterSocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSocialLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a 
      href={href} 
      className="w-6 h-6 transition-all hover:scale-125 hover:text-emerald-500 block"
    >
      {children}
    </a>
  );
}
