/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/product.service";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ReviewSection } from "@/components/product/ReviewSection";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ProductDetailTabs } from "@/components/product/ProductDetailTabs";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: productSlug } = await params;
  const res = await getProductBySlug(productSlug);
  if (!res?.success || !res.data)
    return { title: "Product Not Found | Elite Store" };

  const product = res.data;
  const price = product.variants?.[0]?.price;
  const image = product.images?.[0]?.url;

  return {
    title: `${product.name}`,
    description:
      product.shortDescription ??
      `Buy ${product.name} at the best price in Bangladesh. Free delivery on orders over ৳1000.`,
    keywords: [
      product.name,
      product.brand?.name,
      product.category?.name,
      "Bangladesh",
      "online shopping",
    ]
      .filter(Boolean)
      .join(", "),
    openGraph: {
      title: product.name,
      description:
        product.shortDescription ?? `৳${price} — Shop now at Elite Store`,
      images: image
        ? [{ url: image, width: 800, height: 800, alt: product.name }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription ?? "",
      images: image ? [image] : [],
    },
    other: {
      "product:price:amount": String(price ?? 0),
      "product:price:currency": "BDT",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug: productSlug } = await params;

  const res = await getProductBySlug(productSlug);

  if (!res?.success || !res?.data) {
    notFound();
  }

  const product = res.data;

  const category = product.categories?.[0]?.category;
  const flashOffer = product.flashSaleItem;

  return (
    <div className="container-elite py-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          ...(category
            ? [{ label: category.name, href: `/category/${category.slug}` }]
            : []),
          { label: product.name },
        ]}
        className="mb-6"
      />

      {/* Product details — client component for interactivity */}
      <Suspense
        fallback={
          <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
        }
      >
        <ProductDetailClient product={product} flashOffer={flashOffer} />
      </Suspense>

      {/* Tabs — Description / Specs / Reviews */}
      <div className="mt-12" id="reviews">
        <ProductDetailTabs
          description={product.description}
          attributes={product.attributes ?? []}
        />

        <ReviewSection
          productId={product.id}
          productSlug={product.slug}
          averageRating={Number(product.averageRating)}
          reviewCount={product.reviewCount}
        />
      </div>

      {/* Related products */}
      {product.relatedProducts?.length > 0 && (
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="section-title">You may also like</h2>
            <span className="block mt-1 w-12 h-1 rounded-full bg-gradient-primary" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {product.relatedProducts.slice(0, 5).map((rp: any, i: number) => (
              <ProductCard
                key={rp.related.publicId}
                product={rp.related}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
