import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Zap, Globe, Cpu, ShieldAlert, 
  ArrowRight, Check, Star, 
  Share2, MessageSquare, Link as LinkIcon, Globe as GlobeIcon,
  Smartphone, BarChart3, Rocket, Layout,
  ChevronRight, Quote, Plus
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
    return { config, tiers, staticPages };
  } catch (error) {
    console.error("Failed to fetch landing data:", error);
    return { config: null, tiers: [], staticPages: [] };
  }
}

// Branded Social Icons as Inline SVGs
const SocialIcons = {
  Instagram: () => (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  Meta: () => (
    <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg className="h-8 w-8 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  ),
  X: () => (
    <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
};

export default async function LandingPage() {
  const { config, tiers, staticPages } = await getLandingData();

  const features = config?.featuresJson ? (config.featuresJson as any[]) : [
    { id: "1", title: "AI Content Studio", description: "Create professional posts in seconds with our state-of-the-art AI generation engine.", icon: "Zap" },
    { id: "2", title: "Social Sync", description: "Manage all your social accounts from one place with unified scheduling.", icon: "Globe" }
  ];

  const testimonials = [
    { id: "1", name: "Alex Rivera", handle: "@alexgrowth", text: "BrandBoost AI completely automated my Instagram workflow. Post quality is insane! 🚀", avatar: "https://i.pravatar.cc/100?img=11" },
    { id: "2", name: "Elena Kovacs", handle: "@marketingwith_e", text: "The first AI tool that actually understands my brand's voice. A total game changer for agencies.", avatar: "https://i.pravatar.cc/100?img=22" },
    { id: "3", name: "Jordan Smith", handle: "@jsmith_biz", text: "From idea to scheduled post in under 2 minutes. My engagement is up 400%.", avatar: "https://i.pravatar.cc/100?img=33" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-sans tracking-tight">
      {/* Floating Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 px-6 h-16 flex items-center justify-between border border-white/5 bg-slate-950/40 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="h-5 w-5 text-slate-900" fill="currentColor" />
          </div>
          <span className="text-lg font-black text-white tracking-tighter uppercase whitespace-nowrap">
            {config?.appName || "BrandBoost AI"}
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
          <Link href="#features" className="hover:text-emerald-500 transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing</Link>
          <Link href="#showcase" className="hover:text-emerald-500 transition-colors">Showcase</Link>
        </div>

        <Link href="/admin/login" className="px-5 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
        
        <div className="max-w-7xl mx-auto px-6 text-center mb-24">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-2xl">
            <Rocket className="h-3 w-3" />
            <span>Dominate Social Media with AI</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-10 leading-[0.85] tracking-tighter text-white max-w-4xl mx-auto italic uppercase">
            {config?.heroTitle || "Ignite Your Brand with AI Mastery"}
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-14">
            {config?.heroSubtitle || "The ultimate Social Media AI management suite. Create, Automate, and Scale your digital presence across all platforms instantly."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <Link href="/admin/login" className="group flex items-center space-x-3 px-10 py-5 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-lg transition-all hover:scale-105 shadow-2xl shadow-white/10">
              <span>Start Scaling Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-left md:border-l border-white/10 md:pl-8">
              <div className="flex -space-x-2 mb-2">
                {[1,2,3,4].map(i => <img key={i} src={`https://i.pravatar.cc/100?img=${i+40}`} className="w-8 h-8 rounded-full border-2 border-slate-950" />)}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trusted by 5,000+ Agencies</div>
            </div>
          </div>

          {/* App Mockup Rendering */}
          <div id="showcase" className="relative max-w-5xl mx-auto group">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] -z-10 group-hover:bg-emerald-500/30 transition-all" />
            <div className="rounded-t-3xl border-t border-x border-white/10 bg-slate-900/40 backdrop-blur-3xl p-4 md:p-8 shadow-2xl overflow-hidden">
                <div className="flex items-center space-x-2 mb-6 border-b border-white/5 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                  <div className="flex-1" />
                  <div className="px-4 py-1.5 rounded-full bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400">Social Content Dashboard</div>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3 space-y-3">
                    {[1,2,3,4].map(i => <div key={i} className={`h-8 rounded-lg bg-white/${i === 1 ? '10' : '5'}`} />)}
                  </div>
                  <div className="col-span-9 grid grid-cols-2 gap-4">
                    <div className="aspect-[4/3] rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                       <Layout className="h-10 w-10 text-emerald-500/50" />
                    </div>
                    <div className="aspect-[4/3] rounded-2xl bg-slate-800/50 flex flex-col p-6 text-left space-y-4">
                       <div className="h-4 w-2/3 bg-white/10 rounded" />
                       <div className="h-3 w-full bg-white/5 rounded" />
                       <div className="h-3 w-full bg-white/5 rounded" />
                       <div className="flex-1" />
                       <div className="h-8 w-1/2 bg-emerald-500/80 rounded-xl" />
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Brand Marquee */}
      <div className="py-20 bg-slate-900/30 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 hover:opacity-100 transition-opacity duration-1000">
            <div className="flex items-center space-x-4"><SocialIcons.Instagram /> <span className="font-bold text-lg">Instagram</span></div>
            <div className="flex items-center space-x-4"><SocialIcons.Meta /> <span className="font-bold text-lg">Facebook</span></div>
            <div className="flex items-center space-x-4"><SocialIcons.LinkedIn /> <span className="font-bold text-lg">LinkedIn</span></div>
            <div className="flex items-center space-x-4"><SocialIcons.X /> <span className="font-bold text-lg">X (Twitter)</span></div>
          </div>
        </div>
      </div>

      {/* Dynamic Features Grid */}
      <section id="features" className="py-40 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter italic uppercase">Engineered for Social Dominance</h2>
            <p className="text-slate-500 text-lg font-medium">A unified AI platform built to consolidate your entire social media stack into one high-performance workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: any) => (
              <div key={feature.id} className="group p-10 rounded-[32px] bg-slate-900/20 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Plus className="h-20 w-20" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-500">
                  {feature.icon === "Zap" && <Zap className="h-8 w-8 text-emerald-500 group-hover:text-slate-950" />}
                  {feature.icon === "Globe" && <Globe className="h-8 w-8 text-emerald-500 group-hover:text-slate-950" />}
                  {feature.icon === "Cpu" && <Cpu className="h-8 w-8 text-emerald-500 group-hover:text-slate-950" />}
                  {feature.icon === "BarChart3" && <BarChart3 className="h-8 w-8 text-emerald-500 group-hover:text-slate-950" />}
                  {feature.icon === "ShieldAlert" && <ShieldAlert className="h-8 w-8 text-emerald-500 group-hover:text-slate-950" />}
                  {feature.icon === "Star" && <Star className="h-8 w-8 text-emerald-500 group-hover:text-slate-950" />}
                </div>
                <h3 className="text-2xl font-black text-white mb-6 tracking-tight uppercase italic">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors">{feature.description}</p>
                <div className="mt-10 flex items-center text-emerald-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                  <span>Learn More</span>
                  <ChevronRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Wall (Testimonials) */}
      <section className="py-40 bg-slate-900/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
           <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic">The Word on the Digital Street</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map(t => (
                <div key={t.id} className="p-8 rounded-3xl bg-slate-950 border border-white/5 hover:border-white/20 transition-all shadow-2xl">
                   <div className="flex items-center space-x-4 mb-8">
                      <img src={t.avatar} className="w-12 h-12 rounded-full border-2 border-emerald-500" />
                      <div>
                        <div className="font-black text-white text-sm uppercase tracking-tight">{t.name}</div>
                        <div className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">{t.handle}</div>
                      </div>
                      <div className="flex-1" />
                      <Quote className="h-6 w-6 text-emerald-500/20" fill="currentColor" />
                   </div>
                   <p className="text-slate-300 font-medium leading-relaxed italic">"{t.text}"</p>
                   <div className="mt-8 flex items-center space-x-1.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 text-amber-500 fill-current" />)}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Enhanced Pricing */}
      <section id="pricing" className="py-40 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic">
              {config?.pricingTitle || "Engineered for Exponential Growth"}
            </h2>
            <p className="text-slate-500 text-lg font-medium">No hidden fees. Scale as you grow, cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-12">
            {tiers.map((tier: any) => (
              <div key={tier.id.toString()} className={`flex flex-col p-12 rounded-[40px] border transition-all duration-500 ${tier.tierKey === 'PRO' ? 'bg-white text-slate-950 scale-110 shadow-[0_0_80px_rgba(255,255,255,0.1)] z-10' : 'bg-slate-900/40 border-white/5 text-slate-100 hover:bg-slate-900'}`}>
                <div className="mb-12">
                  <h3 className={`text-3xl font-black mb-4 uppercase italic tracking-tighter ${tier.tierKey === 'PRO' ? 'text-slate-900 underline decoration-emerald-500' : 'text-white'}`}>{tier.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-6xl font-black tracking-tighter">${Number(tier.priceAmount)}</span>
                    <span className={`ml-3 text-xs font-black uppercase tracking-widest ${tier.tierKey === 'PRO' ? 'text-slate-500' : 'text-slate-500'}`}>/per {tier.pricePeriod}</span>
                  </div>
                </div>
                
                <div className="flex-1 mb-16">
                  <div className={`text-[10px] font-black uppercase tracking-widest mb-8 ${tier.tierKey === 'PRO' ? 'text-emerald-600' : 'text-emerald-500'}`}>Key Features Included:</div>
                  <ul className="space-y-6">
                    {(tier.highlightFeatures as string[] || []).map((feature, i) => (
                      <li key={i} className="flex items-center space-x-4 text-sm font-bold tracking-tight">
                        <Check className={`h-5 w-5 flex-shrink-0 ${tier.tierKey === 'PRO' ? 'text-emerald-500' : 'text-emerald-500'}`} strokeWidth={4} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/admin/login" className={`block w-full py-6 rounded-3xl text-center font-black uppercase tracking-widest text-sm transition-all shadow-xl ${tier.tierKey === 'PRO' ? 'bg-slate-950 text-white hover:scale-105 active:scale-95' : 'bg-white/5 text-white border border-white/10 hover:bg-emerald-500 hover:text-slate-950'}`}>
                  Activate {tier.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer using StaticPages */}
      <footer className="py-32 bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-emerald-500" fill="currentColor" />
              <span className="text-2xl font-black text-white italic tracking-tighter uppercase">{config?.appName || "BrandBoost AI"}</span>
            </div>
            <p className="text-slate-500 text-base font-medium leading-relaxed max-w-xs">The world's most advanced AI social media ecosystem. Redefining digital influence for modern brands.</p>
            <div className="flex items-center space-x-6 text-slate-600">
               <SocialIcons.Instagram />
               <SocialIcons.Meta />
               <SocialIcons.LinkedIn />
               <SocialIcons.X />
            </div>
          </div>
          
          <div className="md:pt-4">
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-10 italic underline decoration-emerald-500/50">Core Suite</h4>
            <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <li><Link href="#features" className="hover:text-emerald-500 transition-colors">AI Content</Link></li>
              <li><Link href="#features" className="hover:text-emerald-500 transition-colors">Analytics</Link></li>
              <li><Link href="#features" className="hover:text-emerald-500 transition-colors">Scheduling</Link></li>
            </ul>
          </div>

          <div className="md:pt-4">
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-10 italic underline decoration-emerald-500/50">Resources</h4>
            <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <li><Link href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing</Link></li>
              <li><Link href="/admin/login" className="hover:text-emerald-500 transition-colors">Admin Login</Link></li>
              <li><Link href="/api/v1" target="_blank" className="hover:text-emerald-500 transition-colors">API Docs</Link></li>
            </ul>
          </div>

          <div className="md:pt-4 col-span-2">
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-10 italic underline decoration-emerald-500/50">Company Info</h4>
            <ul className="space-y-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
              {staticPages.map(page => (
                <li key={page.slug}>
                  <Link href={`/pages/${page.slug}`} className="hover:text-emerald-500 transition-colors">
                    {page.title}
                  </Link>
                </li>
              ))}
              {staticPages.length === 0 && (
                <>
                  <li><Link href="#" className="hover:text-emerald-500">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-emerald-500">Terms of Service</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">© 2026 {config?.appName || "BrandBoost AI"}. Engineered by Experts.</p>
          <div className="flex items-center space-x-8 mt-8 md:mt-0 opacity-20">
             <img src="/vercel.svg" className="h-4 invert" alt="Vercel" />
             <div className="w-px h-4 bg-white/20" />
             <span className="text-[9px] font-black uppercase text-white">Next.js 16</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
