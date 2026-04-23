import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  ACTIVE_LOCALES,
  type ActiveLocaleCode,
  localeNames as localeShortNames,
  localeFullNames,
} from "../i18n";

interface AdminLanguageContextValue {
  editingLocale: ActiveLocaleCode;
  editingLang: ActiveLocaleCode;
  setEditingLocale: (locale: ActiveLocaleCode) => void;
  setEditingLang: (locale: ActiveLocaleCode) => void;
}

const AdminLanguageContext = createContext<AdminLanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "hq_admin_edit_locale";
const LEGACY_STORAGE_KEY = "hq_admin_edit_lang";

export const SUPPORTED_EDIT_LANGUAGES = [...ACTIVE_LOCALES];

function isEditableLocale(value: string | null | undefined): value is ActiveLocaleCode {
  return Boolean(value && SUPPORTED_EDIT_LANGUAGES.includes(value as ActiveLocaleCode));
}

function getSavedAdminLocale(): ActiveLocaleCode {
  try {
    const savedLocale = localStorage.getItem(STORAGE_KEY);
    if (isEditableLocale(savedLocale)) {
      return savedLocale;
    }

    const legacyLocale = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (isEditableLocale(legacyLocale)) {
      return legacyLocale;
    }
  } catch {}

  return "en";
}

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [editingLocale, setEditingLocaleState] = useState<ActiveLocaleCode>(getSavedAdminLocale);

  const setEditingLocale = useCallback((locale: ActiveLocaleCode) => {
    setEditingLocaleState(locale);
    try {
      localStorage.setItem(STORAGE_KEY, locale);
      localStorage.setItem(LEGACY_STORAGE_KEY, locale);
    } catch {}
  }, []);

  return (
    <AdminLanguageContext.Provider
      value={{
        editingLocale,
        editingLang: editingLocale,
        setEditingLocale,
        setEditingLang: setEditingLocale,
      }}
    >
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const ctx = useContext(AdminLanguageContext);
  if (!ctx) throw new Error("useAdminLanguage must be used within AdminLanguageProvider");
  return ctx;
}

export const languageNames = localeShortNames;
export const languageFull = localeFullNames;
export type Language = ActiveLocaleCode;
