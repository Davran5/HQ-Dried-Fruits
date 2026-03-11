import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit2, Trash2, X, AlertTriangle, Image as ImageIcon, ChevronDown, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { RichTextEditor } from "@/src/components/admin/forms/RichTextEditor";
import { useProducts } from "@/src/contexts/ProductContext";
import { Product, ProductContentSection } from "@/src/types/product";

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

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = closed, "new" = adding new, "ID" = editing existing
  const [formData, setFormData] = useState<Omit<Product, "id">>(emptyProduct);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleToggleAccordion = (id: string, product?: Product) => {
    if (editingId === id) {
      setEditingId(null);
      setFormData(emptyProduct);
    } else {
      setEditingId(id);
      setFormData(product ? JSON.parse(JSON.stringify(product)) : emptyProduct);
    }
  };

  const handleClose = () => {
    setEditingId(null);
    setFormData(emptyProduct);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId === "new") {
        await addProduct(formData);
        setSuccessMessage("New product created successfully!");
      } else if (editingId) {
        await updateProduct(editingId, formData);
        setSuccessMessage("Product updated successfully!");
      }

      setTimeout(() => setSuccessMessage(null), 3000);
      handleClose(); // AUTO-CLOSE ON SAVE
    } catch (error) {
      console.error("Save failed:", error);
      alert(error instanceof Error ? error.message : "Failed to save changes. Please try again.");
    }
  };

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
    <div className="p-6 sm:p-10 bg-slate-50/50 border-t border-slate-100">
      <form onSubmit={handleSaveProduct} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
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

          <div className="space-y-6">
            <ImageUploader
              label="Primary Feature Image"
              value={formData.image}
              onChange={url => setFormData({ ...formData, image: url })}
            />

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Nutritional Facts (per 100g)</h4>
              <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-6">
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
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
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

        <div className="grid gap-8 lg:grid-cols-2 pt-4">
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

        <div className="flex items-center justify-end gap-3 pt-10 border-t border-slate-200">
          <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-600 hover:bg-slate-200 font-bold">
            Discard Changes
          </Button>
          <Button type="submit" className="bg-earth-600 hover:bg-earth-700 text-white min-w-[160px] shadow-lg shadow-earth-500/20 font-bold">
            {id === "new" ? "Create Product" : "Save All Changes"}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Products Catalog</h2>
          <p className="text-sm text-slate-500">Manage your dried fruits inventory and specifications.</p>
        </div>
        <Button
          onClick={() => handleToggleAccordion("new")}
          className={`${editingId === "new" ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "bg-earth-600 hover:bg-earth-700 text-white"} transition-all shrink-0 font-bold`}
        >
          {editingId === "new" ? <X size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
          {editingId === "new" ? "Cancel Adding" : "Add New Product"}
        </Button>
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {editingId === "new" && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="rounded-xl border-2 border-dashed border-earth-300 bg-earth-50/30 overflow-hidden"
            >
              <div className="px-6 py-4 bg-earth-50 border-b border-earth-200">
                <h3 className="font-bold text-earth-900 flex items-center gap-2">
                  <Plus size={18} /> New Product Drafting
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
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-earth-300 shadow-xl ring-1 ring-earth-500/10' : 'border-slate-200 bg-white shadow-sm hover:border-earth-200'}`}
            >
              <div
                onClick={() => handleToggleAccordion(product.id, product)}
                className={`group flex items-center justify-between px-6 py-4 cursor-pointer select-none transition-colors ${isExpanded ? 'bg-earth-50' : 'hover:bg-slate-50'}`}
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
            <p className="text-slate-500 font-medium">Your product catalog is currently empty.</p>
            <Button onClick={() => handleToggleAccordion("new")} variant="ghost" className="mt-4 text-earth-600">
              Add your first product
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
