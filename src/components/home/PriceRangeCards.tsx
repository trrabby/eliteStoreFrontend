"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Tag } from "lucide-react";

const PRICE_RANGES = [
  {
    max: 499,
    label: "Under ৳499",
    emoji: "💰",
    color: "from-green-400  to-emerald-500",
    bg: "bg-green-50",
  },
  {
    max: 999,
    label: "Under ৳999",
    emoji: "🛍️",
    color: "from-blue-400   to-cyan-500",
    bg: "bg-blue-50",
  },
  {
    max: 1499,
    label: "Under ৳1499",
    emoji: "✨",
    color: "from-purple-400 to-violet-500",
    bg: "bg-purple-50",
  },
  {
    max: 1999,
    label: "Under ৳1999",
    emoji: "👑",
    color: "from-primary    to-primary-light",
    bg: "bg-primary-pale",
  },
  {
    max: 2999,
    label: "Under ৳2999",
    emoji: "💎",
    color: "from-amber-400  to-orange-500",
    bg: "bg-amber-50",
  },
  {
    max: 999999,
    label: "Premium",
    emoji: "🏆",
    color: "from-rose-400   to-pink-600",
    bg: "bg-rose-50",
  },
];

export function PriceRangeCards() {
  return (
    <section className="container-elite py-10">
      <SectionHeader
        title="Shop by Budget"
        subtitle="Find the perfect product at the right price"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {PRICE_RANGES.map((range, i) => (
          <AnimatedSection key={range.max} delay={i * 0.07}>
            <Link
              href={
                range.max === 999999
                  ? "/products?sortBy=price_desc"
                  : `/products?maxPrice=${range.max}`
              }
            >
              <motion.div
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`${range.bg} rounded-2xl p-4 flex flex-col
                            items-center gap-2.5 text-center cursor-pointer
                            border-2 border-transparent hover:border-primary/30
                            shadow-card group transition-colors`}
              >
                {/* Gradient circle */}
                <div
                  className={`w-12 h-12 rounded-full bg-linear-to-r
                                 ${range.color} flex items-center justify-center
                                 text-xl shadow-md group-hover:scale-110
                                 transition-transform duration-300`}
                >
                  {range.emoji}
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {range.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {range.max === 999999 ? "Luxury picks" : "Great deals"}
                  </p>
                </div>

                <div
                  className="flex items-center gap-1 text-xs text-primary
                                font-medium opacity-0 group-hover:opacity-100
                                transition-opacity"
                >
                  <Tag size={11} />
                  Shop Now
                </div>
              </motion.div>
            </Link>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
