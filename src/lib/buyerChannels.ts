import type { TranslationKey } from "@/src/i18n";

type Translate = (key: TranslationKey) => string;

type BuyerChannelId = "retail" | "wholesale" | "foodIndustry" | "privateLabel";

interface BuyerChannelText {
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  codes: string[];
  names: string[];
  defaultDescription: string;
}

const buyerChannelText: Record<BuyerChannelId, BuyerChannelText> = {
  retail: {
    labelKey: "exportRouteRetailName",
    descriptionKey: "exportRouteRetailDesc",
    codes: ["RTL"],
    names: ["retail"],
    defaultDescription: "Shelf-ready dried fruit lines for pouch, tray, and branded pack programs.",
  },
  wholesale: {
    labelKey: "exportRouteWholesaleName",
    descriptionKey: "exportRouteWholesaleDesc",
    codes: ["WHL"],
    names: ["wholesale"],
    defaultDescription: "Carton-based supply for importers, distributors, and trading programs.",
  },
  foodIndustry: {
    labelKey: "exportRouteFoodIndustryName",
    descriptionKey: "exportRouteFoodIndustryDesc",
    codes: ["IND"],
    names: ["food industry"],
    defaultDescription: "Ingredient-ready fruit and peanut lines for bakeries, confectionery, snacks, cereals, and processing.",
  },
  privateLabel: {
    labelKey: "exportRoutePrivateLabelName",
    descriptionKey: "exportRoutePrivateLabelDesc",
    codes: ["PL"],
    names: ["private label"],
    defaultDescription: "Buyer-brand packing discussions with label, carton, and repeat-order consistency in mind.",
  },
};

function normalize(value: string | undefined) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getBuyerChannelId(countryName: string, mapCoordinatesId?: string): BuyerChannelId | null {
  const normalizedCode = (mapCoordinatesId || "").trim().toUpperCase();
  const normalizedName = normalize(countryName);

  for (const [id, text] of Object.entries(buyerChannelText) as Array<[BuyerChannelId, BuyerChannelText]>) {
    if (text.codes.includes(normalizedCode) || text.names.includes(normalizedName)) {
      return id;
    }
  }

  return null;
}

export function getBuyerChannelLabel(countryName: string, mapCoordinatesId: string | undefined, t: Translate) {
  const id = getBuyerChannelId(countryName, mapCoordinatesId);
  return id ? t(buyerChannelText[id].labelKey) : countryName;
}

export function getBuyerChannelDescription(
  countryName: string,
  mapCoordinatesId: string | undefined,
  description: string,
  t: Translate,
) {
  const id = getBuyerChannelId(countryName, mapCoordinatesId);

  if (!id) {
    return description;
  }

  const defaultDescription = buyerChannelText[id].defaultDescription;

  if (!description.trim() || normalize(description) === normalize(defaultDescription)) {
    return t(buyerChannelText[id].descriptionKey);
  }

  return description;
}
