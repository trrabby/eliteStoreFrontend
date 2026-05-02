/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import { getCategoryTree } from "@/services/category.service";
import { getFeaturedBrands } from "@/services/brand.service";
import { getAllProducts } from "@/services/product.service";
import { HeroBanner } from "@/components/home/HeroBanner";
import { TrustBadges } from "@/components/home/TrustBadges";
import { CategoryScroll } from "@/components/home/CategoryScroll";
import { PromoBanners } from "@/components/home/PromoBanners";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandSection } from "@/components/home/BrandSection";
import { PriceRangeCards } from "@/components/home/PriceRangeCards";
import { NewArrivals } from "@/components/home/NewArrivals";
import { FlashSale } from "@/components/home/FlashSale";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elite Store — Feel the elegance",
  description:
    "Bangladesh's premium online shopping destination for fashion, beauty, and lifestyle.",
};

export const revalidate = 300;

// ─── Skeleton ────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Sections ────────────────────────────

async function HeroSection() {
  return <HeroBanner />;
}

async function CategoriesSection() {
  const res = await getCategoryTree();
  const rootCategories = (res?.data ?? [])
    .filter((c: any) => c.depth === 0)
    .slice(0, 20);

  return <CategoryScroll categories={rootCategories} />;
}

async function FeaturedSection() {
  const [featuredRes, newestRes, popularRes, saleRes] = await Promise.all([
    getAllProducts({ isFeatured: true, limit: 10, status: "ACTIVE" }),
    getAllProducts({ sortBy: "newest", limit: 10, status: "ACTIVE" }),
    getAllProducts({ sortBy: "popular", limit: 10, status: "ACTIVE" }),
    getAllProducts({ sortBy: "newest", limit: 10, status: "ACTIVE" }),
  ]);

  return (
    <FeaturedProducts
      featured={featuredRes?.data?.products ?? []}
      newest={newestRes?.data?.products ?? []}
      popular={popularRes?.data?.products ?? []}
      sale={saleRes?.data?.products ?? []}
    />
  );
}

async function BrandsSection() {
  const res = await getFeaturedBrands();
  return <BrandSection brands={res?.data ?? []} />;
}

async function NewArrivalsSection() {
  const res = await getAllProducts({
    sortBy: "newest",
    limit: 12,
    status: "ACTIVE",
  });

  return <NewArrivals products={res?.data?.products ?? []} />;
}

async function FlashSaleSection() {
  const res = await getAllProducts({
    sortBy: "totalSold",
    limit: 10,
    status: "ACTIVE",
  });

  return <FlashSale products={res?.data?.products ?? []} />;
}

// ─── Page ────────────────────────────────

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-brand-50">
      {/* Hero */}
      <Suspense
        fallback={
          <div className="h-[520px] md:h-[600px] lg:h-[680px] bg-brand-100 animate-pulse" />
        }
      >
        <HeroSection />
      </Suspense>

      <TrustBadges />

      {/* Categories */}
      <Suspense
        fallback={
          <div className="h-36 px-4 md:px-6 lg:px-8">
            <div className="flex gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full bg-brand-100 animate-pulse" />
                  <div className="h-3 w-16 rounded-full bg-brand-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <CategoriesSection />
      </Suspense>

      <PromoBanners />

      {/* Featured */}
      <Suspense
        fallback={
          <section className="px-4 md:px-6 lg:px-8 py-10">
            <div className="h-8 w-40 bg-brand-100 rounded-xl mb-6 animate-pulse" />
            <ProductGridSkeleton />
          </section>
        }
      >
        <FeaturedSection />
      </Suspense>

      {/* Brands */}
      <Suspense
        fallback={
          <section className="py-12 bg-brand-100">
            <div className="px-4 md:px-6 lg:px-8">
              <div className="h-8 w-36 bg-brand-200 rounded-xl mx-auto mb-8 animate-pulse" />
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-brand-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </section>
        }
      >
        <BrandsSection />
      </Suspense>

      {/* Flash sale */}
      <Suspense
        fallback={
          <section className="px-4 md:px-6 lg:px-8 py-10">
            <div className="h-8 w-40 bg-brand-100 rounded-xl mb-6 animate-pulse" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-[0_0_200px]">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </section>
        }
      >
        <FlashSaleSection />
      </Suspense>

      <PriceRangeCards />

      {/* New arrivals */}
      <Suspense
        fallback={
          <section className="px-4 md:px-6 lg:px-8 py-10">
            <div className="h-8 w-48 bg-brand-100 rounded-xl mb-6 animate-pulse" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-[0_0_200px]">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </section>
        }
      >
        <NewArrivalsSection />
      </Suspense>

      <div className="h-8" />
    </div>
  );
}
