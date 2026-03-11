import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { useProducts } from "@/src/contexts/ProductContext";
import { ExportContent, HomeContent } from "@/src/types/page";
import { canonicalizeManagedUrl, getManagedPagePath } from "@/src/lib/routes";

export function FrontPage() {
    const { pages, globalSettings, pageSeo } = usePages();
    const { products } = useProducts();
    const pageData = pages.find(p => p.id === "home");
    const content = pageData?.content as HomeContent;
    const exportPageData = pages.find(p => p.id === "export");
    const exportContent = exportPageData?.content as ExportContent | undefined;
    const seo = pageSeo.home;
    const certificateScrollerRef = useRef<HTMLDivElement | null>(null);

    useSEO({
        title: seo?.metaTitle || "HQ Dried Fruits",
        description: seo?.metaDescription || "High-quality sun-dried fruits from Uzbekistan.",
        ogTitle: seo?.ogTitle || "HQ Dried Fruits",
        ogImage: globalSettings?.headerLogo || "",
        googleSiteVerificationId: globalSettings?.googleSiteVerificationId || ""
    });

    if (!content) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-earth-50">
                <Loader2 className="h-12 w-12 animate-spin text-earth-600 mb-4" />
                <p className="text-earth-600 font-medium animate-pulse">Loading Experience...</p>
            </div>
        );
    }

    const springEasing = [0.25, 1, 0.5, 1]; // Custom cubic-bezier equivalent
    const exportMarkets =
        content.exportMarkets?.length > 0
            ? content.exportMarkets
            : [
                {
                    countryName: "Germany",
                    shortDescription: "Structured pallet and container supply for Central European wholesale buyers.",
                    statLabel: "Lead Time Window",
                    statValue: "18-24 days",
                    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=1600&auto=format&fit=crop",
                },
                {
                    countryName: "Netherlands",
                    shortDescription: "High-frequency logistics support for import partners and regional distribution hubs.",
                    statLabel: "Port Routing",
                    statValue: "Rotterdam-first",
                    image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1600&auto=format&fit=crop",
                },
                {
                    countryName: "UAE",
                    shortDescription: "Flexible mixed-load planning for GCC trade routes and re-export buyers.",
                    statLabel: "Documentation",
                    statValue: "Buyer-ready set",
                    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
                },
                {
                    countryName: "Kazakhstan",
                    shortDescription: "Fast regional replenishment with land-linked scheduling from Tashkent.",
                    statLabel: "Transport Mode",
                    statValue: "Road + rail",
                    image: "https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=1600&auto=format&fit=crop",
                },
            ];
    const [activeExportMarketIndex, setActiveExportMarketIndex] = useState(0);
    const safeExportMarketIndex = Math.min(activeExportMarketIndex, Math.max(exportMarkets.length - 1, 0));
    const activeExportMarket = exportMarkets[safeExportMarketIndex];
    const homepageCertificates =
        exportContent?.certificationsGallery?.length && exportContent.certificationsGallery.length > 0
            ? exportContent.certificationsGallery
            : [
                {
                    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=800",
                    caption: "Export Documentation Set",
                },
                {
                    image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=800",
                    caption: "Food Safety Certification",
                },
                {
                    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800",
                    caption: "Organic Standard Certificate",
                },
                {
                    image: "https://images.unsplash.com/photo-1615461066841-6116ecaabb04?q=80&w=800",
                    caption: "Quality Assurance Record",
                },
            ];
    const homepageQualityChecks =
        exportContent?.qualityChecks?.length && exportContent.qualityChecks.length > 0
            ? exportContent.qualityChecks
            : [
                { title: "Export Documentation", description: "Commercial, origin, and compliance paperwork prepared for repeat international shipments." },
                { title: "Quality Verification", description: "Sorting, grading, and lot review completed before final release for wholesale buyers." },
                { title: "Dispatch Readiness", description: "Certificates, packing lists, and shipping files aligned before cargo leaves the facility." },
            ];
    const orderedAboutStats = useMemo(() => {
        const source = (content.statsGrid || []).slice(0, 4);
        const priorityMatchers = [/year|experience/i, /countries/i, /purity|sorting/i, /tons/i];
        const sorted = [...source].sort((a, b) => {
            const aIndex = priorityMatchers.findIndex((matcher) => matcher.test(a.label));
            const bIndex = priorityMatchers.findIndex((matcher) => matcher.test(b.label));
            const safeA = aIndex === -1 ? 99 : aIndex;
            const safeB = bIndex === -1 ? 99 : bIndex;
            return safeA - safeB;
        });
        return sorted;
    }, [content.statsGrid]);
    const findPreviewProduct = (categoryName: string) => {
        const normalized = categoryName.toLowerCase();

        return products.find((product) => {
            const haystack = `${product.name} ${product.category} ${product.id}`.toLowerCase();
            return haystack.includes(normalized) ||
                (normalized.includes("apricot") && haystack.includes("apricot")) ||
                (normalized.includes("raisin") && haystack.includes("raisin")) ||
                (normalized.includes("prune") && haystack.includes("prune"));
        });
    };
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
        scroller.scrollTo({ left: cards[safeIndex].offsetLeft, behavior });
    };
    const scrollCertificatesBy = (direction: -1 | 1) => {
        const currentIndex = getClosestCertificateIndex();
        scrollToCertificateIndex(currentIndex + direction);
    };

    return (
        <PageLayout>
            <section className="relative h-[45rem] w-full overflow-hidden rounded-b-[4rem] md:h-[42rem] sm:rounded-b-[6rem]">
                <motion.div
                    initial={{ scale: 1.0 }}
                    animate={{ scale: 1.15 }}
                    transition={{ duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 z-0 origin-center"
                >
                    <img
                        src={content.heroBgImage || "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2000"}
                        alt="Hero Background"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-earth-900/80 via-earth-900/40 to-transparent" />
                </motion.div>                <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-18 sm:px-6 sm:pb-24 lg:px-8">
                    <div className="max-w-3xl">
                        <div className="overflow-hidden mb-6">
                            <motion.h1
                                initial={{ y: "100%", opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: springEasing }}
                                className="font-display text-[3.9rem] font-bold leading-[0.92] text-white sm:text-[7.5rem] md:text-[9rem]"
                            >
                                {content.heroTitle || "Nature's Sweetness, Sun-Dried"}
                            </motion.h1>
                        </div>

                        <div className="overflow-hidden mb-8 max-w-xl">
                            <motion.p
                                initial={{ y: "100%", opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.15, ease: springEasing }}
                                className="text-base text-earth-100 sm:text-xl"
                            >
                                {content.heroSubtitle}
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: springEasing }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link to={getManagedPagePath("products", pageSeo)}>
                                <Button size="lg" variant="primary" className="shadow-xl shadow-earth-900/20">
                                    {content.heroPrimaryCtaLabel || "Request Wholesale Catalog"}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to={getManagedPagePath("about", pageSeo)}>
                                <Button size="lg" variant="outline" className="border-white/80 bg-white/8 text-white hover:bg-white/14">
                                    {content.heroSecondaryCtaLabel || "Our Processing Facilities"}
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {content.progressSlider?.length > 0 && (
                <section className="mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {content.progressSlider.map((item, index) => (
                            <div key={`${item.label}-${index}`} className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-lg backdrop-blur-sm">
                                <div className="h-40 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.label}
                                        className="h-full w-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <div className="px-5 py-4">
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth-500">{item.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            <section className="mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: springEasing }}
                    className="relative"
                >
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-stretch lg:gap-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.985, y: 22 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.75, ease: springEasing }}
                            className="group relative hidden min-h-[23rem] overflow-hidden rounded-[2.75rem] sm:min-h-[28rem] lg:block lg:h-full lg:min-h-0"
                        >
                            <img
                                src={
                                    content.progressSlider?.[0]?.image ||
                                    content.heroBgImage ||
                                    "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1800&auto=format&fit=crop"
                                }
                                alt={content.progressSlider?.[0]?.label || "HQ Dried Fruits abstract orchard visual"}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(84,39,70,0.18)_0%,rgba(255,255,255,0)_36%,rgba(59,28,50,0.44)_100%)]" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.38),transparent_26%),radial-gradient(circle_at_78%_24%,rgba(212,148,193,0.2),transparent_22%),radial-gradient(circle_at_58%_72%,rgba(255,255,255,0.16),transparent_26%)]" />
                        </motion.div>

                        <div className="flex min-h-full flex-col justify-center min-w-0">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.26em] text-earth-500">
                                    About Us
                                </p>
                                <h2 className="mt-4 font-display text-[2.45rem] font-bold text-earth-900 sm:text-4xl">
                                    {content.introLabel || "The HQ Dried Fruits Difference"}
                                </h2>
                                <div className="mt-6 overflow-hidden rounded-[2.25rem] lg:hidden">
                                    <img
                                        src={
                                            content.progressSlider?.[0]?.image ||
                                            content.heroBgImage ||
                                            "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1800&auto=format&fit=crop"
                                        }
                                        alt={content.progressSlider?.[0]?.label || "HQ Dried Fruits abstract orchard visual"}
                                        className="h-[14rem] w-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <div
                                    className="prosetext mt-5 max-w-2xl text-base leading-7 text-earth-700 sm:mt-6 sm:text-lg sm:leading-8"
                                    dangerouslySetInnerHTML={{ __html: content.introText || "" }}
                                />
                                <p className="mt-4 max-w-2xl text-base leading-7 text-earth-700 sm:mt-5 sm:text-lg sm:leading-8">
                                    Built around orchard relationships, disciplined processing, and buyer-ready export execution,
                                    our operation is designed to deliver consistent dried fruit quality at wholesale scale.
                                </p>
                            </div>
                            <div className="mt-6 hidden sm:mt-8 lg:block">
                                <Link to={getManagedPagePath("about", pageSeo)}>
                                    <Button variant="outline">
                                        Learn More About Us
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
                        {orderedAboutStats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.55, delay: i * 0.08, ease: springEasing }}
                                className={`px-1 py-2 text-center sm:px-3 ${/tons/i.test(stat.label) ? "col-span-3 justify-self-center max-w-[10.5rem] sm:col-span-2 sm:max-w-[12rem] lg:col-span-1 lg:max-w-none lg:justify-self-auto" : ""}`}
                            >
                                <AnimatedStatValue value={stat.value} emphasized={/tons/i.test(stat.label)} />
                                <p className="mt-1 text-[0.72rem] font-medium leading-tight text-earth-700 sm:text-sm">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-center lg:hidden">
                        <Link to={getManagedPagePath("about", pageSeo)}>
                            <Button variant="outline">
                                Learn More About Us
                            </Button>
                        </Link>
                    </div>
                </motion.section>
            </section>
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 flex flex-col items-center justify-between gap-5 sm:mb-16 sm:flex-row sm:gap-6">
                        <div>
                            <h2 className="font-display text-[2.3rem] font-bold text-earth-900 sm:text-4xl">
                                {content.productPreviewTitle}
                            </h2>
                        </div>
                        <Link to={getManagedPagePath("products", pageSeo)} className="hidden lg:block">
                            <Button variant="outline">{content.productPreviewButtonLabel || "View Full Catalog"}</Button>
                        </Link>
                    </div>

                    <div className="grid gap-5 sm:gap-6">
                        {(content.productCategories || []).map((product, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: i * 0.1, ease: springEasing }}
                                className="group relative overflow-hidden rounded-[3rem] border border-earth-100 bg-[linear-gradient(180deg,#fffdfd_0%,#fcf5fa_100%)] p-4 shadow-[0_18px_38px_rgba(84,39,70,0.06)] transition-all hover:shadow-[0_26px_54px_rgba(84,39,70,0.1)] sm:p-6"
                            >
                                {(() => {
                                    const previewProduct = findPreviewProduct(product.categoryName);
                                    const nutrition = previewProduct?.nutrition || {
                                        energy: "280 kcal",
                                        protein: "2.5 g",
                                        fat: "0.4 g",
                                        carbs: "72 g",
                                    };

                                    return (
                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(16rem,0.82fr)_minmax(4.8rem,0.16fr)] lg:items-stretch lg:gap-5">
                                    <div className="flex min-w-0 flex-col justify-center">
                                        <div className="mb-5 flex items-center gap-3">
                                            <span className="h-px w-10 bg-earth-300" />
                                            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-earth-400">
                                                Featured Harvest
                                            </p>
                                        </div>
                                        <h3 className="font-display text-[2.2rem] font-bold text-earth-900 sm:text-[2.2rem]">
                                            {product.categoryName}
                                        </h3>
                                        <p className="mt-3 max-w-[34ch] text-base leading-6 text-earth-700 sm:mt-4 sm:text-lg sm:leading-7">
                                            {product.shortDescription}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-3 text-sm">
                                            <span className="rounded-full bg-white px-4 py-2 font-medium text-earth-700 shadow-sm shadow-earth-100/80">
                                                Export-ready
                                            </span>
                                            <span className="rounded-full bg-white px-4 py-2 font-medium text-earth-700 shadow-sm shadow-earth-100/80">
                                                Wholesale supply
                                            </span>
                                        </div>

                                        <div className="mt-6 flex items-center gap-4">
                                            <Link
                                                to={canonicalizeManagedUrl(product.url, pageSeo, products)}
                                                className="inline-flex items-center text-earth-700 font-medium transition-colors hover:text-earth-900"
                                            >
                                                {content.productPreviewItemCtaLabel || "Request Sample"} <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                            <div className="h-px flex-1 bg-earth-100" />
                                        </div>
                                    </div>

                                    <div className="relative overflow-hidden rounded-[2.6rem] bg-earth-100">
                                        <img
                                            src={product.image}
                                            alt={product.categoryName}
                                            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 lg:h-full"
                                            referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-earth-900/30 via-earth-900/4 to-transparent" />
                                    </div>

                                    <div className="flex flex-col justify-between border-t border-earth-100 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                                        <div className="mb-3 text-center lg:text-left">
                                            <p className="text-[0.58rem] font-bold uppercase tracking-[0.22em] text-earth-400">
                                                Nutrition / 100g
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-4 gap-1.5 lg:grid-cols-1 lg:grid-rows-4 lg:justify-items-center">
                                            <div className="px-1 py-1.5 text-center lg:flex lg:h-full lg:w-[4.5rem] lg:flex-col lg:items-center lg:justify-center">
                                                <p className="text-center text-[0.56rem] font-bold uppercase tracking-[0.18em] text-earth-400">Energy</p>
                                                <p className="mt-1 text-center text-[0.82rem] font-bold text-earth-900 lg:text-[0.95rem]">{nutrition.energy}</p>
                                            </div>
                                            <div className="px-1 py-1.5 text-center lg:flex lg:h-full lg:w-[4.5rem] lg:flex-col lg:items-center lg:justify-center">
                                                <p className="text-center text-[0.56rem] font-bold uppercase tracking-[0.18em] text-earth-400">Protein</p>
                                                <p className="mt-1 text-center text-[0.82rem] font-bold text-earth-900 lg:text-[0.95rem]">{nutrition.protein}</p>
                                            </div>
                                            <div className="px-1 py-1.5 text-center lg:flex lg:h-full lg:w-[4.5rem] lg:flex-col lg:items-center lg:justify-center">
                                                <p className="text-center text-[0.56rem] font-bold uppercase tracking-[0.18em] text-earth-400">Fat</p>
                                                <p className="mt-1 text-center text-[0.82rem] font-bold text-earth-900 lg:text-[0.95rem]">{nutrition.fat}</p>
                                            </div>
                                            <div className="px-1 py-1.5 text-center lg:flex lg:h-full lg:w-[4.5rem] lg:flex-col lg:items-center lg:justify-center">
                                                <p className="text-center text-[0.56rem] font-bold uppercase tracking-[0.18em] text-earth-400">Carbs</p>
                                                <p className="mt-1 text-center text-[0.82rem] font-bold text-earth-900 lg:text-[0.95rem]">{nutrition.carbs}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                    );
                                })()}
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-center lg:hidden">
                        <Link to={getManagedPagePath("products", pageSeo)}>
                            <Button variant="outline">{content.productPreviewButtonLabel || "View Full Catalog"}</Button>
                        </Link>
                    </div>
                </div>
            </section>
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <motion.section
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: springEasing }}
                    className="relative"
                >
                    <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch lg:gap-10">
                        <div className="flex min-h-full flex-col justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.26em] text-earth-500">
                                    {content.exportMarketsEyebrow || "Export Focus"}
                                </p>
                                <h2 className="mt-4 max-w-[13ch] font-display text-[2.45rem] font-bold leading-tight text-earth-900 sm:text-5xl">
                                    {content.exportMarketsTitle || "Built for Buyers Across Key Trade Corridors"}
                                </h2>
                                <p className="mt-4 max-w-xl text-base leading-7 text-earth-700 sm:mt-5 sm:text-lg sm:leading-8">
                                    {content.exportMarketsIntro || "Our export team plans routing, documents, and buyer-ready packaging market by market. Select a destination to preview how we position each lane."}
                                </p>
                                <div className="mt-6 sm:mt-7">
                                    <Link to={getManagedPagePath("export", pageSeo)}>
                                        <Button variant="outline">
                                            Explore Export Page
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
                                {exportMarkets.map((market, index) => {
                                    const isActive = index === safeExportMarketIndex;

                                    return (
                                        <button
                                            key={`${market.countryName}-${index}`}
                                            type="button"
                                            onClick={() => setActiveExportMarketIndex(index)}
                                            className={`rounded-[1.8rem] border px-5 py-4 text-left transition-all ${
                                                isActive
                                                    ? "border-earth-600 bg-earth-600 text-white shadow-[0_18px_32px_rgba(84,39,70,0.12)]"
                                                    : "border-earth-100 bg-white/80 text-earth-800 hover:border-earth-200 hover:bg-white"
                                            }`}
                                        >
                                            <div className="font-display text-[1.55rem] font-bold sm:text-2xl">{market.countryName}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative lg:h-full">
                            <motion.div
                                key={activeExportMarket?.image || "export-market-fallback"}
                                initial={{ opacity: 0, scale: 0.985, y: 18 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className="relative min-h-[28.8rem] overflow-hidden rounded-[3.25rem] md:min-h-[30rem] lg:h-full lg:min-h-0"
                            >
                                <img
                                    src={activeExportMarket?.image || "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=1600&auto=format&fit=crop"}
                                    alt={activeExportMarket?.countryName || "Export market"}
                                    className="absolute inset-0 h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,252,0.08)_0%,rgba(79,37,66,0.28)_46%,rgba(79,37,66,0.86)_100%)]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_26%,rgba(255,255,255,0.42),transparent_30%),radial-gradient(circle_at_76%_18%,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_62%_62%,rgba(255,255,255,0.14),transparent_28%)]" />

                                {activeExportMarket && (
                                    <div className="absolute inset-x-0 bottom-0">
                                        <div className="bg-gradient-to-t from-earth-900/88 via-earth-900/46 to-transparent px-6 pb-6 pt-16 text-white sm:px-8 sm:pb-8 sm:pt-20">
                                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-earth-100">
                                                {content.exportMarketsEyebrow || "Export Focus"}
                                            </p>
                                            <h3 className="mt-3 font-display text-3xl font-bold sm:text-[2.5rem]">
                                                {activeExportMarket.countryName}
                                            </h3>
                                            <p className="mt-4 max-w-xl text-sm leading-7 text-earth-100 sm:text-base">
                                                {activeExportMarket.shortDescription}
                                            </p>
                                            <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm text-earth-100">
                                                <span className="font-semibold">{activeExportMarket.statLabel}</span>
                                                <span className="font-bold text-white">{activeExportMarket.statValue}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </motion.section>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-32 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-stretch">
                    <div className="flex h-full flex-col justify-center">
                        <h2 className="mb-5 font-display text-[2.35rem] font-bold text-earth-900 sm:mb-6 sm:text-4xl">
                            {exportContent?.qualityTitle || "The Quality Guarantee"}
                        </h2>
                        <div
                            className="prosetext mb-6 text-base text-earth-700 sm:mb-8 sm:text-xl"
                            dangerouslySetInnerHTML={{
                                __html:
                                    exportContent?.technicalSpecs ||
                                    "Our processing facilities utilize advanced laser sorting and X-ray inspection to guarantee 99.9% purity.",
                            }}
                        />

                        <div className="flex flex-col gap-6">
                            {homepageQualityChecks.map((spec, index) => (
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
                                            {homepageCertificates.map((cert, index) => (
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

function AnimatedStatValue({ value, emphasized = false }: { value: string; emphasized?: boolean }) {
    const [displayValue, setDisplayValue] = useState(value);
    const ref = useRef<HTMLParagraphElement | null>(null);
    const isInView = useInView(ref, { once: true, margin: "-20% 0px" });
    const parsed = useMemo(() => {
        const match = value.match(/(\d[\d,.]*)/);

        if (!match) {
            return null;
        }

        const numeric = Number(match[1].replace(/,/g, ""));
        if (!Number.isFinite(numeric)) {
            return null;
        }

        const prefix = value.slice(0, match.index ?? 0);
        const suffix = value.slice((match.index ?? 0) + match[1].length);
        const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;

        return { numeric, prefix, suffix, decimals };
    }, [value]);

    useEffect(() => {
        if (!parsed || !isInView) {
            setDisplayValue(value);
            return;
        }

        const controls = animate(0, parsed.numeric, {
            duration: 1.4,
            ease: "easeOut",
            onUpdate: (latest) => {
                const rounded = parsed.decimals > 0 ? latest.toFixed(parsed.decimals) : Math.round(latest).toString();
                const withSeparators = parsed.decimals > 0
                    ? Number(rounded).toLocaleString(undefined, {
                        minimumFractionDigits: parsed.decimals,
                        maximumFractionDigits: parsed.decimals,
                    })
                    : Number(rounded).toLocaleString();
                setDisplayValue(`${parsed.prefix}${withSeparators}${parsed.suffix}`);
            },
        });

        return () => controls.stop();
    }, [isInView, parsed, value]);

    return (
        <p ref={ref} className={`${emphasized ? "text-[3.2rem]" : "text-[2.15rem]"} font-bold leading-none text-earth-800 sm:text-6xl`}>
            {displayValue}
        </p>
    );
}
