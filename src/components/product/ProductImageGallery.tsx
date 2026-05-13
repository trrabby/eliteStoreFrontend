"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ProductImage = {
  url: string;
  altText: string | null;
};

export function ProductImageGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  const [thumbRef, thumbApi] = useEmblaCarousel({
    axis: "y",
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  if (!images?.length) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex gap-3">
      {/* Thumbnails — vertical, desktop */}
      {images.length > 1 && (
        <div
          ref={thumbRef}
          className="hidden md:block overflow-hidden w-[72px] flex-shrink-0"
          style={{ maxHeight: 520 }}
        >
          <div className="flex flex-col gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cn(
                  "relative w-18 h-18 rounded-xl overflow-hidden",
                  "border-2 transition-all duration-200 shrink-0",
                  selected === i
                    ? "border-primary shadow-pink"
                    : "border-transparent hover:border-gray-300",
                )}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? `${productName} ${i + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 min-w-0">
        {/* Main image container */}
        <div
          ref={imgRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          className="relative aspect-square rounded-2xl overflow-hidden
                     bg-primary-pale cursor-zoom-in"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={images[selected].url}
                alt={images[selected].altText ?? productName}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={cn(
                  "object-cover transition-transform duration-200",
                  zoomed && "scale-150",
                )}
                style={
                  zoomed
                    ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }
                    : undefined
                }
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom hint */}
          {!zoomed && (
            <div
              className="absolute bottom-3 right-3 bg-white/80
                            backdrop-blur-sm rounded-lg px-2 py-1
                            flex items-center gap-1 text-xs text-gray-600"
            >
              <ZoomIn size={12} />
              Hover to zoom
            </div>
          )}

          {/* Navigation arrows — mobile */}
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelected((s) => (s > 0 ? s - 1 : images.length - 1))
                }
                className="md:hidden absolute left-2 top-1/2 -translate-y-1/2
                           w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm
                           flex items-center justify-center shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setSelected((s) => (s < images.length - 1 ? s + 1 : 0))
                }
                className="md:hidden absolute right-2 top-1/2 -translate-y-1/2
                           w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm
                           flex items-center justify-center shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Dot indicators — mobile */}
          {images.length > 1 && (
            <div
              className="md:hidden absolute bottom-3 left-1/2
                            -translate-x-1/2 flex gap-1.5"
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    selected === i ? "w-5 bg-primary" : "w-1.5 bg-white/70",
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile thumbnail row */}
        {images.length > 1 && (
          <div
            className="md:hidden flex gap-2 mt-3 overflow-x-auto
                          scrollbar-hide pb-1"
          >
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cn(
                  "relative w-16 h-16 rounded-xl overflow-hidden shrink-0",
                  "border-2 transition-all",
                  selected === i
                    ? "border-primary"
                    : "border-transparent opacity-70",
                )}
              >
                <Image
                  src={img.url}
                  alt={`${productName} ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
