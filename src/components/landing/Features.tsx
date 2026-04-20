"use client";

import { Zap, Globe, BarChart3, Cpu } from "lucide-react";

const features = [
  {
    title: "Auto Posting",
    description: "Schedule your content once and let our AI handle the rest. Automatic publishing across all channels.",
    icon: <Zap className="h-8 w-8" />,
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    title: "Multi Account Management",
    description: "Manage dozens of social profiles from a single unified dashboard without constant switching.",
    icon: <Globe className="h-8 w-8" />,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Analytics Dashboard",
    description: "Real-time insights into your engagement, reach, and follower growth with advanced data viz.",
    icon: <BarChart3 className="h-8 w-8" />,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "AI Content Generator",
    description: "Generate high-quality posts, captions, and hashtag suggestions tailored to your brand voice.",
    icon: <Cpu className="h-8 w-8" />,
    color: "bg-purple-500/10 text-purple-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-40 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
            Powering Your <span className="text-emerald-500">Growth</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium opacity-0 animate-fade-in-up [animation-fill-mode:forwards] animation-delay-200">
            Built for creators and enterprises who need robust tools to maintain an elite social presence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-10 rounded-[32px] bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up [animation-fill-mode:forwards]"
              style={{ animationDelay: `${(i + 3) * 100}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight italic">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
