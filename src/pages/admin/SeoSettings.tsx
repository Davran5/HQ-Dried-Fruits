import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ChevronDown, Globe, Package } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { SeoFormSection, SEOData } from "@/src/components/admin/SeoFormSection";
import { useProducts } from "@/src/contexts/ProductContext";
import { defaultPageSeoSettings, usePages } from "@/src/contexts/PageContext";
import { getManagedPagePath, getManagedProductAnchorPath, type ManagedPageId } from "@/src/lib/routes";

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
  const { products, updateProduct } = useProducts();
  const { pageSeo, updatePageSeo } = usePages();
  const [editingPage, setEditingPage] = useState<PageSEO | null>(null);
  const [showToast, setShowToast] = useState(false);

  const staticPages: PageSEO[] = staticPageMetadata.map((page) => ({
    ...page,
    path: getManagedPagePath(page.id as ManagedPageId, pageSeo),
    seo: pageSeo[page.id] || defaultPageSeoSettings[page.id],
  }));

  const combinedPages: PageSEO[] = [
    ...staticPages,
    ...products.map((product) => ({
      id: `product:${product.id}`,
      name: `Product: ${product.name}`,
      path: getManagedProductAnchorPath(product, pageSeo),
      seo: product.seo || {
        metaTitle: `${product.name} | HQ Dried Fruits`,
        metaDescription: product.shortDescription,
        slug: product.id,
        ogTitle: product.name,
        imageAlt: product.name,
      },
    })),
  ];

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  const handleEdit = (page: PageSEO) => {
    if (editingPage?.id === page.id) {
      setEditingPage(null);
      return;
    }

    setEditingPage(JSON.parse(JSON.stringify(page)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    try {
      if (editingPage.id.startsWith("product:")) {
        const productId = editingPage.id.replace("product:", "");
        const targetProduct = products.find((product) => product.id === productId);
        if (targetProduct) {
          await updateProduct(productId, { ...targetProduct, seo: editingPage.seo });
        }
      } else {
        await updatePageSeo(editingPage.id, editingPage.seo);
      }

      setShowToast(true);
      setEditingPage(null);
    } catch (error) {
      console.error("SEO save error:", error);
      alert(error instanceof Error ? error.message : "Failed to save SEO changes.");
    }
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg border border-emerald-200"
          >
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span className="text-sm font-medium">SEO settings updated successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">SEO Settings</h2>
          <p className="text-sm text-slate-500">Manage indexability and social sharing previews for all endpoints.</p>
        </div>
      </div>

      <div className="space-y-4">
        {combinedPages.map((page) => {
          const isExpanded = editingPage?.id === page.id;
          const isProduct = page.id.startsWith("product:");

          return (
            <div
              key={page.id}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? "border-earth-300 shadow-lg ring-1 ring-earth-500/10" : "border-slate-200 bg-white shadow-sm hover:border-earth-200"}`}
            >
              <div
                onClick={() => handleEdit(page)}
                className={`group flex items-center justify-between px-6 py-5 cursor-pointer select-none transition-colors ${isExpanded ? "bg-earth-50" : "hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors shrink-0 ${isExpanded ? "bg-earth-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-earth-100 group-hover:text-earth-600"}`}>
                    {isProduct ? <Package size={22} /> : <Globe size={22} />}
                  </div>
                  <div className="truncate">
                    <div className={`font-bold transition-colors ${isExpanded ? "text-earth-900" : "text-slate-900"}`}>{page.name}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="font-mono text-slate-400">{page.path}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
                      <span className="text-slate-500 truncate italic">"{page.seo.metaTitle}"</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`hidden md:block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white border ${isExpanded ? "border-earth-200 text-earth-600" : "border-slate-100 text-slate-400"}`}>
                    {isProduct ? "Product" : "Static Page"}
                  </span>
                  <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? "rotate-180 bg-earth-200 text-earth-700" : "text-slate-400 group-hover:text-earth-600"}`}>
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && editingPage && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
                  >
                    <div className="p-6 sm:p-10">
                      <form onSubmit={handleSave} className="space-y-8">
                        <SeoFormSection
                          data={editingPage.seo}
                          onChange={(seo) => setEditingPage({ ...editingPage, seo })}
                        />

                        <div className="flex items-center justify-end gap-3 pt-8 border-t border-slate-200">
                          <Button type="button" variant="ghost" onClick={() => setEditingPage(null)} className="text-slate-600 hover:bg-slate-200 text-sm font-bold">
                            Discard Changes
                          </Button>
                          <Button type="submit" className="bg-earth-600 hover:bg-earth-700 text-white min-w-[160px] shadow-lg shadow-earth-500/20 text-sm font-bold">
                            Update SEO Data
                          </Button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
