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

export function getManagedPageSlug(pageId: ManagedPageId, pageSeo?: Record<string, SEOData>) {
    if (pageId === "home") {
        return "";
    }

    return normalizeSlug(pageSeo?.[pageId]?.slug || "", defaultPageSlugs[pageId]);
}

export function getManagedPagePath(pageId: ManagedPageId, pageSeo?: Record<string, SEOData>) {
    const slug = getManagedPageSlug(pageId, pageSeo);
    return slug ? `/${slug}` : "/";
}

export function getManagedProductSlug(product: Product) {
    return normalizeSlug(product.seo?.slug || "", normalizeSlug(product.id, product.id));
}

export function getManagedProductPath(product: Product, pageSeo?: Record<string, SEOData>) {
    return `${getManagedPagePath("products", pageSeo)}/${getManagedProductSlug(product)}`;
}

export function getManagedProductAnchorPath(product: Product, pageSeo?: Record<string, SEOData>) {
    return `${getManagedPagePath("products", pageSeo)}#${getManagedProductSlug(product)}`;
}

export function isExternalUrl(url: string) {
    return /^(https?:\/\/|mailto:|tel:|#)/i.test(url);
}

function splitSuffix(url: string) {
    const match = url.match(/^([^?#]*)(.*)$/);
    return {
        path: match?.[1] || url,
        suffix: match?.[2] || "",
    };
}

export function resolveStaticPageByPath(pathname: string, pageSeo?: Record<string, SEOData>) {
    const normalizedPath = normalizePath(pathname);

    for (const pageId of staticPageIds) {
        const canonicalPath = getManagedPagePath(pageId, pageSeo);
        const legacyPath = getManagedPagePath(pageId);

        if (normalizedPath === canonicalPath || normalizedPath === legacyPath) {
            return { pageId, canonicalPath };
        }
    }

    return null;
}

export function resolveManagedProductPath(pathname: string, pageSeo?: Record<string, SEOData>) {
    const normalizedPath = normalizePath(pathname);
    const segments = normalizedPath.split("/").filter(Boolean);

    if (segments.length !== 2) {
        return null;
    }

    const [sectionSlug, productSlug] = segments;
    const currentSectionSlug = getManagedPageSlug("products", pageSeo);
    const legacySectionSlug = getManagedPageSlug("products");

    if (sectionSlug === currentSectionSlug || sectionSlug === legacySectionSlug) {
        return {
            productSlug,
            canonicalPath: `/${currentSectionSlug}/${productSlug}`,
        };
    }

    return null;
}

function findManagedProduct(identifier: string, products?: Product[]) {
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

export function canonicalizeManagedUrl(url: string, pageSeo?: Record<string, SEOData>, products?: Product[]) {
    if (!url || isExternalUrl(url) || !url.startsWith("/")) {
        return url;
    }

    const { path, suffix } = splitSuffix(url);
    const staticMatch = resolveStaticPageByPath(path, pageSeo);
    if (staticMatch) {
        return `${staticMatch.canonicalPath}${suffix}`;
    }

    const productMatch = resolveManagedProductPath(path, pageSeo);
    if (productMatch) {
        const managedProduct = findManagedProduct(productMatch.productSlug, products);
        if (managedProduct) {
            return `${getManagedProductPath(managedProduct, pageSeo)}${suffix}`;
        }
        return `${productMatch.canonicalPath}${suffix}`;
    }

    return `${normalizePath(path)}${suffix}`;
}

export function pathsMatch(candidateUrl: string, pathname: string, pageSeo?: Record<string, SEOData>, products?: Product[]) {
    return canonicalizeManagedUrl(candidateUrl, pageSeo, products) === canonicalizeManagedUrl(pathname, pageSeo, products);
}
