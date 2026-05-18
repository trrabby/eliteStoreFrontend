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
  onClose?: () => void;
};

const RATINGS = [4, 3, 2, 1];

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
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-900"
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductFilters({
  categories,
  brands,
  onClose,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ─────────────────────────────
  // INIT FROM URL (correct parsing)
  // ─────────────────────────────
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    searchParams.getAll("categoryIds").map(Number),
  );

  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>(
    searchParams.getAll("brandIds").map(Number),
  );

  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice") ?? 0),
    Number(searchParams.get("maxPrice") ?? 10000),
  ]);

  const [minRating, setMinRating] = useState(
    searchParams.get("minRating") ?? "",
  );

  // ─────────────────────────────
  // TOGGLES
  // ─────────────────────────────
  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleBrand = (id: number) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  };

  // ─────────────────────────────
  // APPLY FILTERS
  // ─────────────────────────────
  const applyFilters = () => {
    const params = new URLSearchParams();

    // ─────────────────────
    // CATEGORY IDS (comma)
    // ─────────────────────
    if (selectedCategoryIds.length > 0) {
      params.set("categoryIds", selectedCategoryIds.join(","));
    }

    // ─────────────────────
    // BRAND IDS (comma)
    // ─────────────────────
    if (selectedBrandIds.length > 0) {
      params.set("brandIds", selectedBrandIds.join(","));
    }

    // ─────────────────────
    // PRICE
    // ─────────────────────
    if (priceRange[0] > 0) {
      params.set("minPrice", String(priceRange[0]));
    }

    if (priceRange[1] < 10000) {
      params.set("maxPrice", String(priceRange[1]));
    }

    // ─────────────────────
    // RATING
    // ─────────────────────
    if (minRating) {
      params.set("minRating", minRating);
    }

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
    onClose?.();
  };

  // ─────────────────────────────
  // RESET
  // ─────────────────────────────
  const resetFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedBrandIds([]);
    setPriceRange([0, 10000]);
    setMinRating("");

    router.push(pathname);
    onClose?.();
  };

  const hasActiveFilters =
    selectedCategoryIds.length > 0 ||
    selectedBrandIds.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000 ||
    minRating;

  return (
    <div className="w-full">
      {/* HEADER */}
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
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* CATEGORY (MULTI) */}
      <FilterSection title="Category">
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="accent-primary"
              />
              <span className="text-sm">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* BRAND (MULTI) */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedBrandIds.includes(brand.id)}
                  onChange={() => toggleBrand(brand.id)}
                  className="accent-primary"
                />
                <span className="text-sm">{brand.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* PRICE */}
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

      {/* RATING */}
      <FilterSection title="Minimum Rating">
        <div className="space-y-2">
          {RATINGS.map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={minRating === String(r)}
                onChange={() =>
                  setMinRating(minRating === String(r) ? "" : String(r))
                }
                className="accent-primary"
              />
              <span>{r}+ stars</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* APPLY */}
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
