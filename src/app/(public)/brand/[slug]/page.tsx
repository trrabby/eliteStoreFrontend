import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getBrandBySlug } from "@/services/brand.service";
import { getAllProducts } from "@/services/product.service";
import { BrandPageClient } from "./BrandPageClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getBrandBySlug(slug);
  if (!res?.success || !res.data) return { title: "Brand | Elite Store" };

  const brand = res.data;
  const title = `${brand.name} Products | Elite Store`;
  const description =
    brand.description ||
    `Shop authentic ${brand.name} products in Bangladesh. Best price guaranteed at Elite Store.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: brand.banner
        ? [{ url: brand.banner, width: 1200, height: 630 }]
        : brand.logo
        ? [{ url: brand.logo, width: 400, height: 400 }]
        : [],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/brands/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const res = await getBrandBySlug(slug);

  if (!res?.success || !res.data) notFound();

  const brand = res.data;

  /* SSR first page of products */
  const initialProdRes = await getAllProducts({
    brandIds: brand.id,
    sortBy: "newest",
    page: 1,
    limit: 20,
  });

  const initialProducts = initialProdRes?.data?.products ?? [];
  const initialTotal = initialProdRes?.data?.total ?? 0;

  /* JSON-LD */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    url: brand.website ?? `https://elitestore.com.bd/brands/${slug}`,
    logo: brand.logo ?? undefined,
    description: brand.description ?? "",
    sameAs: brand.website ? [brand.website] : [],
  };

  return (
    <>
      <Script
        id="brand-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BrandPageClient
        brand={brand}
        initialProducts={initialProducts}
        initialTotal={initialTotal}
      />
    </>
  );
}
