import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Zap, Globe, Cpu, ShieldAlert, 
  ArrowRight, Check, Star, 
  Share2, MessageSquare, Link as LinkIcon, Globe as GlobeIcon,
  Smartphone, BarChart3, Rocket, Layout,
  ChevronRight, Quote, Apple, Play
} from "lucide-react";

export const dynamic = 'force-dynamic';

async function getLandingData() {
  try {
    const config = await prisma.appConfig.findFirst({ where: { id: BigInt(1) } });
    const tiers = await prisma.subscriptionTier.findMany({
      where: { isActive: true },
      orderBy: { priceAmount: 'asc' }
    });
    const staticPages = await prisma.staticPage.findMany({
      where: { isActive: true }
    });
    const platforms = await prisma.appPlatformConfig.findMany();
    
    return { 
      config, 
      tiers, 
      staticPages, 
      iosUrl: platforms.find(p => p.platform === 'ios')?.storeUrl || "#",
      androidUrl: platforms.find(p => p.platform === 'android')?.storeUrl || "#"
    };
  } catch (error) {
    console.error("Failed to fetch landing data:", error);
    return { config: null, tiers: [], staticPages: [], iosUrl: "#", androidUrl: "#" };
  }
}

// Branded Social Icons as Inline SVGs
const SocialIcons = {
  Instagram: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  Meta: () => (
    <svg className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg className="h-6 w-6 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  ),
  X: () => (
    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
};

export default async function LandingPage() {
  const { config, tiers, staticPages, iosUrl, androidUrl } = await getLandingData();

  const features = config?.featuresJson ? (config.featuresJson as any[]) : [
    { id: "1", title: "AI Content Engine", description: "Generate localized, high-impact posts for Instagram, Facebook, and LinkedIn in seconds.", icon: "Zap" },
    { id: "2", title: "Global Scheduling", description: "One-click publishing across multiple platforms with AI-optimized timing.", icon: "Globe" },
    { id: "3", title: "Business Intelligence", description: "Get deep insights into your audience, product performance, and social growth.", icon: "Cpu" },
    { id: "4", title: "Social Wall", description: "Consolidate your entire social media stack into one high-performance workflow.", icon: "Share2" }
  ];

  const testimonials = [
    { id: "1", name: "Sarah Chen", role: "Digital Agency Owner", text: "BrandBoost AI reduced my content creation time by 80%. It's like having a full-time social team.", avatar: "https://i.pravatar.cc/150?img=32" },
    { id: "2", name: "David Miller", role: "E-commerce Manager", text: "The integration with our product catalog is seamless. AI generation works like magic for our ads.", avatar: "https://i.pravatar.cc/150?img=12" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-sans tracking-tight">
      {/* Floating Navbar - Focused on Branding & App */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 px-8 h-18 flex items-center justify-between border border-white/5 bg-slate-950/40 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/80">
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <Zap className="h-6 w-6 text-slate-900" fill="currentColor" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase whitespace-nowrap italic">
            {config?.appName || "BrandBoost AI"}
          </span>
        </div>
        
        <div className="hidden lg:flex items-center space-x-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          <Link href="#features" className="hover:text-white transition-colors">Platform</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#download" className="hover:text-white transition-colors">Download App</Link>
        </div>

        <div className="flex items-center space-x-4">
           {/* Removed Dashboard/Login button as per user request */}
           <div className="h-8 w-px bg-white/5 hidden md:block" />
           <div className="flex items-center space-x-4 opacity-50">
               <Apple className="h-4 w-4" />
               <Play className="h-4 w-4" />
           </div>
        </div>
      </nav>

      {/* Hero Section - The App-First Presence */}
      <section className="relative pt-52 pb-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-60" />
        
        <div className="max-w-7xl mx-auto px-6 text-center mb-28">
          <div className="inline-flex items-center space-x-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[11px] font-black uppercase tracking-[0.4em] mb-12 shadow-2xl backdrop-blur-xl animate-pulse">
            <Rocket className="h-4 w-4" />
            <span>AI Social Suite V2.0</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black mb-12 leading-[0.8] tracking-tighter text-white max-w-5xl mx-auto italic uppercase decoration-emerald-500 underline-offset-4">
            {config?.heroTitle || "Ignite Your Brand with AI Mastery"}
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-400 font-medium leading-relaxed mb-16 px-4">
            {config?.heroSubtitle || "The all-in-one Social Media AI management suite. Create, Automate, and Scale your digital presence across all platforms instantly."}
          </p>

          {/* New App Download Buttons in Hero */}
          <div id="download" className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
            <Link 
              href={iosUrl} 
              target="_blank"
              className="flex items-center space-x-4 px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
            >
              <Apple className="h-7 w-7" fill="currentColor" />
              <div className="text-left leading-none">
                <div className="text-[10px] opacity-60 mb-1">Download on</div>
                <div className="text-lg">App Store</div>
              </div>
            </Link>
            
            <Link 
              href={androidUrl} 
              target="_blank"
              className="flex items-center space-x-4 px-10 py-5 bg-slate-900 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/50"
            >
              <Play className="h-7 w-7 text-emerald-500" fill="currentColor" />
              <div className="text-left leading-none">
                <div className="text-[10px] opacity-40 mb-1">Get it on</div>
                <div className="text-lg">Google Play</div>
              </div>
            </Link>
          </div>

          {/* Realistic App Mockup */}
          <div className="relative max-w-6xl mx-auto group perspective-1000 px-4 md:px-0">
            <div className="absolute -inset-4 bg-emerald-500/20 blur-[120px] -z-10 animate-pulse" />
            <div className="rounded-t-[40px] border-t border-x border-white/10 bg-slate-900/40 backdrop-blur-[100px] p-6 md:p-12 shadow-[0_-40px_100px_-20px_rgba(0,0,0,0.8)] transform transition-transform duration-1000 group-hover:rotate-x-2">
                <div className="flex items-center space-x-3 mb-10 border-b border-white/5 pb-8">
                  <div className="w-4 h-4 rounded-full bg-red-500/30" />
                  <div className="w-4 h-4 rounded-full bg-amber-500/30" />
                  <div className="w-4 h-4 rounded-full bg-emerald-500/30" />
                  <div className="flex-1" />
                  <div className="flex items-center space-x-6">
                     <div className="h-2 w-32 bg-white/5 rounded-full" />
                     <div className="h-2 w-12 bg-emerald-500/20 rounded-full" />
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="h-64 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/5 flex flex-col p-8 items-start justify-end text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10"><Rocket className="h-32 w-32" /></div>
                        <div className="h-4 w-1/3 bg-emerald-500/50 rounded-full mb-4" />
                        <div className="h-10 w-full bg-white/10 rounded-2xl" />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                       {[1,2,3].map(i => <div key={i} className="aspect-square rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center"><Layout className="h-8 w-8 text-white/10" /></div>)}
                    </div>
                  </div>
                  <div className="hidden lg:block lg:col-span-4 space-y-6">
                     <div className="h-full rounded-3xl bg-slate-800/40 border border-white/5 p-8 flex flex-col space-y-6">
                        <div className="h-12 w-12 rounded-2xl bg-white/5" />
                        <div className="space-y-4">
                          <div className="h-2 w-full bg-white/10 rounded-full" />
                          <div className="h-2 w-full bg-white/10 rounded-full" />
                          <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                        </div>
                        <div className="flex-1" />
                        <div className="h-14 w-full bg-emerald-500/80 rounded-2xl shadow-xl shadow-emerald-500/20" />
                     </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Platform Showcase */}
      <div className="py-24 bg-slate-900/30 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-28 text-slate-500">
            <div className="flex items-center space-x-6 hover:text-white transition-colors cursor-pointer group"><SocialIcons.Instagram /> <span className="font-black text-xl italic uppercase group-hover:scale-105 transition-transform">Instagram</span></div>
            <div className="flex items-center space-x-6 hover:text-white transition-colors cursor-pointer group"><SocialIcons.Meta /> <span className="font-black text-xl italic uppercase group-hover:scale-105 transition-transform">Facebook</span></div>
            <div className="flex items-center space-x-6 hover:text-white transition-colors cursor-pointer group"><SocialIcons.LinkedIn /> <span className="font-black text-xl italic uppercase group-hover:scale-105 transition-transform">LinkedIn</span></div>
            <div className="flex items-center space-x-6 hover:text-white transition-colors cursor-pointer group"><SocialIcons.X /> <span className="font-black text-xl italic uppercase group-hover:scale-105 transition-transform">X / Twitter</span></div>
          </div>
        </div>
      </div>

      {/* Value Pillars */}
      <section id="features" className="py-44 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter italic uppercase underline decoration-emerald-500 decoration-8 underline-offset-[20px]">Engineered for Domination</h2>
            <p className="text-slate-500 text-xl font-medium pt-8">The most advanced social intelligence platform ever designed. Your complete marketing ecosystem in one app.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature: any) => (
              <div key={feature.id} className="group p-10 rounded-[40px] bg-slate-900/20 border border-white/5 hover:border-emerald-500/30 transition-all duration-700 hover:-translate-y-4">
                <div className="w-18 h-18 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-emerald-500 group-hover:rotate-12 transition-all duration-700">
                  {feature.icon === "Zap" && <Zap className="h-10 w-10 text-emerald-500 group-hover:text-slate-950" />}
                  {feature.icon === "Globe" && <Globe className="h-10 w-10 text-emerald-500 group-hover:text-slate-950" />}
                  {feature.icon === "Cpu" && <Cpu className="h-10 w-10 text-emerald-500 group-hover:text-slate-950" />}
                  {feature.icon === "Share2" && <Share2 className="h-10 w-10 text-emerald-500 group-hover:text-slate-950" />}
                </div>
                <h3 className="text-2xl font-black text-white mb-6 tracking-tight uppercase italic">{feature.title}</h3>
                <p className="text-slate-500 text-base leading-relaxed font-medium group-hover:text-slate-400 transition-colors">{feature.description}</p>
                <div className="mt-12 h-1 w-0 group-hover:w-full bg-emerald-500 transition-all duration-700 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof (Testimonials) */}
      <section className="py-44 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-32">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter uppercase italic">User Intel</h2>
              <div className="h-2 w-32 bg-emerald-500 mx-auto rounded-full" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {testimonials.map(t => (
                <div key={t.id} className="p-12 rounded-[40px] bg-slate-950 border border-white/5 hover:border-white/20 transition-all relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-5"><Quote className="h-32 w-32" /></div>
                   <div className="flex items-center space-x-6 mb-12">
                      <img src={t.avatar} className="w-16 h-16 rounded-full grayscale group-hover:grayscale-0 transition-all border-2 border-emerald-500/20 group-hover:border-emerald-500" />
                      <div>
                        <div className="font-black text-white text-xl uppercase tracking-tighter italic">{t.name}</div>
                        <div className="text-slate-600 text-[10px] font-black tracking-widest uppercase">{t.role}</div>
                      </div>
                   </div>
                   <p className="text-slate-300 text-lg font-medium leading-relaxed italic z-10 relative">"{t.text}"</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Enhanced Pricing */}
      <section id="pricing" className="py-44 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[200px] -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32">
            <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter uppercase italic">
              {config?.pricingTitle || "Growth Architecture"}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch pt-12">
            {tiers.map((tier: any) => (
              <div key={tier.id.toString()} className={`flex flex-col p-14 rounded-[48px] border transition-all duration-700 ${tier.tierKey === 'PRO' ? 'bg-white text-slate-950 scale-110 shadow-3xl z-10 ring-8 ring-white/10' : 'bg-slate-900/40 border-white/5 text-slate-200 hover:bg-slate-900'}`}>
                <div className="mb-14">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className={`text-4xl font-black uppercase italic tracking-tighter ${tier.tierKey === 'PRO' ? 'text-slate-900' : 'text-white'}`}>{tier.name}</h3>
                     {tier.tierKey === 'PRO' && <div className="px-5 py-1.5 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest">Industry Choice</div>}
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-7xl font-black tracking-tighter underline decoration-emerald-500 underline-offset-8">${Number(tier.priceAmount)}</span>
                    <span className={`ml-4 text-xs font-black uppercase tracking-widest ${tier.tierKey === 'PRO' ? 'text-slate-400' : 'text-slate-600'}`}>/per {tier.pricePeriod}</span>
                  </div>
                </div>
                
                <div className="flex-1 mb-20">
                  <ul className="space-y-8">
                    {(tier.highlightFeatures as string[] || []).map((feature, i) => (
                      <li key={i} className="flex items-center space-x-6 text-sm font-black tracking-tight uppercase italic opacity-80">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${tier.tierKey === 'PRO' ? 'bg-emerald-500' : 'bg-white/10'}`}>
                           <Check className={`h-4 w-4 ${tier.tierKey === 'PRO' ? 'text-slate-950' : 'text-emerald-500'}`} strokeWidth={4} />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={androidUrl} className={`block w-full py-7 rounded-3xl text-center font-black uppercase tracking-[0.3em] text-xs transition-all shadow-xl shadow-black/20 ${tier.tierKey === 'PRO' ? 'bg-slate-950 text-white hover:scale-[1.03] active:scale-95' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'}`}>
                  Activate {tier.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-44 bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col lg:flex-row items-center justify-between gap-20 mb-32">
              <div className="text-center lg:text-left space-y-10">
                 <div className="flex items-center justify-center lg:justify-start space-x-4">
                    <Zap className="h-10 w-10 text-emerald-500" fill="currentColor" />
                    <span className="text-4xl font-black text-white italic tracking-tighter uppercase">{config?.appName || "BrandBoost AI"}</span>
                 </div>
                 <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-sm">The world's most advanced AI social media ecosystem.</p>
              </div>
              
              <div id="footer-download" className="flex flex-col sm:flex-row gap-6">
                <Link href={iosUrl} target="_blank" className="flex items-center space-x-3 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                   <Apple className="h-5 w-5" fill="currentColor" />
                   <span>App Store</span>
                </Link>
                <Link href={androidUrl} target="_blank" className="flex items-center space-x-3 px-8 py-4 bg-slate-900 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                   <Play className="h-5 w-5 text-emerald-500" fill="currentColor" />
                   <span>Google Play</span>
                </Link>
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-20 border-t border-white/5">
              <div className="col-span-2">
                 <h4 className="text-white text-xs font-black uppercase tracking-widest mb-12 italic underline decoration-emerald-500 decoration-4">Legal Framework</h4>
                 <ul className="grid grid-cols-2 gap-y-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">
                    {staticPages.map(page => (
                      <li key={page.slug}>
                        <Link href={`/pages/${page.slug}`} className="hover:text-emerald-500 transition-colors">
                          {page.title}
                        </Link>
                      </li>
                    ))}
                 </ul>
              </div>
              <div className="flex flex-col items-center justify-center lg:items-end col-span-2 space-y-8">
                 <div className="flex space-x-10 text-slate-800">
                    <SocialIcons.Instagram />
                    <SocialIcons.Meta />
                    <SocialIcons.LinkedIn />
                    <SocialIcons.X />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-800">© 2026 {config?.appName || "BrandBoost AI"}. All Rights Reserved.</p>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
