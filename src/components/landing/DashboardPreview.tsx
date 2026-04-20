"use client";

import { Layout, MessageSquare, BarChart3, Clock, Users } from "lucide-react";

export default function DashboardPreview() {
  return (
    <section className="py-40 bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
            Powerful <span className="text-emerald-500">Dashboard</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium opacity-0 animate-fade-in-up [animation-fill-mode:forwards] animation-delay-200">
            A high-performance command center for your entire digital strategy.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto group opacity-0 animate-fade-in-up [animation-fill-mode:forwards] animation-delay-400">
          <div className="absolute -inset-4 bg-emerald-500/10 blur-[100px] -z-10 group-hover:bg-emerald-500/15 transition-all" />
          <div className="rounded-[40px] border border-white/10 bg-slate-900 shadow-2xl overflow-hidden p-4 md:p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
               <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/40" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
               </div>
               <div className="flex items-center space-x-4">
                  <div className="h-6 w-32 bg-white/5 rounded-full" />
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20" />
               </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
               <div className="hidden lg:flex lg:col-span-1 flex-col items-center space-y-8 pt-4">
                  <Layout className="h-6 w-6 text-emerald-500" />
                  <MessageSquare className="h-6 w-6 text-slate-700" />
                  <BarChart3 className="h-6 w-6 text-slate-700" />
                  <Clock className="h-6 w-6 text-slate-700" />
                  <Users className="h-6 w-6 text-slate-700" />
               </div>

               <div className="col-span-12 lg:col-span-11 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                      <div 
                        key={i}
                        className="h-32 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-2 hover:bg-white/10 transition-colors duration-500"
                      >
                         <div className="text-2xl font-black text-white italic">{(i * 12.4).toFixed(1)}k</div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Metric 0{i}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-64 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 p-8 flex flex-col justify-end hover:scale-[1.02] transition-transform duration-700 group/card">
                       <div className="h-2 w-1/3 bg-emerald-500/50 rounded-full mb-4" />
                       <div className="h-8 w-full bg-white/5 rounded-xl" />
                       <div className="mt-4 flex space-x-2">
                          {[1,2,3,4,5,6].map(i => <div key={i} className="flex-1 h-20 bg-white/5 rounded-t-lg group-hover/card:bg-emerald-500/10 transition-colors" />)}
                       </div>
                    </div>
                    <div className="h-64 rounded-3xl bg-white/5 border border-white/5 p-8 space-y-4 hover:bg-white/10 transition-colors duration-700">
                       <div className="h-4 w-1/2 bg-white/10 rounded-full mb-8" />
                       {[1,2,3,4].map(i => <div key={i} className="h-2 w-full bg-white/5 rounded-full" />)}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
