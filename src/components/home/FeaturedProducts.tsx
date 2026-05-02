"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard, ProductCardData } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { id: "featured", label: "Featured" },
  { id: "new", label: "New Arrivals" },
  { id: "popular", label: "Best Sellers" },
  { id: "sale", label: "On Sale" },
];

type FeaturedProductsProps = {
  featured: ProductCardData[];
  newest: ProductCardData[];
  popular: ProductCardData[];
  sale: ProductCardData[];
};

export function FeaturedProducts({
  featured,
  newest,
  popular,
  sale,
}: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState("featured");
  console.log(featured);
  const tabMap: Record<string, ProductCardData[]> = {
    featured,
    new: newest,
    popular,
    sale,
  };

  const products = tabMap[activeTab] ?? [];

  return (
    <section className="container-elite py-10">
      <SectionHeader
        title="Our Products"
        subtitle="Curated picks just for you"
        href="/products"
      />

      {/* Tabs */}
      <div
        className="flex items-center gap-2 mb-6 overflow-x-auto
                      scrollbar-hide pb-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative shrink-0 px-5 py-2 rounded-xl text-sm",
              "font-medium transition-all duration-200",
              activeTab === tab.id
                ? "text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-gradient-primary rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Product grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                     xl:grid-cols-5 gap-3 md:gap-4"
        >
          {products.length > 0
            ? products
                .slice(0, 10)
                .map((product, i) => (
                  <ProductCard
                    key={product.publicId}
                    product={product}
                    index={i}
                  />
                ))
            : Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
