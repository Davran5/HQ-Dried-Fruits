import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Product } from "../types/product";
import { useLanguage } from "./LanguageContext";
import { getActiveLocale, type ActiveLocaleCode, type LocaleCode } from "../i18n";
import { PublicBootstrapPayload } from "../types/bootstrap";
import { fetchWithAuth } from "../lib/api";

interface ProductContextType {
    products: Product[];
    productsLoaded: boolean;
    currentLocale: ActiveLocaleCode;
    addProduct: (product: Omit<Product, "id">, locale?: LocaleCode) => Promise<Product>;
    updateProduct: (id: string, product: Omit<Product, "id">, locale?: LocaleCode) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    reorderProducts: (ids: string[]) => Promise<void>;
    refreshProducts: (locale?: LocaleCode) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children, initialData }: { children: ReactNode; initialData?: PublicBootstrapPayload | null }) {
    const { locale } = useLanguage();
    const location = useLocation();
    const isAdminRoute = location.pathname === "/control-room" || location.pathname.startsWith("/control-room/");
    const bootstrapData = useMemo(
        () => (initialData && initialData.locale === locale ? initialData : null),
        [initialData, locale],
    );
    const [products, setProducts] = useState<Product[]>(bootstrapData?.products ?? []);
    const [productsLoaded, setProductsLoaded] = useState(Boolean(bootstrapData));
    const [loadedLocale, setLoadedLocale] = useState<ActiveLocaleCode | null>(bootstrapData?.locale ?? null);
    const refreshRequestIdRef = useRef(0);

    const refreshProducts = async (requestedLocale?: LocaleCode) => {
        const targetLocale = getActiveLocale(requestedLocale || locale);
        const requestId = refreshRequestIdRef.current + 1;
        refreshRequestIdRef.current = requestId;
        setProductsLoaded(false);

        try {
            const response = await fetchWithAuth(`/api/products?locale=${encodeURIComponent(targetLocale)}&v=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                if (requestId !== refreshRequestIdRef.current) {
                    return;
                }
                if (Array.isArray(data)) {
                    setProducts(data);
                }
            }
            if (requestId === refreshRequestIdRef.current) {
                setLoadedLocale(targetLocale);
            }
        } catch (err) {
            console.error("Error loading products:", err);
        } finally {
            if (requestId === refreshRequestIdRef.current) {
                setProductsLoaded(true);
            }
        }
    };

    useEffect(() => {
        if (isAdminRoute) {
            return;
        }

        if (bootstrapData) {
            setProducts(Array.isArray(bootstrapData.products) ? bootstrapData.products : []);
            setProductsLoaded(true);
            setLoadedLocale(bootstrapData.locale);
            return;
        }

        if (loadedLocale === locale && productsLoaded) {
            return;
        }

        void refreshProducts(locale);
    }, [bootstrapData, isAdminRoute, loadedLocale, locale]);

    const addProduct = async (productDetails: Omit<Product, "id">, requestedLocale?: LocaleCode) => {
        const targetLocale = getActiveLocale(requestedLocale || locale);
        const baseSlug = productDetails.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        const newId = `${baseSlug}-${Date.now().toString().slice(-4)}`;

        const newProduct: Product = { ...productDetails, id: newId };

        try {
            const response = await fetchWithAuth(`/api/products?locale=${encodeURIComponent(targetLocale)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct)
            });
            if (response.ok) {
                const payload = await response.json().catch(() => null);
                const savedProduct = payload?.product || newProduct;
                setProducts(prev => [...prev, savedProduct]);
                return savedProduct;
            } else {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || "Failed to add product on server");
            }
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    };

    const updateProduct = async (id: string, productDetails: Omit<Product, "id">, requestedLocale?: LocaleCode) => {
        const targetLocale = getActiveLocale(requestedLocale || locale);
        const updatedProduct: Product = { ...productDetails, id };

        try {
            const response = await fetchWithAuth(`/api/products/${id}?locale=${encodeURIComponent(targetLocale)}`, {
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
            const response = await fetchWithAuth(`/api/products/${id}`, {
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

    const reorderProducts = async (ids: string[]) => {
        const orderedIds = Array.from(new Set(ids.filter(Boolean)));
        if (orderedIds.length === 0) {
            return;
        }

        const previousProducts = products;
        const orderIndexById = new Map(orderedIds.map((id, index) => [id, index]));

        setProducts((currentProducts) => {
            const productById = new Map<string, Product>();
            currentProducts.forEach((product) => productById.set(product.id, product));
            const orderedProducts = orderedIds
                .map((id, index) => {
                    const product = productById.get(id);
                    if (!product) {
                        return null;
                    }
                    const orderedProduct: Product = { ...product, displayOrder: index };
                    return orderedProduct;
                })
                .filter((product): product is Product => Boolean(product));
            const remainingProducts = currentProducts.filter((product) => !orderIndexById.has(product.id));
            return [...orderedProducts, ...remainingProducts];
        });

        try {
            const response = await fetchWithAuth("/api/products/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: orderedIds }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || "Failed to save product order");
            }
        } catch (error) {
            setProducts(previousProducts);
            console.error("Error reordering products:", error);
            throw error;
        }
    };

    return (
        <ProductContext.Provider value={{ products, productsLoaded, currentLocale: locale, addProduct, updateProduct, deleteProduct, reorderProducts, refreshProducts }}>
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
