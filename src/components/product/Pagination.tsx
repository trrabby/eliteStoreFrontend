"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type PaginationProps = {
  total: number;
  limit: number;
  page: number;
};

export function Pagination({ total, limit, page }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // generate page numbers with ellipsis
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-xl border border-gray-200
                   flex items-center justify-center text-gray-600
                   hover:border-primary hover:text-primary
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all"
      >
        <ChevronLeft size={16} />
      </button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="text-gray-400 px-1">
            …
          </span>
        ) : (
          <motion.button
            key={p}
            whileTap={{ scale: 0.9 }}
            onClick={() => goTo(p as number)}
            className={cn(
              "w-9 h-9 rounded-xl text-sm font-medium transition-all",
              p === page
                ? "bg-gradient-primary text-white shadow-pink"
                : "border border-gray-200 text-gray-600 hover:border-primary hover:text-primary",
            )}
          >
            {p}
          </motion.button>
        ),
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-xl border border-gray-200
                   flex items-center justify-center text-gray-600
                   hover:border-primary hover:text-primary
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
