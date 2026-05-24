"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getTranslations } from "@/i18n/loadTranslations";
import {
  DEFAULT_LOCALE,
  LANGUAGE_STORAGE_KEY,
  getLanguageLabel,
  isSupportedLocale,
  type Locale,
} from "@/i18n/languages";
import {
  getLocaleDocumentAttributes,
  translateKey,
  type TranslationParams,
} from "@/i18n/utils";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
  isReady: boolean;
  getLanguageLabel: (locale: Locale) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLocale(stored)) {
      return stored;
    }
  } catch {
    return DEFAULT_LOCALE;
  }

  return DEFAULT_LOCALE;
}

function applyDocumentLocale(locale: Locale): void {
  if (typeof document === "undefined") {
    return;
  }

  const { lang, dir } = getLocaleDocumentAttributes(locale);
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isReady, setIsReady] = useState(false);

  const dictionary = useMemo(() => getTranslations(locale), [locale]);

  const t = useCallback(
    (key: string, params?: TranslationParams) =>
      translateKey(dictionary, key, params),
    [dictionary],
  );

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    applyDocumentLocale(nextLocale);

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    const initial = readStoredLocale();
    setLocaleState(initial);
    applyDocumentLocale(initial);
    setIsReady(true);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      isReady,
      getLanguageLabel,
    }),
    [locale, setLocale, t, isReady],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage LanguageProvider içinde kullanılmalıdır.");
  }

  return context;
}
