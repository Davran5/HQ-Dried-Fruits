export type ProductCategoryKey = "raisins" | "dried-apricot" | "prunes" | "peanuts";
export type ProductCategoryLocale = "en" | "ru" | "uz" | "de" | "es" | "pt" | "nl" | "fr";

export interface ProductCategoryDefinition {
  key: ProductCategoryKey;
  labels: Record<ProductCategoryLocale, string>;
  aliases: string[];
}

export const PRODUCT_CATEGORY_DEFINITIONS: ProductCategoryDefinition[] = [
  {
    key: "raisins",
    labels: {
      en: "Raisins",
      ru: "Изюм",
      uz: "Mayiz",
      es: "Pasas",
      pt: "Passas",
      nl: "Rozijnen",
      de: "Rosinen",
      fr: "Raisins Secs"
    },
    aliases: ["raisins", "raisin", "sultana", "soyaki", "golden", "black-red", "изюм", "кишмиш", "майиз", "mayiz"],
  },
  {
    key: "dried-apricot",
    labels: {
      en: "Dried Apricot",
      ru: "Курага",
      uz: "Quritilgan o'rik",
      es: "Albaricoques Secos",
      pt: "Damascos Secos",
      nl: "Gedroogde Abrikozen",
      de: "Getrocknete Aprikosen",
      fr: "Abricots Secs"
    },
    aliases: ["dried apricot", "dried apricots", "apricot", "apricots", "subhana", "курага", "абрикос", "урюк", "quritilgan orik", "quritilgan o'rik", "orik", "o'rik"],
  },
  {
    key: "prunes",
    labels: {
      en: "Prunes",
      ru: "Чернослив",
      uz: "Quritilgan qora olxo'ri",
      es: "Ciruelas Pasas",
      pt: "Ameixas Secas",
      nl: "Pruimen",
      de: "Trockenpflaumen",
      fr: "Pruneaux"
    },
    aliases: ["prunes", "prune", "pitted prunes", "spain", "hungarian", "ashlock", "чернослив", "слива", "quritilgan qora olxo'ri", "qora olxo'ri", "olxori"],
  },
  {
    key: "peanuts",
    labels: {
      en: "Peanuts",
      ru: "Арахис",
      uz: "Yeryong'oq",
      es: "Cacahuetes",
      pt: "Amendoins",
      nl: "Pinda's",
      de: "Erdnüsse",
      fr: "Cacahuètes"
    },
    aliases: ["peanuts", "peanut", "in shell", "unshelled", "bird feed", "арахис", "арахисы", "yeryongoq", "yeryong'oq", "yer yongoq", "yer yong'oq"],
  },
];

export const PRODUCT_CATEGORY_KEYS = PRODUCT_CATEGORY_DEFINITIONS.map((category) => category.key);

export function isProductCategoryKey(value: string | undefined | null): value is ProductCategoryKey {
  return PRODUCT_CATEGORY_KEYS.includes(value as ProductCategoryKey);
}

export function getProductCategoryLabel(key: string | undefined | null, locale: string = "en") {
  const category = PRODUCT_CATEGORY_DEFINITIONS.find((item) => item.key === key);
  const resolvedLocale = (locale as ProductCategoryLocale) || "en";
  return category?.labels[resolvedLocale] || category?.labels.en || "";
}

export function getProductCategorySelectOptions(locale: string = "en") {
  return PRODUCT_CATEGORY_DEFINITIONS.map((category) => {
    const primaryLabel = getProductCategoryLabel(category.key, locale);
    const translationSummary = Object.entries(category.labels)
      .filter(([key]) => key !== locale)
      .map(([key, label]) => `${key.toUpperCase()}: ${label}`)
      .join(" · ");

    return {
      value: category.key,
      label: translationSummary ? `${primaryLabel} · ${translationSummary}` : primaryLabel,
    };
  });
}

export function normalizeProductCategoryText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff'\s-]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactProductCategoryText(value: string) {
  return normalizeProductCategoryText(value).replace(/[\s'-]+/g, "");
}

export function resolveProductCategoryKey(value: string | undefined | null): ProductCategoryKey | null {
  const normalized = normalizeProductCategoryText(value || "");
  const compact = compactProductCategoryText(value || "");

  if (!normalized) {
    return null;
  }

  for (const category of PRODUCT_CATEGORY_DEFINITIONS) {
    const labelMatches = Object.values(category.labels).some((label) => {
      const normalizedLabel = normalizeProductCategoryText(label);
      const compactLabel = compactProductCategoryText(label);
      return normalized.includes(normalizedLabel) || compact.includes(compactLabel);
    });

    if (labelMatches) {
      return category.key;
    }

    const aliasMatches = category.aliases.some((alias) => {
      const normalizedAlias = normalizeProductCategoryText(alias);
      const compactAlias = compactProductCategoryText(alias);
      return normalized.includes(normalizedAlias) || compact.includes(compactAlias);
    });

    if (aliasMatches) {
      return category.key;
    }
  }

  return null;
}

export function buildProductCategoryCatalogPath(basePath: string, keyOrLabel: string | undefined | null) {
  const categoryKey = isProductCategoryKey(keyOrLabel) ? keyOrLabel : resolveProductCategoryKey(keyOrLabel);
  return categoryKey ? `${basePath}?category=${encodeURIComponent(categoryKey)}` : basePath;
}
