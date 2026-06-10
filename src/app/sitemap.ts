/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRoute } from "next";
import { getAllProducts } from "@/services/product.service";
import { getAllCategories } from "@/services/category.service";
import { getAllBrands } from "@/services/brand.service";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitestore.com.bd";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // ── Static routes ─────────────────────────────────
  const static_routes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, priority: 1, changeFrequency: "daily" },
    {
      url: `${BASE}/products`,
      lastModified: now,
      priority: 0.9,
      changeFrequency: "hourly",
    },
    {
      url: `${BASE}/search`,
      lastModified: now,
      priority: 0.7,
      changeFrequency: "always",
    },
    {
      url: `${BASE}/login`,
      lastModified: now,
      priority: 0.3,
      changeFrequency: "monthly",
    },
    {
      url: `${BASE}/register`,
      lastModified: now,
      priority: 0.3,
      changeFrequency: "monthly",
    },
  ];

  // ── Products ──────────────────────────────────────
  let product_routes: MetadataRoute.Sitemap = [];
  try {
    const res = await getAllProducts({
      page: 1,
      limit: 1000,
      status: "ACTIVE",
    });
    const products: any[] = res?.data?.products ?? [];
    product_routes = products.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      priority: 0.8,
      changeFrequency: "daily",
    }));
  } catch {
    /* non-critical */
  }

  // ── Categories ────────────────────────────────────
  let category_routes: MetadataRoute.Sitemap = [];
  try {
    const res = await getAllCategories({ limit: 200 });
    const cats: any[] = res?.data?.categories ?? res?.data ?? [];
    category_routes = cats.map((c) => ({
      url: `${BASE}/products?categoryIds=${c.id}`,
      lastModified: now,
      priority: 0.7,
      changeFrequency: "weekly",
    }));
  } catch {
    /* non-critical */
  }

  // ── Brands ────────────────────────────────────────
  let brand_routes: MetadataRoute.Sitemap = [];
  try {
    const res = await getAllBrands({ limit: 200 });
    const brands: any[] = res?.data?.brands ?? res?.data ?? [];
    brand_routes = brands.map((b) => ({
      url: `${BASE}/products?brandIds=${b.id}`,
      lastModified: now,
      priority: 0.6,
      changeFrequency: "weekly",
    }));
  } catch {
    /* non-critical */
  }

  return [
    ...static_routes,
    ...product_routes,
    ...category_routes,
    ...brand_routes,
  ];
}
