import { getActiveLocale, t, type LocaleCode } from "../i18n";
import type { AboutProductionItem } from "../types/page";

const defaultImages = [
    "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
];

export const ABOUT_PRODUCTION_ITEM_COUNT = 4;

export function getDefaultAboutProductionItems(locale: LocaleCode = "en"): AboutProductionItem[] {
    const activeLocale = getActiveLocale(locale);

    return Array.from({ length: ABOUT_PRODUCTION_ITEM_COUNT }, (_, index) => {
        const step = index + 1;
        return {
            image: defaultImages[index],
            title: t(activeLocale, `prodStep${step}Title` as any),
            subtitle: t(activeLocale, `prodStep${step}Subtitle` as any),
            description: t(activeLocale, `prodStep${step}Desc` as any),
        };
    });
}

export function normalizeAboutProductionItems(
    items: AboutProductionItem[] | undefined,
    locale: LocaleCode = "en",
): AboutProductionItem[] {
    const defaults = getDefaultAboutProductionItems(locale);
    const sourceItems = Array.isArray(items) ? items : [];

    return defaults.map((fallback, index) => {
        const item = sourceItems[index];
        if (!item || typeof item !== "object") {
            return fallback;
        }

        return {
            image: item.image?.trim() || fallback.image,
            title: item.title?.trim() || fallback.title,
            subtitle: item.subtitle?.trim() || fallback.subtitle,
            description: item.description?.trim() || fallback.description,
        };
    });
}
