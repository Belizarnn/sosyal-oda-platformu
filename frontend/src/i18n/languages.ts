export const LANGUAGE_STORAGE_KEY = "sosyal_oda_language";

export const DEFAULT_LOCALE = "tr" as const;

export const SUPPORTED_LOCALES = [
  "tr",
  "en",
  "de",
  "zh",
  "es",
  "hi",
  "pt",
  "ru",
  "ja",
  "ko",
  "id",
  "fr",
  "it",
  "fa",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export interface LanguageOption {
  code: Locale;
  label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "hi", label: "हिन्दी" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "fa", label: "فارسی" },
];

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function getLanguageLabel(code: Locale): string {
  return LANGUAGE_OPTIONS.find((option) => option.code === code)?.label ?? code;
}

const INTL_LOCALE_MAP: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-US",
  de: "de-DE",
  zh: "zh-CN",
  es: "es-ES",
  hi: "hi-IN",
  pt: "pt-BR",
  ru: "ru-RU",
  ja: "ja-JP",
  ko: "ko-KR",
  id: "id-ID",
  fr: "fr-FR",
  it: "it-IT",
  fa: "fa-IR",
};

export function getIntlLocale(locale: Locale): string {
  return INTL_LOCALE_MAP[locale] ?? locale;
}
