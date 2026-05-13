"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ActiveFilterChipsProps = {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
};

export function ActiveFilterChips({
  categories,
  brands,
}: ActiveFilterChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const removeParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "brands" && value) {
      const current = params.get("brands")?.split(",") ?? [];
      const updated = current.filter((b) => b !== value);
      if (updated.length) params.set("brands", updated.join(","));
      else params.delete("brands");
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const chips: { label: string; onRemove: () => void }[] = [];

  const categoryId = searchParams.get("categoryId");
  if (categoryId) {
    const cat = categories.find((c) => String(c.id) === categoryId);
    if (cat) {
      chips.push({
        label: `Category: ${cat.name}`,
        onRemove: () => removeParam("categoryId"),
      });
    }
  }

  const brandsParam = searchParams.get("brands");
  if (brandsParam) {
    brandsParam.split(",").forEach((id) => {
      const brand = brands.find((b) => String(b.id) === id);
      if (brand) {
        chips.push({
          label: `Brand: ${brand.name}`,
          onRemove: () => removeParam("brands", id),
        });
      }
    });
  }

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  if (minPrice || maxPrice) {
    chips.push({
      label: `Price: ৳${minPrice ?? 0} – ৳${maxPrice ?? "∞"}`,
      onRemove: () => {
        removeParam("minPrice");
        removeParam("maxPrice");
      },
    });
  }

  const minRating = searchParams.get("minRating");
  if (minRating) {
    chips.push({
      label: `${minRating}★ & above`,
      onRemove: () => removeParam("minRating"),
    });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <AnimatePresence>
        {chips.map((chip) => (
          <motion.div
            key={chip.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 bg-primary-pale text-primary
                       text-xs font-medium px-3 py-1.5 rounded-full border
                       border-primary/20"
          >
            {chip.label}
            <button
              onClick={chip.onRemove}
              className="hover:bg-primary hover:text-white rounded-full
                         p-0.5 transition-all"
            >
              <X size={10} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
