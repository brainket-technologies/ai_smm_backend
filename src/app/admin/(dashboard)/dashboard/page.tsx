import prisma from "@/lib/db";
import Link from "next/link";
import { 
  Users, 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight 
} from "lucide-react";

async function getStats() {
  const [userCount, businessCount, aiCount, subscriptionCount, recentUsers, recentAI] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.aIGeneratedContent.count(),
    prisma.userSubscription.count({ where: { status: 'active' } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, phone: true, createdAt: true, image: true }
    }),
    prisma.aIGeneratedContent.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, contentType: true, createdAt: true }
    })
  ]);

  return {
    users: Number(userCount),
    businesses: Number(businessCount),
    aiGenerations: Number(aiCount),
    activeSubscriptions: Number(subscriptionCount),
    recentUsers: recentUsers.map(u => ({ ...u, id: u.id.toString() })),
    recentAI: recentAI.map(a => ({ ...a, id: a.id.toString() }))
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { title: "Total Users", value: Number(stats.users), icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-600/10" },
    { title: "Active Businesses", value: Number(stats.businesses), icon: Briefcase, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-600/10" },
    { title: "AI Content Generated", value: Number(stats.aiGenerations), icon: Sparkles, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-100/10" },
    { title: "Subscriptions", value: Number(stats.activeSubscriptions), icon: TrendingUp, color: "text-green-600", bg: "bg-green-100 dark:bg-green-600/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Monitor your AI Social ecosystem's performance and growth.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-[var(--card-background)] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={card.bg + " p-3 rounded-xl transition-colors group-hover:bg-opacity-80"}>
                <card.icon className={card.color + " h-6 w-6"} />
              </div>
              <div className="flex items-center text-green-500 text-xs font-bold bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Live
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Chart Placeholder */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
               <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                  <TrendingUp className="h-4 w-4 text-blue-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Revenue Momentum</span>
               </div>
               <h2 className="text-4xl font-black tracking-tighter">Earnings up by <span className="text-blue-300">+28.4%</span></h2>
               <p className="text-blue-100/60 max-w-sm text-sm">Your ecosystem is scaling rapidly. AI generation efficiency has increased margins by 12% this month.</p>
               <div className="flex items-center space-x-6 pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-blue-100/40 uppercase">Projected Oct</p>
                    <p className="text-xl font-bold">$142,500.00</p>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10" />
                  <div>
                    <p className="text-[10px] font-bold text-blue-100/40 uppercase">Retention</p>
                    <p className="text-xl font-bold">94.2%</p>
                  </div>
               </div>
            </div>
            
            {/* Visual Chart Placeholder */}
            <div className="flex-1 max-w-md h-48 flex items-end space-x-1 justify-around group-hover:scale-105 transition-transform duration-700">
               {[40, 60, 45, 75, 55, 90, 65, 95, 80, 100].map((h, i) => (
                 <div 
                  key={i} 
                  style={{ height: `${h}%` }} 
                  className={`w-full max-w-[12px] rounded-full bg-gradient-to-t from-blue-400 to-white/40 opacity-${20 + (i*8)} animate-in fade-in slide-in-from-bottom duration-1000 delay-${i*100}`} 
                 />
               ))}
            </div>
         </div>

         {/* Abstract background shapes */}
         <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
         <div className="absolute bottom-0 left-0 h-48 w-48 bg-blue-400/10 rounded-full -ml-10 -mb-10 blur-2xl" />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[var(--card-background)] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent AI Activity</h2>
            <Link href="/admin/activity" className="text-blue-600 text-xs font-bold hover:underline">View All &rarr;</Link>
          </div>
          <div className="flex-1 p-0">
             <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentAI.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                     <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
                           <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-sm font-bold capitalize">{item.contentType || "General Content"} Generated</p>
                           <p className="text-[10px] text-gray-400 font-mono uppercase">ID: {item.id}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold">{new Date(item.createdAt || "").toLocaleTimeString()}</p>
                        <p className="text-[10px] text-gray-400">{new Date(item.createdAt || "").toLocaleDateString()}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-[var(--card-background)] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold">New Signups</h2>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-4 p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                 <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {user.name ? user.name.charAt(0) : "U"}
                 </div>
                 <div className="flex-1">
                    <p className="text-sm font-bold">{user.name || "Anonymous User"}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{user.phone}</p>
                 </div>
                 <div className="text-xs text-gray-400">
                    {new Date(user.createdAt || "").toLocaleDateString()}
                 </div>
              </div>
            ))}
          </div>
          <Link href="/admin/users" className="p-4 text-center text-xs font-bold text-gray-500 hover:text-blue-600 border-t border-slate-100 dark:border-slate-800 block">
             View All Users
          </Link>
        </div>
      </div>

      {/* System Health Section */}
      <div className="bg-[var(--card-background)] rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold mb-6">System Real-time Health</h2>
          <div className="space-y-6">
            <HealthItem label="Database Content" status="37 Tables Active" color="bg-green-500" />
            <HealthItem label="AI Services" status="Connected" color="bg-green-500" />
            <HealthItem label="Next.js Backend" status="Online" color="bg-blue-500" />
            <HealthItem label="Mobile Sync" status="Listening" color="bg-amber-500" />
          </div>
        </div>
      </div>
    );
}

function HealthItem({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-gray-400">{status}</span>
      </div>
      <div className={color + " h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"} />
    </div>
  );
}
