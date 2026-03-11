import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { FrontPage } from "./pages/FrontPage";
import { About } from "./pages/About";
import { Products } from "./pages/Products";
import { Export } from "./pages/Export";
import { Contacts } from "./pages/Contacts";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { AdminProducts } from "./pages/admin/Products";
import { AdminPages } from "./pages/admin/Pages";
import { AdminLeads } from "./pages/admin/Leads";

import { AdminSeoSettings } from "./pages/admin/SeoSettings";
import { AdminGlobalSettings } from "./pages/admin/GlobalSettings";
import { AdminMedia } from "./pages/admin/Media";
import { ProductProvider } from "./contexts/ProductContext";
import { PageProvider, usePages } from "./contexts/PageContext";
import { MediaProvider } from "./contexts/MediaContext";
import ScrollToTop from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageLayout } from "./components/layout/PageLayout";
import { Button } from "./components/ui/Button";
import { Loader2 } from "lucide-react";
import { resolveManagedProductPath, resolveStaticPageByPath, getManagedPagePath } from "./lib/routes";

function RouteLoading() {
  const { globalSettings } = usePages();
  const uiLabels = globalSettings.uiLabels;

  return (
    <div className="flex min-h-screen items-center justify-center bg-earth-50">
      <div className="flex flex-col items-center gap-4 text-earth-700">
        <Loader2 className="h-10 w-10 animate-spin text-earth-500" />
        <p className="font-medium">{uiLabels.routeLoadingLabel || "Loading route..."}</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  const { pageSeo, globalSettings } = usePages();
  const uiLabels = globalSettings.uiLabels;

  return (
    <PageLayout>
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 font-display text-4xl font-bold text-earth-900 sm:text-5xl">
          {uiLabels.notFoundTitle || "Page Not Found"}
        </h1>
        <p className="mb-8 text-lg text-earth-600">
          {uiLabels.notFoundBody || "The page you requested does not exist or its address has changed."}
        </p>
        <Link to={getManagedPagePath("home", pageSeo)}>
          <Button>{uiLabels.notFoundButtonLabel || "Back to Homepage"}</Button>
        </Link>
      </div>
    </PageLayout>
  );
}

function StaticPageResolver() {
  const location = useLocation();
  const { pageSeo, pageSeoLoaded } = usePages();

  if (!pageSeoLoaded) {
    return <RouteLoading />;
  }

  const resolved = resolveStaticPageByPath(location.pathname, pageSeo);
  if (!resolved) {
    return <NotFoundPage />;
  }

  if (resolved.canonicalPath !== location.pathname) {
    return <Navigate to={resolved.canonicalPath} replace />;
  }

  switch (resolved.pageId) {
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
    case "home":
      return <Navigate to="/" replace />;
    default:
      return <NotFoundPage />;
  }
}

function ProductRouteResolver() {
  const location = useLocation();
  const { pageSeo, pageSeoLoaded } = usePages();

  if (!pageSeoLoaded) {
    return <RouteLoading />;
  }

  const resolved = resolveManagedProductPath(location.pathname, pageSeo);
  if (!resolved) {
    return <NotFoundPage />;
  }

  if (resolved.canonicalPath !== location.pathname) {
    return <Navigate to={resolved.canonicalPath} replace />;
  }

  return <Navigate to={`${getManagedPagePath("products", pageSeo)}#${resolved.productSlug}`} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <MediaProvider>
        <PageProvider>
          <ProductProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<FrontPage />} />
                <Route path="/:productsSlug/:id" element={<ProductRouteResolver />} />
                <Route path="/:pageSlug" element={<StaticPageResolver />} />

                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<AdminProducts />} />

                  <Route path="pages" element={<AdminPages />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="seo" element={<AdminSeoSettings />} />
                  <Route path="globals" element={<AdminGlobalSettings />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </ProductProvider>
        </PageProvider>
      </MediaProvider>
    </ErrorBoundary>
  );
}
