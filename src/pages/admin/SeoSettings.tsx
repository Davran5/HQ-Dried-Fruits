import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { SeoFormSection, SEOData } from "@/src/components/admin/SeoFormSection";
import { useProducts } from "@/src/contexts/ProductContext";
import { defaultPageSeoSettings, usePages } from "@/src/contexts/PageContext";
import { getManagedPagePath, getManagedProductAnchorPath, type ManagedPageId } from "@/src/lib/routes";
import { useAdminLanguage } from "@/src/contexts/AdminLanguageContext";
import { useAdminHeaderTabs, useAdminSidebarAction } from "@/src/components/layout/AdminLayout";

interface PageSEO {
  id: string;
  name: string;
  path: string;
  seo: SEOData;
}

const staticPageMetadata = [
  { id: "home", name: "Home" },
  { id: "about", name: "About Us" },
  { id: "products", name: "Products" },
  { id: "export", name: "Export" },
  { id: "contacts", name: "Contacts" },
  { id: "privacy", name: "Privacy Policy" },
  { id: "terms", name: "Terms of Service" },
];

export function AdminSeoSettings() {
  const { products, updateProduct, refreshProducts } = useProducts();
  const { pageSeo, updatePageSeo, refreshData } = usePages();
  const { editingLang } = useAdminLanguage();
  const { setAction } = useAdminSidebarAction();
  const { setHeaderTabs } = useAdminHeaderTabs();
  const [selectedSeoId, setSelectedSeoId] = useState("home");
  const [editingPage, setEditingPage] = useState<PageSEO | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refresh all data whenever the editing language changes
  useEffect(() => {
    const loadLangData = async () => {
      setIsRefreshing(true);
      try {
        await Promise.all([
            refreshData(editingLang),
            refreshProducts(editingLang)
        ]);
      } catch (err) {
        console.error("Failed to load language data:", err);
      } finally {
        setIsRefreshing(false);
      }
    };
    loadLangData();
  }, [editingLang]);

  const staticPages: PageSEO[] = useMemo(
    () => staticPageMetadata.map((page) => ({
      ...page,
      path: getManagedPagePath(page.id as ManagedPageId, pageSeo, editingLang),
      seo: pageSeo[page.id] || defaultPageSeoSettings[page.id],
    })),
    [editingLang, pageSeo],
  );

  const combinedPages: PageSEO[] = useMemo(
    () => [
      ...staticPages,
      ...products.map((product) => ({
        id: `product:${product.id}`,
        name: `Product: ${product.name}`,
        path: getManagedProductAnchorPath(product, pageSeo, editingLang),
        seo: product.seo || {
          metaTitle: `${product.name} | HQ Dried Fruits`,
          metaDescription: product.shortDescription,
          slug: product.id,
          ogTitle: product.name,
          imageAlt: product.name,
        },
      })),
    ],
    [editingLang, pageSeo, products, staticPages],
  );

  const selectedSourcePage = useMemo(
    () => combinedPages.find((page) => page.id === selectedSeoId) || combinedPages[0] || null,
    [combinedPages, selectedSeoId],
  );

  useEffect(() => {
    if (!selectedSourcePage) return;
    setEditingPage(JSON.parse(JSON.stringify(selectedSourcePage)));
  }, [selectedSourcePage]);

  useEffect(() => {
    setHeaderTabs(
      combinedPages.map((page) => ({
        id: page.id,
        label: page.name,
        sublabel: page.path,
        onClick: () => setSelectedSeoId(page.id),
      })),
      selectedSeoId,
    );

    return () => setHeaderTabs(null);
  }, [combinedPages, selectedSeoId, setHeaderTabs]);

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    setIsSaving(true);
    try {
      if (editingPage.id.startsWith("product:")) {
        const productId = editingPage.id.replace("product:", "");
        const targetProduct = products.find((product) => product.id === productId);
        if (targetProduct) {
          await updateProduct(productId, { ...targetProduct, seo: editingPage.seo }, editingLang);
        }
      } else {
        await updatePageSeo(editingPage.id, editingPage.seo, editingLang);
      }

      setShowToast(true);
    } catch (error) {
      console.error("SEO save error:", error);
      alert(error instanceof Error ? error.message : "Failed to save SEO changes.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!editingPage) {
      setAction(null);
      return undefined;
    }

    setAction({
      label: "Save SEO",
      formId: `form-seo-${editingPage.id.replace(/:/g, "-")}`,
      isLoading: isSaving,
      disabled: isSaving,
    });

    return () => setAction(null);
  }, [editingPage, isSaving, setAction]);

  if (isRefreshing) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-earth-600" />
          <p className="text-sm text-slate-500 font-medium">Switching to {editingLang.toUpperCase()} SEO data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg border border-emerald-200"
          >
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span className="text-sm font-medium">SEO settings ({editingLang.toUpperCase()}) updated successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {editingPage && (
        <form id={`form-seo-${editingPage.id.replace(/:/g, "-")}`} onSubmit={handleSave} className="space-y-4">
          <SeoFormSection
            data={editingPage.seo}
            onChange={(seo) => setEditingPage({ ...editingPage, seo })}
          />

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => selectedSourcePage && setEditingPage(JSON.parse(JSON.stringify(selectedSourcePage)))}
              className="text-sm font-bold text-slate-600 hover:bg-slate-200"
            >
              Discard Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
