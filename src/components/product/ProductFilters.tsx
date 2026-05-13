"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { RangeSlider } from "../shared/RangeSlider";

type FilterCategory = {
  id: number;
  name: string;
  slug: string;
};

type FilterBrand = {
  id: number;
  name: string;
  slug: string;
};

type ProductFiltersProps = {
  categories: FilterCategory[];
  brands: FilterBrand[];
  onClose?: () => void; // mobile drawer close
};

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm
                   font-semibold text-gray-900 mb-0"
      >
        {title}
        <ChevronDown
          size={16}
          className={cn(
            "text-gray-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RATINGS = [4, 3, 2, 1];

export function ProductFilters({
  categories,
  brands,
  onClose,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // local state mirrors URL params
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("categoryId") ?? "",
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brands")?.split(",").filter(Boolean) ?? [],
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice") ?? 0),
    Number(searchParams.get("maxPrice") ?? 10000),
  ]);
  const [minRating, setMinRating] = useState(
    searchParams.get("minRating") ?? "",
  );

  // apply filters to URL
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory) params.set("categoryId", selectedCategory);
    else params.delete("categoryId");

    if (selectedBrands.length) params.set("brands", selectedBrands.join(","));
    else params.delete("brands");

    if (priceRange[0] > 0) params.set("minPrice", String(priceRange[0]));
    else params.delete("minPrice");

    if (priceRange[1] < 10000) params.set("maxPrice", String(priceRange[1]));
    else params.delete("maxPrice");

    if (minRating) params.set("minRating", minRating);
    else params.delete("minRating");

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    onClose?.();
  };

  // reset all filters
  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedBrands([]);
    setPriceRange([0, 10000]);
    setMinRating("");
    router.push(pathname);
    onClose?.();
  };

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedBrands.length ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000 ||
    minRating;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary" />
          <span className="font-semibold text-gray-900 text-sm">Filters</span>
          {hasActiveFilters && (
            <span className="badge-primary text-xs">Active</span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-red-500 hover:underline flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="category"
              value=""
              checked={!selectedCategory}
              onChange={() => setSelectedCategory("")}
              className="accent-primary"
            />
            <span
              className="text-sm text-gray-700 group-hover:text-primary
                             transition-colors"
            >
              All Categories
            </span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                value={String(cat.id)}
                checked={selectedCategory === String(cat.id)}
                onChange={() => setSelectedCategory(String(cat.id))}
                className="accent-primary"
              />
              <span
                className="text-sm text-gray-700 group-hover:text-primary
                               transition-colors"
              >
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brand */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(String(brand.id))}
                  onChange={() => toggleBrand(String(brand.id))}
                  className="accent-primary rounded"
                />
                <span
                  className="text-sm text-gray-700 group-hover:text-primary
                                 transition-colors"
                >
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price range */}
      <FilterSection title="Price Range">
        <RangeSlider
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onChange={setPriceRange}
          prefix="৳"
        />
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating">
        <div className="space-y-2">
          {RATINGS.map((r) => (
            <label
              key={r}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="rating"
                value={String(r)}
                checked={minRating === String(r)}
                onChange={() =>
                  setMinRating(minRating === String(r) ? "" : String(r))
                }
                className="accent-primary"
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-sm",
                      i < r ? "text-amber-400" : "text-gray-200",
                    )}
                  >
                    ★
                  </span>
                ))}
                <span className="text-xs text-gray-500 ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Apply button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={applyFilters}
        className="w-full btn-primary py-3 mt-4"
      >
        Apply Filters
      </motion.button>
    </div>
  );
}
