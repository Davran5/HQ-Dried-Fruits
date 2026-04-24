import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { Marquee } from "@/src/components/ui/Marquee";
import { Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { AboutContent } from "@/src/types/page";

export function About() {
  const { pages, pageSeo, globalSettings } = usePages();
  const { t } = useLanguage();
  const uiLabels = globalSettings.uiLabels || {};
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
  const [isDesktopFacilityViewport, setIsDesktopFacilityViewport] = useState(false);
  const heritageStats = content?.heritageStats || [
    { boxNumber: "1994", title: t("heritageStat1Title"), description: t("heritageStat1Desc") },
    { boxNumber: "2005", title: t("heritageStat2Title"), description: t("heritageStat2Desc") },
    { boxNumber: "2012", title: t("heritageStat3Title"), description: t("heritageStat3Desc") },
    { boxNumber: "2023", title: t("heritageStat4Title"), description: t("heritageStat4Desc") }
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
            title: t("prodStep1Title"),
            subtitle: t("prodStep1Subtitle"),
            description: t("prodStep1Desc"),
          },
          {
            image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop",
            title: t("prodStep2Title"),
            subtitle: t("prodStep2Subtitle"),
            description: t("prodStep2Desc"),
          },
          {
            image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1200&auto=format&fit=crop",
            title: t("prodStep3Title"),
            subtitle: t("prodStep3Subtitle"),
            description: t("prodStep3Desc"),
          },
          {
            image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
            title: t("prodStep4Title"),
            subtitle: t("prodStep4Subtitle"),
            description: t("prodStep4Desc"),
          },
        ];
  const aboutHeroImage =
    content?.heroBgImage ||
    content?.productionMarqueeImages?.[0] ||
    content?.missionPhotography ||
    "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1800&auto=format&fit=crop";
  const aboutHeroTitle = content?.marqueeTitle || t("aboutHeroTitle");
  const aboutHeroSubtitle =
    content?.heroSubtitle || content?.heritageSubtitle || t("aboutHeroSubtitle");
  const missionPanels = [
    {
      eyebrow: t("missionPurposeLabel"),
      title: content?.missionTitle || "Our Mission",
      html:
        content?.missionStatement ||
        "<p>Our mission is to bridge traditional sun-drying methods with modern food safety regulations.</p>",
    },
    {
      eyebrow: t("missionHeritageLabel"),
      title: content?.philosophyTitle || "Heritage & Philosophy",
      html:
        content?.whoWeAreContent ||
        "<p>Deeply embedded in the agricultural heart of Central Asia, we cultivate, process, and export dried fruits with long-term consistency for wholesale buyers.</p>",
    },
    {
      eyebrow: t("missionPhilosophyLabel"),
      title: t("orchardPhilosophyLabel"),
      plain:
        content?.orchardPhilosophy ||
        "We believe in sustainable agriculture without compromising on bulk efficiency.",
      isQuote: true,
    },
    {
      eyebrow: t("missionStandardsLabel"),
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
      : `<p>${t("whoWeAreFallback1")}</p><p>${t("whoWeAreFallback2")}</p>`;

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

  return (
    <PageLayout>
      <section className="relative h-[42rem] overflow-hidden rounded-b-[4rem] md:h-[40rem] sm:rounded-b-[6rem]">
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

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-36 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 overflow-visible py-2">
              <motion.h1
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: springEasing }}
                className="font-display text-[clamp(2.5rem,8vw,5.8rem)] font-bold leading-[1.02] text-white"
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
                {content?.companyEyebrow || t("aboutCompanyLabel")}
              </p>
              <h2 className="mt-4 max-w-[14ch] font-display text-[2.35rem] font-bold leading-tight text-earth-900 sm:mt-5 sm:text-5xl">
                {content?.heritageTitle || t("aboutHeritageTitle")}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-earth-700 sm:mt-4 sm:text-lg sm:leading-8">
                {content?.heritageSubtitle || t("aboutHeritageSubtitle")}
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
            {content?.partnerSectionLabel || t("aboutPartners")}
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
                <div className="flex items-center gap-3 font-display text-[1.8rem] font-bold text-earth-800 sm:text-[2.2rem]"><ShieldCheck className="h-9 w-9 text-earth-500 sm:h-10 sm:w-10" /> {t("haccpLabel")}</div>
                <div className="flex items-center gap-3 font-display text-[1.8rem] font-bold text-earth-800 sm:text-[2.2rem]"><Award className="h-9 w-9 text-earth-500 sm:h-10 sm:w-10" /> {t("isoLabel")}</div>
                <div className="flex items-center gap-3 font-display text-[1.8rem] font-bold text-earth-800 sm:text-[2.2rem]"><CheckCircle2 className="h-9 w-9 text-earth-500 sm:h-10 sm:w-10" /> {t("organicLabel")}</div>
                <div className="flex items-center gap-3 font-display text-[1.8rem] font-bold text-earth-800 sm:text-[2.2rem]">{t("globalGapLabel")}</div>
                <div className="flex items-center gap-3 font-display text-[1.8rem] font-bold text-earth-800 sm:text-[2.2rem]">{t("fdaLabel")}</div>
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
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-earth-500">{content?.missionNarrativeEyebrow || t("missionNarrativeEyebrow")}</p>
            <h2 className="mt-4 font-display text-4xl font-bold text-earth-900 sm:text-5xl">
              {t("missionNarrativeTitle")}
            </h2>
            <p className="mt-5 text-lg leading-8 text-earth-700">
              {t("missionNarrativeSublabel")}
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
          <p className="text-sm font-bold uppercase tracking-[0.26em] text-earth-500">{content?.facilityEyebrow || t("insideFacilityEyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl font-bold text-earth-900 sm:text-5xl">
            {content?.ownProductionTitle || t("aboutOwnProductionTitle")}
          </h2>
          <p className="mt-5 text-lg leading-8 text-earth-700">
            {content?.ownProductionIntro || t("aboutOwnProductionIntro")}
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
                  <div className="max-w-md">
                    <p className={`text-xs font-bold uppercase tracking-[0.24em] transition-colors ${isActive ? "text-earth-100" : "text-earth-200/80"}`}>
                      {item.subtitle}
                    </p>
                    <h3 className="mt-3 font-display text-3xl font-bold text-white">
                      {item.title}
                    </h3>
                  </div>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key={`${item.title}-details`}
                        initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 12, filter: "blur(2px)" }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-4 overflow-hidden"
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
;
}
