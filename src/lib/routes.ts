import { getActiveLocale, isActiveLocale, type ActiveLocaleCode, type LocaleCode } from "@/src/i18n";
import { SEOData, Product } from "@/src/types/product";

export type ManagedPageId = "home" | "about" | "products" | "export" | "contacts" | "privacy" | "terms";

export const defaultPageSlugs: Record<ManagedPageId, string> = {
  home: "",
  about: "about",
  products: "products",
  export: "export",
  contacts: "contacts",
  privacy: "privacy",
  terms: "terms",
};

const staticPageIds: ManagedPageId[] = ["home", "about", "products", "export", "contacts", "privacy", "terms"];
const bypassedPrefixes = ["/api", "/uploads", "/assets", "/control-room"];

export interface ParsedLocalePath {
  locale: ActiveLocaleCode | null;
  pathname: string;
  isLocalePrefixed: boolean;
}

export function normalizeSlug(value: string, fallback = "") {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

export function normalizePath(pathname: string) {
  const trimmed = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function buildLocalePath(locale: LocaleCode, pathname = "/") {
  const normalized = normalizePath(pathname);
  const activeLocale = getActiveLocale(locale);
  return normalized === "/" ? `/${activeLocale}` : `/${activeLocale}${normalized}`;
}

export function parseLocalePath(pathname: string): ParsedLocalePath {
  const normalizedPath = normalizePath(pathname);
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return {
      locale: null,
      pathname: "/",
      isLocalePrefixed: false,
    };
  }

  const [candidateLocale, ...rest] = segments;

  if (!isActiveLocale(candidateLocale)) {
    return {
      locale: null,
      pathname: normalizedPath,
      isLocalePrefixed: false,
    };
  }

  return {
    locale: candidateLocale,
    pathname: rest.length > 0 ? `/${rest.join("/")}` : "/",
    isLocalePrefixed: true,
  };
}

export function getManagedPageSlug(pageId: ManagedPageId, pageSeo?: Record<string, SEOData>) {
  if (pageId === "home") {
    return "";
  }

  return normalizeSlug(pageSeo?.[pageId]?.slug || "", defaultPageSlugs[pageId]);
}

function getUnlocalizedManagedPagePath(pageId: ManagedPageId, pageSeo?: Record<string, SEOData>) {
  const slug = getManagedPageSlug(pageId, pageSeo);
  return slug ? `/${slug}` : "/";
}

export function getManagedPagePath(pageId: ManagedPageId, pageSeo?: Record<string, SEOData>, locale: LocaleCode = "en") {
  return buildLocalePath(locale, getUnlocalizedManagedPagePath(pageId, pageSeo));
}

export function getManagedProductSlug(product: Product) {
  return normalizeSlug(product.id, product.id);
}

export function getManagedProductPath(product: Product, pageSeo?: Record<string, SEOData>, locale: LocaleCode = "en") {
  const sectionPath = getUnlocalizedManagedPagePath("products", pageSeo);
  return buildLocalePath(locale, `${sectionPath}/${getManagedProductSlug(product)}`);
}

export function getManagedProductAnchorPath(product: Product, pageSeo?: Record<string, SEOData>, locale: LocaleCode = "en") {
  return getManagedProductPath(product, pageSeo, locale);
}

export function isExternalUrl(url: string) {
  return /^(https?:\/\/|mailto:|tel:|#)/i.test(url);
}

function isBypassedInternalPath(pathname: string) {
  return bypassedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function splitSuffix(url: string) {
  const match = url.match(/^([^?#]*)(.*)$/);
  return {
    path: match?.[1] || url,
    suffix: match?.[2] || "",
  };
}

export function resolveStaticPageByPath(
  pathname: string,
  pageSeo?: Record<string, SEOData>,
  fallbackLocale: ActiveLocaleCode = "en",
) {
  const parsed = parseLocalePath(pathname);
  const normalizedPath = parsed.pathname;
  const locale = parsed.locale ?? fallbackLocale;

  for (const pageId of staticPageIds) {
    const canonicalLocalPath = getUnlocalizedManagedPagePath(pageId, pageSeo);
    const legacyLocalPath = getUnlocalizedManagedPagePath(pageId);

    if (normalizedPath === canonicalLocalPath || normalizedPath === legacyLocalPath) {
      return {
        locale,
        pageId,
        canonicalPath: getManagedPagePath(pageId, pageSeo, locale),
        isLocalePrefixed: parsed.isLocalePrefixed,
      };
    }
  }

  return null;
}

export function resolveManagedProductPath(
  pathname: string,
  pageSeo?: Record<string, SEOData>,
  fallbackLocale: ActiveLocaleCode = "en",
) {
  const parsed = parseLocalePath(pathname);
  const segments = parsed.pathname.split("/").filter(Boolean);
  const locale = parsed.locale ?? fallbackLocale;

  if (segments.length !== 2) {
    return null;
  }

  const [sectionSlug, productSlug] = segments;
  const currentSectionSlug = getManagedPageSlug("products", pageSeo);
  const legacySectionSlug = getManagedPageSlug("products");

  if (sectionSlug === currentSectionSlug || sectionSlug === legacySectionSlug) {
    return {
      locale,
      productSlug,
      canonicalPath: buildLocalePath(locale, `/${currentSectionSlug}/${productSlug}`),
      isLocalePrefixed: parsed.isLocalePrefixed,
    };
  }

  return null;
}

export function findManagedProduct(identifier: string, products?: Product[]) {
  if (!products?.length) {
    return null;
  }

  const normalizedIdentifier = normalizeSlug(identifier, identifier);
  return (
    products.find((product) => {
      const managedSlug = getManagedProductSlug(product);
      const normalizedId = normalizeSlug(product.id, product.id);
      return managedSlug === normalizedIdentifier || normalizedId === normalizedIdentifier || product.id === identifier;
    }) || null
  );
}

export function switchLocalePath(
  pathname: string,
  locale: LocaleCode,
  pageSeo?: Record<string, SEOData>,
  products?: Product[],
) {
  const targetLocale = getActiveLocale(locale);
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === "/") {
    return getManagedPagePath("home", pageSeo, targetLocale);
  }

  if (isBypassedInternalPath(normalizedPath)) {
    return normalizedPath;
  }

  const staticMatch = resolveStaticPageByPath(normalizedPath, pageSeo);
  if (staticMatch) {
    return getManagedPagePath(staticMatch.pageId, pageSeo, targetLocale);
  }

  const productMatch = resolveManagedProductPath(normalizedPath, pageSeo);
  if (productMatch) {
    const managedProduct = findManagedProduct(productMatch.productSlug, products);
    if (managedProduct) {
      return getManagedProductPath(managedProduct, pageSeo, targetLocale);
    }

    const sectionSlug = getManagedPageSlug("products", pageSeo);
    return buildLocalePath(targetLocale, `/${sectionSlug}/${productMatch.productSlug}`);
  }

  const parsed = parseLocalePath(normalizedPath);
  return parsed.isLocalePrefixed ? buildLocalePath(targetLocale, parsed.pathname) : buildLocalePath(targetLocale, normalizedPath);
}

export function canonicalizeManagedUrl(
  url: string,
  pageSeo?: Record<string, SEOData>,
  products?: Product[],
  locale: LocaleCode = "en",
) {
  if (!url || isExternalUrl(url) || !url.startsWith("/")) {
    return url;
  }

  const { path, suffix } = splitSuffix(url);
  const normalizedPath = normalizePath(path);

  if (isBypassedInternalPath(normalizedPath)) {
    return `${normalizedPath}${suffix}`;
  }

  const parsed = parseLocalePath(normalizedPath);
  const fallbackLocale = parsed.locale ?? getActiveLocale(locale);
  const staticMatch = resolveStaticPageByPath(normalizedPath, pageSeo, fallbackLocale);
  if (staticMatch) {
    return `${getManagedPagePath(staticMatch.pageId, pageSeo, staticMatch.locale)}${suffix}`;
  }

  const productMatch = resolveManagedProductPath(normalizedPath, pageSeo, fallbackLocale);
  if (productMatch) {
    const managedProduct = findManagedProduct(productMatch.productSlug, products);
    if (managedProduct) {
      return `${getManagedProductPath(managedProduct, pageSeo, productMatch.locale)}${suffix}`;
    }
    return `${productMatch.canonicalPath}${suffix}`;
  }

  return `${normalizedPath}${suffix}`;
}

export function pathsMatch(
  candidateUrl: string,
  pathname: string,
  pageSeo?: Record<string, SEOData>,
  products?: Product[],
  locale: LocaleCode = "en",
) {
  return canonicalizeManagedUrl(candidateUrl, pageSeo, products, locale) === canonicalizeManagedUrl(pathname, pageSeo, products, locale);
}
