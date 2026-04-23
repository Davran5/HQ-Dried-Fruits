import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2, Phone, Mail, Send, Loader2, SunMedium, Sprout, PackageCheck, ChevronDown } from "lucide-react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { Button } from "@/src/components/ui/Button";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { useProducts } from "@/src/contexts/ProductContext";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { ProductsContent } from "@/src/types/page";
import { Product, ProductContentSection } from "@/src/types/product";
import { submitLead } from "@/src/lib/leads";
import { getManagedProductPath, getManagedProductSlug } from "@/src/lib/routes";

const preferredProductOrder = ["sun-dried-apricots", "black-raisins", "pitted-prunes"];


function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getFallbackSections(
  product: Product,
  t: (key: "productsOverview" | "productsBenefits") => string,
): ProductContentSection[] {
  return [
    {
      title: t("productsOverview"),
      body: product.longDescription || `<p>${product.shortDescription}</p>`,
    },
    {
      title: t("productsBenefits"),
      body: `<p>${product.highlights.join(". ")}</p>`,
    },
  ];
}

export function Products() {
  const location = useLocation();
  const { pages, pageSeo, globalSettings } = usePages();
  const { products, productsLoaded } = useProducts();
  const { locale, t } = useLanguage();
  const uiLabels = globalSettings.uiLabels || {};

  const introFactCards = [
    {
      title: uiLabels.orchardBaseTitle || "Orchard Base",
      description: uiLabels.orchardBaseDesc || "Fruit-growing zones in Uzbekistan rely on irrigated valley and foothill production systems rather than rain-fed uncertainty.",
      icon: Sprout,
    },
    {
      title: uiLabels.growingConditionsTitle || "Growing Conditions",
      description: uiLabels.growingConditionsDesc || "Hot, dry summers and sunlight help apricots, grapes, and plums build sugar.",
      icon: SunMedium,
    },
    {
      title: uiLabels.exportReadinessTitle || "Export Readiness",
      description: uiLabels.exportReadinessDesc || "Every line is positioned for buyer-specific cartons and repeat wholesale programs.",
      icon: PackageCheck,
    },
  ];

  const seo = pageSeo.products;
  const springEasing = [0.25, 1, 0.5, 1];

  useSEO({
    title: seo?.metaTitle || uiLabels.productsMetaTitle || "Wholesale Dried Apricots, Raisins, Prunes & Mixed Baskets | HQ Dried Fruits",
    description:
      seo?.metaDescription ||
      uiLabels.productsMetaDesc ||
      "Source Uzbekistan dried apricots, raisins, prunes, and mixed baskets with detailed origin, processing, nutrition, and export information on one page.",
    ogTitle: seo?.ogTitle || "HQ Dried Fruits Product Catalog",
  });

  const [selectedSections, setSelectedSections] = useState<Record<string, string>>({});
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    products: [] as string[],
    volumes: {} as Record<string, string>,
    name: "",
    contact: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [directContactHeight, setDirectContactHeight] = useState<number | null>(null);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [openVolumeProductId, setOpenVolumeProductId] = useState<string | null>(null);
  const orderHubRef = useRef<HTMLElement | null>(null);
  const directContactRef = useRef<HTMLDivElement | null>(null);

  const activeProducts = products.filter((product) => product.status === "Active");
  const preferredProducts = preferredProductOrder
    .map((id) => activeProducts.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  
  const otherProducts = activeProducts.filter((product) => !preferredProductOrder.includes(product.id));
  const orderedProducts = [...preferredProducts, ...otherProducts];

  useEffect(() => {
    if (products.length === 0) {
      return;
    }

    setSelectedSections((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const product of orderedProducts) {
        const sections = product.contentSections?.length > 0 ? product.contentSections : getFallbackSections(product, t);
        if (!next[product.id]) {
          next[product.id] = sections[0]?.title || uiLabels.overviewLabel || t("productsOverview");
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [products, orderedProducts, t, uiLabels.overviewLabel]);

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
  const introShowcaseImage = orderedProducts[0]?.image || content?.heroBgImage || "";
  const volumeOptions =
    content?.volumeOptions?.length > 0
      ? content.volumeOptions
      : [uiLabels.volOption1 || "1-5 Tons", uiLabels.volOption2 || "5-20 Tons", uiLabels.volOption3 || "1 FCL (20ft)", uiLabels.volOption4 || "Multiple FCLs"];
  const telegramUrl = globalSettings.telegramUrl?.trim();
  const quickPhoneHref = (content?.quickPhone || "+998 90 123 45 67").replace(/[^\d+]/g, "");
  const quickEmailValue = content?.quickEmail || globalSettings.emailAddress || "export@hqdriedfruits.com";

  useEffect(() => {
    const element = directContactRef.current;
    if (!element || typeof window === "undefined") {
      return;
    }

    const updateHeight = () => {
      setDirectContactHeight(element.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(element);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [content?.quickContactTitle, content?.quickContactSubtitle, content?.quickPhone, content?.quickEmail, telegramUrl]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateViewport = () => {
      setIsDesktopViewport(window.innerWidth >= 1024);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!openVolumeProductId) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-volume-dropdown='true']")) {
        setOpenVolumeProductId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [openVolumeProductId]);

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 1 && formData.products.length > 0) {
      setFormStep(2);
      return;
    }

    if (formStep === 2 && formData.products.every((productId) => Boolean(formData.volumes[productId]))) {
      setFormStep(formStep + 1);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    setIsSubmitting(true);

    try {
      const selectedProducts = formData.products
        .map((productId) => activeProducts.find((product) => product.id === productId))
        .filter((product): product is Product => Boolean(product));
      const productSummary = selectedProducts.map((product) => product.name).join(", ");
      const tonnageSummary = selectedProducts
        .map((product) => `${product.name}: ${formData.volumes[product.id] || "Not specified"}`)
        .join(" | ");

      await submitLead({
        name: formData.name,
        email: formData.contact,
        productInterest: productSummary,
        estTonnage: tonnageSummary,
        message: `Submitted from the products page wholesale inquiry form.\nSelections: ${tonnageSummary}`,
      });
      setSubmitMessage(uiLabels.inquirySuccessMsg || t("contactsFormSuccess"));
      setFormData({ products: [], volumes: {}, name: "", contact: "" });
      setFormStep(1);
    } catch (error) {
      console.error("Failed to submit products inquiry:", error);
      setSubmitMessage(uiLabels.inquiryFailureMsg || t("contactsFormError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrollToInquiry = (productId: string) => {
    setFormStep(1);
    setFormData((prev) =>
      prev.products.includes(productId) ? prev : { ...prev, products: [...prev.products, productId] },
    );
    orderHubRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleInquiryProduct = (productId: string) => {
    setFormData((prev) => {
      const isSelected = prev.products.includes(productId);

      if (isSelected) {
        const nextVolumes = { ...prev.volumes };
        delete nextVolumes[productId];
        return {
          ...prev,
          products: prev.products.filter((id) => id !== productId),
          volumes: nextVolumes,
        };
      }

      return {
        ...prev,
        products: [...prev.products, productId],
      };
    });
  };

  const currentStepText = (uiLabels.orderingFormStepLabel || t("productsStepIndicator")).replace("{step}", formStep.toString());

  return (
    <PageLayout>
      <section className="relative h-[38rem] overflow-hidden rounded-b-[4rem] md:h-[36rem] sm:rounded-b-[6rem]">
        {content?.heroBgImage ? (
          <motion.div
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.12 }}
            transition={{ duration: 22, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 z-0 origin-center"
          >
            <img
              src={content.heroBgImage}
              alt={content?.pageTitle || uiLabels.productsTitle || "Products hero background"}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-earth-900/84 via-earth-900/52 to-transparent" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-earth-100 via-white to-earth-50" />
        )}

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 overflow-hidden">
              <motion.h1
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: springEasing }}
                className={`font-display text-[2.7rem] font-bold leading-[0.92] ${content?.heroBgImage ? "text-white" : "text-earth-900"} sm:text-[5.2rem] md:text-[6.3rem]`}
              >
                {content?.pageTitle || uiLabels.productsTitle || "Wholesale Dried Fruits from Uzbekistan"}
              </motion.h1>
            </div>

            <div className="mx-auto max-w-3xl overflow-hidden">
              <motion.p
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: springEasing }}
                className={`text-base ${content?.heroBgImage ? "text-earth-100" : "text-earth-700"} sm:text-xl`}
              >
                {content?.pageSubtitle || uiLabels.productsSubtitle ||
                  "Explore export-ready apricots, raisins, prunes, and mixed assortments with buyer-focused origin, processing, and application details in one catalog."}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
        <div className="rounded-[3rem] border border-earth-100 bg-white px-5 py-6 shadow-xl shadow-earth-200/60 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid items-stretch gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-earth-400">{uiLabels.originEyebrow || "Uzbekistan Origin"}</p>
              <h2 className="mt-3 font-display text-[2.25rem] font-bold text-earth-900 sm:text-4xl">
                {uiLabels.productsIntroTitle || "One Page. Four Core Product Lines. Real Buyer Context."}
              </h2>
              <div
                className="mt-4 space-y-3 text-base leading-7 text-earth-700 sm:mt-5 sm:space-y-4 sm:text-lg sm:leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    content?.introContent ||
                    `<p>${uiLabels.productsIntroP1 || "Uzbekistan's fruit-growing regions are built around irrigated valley and foothill agriculture. Across those zones, orchard and vineyard production commonly works with sierozem, meadow, and alluvial soils, supported by controlled water management rather than unstable rainfall patterns."}</p><p>${uiLabels.productsIntroP2 || "For dried-fruit buyers, the commercial result is more important than the terminology: hot summers, dry ripening conditions, and strong solar exposure help apricots, grapes, and plums build natural sugars before drying. That gives importers a better raw product for retail, bakery, ingredient, and mixed-load programs."}</p>`,
                }}
              />
            </div>

            <div className="overflow-hidden rounded-[2.4rem] border border-earth-100 bg-earth-100 shadow-sm shadow-earth-100/70">
              {introShowcaseImage ? (
                <img
                  src={introShowcaseImage}
                  alt={uiLabels.originEyebrow || "Uzbekistan dried fruit origin"}
                  className="h-full min-h-[18rem] w-full object-cover lg:min-h-[21rem]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full min-h-[18rem] items-center justify-center bg-gradient-to-br from-earth-100 via-earth-50 to-white text-earth-400 lg:min-h-[21rem]">
                  {uiLabels.noImageLabel || "No image added yet"}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(content?.introFacts?.length > 0 ? content.introFacts : [
              { title: uiLabels.factTitle1 || "Orchard Base", description: uiLabels.factDesc1 || "Fruit-growing zones in Uzbekistan rely on irrigated valley and foothill production systems rather than rain-fed uncertainty." },
              { title: uiLabels.factTitle2 || "Growing Conditions", description: uiLabels.factDesc2 || "Hot, dry summers and strong sunlight help apricots, grapes, and plums build sugar before drying." },
              { title: uiLabels.factTitle3 || "Export Readiness", description: uiLabels.factDesc3 || "Every line is positioned for buyer-specific cartons, mixed loads, and repeat wholesale programs." }
            ]).map((card, idx) => {
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
        {!productsLoaded ? (
          <div className="flex h-full items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-earth-500" />
          </div>
        ) : (
          <div className="space-y-8">
            {orderedProducts.map((product, index) => {
              const isReversed = index % 2 === 1;
              const slug = getManagedProductSlug(product);
              const contentSections =
                product.contentSections?.length > 0 ? product.contentSections : getFallbackSections(product, t);
              const selectedTitle = selectedSections[product.id] || contentSections[0]?.title || uiLabels.overviewLabel || t("productsOverview");
              const selectedSection =
                contentSections.find((section) => section.title === selectedTitle) || contentSections[0];
              const galleryImages = Array.from(
                new Set([product.image, ...(product.imageGallery || [])].filter(Boolean)),
              ).slice(0, 3);

              return (
                <motion.section
                  id={slug}
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="scroll-mt-28"
                >
                  <div className="grid items-stretch gap-5 rounded-none border-0 bg-transparent p-0 shadow-none sm:gap-6 sm:rounded-[3rem] sm:border sm:border-earth-100 sm:bg-white sm:p-8 sm:shadow-sm sm:shadow-earth-100/70 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:p-10">
                    <div
                      className={`min-w-0 lg:grid lg:h-[38.5rem] lg:min-h-0 lg:grid-rows-[14rem_22.5rem] ${
                        isReversed ? "lg:order-2" : ""
                      }`}
                    >
                        <div className="flex flex-col gap-4 border-b border-earth-100 pb-5 lg:h-full lg:justify-between lg:gap-5 lg:pb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-earth-400">
                              {product.category}
                            </p>
                            <h2 className="mt-2 font-display text-[2.6rem] font-bold text-earth-900 sm:text-5xl">
                              {product.name}
                            </h2>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Link to={getManagedProductPath(product, pageSeo, locale)}>
                              <Button type="button" variant="outline" className="border-earth-200 bg-white">
                                {content?.viewSpecsLabel || uiLabels.viewSpecsLabel || "View Specifications"}
                              </Button>
                            </Link>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleScrollToInquiry(product.id)}
                              className="border-earth-200 bg-white"
                            >
                              {uiLabels.requestQuoteBtn || t("productsRequestQuote")} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="max-w-3xl text-base leading-7 text-earth-700 sm:text-lg sm:leading-relaxed">
                          {stripHtml(product.shortDescription)}
                        </p>
                      </div>

                      <div className="mt-5 min-h-0 overflow-hidden px-0 py-0 sm:px-1 sm:py-1 lg:mt-5 lg:h-[22.5rem]">
                        <div className="flex flex-wrap gap-2 border-b border-earth-100 pb-4">
                          {contentSections.map((section) => {
                            const isActive = section.title === selectedTitle;
                            const labelMap: Record<string, string> = {
                              "Origin & Growing Conditions": uiLabels.originLabel || t("productsOverview"),
                              "Benefits & Buyer Uses": uiLabels.benefitsLabel || t("productsBenefits"),
                              "Export & Handling": uiLabels.exportLabel || t("productsExport"),
                              "Assembly & Sourcing": uiLabels.originLabel || t("productsOverview"),
                            };
                            const displayLabel = labelMap[section.title] || section.title;
                            return (
                              <button
                                key={section.title}
                                type="button"
                                onClick={() =>
                                  setSelectedSections((prev) => ({ ...prev, [product.id]: section.title }))
                                }
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                  isActive
                                    ? "bg-earth-900 text-white"
                                    : "bg-transparent text-earth-700 hover:bg-earth-50"
                                }`}
                              >
                                {displayLabel}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-5 min-h-0 lg:h-[calc(100%-4.5rem)] lg:max-w-[38rem] lg:overflow-visible">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${product.id}-${selectedSection?.title}`}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                              transition={{ duration: 0.28, ease: "easeOut" }}
                            >
                              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-earth-400">
                                {{
                                  "Origin & Growing Conditions": uiLabels.originLabel || t("productsOverview"),
                                  "Benefits & Buyer Uses": uiLabels.benefitsLabel || t("productsBenefits"),
                                  "Export & Handling": uiLabels.exportLabel || t("productsExport"),
                                  "Assembly & Sourcing": uiLabels.originLabel || t("productsOverview"),
                                }[selectedSection?.title || ""] || selectedSection?.title}
                              </p>
                              <div
                                className="prose prose-sm mt-4 max-w-none break-words text-earth-700 prose-p:leading-relaxed prose-p:text-earth-700 prose-strong:text-earth-900 prose-li:leading-relaxed prose-li:text-earth-700"
                                dangerouslySetInnerHTML={{
                                  __html: selectedSection?.body || `<p>${uiLabels.noInfoLabel || t("productsNoInfo")}</p>`,
                                }}
                              />
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>

                    </div>

                    <div
                      className={`min-w-0 flex flex-col lg:grid lg:h-[38.5rem] lg:min-h-0 lg:grid-rows-[14rem_22.5rem] ${
                        isReversed ? "lg:order-1" : ""
                      }`}
                    >
                      <div className="relative overflow-hidden rounded-[2.5rem] bg-earth-100">
                        <img
                          src={galleryImages[0] || product.image}
                          alt={product.seo?.imageAlt || product.name}
                          className="h-[14rem] w-full object-cover sm:h-[20rem] lg:h-full"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-earth-900/28 via-transparent to-transparent" />
                      </div>

                      <div className="mt-4 flex-1 lg:mt-5 lg:h-[22.5rem]">
                        <div className="p-1 lg:flex lg:h-[22.5rem] lg:flex-col">
                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-earth-500">
                              {uiLabels.nutritionalSnapshotLabel || "Nutritional Snapshot"}
                            </p>
                            <div className="mt-3 grid grid-cols-4 gap-1.5 lg:grid-cols-4">
                              <div className="flex flex-col items-center justify-center px-2 py-1.5 text-center">
                                <div className="text-center text-[0.58rem] uppercase tracking-[0.16em] text-earth-400">{uiLabels.energyLabel || "Energy"}</div>
                                <div className="mt-1 text-center text-[0.82rem] font-semibold leading-none text-earth-900 lg:text-[0.95rem]">{product.nutrition.energy}</div>
                              </div>
                              <div className="flex flex-col items-center justify-center px-2 py-1.5 text-center">
                                <div className="text-center text-[0.58rem] uppercase tracking-[0.16em] text-earth-400">{uiLabels.proteinLabel || "Protein"}</div>
                                <div className="mt-1 text-center text-[0.82rem] font-semibold leading-none text-earth-900 lg:text-[0.95rem]">{product.nutrition.protein}</div>
                              </div>
                              <div className="flex flex-col items-center justify-center px-2 py-1.5 text-center">
                                <div className="text-center text-[0.58rem] uppercase tracking-[0.16em] text-earth-400">{uiLabels.fatLabel || "Fat"}</div>
                                <div className="mt-1 text-center text-[0.82rem] font-semibold leading-none text-earth-900 lg:text-[0.95rem]">{product.nutrition.fat}</div>
                              </div>
                              <div className="flex flex-col items-center justify-center px-2 py-1.5 text-center">
                                <div className="text-center text-[0.58rem] uppercase tracking-[0.16em] text-earth-400">{uiLabels.carbsLabel || "Carbs"}</div>
                                <div className="mt-1 text-center text-[0.82rem] font-semibold leading-none text-earth-900 lg:text-[0.95rem]">{product.nutrition.carbs}</div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-earth-100 pt-4">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-earth-500">
                              {uiLabels.sellingPointsLabel || "Key Selling Points"}
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                              {product.highlights.map((highlight) => (
                                <div
                                  key={highlight}
                                  className="flex items-start gap-3 px-1 py-1 text-sm leading-relaxed text-earth-800"
                                >
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-earth-500" />
                                  <span>{highlight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </div>
        )}
      </section>

      <section
        ref={orderHubRef}
        className="mx-auto mb-8 max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.32fr)_minmax(20rem,0.68fr)]">
          <div
            className="flex flex-col rounded-[3rem] border border-earth-100 bg-white p-8 shadow-xl shadow-earth-200/50 sm:p-10"
            style={isDesktopViewport && directContactHeight ? { height: `${Math.max(directContactHeight - 18, 0)}px` } : undefined}
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <h2 className="font-display text-3xl font-bold text-earth-900">
                {content?.orderingFormTitle || uiLabels.wholesaleInquiryTitle || "Wholesale Inquiry"}
              </h2>
              <p className="pt-1 text-right text-earth-600">
                {content?.orderingFormSubtitle || currentStepText}
              </p>
            </div>

            <div className="relative min-h-[24rem] flex-1">
              <AnimatePresence mode="wait">
                {formStep === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={nextStep}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <label className="text-lg font-medium text-earth-800">
                        {content?.stepOneLabel || uiLabels.stepOneLabel || t("stepOneLabel")}
                      </label>
                      <Button type="submit" className="self-start" disabled={formData.products.length === 0}>
                        {content?.nextStepButtonLabel || t("nextStepButtonLabel")} <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>

                    <div className="grid gap-2.5 md:grid-cols-3">
                      {orderedProducts.map((product) => {
                        const isSelected = formData.products.includes(product.id);

                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => toggleInquiryProduct(product.id)}
                            className={`rounded-[1.6rem] border px-4 py-3.5 text-left transition-all ${
                              isSelected
                                ? "border-earth-600 bg-[#fffcfb] shadow-[0_16px_28px_rgba(84,39,70,0.08)]"
                                : "border-earth-100 bg-earth-50 hover:border-earth-200 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="min-w-0 break-words font-display text-[1.3rem] font-bold text-earth-900 sm:text-[1.7rem]">
                                {product.name}
                              </h3>
                              <CheckCircle2
                                className={`h-5 w-5 shrink-0 ${isSelected ? "text-earth-600" : "text-earth-200"}`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-1">
                      <p className="text-sm text-earth-600">
                        {formData.products.length > 0
                          ? (uiLabels.productsSelectedLabel || "{count} products selected").replace("{count}", formData.products.length.toString())
                          : uiLabels.selectToContinueLabel || t("productsSelectToContinue")}
                      </p>
                    </div>
                  </motion.form>
                )}

                {formStep === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={nextStep}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <label className="text-lg font-medium text-earth-800">
                        {content?.stepTwoLabel || uiLabels.stepTwoLabel || t("stepTwoLabel")}
                      </label>
                      <div className="flex gap-3">
                        <Button type="button" variant="ghost" onClick={() => setFormStep(1)}>
                          {content?.backButtonLabel || t("backButtonLabel")}
                        </Button>
                        <Button
                          type="submit"
                          disabled={!formData.products.every((productId) => Boolean(formData.volumes[productId]))}
                        >
                          {content?.nextStepButtonLabel || t("nextStepButtonLabel")} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2.5 md:grid-cols-3">
                      {formData.products.map((productId) => {
                        const selectedProduct = orderedProducts.find((product) => product.id === productId);
                        if (!selectedProduct) {
                          return null;
                        }

                        return (
                          <div
                            key={productId}
                            className="rounded-[1.6rem] border border-earth-100 bg-[#fffcfb] px-4 py-3.5"
                          >
                            <div className="mb-2">
                              <h3 className="min-w-0 break-words font-display text-[1.3rem] font-bold text-earth-900 sm:text-[1.7rem]">
                                {selectedProduct.name}
                              </h3>
                            </div>

                            <div className="relative" data-volume-dropdown="true">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenVolumeProductId((current) => (current === productId ? null : productId))
                                }
                                className="flex w-full items-center justify-between rounded-[1.1rem] border border-earth-200 bg-[linear-gradient(180deg,#fcf5fa_0%,#fffafc_100%)] px-4 py-3 text-left text-sm font-semibold text-earth-800 outline-none transition-all hover:border-earth-300 focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                              >
                                <span className={formData.volumes[productId] ? "text-earth-800" : "text-earth-500"}>
                                  {formData.volumes[productId] || uiLabels.selectTonnageLabel || t("productsSelectTonnage")}
                                </span>
                                <ChevronDown
                                  size={18}
                                  className={`shrink-0 text-earth-500 transition-transform ${openVolumeProductId === productId ? "rotate-180" : ""}`}
                                />
                              </button>

                              {openVolumeProductId === productId && (
                                <div className="absolute inset-x-0 top-[calc(100%+0.45rem)] z-20 overflow-hidden rounded-[1.1rem] border border-earth-200 bg-[linear-gradient(180deg,#fffafc_0%,#fcf5fa_100%)] p-1.5 shadow-[0_18px_36px_rgba(84,39,70,0.12)]">
                                  {volumeOptions.map((volume) => {
                                    const isSelected = formData.volumes[productId] === volume;

                                    return (
                                      <button
                                        key={`${productId}-${volume}`}
                                        type="button"
                                        onClick={() => {
                                          setFormData((prev) => ({
                                            ...prev,
                                            volumes: { ...prev.volumes, [productId]: volume },
                                          }));
                                          setOpenVolumeProductId(null);
                                        }}
                                        className={`flex w-full items-center justify-between rounded-[0.9rem] px-3 py-2.5 text-sm font-medium transition-all ${
                                          isSelected
                                            ? "bg-earth-600 text-white"
                                            : "text-earth-800 hover:bg-white"
                                        }`}
                                      >
                                        <span>{volume}</span>
                                        {isSelected && <CheckCircle2 size={16} className="shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.form>
                )}

                {formStep === 3 && (
                  <motion.form
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleLeadSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <label className="text-lg font-medium text-earth-800">
                        {content?.stepThreeLabel || uiLabels.stepThreeLabel || t("stepThreeLabel")}
                      </label>
                      <div className="flex gap-3">
                        <Button type="button" variant="ghost" onClick={() => setFormStep(2)}>
                          {content?.backButtonLabel || t("backButtonLabel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !formData.name || !formData.contact}>
                          {isSubmitting
                            ? content?.submittingButtonLabel || t("submittingButtonLabel")
                            : content?.submitButtonLabel || t("submitButtonLabel")}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        required
                        placeholder={uiLabels.formNameLabel || t("contactsFormName")}
                        className="w-full rounded-xl border border-earth-200 bg-earth-50 p-3.5 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <input
                        type="email"
                        required
                        placeholder={content?.stepThreePlaceholder || t("stepThreePlaceholder")}
                        className="w-full rounded-xl border border-earth-200 bg-earth-50 p-3.5 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      />
                    </div>

                    <div className="rounded-[1.75rem] border border-earth-100 bg-earth-50 px-4 py-3.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-earth-400">
                        {t("productsInquirySummary")}
                      </p>
                      <div className="mt-3 grid gap-2.5 md:grid-cols-3">
                        {formData.products.map((productId) => {
                          const selectedProduct = orderedProducts.find((product) => product.id === productId);
                          if (!selectedProduct) {
                            return null;
                          }

                          return (
                            <div
                              key={`summary-${productId}`}
                              className="rounded-[1.2rem] bg-white px-4 py-2.5 text-sm text-earth-800"
                            >
                              <div className="font-semibold text-earth-900">{selectedProduct.name}</div>
                              <div className="mt-1 text-earth-600">{formData.volumes[productId]}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {submitMessage && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl bg-earth-50 px-4 py-3 text-sm text-earth-700">
                <CheckCircle2 size={16} className="text-earth-500" />
                <span>{submitMessage}</span>
              </div>
            )}
          </div>

          <div ref={directContactRef} className="flex h-full flex-col gap-6 p-1">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-earth-400">{t("productsDirectContact")}</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-earth-900">
                {content?.quickContactTitle || t("productsNeedItFaster")}
              </h2>
              <p className="mt-3 text-base leading-7 text-earth-700">
                {content?.quickContactSubtitle ||
                  t("productsSkipForm")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={telegramUrl || "#"}
                target={telegramUrl ? "_blank" : undefined}
                rel={telegramUrl ? "noreferrer" : undefined}
                aria-disabled={!telegramUrl}
                className={`group flex items-center gap-4 rounded-[1.8rem] bg-transparent px-5 py-4 transition-all hover:bg-earth-100/80 hover:shadow-sm ${
                  telegramUrl ? "" : "cursor-default"
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-earth-600 shadow-sm">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-earth-900">
                    {content?.telegramLabel || t("productsTelegramBot")}
                  </h3>
                  <p className="text-sm text-earth-600">
                    {content?.telegramSublabel || t("productsTelegramSubtitle")}
                  </p>
                </div>
              </a>

              <a
                href={`tel:${quickPhoneHref}`}
                className="group flex items-center gap-4 rounded-[1.8rem] bg-transparent px-5 py-4 transition-all hover:bg-earth-100/80 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-earth-600 shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-earth-900">
                    {content?.callLabel || t("productsCallSales")}
                  </h3>
                  <p className="text-sm text-earth-600">{content?.quickPhone || "+998 90 123 45 67"}</p>
                </div>
              </a>

              <a
                href={`mailto:${quickEmailValue}`}
                className="group flex items-center gap-4 rounded-[1.8rem] bg-transparent px-5 py-4 transition-all hover:bg-earth-100/80 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-earth-600 shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-earth-900">
                    {content?.emailLabel || t("productsEmailUs")}
                  </h3>
                  <p className="text-sm text-earth-600">{quickEmailValue}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
