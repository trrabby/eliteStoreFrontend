"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronDown,
  Clock,
  TrendingUp,
  Star,
  DollarSign,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest", icon: Clock },
  { value: "popular", label: "Popular", icon: TrendingUp },
  { value: "rating", label: "Top Rated", icon: Star },
  { value: "price_asc", label: "Price: Low → High", icon: DollarSign },
  { value: "price_desc", label: "Price: High → Low", icon: DollarSign },
];

type ProductSortBarProps = {
  total: number;
  onViewChange?: (view: "grid" | "list") => void;
};

export function ProductSortBar({ total, onViewChange }: ProductSortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const sortRef = useRef<HTMLDivElement>(null);

  const currentSort = searchParams.get("sortBy") ?? "newest";
  const currentSortOption =
    SORT_OPTIONS.find((opt) => opt.value === currentSort) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setIsSortOpen(false);
  };

  const handleView = (v: "grid" | "list") => {
    setView(v);
    onViewChange?.(v);
  };

  return (
    <>
      {/* Mobile: No background, Desktop: With background */}
      <div
        className={cn(
          "mb-6",
          "lg:bg-white lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm",
        )}
      >
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-4 pt-5 ",
            "lg:p-4",
          )}
        >
          {/* Total Products */}
          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-primary">
              {total.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">products</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl",
                  "bg-gray-50 hover:bg-gray-100 border border-gray-200",
                  "transition-all duration-200 text-sm sm:text-base",
                  isSortOpen && "ring-2 ring-primary/20 border-primary",
                )}
              >
                <div className="flex items-center gap-2">
                  {currentSortOption.icon && (
                    <currentSortOption.icon
                      size={14}
                      className="text-primary hidden sm:block"
                    />
                  )}
                  <span className="font-medium text-gray-700 whitespace-nowrap">
                    <span className="hidden sm:inline">Sort by: </span>
                    {currentSortOption.label}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-gray-400 transition-transform duration-200",
                    isSortOpen && "rotate-180",
                  )}
                />
              </button>

              {/* Sort Dropdown Menu */}
              {isSortOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSort(option.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm",
                        "hover:bg-gray-50 transition-colors",
                        currentSort === option.value &&
                          "bg-primary/5 text-primary",
                      )}
                    >
                      <option.icon
                        size={14}
                        className={
                          currentSort === option.value
                            ? "text-primary"
                            : "text-gray-400"
                        }
                      />
                      <span>{option.label}</span>
                      {currentSort === option.value && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid/List View Toggle - Visible on all devices */}
            {/* <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => handleView("grid")}
                className={cn(
                  "p-1.5 sm:p-2 rounded-lg transition-all",
                  view === "grid"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} className="sm:w-4.5 sm:h-4.5" />
              </button>
              <button
                onClick={() => handleView("list")}
                className={cn(
                  "p-1.5 sm:p-2 rounded-lg transition-all",
                  view === "list"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
                aria-label="List view"
              >
                <LayoutList size={16} className="sm:w-4.5 sm:h-4.5" />
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
