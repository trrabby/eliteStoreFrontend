"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  depth: number;
  productCount: number;
  children?: CategoryNode[];
};

type CategoryBarProps = {
  categories: CategoryNode[];
};

export function CategoryBar({ categories }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Track which root category is hovered to display its panel globally
  const [activeRoot, setActiveRoot] = useState<CategoryNode | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  if (!categories?.length) return null;

  return (
    <div
      className="bg-white border-b border-gray-100 sticky top-24 z-20"
      onMouseLeave={() => setActiveRoot(null)}
    >
      <div className="container-elite">
        <div className="relative flex items-center">
          {/* Left scroll button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 z-30 w-8 h-8 rounded-full
                       bg-white shadow-md border border-gray-100
                       items-center justify-center
                       hover:border-primary hover:text-primary
                       transition-all text-gray-400 hidden md:flex"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Scrollable Root Capsule List */}
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide
                       py-3 px-1 md:px-10 scroll-smooth w-full"
          >
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

            {categories.map((cat, i) => {
              const hasChildren = cat.children && cat.children.length > 0;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.01 }}
                  className="shrink-0"
                  onMouseEnter={() => {
                    if (hasChildren) setActiveRoot(cat);
                    else setActiveRoot(null);
                  }}
                >
                  <Link
                    href={`/category/${cat.slug}`}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap
                      ${
                        activeRoot?.id === cat.id
                          ? "bg-primary text-white border-primary"
                          : "text-gray-600 border-gray-200 hover:bg-primary hover:text-white hover:border-primary"
                      }`}
                  >
                    {cat.icon && (
                      <Image
                        src={cat.icon}
                        alt={cat.name}
                        height={20}
                        width={20}
                      ></Image>
                    )}
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70 font-normal">
                      ({cat.productCount})
                    </span>
                    {hasChildren && (
                      <ChevronDown
                        size={14}
                        className={`opacity-60 transition-transform duration-200 ${
                          activeRoot?.id === cat.id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right scroll button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 z-30 w-8 h-8 rounded-full
                       bg-white shadow-md border border-gray-100
                       items-center justify-center
                       hover:border-primary hover:text-primary
                       transition-all text-gray-400 hidden md:flex"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Global Level 1 Dropdown Drawer Panel */}
      <AnimatePresence>
        {activeRoot && activeRoot.children && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl z-40"
          >
            <div className="container-elite py-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-h-105 overflow-y-auto custom-scrollbar">
              {activeRoot.children.map((subCat) => (
                <div key={subCat.id} className="flex flex-col gap-2">
                  {/* Sub category header item */}
                  <Link
                    href={`/category/${subCat.slug}`}
                    className="font-semibold text-gray-900 hover:text-primary text-sm flex items-center gap-1 group/sub border-b border-gray-50 pb-1"
                  >
                    <span>{subCat.name}</span>
                    <span className="text-[11px] text-gray-400 font-normal group-hover/sub:text-primary">
                      ({subCat.productCount})
                    </span>
                  </Link>

                  {/* Deeply Nested Items Container (Sub-Sub, Sub-Sub-Sub) — Renders vertically */}
                  {subCat.children && subCat.children.length > 0 && (
                    <div className="flex flex-col gap-1.5 pl-1">
                      {subCat.children.map((deepCat) => (
                        <RecursiveLinks key={deepCat.id} node={deepCat} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Recursive Vertical Link Tree Renderer ──────────────────────
function RecursiveLinks({ node }: { node: CategoryNode }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <Link
        href={`/category/${node.slug}`}
        className="text-xs text-gray-500 hover:text-primary-dark font-medium flex items-center gap-1 transition-colors"
      >
        <span>• {node.name}</span>
        <span className="text-[10px] text-gray-400 font-normal">
          ({node.productCount})
        </span>
      </Link>

      {hasChildren && (
        <div className="flex flex-col gap-1 pl-3 border-l border-gray-100 ml-1.5 mt-0.5">
          {node.children!.map((child) => (
            <RecursiveLinks key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
