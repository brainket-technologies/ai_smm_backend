"use client";

import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Agency Founder",
    text: "BrandBoost AI completely automated my Instagram workflow. Post quality is insane! 🚀",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
  {
    name: "Elena Kovacs",
    role: "Social Media Manager",
    text: "The first AI tool that actually understands my brand's voice. A total game changer.",
    avatar: "https://i.pravatar.cc/100?img=22",
  },
  {
    name: "Jordan Smith",
    role: "Creator",
    text: "From idea to scheduled post in under 2 minutes. My engagement is up 400%.",
    avatar: "https://i.pravatar.cc/100?img=33",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-40 bg-slate-900/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
            User <span className="text-emerald-500">Intel</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-10 rounded-[40px] bg-slate-950 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up [animation-fill-mode:forwards]"
              style={{ animationDelay: `${(i + 2) * 200}ms` }}
            >
              <Quote className="absolute top-8 right-10 h-12 w-12 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors" />
              
              <div className="flex items-center space-x-4 mb-8">
                <img src={t.avatar} className="w-14 h-14 rounded-full border-2 border-emerald-500 grayscale group-hover:grayscale-0 transition-all duration-700" alt={t.name} />
                <div>
                  <div className="font-black text-white text-base tracking-tight uppercase italic">{t.name}</div>
                  <div className="text-slate-500 text-[10px] font-black tracking-widest uppercase">{t.role}</div>
                </div>
              </div>

              <p className="text-slate-300 font-medium leading-relaxed italic mb-8">"{t.text}"</p>
              
              <div className="flex space-x-1">
                {[1,2,3,4,5].map(star => <Star key={star} className="h-4 w-4 text-amber-500 fill-current" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
