import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Edit2, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { SeoFormSection, SEOData } from "@/src/components/admin/SeoFormSection";

interface PageSEO {
  id: string;
  name: string;
  path: string;
  seo: SEOData;
}

const initialSeoData: PageSEO[] = [
  {
    id: "home",
    name: "Home",
    path: "/",
    seo: {
      metaTitle: "UzbekSun Dried Fruits | Premium Organic Export",
      metaDescription: "Premium sun-dried fruits from the heart of Uzbekistan. We export the finest apricots, raisins, and prunes to global B2B partners.",
      slug: "",
      ogTitle: "UzbekSun Dried Fruits",
      imageAlt: "Sun-dried apricots from Uzbekistan"
    }
  },
  {
    id: "about",
    name: "About Us",
    path: "/about",
    seo: {
      metaTitle: "About UzbekSun | Our Heritage & Mission",
      metaDescription: "Decades of expertise in every harvest. Learn about our mission to deliver the uncompromised, natural sweetness of Uzbekistan's harvest to the world.",
      slug: "about",
      ogTitle: "About UzbekSun",
      imageAlt: "Sorting facility in Uzbekistan"
    }
  },
  {
    id: "products",
    name: "Products",
    path: "/products",
    seo: {
      metaTitle: "Wholesale Dried Fruits Catalog | UzbekSun",
      metaDescription: "Explore our premium selection of hand-picked and naturally sun-dried apricots, raisins, and prunes.",
      slug: "products",
      ogTitle: "UzbekSun Products",
      imageAlt: "Assorted dried fruits"
    }
  },
  {
    id: "export",
    name: "Export & Logistics",
    path: "/export",
    seo: {
      metaTitle: "Global Logistics & Export | UzbekSun",
      metaDescription: "Seamless global logistics from the heart of the Silk Road to your warehouse. We handle customs, packaging, and freight forwarding.",
      slug: "export",
      ogTitle: "UzbekSun Logistics",
      imageAlt: "Global supply map"
    }
  },
  {
    id: "contacts",
    name: "Contacts",
    path: "/contacts",
    seo: {
      metaTitle: "Contact UzbekSun | Wholesale Inquiries",
      metaDescription: "Get our latest wholesale pricing, request a sample box, or discuss logistics with our export team.",
      slug: "contacts",
      ogTitle: "Contact UzbekSun",
      imageAlt: "UzbekSun Headquarters Map"
    }
  }
];

export function AdminSeoSettings() {
  const [pages, setPages] = useState<PageSEO[]>(initialSeoData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageSEO | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleEdit = (page: PageSEO) => {
    setEditingPage(JSON.parse(JSON.stringify(page))); // Deep copy
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingPage(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      setPages(pages.map(p => p.id === editingPage.id ? editingPage : p));
      setShowToast(true);
    }
    handleClose();
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg border border-emerald-200"
          >
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span className="text-sm font-medium">SEO Settings Updated</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">SEO Settings</h2>
          <p className="text-sm text-slate-500">Manage meta tags, open graph data, and URLs for all pages.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Page Name</th>
                <th className="px-6 py-4 font-medium">Path</th>
                <th className="px-6 py-4 font-medium">Meta Title</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">{page.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{page.path}</td>
                  <td className="px-6 py-4 truncate max-w-xs">{page.seo.metaTitle}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(page)}
                        className="p-2 text-slate-400 hover:text-earth-600 hover:bg-earth-50 rounded-lg transition-colors flex items-center gap-1"
                        title="Edit SEO"
                      >
                        <Edit2 size={16} />
                        <span className="text-xs font-medium">Edit SEO</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && editingPage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={handleClose}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl"
            >
              <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md rounded-t-2xl">
                <h3 className="text-xl font-bold text-slate-900">
                  SEO Settings: {editingPage.name}
                </h3>
                <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <form id="seo-edit-form" onSubmit={handleSave} className="p-6">
                  <div className="mt-[-24px]">
                    <SeoFormSection 
                      data={editingPage.seo} 
                      onChange={(seo) => setEditingPage({ ...editingPage, seo })} 
                    />
                  </div>
                </form>
              </div>

              <div className="flex-none flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-600 hover:bg-slate-200">
                  Cancel
                </Button>
                <Button type="submit" form="seo-edit-form" className="bg-earth-600 hover:bg-earth-700 text-white">
                  Save SEO Settings
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
