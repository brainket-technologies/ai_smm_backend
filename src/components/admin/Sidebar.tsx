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
  ShieldCheck, 
  Search,
  ChevronRight,
  HelpCircle,
  LogOut,
  Layers,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useAdmin } from "@/hooks/useAdmin";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "App Config", href: "/admin/config", icon: Settings },
  { name: "Translations", href: "/admin/translations", icon: Languages },
  { name: "Currencies", href: "/admin/currencies", icon: Globe },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { name: "Static Pages", href: "/admin/pages", icon: FileText },
  { name: "Feature Flags", href: "/admin/feature-flags", icon: Layers },
  { name: "User Roles", href: "/admin/users", icon: Users },
  { name: "Help Line", href: "/admin/help", icon: HelpCircle },
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
               <span className="text-sm font-bold text-white leading-none whitespace-nowrap">Brand Header 🚀</span>
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
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isSidebarCollapsed ? item.name : ""}
                className={cn(
                  "flex items-center rounded-xl p-3 group transition-all duration-300",
                  isSidebarCollapsed ? "justify-center" : "px-4 justify-between",
                  isActive 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : "hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center">
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    !isSidebarCollapsed && "mr-3",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-white"
                  )} />
                  {!isSidebarCollapsed && (
                    <span className="text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                      {item.name}
                    </span>
                  )}
                </div>
                {!isActive && !isSidebarCollapsed && (
                   <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-gray-400 transition-colors" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mini Profile Section (from design) */}
      <div className={cn(
        "p-4 border-t border-white/5 mt-auto transition-all duration-300",
        isSidebarCollapsed ? "px-2" : "px-6"
      )}>
        <div className={cn(
          "flex items-center rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition-all",
          isSidebarCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="h-10 w-10 min-w-[40px] rounded-[1rem] bg-accent/20 border border-accent/20 overflow-hidden">
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
