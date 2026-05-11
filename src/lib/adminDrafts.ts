import { ACTIVE_LOCALES, type ActiveLocaleCode } from "@/src/i18n";

export function cloneDraft<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function isSameDraft(a: unknown, b: unknown) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function changedDraftPaths(base: unknown, next: unknown, prefix = ""): string[] {
  if (isSameDraft(base, next)) {
    return [];
  }

  if (Array.isArray(base) || Array.isArray(next)) {
    const baseItems = Array.isArray(base) ? base : [];
    const nextItems = Array.isArray(next) ? next : [];
    if (baseItems.length !== nextItems.length) {
      return prefix ? [prefix] : [];
    }

    const paths = baseItems.flatMap((item, index) =>
      changedDraftPaths(item, nextItems[index], prefix ? `${prefix}.${index}` : `${index}`),
    );

    return paths.length > 0 ? paths : [];
  }

  if (isPlainObject(base) || isPlainObject(next)) {
    const baseObject = isPlainObject(base) ? base : {};
    const nextObject = isPlainObject(next) ? next : {};
    const keys = new Set([...Object.keys(baseObject), ...Object.keys(nextObject)]);
    const paths: string[] = [];

    keys.forEach((key) => {
      paths.push(...changedDraftPaths(baseObject[key], nextObject[key], prefix ? `${prefix}.${key}` : key));
    });

    return paths.length > 0 ? paths : [prefix];
  }

  return prefix ? [prefix] : [];
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
