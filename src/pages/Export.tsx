import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, FileText, Package, ShieldCheck, Ship } from "lucide-react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { BentoCard } from "@/src/components/ui/BentoCard";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { ExportContent, SupplyRoute } from "@/src/types/page";

const fallbackSupplyRoutes: SupplyRoute[] = [
  {
    countryName: "Germany",
    mapCoordinatesId: "DE",
    tooltipDescription: "Structured pallet and container routing for wholesale buyers across Central Europe.",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1400&auto=format&fit=crop",
  },
  {
    countryName: "Netherlands",
    mapCoordinatesId: "NL",
    tooltipDescription: "Port-linked import planning for Rotterdam-focused buyers and regional distribution hubs.",
    image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=1400&auto=format&fit=crop",
  },
  {
    countryName: "UAE",
    mapCoordinatesId: "AE",
    tooltipDescription: "Flexible documentation and mixed-load preparation for GCC importers and re-export channels.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1400&auto=format&fit=crop",
  },
  {
    countryName: "Kazakhstan",
    mapCoordinatesId: "KZ",
    tooltipDescription: "Land-linked replenishment for regional buyers needing shorter scheduling windows.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1400&auto=format&fit=crop",
  },
];

function getCountryCode(route: SupplyRoute) {
  if (/^[a-z]{2}$/i.test(route.mapCoordinatesId.trim())) {
    return route.mapCoordinatesId.trim().toUpperCase();
  }

  return route.countryName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRouteLabel(route: SupplyRoute) {
  return getCountryCode(route) === "AE" || route.countryName.toLowerCase() === "united arab emirates"
    ? "UAE"
    : route.countryName;
}

export function Export() {
  const { pages, pageSeo } = usePages();
  const seo = pageSeo.export;
  const springEasing = [0.25, 1, 0.5, 1];
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  useSEO({
    title: seo?.metaTitle || "Global Export | HQ Dried Fruits",
    description:
      seo?.metaDescription ||
      "Seamless global logistics from the heart of the Silk Road to your warehouse. We handle customs, packaging, and freight forwarding.",
    ogTitle: seo?.ogTitle || "HQ Dried Fruits Export",
  });

  const pageData = pages.find((page) => page.id === "export");
  const content = pageData?.content as ExportContent | undefined;
  const exportIntroImage = content?.heroBgImage || certificationsFallbackImage();
  const qualityChecks =
    content?.qualityChecks?.length > 0
      ? content.qualityChecks
      : [
          { title: "Moisture Control", description: "Strictly maintained at 18-22% for optimal shelf life." },
          { title: "Size Calibration", description: "Laser-graded for uniform sizing (Jumbo, Large, Medium)." },
          { title: "Microbiological Safety", description: "Regular lab testing for aflatoxins and heavy metals." },
        ];

  const standardsCards = [
    {
      title: content?.packagingTitle || "Custom Packaging",
      body:
        content?.packagingMethods ||
        "<p>Bulk cartons, vacuum-sealed bags, or retail-ready packaging customized with your brand labels.</p>",
      icon: Package,
      colorClass: "bg-earth-100 text-earth-600",
      delay: 0,
    },
    {
      title: content?.transportationTitle || "Ocean & Rail Freight",
      body:
        content?.transportationMethods ||
        "<p>Cost-effective FCL (Full Container Load) and LCL shipments via major ports and the trans-Eurasian rail network.</p>",
      icon: Ship,
      colorClass: "bg-mint-100 text-mint-600",
      delay: 0.1,
    },
    {
      title: content?.documentationTitle || "Customs Clearance",
      body:
        content?.documentationContent ||
        "<p>Full documentation support including phytosanitary certificates, certificates of origin, and EUR.1.</p>",
      icon: FileText,
      colorClass: "bg-blue-100 text-blue-600",
      delay: 0.2,
    },
  ];
  const routeMarkets = (content?.supplyRoutes?.length ? content.supplyRoutes : fallbackSupplyRoutes)
    .slice(0, 4)
    .map((route) => ({
      ...route,
      code: getCountryCode(route),
      displayName: getRouteLabel(route),
      image: route.image || exportIntroImage,
    }));
  const safeActiveRouteIndex = Math.min(activeRouteIndex, Math.max(routeMarkets.length - 1, 0));
  const activeRoute = routeMarkets[safeActiveRouteIndex];
  const certifications =
    content?.certificationsGallery?.length > 0
      ? content.certificationsGallery
      : [
          {
            image: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=800",
            caption: "Standard ISO Certification",
          },
          {
            image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=800",
            caption: "HACCP Food Safety",
          },
          {
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800",
            caption: "Organic Standard Certificate",
          },
          {
            image: "https://images.unsplash.com/photo-1615461066841-6116ecaabb04?q=80&w=800",
            caption: "Product Quality Seal",
          },
        ];
  const certificateScrollerRef = useRef<HTMLDivElement | null>(null);

  function certificationsFallbackImage() {
    return "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop";
  }

  const getCertificateCards = (): HTMLElement[] => {
    const scroller = certificateScrollerRef.current;

    if (!scroller) {
      return [];
    }

    return Array.from(scroller.querySelectorAll("[data-certificate-card='true']")) as HTMLElement[];
  };

  const getClosestCertificateIndex = () => {
    const scroller = certificateScrollerRef.current;
    const cards = getCertificateCards();

    if (!scroller || cards.length === 0) {
      return 0;
    }

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - scroller.scrollLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const scrollToCertificateIndex = (index: number, behavior: ScrollBehavior = "smooth") => {
    const scroller = certificateScrollerRef.current;
    const cards = getCertificateCards();

    if (!scroller || cards.length === 0) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, cards.length - 1));

    scroller.scrollTo({
      left: cards[safeIndex].offsetLeft,
      behavior,
    });
  };

  const scrollCertificatesBy = (direction: -1 | 1) => {
    const currentIndex = getClosestCertificateIndex();
    scrollToCertificateIndex(currentIndex + direction);
  };

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
              alt={content?.heroTitle || "Export hero background"}
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
                className={`font-display text-[3.9rem] font-bold leading-[0.92] ${content?.heroBgImage ? "text-white" : "text-earth-900"} sm:text-[7.5rem] md:text-[9rem]`}
              >
                {content?.heroTitle || "Our Global Export Network"}
              </motion.h1>
            </div>

            <div className="mx-auto max-w-3xl overflow-hidden">
              <motion.p
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: springEasing }}
                className={`text-base ${content?.heroBgImage ? "text-earth-100" : "text-earth-700"} sm:text-xl`}
              >
                {content?.heroSubtitle ||
                  "Seamless global logistics from the heart of the Silk Road to your warehouse."}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
        <div className="rounded-[3rem] border border-earth-100 bg-white px-5 py-6 shadow-xl shadow-earth-200/60 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid items-stretch gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-earth-400">Export Operations</p>
              <h2 className="mt-3 font-display text-[2.25rem] font-bold text-earth-900 sm:text-4xl">
                Built for Buyer-Specific Routing, Documentation, and Packing
              </h2>
              <div
                className="prosetext mt-4 space-y-3 text-base leading-7 text-earth-700 sm:mt-5 sm:space-y-4 sm:text-lg sm:leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    content?.logisticsContent ||
                    "<p>We handle end-to-end multi-modal transport routing around buyer requirements, from packing format and paperwork to the most efficient lane for delivery.</p><p>Each shipment is structured around repeatability, destination compliance, and wholesale practicality so importers can move with less friction from order to warehouse receipt.</p>",
                }}
              />
            </div>

            <div className="overflow-hidden rounded-[2.4rem] border border-earth-100 bg-earth-100 shadow-sm shadow-earth-100/70">
              <img
                src={exportIntroImage}
                alt="Export operations"
                className="h-full min-h-[18rem] w-full object-cover lg:min-h-[21rem]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {standardsCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: card.delay, ease: "easeOut" }}
                  className="rounded-[2rem] border border-earth-100 bg-earth-50 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-earth-600 shadow-sm">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-earth-900">{card.title}</h3>
                  </div>
                  <div className="mt-3 prosetext text-earth-700" dangerouslySetInnerHTML={{ __html: card.body }} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-18 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: springEasing }}
          className="relative"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-stretch lg:gap-8">
            <div className="flex flex-col">
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-earth-500">
                Destination Breakdown
              </p>
              <h2 className="mt-4 max-w-[14ch] font-display text-[2.35rem] font-bold leading-tight text-earth-900 sm:text-5xl">
                How each destination lane is prepared before dispatch
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-earth-700 sm:mt-5 sm:text-lg sm:leading-8">
                Export planning changes by market. Select a destination to preview the lane focus, the route context,
                and how we position packing and documentation around buyer expectations.
              </p>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
                {routeMarkets.map((route, index) => {
                  const isActive = index === safeActiveRouteIndex;

                  return (
                    <button
                      key={`${route.countryName}-${route.code}`}
                      type="button"
                      onClick={() => setActiveRouteIndex(index)}
                      className={`rounded-[1.8rem] border px-5 py-4 text-left transition-all ${
                        isActive
                          ? "border-earth-600 bg-earth-600 text-white shadow-[0_18px_32px_rgba(84,39,70,0.12)]"
                          : "border-earth-100 bg-white/80 text-earth-800 hover:border-earth-200 hover:bg-white"
                      }`}
                    >
                      <div>
                        <div className="font-display text-[1.55rem] font-bold sm:text-2xl">{route.displayName}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative lg:h-full">
              <div className="relative min-h-[25.2rem] overflow-hidden rounded-[3.5rem] shadow-[0_32px_60px_rgba(84,39,70,0.12)] sm:min-h-[24rem] lg:h-full lg:min-h-0">
                <img
                  src={activeRoute?.image || exportIntroImage}
                  alt="Export route overview"
                  className="absolute inset-0 h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,252,0.08)_0%,rgba(79,37,66,0.28)_46%,rgba(79,37,66,0.86)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_26%,rgba(255,255,255,0.42),transparent_30%),radial-gradient(circle_at_76%_18%,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_62%_62%,rgba(255,255,255,0.14),transparent_28%)]" />
                {activeRoute && (
                  <div className="absolute inset-x-0 bottom-0">
                    <div className="bg-gradient-to-t from-earth-900/88 via-earth-900/46 to-transparent px-6 pb-6 pt-16 text-white sm:px-8 sm:pb-8 sm:pt-20">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-earth-100">
                        Destination Breakdown
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <h3 className="font-display text-3xl font-bold sm:text-[2.5rem]">{activeRoute.displayName}</h3>
                      </div>
                      <p className="mt-4 max-w-xl text-sm leading-7 text-earth-100 sm:text-base">
                        {activeRoute.tooltipDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-32 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-stretch">
                  <div className="flex h-full flex-col justify-center">
            <h2 className="mb-5 font-display text-[2.35rem] font-bold text-earth-900 sm:mb-6 sm:text-4xl">
              {content?.qualityTitle || "The Quality Guarantee"}
            </h2>
            <div
              className="prosetext mb-6 text-base text-earth-700 sm:mb-8 sm:text-xl"
              dangerouslySetInnerHTML={{
                __html:
                  content?.technicalSpecs ||
                  "Our processing facilities utilize advanced laser sorting and X-ray inspection to guarantee 99.9% purity.",
              }}
            />

            <div className="flex flex-col gap-6">
              {qualityChecks.map((spec, index) => (
                <div key={index} className="flex items-start gap-4 border-l-2 border-earth-200 pl-6 transition-colors hover:border-earth-500">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-earth-600 shadow-sm">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-earth-900">{spec.title}</h4>
                    <p className="text-earth-600">{spec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-full min-w-0">
            <div className="flex h-full flex-col">
              <div className="flex flex-1 flex-col gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex min-w-0 h-[20.9rem] sm:h-[23.4rem] lg:h-[20.5rem]"
                >
                  <button
                    type="button"
                    onClick={() => scrollCertificatesBy(-1)}
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-earth-300/80 bg-earth-50/95 p-3 text-earth-700 shadow-sm transition-all hover:border-earth-400 hover:bg-white active:scale-95 sm:left-0 sm:-translate-x-1/2 sm:p-4"
                    aria-label="Scroll certificates left"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div
                    ref={certificateScrollerRef}
                    className="scrollbar-hide h-full w-full overflow-x-auto overflow-y-visible px-[calc(50%-7rem)] py-2 snap-x snap-mandatory touch-pan-x sm:px-12 sm:py-3 lg:py-0"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
                  >
                    <div className="flex h-full min-w-max items-stretch gap-3 pr-[calc(50%-7rem)] sm:gap-4 sm:pr-20">
                      {certifications.map((cert, index) => (
                        <motion.div
                          key={`${cert.caption}-${index}`}
                          data-certificate-card="true"
                          className="group flex w-[12.5rem] shrink-0 snap-center flex-col overflow-hidden rounded-[1.75rem] border border-earth-200 bg-white/70 sm:w-[13.5rem] sm:snap-start lg:h-full lg:w-[14rem]"
                        >
                          <div className="flex flex-1 items-center justify-center overflow-hidden bg-earth-50">
                            <img
                              src={cert.image}
                              alt={cert.caption}
                              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                              referrerPolicy="no-referrer"
                              draggable={false}
                            />
                          </div>
                          <div className="flex min-h-[2.7rem] items-center justify-center px-3 py-2 text-center">
                            <p className="line-clamp-2 text-center text-[0.82rem] font-medium leading-4 text-earth-800">
                              {cert.caption}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollCertificatesBy(1)}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-earth-300/80 bg-earth-50/95 p-3 text-earth-700 shadow-sm transition-all hover:border-earth-400 hover:bg-white active:scale-95 sm:right-0 sm:translate-x-1/2 sm:p-4"
                    aria-label="Scroll certificates right"
                  >
                    <ChevronRight size={20} />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
