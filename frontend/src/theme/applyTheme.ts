import {
  CSS_VAR_MAP,
  THEME_STORAGE_KEY,
  getDerivedThemeColors,
  type ThemeMode,
} from "./tokens";

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }

  const colors = getDerivedThemeColors(mode);
  const root = document.documentElement;

  root.setAttribute("data-theme", mode);
  root.style.colorScheme = mode;

  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    root.style.setProperty(
      cssVar,
      colors[key as keyof typeof colors],
    );
  }
}

export function readStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    return null;
  }

  return null;
}
