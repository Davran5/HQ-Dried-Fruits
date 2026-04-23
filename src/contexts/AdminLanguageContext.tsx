import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Language, languageNames, languageFull } from "../i18n";

interface AdminLanguageContextValue {
  editingLang: Language;
  setEditingLang: (lang: Language) => void;
}

const AdminLanguageContext = createContext<AdminLanguageContextValue | undefined>(undefined);

const SUPPORTED_EDIT_LANGUAGES: Language[] = ["en", "ru", "uz"];
const STORAGE_KEY = "hq_admin_edit_lang";

function getSavedAdminLang(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && SUPPORTED_EDIT_LANGUAGES.includes(saved)) return saved;
  } catch {}
  return "en";
}

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [editingLang, setEditingLangState] = useState<Language>(getSavedAdminLang);

  const setEditingLang = useCallback((lang: Language) => {
    setEditingLangState(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  }, []);

  return (
    <AdminLanguageContext.Provider value={{ editingLang, setEditingLang }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const ctx = useContext(AdminLanguageContext);
  if (!ctx) throw new Error("useAdminLanguage must be used within AdminLanguageProvider");
  return ctx;
}

export { SUPPORTED_EDIT_LANGUAGES, languageNames, languageFull };
export type { Language };
