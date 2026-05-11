import { t as translate, type LocaleCode, type TranslationKey } from "@/src/i18n";
import type { HomeExportMarketItem, SupplyRoute } from "@/src/types/page";

type Translate = (key: TranslationKey) => string;

type BuyerChannelId = "retail" | "wholesale" | "foodIndustry" | "privateLabel";

interface BuyerChannelText {
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  codes: string[];
  names: string[];
  defaultDescription: string;
  statLabel: string;
  statValue: string;
  image: string;
}

const buyerChannelText: Record<BuyerChannelId, BuyerChannelText> = {
  retail: {
    labelKey: "exportRouteRetailName",
    descriptionKey: "exportRouteRetailDesc",
    codes: ["RTL"],
    names: ["retail"],
    defaultDescription: "Shelf-ready dried fruit lines for pouch, tray, and branded pack programs.",
    statLabel: "Channel Fit",
    statValue: "Shelf-ready",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1600&auto=format&fit=crop",
  },
  wholesale: {
    labelKey: "exportRouteWholesaleName",
    descriptionKey: "exportRouteWholesaleDesc",
    codes: ["WHL"],
    names: ["wholesale"],
    defaultDescription: "Carton-based supply for importers, distributors, and trading programs.",
    statLabel: "Format",
    statValue: "Cartons",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop",
  },
  foodIndustry: {
    labelKey: "exportRouteFoodIndustryName",
    descriptionKey: "exportRouteFoodIndustryDesc",
    codes: ["IND"],
    names: ["food industry"],
    defaultDescription: "Ingredient-ready fruit and peanut lines for bakeries, confectionery, snacks, cereals, and processing.",
    statLabel: "Use Case",
    statValue: "Ingredients",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1600&auto=format&fit=crop",
  },
  privateLabel: {
    labelKey: "exportRoutePrivateLabelName",
    descriptionKey: "exportRoutePrivateLabelDesc",
    codes: ["PL"],
    names: ["private label"],
    defaultDescription: "Buyer-brand packing discussions with label, carton, and repeat-order consistency in mind.",
    statLabel: "Branding",
    statValue: "Buyer label",
    image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1600&auto=format&fit=crop",
  },
};

export const BUYER_CHANNEL_IDS: BuyerChannelId[] = ["retail", "wholesale", "foodIndustry", "privateLabel"];

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

function getBuyerChannelIdByIndex(index: number) {
  return BUYER_CHANNEL_IDS[index] || BUYER_CHANNEL_IDS[0];
}

function getChannelCode(id: BuyerChannelId) {
  return buyerChannelText[id].codes[0];
}

function getChannelName(id: BuyerChannelId, locale: LocaleCode) {
  return translate(locale, buyerChannelText[id].labelKey);
}

function getChannelDescription(id: BuyerChannelId, locale: LocaleCode) {
  return translate(locale, buyerChannelText[id].descriptionKey);
}

function isKnownChannelName(value: string | undefined, id: BuyerChannelId) {
  const normalized = normalize(value);
  if (!normalized) return true;

  return BUYER_CHANNEL_IDS.some((candidateId) => (
    candidateId === id &&
    (buyerChannelText[candidateId].names.includes(normalized) ||
      normalize(buyerChannelText[candidateId].defaultDescription) === normalized ||
      normalize(translate("en", buyerChannelText[candidateId].labelKey)) === normalized)
  ));
}

function isKnownChannelDescription(value: string | undefined, id: BuyerChannelId) {
  const normalized = normalize(value);
  if (!normalized) return true;

  return normalize(buyerChannelText[id].defaultDescription) === normalized ||
    BUYER_CHANNEL_IDS.some((candidateId) => normalize(translate("en", buyerChannelText[candidateId].descriptionKey)) === normalized);
}

function isKnownStatValue(value: string | undefined, key: "statLabel" | "statValue") {
  const normalized = normalize(value);
  if (!normalized) return true;
  return BUYER_CHANNEL_IDS.some((id) => normalize(buyerChannelText[id][key]) === normalized);
}

function getSupplyRouteDefaults(locale: LocaleCode): SupplyRoute[] {
  return BUYER_CHANNEL_IDS.map((id) => ({
    countryName: getChannelName(id, locale),
    mapCoordinatesId: getChannelCode(id),
    tooltipDescription: getChannelDescription(id, locale),
    image: buyerChannelText[id].image,
  }));
}

function getHomeMarketDefaults(locale: LocaleCode): HomeExportMarketItem[] {
  return BUYER_CHANNEL_IDS.map((id) => ({
    countryName: getChannelName(id, locale),
    shortDescription: getChannelDescription(id, locale),
    statLabel: buyerChannelText[id].statLabel,
    statValue: buyerChannelText[id].statValue,
    image: buyerChannelText[id].image,
  }));
}

export function getDefaultBuyerChannelRoutes(locale: LocaleCode = "en") {
  return getSupplyRouteDefaults(locale);
}

export function getDefaultHomeBuyerChannels(locale: LocaleCode = "en") {
  return getHomeMarketDefaults(locale);
}

export function normalizeSupplyRoutes(items: SupplyRoute[] | undefined, locale: LocaleCode = "en"): SupplyRoute[] {
  const defaults = getSupplyRouteDefaults(locale);
  const sourceItems = Array.isArray(items) ? items : [];
  const byCode = new Map(sourceItems.map((item) => [normalize(item.mapCoordinatesId).toUpperCase(), item]));
  const byName = new Map(sourceItems.map((item) => [normalize(item.countryName), item]));

  return defaults.map((fallback, index) => {
    const id = getBuyerChannelId(fallback.countryName, fallback.mapCoordinatesId) || getBuyerChannelIdByIndex(index);
    const source = (
      byCode.get(getChannelCode(id)) ||
      byName.get(normalize(buyerChannelText[id].names[0])) ||
      sourceItems[index] ||
      {}
    ) as Partial<SupplyRoute>;

    return {
      countryName: isKnownChannelName(source.countryName, id) ? fallback.countryName : source.countryName?.trim() || fallback.countryName,
      mapCoordinatesId: source.mapCoordinatesId?.trim() || fallback.mapCoordinatesId,
      tooltipDescription: isKnownChannelDescription(source.tooltipDescription, id) ? fallback.tooltipDescription : source.tooltipDescription?.trim() || fallback.tooltipDescription,
      image: source.image?.trim() || fallback.image,
    };
  });
}

export function normalizeHomeBuyerChannels(
  homeItems: HomeExportMarketItem[] | undefined,
  locale: LocaleCode = "en",
  exportRoutes?: SupplyRoute[],
): HomeExportMarketItem[] {
  const routeFallbacks = normalizeSupplyRoutes(exportRoutes, locale);
  const defaults = getHomeMarketDefaults(locale).map((item, index) => ({
    ...item,
    countryName: routeFallbacks[index]?.countryName || item.countryName,
    shortDescription: routeFallbacks[index]?.tooltipDescription || item.shortDescription,
    image: routeFallbacks[index]?.image || item.image,
  }));
  const sourceItems = Array.isArray(homeItems) ? homeItems : [];
  const byName = new Map(sourceItems.map((item) => [normalize(item.countryName), item]));

  return defaults.map((fallback, index) => {
    const id = getBuyerChannelId(fallback.countryName, routeFallbacks[index]?.mapCoordinatesId) || getBuyerChannelIdByIndex(index);
    const source = (
      byName.get(normalize(buyerChannelText[id].names[0])) ||
      byName.get(normalize(fallback.countryName)) ||
      sourceItems[index] ||
      {}
    ) as Partial<HomeExportMarketItem>;

    return {
      countryName: isKnownChannelName(source.countryName, id) ? fallback.countryName : source.countryName?.trim() || fallback.countryName,
      shortDescription: isKnownChannelDescription(source.shortDescription, id) ? fallback.shortDescription : source.shortDescription?.trim() || fallback.shortDescription,
      statLabel: isKnownStatValue(source.statLabel, "statLabel") ? fallback.statLabel : source.statLabel?.trim() || fallback.statLabel,
      statValue: isKnownStatValue(source.statValue, "statValue") ? fallback.statValue : source.statValue?.trim() || fallback.statValue,
      image: source.image?.trim() || fallback.image,
    };
  });
}

export function homeBuyerChannelToSupplyRoute(item: HomeExportMarketItem, index: number, locale: LocaleCode = "en"): SupplyRoute {
  const defaults = getSupplyRouteDefaults(locale);
  const id = getBuyerChannelId(item.countryName, undefined) || getBuyerChannelIdByIndex(index);
  return {
    countryName: item.countryName || defaults[index]?.countryName || getChannelName(id, locale),
    mapCoordinatesId: getChannelCode(id),
    tooltipDescription: item.shortDescription || defaults[index]?.tooltipDescription || getChannelDescription(id, locale),
    image: item.image || defaults[index]?.image || buyerChannelText[id].image,
  };
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
