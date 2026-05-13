"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, LayoutList } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

type ProductSortBarProps = {
  total: number;
  onViewChange?: (view: "grid" | "list") => void;
};

export function ProductSortBar({ total, onViewChange }: ProductSortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");

  const currentSort = searchParams.get("sortBy") ?? "newest";

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleView = (v: "grid" | "list") => {
    setView(v);
    onViewChange?.(v);
  };

  return (
    <div
      className="flex items-center justify-between py-3 px-4 bg-white
                    rounded-2xl border border-gray-100 shadow-card mb-4"
    >
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-900">
          {total.toLocaleString()}
        </span>{" "}
        products found
      </p>

      <div className="flex items-center gap-3">
        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => handleSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2
                     text-gray-700 outline-none focus:border-primary
                     focus:ring-2 focus:ring-primary/20 bg-white
                     cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div
          className="hidden sm:flex items-center gap-1 border border-gray-200
                        rounded-xl p-1"
        >
          <button
            onClick={() => handleView("grid")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              view === "grid"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-gray-700",
            )}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => handleView("list")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              view === "list"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-gray-700",
            )}
          >
            <LayoutList size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
