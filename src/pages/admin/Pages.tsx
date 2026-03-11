import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Edit2, X, CheckCircle2, ChevronDown, Layout } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { usePages } from "@/src/contexts/PageContext";
import { PageData, HomeContent, AboutContent, ExportContent, ContactsContent, ProductsContent, SimplePageContent } from "@/src/types/page";
import { useAdminSidebarAction } from "@/src/components/layout/AdminLayout";

import { HomeForm } from "@/src/components/admin/forms/HomeForm";
import { AboutForm } from "@/src/components/admin/forms/AboutForm";
import { ExportForm } from "@/src/components/admin/forms/ExportForm";
import { ContactsForm } from "@/src/components/admin/forms/ContactsForm";
import { ProductsForm } from "@/src/components/admin/forms/ProductsForm";
import { SimplePageForm } from "@/src/components/admin/forms/SimplePageForm";
import { getManagedPagePath, type ManagedPageId } from "@/src/lib/routes";

export function AdminPages() {
  const { pages, updatePage, pageSeo } = usePages();
  const { setAction } = useAdminSidebarAction();
  const [editingPage, setEditingPage] = useState<PageData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEdit = (page: PageData) => {
    if (editingPage?.id === page.id) {
      handleClose();
      return;
    }
    setEditingPage(JSON.parse(JSON.stringify(page)));
  };

  const handleClose = () => {
    setEditingPage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      try {
        await updatePage(editingPage.id, editingPage);
        setSuccessMessage(`${editingPage.name} page updated successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        handleClose();
      } catch (error) {
        console.error("Failed to save page:", error);
        alert(`Failed to save ${editingPage.name}. Please try again.`);
      }
    }
  };

  useEffect(() => {
    if (editingPage) {
      setAction({
        label: `Save ${editingPage.name}`,
        formId: `form-${editingPage.id}`,
      });
      return () => setAction(null);
    }

    setAction(null);
    return undefined;
  }, [editingPage, setAction]);

  const renderFormContent = () => {
    if (!editingPage) return null;

    const updateContent = (updates: any) => {
      setEditingPage({
        ...editingPage,
        content: { ...editingPage.content, ...updates }
      });
    };

    switch (editingPage.id) {
      case "home":
        return <HomeForm content={editingPage.content as HomeContent} updateContent={updateContent} />;
      case "about":
        return <AboutForm content={editingPage.content as AboutContent} updateContent={updateContent} />;
      case "products":
        return <ProductsForm content={editingPage.content as ProductsContent} updateContent={updateContent} />;
      case "export":
        return <ExportForm content={editingPage.content as ExportContent} updateContent={updateContent} />;
      case "contacts":
        return <ContactsForm content={editingPage.content as ContactsContent} updateContent={updateContent} />;
      case "privacy":
      case "terms":
        return <SimplePageForm content={editingPage.content as SimplePageContent} updateContent={updateContent} />;
      default:
        return <p className="text-slate-500">Form not configured for this page type.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Static Pages</h2>
          <p className="text-sm text-slate-500">Manage structure, layout, and copy for the main site.</p>
        </div>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-emerald-800 border border-emerald-200"
          >
            <CheckCircle2 size={18} />
            <p className="text-sm font-medium">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {pages.map((page) => {
          const isExpanded = editingPage?.id === page.id;
          return (
            <div key={page.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-earth-300 shadow-md ring-1 ring-earth-500/10' : 'border-slate-200 bg-white shadow-sm'}`}>
              <div
                onClick={() => handleEdit(page)}
                className={`flex items-center justify-between px-6 py-4 cursor-pointer select-none transition-colors ${isExpanded ? 'bg-earth-50' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-earth-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Layout size={20} />
                  </div>
                  <div>
                    <h3 className={`font-bold transition-colors ${isExpanded ? 'text-earth-900' : 'text-slate-900'}`}>{page.name}</h3>
                    <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      Internal Path: <span className="text-earth-600/70">{getManagedPagePath(page.id as ManagedPageId, pageSeo)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'rotate-180 bg-earth-200 text-earth-700' : 'text-slate-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-slate-100 bg-slate-50"
                  >
                    <div className="p-6 sm:p-8">
                      <form id={`form-${page.id}`} onSubmit={handleSave} className="space-y-8">
                        {renderFormContent()}

                        <div className="flex items-center justify-end gap-3 pt-8 border-t border-slate-200">
                          <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-600 hover:bg-slate-200">
                            Cancel
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
