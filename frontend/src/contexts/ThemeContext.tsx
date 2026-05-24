"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { applyTheme, readStoredTheme } from "@/theme/applyTheme";
import { THEME_STORAGE_KEY, type ThemeMode } from "@/theme/tokens";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [isReady, setIsReady] = useState(false);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const nextTheme: ThemeMode = current === "dark" ? "light" : "dark";
      applyTheme(nextTheme);

      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // localStorage unavailable
      }

      return nextTheme;
    });
  }, []);

  useEffect(() => {
    const stored = readStoredTheme();
    const initial = stored ?? "dark";
    setThemeState(initial);
    applyTheme(initial);
    setIsReady(true);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isReady }),
    [theme, setTheme, toggleTheme, isReady],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme ThemeProvider içinde kullanılmalıdır.");
  }

  return context;
}
