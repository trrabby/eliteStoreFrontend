/* eslint-disable react-hooks/refs */
"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { cn } from "@/lib/utils/cn";

const HERO_SLIDES = [
  {
    id: 1,
    title: "Feel the Elegance",
    subtitle: "Discover premium fashion curated for you",
    ctaLabel: "Shop Now",
    ctaHref: "/products",
    badge: "New Collection",
    image: "/hero/hero-1.jpg", // replace with real images
    gradient: "from-[#FF3E9B]/90 via-[#FF88BA]/60 to-transparent",
    accent: "#FF3E9B",
  },
  {
    id: 2,
    title: "Summer Glow",
    subtitle: "Up to 50% off on selected items",
    ctaLabel: "Explore Sale",
    ctaHref: "/products?sortBy=popular",
    badge: "Sale Up To 50%",
    image: "/hero/hero-2.jpg",
    gradient: "from-[#9B59B6]/80 via-[#FF88BA]/50 to-transparent",
    accent: "#9B59B6",
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "Fresh styles added daily — be the first",
    ctaLabel: "See What's New",
    ctaHref: "/products?sortBy=newest",
    badge: "Just Dropped",
    image: "/hero/hero-3.jpg",
    gradient: "from-[#E91E8C]/80 via-[#FF3E9B]/50 to-transparent",
    accent: "#E91E8C",
  },
];

export function HeroBanner() {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [
    autoplay.current,
  ]);
  const [selected, setSelected] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // parallax on scroll
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-none
                 lg:rounded-none h-[520px] md:h-[600px] lg:h-[680px]"
    >
      {/* Carousel */}
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full touch-pan-y">
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              className="relative flex-[0_0_100%] h-full overflow-hidden"
            >
              {/* Parallax image */}
              <motion.div
                style={{ y: selected === i ? y : 0 }}
                className="absolute inset-0 scale-110"
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </motion.div>

              {/* Gradient overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-linear-to-r",
                  slide.gradient,
                )}
              />

              {/* Floating decorative circles */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-20 right-[15%] w-32 h-32 rounded-full
                           bg-white/10 blur-xl hidden lg:block"
              />
              <motion.div
                animate={{
                  y: [0, 20, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-20 right-[30%] w-20 h-20 rounded-full
                           bg-white/10 blur-lg hidden lg:block"
              />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container-elite">
                  <motion.div
                    key={`slide-${slide.id}-${selected}`}
                    initial={{ opacity: 0, x: -60 }}
                    animate={
                      selected === i
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: 60 }
                    }
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-xl"
                  >
                    {/* Badge */}
                    <motion.span
                      initial={{ opacity: 0, y: -20 }}
                      animate={
                        selected === i ? { opacity: 1, y: 0 } : { opacity: 0 }
                      }
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="inline-block bg-white/20 backdrop-blur-sm
                                 text-white text-xs font-semibold px-3 py-1.5
                                 rounded-full border border-white/30 mb-4"
                    >
                      ✨ {slide.badge}
                    </motion.span>

                    {/* Title */}
                    <h1
                      className="font-display text-4xl md:text-5xl lg:text-6xl
                                   font-bold text-white leading-tight mb-4
                                   drop-shadow-lg"
                    >
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p
                      className="text-white/90 text-lg mb-8 font-light
                                  drop-shadow"
                    >
                      {slide.subtitle}
                    </p>

                    {/* CTA */}
                    <MagneticButton
                      strength={0.4}
                      className="btn-primary px-8 py-4 text-base shadow-pink-lg"
                      onClick={() => (window.location.href = slide.ctaHref)}
                    >
                      {slide.ctaLabel}
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="ml-2 inline-block"
                      >
                        →
                      </motion.span>
                    </MagneticButton>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm
                   border border-white/30 flex items-center justify-center
                   text-white hover:bg-white/40 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm
                   border border-white/30 flex items-center justify-center
                   text-white hover:bg-white/40 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20
                      flex items-center gap-2"
      >
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="transition-all duration-300"
            aria-label={`Go to slide ${i + 1}`}
          >
            <motion.div
              animate={{
                width: selected === i ? 28 : 8,
                opacity: selected === i ? 1 : 0.5,
              }}
              className="h-2 rounded-full bg-white"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
