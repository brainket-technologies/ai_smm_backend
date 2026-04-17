"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { AdminProvider } from "@/providers/AdminProvider";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useAdmin();

  return (
    <div className="flex bg-[#fcfdfd] dark:bg-[#0F1F1A] min-h-screen font-sans transition-all duration-500">
      {/* Sidebar - Fixed width */}
      <Sidebar />

      {/* Main Container - Pushed to the right of fixed sidebar */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-500 ease-in-out",
        isSidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        
        {/* Sticky Global Top Header */}
        <Header />

        {/* Dashboard Content Area */}
        <main className="p-4 md:p-10 flex-1 animate-in fade-in duration-700">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Optional Admin Footer */}
        <footer className="px-10 py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
           <span>BrandBoost AI System · Stable v1.0</span>
           <div className="flex items-center space-x-1">
              <span>Identity Verified</span>
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
           </div>
        </footer>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
