"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  productCount?: number;
  subcategoryCount?: number;
};

export function CategoryScroll({ categories }: { categories: Category[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
    watchDrag: true,
    breakpoints: {
      "(min-width: 768px)": { dragFree: true },
    },
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const onScroll = () => {
      const progress = emblaApi.scrollProgress();
      setScrollProgress(progress);
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
    onScroll();

    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="py-12 overflow-visible">
      <div className="container-elite mb-6">
        <SectionHeader
          title="Shop by Category"
          href="/products"
          linkLabel="All Products"
        />
      </div>

      <div className="relative">
        {/* ─── Navigation Buttons ─── */}
        <div className="hidden lg:block">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10",
              "w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm",
              "border border-gray-200/80 shadow-lg",
              "flex items-center justify-center",
              "transition-all duration-200",
              "hover:bg-white hover:shadow-xl hover:border-primary/30",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200",
              "text-gray-700 hover:text-primary",
            )}
            aria-label="Previous categories"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10",
              "w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm",
              "border border-gray-200/80 shadow-lg",
              "flex items-center justify-center",
              "transition-all duration-200",
              "hover:bg-white hover:shadow-xl hover:border-primary/30",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200",
              "text-gray-700 hover:text-primary",
            )}
            aria-label="Next categories"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* ─── Embla Carousel ─── */}
        <div ref={emblaRef} className="overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex gap-5 pl-4 md:pl-[max(1rem,calc((100vw-80rem)/2))] pr-4"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                className="flex-[0_0_auto] w-[140px] sm:w-[160px]"
              >
                <Link href={`/category/${cat.slug}`}>
                  {/* Outer container with clip-path – no animations */}
                  <div
                    className="relative aspect-[4/5] bg-white/60 backdrop-blur-md shadow-lg hover:shadow-xl border border-white/80 hover:border-[#ff3e9b]/30 transition-all duration-300 overflow-hidden will-change-transform"
                    style={{
                      clipPath: "polygon(0% 0%, 100% 8%, 100% 92%, 0% 100%)",
                      transformOrigin: "center center",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    {/* Inner animated element */}
                    <motion.div
                      whileHover={{
                        y: -8,
                        scale: 1.03,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        },
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full h-full"
                    >
                      {/* Full Bleed Image Layer */}
                      <div className="absolute inset-0 pb-14">
                        {cat.icon ? (
                          <Image
                            src={cat.icon}
                            alt={cat.name}
                            fill
                            className="object-contain group-hover:scale-110 transition-transform duration-700"
                            sizes="160px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-[#ffedfa]/70">
                            {cat.icon || "🛍️"}
                          </div>
                        )}
                      </div>

                      {/* Top left Count Badge */}
                      {cat.productCount !== undefined &&
                        cat.productCount > 0 && (
                          <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur-sm text-[9px] font-bold text-primary px-2 py-0.5 rounded-full border border-[#ff88ba]/30 shadow-sm">
                            {cat.productCount} items
                          </div>
                        )}

                      {/* Anchored Footer */}
                      <div className="absolute bottom-0 inset-x-0 bg-primary p-3 flex flex-col justify-center border-t-2 border-primary-light group-hover:bg-primary-dark transition-all duration-300 h-14">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-extrabold text-white drop-shadow-lg tracking-tight line-clamp-1">
                            {cat.name}
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}

            <motion.div
              variants={itemVariants}
              className="flex-[0_0_auto] w-[140px] sm:w-[160px]"
            >
              <Link href="/products">
                {/* ─── Outer container – stable clip-path ─── */}
                <div
                  className="group relative aspect-[4/5] bg-white/60 backdrop-blur-md shadow-lg hover:shadow-xl border border-white/80 hover:border-primary/30 transition-all duration-300 overflow-hidden will-change-transform"
                  style={{
                    clipPath: "polygon(0% 0%, 100% 8%, 100% 92%, 0% 100%)",
                    transformOrigin: "center center",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  {/* ─── Inner animated element ─── */}
                  <motion.div
                    whileHover={{
                      y: -8,
                      scale: 1.03,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full h-full relative"
                  >
                    {/* Full Bleed background – gradient + subtle pattern */}
                    <div className="absolute inset-0 pb-14 bg-gradient-to-br from-primary-light/30 via-primary-pale/50 to-white/40">
                      {/* Subtle icon in background */}
                      <div className="absolute inset-0 flex items-center justify-center text-6xl text-primary/10">
                        ➜
                      </div>
                    </div>

                    {/* Top left Count Badge – showing total items across all categories */}
                    {categories.length > 0 && (
                      <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur-sm text-[9px] font-bold text-primary px-2 py-0.5 rounded-full border border-[#ff88ba]/30 shadow-sm">
                        {categories.reduce(
                          (acc, c) => acc + (c.productCount || 0),
                          0,
                        )}{" "}
                        items
                      </div>
                    )}

                    {/* Anchored Footer – same as category cards */}
                    <div className="absolute bottom-0 inset-x-0 bg-primary p-3 flex flex-col justify-center border-t-2 border-primary-light group-hover:bg-primary-dark transition-all duration-300 h-14">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-extrabold text-white drop-shadow-lg tracking-tight line-clamp-1">
                          View All
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ─── Scroll progress bar ─── */}
        {scrollProgress > 0 && scrollProgress < 1 && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{ width: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
