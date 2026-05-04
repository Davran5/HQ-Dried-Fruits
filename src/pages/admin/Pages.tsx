import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { usePages } from "@/src/contexts/PageContext";
import { PageData, HomeContent, AboutContent, ExportContent, ContactsContent, ProductsContent, SimplePageContent } from "@/src/types/page";
import { useAdminHeaderTabs, useAdminSidebarAction } from "@/src/components/layout/AdminLayout";
import { HomeForm } from "@/src/components/admin/forms/HomeForm";
import { AboutForm } from "@/src/components/admin/forms/AboutForm";
import { ExportForm } from "@/src/components/admin/forms/ExportForm";
import { ContactsForm } from "@/src/components/admin/forms/ContactsForm";
import { ProductsForm } from "@/src/components/admin/forms/ProductsForm";
import { ProductCatalogManager } from "@/src/pages/admin/Products";
import { SimplePageForm } from "@/src/components/admin/forms/SimplePageForm";
import { getManagedPagePath, type ManagedPageId } from "@/src/lib/routes";
import { useAdminLanguage } from "@/src/contexts/AdminLanguageContext";
import { LocaleDraftStatus } from "@/src/components/admin/LocaleDraftStatus";
import { cloneDraft, draftKey, isSameDraft, unsavedLocalesFromDrafts } from "@/src/lib/adminDrafts";
import type { ActiveLocaleCode } from "@/src/i18n";

function clonePage(page: PageData) {
  return cloneDraft(page);
}

export function AdminPages() {
  const { pages, updatePage, pageSeo, refreshData } = usePages();
  const { editingLang } = useAdminLanguage();
  const { setAction } = useAdminSidebarAction();
  const { setHeaderTabs } = useAdminHeaderTabs();
  const [selectedPageId, setSelectedPageId] = useState<ManagedPageId>("home");
  const [editingPage, setEditingPage] = useState<PageData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productAction, setProductAction] = useState<any>(null);
  const [editingPageLocale, setEditingPageLocale] = useState<ActiveLocaleCode | null>(null);
  const [loadedEditingLang, setLoadedEditingLang] = useState<ActiveLocaleCode | null>(null);
  const [pageDrafts, setPageDrafts] = useState<Record<string, PageData>>({});
  const pageDraftsRef = useRef(pageDrafts);
  const refreshRequestIdRef = useRef(0);

  const selectedSourcePage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) || pages[0] || null,
    [pages, selectedPageId],
  );

  useEffect(() => {
    pageDraftsRef.current = pageDrafts;
  }, [pageDrafts]);

  const isLocaleReady = loadedEditingLang === editingLang && !isRefreshing;
  const activeDraftKey = draftKey(editingLang, selectedPageId);
  const unsavedDraftLocales = useMemo(() => unsavedLocalesFromDrafts(pageDrafts), [pageDrafts]);
  const hasActiveDraft = Boolean(pageDrafts[activeDraftKey]);

  useEffect(() => {
    if (!isLocaleReady || !selectedSourcePage) return;
    const draft = pageDraftsRef.current[draftKey(editingLang, selectedPageId)];
    setEditingPage(clonePage(draft || selectedSourcePage));
    setEditingPageLocale(editingLang);
  }, [editingLang, isLocaleReady, selectedPageId, selectedSourcePage]);

  useEffect(() => {
    setHeaderTabs(
      pages.map((page) => {
        const pageId = page.id as ManagedPageId;
        return {
          id: page.id,
          label: page.name,
          sublabel: getManagedPagePath(pageId, pageSeo, editingLang),
          onClick: () => setSelectedPageId(pageId),
        };
      }),
      selectedPageId,
    );

    return () => setHeaderTabs(null);
  }, [editingLang, pageSeo, pages, selectedPageId, setHeaderTabs]);

  useEffect(() => {
    const loadLangData = async () => {
      const requestId = refreshRequestIdRef.current + 1;
      refreshRequestIdRef.current = requestId;
      setIsRefreshing(true);
      setLoadedEditingLang(null);
      try {
        await refreshData(editingLang);
      } catch (err) {
        console.error("Failed to load language data:", err);
      } finally {
        if (requestId === refreshRequestIdRef.current) {
          setLoadedEditingLang(editingLang);
          setIsRefreshing(false);
        }
      }
    };

    void loadLangData();
  }, [editingLang]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    if (!isLocaleReady || editingPageLocale !== editingLang) {
      alert(`Still loading ${editingLang.toUpperCase()} content. Please wait before saving.`);
      return;
    }

    setIsSaving(true);
    try {
      await updatePage(editingPage.id, editingPage, editingLang);
      setPageDrafts((current) => {
        const next = { ...current };
        delete next[draftKey(editingLang, editingPage.id)];
        return next;
      });
      setSuccessMessage(`${editingPage.name} page (${editingLang.toUpperCase()}) updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save page:", error);
      alert(`Failed to save ${editingPage.name}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isLocaleReady) {
      setAction(null);
      return undefined;
    }

    if (!editingPage) {
      setAction(productAction || null);
      return undefined;
    }

    if (productAction) {
      setAction(productAction);
    } else {
      setAction({
        label: `Save ${editingPage.name}`,
        formId: `form-${editingPage.id}`,
        isLoading: isSaving,
        disabled: isSaving || isRefreshing || editingPageLocale !== editingLang,
      });
    }

    return () => setAction(null);
  }, [editingLang, editingPage, editingPageLocale, isLocaleReady, isRefreshing, isSaving, productAction, setAction]);

  const updateContent = (updates: any) => {
    setEditingPage((current) => {
      if (!current || editingPageLocale !== editingLang || !isLocaleReady) return current;
      const nextPage = {
        ...current,
        content: { ...current.content, ...updates },
      };

      const source = pages.find((page) => page.id === nextPage.id);
      setPageDrafts((drafts) => {
        const key = draftKey(editingLang, nextPage.id);
        const nextDrafts = { ...drafts };
        if (source && isSameDraft(nextPage.content, source.content)) {
          delete nextDrafts[key];
        } else {
          nextDrafts[key] = clonePage(nextPage);
        }
        return nextDrafts;
      });

      return nextPage;
    });
  };

  const renderFormContent = (catalogSlot?: React.ReactNode) => {
    if (!editingPage) return null;

    switch (editingPage.id) {
      case "home":
        return <HomeForm content={editingPage.content as HomeContent} updateContent={updateContent} />;
      case "about":
        return <AboutForm content={editingPage.content as AboutContent} updateContent={updateContent} />;
      case "products":
        return <ProductsForm content={editingPage.content as ProductsContent} updateContent={updateContent} catalogSlot={catalogSlot} />;
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

  const restoreCurrentPage = () => {
    setPageDrafts((drafts) => {
      const nextDrafts = { ...drafts };
      delete nextDrafts[activeDraftKey];
      return nextDrafts;
    });
    if (selectedSourcePage) {
      setEditingPage(clonePage(selectedSourcePage));
      setEditingPageLocale(editingLang);
    }
  };

  if (!isLocaleReady) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-earth-600" />
          <p className="text-sm font-medium text-slate-500">Switching to {editingLang.toUpperCase()} pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg"
          >
            <CheckCircle2 size={18} />
            <p className="text-sm font-medium">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <LocaleDraftStatus
        activeLocale={editingLang}
        unsavedLocales={unsavedDraftLocales}
        onDiscardActive={hasActiveDraft ? restoreCurrentPage : undefined}
      />

      {editingPage && (
        <>
          {editingPage.id === "products" ? (
            <div className="space-y-4">
              <form id={`form-${editingPage.id}`} onSubmit={handleSave} className="hidden" aria-hidden="true" />
              {renderFormContent(
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <ProductCatalogManager embedded onFloatingActionChange={setProductAction} />
                </div>,
              )}

              <div className="flex justify-end border-t border-slate-200 pt-3">
                <Button type="button" variant="ghost" onClick={restoreCurrentPage} className="text-slate-600 hover:bg-slate-200">
                  Discard Changes
                </Button>
              </div>
            </div>
          ) : (
            <form id={`form-${editingPage.id}`} onSubmit={handleSave} className="space-y-4">
              {renderFormContent()}

              <div className="flex justify-end border-t border-slate-200 pt-3">
                <Button type="button" variant="ghost" onClick={restoreCurrentPage} className="text-slate-600 hover:bg-slate-200">
                  Discard Changes
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
