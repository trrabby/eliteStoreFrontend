/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
};

export function useCartDisplay() {
  const items = useSelector((s: RootState) => s.cart.items);
  const isCartOpen = useSelector((s: RootState) => s.ui.isCartOpen);

  const [productCache, setProductCache] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const hasFetchedForCurrentItemsRef = useRef(false);

  // Get unique product IDs
  const productIds = useMemo(
    () => [...new Set(items.map((i) => i.productId))],
    [items],
  );

  // Fetch products when cart opens
  useEffect(() => {
    if (!isCartOpen || productIds.length === 0) {
      // Reset fetch flag when cart closes
      if (!isCartOpen) {
        hasFetchedForCurrentItemsRef.current = false;
      }
      return;
    }

    // Check if we need to fetch (cart just opened or items changed)
    const needsFetch = !hasFetchedForCurrentItemsRef.current;

    if (needsFetch) {
      const missingProducts = productIds.filter((id) => !productCache[id]);

      if (missingProducts.length > 0) {
        setLoading(true);

        Promise.allSettled(missingProducts.map((id) => getProductById(id)))
          .then((results) => {
            const updates: Record<number, any> = {};
            missingProducts.forEach((id, idx) => {
              const result = results[idx];
              if (result.status === "fulfilled" && result.value?.success) {
                updates[id] = result.value.data;
              }
            });
            setProductCache((prev) => ({ ...prev, ...updates }));
            hasFetchedForCurrentItemsRef.current = true;
          })
          .catch((error) => {
            console.error("Failed to fetch cart items:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        hasFetchedForCurrentItemsRef.current = true;
      }
    }
  }, [isCartOpen, productIds, productCache]);

  // Build display items
  const displayItems: DisplayCartItem[] = useMemo(() => {
    const result: DisplayCartItem[] = [];

    for (const item of items) {
      const product = productCache[item.productId];
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
      });
    }

    return result;
  }, [items, productCache]);

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
