import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { Marquee } from "@/src/components/ui/Marquee";
import { Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { AboutContent } from "@/src/types/page";

export function About() {
  const { pages, pageSeo } = usePages();
  const seo = pageSeo.about;
  const springEasing = [0.25, 1, 0.5, 1];

  useSEO({
    title: seo?.metaTitle || "About HQ Dried Fruits | Our Heritage & Mission",
    description: seo?.metaDescription || "Decades of expertise in every harvest. Learn about our mission to deliver the uncompromised, natural sweetness of Uzbekistan's harvest to the world.",
    ogTitle: seo?.ogTitle || "About HQ Dried Fruits"
  });
  const pageData = pages.find(p => p.id === "about");
  const content: AboutContent = pageData?.content;
  const [activeProductionIndex, setActiveProductionIndex] = useState(0);
  const [revealedProductionIndex, setRevealedProductionIndex] = useState(0);
  const [isDesktopFacilityViewport, setIsDesktopFacilityViewport] = useState(false);
  const heritageStats = content?.heritageStats || [
    { boxNumber: "1994", title: "The First Harvest", description: "Started as a small family orchard in the Fergana Valley." },
    { boxNumber: "2005", title: "Scaling Operations", description: "Introduced modern sun-drying techniques." },
    { boxNumber: "2012", title: "Going Global", description: "Achieved international organic certifications." },
    { boxNumber: "2023", title: "Modern Logistics", description: "State-of-the-art logistics hub in Tashkent." }
  ];
  const heritageImages =
    content?.heritageImagery?.length > 0
      ? content.heritageImagery.slice(0, 3)
      : [
          "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1200&auto=format&fit=crop",
        ];
  const ownProductionItems =
    content?.ownProductionItems?.length > 0
      ? content.ownProductionItems.slice(0, 4)
      : [
          {
            image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop",
            title: "Raw Intake",
            subtitle: "Harvest Selection",
            description: "Incoming fruit is sorted by batch, moisture profile, and destination requirements before processing begins.",
          },
          {
            image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop",
            title: "Processing",
            subtitle: "Laser & X-Ray Control",
            description: "Each production line is calibrated for purity, defect removal, and export-grade consistency across volume orders.",
          },
          {
            image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1200&auto=format&fit=crop",
            title: "Packaging",
            subtitle: "Buyer-Specific Formats",
            description: "We pack for retail, private label, and industrial shipments with the same in-house quality checks before dispatch.",
          },
          {
            image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
            title: "Dispatch",
            subtitle: "Export Handover",
            description: "Finished cargo is documented, palletized, and scheduled for the route that best fits the buyer’s timeline and market.",
          },
        ];
  const aboutHeroImage =
    content?.missionPhotography ||
    content?.productionMarqueeImages?.[0] ||
    "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1800&auto=format&fit=crop";
  const aboutHeroTitle = content?.marqueeTitle || "Global Partners & Facilities";
  const aboutHeroSubtitle =
    content?.heritageSubtitle || "A clearer look at the orchards, production standards, and operational infrastructure behind our export program.";
  const missionPanels = [
    {
      eyebrow: "Purpose",
      title: content?.missionTitle || "Our Mission",
      html:
        content?.missionStatement ||
        "<p>Our mission is to bridge traditional sun-drying methods with modern food safety regulations.</p>",
    },
    {
      eyebrow: "Heritage",
      title: content?.philosophyTitle || "Heritage & Philosophy",
      html:
        content?.whoWeAreContent ||
        "<p>Deeply embedded in the agricultural heart of Central Asia, we cultivate, process, and export dried fruits with long-term consistency for wholesale buyers.</p>",
    },
    {
      eyebrow: "Philosophy",
      title: "Orchard Philosophy",
      plain:
        content?.orchardPhilosophy ||
        "We believe in sustainable agriculture without compromising on bulk efficiency.",
      isQuote: true,
    },
    {
      eyebrow: "Standards",
      title: content?.productionStandardsTitle || "Production Standards",
      plain:
        content?.productionStandards ||
        "ISO 22000, HACCP, and Organic certified sorting lines.",
    },
  ];
  const excerptHtml = (value?: string, paragraphCount = 1) => {
    if (!value) return "";
    const normalized = value.replace(/<\/p>\s*<p>/gi, "</p><p>");
    const paragraphs = normalized.match(/<p>.*?<\/p>/gi);
    if (paragraphs?.length) {
      return paragraphs.slice(0, paragraphCount).join("");
    }
    return normalized;
  };
  const truncateText = (value?: string, limit = 180) => {
    if (!value) return "";
    return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
  };
  const condensedCompanyContent =
    content?.whoWeAreContent
      ? excerptHtml(content.whoWeAreContent, 2)
      : "<p>Deeply embedded in the agricultural heart of Central Asia, HQ Dried Fruits brings orchard control, processing discipline, and export execution into one operating system.</p><p>That structure helps wholesale buyers secure consistent product, clearer documentation, and repeatable shipment preparation across seasons.</p>";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateViewport = () => {
      setIsDesktopFacilityViewport(window.innerWidth >= 1024);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (isDesktopFacilityViewport) {
      return;
    }

    if (revealedProductionIndex === activeProductionIndex) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRevealedProductionIndex(activeProductionIndex);
    }, 340);

    return () => window.clearTimeout(timer);
  }, [activeProductionIndex, isDesktopFacilityViewport, revealedProductionIndex]);

  return (
    <PageLayout>
      <section className="relative h-[38rem] overflow-hidden rounded-b-[4rem] md:h-[36rem] sm:rounded-b-[6rem]">
        <motion.div
          initial={{ scale: 1.0 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 22, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 z-0 origin-center"
        >
          <img
            src={aboutHeroImage}
            alt={aboutHeroTitle}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-earth-900/84 via-earth-900/52 to-transparent" />
        </motion.div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 overflow-hidden">
              <motion.h1
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: springEasing }}
                className="font-display text-[3.9rem] font-bold leading-[0.92] text-white sm:text-[7.5rem] md:text-[9rem]"
              >
                {aboutHeroTitle}
              </motion.h1>
            </div>

            <div className="mx-auto max-w-3xl overflow-hidden">
              <motion.p
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: springEasing }}
                className="text-base text-earth-100 sm:text-xl"
              >
                {aboutHeroSubtitle}
              </motion.p>
            </div>
          </div>
        </div>
      </section>
      <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 pb-16 sm:-mt-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="rounded-[3rem] border border-earth-100 bg-white px-5 py-6 shadow-xl shadow-earth-200/60 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-start lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.65 }}
              className="relative p-0 sm:pr-4 lg:pr-10"
            >
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-earth-500">
                About The Company
              </p>
              <h2 className="mt-4 max-w-[14ch] font-display text-[2.35rem] font-bold leading-tight text-earth-900 sm:mt-5 sm:text-5xl">
                {content?.heritageTitle || "Our Roots in the Silk Road"}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-earth-700 sm:mt-4 sm:text-lg sm:leading-8">
                {content?.heritageSubtitle || "A journey of quality and tradition."}
              </p>

              <div
                className="prosetext mt-6 text-base leading-7 text-earth-700 sm:mt-8 sm:text-lg sm:leading-8"
                dangerouslySetInnerHTML={{
                  __html: condensedCompanyContent,
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="grid grid-cols-2 gap-4 sm:gap-5"
            >
              <div className="overflow-hidden rounded-[2.5rem] border border-earth-100 bg-white shadow-[0_24px_50px_rgba(84,39,70,0.08)] col-span-2">
                <img
                  src={heritageImages[0]}
                  alt="Company heritage"
                  className="h-[11.5rem] w-full object-cover sm:h-[16.8rem]"
                  referrerPolicy="no-referrer"
                />
              </div>
              {heritageImages.slice(1).map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="overflow-hidden rounded-[2rem] border border-earth-100 bg-white shadow-[0_20px_40px_rgba(84,39,70,0.07)]"
                >
                  <img
                    src={image}
                    alt={`Company story ${index + 2}`}
                    className="h-[10.2rem] w-full object-cover sm:h-[15.1rem]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      <section className="border-b border-earth-100 bg-white py-16 sm:py-20">
        <div className="mx-auto mb-8 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-widest text-earth-400">
            {content?.partnerSectionLabel || "Our Partners"}
          </p>
        </div>
        <Marquee speed={30} direction="right" className={content?.partnerLogos?.length > 0 ? "" : "opacity-60"}>
          <div className="flex items-center gap-20 px-8">
            {content?.partnerLogos?.length > 0 ? (
              content.partnerLogos.map((logo, i) => (
                <img key={i} src={logo} alt="Partner" className="h-16 w-auto grayscale contrast-125 hover:grayscale-0 transition-all sm:h-20" />
              ))
            ) : (
              <>
                <div className="flex items-center gap-3 font-display text-[1.8rem] font-bold text-earth-800 sm:text-[2.2rem]"><ShieldCheck className="h-9 w-9 text-earth-500 sm:h-10 sm:w-10" /> HACCP Certified</div>
                <div className="flex items-center gap-3 font-display text-[1.8rem] font-bold text-earth-800 sm:text-[2.2rem]"><Award className="h-9 w-9 text-earth-500 sm:h-10 sm:w-10" /> ISO 9001:2015</div>
                <div className="flex items-center gap-3 font-display text-[1.8rem] font-bold text-earth-800 sm:text-[2.2rem]"><CheckCircle2 className="h-9 w-9 text-earth-500 sm:h-10 sm:w-10" /> 100% Organic</div>
                <div className="flex items-center gap-3 font-display text-[1.8rem] font-bold text-earth-800 sm:text-[2.2rem]">GlobalGap</div>
                <div className="flex items-center gap-3 font-display text-[1.8rem] font-bold text-earth-800 sm:text-[2.2rem]">FDA Registered</div>
              </>
            )}
          </div>
        </Marquee>
      </section>
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fffafc_0%,#fcf5fa_100%)] py-24 sm:py-28">
        <div className="absolute left-[-7rem] top-10 h-56 w-56 rounded-full bg-earth-200/40 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-64 w-64 rounded-full bg-mint-100/30 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-earth-500">Mission Narrative</p>
            <h2 className="mt-4 font-display text-4xl font-bold text-earth-900 sm:text-5xl">
              What guides the way we grow, process, and deliver
            </h2>
            <p className="mt-5 text-lg leading-8 text-earth-700">
              A cleaner overview of the company mission, heritage, philosophy, and standards, shaped into one visual section.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)_minmax(0,0.92fr)] lg:items-stretch">
            <div className="grid gap-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="overflow-hidden rounded-[2.8rem] border border-earth-100 bg-white p-6 shadow-[0_22px_44px_rgba(84,39,70,0.07)]"
              >
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-earth-500">
                  {missionPanels[0].eyebrow}
                </p>
                <h3 className="mt-4 font-display text-3xl font-bold text-earth-900">
                  {missionPanels[0].title}
                </h3>
                <div
                  className="prosetext mt-5 text-base leading-7 text-earth-700"
                  dangerouslySetInnerHTML={{ __html: excerptHtml(missionPanels[0].html, 1) }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="overflow-hidden rounded-[2.8rem] border border-earth-100 bg-earth-50 p-6 shadow-[0_18px_38px_rgba(84,39,70,0.06)]"
              >
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-earth-500">
                  {missionPanels[2].eyebrow}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold text-earth-900">
                  {missionPanels[2].title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-earth-700">
                  {truncateText(missionPanels[2].plain, 165)}
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.65 }}
              className="relative overflow-hidden rounded-[3rem] border border-earth-100 bg-earth-50"
            >
              <img
                src={content?.missionPhotography || "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=2000"}
                alt="Facility"
                className="h-[22rem] w-full object-cover sm:h-[28rem] lg:h-full"
              />
            </motion.div>

            <div className="grid gap-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="overflow-hidden rounded-[2.8rem] border border-earth-100 bg-white p-6 shadow-[0_22px_44px_rgba(84,39,70,0.07)]"
              >
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-earth-500">
                  {missionPanels[1].eyebrow}
                </p>
                <h3 className="mt-4 font-display text-3xl font-bold text-earth-900">
                  {missionPanels[1].title}
                </h3>
                <div
                  className="prosetext mt-5 text-base leading-7 text-earth-700"
                  dangerouslySetInnerHTML={{ __html: excerptHtml(missionPanels[1].html, 1) }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: 0.12 }}
                className="overflow-hidden rounded-[2.8rem] border border-earth-100 bg-earth-50 p-6 shadow-[0_18px_38px_rgba(84,39,70,0.06)]"
              >
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-earth-500">
                  {missionPanels[3].eyebrow}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold text-earth-900">
                  {missionPanels[3].title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-earth-700">
                  {truncateText(missionPanels[3].plain, 165)}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.26em] text-earth-500">Inside The Facility</p>
          <h2 className="mt-4 font-display text-4xl font-bold text-earth-900 sm:text-5xl">
            {content?.ownProductionTitle || "Own Production"}
          </h2>
          <p className="mt-5 text-lg leading-8 text-earth-700">
            {content?.ownProductionIntro || "From orchard intake to final export packing, each production stage is managed inside our own operation for consistency, traceability, and buyer-ready execution."}
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:min-h-[34rem] lg:flex-row">
          {ownProductionItems.map((item, index) => {
            const isActive = index === activeProductionIndex;

            return (
              <motion.button
                key={`${item.title}-${index}`}
                type="button"
                onClick={() => {
                  if (!isDesktopFacilityViewport && index === activeProductionIndex) {
                    return;
                  }
                  setRevealedProductionIndex(-1);
                  setActiveProductionIndex(index);
                }}
                className={`group relative overflow-hidden rounded-[2.5rem] text-left transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? "h-[28rem]" : "h-[9rem]"
                } ${
                  isActive ? "lg:flex-[2.2]" : "lg:flex-1"
                } lg:h-full`}
                initial={false}
                animate={{ flexGrow: isDesktopFacilityViewport ? (isActive ? 2.2 : 1) : 1 }}
                transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
                style={{ flexBasis: isDesktopFacilityViewport ? 0 : "auto" }}
                onAnimationComplete={() => {
                  if (isDesktopFacilityViewport && isActive) {
                    setRevealedProductionIndex(index);
                  }
                }}
              >
                <div className="absolute inset-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute inset-0 transition-all duration-500 ${isActive ? "bg-gradient-to-t from-earth-900/88 via-earth-900/36 to-transparent" : "bg-gradient-to-t from-earth-900/80 via-earth-900/30 to-transparent"}`} />
                </div>

                <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 lg:min-h-[26rem]">
                  <div className={`transition-[padding] duration-500 ${isActive ? "pb-20 sm:pb-[9.5rem] lg:pb-32" : "pb-0"}`}>
                  <p className={`text-xs font-bold uppercase tracking-[0.24em] transition-colors ${isActive ? "text-earth-100" : "text-earth-200/80"}`}>
                    {item.subtitle}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-bold text-white">
                    {item.title}
                  </h3>
                  </div>
                  <AnimatePresence initial={false}>
                    {isActive && revealedProductionIndex === index && (
                      <motion.div
                        key={`${item.title}-details`}
                        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 28, filter: "blur(2px)" }}
                        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-x-6 bottom-6 overflow-hidden sm:inset-x-8 sm:bottom-8"
                      >
                        <p className="max-w-md text-sm leading-6 text-earth-100 sm:text-base sm:leading-7">
                          {item.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </PageLayout>
  );
}
