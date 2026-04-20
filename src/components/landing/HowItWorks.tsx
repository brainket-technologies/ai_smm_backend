"use client";

import { UserPlus, Calendar, BarChart2 } from "lucide-react";

const steps = [
  {
    title: "Connect Accounts",
    description: "Securely link your social media profiles from Instagram, Facebook, LinkedIn, X, and YouTube in one click.",
    icon: <UserPlus className="h-10 w-10" />,
    step: "01",
  },
  {
    title: "Schedule Content",
    description: "Use our AI Studio to generate and schedule your posts. Our smart algorithm finds the perfect time to post.",
    icon: <Calendar className="h-10 w-10" />,
    step: "02",
  },
  {
    title: "Track Performance",
    description: "Monitor your KPIs with real-time data and actionable insights that help you optimize your digital strategy.",
    icon: <BarChart2 className="h-10 w-10" />,
    step: "03",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-40 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-32">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
            How it <span className="text-emerald-500">Works</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative p-12 rounded-[40px] bg-slate-950 border border-white/5 flex flex-col items-center text-center group hover:border-emerald-500/20 transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up [animation-fill-mode:forwards]"
              style={{ animationDelay: `${(i + 2) * 150}ms` }}
            >
              <div className="absolute top-8 right-10 text-4xl font-black text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors italic">
                {step.step}
              </div>
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-10 text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                {step.icon}
              </div>
              <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight italic">{step.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
