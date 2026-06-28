/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
  Award,
  ChevronRight,
  Globe,
  MapPin,
  Package,
  Star,
} from "lucide-react";

/* ── Brand Card ─────────────────────────────────────────────────── */
function BrandCard({ brand }: { brand: any }) {
  const productCount = brand._count?.products ?? 0;

  return (
    <Link
      href={`/brand/${brand.slug}`}
      className="group relative overflow-hidden rounded-2xl border-2 border-transparent
                 bg-white hover:border-primary/30 hover:shadow-xl
                 transition-all duration-300 flex flex-col"
    >
      {/* Banner / bg */}
      <div className="relative h-24 overflow-hidden">
        {brand.banner ? (
          <>
            <Image
              src={brand.banner}
              alt={`${brand.name} banner`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width:640px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/5" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #FF3E9B22 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>
        )}

        {/* Featured badge */}
        {brand.isFeatured && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1
                          bg-amber-400 text-amber-900 text-[9px] font-bold
                          px-2 py-0.5 rounded-full shadow-sm"
          >
            <Star size={8} className="fill-amber-900" />
            Featured
          </div>
        )}

        {/* Logo */}
        <div className="absolute -bottom-5 left-4">
          {brand.logo ? (
            <div
              className="relative w-12 h-12 rounded-xl overflow-hidden
                            border-4 border-white shadow-md bg-white"
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain p-0.5"
                sizes="48px"
              />
            </div>
          ) : (
            <div
              className="w-12 h-12 rounded-xl bg-white border-4 border-white
                            shadow-md flex items-center justify-center"
            >
              <Award size={22} className="text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-8 pb-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className="text-sm font-bold text-gray-900 truncate
                          group-hover:text-primary transition-colors"
            >
              {brand.name}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {brand.country && (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  <MapPin size={9} />
                  {brand.country}
                </span>
              )}
              {productCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  <Package size={9} />
                  {productCount.toLocaleString()} products
                </span>
              )}
            </div>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl
                          bg-gray-100 group-hover:bg-primary/10 transition-colors shrink-0"
          >
            <ChevronRight
              size={13}
              className="text-gray-400 group-hover:text-primary transition-colors"
            />
          </div>
        </div>

        {brand.website && (
          <div
            onClick={(e) => {
              e.preventDefault();
              window.open(brand.website, "_blank");
            }}
            className="mt-2.5 flex items-center gap-1 text-[10px] text-primary/70
                       hover:text-primary transition-colors cursor-pointer"
          >
            <Globe size={9} />
            <span className="truncate">
              {brand.website.replace(/^https?:\/\//, "")}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ── Main client ────────────────────────────────────────────────── */
export function BrandsPageClient({ brands }: { brands: any[] }) {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");

  /* ── Unique countries for filter ── */
  const countries = useMemo(() => {
    const set = new Set<string>();
    brands.forEach((b) => {
      if (b.country) set.add(b.country);
    });
    return Array.from(set).sort();
  }, [brands]);

  /* ── Featured brands ── */
  const featured = useMemo(() => brands.filter((b) => b.isFeatured), [brands]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let list = brands;
    if (country) list = list.filter((b) => b.country === country);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.country?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [brands, search, country]);

  const totalProducts = useMemo(
    () => brands.reduce((s, b) => s + (b._count?.products ?? 0), 0),
    [brands],
  );

  const isFiltering = search.trim() || country;

  return (
    <div className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-16 sm:py-20
                      bg-linear-to-br from-gray-900 via-gray-800 to-gray-900"
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-1/3  w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />

        <div className="relative container-elite text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30
                       text-primary text-xs font-semibold px-4 py-2 rounded-full mb-5"
          >
            <Award size={13} />
            Official Brand Store
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-3xl sm:text-5xl font-bold text-white mb-3"
          >
            Top Brands
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-base sm:text-lg mb-8 max-w-lg mx-auto"
          >
            Shop authentic products from Bangladesh&apos;s favourite brands
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-8 mb-10"
          >
            {[
              { label: "Brand", value: brands.length.toLocaleString() },
              { label: "Products", value: totalProducts.toLocaleString() },
              { label: "Countries", value: countries.length.toString() },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Search + country filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/10 border border-white/20
                           text-white placeholder:text-gray-500 text-sm outline-none
                           focus:bg-white/15 focus:border-primary/50 transition-all backdrop-blur-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {countries.length > 0 && (
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-2xl bg-white/10 border border-white/20 text-sm
                           text-gray-300 px-4 py-3.5 outline-none cursor-pointer
                           focus:border-primary/50 backdrop-blur-sm"
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container-elite py-8">
        {/* ── Active filter chips ──────────────────────────────── */}
        <AnimatePresence>
          {isFiltering && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap items-center gap-2 mb-5"
            >
              <span className="text-sm text-gray-500 mr-1">Filters:</span>
              {search && (
                <span className="chip">
                  &quot;{search}&quot;
                  <button onClick={() => setSearch("")}>
                    <X size={10} />
                  </button>
                </span>
              )}
              {country && (
                <span className="chip">
                  <MapPin size={10} />
                  {country}
                  <button onClick={() => setCountry("")}>
                    <X size={10} />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearch("");
                  setCountry("");
                }}
                className="text-xs text-red-400 hover:text-red-600 ml-1"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Featured brands ──────────────────────────────────── */}
        {!isFiltering && featured.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Featured Brands
                </h2>
                <Star size={14} className="text-amber-500 fill-amber-500" />
              </div>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {featured.map((brand, i) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BrandCard brand={brand} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── All brands ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {isFiltering
                ? `${filtered.length} brand${
                    filtered.length !== 1 ? "s" : ""
                  } found`
                : `All ${brands.length} brands`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center"
              >
                <Award size={56} className="mx-auto text-gray-200 mb-4" />
                <p className="font-semibold text-gray-600 mb-1">
                  No brands found
                </p>
                <p className="text-sm text-gray-400">Try different filters</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCountry("");
                  }}
                  className="mt-4 btn-primary px-6 py-2.5 text-sm"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              >
                {filtered.map((brand, i) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <BrandCard brand={brand} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
