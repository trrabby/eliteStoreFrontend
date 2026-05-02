/* eslint-disable react-hooks/refs */
"use client";

import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, ProductCardData } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/shared/SectionHeader";

export function NewArrivals({ products }: { products: ProductCardData[] }) {
  const autoScroll = useRef(
    AutoScroll({ speed: 1.5, stopOnInteraction: true, stopOnMouseEnter: true }),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    [autoScroll.current],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!products?.length) return null;

  return (
    <section className="py-10 overflow-hidden">
      <div className="container-elite">
        <div className="flex items-end justify-between mb-6">
          <SectionHeader title="New Arrivals" />
          <div className="flex gap-2 mb-1">
            <button
              onClick={scrollPrev}
              className="w-9 h-9 rounded-full border-2 border-gray-200
                         flex items-center justify-center text-gray-600
                         hover:border-primary hover:text-primary
                         transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={scrollNext}
              className="w-9 h-9 rounded-full border-2 border-gray-200
                         flex items-center justify-center text-gray-600
                         hover:border-primary hover:text-primary
                         transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <div
          className="flex gap-3 pl-4
                        md:pl-[max(1rem,calc((100vw-80rem)/2))] pr-4"
        >
          {products.map((product, i) => (
            <div
              key={product.publicId}
              className="flex-[0_0_200px] sm:flex-[0_0_220px]
                         md:flex-[0_0_240px]"
            >
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
