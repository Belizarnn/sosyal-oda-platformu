"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchCurrentUser,
  getStoredUser,
  logout as clearSession,
  type AuthUser,
} from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }

    fetchCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const current = await fetchCurrentUser();
    setUser(current);
    return current;
  }, []);

  return { user, loading, logout, refreshUser, setUser };
}
