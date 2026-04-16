"use client";

import { useAdminContext } from "@/providers/AdminProvider";

export function useAdmin() {
  const context = useAdminContext();
  return context;
}
