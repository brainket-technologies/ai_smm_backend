import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { 
  Zap, Globe, Cpu, ShieldAlert, 
  ArrowRight, Check, Star, 
  Share2, MessageSquare, Link as LinkIcon, Globe as GlobeIcon,
  Smartphone, BarChart3, Rocket
} from "lucide-react";

export const dynamic = 'force-dynamic';

async function getLandingData() {
  try {
    const config = await prisma.appConfig.findFirst({ where: { id: BigInt(1) } });
    const tiers = await prisma.subscriptionTier.findMany({
      where: { isActive: true },
      orderBy: { priceAmount: 'asc' }
    });
    return { config, tiers };
  } catch (error) {
    console.error("Failed to fetch landing data:", error);
    return { config: null, tiers: [] };
  }
}

export default async function LandingPage() {
  const { config, tiers } = await getLandingData();

  const features = config?.featuresJson ? (config.featuresJson as any[]) : [
    { id: "1", title: "AI Content Studio", description: "Create professional posts in seconds with our state-of-the-art AI generation engine.", icon: "Zap" },
    { id: "2", title: "Multi-Cloud Sync", description: "Manage all your social accounts from one place with unified scheduling and analytics.", icon: "Globe" },
    { id: "3", title: "Smart Scheduling", description: "Optimize your reach with AI-suggested posting times for maximum engagement.", icon: "Clock" },
    { id: "4", title: "Secure & Scalable", description: "Bank-grade security for your data and seamless scaling for growing businesses.", icon: "ShieldAlert" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="h-6 w-6 text-slate-900" fill="currentColor" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase tracking-tighter">
              {config?.appName || "BrandBoost AI"}
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-10 text-sm font-bold uppercase tracking-widest text-slate-400">
            <Link href="#features" className="hover:text-emerald-500 transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing</Link>
            <Link href="/admin/login" className="px-6 py-2.5 bg-white text-slate-950 rounded-full hover:scale-105 active:scale-95 transition-all">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-bounce">
            <Star className="h-3 w-3 fill-current" />
            <span>AI-Powered Social Media Management</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-white">
            {config?.heroTitle || "Elevate Your Social Influence with AI"}
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-12">
            {config?.heroSubtitle || "The ultimate Social Media AI Management suite for businesses. Generate, schedule, and grow your digital presence in seconds."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/admin/login" className="group flex items-center space-x-3 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95">
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                </div>
              ))}
              <span className="ml-6 text-slate-500 text-sm font-bold uppercase tracking-widest pl-4">Join 10k+ Creators</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-y border-white/5 bg-slate-900/20">
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          <Share2 className="h-8 w-8" />
          <MessageSquare className="h-8 w-8" />
          <LinkIcon className="h-8 w-8" />
          <GlobeIcon className="h-8 w-8" />
          <Smartphone className="h-8 w-8" />
          <Rocket className="h-8 w-8" />
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Everything you need to scale</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium">Empower your brand with AI-driven tools designed for creators and businesses who want to dominate the digital landscape.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature: any) => (
              <div key={feature.id} className="group p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {feature.icon === "Zap" && <Zap className="h-7 w-7 text-emerald-500" />}
                  {feature.icon === "Globe" && <Globe className="h-7 w-7 text-emerald-500" />}
                  {feature.icon === "Cpu" && <Cpu className="h-7 w-7 text-emerald-500" />}
                  {feature.icon === "ShieldAlert" && <ShieldAlert className="h-7 w-7 text-emerald-500" />}
                  {!["Zap", "Globe", "Cpu", "ShieldAlert"].includes(feature.icon) && <Rocket className="h-7 w-7 text-emerald-500" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">
              {config?.pricingTitle || "Simple, Transparent Pricing"}
            </h2>
            <p className="text-slate-500 font-medium">Choose the plan that's right for your growth journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.length > 0 ? tiers.map((tier: any) => (
              <div key={tier.id.toString()} className={`relative p-10 rounded-3xl border transition-all hover:scale-[1.02] ${tier.tierKey === 'PRO' ? 'bg-emerald-500 border-white/10 text-slate-950 scale-105' : 'bg-slate-950 border-white/5 text-white'}`}>
                {tier.tierKey === 'PRO' && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1.5 bg-white text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Best Value</div>
                )}
                <h3 className="text-2xl font-black mb-2 uppercase italic">{tier.name}</h3>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-black">${Number(tier.priceAmount)}</span>
                  <span className={`ml-2 text-sm font-bold uppercase ${tier.tierKey === 'PRO' ? 'text-slate-900/60' : 'text-slate-500'}`}>/{tier.pricePeriod === 'month' ? 'MO' : 'YR'}</span>
                </div>
                
                <ul className="space-y-4 mb-12">
                  {(tier.highlightFeatures as string[] || []).slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3 text-sm font-bold">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${tier.tierKey === 'PRO' ? 'bg-slate-900 border-emerald-400' : 'bg-emerald-500/20'}`}>
                        <Check className={`h-3 w-3 ${tier.tierKey === 'PRO' ? 'text-emerald-500' : 'text-emerald-500'}`} strokeWidth={4} />
                      </div>
                      <span className={tier.tierKey === 'PRO' ? 'text-slate-900' : 'text-slate-300'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/admin/login" className={`block w-full py-4 rounded-2xl text-center font-black uppercase tracking-widest text-xs transition-all ${tier.tierKey === 'PRO' ? 'bg-slate-950 text-white hover:bg-slate-900 shadow-xl shadow-slate-950/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}>
                  Join {tier.name}
                </Link>
              </div>
            )) : (
                <div className="col-span-full text-center text-slate-500 uppercase tracking-widest font-black py-20 border-2 border-dashed border-white/5 rounded-3xl">Tiers loading...</div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-slate-950" fill="currentColor" />
              </div>
              <span className="text-lg font-black text-white hover:text-emerald-500 transition-colors uppercase tracking-tight">{config?.appName || "BrandBoost AI"}</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs font-medium leading-relaxed">Dominate the social media game with AI. Everything you need to scale your brand influence in one place.</p>
          </div>
          
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-8">Navigation</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><Link href="#features" className="hover:text-emerald-500 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-500 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-8">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><Link href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-emerald-500 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-white/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">© 2026 {config?.appName || "BrandBoost AI"}. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
