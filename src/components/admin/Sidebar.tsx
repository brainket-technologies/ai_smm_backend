"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Settings, 
  Languages, 
  CreditCard, 
  FileText, 
  Users,
  Shield, 
  ShieldCheck, 
  Search,
  ChevronRight,
  HelpCircle,
  Target,
  Bot,
  Zap,
  Layers,
  Palette,
  FolderTree,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useAdmin } from "@/hooks/useAdmin";

const menuGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    label: "App Settings",
    items: [
      { name: "Global Config",  href: "/admin/config",      icon: Settings   },
      { name: "App Themes",     href: "/admin/themes",      icon: Palette    },
      { name: "Static Page",    href: "/admin/pages",       icon: FileText   },
      { name: "Social Connections", href: "/admin/social-accounts", icon: Globe },
      { name: "Platforms",      href: "/admin/platforms",   icon: Layers     },
      { name: "Categories",     href: "/admin/categories",  icon: FolderTree },
    ]
  },
  {
    label: "AI & Services",
    items: [
      { name: "AI Models",       href: "/admin/ai-models",      icon: Bot     },
      { name: "AI Prompts",      href: "/admin/ai-prompts",     icon: FileText},
      { name: "3rd Party Config",href: "/admin/service-configs",icon: Zap     },
    ]
  },
  {
    label: "Content & Data",
    items: [
      { name: "Targeting Data", href: "/admin/targeting",    icon: Target    },
      { name: "Localization",   href: "/admin/translations", icon: Languages },
      { name: "Currencies",     href: "/admin/currencies",   icon: Globe     },
    ]
  },
  {
    label: "Subscriptions",
    items: [
      { name: "Feature Flags",  href: "/admin/feature-flags",  icon: ShieldCheck },
      { name: "Subscription",   href: "/admin/subscriptions",  icon: CreditCard  },
    ]
  },
  {
    label: "Administration",
    items: [
      { name: "Platform Users", href: "/admin/users",    icon: Users      },
      { name: "Roles",          href: "/admin/roles",    icon: Shield     },
      { name: "User Feedback",  href: "/admin/feedback", icon: HelpCircle },
      { name: "Help & Support", href: "/admin/help",     icon: HelpCircle },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { admin, loading, isSidebarCollapsed } = useAdmin();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-[#091310] text-gray-400 border-r border-slate-800 flex flex-col z-40 transition-all duration-500 ease-in-out",
      isSidebarCollapsed ? "w-20" : "w-64"
    )}>
      
      {/* Brand Header */}
      <div className={cn("p-6", isSidebarCollapsed ? "px-4" : "p-6")}>
        <div className={cn(
          "flex items-center bg-white/5 rounded-2xl border border-white/10 transition-all duration-300",
          isSidebarCollapsed ? "p-2 justify-center" : "p-3 space-x-3"
        )}>
          <div className="h-10 w-10 min-w-[40px] rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
             <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
               <span className="text-sm font-bold text-white leading-none whitespace-nowrap">BrandBoost AI</span>
               <span className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider whitespace-nowrap">
                 {loading ? 'Super Admin' : (admin?.role?.name || 'Super Admin')}
               </span>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Search */}
      {!isSidebarCollapsed && (
        <div className="px-6 mb-4 animate-in fade-in duration-500">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600 group-focus-within:text-accent transition-colors" />
            <input 
              type="text"
              placeholder="Search menu..."
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>
      )}

      {/* Navigation - Scrollable */}
      <div className={cn(
        "flex-1 py-2 overflow-y-auto custom-scrollbar mb-6",
        isSidebarCollapsed ? "px-2" : "px-4"
      )}>
        <div className="space-y-6">
          {menuGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!isSidebarCollapsed && (
                <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-3 animate-in fade-in duration-700">
                  {group.label}
                </h3>
              )}
              {group.items.map((item) => {
                const isActive = pathname ? (pathname === item.href || pathname.startsWith(item.href + "/")) : false;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isSidebarCollapsed ? item.name : ""}
                    className={cn(
                      "flex items-center rounded-xl p-3 group transition-all duration-300 relative",
                      isSidebarCollapsed ? "justify-center" : "px-4 justify-between",
                      isActive 
                        ? "bg-accent/10 text-accent border border-accent/20" 
                        : "hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        !isSidebarCollapsed && "mr-3",
                        isActive ? "text-accent" : "text-gray-500 group-hover:text-white"
                      )} />
                      {!isSidebarCollapsed && (
                        <span className={cn(
                          "text-sm font-semibold animate-in fade-in slide-in-from-left-2 duration-300",
                          isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                        )}>
                          {item.name}
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-accent rounded-r-full" />
                    )}
                    {!isActive && !isSidebarCollapsed && (
                       <ChevronRight className="h-3 w-3 text-gray-700 group-hover:text-gray-400 transition-colors" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mini Profile Section */}
      <div className={cn(
        "p-4 border-t border-white/5 mt-auto transition-all duration-300",
        isSidebarCollapsed ? "px-2" : "px-6"
      )}>
        <div className={cn(
          "flex items-center rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition-all border border-white/5",
          isSidebarCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="h-10 w-10 min-w-[40px] rounded-xl bg-accent/20 border border-accent/20 overflow-hidden shadow-inner">
             <img 
               src={admin?.image || `https://ui-avatars.com/api/?name=${admin?.name || 'Admin'}&background=2ECC71&color=fff`} 
               alt="User" 
               className="h-full w-full object-cover"
             />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-500">
               <span className="text-xs font-bold text-white truncate">{admin?.name || 'Administrator'}</span>
               <span className="text-[8px] text-gray-500 font-bold uppercase truncate">{admin?.email || 'admin@brandboost.ai'}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
