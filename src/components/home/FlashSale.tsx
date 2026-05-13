/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, Tornado, Zap } from "lucide-react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

type FlashSaleItem = {
  id: number;
  publicId: string;
  salePrice: string;
  originalPrice: string;
  product: {
    publicId: string;
    name: string;
    slug: string;
    images: {
      url: string;
      altText?: string;
    }[];
  };
};

type FlashSaleData = {
  id: number;
  publicId: string;
  title: string;
  slug: string;
  description?: string;
  endsAt: string;
  items: FlashSaleItem[];
};

type FlashSaleProps = {
  flashSales: FlashSaleData[];
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        className="bg-gray-900 text-white font-bold text-xl
        w-10 h-10 rounded-lg flex items-center justify-center"
      >
        {String(value).padStart(2, "0")}
      </motion.div>

      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}

function FlashSaleCard({ sale }: { sale: FlashSaleData }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const end = new Date(sale.endsAt).getTime();

    const tick = () => {
      const diff = Math.max(0, end - Date.now());

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    tick();

    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [sale.endsAt]);

  return (
    <Link href={`/flash-sales/${sale.slug}`} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        className="group rounded-3xl overflow-hidden
        border border-gray-200 bg-white shadow-sm hover:shadow-xl
        transition-all duration-300"
      >
        {/* Header */}
        <div
          className="bg-linear-to-r from-primary/10 via-pink-100 to-orange-100
          p-5 border-b"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-gradient-primary
              flex items-center justify-center shadow-pink"
            >
              <Zap size={20} className="text-white fill-white" />
            </motion.div>

            <div>
              <h3 className="font-bold text-lg line-clamp-1">{sale.title}</h3>

              <p className="text-sm text-gray-600 line-clamp-1">
                {sale.description}
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-end gap-1.5">
            <CountdownUnit value={timeLeft.days} label="DAY" />

            <span className="text-xl font-bold text-primary mb-2">:</span>

            <CountdownUnit value={timeLeft.hours} label="HRS" />

            <span className="text-xl font-bold text-primary mb-2">:</span>

            <CountdownUnit value={timeLeft.minutes} label="MIN" />

            <span className="text-xl font-bold text-primary mb-2">:</span>

            <CountdownUnit value={timeLeft.seconds} label="SEC" />
          </div>
        </div>

        {/* Products Preview */}
        <div className="p-4">
          {sale.items.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {sale.items.slice(0, 3).map((item) => (
                <div
                  key={item.publicId}
                  className="rounded-2xl border overflow-hidden bg-gray-50"
                >
                  <div className="aspect-square relative bg-white">
                    {item.product.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    <h4 className="text-xs font-medium line-clamp-1">
                      {item.product.name}
                    </h4>

                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm font-bold text-primary">
                        ৳{item.salePrice}
                      </span>

                      <span className="text-xs text-gray-400 line-through">
                        ৳{item.originalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-6">
              Products will be added soon
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export function FlashSale({ flashSales }: FlashSaleProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateButtons = () => {
    if (!emblaApi) return;

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  };

  useEffect(() => {
    if (!emblaApi) return;

    updateButtons();

    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);

    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi]);

  if (!flashSales?.length) return null;

  return (
    <section className="py-10 overflow-hidden relative">
      <div className="container-elite">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                y: [0, -2, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-11 h-11 rounded-2xl
  bg-linear-to-br from-orange-500 via-red-500 to-yellow-400
  flex items-center justify-center
  shadow-lg shadow-orange-500/40 overflow-hidden"
            >
              {/* Glow */}
              <div
                className="absolute inset-0
    bg-yellow-300/20 blur-xl"
              />

              {/* Flame Icon */}
              <Flame
                size={22}
                className="relative z-10 text-white fill-yellow-200"
                strokeWidth={2.5}
              />

              {/* Small flame pulse */}
              <motion.div
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                className="absolute w-6 h-6 rounded-full
    bg-yellow-200/30 blur-md"
              />
            </motion.div>
            <div>
              <h2 className="section-title">Flash Sales & Offers</h2>

              <p className="text-sm text-gray-500">
                Limited-time campaigns with exclusive discounts
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="w-10 h-10 rounded-full border bg-white
              flex items-center justify-center shadow-sm
              hover:bg-gray-50 transition disabled:opacity-40
              disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className="w-10 h-10 rounded-full border bg-white
              flex items-center justify-center shadow-sm
              hover:bg-gray-50 transition disabled:opacity-40
              disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div
          className="flex gap-4
          pl-4 md:pl-[max(1rem,calc((100vw-80rem)/2))]
          pr-4"
        >
          {flashSales.map((sale) => (
            <div
              key={sale.publicId}
              className="flex-[0_0_320px] md:flex-[0_0_380px]"
            >
              <FlashSaleCard sale={sale} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Floating Buttons */}
      {flashSales.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className="md:hidden absolute left-2 top-1/2 -translate-y-1/2
            z-10 w-10 h-10 rounded-full bg-white border shadow-lg
            flex items-center justify-center
            disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className="md:hidden absolute right-2 top-1/2 -translate-y-1/2
            z-10 w-10 h-10 rounded-full bg-white border shadow-lg
            flex items-center justify-center
            disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </section>
  );
}
