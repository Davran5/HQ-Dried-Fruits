import { en, TranslationKey } from "./en";
import { ru } from "./ru";
import { uz } from "./uz";

export type Language = "en" | "ru" | "uz";

export const translations: Record<Language, typeof en> = { en, ru, uz };

export const languageNames: Record<Language, string> = {
  en: "EN",
  ru: "RU",
  uz: "UZ",
};

export const languageFull: Record<Language, string> = {
  en: "English",
  ru: "Русский",
  uz: "O'zbekcha",
};

/**
 * Detect the preferred language from the browser.
 * Maps browser locale codes to our supported languages.
 * Falls back to "en" if the browser language is not supported.
 */
export function detectBrowserLanguage(): Language {
  try {
    const saved = localStorage.getItem("hq-lang") as Language | null;
    if (saved && saved in translations) return saved;
  } catch {
    // localStorage may be blocked
  }

  const browserLang = navigator.language?.toLowerCase() ?? "";

  if (browserLang.startsWith("ru")) return "ru";
  if (browserLang.startsWith("uz")) return "uz";

  // Also check navigator.languages for secondary preferences
  const languages = navigator.languages ?? [];
  for (const lang of languages) {
    const l = lang.toLowerCase();
    if (l.startsWith("ru")) return "ru";
    if (l.startsWith("uz")) return "uz";
  }

  return "en";
}

export function saveLanguagePreference(lang: Language) {
  try {
    localStorage.setItem("hq-lang", lang);
  } catch {
    // localStorage may be blocked
  }
}

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key] ?? translations["en"][key] ?? key;
}

export { type TranslationKey };
