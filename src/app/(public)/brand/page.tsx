/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Script from "next/script";
import { getAllBrands } from "@/services/brand.service";
import { BrandsPageClient } from "./BrandsPageClient";

export const metadata: Metadata = {
  title: "Top Brands | Elite Store",
  description:
    "Shop authentic products from top brands in Bangladesh. Best prices at Elite Store.",
  openGraph: {
    title: "Top Brands | Elite Store",
    description: "Browse all brands available on Elite Store Bangladesh.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

export default async function BrandsPage() {
  const res = await getAllBrands({ limit: 200 });
  const brands = res?.data?.brands ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top Brands — Elite Store",
    url: "https://elitestore.com.bd/brands",
    itemListElement: brands.map((b: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      url: `https://elitestore.com.bd/brands/${b.slug}`,
    })),
  };

  return (
    <>
      <Script
        id="brands-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BrandsPageClient brands={brands} />
    </>
  );
}
