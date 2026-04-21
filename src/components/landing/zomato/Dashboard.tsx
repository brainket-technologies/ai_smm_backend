"use client";

import { UserPlus, Calendar, BarChart2, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

export function ZomatoHowItWorks({ primaryColor }: { primaryColor: string }) {
  const steps = [
    { title: "Connect", desc: "Link all platforms in one click", icon: <UserPlus /> },
    { title: "Compose", desc: "AI generates your best content", icon: <Calendar /> },
    { title: "Control", desc: "Automate delivery and analytics", icon: <BarChart2 /> },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-16 tracking-tighter italic uppercase text-center animate-fade-in-up">
          Elite <span style={{ color: primaryColor }}>Workflow</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div 
              key={i}
              className={`flex flex-col items-center text-center group animate-fade-in-up animation-delay-${(i + 1) * 200}`}
            >
              <div 
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-8 border border-slate-200 group-hover:scale-110 transition-transform duration-500"
              >
                {step.icon}
              </div>
              <h3 className="text-xl font-black italic uppercase text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-500 font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ZomatoDashboardPreview({ primaryColor }: { primaryColor: string }) {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl p-8 md:p-16 relative animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase">
                The <span style={{ color: primaryColor }}>Studio</span> <br />
                Control Wall
              </h2>
              <p className="text-lg text-slate-500 font-medium italic">
                Manage posts, teams, and chatbots from a single high-fidelity interface.
              </p>
              <div className="space-y-4">
                {["Live AI Chatbot Support", "Agency Team Roles", "Global Engagement Metrics"].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 text-sm font-black uppercase text-slate-700">
                    <CheckCircle2 style={{ color: primaryColor }} className="h-5 w-5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full hover-lift">
              <div className="bg-slate-50 rounded-3xl border border-slate-200 aspect-video shadow-lg p-4">
                 <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                 </div>
                 <div className="space-y-4">
                    <div className="h-8 w-1/2 bg-white rounded-lg animate-pulse" />
                    <div className="grid grid-cols-3 gap-4">
                       <div className="h-20 bg-white rounded-xl" />
                       <div className="h-20 bg-white rounded-xl" />
                       <div className="h-20 bg-white rounded-xl" />
                    </div>
                    <div className="h-32 bg-white rounded-xl" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ZomatoCTA({ primaryColor }: { primaryColor: string }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div 
          style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}20` }}
          className="rounded-[60px] p-12 md:p-24 border text-center relative overflow-hidden animate-fade-in-up"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30">
            <Zap style={{ color: primaryColor }} className="w-full h-full p-40" fill="currentColor" />
          </div>
          
          <h2 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic leading-[0.85]">
            Scale Your <span style={{ color: primaryColor }}>Influence</span> Now
          </h2>
          <p className="text-lg text-slate-500 font-medium italic mb-12 max-w-xl mx-auto">
            The elite AI studio for serious content creators and digital agencies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="name@agency.com"
              className="w-full px-8 py-5 rounded-2xl bg-white border border-slate-200 focus:border-slate-900 outline-none font-bold text-slate-900"
            />
            <button 
              style={{ backgroundColor: primaryColor }}
              className="w-full sm:w-auto px-10 py-5 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:brightness-110 transition-all"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ZomatoFooter({ primaryColor }: { primaryColor: string }) {
  return (
    <footer className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
          <div className="flex items-center space-x-2">
            <div 
              style={{ backgroundColor: primaryColor }}
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
            >
              <Zap className="h-4 w-4 text-white fill-current" />
            </div>
            <span className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">SMM AI STUDIO</span>
          </div>

          <div className="flex items-center space-x-8 text-slate-300">
            <FooterLink href="#">Instagram</FooterLink>
            <FooterLink href="#">Facebook</FooterLink>
            <FooterLink href="#">LinkedIn</FooterLink>
            <FooterLink href="#">X.com</FooterLink>
            <FooterLink href="#">YouTube</FooterLink>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 uppercase text-[10px] font-black tracking-widest text-slate-400">
          <p>© 2026 SMM AI Studio. Built for Growth.</p>
          <div className="flex items-center space-x-8">
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors">
      {children}
    </Link>
  );
}
