/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getProductById } from "@/services/product.service";

export type DisplayCartItem = {
  variantId: number;
  productId: number;
  quantity: number;
  productName: string;
  productSlug: string;
  imageUrl: string;
  variantName: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  vendorId: number;
  vendorName: string;
};

export function useCartDisplay() {
  const items = useSelector((s: RootState) => s.cart.items);
  const [productData, setProductData] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const fetchedIds = useRef<Set<number>>(new Set());

  const productIds = useMemo(
    () => [...new Set(items.map((i) => i.productId))],
    [items],
  );

  useEffect(() => {
    if (productIds.length === 0) {
      setProductData({});
      fetchedIds.current.clear();
      return;
    }

    const toFetch = productIds.filter((id) => !fetchedIds.current.has(id));
    if (toFetch.length === 0) return;

    setLoading(true);

    Promise.all(toFetch.map((id) => getProductById(id)))
      .then((results) => {
        const updates: Record<number, any> = {};
        toFetch.forEach((id, index) => {
          const res = results[index];
          fetchedIds.current.add(id);
          if (res?.success && res.data) {
            updates[id] = res.data;
          } else {
            updates[id] = {
              name: "Unavailable",
              slug: "#",
              images: [],
              variants: [],
              vendorId: 0, // fallback
            };
          }
        });
        setProductData((prev) => ({ ...prev, ...updates }));
      })
      .catch(() => {
        toFetch.forEach((id) => fetchedIds.current.add(id));
      })
      .finally(() => setLoading(false));
  }, [productIds]);

  const displayItems: DisplayCartItem[] = useMemo(() => {
    const result: DisplayCartItem[] = [];

    for (const item of items) {
      const product = productData[item.productId];
      if (!product) continue;

      const variant = product.variants?.find(
        (v: any) => v.id === item.variantId,
      );
      if (!variant) continue;

      result.push({
        variantId: item.variantId,
        productId: item.productId,
        quantity: item.quantity,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: product.images?.[0]?.url ?? "",
        variantName: variant.name ?? "",
        sku: variant.sku ?? "",
        price: Number(variant.price),
        comparePrice: variant.comparePrice
          ? Number(variant.comparePrice)
          : null,
        stock: variant.stock,
        vendorId: product.vendorId ?? 0,
        vendorName: product.vendor?.storeName ?? "Unknown Vendor",
      });
    }

    return result;
  }, [items, productData]);

  const subtotal = useMemo(
    () =>
      displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [displayItems],
  );

  const savings = useMemo(
    () =>
      displayItems.reduce((sum, item) => {
        if (item.comparePrice && item.comparePrice > item.price) {
          return sum + (item.comparePrice - item.price) * item.quantity;
        }
        return sum;
      }, 0),
    [displayItems],
  );

  return { displayItems, loading, subtotal, savings };
}
