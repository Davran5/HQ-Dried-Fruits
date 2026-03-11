import { ReactNode, useEffect } from "react";
import { motion } from "motion/react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { usePages } from "@/src/contexts/PageContext";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const { globalSettings } = usePages();

  useEffect(() => {
    if (globalSettings.googleSiteVerificationId) {
      let meta = document.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', globalSettings.googleSiteVerificationId);
    }
  }, [globalSettings.googleSiteVerificationId]);

  useEffect(() => {
    const preventImageAction = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("img")) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventImageAction);
    document.addEventListener("dragstart", preventImageAction);

    return () => {
      document.removeEventListener("contextmenu", preventImageAction);
      document.removeEventListener("dragstart", preventImageAction);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--color-bg-primary)]">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-1 overflow-x-hidden"
        data-public-site="true"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
