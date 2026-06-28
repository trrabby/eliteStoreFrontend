/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Layers,
  Award,
  Package,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { getAllProducts } from "@/services/product.service";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";

const LIMIT = 20;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      <div className="bg-gray-100 aspect-square w-full" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 rounded-full w-1/2" />
        <div className="h-3 bg-gray-200 rounded-full w-1/3 pt-1" />
      </div>
    </div>
  );
}

function Pagination({
  page,
  total,
  limit,
  onPage,
}: {
  page: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-8 border-t border-gray-100 mt-8">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 disabled:opacity-40 hover:border-[#ff3e9b] hover:text-[#ff3e9b] bg-white shadow-sm transition-all"
      >
        <ArrowLeft size={14} />
        Previous
      </button>

      <div className="hidden sm:flex items-center gap-1">
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(
          (p) => (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                page === p
                  ? "bg-[#ff3e9b] text-white shadow-md shadow-[#ff3e9b]/20"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-[#ff88ba] hover:text-[#ff3e9b]",
              )}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pages}
        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 disabled:opacity-40 hover:border-[#ff3e9b] hover:text-[#ff3e9b] bg-white shadow-sm transition-all"
      >
        Next
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

type Props = { query: string };

export function SearchPageClient({ query: initialQuery }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const relatedBrands = useMemo(() => {
    const seen = new Set<string>();
    return products
      .map((p) => p.brand)
      .filter(
        (b): b is NonNullable<typeof b> =>
          !!b && !seen.has(b.slug) && Boolean(seen.add(b.slug)),
      )
      .slice(0, 5);
  }, [products]);

  const relatedCategories = useMemo(() => {
    const seen = new Set<string>();
    return products
      .flatMap((p) => p.categories?.map((pc: any) => pc.category) ?? [])
      .filter((c) => !!c && !seen.has(c.slug) && Boolean(seen.add(c.slug)))
      .slice(0, 5);
  }, [products]);

  const doSearch = useCallback(
    async (query: string, pg: number, sort: string) => {
      if (!query.trim()) {
        setProducts([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      try {
        const res = await getAllProducts({
          search: initialQuery || query,
          sortBy: sort,
          page: pg,
          limit: LIMIT,
          status: "ACTIVE",
        });
        if (res?.success) {
          setProducts(res.data?.products ?? []);
          setTotal(res.data?.total ?? 0);
        }
      } finally {
        setLoading(false);
      }
    },
    [initialQuery],
  );

  useEffect(() => {
    doSearch(q, page, sortBy);
  }, [q, page, sortBy, doSearch]);

  const handleClear = () => {
    setQ("");
    setProducts([]);
    setTotal(0);
    router.push("/search");
  };

  const handlePage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* ── All-In-One Unified Top Control Tab ──────────────────────── */}
      {q && (
        <div className="bg-white border-b border-gray-200/80 shadow-xs sticky top-0 z-20 py-3">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-2.5">
            {/* Row 1: Left Stats & Right Sort */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-50 pb-2">
              <div>
                {loading ? (
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                ) : (
                  <p className="text-xs text-gray-500 font-medium">
                    Found{" "}
                    <span className="font-bold text-[#d4006f] bg-[#ffedfa] px-1.5 py-0.5 rounded">
                      {total.toLocaleString()}
                    </span>{" "}
                    items for &quot;
                    <span className="font-semibold text-gray-800">
                      {initialQuery}
                    </span>
                    &quot;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal size={12} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="text-xs font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#ff3e9b] bg-white cursor-pointer text-gray-700 transition-all"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Combined Context Filter Clouds */}
            {!loading &&
              (relatedBrands.length > 0 || relatedCategories.length > 0) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
                  {relatedCategories.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-400 uppercase tracking-wider">
                        Categories:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {relatedCategories.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/category/${c.slug}`}
                            className="inline-flex items-center gap-1 font-medium text-gray-600 bg-gray-50 hover:bg-[#ffedfa] hover:text-[#d4006f] border border-gray-200/60 px-2 py-0.5 rounded transition-all"
                          >
                            <Layers size={10} className="text-[#ff3e9b]" />
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {relatedBrands.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-400 uppercase tracking-wider">
                        Brands:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {relatedBrands.map((b) => (
                          <Link
                            key={b.slug}
                            href={`/brand/${b.slug}`}
                            className="inline-flex items-center gap-1 font-medium text-gray-600 bg-gray-50 hover:bg-[#ffedfa] hover:text-[#d4006f] border border-gray-200/60 px-2 py-0.5 rounded transition-all"
                          >
                            <Award size={10} className="text-[#ff3e9b]" />
                            {b.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      )}

      {/* ── Main View Panel Grid ──────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!q ? (
          /* State A: Baseline Idle Template */
          <div className="py-16 max-w-sm mx-auto text-center bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#ffedfa] flex items-center justify-center mb-4 mx-auto">
              <Search size={24} className="text-[#ff3e9b]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Begin your search
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Explore products across tags, variants, and boutique partners.
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {["Fashion", "Electronics", "Home", "Beauty"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQ(s);
                    router.push(`/search?q=${encodeURIComponent(s)}`);
                  }}
                  className="text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-[#ffedfa] hover:text-[#d4006f] px-3 py-1.5 rounded-lg transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          /* State B: Fast Skeleton Cells */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : total === 0 ? (
          /* State C: Empty Search Feedback */
          <div className="py-16 text-center max-w-sm mx-auto bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <Package size={28} className="mx-auto text-gray-300 mb-3" />
            <h2 className="text-base font-bold text-gray-900 mb-1">
              No matches found
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              We couldn’t find variants for &quot;{q}&quot;.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleClear}
                className="bg-[#ff3e9b] hover:bg-[#d4006f] text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
              >
                Reset
              </button>
              <Link
                href="/products"
                className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold py-2 px-4 rounded-lg border border-gray-200 transition-all"
              >
                Browse All
              </Link>
            </div>
          </div>
        ) : (
          /* State D: Output Grid Matrix */
          <AnimatePresence mode="wait">
            <motion.div
              key={`${q}-${page}-${sortBy}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product, i) => (
                  <ProductCard
                    key={product.id ?? product.publicId}
                    product={product}
                    index={i}
                  />
                ))}
              </div>

              <Pagination
                page={page}
                total={total}
                limit={LIMIT}
                onPage={handlePage}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
