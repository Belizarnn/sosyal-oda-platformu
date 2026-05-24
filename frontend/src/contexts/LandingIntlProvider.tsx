"use client";

import { NextIntlClientProvider } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import deMessages from "../../messages/de.json";
import enMessages from "../../messages/en.json";
import trMessages from "../../messages/tr.json";

export const LANDING_LOCALE_STORAGE_KEY = "sosyal_oda_landing_locale";

export const LANDING_LOCALES = ["tr", "en", "de"] as const;
export type LandingLocale = (typeof LANDING_LOCALES)[number];

const LANDING_MESSAGES: Record<LandingLocale, typeof trMessages> = {
  tr: trMessages,
  en: enMessages,
  de: deMessages,
};

function isLandingLocale(value: string | null | undefined): value is LandingLocale {
  return value === "tr" || value === "en" || value === "de";
}

interface LandingLocaleContextValue {
  locale: LandingLocale;
  setLocale: (locale: LandingLocale) => void;
}

const LandingLocaleContext = createContext<LandingLocaleContextValue | null>(null);

export function useLandingLocale() {
  const context = useContext(LandingLocaleContext);

  if (!context) {
    throw new Error("useLandingLocale must be used within LandingIntlProvider");
  }

  return context;
}

interface LandingIntlProviderProps {
  children: React.ReactNode;
}

export function LandingIntlProvider({ children }: LandingIntlProviderProps) {
  const [locale, setLocaleState] = useState<LandingLocale>("tr");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANDING_LOCALE_STORAGE_KEY);
      if (isLandingLocale(stored)) {
        setLocaleState(stored);
      }
    } catch {
      // localStorage unavailable
    } finally {
      setReady(true);
    }
  }, []);

  const setLocale = useCallback((nextLocale: LandingLocale) => {
    setLocaleState(nextLocale);

    try {
      localStorage.setItem(LANDING_LOCALE_STORAGE_KEY, nextLocale);
      document.documentElement.lang = nextLocale;
    } catch {
      // localStorage unavailable
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

  if (!ready) {
    return (
      <div className="landing-shell flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
      </div>
    );
  }

  return (
    <LandingLocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={LANDING_MESSAGES[locale]}>
        {children}
      </NextIntlClientProvider>
    </LandingLocaleContext.Provider>
  );
}
