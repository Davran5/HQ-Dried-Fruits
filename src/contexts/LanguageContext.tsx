import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  type ActiveLocaleCode,
  type LocaleCode,
  type TranslationKey,
  detectPreferredLocale,
  getActiveLocale,
  saveLocalePreference,
  t as lookupT,
} from "../i18n";
import { buildLocalePath, normalizePath, parseLocalePath } from "../lib/routes";

interface LanguageContextValue {
  locale: ActiveLocaleCode;
  language: ActiveLocaleCode;
  isLocaleRouted: boolean;
  setLocale: (locale: LocaleCode) => void;
  setLanguage: (locale: LocaleCode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getNextLocalePath(pathname: string, locale: LocaleCode) {
  const normalizedPath = normalizePath(pathname);
  const activeLocale = getActiveLocale(locale);

  if (normalizedPath === "/") {
    return buildLocalePath(activeLocale);
  }

  const parsed = parseLocalePath(normalizedPath);
  if (parsed.isLocalePrefixed) {
    return buildLocalePath(activeLocale, parsed.pathname);
  }

  if (normalizedPath === "/control-room" || normalizedPath.startsWith("/control-room/")) {
    return normalizedPath;
  }

  return buildLocalePath(activeLocale, normalizedPath);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [preferredLocale, setPreferredLocale] = useState<ActiveLocaleCode>(() => detectPreferredLocale());
  const parsedPath = useMemo(() => parseLocalePath(location.pathname), [location.pathname]);
  const locale = parsedPath.locale ?? preferredLocale;

  useEffect(() => {
    if (!parsedPath.locale) {
      return;
    }

    setPreferredLocale((current) => (current === parsedPath.locale ? current : parsedPath.locale));
    saveLocalePreference(parsedPath.locale);
  }, [parsedPath.locale]);

  const setLocale = useCallback(
    (nextLocale: LocaleCode) => {
      const activeLocale = getActiveLocale(nextLocale);
      const nextPath = getNextLocalePath(location.pathname, activeLocale);

      setPreferredLocale(activeLocale);
      saveLocalePreference(activeLocale);

      if (nextPath !== normalizePath(location.pathname)) {
        navigate(`${nextPath}${location.search}${location.hash}`);
      }
    },
    [location.hash, location.pathname, location.search, navigate],
  );

  const t = useCallback((key: TranslationKey) => lookupT(locale, key), [locale]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        language: locale,
        isLocaleRouted: parsedPath.isLocalePrefixed,
        setLocale,
        setLanguage: setLocale,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
