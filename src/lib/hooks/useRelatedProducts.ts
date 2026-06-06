/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useRelatedProducts.ts
import { useState, useEffect } from "react";

export interface Product {
  id: number;
  name: string;
  images?: { url: string }[];
  variants?: { sku: string }[];
}

export const useRelatedProducts = (productId: number | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const { getMyProducts } = await import("@/services/product.service");
      const res = await getMyProducts({ page: 1, limit: 100 });
      if (res?.success && res.data?.products) {
        const filtered = res.data.products.filter(
          (p: any) => p.id !== productId,
        );
        setProducts(filtered);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProducts();
    }
  }, [productId]);

  const filterProducts = (search: string, excludeIds: number[]) => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) &&
        !excludeIds.includes(product.id),
    );
  };

  return {
    products,
    loading,
    filterProducts,
    reload: loadProducts,
  };
};
