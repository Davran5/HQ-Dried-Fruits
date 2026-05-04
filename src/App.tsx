import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { ComingSoon, isUnlocked } from "./pages/ComingSoon";
import { FrontPage } from "./pages/FrontPage";
import { About } from "./pages/About";
import { Products } from "./pages/Products";
import { Export } from "./pages/Export";
import { Contacts } from "./pages/Contacts";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { LocaleSelectorPage } from "./pages/LocaleSelector";
import { ProductDetail } from "./pages/ProductDetail";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { AdminPages } from "./pages/admin/Pages";
import { AdminLeads } from "./pages/admin/Leads";
import { AdminSeoSettings } from "./pages/admin/SeoSettings";
import { AdminGlobalSettings } from "./pages/admin/GlobalSettings";
import { AdminMedia } from "./pages/admin/Media";
import { ProductProvider, useProducts } from "./contexts/ProductContext";
import { PageProvider, usePages } from "./contexts/PageContext";
import { MediaProvider } from "./contexts/MediaContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import ScrollToTop from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageLayout } from "./components/layout/PageLayout";
import { Button } from "./components/ui/Button";
import { Loader2 } from "lucide-react";
import { getManagedPagePath, normalizePath, parseLocalePath, resolveManagedProductPath, resolveStaticPageByPath } from "./lib/routes";
import { PublicBootstrapPayload } from "./types/bootstrap";

function RouteLoading() {
  const { globalSettings } = usePages();
  const { t } = useLanguage();
  const uiLabels = globalSettings.uiLabels || {};

  return (
    <div className="flex min-h-screen items-center justify-center bg-earth-50">
      <div className="flex flex-col items-center gap-4 text-earth-700">
        <Loader2 className="h-10 w-10 animate-spin text-earth-500" />
        <p className="font-medium">{t("routeLoadingLabel")}</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  const { pageSeo, globalSettings } = usePages();
  const { locale, t } = useLanguage();
  const uiLabels = globalSettings.uiLabels || {};

  return (
    <PageLayout>
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 font-display text-4xl font-bold text-earth-900 sm:text-5xl">
          {t("notFoundTitle")}
        </h1>
        <p className="mb-8 text-lg text-earth-600">
          {t("notFoundBody")}
        </p>
        <Link to={getManagedPagePath("home", pageSeo, locale)}>
          <Button>{t("notFoundButtonLabel")}</Button>
        </Link>
      </div>
    </PageLayout>
  );
}

function FaviconUpdater() {
  const { globalSettings } = usePages();
  const faviconUrl = globalSettings.headerLogo || "";

  useEffect(() => {
    document
      .querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
      .forEach((link) => link.remove());

    if (!faviconUrl) return;

    ["icon", "apple-touch-icon"].forEach((rel) => {
      const link = document.createElement("link");
      link.rel = rel;
      link.href = faviconUrl;
      document.head.appendChild(link);
    });
  }, [faviconUrl]);

  return null;
}

function PublicRouteResolver() {
  const location = useLocation();
  const normalizedPath = normalizePath(location.pathname);
  const { locale } = useLanguage();
  const { pageSeo, pageSeoLoaded, pageDataLoaded } = usePages();
  const { productsLoaded } = useProducts();
  const parsedPath = parseLocalePath(normalizedPath);

  if (normalizedPath === "/") {
    return <LocaleSelectorPage />;
  }

  if (parsedPath.isLocalePrefixed && (!pageDataLoaded || !pageSeoLoaded || !productsLoaded)) {
    return <RouteLoading />;
  }

  const productMatch = resolveManagedProductPath(normalizedPath, pageSeo, locale);
  if (productMatch) {
    if (productMatch.canonicalPath !== normalizedPath) {
      return <Navigate to={productMatch.canonicalPath} replace />;
    }

    return <ProductDetail />;
  }

  const staticMatch = resolveStaticPageByPath(normalizedPath, pageSeo, locale);
  if (!staticMatch) {
    return <NotFoundPage />;
  }

  if (staticMatch.canonicalPath !== normalizedPath) {
    return <Navigate to={staticMatch.canonicalPath} replace />;
  }

  switch (staticMatch.pageId) {
    case "home":
      return <FrontPage />;
    case "about":
      return <About />;
    case "products":
      return <Products />;
    case "export":
      return <Export />;
    case "contacts":
      return <Contacts />;
    case "privacy":
      return <Privacy />;
    case "terms":
      return <Terms />;
    default:
      return <NotFoundPage />;
  }
}

function ComingSoonGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(() => isUnlocked());
  if (!unlocked) {
    return <ComingSoon onUnlock={() => setUnlocked(true)} />;
  }
  return <>{children}</>;
}

export function AppShell({ initialData }: { initialData?: PublicBootstrapPayload | null }) {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <MediaProvider>
          <PageProvider initialData={initialData}>
            <ProductProvider initialData={initialData}>
              <FaviconUpdater />
              <ScrollToTop />
              <Routes>
                <Route path="/control-room" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Navigate to="/control-room/pages" replace />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="seo" element={<AdminSeoSettings />} />
                  <Route path="globals" element={<AdminGlobalSettings />} />
                </Route>
                <Route
                  path="*"
                  element={
                    <ComingSoonGate>
                      <PublicRouteResolver />
                    </ComingSoonGate>
                  }
                />
              </Routes>
            </ProductProvider>
          </PageProvider>
        </MediaProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default function App({ initialData }: { initialData?: PublicBootstrapPayload | null }) {
  return (
    <Router>
      <AppShell initialData={initialData} />
    </Router>
  );
}
