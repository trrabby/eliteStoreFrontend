/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import { getAllProducts } from "@/services/product.service";
import { getCategoryTree } from "@/services/category.service";
import { getAllBrands } from "@/services/brand.service";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSortBar } from "@/components/product/ProductSortBar";
import { ActiveFilterChips } from "@/components/product/ActiveFilterChips";
import { Pagination } from "@/components/product/Pagination";
import { MobileFilterDrawer } from "@/components/product/MobileFilterDrawer";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse thousands of products on Elite Store",
};

// SSR — no cache, filters are dynamic
export const dynamic = "force-dynamic";

type SearchParams = {
  page?: string;
  limit?: string;
  sortBy?: string;
  categoryIds?: string;
  brandIds?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  status?: string;
  minRating?: string;
};

const AllProductsPage = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const query = await searchParams;

  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);

  // helper: supports repeated query params in Next.js
  const parseArray = (
    value: string | string[] | undefined,
  ): number[] | undefined => {
    if (!value) return undefined;

    if (Array.isArray(value)) {
      return value.map(Number).filter(Boolean);
    }

    // single or comma-separated fallback safety
    return value.split(",").map(Number).filter(Boolean);
  };

  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    getAllProducts({
      page,
      limit,
      sortBy: query.sortBy,

      // ✔ MULTI CATEGORY (FIXED)
      categoryIds: parseArray(query.categoryIds),

      // ✔ MULTI BRAND (FIXED)
      brandIds: parseArray(query.brandIds),

      minPrice: query.minPrice ? Number(query.minPrice) : undefined,

      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,

      minRating: query.minRating ? Number(query.minRating) : undefined,

      search: query.search,

      status: "ACTIVE",
    }),

    getCategoryTree(),
    getAllBrands({ limit: 50, isActive: true }),
  ]);

  const products = productsRes?.data?.products ?? [];
  const total = productsRes?.data?.total ?? 0;

  const categories = (categoriesRes?.data ?? []).filter(
    (c: any) => c.depth === 0,
  );

  const brands = brandsRes?.data?.brands ?? [];

  return (
    <div className="container-elite py-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "All Products" }]}
        className="mb-5"
      />

      <div className="flex gap-6">
        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="card p-5 sticky top-28">
            <ProductFilters categories={categories} brands={brands} />
          </div>
        </aside>

        {
          <div className="flex-1 min-w-0">
            {/* Mobile filter button + sort bar */}
            <div className="flex items-center gap-3 mb-4">
              <MobileFilterDrawer categories={categories} brands={brands} />
              <div className="flex-1">
                <ProductSortBar total={total} />
              </div>
            </div>

            {/* Active filter chips */}
            <Suspense>
              <ActiveFilterChips categories={categories} brands={brands} />
            </Suspense>

            {/* Product grid */}
            {products.length === 0 ? (
              <EmptyProducts search={query.search} />
            ) : (
              <>
                <div
                  className="grid grid-cols-2 sm:grid-cols-3
                              lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
                >
                  {products.map((product: any, i: number) => (
                    <ProductCard
                      key={product.publicId}
                      product={product}
                      index={i}
                    />
                  ))}
                </div>

                <Suspense>
                  <Pagination total={total} limit={limit} page={page} />
                </Suspense>
              </>
            )}
          </div>
        }
      </div>
    </div>
  );
};

export default AllProductsPage;

function EmptyProducts({ search }: { search?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="text-6xl">🔍</div>
      <div className="text-center">
        <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
          {search ? `No results for "${search}"` : "No products found"}
        </h3>
        <p className="text-gray-500 text-sm">
          Try adjusting your filters or search terms
        </p>
      </div>
    </div>
  );
}
