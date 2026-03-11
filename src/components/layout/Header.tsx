import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Leaf } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { usePages } from "@/src/contexts/PageContext";
import { useProducts } from "@/src/contexts/ProductContext";
import { canonicalizeManagedUrl, getManagedPagePath, pathsMatch } from "@/src/lib/routes";

export function Header() {
  const { globalSettings, pageSeo } = usePages();
  const { products } = useProducts();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const siteName = globalSettings.siteName || "HQ Dried Fruits";
  const uiLabels = globalSettings.uiLabels || {
    mobileNavigationTitle: "Navigation",
    mobileContactTitle: "Contact Us",
  };
  const activeLinks = (globalSettings.navLinks || []).map((link) => ({
    ...link,
    resolvedUrl: canonicalizeManagedUrl(link.url, pageSeo, products),
  }));
  const ctaUrl = canonicalizeManagedUrl(globalSettings.ctaUrl || "/contacts", pageSeo, products);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
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
          <Link to={getManagedPagePath("home", pageSeo)} className="flex items-center gap-2 group">
            <div className="flex items-center gap-3">
              {globalSettings.headerLogo ? (
                <img src={globalSettings.headerLogo} alt={`${siteName} logo`} className="h-10 w-auto" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-earth-600 text-white transition-all group-hover:bg-earth-500 group-hover:scale-110 shadow-lg shadow-earth-500/20">
                  <Leaf size={20} />
                </div>
              )}
              <span className="font-display text-xl font-bold tracking-tight">
                <span className="text-[#4b2240]">HQ Dried</span>{" "}
                <span className="text-[#8b5a89]">Fruits</span>
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
                  pathsMatch(link.resolvedUrl, location.pathname, pageSeo, products)
                    ? "text-earth-600"
                    : "text-earth-800"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute bottom-0 left-0 h-0.5 w-0 bg-earth-500 transition-all duration-300",
                  pathsMatch(link.resolvedUrl, location.pathname, pageSeo, products) ? "w-full" : "group-hover:w-full"
                )} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to={ctaUrl} className="hidden md:flex">
              <Button size="sm" className="rounded-full px-8 shadow-earth-500/10 hover:shadow-earth-500/30">
                {globalSettings.ctaText || "Get a Free Quote"}
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

              <div className="mb-12">
                <p className="text-xs font-bold tracking-widest text-earth-400 uppercase mb-6">
                  {uiLabels.mobileNavigationTitle || "Navigation"}
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
                          pathsMatch(link.resolvedUrl, location.pathname, pageSeo, products)
                            ? "text-earth-600 pl-4"
                            : "text-earth-900 hover:text-earth-600 hover:pl-4"
                        )}
                      >
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full bg-earth-500 opacity-0 transition-opacity",
                          pathsMatch(link.resolvedUrl, location.pathname, pageSeo, products) ? "opacity-100" : "group-hover:opacity-100"
                        )} />
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              <div className="mt-auto">
                <div className="mb-8 space-y-4">
                  <p className="text-xs font-bold tracking-widest text-earth-400 uppercase">
                    {uiLabels.mobileContactTitle || "Contact Us"}
                  </p>
                  <p className="text-earth-900 font-medium">{globalSettings.emailAddress || "export@hqdriedfruits.com"}</p>
                  <p className="text-earth-900 font-medium">{globalSettings.phoneNumber || "+998 90 123 45 67"}</p>
                </div>

                <Link to={ctaUrl}>
                  <Button size="lg" className="w-full h-16 text-lg rounded-2xl shadow-lg shadow-earth-500/20">
                    {globalSettings.ctaText || "Get a Free Quote"}
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
