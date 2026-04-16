"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Bell, 
  Maximize, 
  Grid, 
  Settings, 
  ChevronDown, 
  Menu,
  LogOut,
  User,
  Shield,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";

import Cookies from "js-cookie";
import { useAdmin } from "@/hooks/useAdmin";

export default function Header() {
  const { admin, loading, theme, toggleTheme, isSidebarCollapsed, toggleSidebar } = useAdmin();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    Cookies.remove('admin_token');
    window.location.href = '/admin/login';
  };

  return (
    <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-[#091310] sticky top-0 z-30 transition-all duration-300">
      
      {/* Search Pill & Sidebar Toggle */}
      <div className="flex items-center flex-1 max-w-md group space-x-4">
        <button 
          onClick={toggleSidebar}
          className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>

        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder="Search anything..."
            className="w-full h-11 bg-slate-100 dark:bg-slate-900/50 border-none rounded-full pl-12 pr-4 text-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center space-x-2 md:space-x-4">
        
        {/* Languages / Mega Menu Placeholder */}
        <button className="hidden md:flex items-center space-x-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
           <img src="https://flagcdn.com/w40/us.png" className="h-4 w-6 object-cover rounded-sm" alt="EN" />
           <span className="dark:text-gray-300">English</span>
           <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />

        {/* Global Icons */}
        <div className="flex items-center space-x-1">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group"
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 group-hover:text-accent transition-colors" />
            ) : (
              <Sun className="h-5 w-5 group-hover:text-accent transition-colors" />
            )}
          </button>

          <button className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group">
            <Grid className="h-5 w-5 group-hover:text-accent transition-colors" />
          </button>
          
          <button className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative group">
            <Bell className="h-5 w-5 group-hover:text-accent transition-colors" />
            <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 border-2 border-white dark:border-[#091310] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              3
            </span>
          </button>

          <button className="hidden sm:flex p-2.5 text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group">
            <Maximize className="h-5 w-5 group-hover:text-accent transition-colors" />
          </button>
        </div>

        <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800" />

        {/* User Profile */}
        <div className="flex items-center space-x-3 p-1 padding-right-2 rounded-xl transition-all mr-2">
           <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden">
              <img 
                src={admin?.image || `https://ui-avatars.com/api/?name=${admin?.name || 'Admin'}&background=2ECC71&color=fff`} 
                alt="Admin" 
                className="h-full w-full object-cover"
              />
           </div>
           <div className="hidden lg:block text-left">
              <div className="text-sm font-bold dark:text-white leading-none">
                {loading ? 'Loading...' : (admin?.name || 'Admin')}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-tighter">
                {loading ? 'Please wait' : (admin?.role?.name || 'Super Identity')}
              </div>
           </div>
        </div>

        {/* Settings Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-full transition-all ${showSettings ? 'bg-accent/10 text-accent' : 'text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Settings className={`h-5 w-5 ${showSettings ? 'rotate-90' : ''} transition-transform duration-300`} />
          </button>

          {showSettings && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowSettings(false)} 
              />
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0F1F1A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Options</p>
                </div>
                
                <Link 
                  href="/admin/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setShowSettings(false)}
                >
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">My Profile</span>
                </Link>

                <Link 
                  href="/admin/security"
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setShowSettings(false)}
                >
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Change Password</span>
                </Link>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout System</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
