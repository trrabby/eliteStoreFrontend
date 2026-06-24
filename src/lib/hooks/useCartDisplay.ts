/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getProductBySlug, getProductById } from "@/services/product.service";
import { computeVariantPrice } from "../utils/currency";

export type DisplayCartItem = {
  // Identity
  variantId: number;
  productId: number;
  quantity: number;
  slug: string;
  // Product info
  productName: string;
  productSlug: string;
  imageUrl: string;
  // Variant info
  variantName: string;
  sku: string;
  // Pricing — raw
  price: number; // variant.price (system price)
  comparePrice: number | null; // variant.comparePrice (sticker)
  // Pricing — computed (USE THESE FOR DISPLAY)
  salePrice: number; // final price after all discounts
  basePrice: number; // highest sticker price
  hasDiscount: boolean;
  totalDiscountPercent: number;
  totalDiscountAmount: number;
  flashSaleLabel: string | null;
  // Stock
  stock: number;
  // Vendor
  vendorId: number;
  vendorName: string;
  vendorSlug: string | null;
};

export type VendorCartGroup = {
  vendorId: number;
  vendorName: string;
  vendorSlug: string | null;
  items: DisplayCartItem[];
  subtotal: number; // based on salePrice
};

export function useCartDisplay() {
  const items = useSelector((s: RootState) => s.cart.items);
  const [productCache, setProductCache] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  /* ── Build a list of unique product identifiers ── */
  const productIdentifiers = useMemo(() => {
    const ids: { slug?: string; id?: number }[] = [];
    for (const item of items) {
      const cartItem = item as any;
      // Prefer slug if available
      if (cartItem.slug) {
        ids.push({ slug: cartItem.slug });
      } else if (cartItem.productId) {
        ids.push({ id: cartItem.productId });
      } else {
        console.warn("Cart item missing slug or productId", cartItem);
      }
    }
    return ids;
  }, [items]);

  /* ── Fetch missing products ── */
  useEffect(() => {
    const fetchProducts = async () => {
      const missing: any[] = [];
      const cacheKeys = Object.keys(productCache);

      for (const id of productIdentifiers) {
        const key = id.slug || `id-${id.id}`;
        if (!productCache[key]) {
          missing.push(id);
        }
      }

      if (missing.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const fetchPromises = missing.map(async (id) => {
        try {
          let res;
          if (id.slug) {
            res = await getProductBySlug(id.slug);
          } else if (id.id) {
            res = await getProductById(id.id);
          } else {
            return null;
          }
          if (res?.success && res?.data) {
            return { key: id.slug || `id-${id.id}`, product: res.data };
          }
          return null;
        } catch (err) {
          console.error("Failed to fetch product", id, err);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);
      const updates: Record<string, any> = {};
      for (const result of results) {
        if (result) {
          updates[result.key] = result.product;
        }
      }

      setProductCache((prev) => ({ ...prev, ...updates }));
      setLoading(false);
    };

    if (productIdentifiers.length > 0) {
      fetchProducts();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdentifiers]);

  /* ── Build display items with computed pricing ── */
  const displayItems: DisplayCartItem[] = useMemo(() => {
    const result: DisplayCartItem[] = [];

    for (const item of items) {
      const cartItem = item as any;
      let product: any = null;

      // Find product in cache by slug or ID
      if (cartItem.slug) {
        product = productCache[cartItem.slug];
      } else if (cartItem.productId) {
        product = productCache[`id-${cartItem.productId}`];
      }

      if (!product) {
        // Product data not loaded yet – skip this item (will appear once loaded)
        continue;
      }

      // Find the specific variant
      const variant = product.variants?.find(
        (v: any) => v.id === cartItem.variantId,
      );
      if (!variant) {
        console.warn(
          `Variant ${cartItem.variantId} not found in product`,
          product,
        );
        continue;
      }

      /* ── Compute price using your utility ── */
      const flashOffer = product.flashSaleItem?.isActive
        ? product.flashSaleItem
        : null;

      const priceResult = computeVariantPrice(
        Number(variant.price),
        variant.comparePrice ? Number(variant.comparePrice) : null,
        flashOffer,
      );

      result.push({
        variantId: cartItem.variantId,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        slug: product.slug,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: product.images?.[0]?.url ?? "",
        variantName: variant.name ?? "",
        sku: variant.sku ?? "",
        price: Number(variant.price),
        comparePrice: variant.comparePrice
          ? Number(variant.comparePrice)
          : null,
        salePrice: priceResult.salePrice,
        basePrice: priceResult.basePrice,
        hasDiscount: priceResult.hasDiscount,
        totalDiscountPercent: priceResult.totalDiscountPercent,
        totalDiscountAmount: priceResult.totalDiscountAmount,
        flashSaleLabel: flashOffer ? "Flash Sale" : null,
        stock: variant.stock,
        vendorId: product.vendor?.id ?? product.vendorId ?? 0,
        vendorName: product.vendor?.storeName ?? "Store",
        vendorSlug: product.vendor?.slug ?? null,
      });
    }

    return result;
  }, [items, productCache]);

  /* ── Vendor groups ── */
  const vendorGroups: VendorCartGroup[] = useMemo(() => {
    const map = new Map<number, VendorCartGroup>();

    for (const item of displayItems) {
      if (!map.has(item.vendorId)) {
        map.set(item.vendorId, {
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          vendorSlug: item.vendorSlug,
          items: [],
          subtotal: 0,
        });
      }
      const group = map.get(item.vendorId)!;
      group.items.push(item);
      group.subtotal += item.salePrice * item.quantity;
    }

    return Array.from(map.values());
  }, [displayItems]);

  /* ── Aggregates (based on salePrice) ── */
  const subtotal = useMemo(
    () => displayItems.reduce((s, i) => s + i.salePrice * i.quantity, 0),
    [displayItems],
  );

  const savings = useMemo(
    () =>
      displayItems.reduce((s, i) => {
        const saved = (i.basePrice - i.salePrice) * i.quantity;
        return s + Math.max(0, saved);
      }, 0),
    [displayItems],
  );

  // Determine if we're still loading
  const isLoading =
    productIdentifiers.length > 0 &&
    productIdentifiers.some((id) => {
      const key = id.slug || `id-${id.id}`;
      return !productCache[key];
    });

  return {
    displayItems,
    vendorGroups,
    loading: isLoading,
    subtotal,
    savings,
  };
}
