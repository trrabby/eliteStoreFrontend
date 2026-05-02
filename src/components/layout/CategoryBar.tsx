"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
};

type CategoryBarProps = {
  categories: Category[];
};

export function CategoryBar({ categories }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  if (!categories?.length) return null;

  return (
    <div className="bg-white border-b border-gray-100 sticky top-24 z-40">
      <div className="container-elite">
        <div className="relative flex items-center">
          {/* Left scroll button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 z-10 w-8 h-8 rounded-full
                       bg-white shadow-md border border-gray-100
                       items-center justify-center
                       hover:border-primary hover:text-primary
                       transition-all text-gray-400 hidden md:flex"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Scrollable categories */}
          <div
            ref={scrollRef}
            className="flex items-center gap-1 overflow-x-auto scrollbar-hide
                       py-3 px-1 md:px-10 scroll-smooth"
          >
            {/* All products link */}
            <Link
              href="/products"
              className="shrink-0 px-4 py-1.5 rounded-full
                         text-sm font-medium text-gray-600
                         hover:bg-primary hover:text-white
                         border border-gray-200 hover:border-primary
                         transition-all duration-200 whitespace-nowrap"
            >
              All Products
            </Link>

            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className="shrink-0 flex items-center gap-1.5
                             px-4 py-1.5 rounded-full text-sm font-medium
                             text-gray-600 hover:bg-primary hover:text-white
                             border border-gray-200 hover:border-primary
                             transition-all duration-200 whitespace-nowrap"
                >
                  {cat.icon && <span className="text-base">{cat.icon}</span>}
                  {cat.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right scroll button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 z-10 w-8 h-8 rounded-full
                       bg-white shadow-md border border-gray-100
                       items-center justify-center
                       hover:border-primary hover:text-primary
                       transition-all text-gray-400 hidden md:flex"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
