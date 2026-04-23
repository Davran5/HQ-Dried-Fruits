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

/**
 * Map canonical URL patterns to translation keys.
 * This allows nav items to automatically translate when language changes,
 * even if the admin set custom English labels.
 */
export const NAV_URL_TRANSLATION_MAP: Record<string, TranslationKey> = {
  "/": "navHome",
  "/about": "navAbout",
  "/products": "navProducts",
  "/export": "navExport",
  "/contacts": "navContacts",
};

/**
 * Utility to resolve a navigation label.
 * Prioritizes translations for core pages unless the admin has provided a custom label.
 */
export function getNavLabel(url: string, adminLabel: string, t: (key: TranslationKey) => string): string {
  // Strip trailing slash for matching
  const normalizedUrl = url.replace(/\/$/, "") || "/";
  const key = NAV_URL_TRANSLATION_MAP[normalizedUrl];
  
  // If we have a translation key for this URL, use the translated version.
  // Otherwise, fallback to the admin-provided label.
  if (key) return t(key);
  return adminLabel;
}

export { type TranslationKey };
