"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ArrowRight } from "lucide-react";

const PROMOS = [
  {
    id: 1,
    title: "Women's Collection",
    subtitle: "Discover the latest trends",
    cta: "Shop Women",
    href: "/products?category=women",
    image: "/promo/women.jpg",
    gradient: "from-pink-900/70 to-pink-500/30",
    badge: "New In",
  },
  {
    id: 2,
    title: "Men's Essentials",
    subtitle: "Smart styles for every occasion",
    cta: "Shop Men",
    href: "/products?category=men",
    image: "/promo/men.jpg",
    gradient: "from-gray-900/70 to-gray-600/30",
    badge: "Best Sellers",
  },
];

export function PromoBanners() {
  return (
    <section className="container-elite py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROMOS.map((promo, i) => (
          <AnimatedSection
            key={promo.id}
            delay={i * 0.15}
            direction={i === 0 ? "left" : "right"}
          >
            <Link href={promo.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative overflow-hidden rounded-2xl
                           h-[220px] md:h-[280px] group cursor-pointer
                           shadow-card"
              >
                {/* Background image */}
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover transition-transform duration-700
                             group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-linear-to-r
                              ${promo.gradient}`}
                />

                {/* Content */}
                <div
                  className="absolute inset-0 flex flex-col
                                justify-end p-6"
                >
                  <span
                    className="inline-block bg-white/20 backdrop-blur-sm
                                   text-white text-xs font-semibold px-2.5 py-1
                                   rounded-full border border-white/30 mb-3
                                   w-fit"
                  >
                    {promo.badge}
                  </span>
                  <h3
                    className="font-display text-2xl font-bold text-white
                                 mb-1"
                  >
                    {promo.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-4">{promo.subtitle}</p>
                  <div
                    className="flex items-center gap-2 text-white
                                  font-semibold text-sm group-hover:gap-3
                                  transition-all duration-200"
                  >
                    {promo.cta}
                    <ArrowRight size={16} />
                  </div>
                </div>
              </motion.div>
            </Link>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
