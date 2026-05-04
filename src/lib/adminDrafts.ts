import { ACTIVE_LOCALES, type ActiveLocaleCode } from "@/src/i18n";

export function cloneDraft<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function isSameDraft(a: unknown, b: unknown) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

export function draftKey(locale: ActiveLocaleCode, id: string) {
  return `${locale}:${id}`;
}

export function draftLocale(key: string): ActiveLocaleCode | null {
  const locale = key.split(":")[0] as ActiveLocaleCode;
  return ACTIVE_LOCALES.includes(locale) ? locale : null;
}

export function unsavedLocalesFromDrafts(drafts: Record<string, unknown>): ActiveLocaleCode[] {
  const locales = Object.keys(drafts)
    .map(draftLocale)
    .filter(Boolean) as ActiveLocaleCode[];

  return ACTIVE_LOCALES.filter((locale) => locales.includes(locale));
}
