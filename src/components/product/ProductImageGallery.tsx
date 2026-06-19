"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState, useRef } from "react";

interface ProductImage {
  id: number;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
  variantId?: number | null;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ProductImageGallery({
  images,
  productName,
  selectedIndex,
  onSelect,
}: ProductImageGalleryProps) {
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[selectedIndex] : null;

  const mainImageRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOrigin, setPanOrigin] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasImages) {
      onSelect((selectedIndex + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasImages) {
      onSelect((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentImage || !mainImageRef.current || zoomLevel === 1) return;

    const { left, top, width, height } =
      mainImageRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;

    setPanOrigin({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setZoomLevel(1);
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* Main Feature Display View */}
      <div
        ref={mainImageRef}
        className={cn(
          "group relative aspect-[4/3] bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md",
          zoomLevel > 1 ? "cursor-move" : "cursor-zoom-in",
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {currentImage ? (
          <div
            className="relative w-full h-full transition-transform duration-75 ease-out"
            style={{
              transformOrigin: `${panOrigin.x}% ${panOrigin.y}%`,
              transform: `scale(${zoomLevel})`,
            }}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.altText || productName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 45vw"
              priority
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 bg-slate-50">
            <ImageOff size={44} strokeWidth={1.25} />
            <p className="text-xs font-medium mt-2.5 tracking-wide uppercase">
              No image available
            </p>
          </div>
        )}

        {/* Floating Navigation Controls */}
        {hasImages && images.length > 1 && zoomLevel === 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <button
              onClick={prevImage}
              className="pointer-events-auto p-2.5 rounded-full bg-white/90 text-slate-700 hover:text-black hover:bg-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={nextImage}
              className="pointer-events-auto p-2.5 rounded-full bg-white/90 text-slate-700 hover:text-black hover:bg-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              aria-label="Next image"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Floating Zoom Controller — Top Right */}
        {currentImage && isHovered && (
          <div
            className="absolute top-4 right-4 flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-100 z-20 pointer-events-auto transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <ZoomIn size={15} className="text-slate-500" />
            <input
              type="range"
              min="1"
              max="2.0"
              step="0.05"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black focus:outline-none"
            />
            <span className="text-[11px] font-bold text-slate-700 w-8 text-right tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        )}

        {/* Image Counter — Bottom Left */}
        {hasImages && images.length > 1 && zoomLevel === 1 && (
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider px-2.5 py-1 rounded-full z-10">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasImages && images.length > 1 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none snap-x snap-mandatory">
            {images.map((img, index) => {
              const isActive = selectedIndex === index;
              return (
                <button
                  key={img.id || index}
                  onClick={() => onSelect(index)}
                  className={cn(
                    "relative aspect-square w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-start active:scale-95",
                    isActive
                      ? "border-black shadow-md ring-4 ring-black/5 scale-[0.98]"
                      : "border-slate-100 opacity-70 hover:opacity-100 hover:border-slate-300",
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `${productName} preview ${index + 1}`}
                    fill
                    className={cn(
                      "object-cover transition duration-300",
                      isActive ? "scale-100" : "hover:scale-105",
                    )}
                    sizes="80px"
                  />
                </button>
              );
            })}
          </div>

          {/* Dot pagination */}
          <div className="flex justify-center items-center gap-1.5 mt-0.5">
            {images.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  selectedIndex === index
                    ? "w-5 bg-black"
                    : "w-1 bg-slate-200 hover:bg-slate-300 cursor-pointer",
                )}
                onClick={() => onSelect(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
