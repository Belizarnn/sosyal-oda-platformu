"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { isAdminPanelRole } from "@/types/admin";

export function useAdminAccess() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const hasAccess = isAdminPanelRole(user?.role);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  return {
    user,
    loading,
    hasAccess,
    isAdmin,
    isReady: !loading && Boolean(user),
    forbidden: !loading && Boolean(user) && !hasAccess,
  };
}
