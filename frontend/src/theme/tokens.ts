export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "sosyal_oda_theme";

export interface ThemeColors {
  background: string;
  card: string;
  sidebar: string;
  foreground: string;
  muted: string;
  accent: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export const themes: Record<ThemeMode, ThemeColors> = {
  light: {
    background: "#F8FAFC",
    card: "#FFFFFF",
    sidebar: "#FFFFFF",
    foreground: "#1E293B",
    muted: "#64748B",
    accent: "#06B6D4",
    border: "#E2E8F0",
    success: "#16A34A",
    warning: "#F59E0B",
    error: "#DC2626",
  },
  dark: {
    background: "#0F172A",
    card: "#1E293B",
    sidebar: "#020617",
    foreground: "#F8FAFC",
    muted: "#CBD5E1",
    accent: "#06B6D4",
    border: "#334155",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
  },
};

export interface ThemeDerivedColors extends ThemeColors {
  surface: string;
  surfaceHover: string;
  inputBg: string;
  topbar: string;
  dropdown: string;
  ringOffset: string;
  overlay: string;
  accentSoft: string;
  accentRing: string;
  glow: string;
  shadow: string;
}

export function getDerivedThemeColors(mode: ThemeMode): ThemeDerivedColors {
  const base = themes[mode];

  if (mode === "light") {
    return {
      ...base,
      surface: "#F1F5F9",
      surfaceHover: "#E2E8F0",
      inputBg: "#FFFFFF",
      topbar: "rgba(255, 255, 255, 0.92)",
      dropdown: base.card,
      ringOffset: base.background,
      overlay: "rgba(15, 23, 42, 0.35)",
      accentSoft: "rgba(6, 182, 212, 0.12)",
      accentRing: "rgba(6, 182, 212, 0.25)",
      glow: "rgba(6, 182, 212, 0.18)",
      shadow: "rgba(15, 23, 42, 0.08)",
    };
  }

  return {
    ...base,
    surface: "rgba(255, 255, 255, 0.05)",
    surfaceHover: "rgba(255, 255, 255, 0.08)",
    inputBg: "rgba(255, 255, 255, 0.05)",
    topbar: "rgba(15, 23, 42, 0.92)",
    dropdown: base.card,
    ringOffset: base.background,
    overlay: "rgba(0, 0, 0, 0.6)",
    accentSoft: "rgba(6, 182, 212, 0.15)",
    accentRing: "rgba(6, 182, 212, 0.25)",
    glow: "rgba(6, 182, 212, 0.28)",
    shadow: "rgba(0, 0, 0, 0.35)",
  };
}

export const CSS_VAR_MAP: Record<keyof ThemeDerivedColors, string> = {
  background: "--background",
  card: "--card",
  sidebar: "--sidebar",
  foreground: "--foreground",
  muted: "--muted",
  accent: "--accent",
  border: "--border",
  success: "--success",
  warning: "--warning",
  error: "--error",
  surface: "--surface",
  surfaceHover: "--surface-hover",
  inputBg: "--input-bg",
  topbar: "--topbar",
  dropdown: "--dropdown",
  ringOffset: "--ring-offset",
  overlay: "--overlay",
  accentSoft: "--accent-soft",
  accentRing: "--accent-ring",
  glow: "--glow",
  shadow: "--shadow",
};
