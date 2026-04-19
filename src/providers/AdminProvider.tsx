"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AdminProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: {
    id: string;
    name: string;
  } | null;
}

interface AdminContextType {
  admin: AdminProfile | null;
  loading: boolean;
  error: string | null;
  refreshAdmin: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI States
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize UI states from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme') as 'light' | 'dark';
    const savedSidebar = localStorage.getItem('admin_sidebar_collapsed') === 'true';
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Default to dark as per BrandBoost aesthetic
      document.documentElement.classList.add('dark');
    }
    
    setIsSidebarCollapsed(savedSidebar);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('admin_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('admin_sidebar_collapsed', String(newState));
  };

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Strict Role Check: Frontend enforcement
        if (data.data.role?.name !== 'Super Admin') {
          setError('Unauthorized: Access restricted to Super Admins.');
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
          return;
        }
        setAdmin(data.data);
      } else {
        setError(data.message);
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
      }
    } catch (err) {
      setError('Failed to fetch admin profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAdmin = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <AdminContext.Provider value={{ admin, loading, error, refreshAdmin, theme, toggleTheme, isSidebarCollapsed, toggleSidebar }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
}
