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

// ISR — revalidate every 5 minutes
export const revalidate = 300;

// ─── Skeleton fallbacks ───────────────────

function ProductGridSkeleton() {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                    xl:grid-cols-5 gap-3 md:gap-4"
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Async data sections ─────────────────
// Each is its own async server component so they load independently

async function HeroSection() {
  return <HeroBanner />; // static slides
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
    // sale: you can add a discount filter when your API supports it
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
    sortBy: "popular",
    limit: 10,
    status: "ACTIVE",
  });
  return <FlashSale products={res?.data?.products ?? []} />;
}

// ─── Home Page ────────────────────────────

export default async function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero — full width, above fold */}
      <Suspense
        fallback={
          <div className="h-[520px] md:h-[600px] lg:h-[680px] skeleton" />
        }
      >
        <HeroSection />
      </Suspense>

      {/* Trust badges */}
      <TrustBadges />

      {/* Categories scroll */}
      <Suspense
        fallback={
          <div className="h-36 container-elite">
            <div className="flex gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="skeleton w-20 h-20 rounded-full" />
                  <div className="skeleton h-3 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <CategoriesSection />
      </Suspense>

      {/* Promo banners — static, no data needed */}
      <PromoBanners />

      {/* Featured products with tabs */}
      <Suspense
        fallback={
          <section className="container-elite py-10">
            <div className="skeleton h-8 w-40 rounded-xl mb-6" />
            <ProductGridSkeleton />
          </section>
        }
      >
        <FeaturedSection />
      </Suspense>

      {/* Top brands */}
      <Suspense
        fallback={
          <section className="py-12 bg-gradient-pale">
            <div className="container-elite">
              <div className="skeleton h-8 w-36 rounded-xl mx-auto mb-8" />
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-square rounded-2xl" />
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
          <section className="container-elite py-10">
            <div className="skeleton h-8 w-40 rounded-xl mb-6" />
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

      {/* Price range cards */}
      <PriceRangeCards />

      {/* New arrivals */}
      <Suspense
        fallback={
          <section className="container-elite py-10">
            <div className="skeleton h-8 w-48 rounded-xl mb-6" />
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

      {/* Bottom spacing for mobile nav */}
      <div className="h-8" />
    </div>
  );
}
