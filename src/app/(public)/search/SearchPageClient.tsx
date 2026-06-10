/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { getAllProducts } from "@/services/product.service";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { Pagination } from "@/components/product/Pagination";
import Link from "next/link";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "rating", label: "Top Rated" },
];

type Props = { query: string };

export function SearchPageClient({ query: initialQuery }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQuery);
  const [input, setInput] = useState(initialQuery);
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const page = Number(searchParams.get("page") ?? 1);

  const search = useCallback(
    async (query: string, pg = 1, sort = sortBy) => {
      if (!query.trim()) {
        setProducts([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      const res = await getAllProducts({
        page: pg,
        limit: 20,
        search: query,
        sortBy: sort,
      });
      if (res?.success) {
        setProducts(res.data?.products ?? []);
        setTotal(res.data?.total ?? 0);
      }
      setLoading(false);
    },
    [sortBy],
  );

  useEffect(() => {
    search(q, page, sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, sortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setQ(trimmed);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleClear = () => {
    setInput("");
    setQ("");
    setProducts([]);
    setTotal(0);
    router.push("/search");
  };

  return (
    <div className="container-elite py-8">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search for products, brands, categories..."
            autoFocus
            className="w-full pl-11 pr-10 py-4 rounded-2xl border-2 border-gray-200
                       text-sm outline-none focus:border-primary focus:ring-4
                       focus:ring-primary/10 transition-all font-medium"
          />
          {input && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="btn-primary px-8 py-4 rounded-2xl text-sm font-semibold hidden sm:flex items-center gap-2"
        >
          <Search size={16} />
          Search
        </button>
      </form>

      {/* Results header */}
      {q && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-xl font-bold text-gray-900">
              {loading
                ? "Searching..."
                : total > 0
                ? `${total.toLocaleString()} results for "${q}"`
                : `No results for "${q}"`}
            </h1>
            {!loading && total === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Try different keywords or browse our{" "}
                <Link href="/products" className="text-primary hover:underline">
                  products
                </Link>
              </p>
            )}
          </div>

          {total > 0 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Products grid */}
      {!q ? (
        <div className="text-center py-20">
          <Search size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-xl font-display font-semibold text-gray-400">
            What are you looking for?
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Search millions of products from hundreds of vendors
          </p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${q}-${page}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
                {total > 20 && (
                  <div className="mt-8">
                    <Pagination total={total} limit={20} page={page} />
                  </div>
                )}
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
