/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Search, X, Package, ChevronRight, Layers, Award } from "lucide-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAllProducts } from "@/services/product.service";

/* ── Debounce ─────────────────────────────────────────────────── */
function useDebounce<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type SugProduct = {
  id: number;
  name: string;
  slug: string;
  images: { url: string }[];
  variants: { id: number }[];
  brand?: { name: string; slug: string; logo?: string };
  categories?: { category: { name: string; slug: string } }[];
};

/* ── Skeleton row ─────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SugProduct[]>([]);
  const [total, setTotal] = useState(0);

  const debouncedQuery = useDebounce(query, 300);

  /* ── Extract unique brands from product results ── */
  const suggestedBrands = useMemo(() => {
    const seen = new Set<string>();
    return products
      .map((p) => p.brand)
      .filter(
        (b): b is NonNullable<typeof b> =>
          !!b && !seen.has(b.slug) && Boolean(seen.add(b.slug)),
      )
      .slice(0, 4);
  }, [products]);

  /* ── Extract unique categories from product results ── */
  const suggestedCategories = useMemo(() => {
    const seen = new Set<string>();
    return products
      .flatMap((p) => p.categories?.map((pc) => pc.category) ?? [])
      .filter((c) => !seen.has(c.slug) && Boolean(seen.add(c.slug)))
      .slice(0, 4);
  }, [products]);

  /* ── Fetch suggestions ── */
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) {
      setProducts([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getAllProducts({
        search: q,
        limit: 10,
        page: 1,
        status: "ACTIVE",
      });
      if (res?.success) {
        setProducts(res.data?.products ?? []);
        setTotal(res.data?.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      setOpen(true);
      fetchSuggestions(debouncedQuery);
    } else {
      setOpen(false);
      setProducts([]);
      setTotal(0);
    }
  }, [debouncedQuery, fetchSuggestions]);

  /* ── Close on outside click ── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Close on ESC ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  /* ── Close on navigation ── */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSelect = () => {
    setOpen(false);
  };

  const showDropdown = open && query.length >= 3;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Input ── */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center bg-gray-100 rounded-xl
                   focus-within:ring-2 focus-within:ring-primary/30
                   focus-within:bg-white transition-all duration-200"
      >
        <Search size={18} className="ml-4 text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length >= 3) setOpen(true);
          }}
          placeholder="Search products, brands, categories..."
          className="flex-1 bg-transparent px-3 py-3 text-sm text-gray-900
                     placeholder:text-gray-400 outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          className="m-1.5 px-4 py-2 bg-gradient-primary text-white
                     text-sm font-medium rounded-lg hover:brightness-105 transition-all"
        >
          Search
        </button>
      </form>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-white
                       rounded-2xl shadow-2xl border border-gray-100
                       z-200 overflow-hidden max-h-120 overflow-y-auto"
          >
            {loading ? (
              <div className="py-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center">
                <Package size={36} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  No results for &quot;{query}&quot;
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try different keywords
                </p>
              </div>
            ) : (
              <>
                {/* ── Brands pills ── */}
                {suggestedBrands.length > 0 && (
                  <div className="px-4 pt-4 pb-2">
                    <p
                      className="text-[10px] font-semibold text-gray-400
                                  uppercase tracking-widest mb-2"
                    >
                      Brands
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedBrands.map((b) => (
                        <Link
                          key={b.slug}
                          href={`/brand/${b.slug}`}
                          onClick={handleSelect}
                          className="flex items-center gap-1.5 text-xs font-medium
                                     text-gray-700 bg-gray-100 hover:bg-primary/10
                                     hover:text-primary px-3 py-1.5 rounded-full
                                     transition-all"
                        >
                          {b.logo ? (
                            <Image
                              src={b.logo}
                              alt={b.name}
                              width={14}
                              height={14}
                              className="rounded-full object-contain"
                            />
                          ) : (
                            <Award size={11} className="text-primary/70" />
                          )}
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Category pills ── */}
                {suggestedCategories.length > 0 && (
                  <div className="px-4 pt-1 pb-3 border-b border-gray-50">
                    <p
                      className="text-[10px] font-semibold text-gray-400
                                  uppercase tracking-widest mb-2"
                    >
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedCategories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/category/${c.slug}`}
                          onClick={handleSelect}
                          className="flex items-center gap-1 text-xs font-medium
                                     text-gray-700 bg-gray-100 hover:bg-primary/10
                                     hover:text-primary px-3 py-1.5 rounded-full
                                     transition-all"
                        >
                          <Layers size={10} className="text-primary/70" />
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Products list ── */}
                <div className="divide-y divide-gray-50">
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={handleSelect}
                      className="flex items-center gap-3 px-4 py-3
                                 hover:bg-gray-50 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div
                        className="relative w-11 h-11 rounded-xl overflow-hidden
                                      bg-primary-pale shrink-0"
                      >
                        {p.images?.[0]?.url ? (
                          <Image
                            src={p.images[0].url}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={18} className="text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-gray-900 line-clamp-1
                                      group-hover:text-primary transition-colors"
                        >
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.variants?.length ?? 0} variant
                          {(p.variants?.length ?? 0) !== 1 ? "s" : ""}
                          {p.brand && (
                            <span className="text-gray-300 mx-1">·</span>
                          )}
                          {p.brand?.name}
                        </p>
                      </div>

                      <ChevronRight
                        size={13}
                        className="text-gray-300 group-hover:text-primary
                                   shrink-0 transition-colors"
                      />
                    </Link>
                  ))}
                </div>

                {/* ── See all / footer ── */}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={handleSelect}
                  className="flex items-center justify-center gap-2 p-3.5
                             text-sm font-semibold text-primary
                             hover:bg-primary/5 transition-colors
                             border-t border-gray-100"
                >
                  {total > 10
                    ? `See all ${total.toLocaleString()} results for "${query}"`
                    : `View all results for "${query}"`}
                  <ChevronRight size={14} />
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
