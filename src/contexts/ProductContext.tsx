import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../types/product";

interface ProductContextType {
    products: Product[];
    addProduct: (product: Omit<Product, "id">) => Promise<void>;
    updateProduct: (id: string, product: Omit<Product, "id">) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);    useEffect(() => {
        fetch("/api/products")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                }
            })
            .catch(err => console.error("Error loading products:", err));
    }, []);

    const addProduct = async (productDetails: Omit<Product, "id">) => {        const baseSlug = productDetails.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const newId = `${baseSlug}-${Date.now().toString().slice(-4)}`;

        const newProduct: Product = { ...productDetails, id: newId };

        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct)
            });
            if (response.ok) {
                const payload = await response.json().catch(() => null);
                setProducts(prev => [...prev, payload?.product || newProduct]);
            } else {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || "Failed to add product on server");
            }
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    };

    const updateProduct = async (id: string, productDetails: Omit<Product, "id">) => {
        const updatedProduct: Product = { ...productDetails, id };

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct)
            });
            if (response.ok) {
                const payload = await response.json().catch(() => null);
                setProducts(prev => prev.map(p => p.id === id ? (payload?.product || updatedProduct) : p));
            } else {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || "Failed to update product on server");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
            } else {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || "Failed to delete product on server");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error("useProducts must be used within a ProductProvider");
    }
    return context;
}
