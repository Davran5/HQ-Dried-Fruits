import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit2, Trash2, X, AlertTriangle, Image as ImageIcon, ChevronDown, Package, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { RichTextEditor } from "@/src/components/admin/forms/RichTextEditor";
import { useProducts } from "@/src/contexts/ProductContext";
import { Product, ProductContentSection } from "@/src/types/product";
import { useAdminLanguage } from "@/src/contexts/AdminLanguageContext";
import { useAdminSidebarAction } from "@/src/components/layout/AdminLayout";
import { LocaleDraftStatus } from "@/src/components/admin/LocaleDraftStatus";
import { cloneDraft, draftKey, isSameDraft, unsavedLocalesFromDrafts } from "@/src/lib/adminDrafts";
import type { ActiveLocaleCode } from "@/src/i18n";

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  category: "",
  status: "Active",
  image: "",
  imageGallery: [],
  shortDescription: "",
  longDescription: "",
  highlights: ["100% Natural & Organic", "No Added Sugars"],
  contentSections: [
    { title: "Overview", body: "" },
    { title: "Origin & Growing Conditions", body: "" },
    { title: "Benefits & Buyer Uses", body: "" },
    { title: "Export & Handling", body: "" },
  ],
  inquirySubjectLine: "Wholesale Inquiry: ",
  tonnageOptions: ["5 Tons", "10 Tons (20ft FCL)", "20 Tons (40ft FCL)"],
  nutrition: { energy: "", protein: "", fat: "", carbs: "" }
};

interface FloatingAction {
  label: string;
  formId?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

interface ProductCatalogManagerProps {
  embedded?: boolean;
  onFloatingActionChange?: (action: FloatingAction | null) => void;
}

export function ProductCatalogManager({ embedded = false, onFloatingActionChange }: ProductCatalogManagerProps) {
  const { products, addProduct, updateProduct, deleteProduct, refreshProducts } = useProducts();
  const { editingLang } = useAdminLanguage();
  const { setAction } = useAdminSidebarAction();
  const setFloatingAction = onFloatingActionChange || setAction;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = closed, "new" = adding new, "ID" = editing existing
  const [formData, setFormData] = useState<Omit<Product, "id">>(emptyProduct);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formLocale, setFormLocale] = useState<ActiveLocaleCode | null>(null);
  const [loadedEditingLang, setLoadedEditingLang] = useState<ActiveLocaleCode | null>(null);
  const [productDrafts, setProductDrafts] = useState<Record<string, Omit<Product, "id">>>({});
  const [openEditorByLocale, setOpenEditorByLocale] = useState<Record<string, string | null>>({});
  const productDraftsRef = useRef(productDrafts);
  const openEditorByLocaleRef = useRef(openEditorByLocale);
  const refreshRequestIdRef = useRef(0);
  const isLocaleReady = loadedEditingLang === editingLang && !isRefreshing;
  const unsavedDraftLocales = useMemo(() => unsavedLocalesFromDrafts(productDrafts), [productDrafts]);
  const activeDraftKey = editingId ? draftKey(editingLang, editingId) : "";
  const hasActiveDraft = Boolean(activeDraftKey && productDrafts[activeDraftKey]);

  useEffect(() => {
    productDraftsRef.current = productDrafts;
  }, [productDrafts]);

  useEffect(() => {
    openEditorByLocaleRef.current = openEditorByLocale;
  }, [openEditorByLocale]);

  const getSourceFormData = (id: string | null): Omit<Product, "id"> => {
    if (!id || id === "new") return cloneDraft(emptyProduct);
    const product = products.find((item) => item.id === id);
    if (!product) return cloneDraft(emptyProduct);
    const { id: _id, ...sourceData } = product;
    return cloneDraft(sourceData);
  };

  // Refresh products whenever the editing language changes
  useEffect(() => {
    const loadLangData = async () => {
      const requestId = refreshRequestIdRef.current + 1;
      refreshRequestIdRef.current = requestId;
      setIsRefreshing(true);
      setLoadedEditingLang(null);
      setEditingId(null);
      setFormLocale(null);
      try {
        await refreshProducts(editingLang);
      } catch (err) {
        console.error("Failed to load language data:", err);
      } finally {
        if (requestId === refreshRequestIdRef.current) {
          setLoadedEditingLang(editingLang);
          setIsRefreshing(false);
        }
      }
    };
    loadLangData();
  }, [editingLang]);

  useEffect(() => {
    if (!isLocaleReady) return;
    const openId = openEditorByLocaleRef.current[editingLang] || null;
    if (!openId) {
      setEditingId(null);
      setFormData(cloneDraft(emptyProduct));
      setFormLocale(editingLang);
      return;
    }

    const draft = productDraftsRef.current[draftKey(editingLang, openId)];
    setEditingId(openId);
    setFormData(cloneDraft(draft || getSourceFormData(openId)));
    setFormLocale(editingLang);
  }, [editingLang, isLocaleReady, products]);

  useEffect(() => {
    if (!isLocaleReady || formLocale !== editingLang || !editingId) return;
    const key = draftKey(editingLang, editingId);
    const sourceData = getSourceFormData(editingId);

    setProductDrafts((drafts) => {
      if (isSameDraft(formData, sourceData)) {
        if (!drafts[key]) return drafts;
        const nextDrafts = { ...drafts };
        delete nextDrafts[key];
        return nextDrafts;
      }

      if (drafts[key] && isSameDraft(drafts[key], formData)) {
        return drafts;
      }

      return { ...drafts, [key]: cloneDraft(formData) };
    });
  }, [editingId, editingLang, formData, formLocale, isLocaleReady, products]);

  const handleToggleAccordion = (id: string, product?: Product) => {
    if (editingId === id) {
      handleClose();
    } else {
      const draft = productDraftsRef.current[draftKey(editingLang, id)];
      setEditingId(id);
      setFormData(cloneDraft(draft || (product ? (() => {
        const { id: _id, ...sourceData } = product;
        return sourceData;
      })() : emptyProduct)));
      setFormLocale(editingLang);
      setOpenEditorByLocale((current) => ({ ...current, [editingLang]: id }));
    }
  };

  const handleClose = () => {
    if (editingId) {
      const key = draftKey(editingLang, editingId);
      setProductDrafts((drafts) => {
        if (!drafts[key]) return drafts;
        const nextDrafts = { ...drafts };
        delete nextDrafts[key];
        return nextDrafts;
      });
    }
    setEditingId(null);
    setFormData(cloneDraft(emptyProduct));
    setFormLocale(editingLang);
    setOpenEditorByLocale((current) => ({ ...current, [editingLang]: null }));
  };

  useEffect(() => {
    const handleOpenProductFromSearch = (event: Event) => {
      const target = (event as CustomEvent<{ target?: HTMLElement | null }>).detail?.target;
      const productId = target?.closest<HTMLElement>("[data-admin-product-id]")?.dataset.adminProductId;
      if (!productId || productId === editingId) return;

      const product = products.find((candidate) => candidate.id === productId);
      if (product) {
        handleToggleAccordion(productId, product);
      }
    };

    window.addEventListener("admin:open-section", handleOpenProductFromSearch as EventListener);
    return () => window.removeEventListener("admin:open-section", handleOpenProductFromSearch as EventListener);
  }, [editingId, products]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLocaleReady || formLocale !== editingLang) {
      alert(`Still loading ${editingLang.toUpperCase()} products. Please wait before saving.`);
      return;
    }

    setIsSaving(true);
    try {
      if (editingId === "new") {
        const createdProduct = await addProduct(formData, editingLang);
        const { id: createdId, ...createdFormData } = createdProduct;
        setProductDrafts((drafts) => {
          const nextDrafts = { ...drafts };
          delete nextDrafts[draftKey(editingLang, "new")];
          return nextDrafts;
        });
        setEditingId(createdId);
        setFormData(createdFormData);
        setFormLocale(editingLang);
        setOpenEditorByLocale((current) => ({ ...current, [editingLang]: createdId }));
        setSuccessMessage(`New product (${editingLang.toUpperCase()}) created successfully!`);
      } else if (editingId) {
        await updateProduct(editingId, formData, editingLang);
        const savedId = editingId;
        setProductDrafts((drafts) => {
          const nextDrafts = { ...drafts };
          delete nextDrafts[draftKey(editingLang, savedId)];
          return nextDrafts;
        });
        setSuccessMessage(`Product (${editingLang.toUpperCase()}) updated successfully!`);
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      alert(error instanceof Error ? error.message : "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!editingId) {
      setFloatingAction(null);
      return undefined;
    }

    setFloatingAction({
      label: editingId === "new" ? "Create Product" : "Save Product",
      formId: `form-product-${editingId}`,
      isLoading: isSaving,
      disabled: isSaving || !isLocaleReady || formLocale !== editingLang,
    });

    return () => setFloatingAction(null);
  }, [editingId, editingLang, formLocale, isLocaleReady, isSaving, setFloatingAction]);

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevents opening the accordion
    setItemToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteProduct(itemToDelete);
    }
    setIsDeleteOpen(false);
    setItemToDelete(null);
  };

  const renderProductForm = (id: string) => (
    <div className="border-t border-slate-100 p-3 sm:p-4">
      <form id={`form-product-${id}`} onSubmit={handleSaveProduct} className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Product Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 focus:ring-4 focus:ring-earth-500/10 outline-none transition-all"
                placeholder="e.g. Sun-Dried Apricots"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                <input
                  required
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                  placeholder="e.g. Jumbo"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                <Select
                  value={formData.status || "Active"}
                  onChange={(val) => setFormData({ ...formData, status: val as "Active" | "Inactive" })}
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                  className="py-3 bg-white border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Short Description *</label>
              <textarea
                required
                rows={3}
                value={formData.shortDescription || ""}
                onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none resize-none transition-all"
                placeholder="Brief description for the catalog grid..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <ImageUploader
              label="Primary Feature Image"
              value={formData.image}
              onChange={url => setFormData({ ...formData, image: url })}
            />

            <div className="rounded-lg border border-slate-200 bg-white/60 p-3">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Nutritional Facts (per 100g)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Energy (kcal)</label>
                  <input
                    required
                    type="text"
                    value={formData.nutrition?.energy || ""}
                    onChange={e => setFormData({ ...formData, nutrition: { ...formData.nutrition, energy: e.target.value } })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-earth-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Proteins</label>
                  <input
                    required
                    type="text"
                    value={formData.nutrition?.protein || ""}
                    onChange={e => setFormData({ ...formData, nutrition: { ...formData.nutrition, protein: e.target.value } })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-earth-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Fat</label>
                  <input
                    required
                    type="text"
                    value={formData.nutrition?.fat || ""}
                    onChange={e => setFormData({ ...formData, nutrition: { ...formData.nutrition, fat: e.target.value } })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-earth-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Carbs</label>
                  <input
                    required
                    type="text"
                    value={formData.nutrition?.carbs || ""}
                    onChange={e => setFormData({ ...formData, nutrition: { ...formData.nutrition, carbs: e.target.value } })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-earth-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <RichTextEditor
            label="Product Storytelling / Long Description"
            value={formData.longDescription || ""}
            onChange={val => setFormData({ ...formData, longDescription: val })}
          />

          <Repeater<ProductContentSection>
            label="Structured Product Sections"
            items={formData.contentSections || []}
            emptyItem={{ title: "", body: "" }}
            onUpdate={(items) => setFormData({ ...formData, contentSections: items })}
            renderItem={(item, index, updateItem, replaceItem) => (
              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => replaceItem(index, { ...item, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none focus:border-earth-500"
                    placeholder={`Section ${index + 1} title`}
                  />
                </div>
                <RichTextEditor
                  label="Section Body"
                  value={item.body}
                  onChange={(val) => replaceItem(index, { ...item, body: val })}
                />
              </div>
            )}
          />
        </div>

        <div className="grid gap-4 pt-1 lg:grid-cols-2">
          <Repeater<string>
            label="Product Highlights"
            items={formData.highlights || []}
            emptyItem={""}
            onUpdate={(items) => setFormData({ ...formData, highlights: items })}
            renderItem={(item, index, updateItem, replaceItem) => (
              <input
                type="text"
                value={item}
                onChange={e => replaceItem(index, e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-earth-500"
                placeholder="e.g. 100% Natural"
              />
            )}
          />

          <Repeater<string>
            label="Gallery Images"
            items={formData.imageGallery || []}
            emptyItem={""}
            onUpdate={(items) => setFormData({ ...formData, imageGallery: items })}
            renderItem={(item, index, updateItem, replaceItem) => (
              <ImageUploader
                label={`Gallery Item ${index + 1}`}
                value={item}
                onChange={url => replaceItem(index, url)}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-600 hover:bg-slate-200 font-bold">
            Discard Changes
          </Button>
        </div>
      </form>
    </div>
  );

  if (!isLocaleReady) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-earth-600" />
          <p className="text-sm text-slate-500 font-medium">Switching to {editingLang.toUpperCase()} products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg border border-emerald-200"
          >
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span className="text-sm font-medium">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <LocaleDraftStatus
        activeLocale={editingLang}
        unsavedLocales={unsavedDraftLocales}
        onDiscardActive={hasActiveDraft ? handleClose : undefined}
      />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className={embedded ? "text-lg font-bold text-slate-900" : "text-2xl font-bold text-slate-900"}>
            {embedded ? "3. Product Catalog Items" : `Products Catalog (${editingLang.toUpperCase()})`}
          </h2>
          <p className="text-sm text-slate-500">
            Manage the product cards and detail pages for the {editingLang.toUpperCase()} version.
          </p>
        </div>
        <Button
          onClick={() => handleToggleAccordion("new")}
          className={`${editingId === "new" ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "bg-earth-600 hover:bg-earth-700 text-white"} transition-all shrink-0 font-bold`}
        >
          {editingId === "new" ? <X size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
          {editingId === "new" ? "Cancel Adding" : "Add New Product"}
        </Button>
      </div>
      <div className="space-y-3">
        <AnimatePresence>
          {editingId === "new" && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="overflow-hidden rounded-lg border border-dashed border-earth-300 bg-earth-50/30"
            >
              <div className="border-b border-earth-200 bg-earth-50 px-4 py-3">
                <h3 className="font-bold text-earth-900 flex items-center gap-2">
                  <Plus size={18} /> New {editingLang.toUpperCase()} Product Drafting
                </h3>
              </div>
              {renderProductForm("new")}
            </motion.div>
          )}
        </AnimatePresence>

        {products.map((product) => {
          const isExpanded = editingId === product.id;
          return (
            <div
              key={product.id}
              data-admin-product-id={product.id}
              data-admin-search-title={`Product: ${product.name}`}
              data-admin-search-content={JSON.stringify(product)}
              className={`overflow-hidden rounded-lg border transition-all duration-300 ${isExpanded ? 'border-earth-300 bg-white ring-1 ring-earth-500/10' : 'border-slate-200 bg-white hover:border-earth-200'}`}
            >
              <div
                onClick={() => handleToggleAccordion(product.id, product)}
                className={`group flex cursor-pointer select-none items-center justify-between px-4 py-3 transition-colors ${isExpanded ? 'bg-earth-50/70' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`h-14 w-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${isExpanded ? 'border-earth-600 shadow-md' : 'border-slate-100 group-hover:border-earth-200'}`}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <Package size={24} />
                      </div>
                    )}
                  </div>

                  <div className="truncate">
                    <h3 className={`font-bold transition-colors ${isExpanded ? 'text-earth-900' : 'text-slate-900'}`}>{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{product.category}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => confirmDelete(e, product.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Permanently Delete Product"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'rotate-180 bg-earth-200 text-earth-700' : 'text-slate-400 group-hover:text-earth-600'}`}>
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
                  >
                    {renderProductForm(product.id)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {products.length === 0 && editingId !== "new" && (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Your {editingLang.toUpperCase()} product catalog is currently empty.</p>
            <Button onClick={() => handleToggleAccordion("new")} variant="ghost" className="mt-4 text-earth-600">
              Add your first {editingLang.toUpperCase()} product
            </Button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Destruction</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Are you sure you want to delete this product? This will remove all associated gallery data and descriptions permanently.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 font-bold py-3" onClick={() => setIsDeleteOpen(false)}>
                  Go Back
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 shadow-lg shadow-red-500/20" onClick={handleDelete}>
                  Yes, Delete it
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminProducts() {
  return <ProductCatalogManager />;
}
