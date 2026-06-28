/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
  Layers,
  ChevronRight,
  Package,
  Grid3X3,
  LayoutGrid,
  Folder,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* ── Flatten tree for search ────────────────────────────────────── */
function flattenTree(nodes: any[], parentName?: string): any[] {
  const result: any[] = [];
  for (const node of nodes) {
    result.push({ ...node, parentName });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, node.name));
    }
  }
  return result;
}

/* ── Search result card (grid) ────────────────────────────────── */
function SearchResultCard({ cat }: { cat: any }) {
  return (
    <Link href={`/category/${cat.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100/80 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-4/3 bg-primary-pale/30">
          {cat.image ? (
            <>
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Folder size={48} />
            </div>
          )}
          {cat.productCount > 0 && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-primary px-2 py-0.5 rounded-full shadow-sm">
              {cat.productCount} items
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
            {cat.name}
          </p>
          {cat.parentName && (
            <p className="text-xs text-gray-400 truncate">
              in {cat.parentName}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Subcategory card (cinematic) ─────────────────────────────── */
function SubcategoryCard({ sub, index }: { sub: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative"
    >
      <Link href={`/category/${sub.slug}`} className="block h-full">
        <div className="relative h-full overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="relative aspect-4/3 bg-gradient-to-br from-primary-pale/30 to-white">
            {sub.image ? (
              <Image
                src={sub.image}
                alt={sub.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Layers size={48} className="text-primary/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {sub.productCount > 0 && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-primary px-2 py-0.5 rounded-full shadow-sm border border-white/50">
              {sub.productCount} items
            </div>
          )}

          <div className="p-4">
            <h3 className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
              {sub.name}
            </h3>
            {sub.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {sub.description}
              </p>
            )}
            <div className="mt-3 flex items-center text-xs text-primary/70 group-hover:text-primary transition-colors">
              <span>Explore</span>
              <ChevronRight
                size={14}
                className="ml-1 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Sidebar root category item ────────────────────────────────── */
function SidebarItem({
  cat,
  isSelected,
  onClick,
}: {
  cat: any;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3",
        isSelected
          ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-r-4 border-primary shadow-sm"
          : "hover:bg-primary/5 border-r-4 border-transparent",
      )}
    >
      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-primary-pale/30">
        {cat.image ? (
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Folder size={18} className={isSelected ? "text-primary" : ""} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isSelected ? "text-primary" : "text-gray-700",
          )}
        >
          {cat.name}
        </p>
        <p className="text-xs text-gray-400">{cat.productCount} products</p>
      </div>
      {isSelected && <Sparkles size={14} className="text-primary shrink-0" />}
    </button>
  );
}

/* ── Main client ────────────────────────────────────────────────── */
export function CategoriesPageClient({ categories }: { categories: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedRootId, setSelectedRootId] = useState<number | null>(
    categories.length > 0 ? categories[0].id : null,
  );
  const [view, setView] = useState<"split" | "grid">("split");

  const flatAll = useMemo(() => flattenTree(categories), [categories]);

  /* ── Stats ── */
  const totalCats = flatAll.length;
  const totalProds = useMemo(
    () => categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0),
    [categories],
  );

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return flatAll.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.parentName?.toLowerCase().includes(q),
    );
  }, [search, flatAll]);

  const isSearching = search.trim().length > 0;

  // Selected root category
  const selectedRoot = categories.find((c) => c.id === selectedRootId);
  const subcategories = selectedRoot?.children || [];

  return (
    <div className="min-h-screen">
      {/* ─── Hero ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 py-12 sm:py-16">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-primary/10 rounded-full blur-2xl" />

        <div className="relative container-elite text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-4"
          >
            <Grid3X3 size={13} />
            Browse Categories
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            Explore Everything
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-sm sm:text-base mb-6 max-w-lg mx-auto"
          >
            {totalCats} categories · {totalProds.toLocaleString()} products
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative max-w-md mx-auto"
          >
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 text-sm outline-none focus:bg-white/15 focus:border-primary/50 transition-all backdrop-blur-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
              >
                <X size={14} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container-elite py-6">
        {/* ─── Toolbar ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {isSearching
              ? `${(filtered ?? []).length} result${
                  (filtered ?? []).length !== 1 ? "s" : ""
                }`
              : `${categories.length} root categories`}
          </p>

          {!isSearching && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(["split", "grid"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    view === v
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-400 hover:text-gray-600",
                  )}
                >
                  {v === "split" ? (
                    <LayoutGrid size={16} />
                  ) : (
                    <Grid3X3 size={16} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Content ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isSearching ? (
            /* ─── Search results ──────────────────────────────── */
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {(filtered ?? []).length === 0 ? (
                <div className="py-24 text-center">
                  <Package size={56} className="mx-auto text-gray-200 mb-4" />
                  <p className="font-semibold text-gray-600 mb-1">
                    No categories found
                  </p>
                  <p className="text-sm text-gray-400">
                    Try a different search term
                  </p>
                  <button
                    onClick={() => setSearch("")}
                    className="mt-4 btn-primary px-6 py-2.5 text-sm"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(filtered ?? []).map((cat) => (
                    <SearchResultCard key={cat.id} cat={cat} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : view === "split" ? (
            /* ─── Split View (sidebar + content) ──────────────── */
            <motion.div
              key="split"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-6"
            >
              {/* ─── Sidebar ───────────────────────────────────── */}
              <div className="w-[280px] shrink-0 hidden md:block">
                <div className="sticky top-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 space-y-0.5">
                  {categories.map((cat) => (
                    <SidebarItem
                      key={cat.id}
                      cat={cat}
                      isSelected={selectedRootId === cat.id}
                      onClick={() => setSelectedRootId(cat.id)}
                    />
                  ))}
                </div>
              </div>

              {/* ─── Content ───────────────────────────────────── */}
              <div className="flex-1 min-w-0">
                {selectedRoot ? (
                  <>
                    {/* Header with selected category info */}
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-2xl font-bold text-gray-900">
                          {selectedRoot.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {selectedRoot.subcategoryCount} subcategories ·{" "}
                          {selectedRoot.productCount} products total
                        </p>
                      </div>
                      <Link
                        href={`/category/${selectedRoot.slug}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        View All <ChevronRight size={14} />
                      </Link>
                    </div>

                    {/* Subcategories grid */}
                    {subcategories.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {subcategories.map((sub: any, index: number) => (
                          <SubcategoryCard
                            key={sub.id}
                            sub={sub}
                            index={index}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-white/40 backdrop-blur-sm rounded-3xl border border-gray-100/50">
                        <div className="text-5xl mb-4">✨</div>
                        <p className="font-semibold text-gray-600 mb-1">
                          No subcategories
                        </p>
                        <p className="text-sm text-gray-400">
                          This category doesn't have any subcategories yet.
                        </p>
                        <Link
                          href={`/category/${selectedRoot.slug}`}
                          className="mt-4 inline-block btn-primary px-6 py-2 text-sm"
                        >
                          Browse Products
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-20 text-center text-gray-500">
                    Select a category from the sidebar
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ─── Grid View ────────────────────────────────────── */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {categories.map((cat) => (
                <SearchResultCard key={cat.id} cat={cat} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
