import type { AboutTrustItem, GlobalUILabels } from "@/src/types/page";

export const ABOUT_TRUST_ITEM_KEYS = ["fda", "haccp", "iso", "organic", "globalgap"] as const;

export function getDefaultAboutTrustItems(uiLabels: Partial<GlobalUILabels> = {}): AboutTrustItem[] {
    return [
        { key: "fda", label: uiLabels.fdaLabel || "FDA Registered", visible: true },
        { key: "haccp", label: uiLabels.haccpLabel || "HACCP Certified", visible: true },
        { key: "iso", label: uiLabels.isoLabel || "ISO 9001:2015", visible: true },
        { key: "organic", label: uiLabels.organicLabel || "100% Organic", visible: true },
        { key: "globalgap", label: uiLabels.globalGapLabel || "GlobalGAP", visible: true },
    ];
}

export function normalizeAboutTrustItems(
    items: AboutTrustItem[] | undefined,
    uiLabels: Partial<GlobalUILabels> = {},
): AboutTrustItem[] {
    const defaults = getDefaultAboutTrustItems(uiLabels);
    const byKey = new Map((items || []).map((item) => [item.key, item]));

    return defaults.map((fallback) => {
        const item = byKey.get(fallback.key);
        if (!item) {
            return fallback;
        }

        return {
            key: fallback.key,
            label: Object.prototype.hasOwnProperty.call(item, "label") ? item.label : fallback.label,
            visible: item.visible !== false,
        };
    });
}
