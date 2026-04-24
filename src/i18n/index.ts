import { en, TranslationKey } from "./en";
import { ru } from "./ru";
import { uz } from "./uz";

export type LocaleCode = "en" | "ru" | "uz" | "de" | "fr" | "fr-be" | "nl-be" | "de-be";
export type TranslationLocale = "en" | "ru" | "uz";

export interface LocaleDefinition {
  code: LocaleCode;
  label: string;
  shortLabel: string;
  baseLanguage: string;
  region?: string;
  fallbackLocale: LocaleCode;
  isActive: boolean;
}

export const DEFAULT_LOCALE: LocaleCode = "en";
export const ACTIVE_LOCALES = ["en", "ru", "uz"] as const;
export type ActiveLocaleCode = (typeof ACTIVE_LOCALES)[number];

export const translations: Record<TranslationLocale, typeof en> = { en, ru, uz };

export const localeRegistry: Record<LocaleCode, LocaleDefinition> = {
  en: {
    code: "en",
    label: "English",
    shortLabel: "EN",
    baseLanguage: "en",
    fallbackLocale: "en",
    isActive: true,
  },
  ru: {
    code: "ru",
    label: "Русский",
    shortLabel: "RU",
    baseLanguage: "ru",
    fallbackLocale: "en",
    isActive: true,
  },
  uz: {
    code: "uz",
    label: "O'zbekcha",
    shortLabel: "UZ",
    baseLanguage: "uz",
    fallbackLocale: "en",
    isActive: true,
  },
  de: {
    code: "de",
    label: "Deutsch",
    shortLabel: "DE",
    baseLanguage: "de",
    fallbackLocale: "en",
    isActive: false,
  },
  fr: {
    code: "fr",
    label: "Français",
    shortLabel: "FR",
    baseLanguage: "fr",
    fallbackLocale: "en",
    isActive: false,
  },
  "fr-be": {
    code: "fr-be",
    label: "Français (Belgique)",
    shortLabel: "FR-BE",
    baseLanguage: "fr",
    region: "BE",
    fallbackLocale: "fr",
    isActive: false,
  },
  "nl-be": {
    code: "nl-be",
    label: "Nederlands (België)",
    shortLabel: "NL-BE",
    baseLanguage: "nl",
    region: "BE",
    fallbackLocale: "en",
    isActive: false,
  },
  "de-be": {
    code: "de-be",
    label: "Deutsch (Belgien)",
    shortLabel: "DE-BE",
    baseLanguage: "de",
    region: "BE",
    fallbackLocale: "de",
    isActive: false,
  },
};

export const activeLocaleDefinitions = ACTIVE_LOCALES.map((locale) => localeRegistry[locale]);

export const localeNames: Record<LocaleCode, string> = Object.fromEntries(
  Object.values(localeRegistry).map((definition) => [definition.code, definition.shortLabel]),
) as Record<LocaleCode, string>;

export const localeFullNames: Record<LocaleCode, string> = Object.fromEntries(
  Object.values(localeRegistry).map((definition) => [definition.code, definition.label]),
) as Record<LocaleCode, string>;

export const languageNames = localeNames;
export const languageFull = localeFullNames;
export type Language = ActiveLocaleCode;

export function isSupportedLocale(value: string | null | undefined): value is LocaleCode {
  return Boolean(value && value in localeRegistry);
}

export function isActiveLocale(value: string | null | undefined): value is ActiveLocaleCode {
  return Boolean(value && isSupportedLocale(value) && localeRegistry[value].isActive);
}

export function getActiveLocale(locale: string | null | undefined, fallback: ActiveLocaleCode = "en"): ActiveLocaleCode {
  return isActiveLocale(locale) ? locale : fallback;
}

export function getTranslationLocale(locale: LocaleCode): TranslationLocale {
  if (locale in translations) {
    return locale as TranslationLocale;
  }

  const fallbackLocale = localeRegistry[locale]?.fallbackLocale;
  if (fallbackLocale && fallbackLocale in translations) {
    return fallbackLocale as TranslationLocale;
  }

  return "en";
}

export function normalizeLocaleCode(value: string | null | undefined): string {
  return (value || "").trim().toLowerCase();
}

function parseSavedLocale(raw: string | null): ActiveLocaleCode | null {
  if (!raw) {
    return null;
  }

  const normalized = normalizeLocaleCode(raw);
  return isActiveLocale(normalized) ? normalized : null;
}

function matchPreferredLocale(candidates: string[]): ActiveLocaleCode {
  for (const candidate of candidates) {
    const normalized = normalizeLocaleCode(candidate);
    if (isActiveLocale(normalized)) {
      return normalized;
    }

    const languageOnly = normalized.split("-")[0];
    if (isActiveLocale(languageOnly)) {
      return languageOnly;
    }
  }

  return "en";
}

export function detectPreferredLocale(): ActiveLocaleCode {
  if (typeof window === "undefined") {
    return "en";
  }

  try {
    const savedLocale = parseSavedLocale(localStorage.getItem("hq-locale"));
    if (savedLocale) {
      return savedLocale;
    }

    const legacyLanguage = parseSavedLocale(localStorage.getItem("hq-lang"));
    if (legacyLanguage) {
      return legacyLanguage;
    }
  } catch {
    // localStorage may be blocked
  }

  const browserCandidates = [navigator.language, ...(navigator.languages ?? [])].filter(Boolean);
  return matchPreferredLocale(browserCandidates);
}

export function detectDeviceLocale(): ActiveLocaleCode {
  if (typeof window === "undefined") {
    return "en";
  }

  const browserCandidates = [navigator.language, ...(navigator.languages ?? [])].filter(Boolean);
  return matchPreferredLocale(browserCandidates);
}

export function saveLocalePreference(locale: LocaleCode) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("hq-locale", locale);
    localStorage.setItem("hq-lang", locale);
  } catch {
    // localStorage may be blocked
  }
}

export function t(locale: LocaleCode, key: TranslationKey): string {
  const translationLocale = getTranslationLocale(locale);
  return translations[translationLocale][key] ?? translations.en[key] ?? key;
}

export function stripKnownLocalePrefix(pathname: string): string {
  const cleanPath = pathname.split("?")[0].split("#")[0] || "/";
  const segments = cleanPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return "/";
  }

  if (!isSupportedLocale(segments[0])) {
    return cleanPath.replace(/\/+$/, "") || "/";
  }

  const withoutLocale = `/${segments.slice(1).join("/")}`.replace(/\/+$/, "");
  return withoutLocale || "/";
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
export function getNavLabel(url: string, adminLabel: string, translate: (key: TranslationKey) => string): string {
  const normalizedUrl = stripKnownLocalePrefix(url).replace(/\/$/, "") || "/";
  const key = NAV_URL_TRANSLATION_MAP[normalizedUrl];

  if (key) {
    return translate(key);
  }

  return adminLabel;
}

export { type TranslationKey };
