/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getCategoryBySlug } from "@/services/category.service";
import { getAllProducts } from "@/services/product.service";
import { CategoryPageClient } from "./CategoryPageClient";

type Props = { params: Promise<{ slug: string }> };

// ── Collect all IDs including children recursively ──────────────
function collectIds(cat: any): number[] {
  const ids: number[] = [cat.id];
  if (cat.children?.length) {
    for (const child of cat.children) ids.push(...collectIds(child));
  }
  return ids;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getCategoryBySlug(slug);
  if (!res?.success || !res.data) return { title: "Category | Elite Store" };

  const cat = res.data;
  const title = cat.metaTitle || `${cat.name} Products | Elite Store`;
  const description =
    cat.metaDesc ||
    cat.description ||
    `Shop the best ${cat.name} products on Elite Store Bangladesh. Best prices guaranteed.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: cat.image ? [{ url: cat.image, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/categories/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  console.log(slug);
  const catRes = await getCategoryBySlug(slug);
  if (!catRes?.success || !catRes.data) notFound();

  const category = catRes.data;
  // console.log(category);
  const ids = collectIds(category); // now an array of numbers
  console.log(ids);
  // SSR first page of products for SEO
  const initialProdRes = await getAllProducts({
    categoryIds: ids, // pass as array
    sortBy: "newest",
    page: 1,
    limit: 20,
  });

  const initialProducts = initialProdRes?.data?.products ?? [];
  const initialTotal = initialProdRes?.data?.total ?? 0;

  /* JSON-LD structured data */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description ?? "",
    url: `https://elitestore.com.bd/categories/${slug}`,
    image: category.image ?? undefined,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://elitestore.com.bd",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Categories",
          item: "https://elitestore.com.bd/categories",
        },
        { "@type": "ListItem", position: 3, name: category.name },
      ],
    },
  };

  return (
    <>
      <Script
        id="category-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPageClient
        category={category}
        categoryIds={ids} // pass as array
        initialProducts={initialProducts}
        initialTotal={initialTotal}
      />
    </>
  );
}
