import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Leaf } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { usePages } from "@/src/contexts/PageContext";
import { useProducts } from "@/src/contexts/ProductContext";
import { canonicalizeManagedUrl, getManagedPagePath, pathsMatch } from "@/src/lib/routes";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { ACTIVE_LOCALES, languageNames, getNavLabel, type Language } from "@/src/i18n";
import type { TranslationKey } from "@/src/i18n/en";

const SUPPORTED_LANGUAGES: Language[] = [...ACTIVE_LOCALES];

export function Header() {
  const { globalSettings, pageSeo } = usePages();
  const { products } = useProducts();
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const location = useLocation();
  const siteName = globalSettings.siteName || "HQ Dried Fruits";
  const activeLinks = (globalSettings.navLinks || []).map((link) => ({
    ...link,
    resolvedUrl: canonicalizeManagedUrl(link.url, pageSeo, products, language),
  }));
  const ctaUrl = canonicalizeManagedUrl(globalSettings.ctaUrl || "/contacts", pageSeo, products, language);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setLanguageMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "py-3" : "py-6"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500 border",
            isScrolled
              ? "bg-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl border-white/20"
              : "bg-white/30 backdrop-blur-md border-white/10 shadow-none"
          )}
        >
          <Link to={getManagedPagePath("home", pageSeo, language)} className="flex items-center gap-2 group">
            <div className="flex items-center gap-3">
              {globalSettings.headerLogo ? (
                <img src={globalSettings.headerLogo} alt={`${siteName} logo`} className="h-10 w-auto" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-earth-600 text-white transition-all group-hover:bg-earth-500 group-hover:scale-110 shadow-lg shadow-earth-500/20">
                  <Leaf size={20} />
                </div>
              )}
              <span className="font-display text-xl font-bold tracking-tight text-[#4b2240]">
                {siteName}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {activeLinks?.map((link) => (
              <Link
                key={link.label}
                to={link.resolvedUrl}
                className={cn(
                  "relative text-sm font-semibold transition-all hover:text-earth-600 py-1 group",
                  pathsMatch(link.resolvedUrl, location.pathname, pageSeo, products, language)
                    ? "text-earth-600"
                    : "text-earth-800"
                )}
              >
                {getNavLabel(link.url, link.label, t)}
                <span className={cn(
                  "absolute bottom-0 left-0 h-0.5 w-0 bg-earth-500 transition-all duration-300",
                  pathsMatch(link.resolvedUrl, location.pathname, pageSeo, products, language) ? "w-full" : "group-hover:w-full"
                )} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div
              className="relative hidden h-9 w-12 md:block"
              aria-label={t("langSwitcherLabel")}
              onMouseEnter={() => setLanguageMenuOpen(true)}
              onMouseLeave={() => setLanguageMenuOpen(false)}
              onFocus={() => setLanguageMenuOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setLanguageMenuOpen(false);
                }
              }}
            >
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((open) => !open)}
                className="relative z-10 flex h-9 w-12 items-center justify-center rounded-full border border-[#8b5a89]/25 bg-white/70 text-[11px] font-extrabold tracking-[0.16em] text-[#4b2240] shadow-[0_8px_24px_rgba(75,34,64,0.08)] backdrop-blur-md transition-all hover:border-[#8b5a89]/40 hover:bg-white"
                aria-expanded={languageMenuOpen}
              >
                {languageNames[language]}
              </button>

              <div
                className={cn(
                  "absolute right-0 top-0 z-20 grid h-9 w-[9.75rem] origin-right grid-cols-3 gap-1 rounded-full border border-[#8b5a89]/20 bg-white/90 p-1 shadow-[0_14px_38px_rgba(75,34,64,0.16)] backdrop-blur-xl transition-all duration-200",
                  languageMenuOpen
                    ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
                    : "pointer-events-none translate-x-1 scale-95 opacity-0"
                )}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setLanguage(lang);
                      setLanguageMenuOpen(false);
                    }}
                    className={cn(
                      "flex h-7 items-center justify-center rounded-full text-[11px] font-extrabold tracking-[0.16em] transition-all duration-150",
                      language === lang
                        ? "bg-[#4b2240] text-white shadow-md shadow-[#4b2240]/20"
                        : "text-[#4b2240]/65 hover:bg-[#f4edf2] hover:text-[#4b2240]"
                    )}
                    aria-pressed={language === lang}
                    tabIndex={languageMenuOpen ? 0 : -1}
                  >
                    {languageNames[lang]}
                  </button>
                ))}
              </div>
            </div>

            <Link to={ctaUrl} className="hidden md:flex">
              <Button size="sm" className="rounded-full px-8 shadow-earth-500/10 hover:shadow-earth-500/30">
                {globalSettings.ctaText || t("navCta")}
              </Button>
            </Link>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden relative h-10 w-10 flex items-center justify-center rounded-full bg-earth-50 text-earth-800 shadow-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="relative h-5 w-5">
                <motion.span
                  animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 0 : -6 }}
                  className="absolute inset-0 m-auto h-0.5 w-5 bg-current rounded-full transition-all"
                />
                <motion.span
                  animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
                  className="absolute inset-0 m-auto h-0.5 w-5 bg-current rounded-full transition-all"
                />
                <motion.span
                  animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? 0 : 6 }}
                  className="absolute inset-0 m-auto h-0.5 w-5 bg-current rounded-full transition-all"
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden bg-earth-900/40 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col p-8 pt-24"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-8 right-8 p-2 text-earth-800 hover:rotate-90 transition-transform"
              >
                <X size={32} />
              </button>

              <div className="mb-8">
                <p className="text-xs font-bold tracking-widest text-earth-400 uppercase mb-6">
                  {t("mobileNavigationTitle")}
                </p>
                <nav className="flex flex-col gap-6">
                  {activeLinks?.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to={link.resolvedUrl}
                        className={cn(
                          "group flex items-center gap-4 text-3xl font-display font-bold transition-all",
                          pathsMatch(link.resolvedUrl, location.pathname, pageSeo, products, language)
                            ? "text-earth-600 pl-4"
                            : "text-earth-900 hover:text-earth-600 hover:pl-4"
                        )}
                      >
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full bg-earth-500 opacity-0 transition-opacity",
                          pathsMatch(link.resolvedUrl, location.pathname, pageSeo, products, language) ? "opacity-100" : "group-hover:opacity-100"
                        )} />
                        {getNavLabel(link.url, link.label, t)}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Mobile Language Switcher */}
              <div className="mb-8">
                <p className="text-xs font-bold tracking-widest text-earth-400 uppercase mb-4">
                  {t("langSwitcherLabel")}
                </p>
                <div className="flex gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={cn(
                        "flex-1 rounded-full border py-2 text-sm font-extrabold tracking-[0.14em] transition-all",
                        language === lang
                          ? "border-[#4b2240] bg-[#4b2240] text-white"
                          : "border-[#8b5a89]/20 bg-[#f8f3f6] text-[#4b2240] hover:border-[#8b5a89]/40"
                      )}
                    >
                      {languageNames[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <div className="mb-8 space-y-4">
                  <p className="text-xs font-bold tracking-widest text-earth-400 uppercase">
                    {t("mobileContactTitle")}
                  </p>
                  <p className="text-earth-900 font-medium">{globalSettings.emailAddress || "export@hqdriedfruits.com"}</p>
                  <p className="text-earth-900 font-medium">{globalSettings.phoneNumber || "+998 90 123 45 67"}</p>
                </div>

                <Link to={ctaUrl}>
                  <Button size="lg" className="w-full h-16 text-lg rounded-2xl shadow-lg shadow-earth-500/20">
                    {globalSettings.ctaText || t("navCta")}
                  </Button>
                </Link>

                <div className="mt-8 pt-8 border-t border-slate-100 flex gap-6">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-earth-50 text-earth-600 hover:bg-earth-600 hover:text-white transition-colors cursor-pointer">
                    <Leaf size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
