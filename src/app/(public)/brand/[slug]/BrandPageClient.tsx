/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  ChevronDown,
  Award,
  Globe,
  MapPin,
  Package,
  Star,
} from "lucide-react";
import { getAllProducts } from "@/services/product.service";
import { getAllBrands } from "@/services/brand.service";
import { getCategoryTree } from "@/services/category.service";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { cn } from "@/lib/utils/cn";

const LIMIT = 20;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function useDebounce<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <p
        className={cn(
          "text-gray-600 text-sm leading-relaxed text-justify transition-all",
          !expanded && "line-clamp-2",
        )}
      >
        {text}
      </p>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-1.5 text-xs font-semibold text-primary hover:underline flex items-center gap-1"
      >
        {expanded ? "Show less" : "See more"}
        <ChevronDown
          size={12}
          className={cn("transition-transform", expanded && "rotate-180")}
        />
      </button>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="skeleton aspect-square" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}

function Pagination({
  page,
  total,
  limit,
  onChange,
}: {
  page: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              "w-9 h-9 rounded-xl text-sm font-medium transition-all",
              page === p
                ? "bg-primary text-white"
                : "border border-gray-200 hover:border-primary hover:text-primary",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
      >
        Next
      </button>
    </div>
  );
}

function FilterDrawer({
  open,
  onClose,
  sortBy,
  onSortBy,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  minRating,
  onMinRating,
  onReset,
  activeCount,
}: any) {
  const inp =
    "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary";
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 inset-x-0 bg-white z-50 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <span className="font-semibold text-gray-900">Filters</span>
                {activeCount > 0 && (
                  <span className="bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button
                    onClick={onReset}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="px-5 py-4 space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Sort By
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => onSortBy(o.value)}
                      className={cn(
                        "text-sm py-2.5 rounded-xl border font-medium transition-all",
                        sortBy === o.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-600",
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Price Range (৳)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice ?? ""}
                    onChange={(e) =>
                      onMinPrice(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className={inp}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice ?? ""}
                    onChange={(e) =>
                      onMaxPrice(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className={inp}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Min Rating
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onClick={() =>
                        onMinRating(minRating === r ? undefined : r)
                      }
                      className={cn(
                        "flex-1 py-2 rounded-xl border text-sm font-medium flex items-center justify-center gap-1 transition-all",
                        minRating === r
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-600",
                      )}
                    >
                      {r}
                      <Star
                        size={11}
                        className={minRating === r ? "fill-primary" : ""}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full btn-primary py-3.5 text-sm"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function BrandPageClient({
  brand,
  initialProducts,
  initialTotal,
}: {
  brand: any;
  initialProducts: any[];
  initialTotal: number;
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  const [suggestedBrands, setSuggestedBrands] = useState<any[]>([]);
  const [suggestedCats, setSuggestedCats] = useState<any[]>([]);

  const debouncedSearch = useDebounce(search, 400);
  const isFirstRender = useRef(true);

  const activeCount = useMemo(() => {
    let c = 0;
    if (sortBy !== "newest") c++;
    if (minPrice) c++;
    if (maxPrice) c++;
    if (minRating) c++;
    if (search) c++;
    return c;
  }, [sortBy, minPrice, maxPrice, minRating, search]);

  const resetFilters = () => {
    setSearch("");
    setSortBy("newest");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setPage(1);
  };

  const fetchProducts = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res = await getAllProducts({
          brandIds: [brand.id],
          search: debouncedSearch || undefined,
          sortBy,
          minPrice,
          maxPrice,
          minRating,
          page: p,
          limit: LIMIT,
        });
        if (res?.success) {
          setProducts(res.data?.products ?? []);
          setTotal(res.data?.total ?? 0);
        }
      } finally {
        setLoading(false);
      }
    },
    [brand.id, debouncedSearch, sortBy, minPrice, maxPrice, minRating],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
    fetchProducts(1);
  }, [debouncedSearch, sortBy, minPrice, maxPrice, minRating]);

  useEffect(() => {
    if (isFirstRender.current) return;
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    async function load() {
      const [brandsRes, catsRes] = await Promise.all([
        getAllBrands({ limit: 9, isFeatured: true }),
        getCategoryTree(),
      ]);
      setSuggestedBrands(
        (brandsRes?.data?.brands ?? [])
          .filter((b: any) => b.id !== brand.id)
          .slice(0, 8),
      );
      const roots: any[] = (catsRes?.data ?? []).slice(0, 8);
      setSuggestedCats(roots);
    }
    load();
  }, [brand.id]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Brands", href: "/brands" },
    { label: brand.name },
  ];

  return (
    <div className="min-h-screen">
      {/* ─── Banner ──────────────────────────────────────────────── */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        {brand.banner ? (
          <>
            <Image
              src={brand.banner}
              alt={brand.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/30 to-black/70" />
          </>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 25% 50%, white 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
            </div>
          </div>
        )}

        {/* Floating shapes */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-8 left-8 w-20 h-20 bg-primary/20 rounded-full blur-xl" />

        <div className="absolute inset-0 flex flex-col justify-end pb-6 px-4">
          <div className="container-elite">
            <Breadcrumb
              items={breadcrumbs}
              className="mb-3 text-white/80 [&_a]:text-white/70"
            />
            <div className="flex items-end gap-4">
              {brand.logo && (
                <div
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden
                                border-4 border-white/20 shadow-xl shrink-0 bg-white"
                >
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              )}
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">
                  {brand.name}
                </h1>
                <div className="flex items-center gap-4 text-white/80 text-sm flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Package size={14} />
                    {total.toLocaleString()} products
                  </span>
                  {brand.country && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {brand.country}
                    </span>
                  )}
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <Globe size={14} />
                      Official Site
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-elite py-6">
        {/* ─── Brand Info Card ──────────────────────────────────── */}
        <div className="relative p-6 mb-6rounded-3xl ">
          <div className="flex items-start gap-5">
            {brand.logo && !brand.banner && (
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-white shadow-md bg-white">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="font-display text-2xl font-bold text-gray-900">
                  {brand.name}
                </h2>
                {brand.isFeatured && (
                  <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-3 py-1 rounded-full">
                    <Award size={11} />
                    Featured Brand
                  </span>
                )}
              </div>
              {brand.description && <ExpandableText text={brand.description} />}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                {brand.country && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary/70" />
                    {brand.country}
                  </span>
                )}
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Globe size={13} />
                    {brand.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Filter bar ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${brand.name} products...`}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm
                         outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white/80 backdrop-blur-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="hidden sm:block rounded-xl border border-gray-200 px-3 py-2.5 text-sm
                       bg-white/80 backdrop-blur-sm outline-none focus:border-primary cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowDrawer(true)}
            className={cn(
              "sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium bg-white/80 backdrop-blur-sm",
              activeCount > 0
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 text-gray-600",
            )}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeCount > 0 && (
              <span className="bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="৳ Min"
                value={minPrice ?? ""}
                onChange={(e) =>
                  setMinPrice(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="w-24 rounded-xl border border-gray-200 px-3 py-2.5 text-sm
                           outline-none focus:border-primary bg-white/80 backdrop-blur-sm"
              />
              <span className="text-gray-400 text-xs">–</span>
              <input
                type="number"
                placeholder="৳ Max"
                value={maxPrice ?? ""}
                onChange={(e) =>
                  setMaxPrice(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="w-24 rounded-xl border border-gray-200 px-3 py-2.5 text-sm
                           outline-none focus:border-primary bg-white/80 backdrop-blur-sm"
              />
            </div>
            <select
              value={minRating ?? ""}
              onChange={(e) =>
                setMinRating(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white/80 backdrop-blur-sm outline-none focus:border-primary"
            >
              <option value="">All Ratings</option>
              {[4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r}★ & above
                </option>
              ))}
            </select>
            {activeCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-red-400 hover:text-red-600 px-2"
              >
                <X size={12} className="inline mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active chips */}
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {sortBy !== "newest" && (
                <span className="chip">
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                  <button onClick={() => setSortBy("newest")}>
                    <X size={10} />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="chip">
                  {minPrice ? `৳${minPrice}` : "৳0"} –{" "}
                  {maxPrice ? `৳${maxPrice}` : "∞"}
                  <button
                    onClick={() => {
                      setMinPrice(undefined);
                      setMaxPrice(undefined);
                    }}
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {minRating && (
                <span className="chip">
                  {minRating}★ & above
                  <button onClick={() => setMinRating(undefined)}>
                    <X size={10} />
                  </button>
                </span>
              )}
              {search && (
                <span className="chip">
                  "{search}"
                  <button onClick={() => setSearch("")}>
                    <X size={10} />
                  </button>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Products ──────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading
              ? "Loading..."
              : `${total.toLocaleString()} product${total !== 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={64} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Try adjusting your filters
            </p>
            <button
              onClick={resetFilters}
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={page + sortBy + search}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {products.map((product, i) => (
                <ProductCard
                  key={product.id ?? product.publicId}
                  product={product}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <Pagination
          page={page}
          total={total}
          limit={LIMIT}
          onChange={(p) => setPage(p)}
        />

        {/* ─── Suggestions ───────────────────────────────────────── */}
        {(suggestedBrands.length > 0 || suggestedCats.length > 0) && (
          <div className="mt-14 space-y-10">
            {suggestedBrands.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-display text-xl font-bold text-gray-900">
                      Other Brands
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      You might also like these brands
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {suggestedBrands.map((b: any) => (
                    <Link
                      key={b.id}
                      href={`/brands/${b.slug}`}
                      className="group relative bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all"
                    >
                      {b.logo ? (
                        <Image
                          src={b.logo}
                          alt={b.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-primary-pale flex items-center justify-center shrink-0">
                          <Award size={18} className="text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                          {b.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {b._count?.products ?? 0} products
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-gray-300 ml-auto shrink-0 group-hover:text-primary transition-colors"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <FilterDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        sortBy={sortBy}
        onSortBy={setSortBy}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPrice={setMinPrice}
        onMaxPrice={setMaxPrice}
        minRating={minRating}
        onMinRating={setMinRating}
        onReset={resetFilters}
        activeCount={activeCount}
      />
    </div>
  );
}
