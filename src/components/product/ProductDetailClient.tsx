/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { AddToCartSection } from "@/components/product/AddToCartSection";
import { Star, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import Link from "next/link";

interface ProductDetailClientProps {
  product: any;
  flashOffer: any | null;
}

export function ProductDetailClient({
  product,
  flashOffer,
}: ProductDetailClientProps) {
  //   console.log(flashOffer);
  const defaultVariant =
    product.variants?.find((v: any) => v.isDefault && v.isActive) ??
    product.variants?.[0];

  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // All product images (including variant-linked ones)
  const allImages = product.images ?? [];

  // When variant changes, try to select the first image that belongs to this variant
  useEffect(() => {
    if (!selectedVariant || allImages.length === 0) {
      setSelectedImageIndex(0);
      return;
    }

    // Find first image that matches the variant
    const variantImageIndex = allImages.findIndex(
      (img: any) => img.variantId === selectedVariant.id,
    );

    if (variantImageIndex !== -1) {
      setSelectedImageIndex(variantImageIndex);
    } else {
      // If no image belongs to this variant, keep current index or go to 0
      // We keep current if it's within bounds, else reset to 0
      if (selectedImageIndex >= allImages.length) {
        setSelectedImageIndex(0);
      }
      // else keep current
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant]);

  const averageRating = Number(product.averageRating);
  const reviewCount = product.reviewCount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left — Images */}
      <div>
        <ProductImageGallery
          images={allImages}
          productName={product.name}
          selectedIndex={selectedImageIndex}
          onSelect={setSelectedImageIndex}
        />
      </div>

      {/* Right — Details */}
      <div className="space-y-5">
        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-primary font-semibold uppercase tracking-widest">
            {product.brand.name}
          </p>
        )}

        {/* Name */}
        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
          {product.name}
        </h1>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={cn(
                    i < Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200 fill-gray-200",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <a
              href="#reviews"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              ({reviewCount} reviews)
            </a>
          </div>
        )}

        {/* Short description */}
        {product.shortDescription && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* Add to Cart Section */}
        <AddToCartSection
          product={product}
          defaultVariant={defaultVariant}
          flashOffer={flashOffer}
          onVariantChange={setSelectedVariant}
        />

        {/* Delivery info */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          {[
            { icon: Truck, text: "Free delivery above ৳2000" },
            {
              icon: RotateCcw,
              text: `${
                product?.vendor?.returnAcceptWithin
                  ? `Return Accepts Within ${product?.vendor?.returnAcceptWithin} days`
                  : "Vendor Specific Return Policy"
              } `,
            },
            { icon: ShieldCheck, text: "Authentic product" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-pale flex items-center justify-center">
                <Icon size={18} className="text-primary" />
              </div>
              <p className="text-xs text-gray-500 leading-tight">{text}</p>
            </div>
          ))}
        </div>

        {/* Vendor info */}
        {product.vendor && (
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/80 border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Subtle accent gradient line on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-l-2xl" />

            <div className="flex items-center gap-4 p-4">
              {/* Vendor Logo */}
              <div className="flex-shrink-0">
                {product.vendor.logo ? (
                  <Image
                    src={product.vendor.logo}
                    alt={product.vendor.storeName}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm"
                    height={48}
                    width={48}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/10">
                    {product.vendor.storeName?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Vendor Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Sold by
                  </p>
                  {product.vendor.isVerified && (
                    <ShieldCheck
                      size={12}
                      className="text-green-500 shrink-0"
                    />
                  )}
                </div>
                <Link
                  href={`/vendor/${product.vendor.slug}`}
                  className="group/link inline-flex items-center gap-1"
                >
                  <p className="text-sm font-semibold text-gray-900 truncate hover:text-primary transition-colors">
                    {product.vendor.storeName}
                  </p>
                  <span className="text-gray-400 group-hover/link:translate-x-0.5 transition-transform duration-200 text-xs">
                    →
                  </span>
                </Link>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {product.vendor.isVerified
                    ? "Verified Seller"
                    : "Trusted Seller"}
                </p>
              </div>

              {/* Visit Store Button */}
              <Link
                href={`/vendor/${product.vendor.slug}`}
                className="shrink-0 text-xs font-medium text-primary hover:text-primary-dark border border-primary/20 hover:border-primary/40 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-primary/5"
              >
                Visit Store
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
