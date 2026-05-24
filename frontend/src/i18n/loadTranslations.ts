import type { Locale } from "./languages";
import type { TranslationDictionary } from "./utils";
import de from "./translations/de.json";
import en from "./translations/en.json";
import es from "./translations/es.json";
import fa from "./translations/fa.json";
import fr from "./translations/fr.json";
import hi from "./translations/hi.json";
import id from "./translations/id.json";
import it from "./translations/it.json";
import ja from "./translations/ja.json";
import ko from "./translations/ko.json";
import pt from "./translations/pt.json";
import ru from "./translations/ru.json";
import tr from "./translations/tr.json";
import zh from "./translations/zh.json";

const TRANSLATIONS: Record<Locale, TranslationDictionary> = {
  tr: tr as TranslationDictionary,
  en: en as TranslationDictionary,
  de: de as TranslationDictionary,
  zh: zh as TranslationDictionary,
  es: es as TranslationDictionary,
  hi: hi as TranslationDictionary,
  pt: pt as TranslationDictionary,
  ru: ru as TranslationDictionary,
  ja: ja as TranslationDictionary,
  ko: ko as TranslationDictionary,
  id: id as TranslationDictionary,
  fr: fr as TranslationDictionary,
  it: it as TranslationDictionary,
  fa: fa as TranslationDictionary,
};

export function getTranslations(locale: Locale): TranslationDictionary {
  return TRANSLATIONS[locale] ?? TRANSLATIONS.tr;
}
