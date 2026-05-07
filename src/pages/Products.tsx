import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Loader2, PackageCheck, RotateCcw, Sprout, SunMedium } from "lucide-react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { Button } from "@/src/components/ui/Button";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { useProducts } from "@/src/contexts/ProductContext";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { ProductsContent } from "@/src/types/page";
import { Product } from "@/src/types/product";
import { submitLead } from "@/src/lib/leads";
import { getManagedProductPath, getManagedProductSlug } from "@/src/lib/routes";
import {
  PRODUCT_CATEGORY_DEFINITIONS,
  PRODUCT_CATEGORY_KEYS,
  getProductCategoryLabel,
  isProductCategoryKey,
  resolveProductCategoryKey,
  type ProductCategoryKey,
} from "@/src/lib/productCategories";

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getProductCategoryKey(product: Product) {
  return isProductCategoryKey(product.categoryKey)
    ? product.categoryKey
    : resolveProductCategoryKey(`${product.category} ${product.name}`);
}

function getInitialCategoryKeys(search: string): ProductCategoryKey[] {
  const params = new URLSearchParams(search);
  const requestedCategory = params.get("category");
  const requestedKey = isProductCategoryKey(requestedCategory)
    ? requestedCategory
    : requestedCategory
      ? resolveProductCategoryKey(requestedCategory)
      : null;
  return requestedKey ? [requestedKey] : [...PRODUCT_CATEGORY_KEYS];
}

function getSimpleContentLabel(value: string | undefined, legacyPattern: RegExp, fallback: string) {
  const normalized = value?.trim();
  return normalized && !legacyPattern.test(normalized) ? normalized : fallback;
}

export function Products() {
  const location = useLocation();
  const { pages, pageSeo, globalSettings } = usePages();
  const { products, productsLoaded } = useProducts();
  const { locale, t } = useLanguage();
  const uiLabels = globalSettings.uiLabels || {};

  const seo = pageSeo.products;
  const springEasing = [0.25, 1, 0.5, 1];

  useSEO({
    title: seo?.metaTitle || t("productsMetaTitle"),
    description: seo?.metaDescription || t("productsMetaDesc"),
    ogTitle: seo?.ogTitle || t("productsMetaTitle"),
  });

  const [selectedCategoryKeys, setSelectedCategoryKeys] = useState<ProductCategoryKey[]>(() =>
    getInitialCategoryKeys(location.search),
  );
  const [inquiryForm, setInquiryForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const activeProducts = products.filter((product) => product.status === "Active");
  const orderedProducts = activeProducts;

  useEffect(() => {
    setSelectedCategoryKeys(getInitialCategoryKeys(location.search));
  }, [location.search]);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = location.hash.replace(/^#/, "");
    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
      return;
    }

    window.setTimeout(() => {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [location.hash, orderedProducts.length]);

  const pageData = pages.find((page) => page.id === "products");
  const content: ProductsContent = pageData?.content;
  const introShowcaseImage = content?.introImage || orderedProducts[0]?.image || content?.heroBgImage || "";
  const fallbackIntroContent =
    "<p>Compare origin, packaging, and buyer-ready details across every core product line from one focused catalogue.</p><p>Use this product hub to review the portfolio before sending a product request or opening a detailed product profile.</p>";
  const viewSpecificationLabel = (
    uiLabels.productCardViewSpecsLabel ||
    content?.viewSpecsLabel ||
    t("productsViewSpecs") ||
    "View Specification"
  ).replace(/Specifications/i, "Specification");
  const inquiryTitle = getSimpleContentLabel(content?.orderingFormTitle, /wholesale inquiry/i, "Product Inquiry");
  const inquirySubtitle = getSimpleContentLabel(
    content?.orderingFormSubtitle,
    /(container schedule|step \d|tonnage)/i,
    "Leave your name and email, and our team will follow up with the right product details.",
  );
  const submitButtonLabel = getSimpleContentLabel(content?.submitButtonLabel, /(instant quote|get quote)/i, "Submit");

  const productsByCategory = useMemo(() => {
    const counts = new Map<ProductCategoryKey, number>();
    for (const filter of PRODUCT_CATEGORY_DEFINITIONS) {
      counts.set(filter.key, 0);
    }

    for (const product of orderedProducts) {
      const key = getProductCategoryKey(product);
      if (key) {
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }

    return counts;
  }, [orderedProducts]);

  const filteredProducts = orderedProducts.filter((product) => {
    const categoryKey = getProductCategoryKey(product);
    return Boolean(categoryKey && selectedCategoryKeys.includes(categoryKey));
  });

  const toggleCategory = (categoryKey: ProductCategoryKey) => {
    setSelectedCategoryKeys((currentKeys) =>
      currentKeys.includes(categoryKey)
        ? currentKeys.filter((key) => key !== categoryKey)
        : [...currentKeys, categoryKey],
    );
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    setIsSubmitting(true);

    try {
      await submitLead({
        name: inquiryForm.name,
        email: inquiryForm.email,
        productInterest: "Products page catalog inquiry",
        estTonnage: "Not specified",
        message: `Submitted from the simplified products page catalog form.\nMessage: ${inquiryForm.message}`,
      });
      setSubmitMessage(t("contactsFormSuccess"));
      setInquiryForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Failed to submit products inquiry:", error);
      setSubmitMessage(t("contactsFormError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <section className="relative h-[42rem] overflow-hidden rounded-b-[4rem] md:h-[40rem] sm:rounded-b-[6rem]">
        {content?.heroBgImage ? (
          <motion.div
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.12 }}
            transition={{ duration: 22, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 z-0 origin-center"
          >
            <img
              src={content.heroBgImage}
              alt={content?.pageTitle || t("productsTitle")}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-earth-900/84 via-earth-900/52 to-transparent" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-earth-100 via-white to-earth-50" />
        )}

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-36 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 overflow-visible py-2">
              <motion.h1
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: springEasing }}
                className={`font-display text-[clamp(2.5rem,8vw,5.8rem)] font-bold leading-[1.02] ${content?.heroBgImage ? "text-white" : "text-earth-900"}`}
              >
                {content?.pageTitle || t("productsTitle")}
              </motion.h1>
            </div>

            <div className="mx-auto max-w-3xl overflow-hidden">
              <motion.p
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: springEasing }}
                className={`text-base ${content?.heroBgImage ? "text-earth-100" : "text-earth-700"} sm:text-xl`}
              >
                {content?.pageSubtitle || t("productsSubtitle")}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
        <div className="rounded-[3rem] border border-earth-100 bg-white px-5 py-6 shadow-xl shadow-earth-200/60 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid items-stretch gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-earth-400">{content?.introEyebrow || t("productsOriginEyebrow")}</p>
              <h2 className="mt-3 font-display text-[2.25rem] font-bold text-earth-900 sm:text-4xl">
                {content?.introTitle || t("productsIntroTitle")}
              </h2>
              <div
                className="mt-4 space-y-3 text-base leading-7 text-earth-700 sm:mt-5 sm:space-y-4 sm:text-lg sm:leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: content?.introContent || fallbackIntroContent,
                }}
              />
            </div>

            <div className="overflow-hidden rounded-[2.4rem] border border-earth-100 bg-earth-100 shadow-sm shadow-earth-100/70">
              {introShowcaseImage ? (
                <img
                  src={introShowcaseImage}
                  alt={content?.introEyebrow || t("productsOriginEyebrow")}
                  className="h-full min-h-[18rem] w-full object-cover lg:min-h-[21rem]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full min-h-[18rem] items-center justify-center bg-gradient-to-br from-earth-100 via-earth-50 to-white text-earth-400 lg:min-h-[21rem]">
                  {"No image added yet"}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(content?.introFacts?.length > 0
              ? content.introFacts
              : [
                  { title: t("productsOrchardBaseTitle"), description: t("productsOrchardBaseDesc") },
                  { title: t("productsGrowingConditionsTitle"), description: t("productsGrowingConditionsDesc") },
                  { title: t("productsExportReadinessTitle"), description: t("productsExportReadinessDesc") },
                ]
            ).map((card, idx) => {
              const Icon = idx === 0 ? Sprout : idx === 1 ? SunMedium : PackageCheck;
              return (
                <div key={idx} className="rounded-[2rem] border border-earth-100 bg-earth-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-earth-600 shadow-sm">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-earth-900">{card.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-earth-700">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-earth-400">Filter by category</p>
            <h2 className="mt-3 font-display text-[2.35rem] font-bold leading-tight text-earth-900 sm:text-4xl">
              Product Catalog
            </h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {PRODUCT_CATEGORY_DEFINITIONS.map((filter) => {
              const isActive = selectedCategoryKeys.includes(filter.key);
              const productCount = productsByCategory.get(filter.key) || 0;
              const categoryLabel = getProductCategoryLabel(filter.key, locale);

              return (
                <button
                  key={filter.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => toggleCategory(filter.key)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "border-earth-700 bg-earth-900 text-white shadow-sm shadow-earth-200"
                      : "border-earth-200 bg-white text-earth-700 hover:border-earth-300 hover:bg-earth-50"
                  }`}
                >
                  <span>{categoryLabel}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive ? "bg-white/14 text-white" : "bg-earth-50 text-earth-500"
                    }`}
                  >
                    {productCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {!productsLoaded ? (
          <div className="flex h-full items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-earth-500" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => {
              const slug = getManagedProductSlug(product);
              const image = product.image || product.imageGallery?.find(Boolean) || "";
              const highlights = (product.highlights || []).filter(Boolean).slice(0, 3);
              const categoryKey = getProductCategoryKey(product);
              const categoryLabel = categoryKey ? getProductCategoryLabel(categoryKey, locale) : product.category;
              const cardDescription = stripHtml(product.shortDescription).slice(0, 200);

              return (
                <motion.article
                  id={slug}
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.2), ease: "easeOut" }}
                  className="group flex min-h-full scroll-mt-28 flex-col overflow-hidden rounded-[1.65rem] border border-earth-100 bg-white shadow-sm shadow-earth-100/70 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-earth-200/40"
                >
                  <div className="relative h-36 overflow-hidden bg-earth-100 sm:h-40">
                    {image ? (
                      <img
                        src={image}
                        alt={product.seo?.imageAlt || product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-earth-100 via-earth-50 to-white text-earth-400">
                        {"No image added yet"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-earth-900/26 via-transparent to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-earth-400">
                      {categoryLabel}
                    </p>
                    <h3 className="mt-1.5 font-display text-[1.45rem] font-bold leading-tight text-earth-900 sm:text-[1.6rem]">
                      {product.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-earth-700">
                      {cardDescription}
                    </p>

                    {highlights.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-earth-500">
                          {t("productsSellingPoints")}
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {highlights.map((highlight) => (
                            <div key={highlight} className="flex items-start gap-2 text-xs leading-5 text-earth-800">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-earth-500" />
                              <span className="line-clamp-1">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-4">
                      <Link to={getManagedProductPath(product, pageSeo, locale)} className="block">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-auto min-h-10 w-full whitespace-normal border-earth-200 bg-white px-4 py-2.5 text-center text-sm leading-tight"
                        >
                          {viewSpecificationLabel}
                          <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2.25rem] border border-dashed border-earth-200 bg-white px-6 py-12 text-center">
            <h3 className="font-display text-3xl font-bold text-earth-900">No products visible</h3>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-earth-700">
              Select at least one category to show catalog items.
            </p>
            <Button type="button" variant="outline" className="mt-6" onClick={() => setSelectedCategoryKeys([...PRODUCT_CATEGORY_KEYS])}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Show all categories
            </Button>
          </div>
        )}
      </section>

      <section className="mx-auto mb-12 max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="rounded-[2.75rem] border border-earth-100 bg-[linear-gradient(180deg,#fffdfd_0%,#fcf5fa_100%)] p-6 shadow-xl shadow-earth-200/40 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-earth-400">Catalog request</p>
              <h2 className="mt-3 font-display text-[2.2rem] font-bold leading-tight text-earth-900 sm:text-4xl">
                {inquiryTitle}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-earth-700">
                {inquirySubtitle}
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} className="rounded-[2rem] border border-earth-100 bg-white p-4 shadow-sm shadow-earth-100/80 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  placeholder={t("contactsFormName")}
                  className="w-full rounded-xl border border-earth-200 bg-earth-50 p-3.5 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500"
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                />
                <input
                  type="email"
                  required
                  placeholder={content?.stepThreePlaceholder || t("stepThreePlaceholder")}
                  className="w-full rounded-xl border border-earth-200 bg-earth-50 p-3.5 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500"
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                />
              </div>
              <textarea
                required
                rows={4}
                placeholder="Leave a message..."
                className="mt-3 w-full resize-none rounded-xl border border-earth-200 bg-earth-50 p-3.5 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500"
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
              />
              <Button type="submit" className="mt-3 w-full sm:w-auto" disabled={isSubmitting || !inquiryForm.name || !inquiryForm.email || !inquiryForm.message}>
                {isSubmitting ? content?.submittingButtonLabel || t("submittingButtonLabel") : submitButtonLabel}
              </Button>

              {submitMessage && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-earth-50 px-4 py-3 text-sm text-earth-700">
                  <CheckCircle2 size={16} className="text-earth-500" />
                  <span>{submitMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
