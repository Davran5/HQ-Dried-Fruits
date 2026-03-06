import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit2, Trash2, X, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { SeoFormSection, SEOData } from "@/src/components/admin/SeoFormSection";

interface Nutrition {
  energy: string;
  protein: string;
  fat: string;
  carbs: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  status: "Active" | "Inactive";
  image: string;
  description: string;
  nutrition: Nutrition;
  seo: SEOData;
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Sun-Dried Apricots",
    category: "Jumbo / Industrial",
    status: "Active",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=200&auto=format&fit=crop",
    description: "Naturally sweet, vibrant color, rich in potassium.",
    nutrition: { energy: "241", protein: "3.4g", fat: "0.5g", carbs: "63g" },
    seo: { metaTitle: "Golden Sun-Dried Apricots | UzbekSun", metaDescription: "Premium sun-dried apricots from the Fergana Valley.", slug: "sun-dried-apricots", ogTitle: "Golden Sun-Dried Apricots", imageAlt: "Sun-Dried Apricots" }
  },
  {
    id: "2",
    name: "Black Raisins",
    category: "Shadow-Dried",
    status: "Active",
    image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=200&auto=format&fit=crop",
    description: "Intense flavor, high antioxidant content.",
    nutrition: { energy: "299", protein: "3.1g", fat: "0.5g", carbs: "79g" },
    seo: { metaTitle: "Black Raisins | UzbekSun", metaDescription: "Shadow-dried black raisins rich in iron and antioxidants.", slug: "black-raisins", ogTitle: "Black Raisins", imageAlt: "Black Raisins" }
  },
  {
    id: "3",
    name: "Pitted Prunes",
    category: "Moisture Balanced",
    status: "Inactive",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=200&auto=format&fit=crop",
    description: "Soft, fleshy texture. Processed with precise moisture control.",
    nutrition: { energy: "240", protein: "2.2g", fat: "0.4g", carbs: "64g" },
    seo: { metaTitle: "Pitted Prunes | UzbekSun", metaDescription: "Soft, fleshy pitted prunes with perfect moisture balance.", slug: "pitted-prunes", ogTitle: "Pitted Prunes", imageAlt: "Pitted Prunes" }
  }
];

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  category: "",
  status: "Active",
  image: "",
  description: "",
  nutrition: { energy: "", protein: "", fat: "", carbs: "" },
  seo: { metaTitle: "", metaDescription: "", slug: "", ogTitle: "", imageAlt: "" }
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Product, "id">>(emptyProduct);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData(emptyProduct);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(emptyProduct);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
    } else {
      const newProduct = { ...formData, id: Date.now().toString() };
      setProducts([...products, newProduct]);
    }
    handleCloseForm();
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setProducts(products.filter(p => p.id !== itemToDelete));
    }
    setIsDeleteOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Products Catalog</h2>
          <p className="text-sm text-slate-500">Manage your dried fruits inventory and details.</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-earth-600 hover:bg-earth-700 text-white shrink-0">
          <Plus size={18} className="mr-2" />
          Add Product
        </Button>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenForm(product)}
                        className="p-2 text-slate-400 hover:text-earth-600 hover:bg-earth-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(product.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={handleCloseForm}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h3>
                <button onClick={handleCloseForm} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all"
                      placeholder="e.g. Sun-Dried Apricots"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                    <input 
                      required
                      type="text" 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all"
                      placeholder="e.g. Jumbo / Industrial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as "Active" | "Inactive"})}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                    <textarea 
                      required
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all resize-none"
                      placeholder="Brief description of the product..."
                    />
                  </div>

                  {/* Image Upload Area (Mock) */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                    <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-8 hover:border-earth-400 hover:bg-earth-50/50 transition-colors cursor-pointer">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                        <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                          <span className="relative cursor-pointer rounded-md bg-transparent font-semibold text-earth-600 focus-within:outline-none hover:text-earth-500">
                            Upload a file
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-slate-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                    {/* Fallback URL input for the mock */}
                    <input 
                      type="url" 
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all"
                      placeholder="Or paste image URL here..."
                    />
                  </div>

                  {/* Nutritional Facts */}
                  <div className="sm:col-span-2">
                    <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Nutritional Facts (per 100g)</h4>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Energy (kcal) *</label>
                        <input 
                          required
                          type="text" 
                          value={formData.nutrition.energy}
                          onChange={e => setFormData({...formData, nutrition: { ...formData.nutrition, energy: e.target.value }})}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-earth-500 outline-none transition-all"
                          placeholder="e.g. 241"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Proteins *</label>
                        <input 
                          required
                          type="text" 
                          value={formData.nutrition.protein}
                          onChange={e => setFormData({...formData, nutrition: { ...formData.nutrition, protein: e.target.value }})}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-earth-500 outline-none transition-all"
                          placeholder="e.g. 3.4g"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Fats *</label>
                        <input 
                          required
                          type="text" 
                          value={formData.nutrition.fat}
                          onChange={e => setFormData({...formData, nutrition: { ...formData.nutrition, fat: e.target.value }})}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-earth-500 outline-none transition-all"
                          placeholder="e.g. 0.5g"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Carbs *</label>
                        <input 
                          required
                          type="text" 
                          value={formData.nutrition.carbs}
                          onChange={e => setFormData({...formData, nutrition: { ...formData.nutrition, carbs: e.target.value }})}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-earth-500 outline-none transition-all"
                          placeholder="e.g. 63g"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <SeoFormSection 
                  data={formData.seo} 
                  onChange={(seo) => setFormData({ ...formData, seo })} 
                />

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={handleCloseForm} className="text-slate-600 hover:bg-slate-100">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-earth-600 hover:bg-earth-700 text-white">
                    {editingId ? "Save Changes" : "Create Product"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsDeleteOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Product?</h3>
              <p className="text-slate-500 mb-8">
                Are you sure you want to delete this product? This action cannot be undone and will remove it from your live catalog.
              </p>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
