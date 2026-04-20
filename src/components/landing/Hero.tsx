"use client";

import { SocialIcons } from "./Icons";
import { ArrowRight, Play } from "lucide-react";

export default function Hero({ primaryColor, config }: { primaryColor: string, config: any }) {
  const floatingIcons = [
    { icon: <SocialIcons.Instagram />, delay: "0s", left: "15%", top: "25%" },
    { icon: <SocialIcons.Facebook />, delay: "0.5s", left: "80%", top: "20%" },
    { icon: <SocialIcons.LinkedIn />, delay: "1s", left: "10%", top: "70%" },
    { icon: <SocialIcons.X />, delay: "1.5s", left: "85%", top: "75%" },
    { icon: <SocialIcons.YouTube />, delay: "2s", left: "50%", top: "15%" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 overflow-hidden bg-white">
      <div 
        style={{ backgroundImage: `radial-gradient(circle at center, ${primaryColor}15, transparent, transparent)` }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] -z-10 opacity-50" 
      />
      
      {floatingIcons.map((item, i) => (
        <div
          key={i}
          style={{ 
            left: item.left, 
            top: item.top,
            animationDelay: item.delay,
            color: primaryColor,
          }}
          className="absolute w-12 h-12 hidden lg:block animate-float opacity-20 hover:opacity-100 transition-opacity duration-1000"
        >
          {item.icon}
        </div>
      ))}

      <div className="max-w-5xl mx-auto px-6 text-center z-10 animate-fade-in-up">
        <div 
          style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20`, color: primaryColor }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-sm"
        >
          <span>Social Media Management AI</span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black mb-10 leading-[0.85] tracking-tighter text-slate-900 italic uppercase">
          {config?.heroTitle || "Manage All Your"} <br className="hidden md:block" />
          <span style={{ color: primaryColor }} className="underline decoration-slate-200">Social Media</span> {config?.heroTitle ? "" : "in One Place"}
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-16">
          {config?.heroSubtitle || "Automate your content creation, schedule across all platforms, and track performance with real-time AI-driven analytics."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            style={{ backgroundColor: primaryColor }}
            className="group flex items-center space-x-4 px-10 py-5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 hover:brightness-110 active:scale-95 shadow-2xl shadow-emerald-500/20"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </button>

          <button className="flex items-center space-x-3 px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 shadow-sm">
            <Play style={{ color: primaryColor }} className="h-4 w-4 fill-current" />
            <span>View Demo</span>
          </button>
        </div>
      </div>

      <div className="mt-28 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent animate-fade-in-up animation-delay-600" />
    </section>
  );
}
