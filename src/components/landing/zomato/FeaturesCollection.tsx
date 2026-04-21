"use client";

const features = [
  {
    title: "AI Post Studio",
    subtitle: "High-fidelity content creation",
    image: "/landing/ai_post_studio_mockup_1776720450767.png",
    tag: "Creative",
  },
  {
    title: "Smart Planner",
    subtitle: "Precision scheduling engine",
    image: "/landing/smart_planner_mockup_1776720478659.png",
    tag: "Productivity",
  },
  {
    title: "Leaderboard",
    subtitle: "Engagement & metrics vault",
    image: "/landing/engagement_leaderboard_mockup_1776720544366.png",
    tag: "Strategic",
  },
  {
    title: "Team Center",
    subtitle: "Agency collaboration hub",
    image: "/landing/social_scheduling_collection_1776720314906.png",
    tag: "Operational",
  },
];

export default function FeaturesCollection({ primaryColor }: { primaryColor: string }) {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight italic uppercase">
            Product <span style={{ color: primaryColor }}>Collections</span>
          </h2>
          <p className="text-lg text-slate-500 mt-4 font-medium italic">
            Explore the most powerful SMM features in one sleek ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 animate-fade-in-up animation-delay-${(i + 1) * 100}`}
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <div 
                  style={{ backgroundColor: primaryColor }}
                  className="inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3"
                >
                  {feature.tag}
                </div>
                <h3 className="text-2xl font-black italic uppercase leading-none">{feature.title}</h3>
                <p className="text-xs font-medium text-white/70 mt-2">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
