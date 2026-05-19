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

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const chips: { label: string; onRemove: () => void }[] = [];

  // categoryIds — comma-separated
  const categoryIdsParam = searchParams.get("categoryIds");
  if (categoryIdsParam) {
    categoryIdsParam
      .split(",")
      .filter(Boolean)
      .forEach((id) => {
        const cat = categories.find((c) => String(c.id) === id);
        if (cat) {
          chips.push({
            label: `Category: ${cat.name}`,
            onRemove: () => {
              const params = new URLSearchParams(searchParams.toString());
              const ids =
                params.get("categoryIds")?.split(",").filter(Boolean) ?? [];
              const next = ids.filter((x) => x !== id);
              if (next.length) params.set("categoryIds", next.join(","));
              else params.delete("categoryIds");
              params.set("page", "1");
              router.push(`${pathname}?${params.toString()}`);
            },
          });
        }
      });
  }

  // brandIds — comma-separated
  const brandIdsParam = searchParams.get("brandIds");
  if (brandIdsParam) {
    brandIdsParam
      .split(",")
      .filter(Boolean)
      .forEach((id) => {
        const brand = brands.find((b) => String(b.id) === id);
        if (brand) {
          chips.push({
            label: `Brand: ${brand.name}`,
            onRemove: () => {
              const params = new URLSearchParams(searchParams.toString());
              const ids =
                params.get("brandIds")?.split(",").filter(Boolean) ?? [];
              const next = ids.filter((x) => x !== id);
              if (next.length) params.set("brandIds", next.join(","));
              else params.delete("brandIds");
              params.set("page", "1");
              router.push(`${pathname}?${params.toString()}`);
            },
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
        const params = new URLSearchParams(searchParams.toString());
        params.delete("minPrice");
        params.delete("maxPrice");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
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
                       text-xs font-medium px-3 py-1.5 rounded-full border border-primary/20"
          >
            {chip.label}
            <button
              onClick={chip.onRemove}
              className="hover:bg-primary hover:text-white rounded-full p-0.5 transition-all"
            >
              <X size={10} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
