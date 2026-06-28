/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Script from "next/script";
import { getCategoryTree } from "@/services/category.service";
import { CategoriesPageClient } from "./CategoriesPageClient";

export const metadata: Metadata = {
  title: "All Categories | Elite Store",
  description:
    "Browse all product categories at Elite Store Bangladesh — electronics, fashion, brodcamp living & more.",
  openGraph: {
    title: "All Categories | Elite Store",
    description: "Discover everything we sell, organized by category.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const revalidate = 3600; // ISR — 1 hour

export default async function CategoriesPage() {
  const res = await getCategoryTree();
  const categories = res?.data ?? [];

  /* JSON-LD */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All Categories — Elite Store",
    url: "https://elitestore.com.bd/categories",
    itemListElement: categories.map((c: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: `https://elitestore.com.bd/categories/${c.slug}`,
    })),
  };

  return (
    <>
      <Script
        id="categories-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoriesPageClient categories={categories} />
    </>
  );
}
