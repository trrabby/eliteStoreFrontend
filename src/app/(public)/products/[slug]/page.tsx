/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/product.service";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ReviewSection } from "@/components/product/ReviewSection";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { formatBDT, discountPercent } from "@/lib/utils/currency";
import type { Metadata } from "next";
import { Star, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AddToCartSection } from "@/components/product/AddToCartSection";
import { ProductDetailTabs } from "@/components/product/ProductDetailTabs";
import { FlashSaleBadge } from "@/components/product/FlashSaleBadge";

// SSR — price/stock always fresh
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const res = await getProductBySlug(slug);

  const p = res?.data;

  if (!p) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: p.name,
    description: p.shortDescription ?? p.description?.slice(0, 160),

    openGraph: {
      title: `${p.name} | Elite Store`,
      images: p.images?.[0]?.url ? [p.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const res = await getProductBySlug(slug);

  if (!res?.success || !res?.data) {
    notFound();
  }

  const product = res.data;

  const defaultVariant =
    product.variants?.find((v: any) => v.isDefault && v.isActive) ??
    product.variants?.[0];

  // breadcrumb from first category
  const category = product.categories?.[0]?.category;

  // flash sale offer
  const flashOffer = product.flashSaleItem;

  const displayPrice = flashOffer?.salePrice
    ? Number(flashOffer.salePrice)
    : Number(defaultVariant?.price ?? 0);

  const originalPrice = Number(defaultVariant?.price ?? 0);
  const comparePrice = Number(defaultVariant?.comparePrice ?? 0);

  const effectiveCompare = flashOffer ? originalPrice : comparePrice;

  const discount = discountPercent(displayPrice, effectiveCompare);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left — Images */}
        <div>
          <ProductImageGallery
            images={product.images ?? []}
            productName={product.name}
          />
        </div>

        {/* Right — Details */}
        <div className="space-y-5">
          {/* Brand */}
          {product.brand && (
            <p
              className="text-sm text-primary font-semibold uppercase
                          tracking-widest"
            >
              {product.brand.name}
            </p>
          )}

          {/* Name */}
          <h1
            className="font-display text-2xl md:text-3xl font-bold
                         text-gray-900 leading-tight"
          >
            {product.name}
          </h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={cn(
                      i < Math.round(product.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200 fill-gray-200",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {Number(product.averageRating).toFixed(1)}
              </span>
              <a
                href="#reviews"
                className="text-sm text-gray-500 hover:text-primary
                           transition-colors"
              >
                ({product.reviewCount} reviews)
              </a>
            </div>
          )}

          {/* Flash sale badge */}
          {flashOffer && (
            <FlashSaleBadge
              saleTitle={flashOffer.flashSale.title}
              endsAt={flashOffer.flashSale.endsAt}
              discountType={flashOffer.discountType}
              discountValue={Number(flashOffer.discountValue)}
            />
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-primary">
              {formatBDT(displayPrice)}
            </span>
            {effectiveCompare > displayPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatBDT(effectiveCompare)}
                </span>
                <span className="badge-discount text-sm px-2 py-1">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Variant selector + Add to cart — client component */}
          <Suspense>
            <AddToCartSection
              product={product}
              defaultVariant={defaultVariant}
              flashOffer={flashOffer ?? null}
            />
          </Suspense>

          {/* Delivery info */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {[
              { icon: Truck, text: "Free delivery above ৳1000" },
              { icon: RotateCcw, text: "7-day return policy" },
              { icon: ShieldCheck, text: "Authentic product" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <div
                  className="w-10 h-10 rounded-xl bg-primary-pale
                                flex items-center justify-center"
                >
                  <Icon size={18} className="text-primary" />
                </div>
                <p className="text-xs text-gray-500 leading-tight">{text}</p>
              </div>
            ))}
          </div>

          {/* Vendor info */}
          {product.vendor && (
            <div
              className="flex items-center gap-3 p-4 bg-gray-50
                            rounded-2xl border border-gray-100"
            >
              {product.vendor.logo && (
                <img
                  src={product.vendor.logo}
                  alt={product.vendor.storeName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Sold by</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {product.vendor.storeName}
                </p>
              </div>
              {product.vendor.isVerified && (
                <ShieldCheck
                  size={16}
                  className="text-green-500 flex-shrink-0"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs — Description / Specs / Reviews */}
      <div className="mt-12" id="reviews">
        <ProductDetailTabs
          description={product.description}
          attributes={product.attributes ?? []}
        />

        <ReviewSection
          productId={product.id}
          averageRating={Number(product.averageRating)}
          reviewCount={product.reviewCount}
        />
      </div>

      {/* Related products */}
      {product.relatedProducts?.length > 0 && (
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="section-title">You may also like</h2>
            <span
              className="block mt-1 w-12 h-1 rounded-full
                             bg-gradient-primary"
            />
          </div>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                          xl:grid-cols-5 gap-3 md:gap-4"
          >
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
