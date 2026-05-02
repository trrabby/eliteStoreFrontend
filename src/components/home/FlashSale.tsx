/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { ProductCard, ProductCardData } from "@/components/product/ProductCard";
import useEmblaCarousel from "embla-carousel-react";

type FlashSaleProps = {
  products: ProductCardData[];
  endsAt?: string;
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        className="bg-gray-900 text-white font-display font-bold text-xl
                   w-10 h-10 rounded-lg flex items-center justify-center"
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}

export function FlashSale({ products, endsAt }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  useEffect(() => {
    const end = endsAt
      ? new Date(endsAt).getTime()
      : Date.now() + 12 * 60 * 60 * 1000; // default 12hr

    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setTimeLeft({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!products?.length) return null;

  return (
    <section className="py-10 overflow-hidden">
      <div className="container-elite">
        {/* Header with countdown */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-end
                        justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-gradient-primary
                         flex items-center justify-center shadow-pink"
            >
              <Zap size={20} className="text-white fill-white" />
            </motion.div>
            <div>
              <h2 className="section-title">Flash Sale</h2>
              <p className="text-sm text-gray-500">
                Limited time — grab it before it's gone!
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-end gap-1.5">
            <CountdownUnit value={timeLeft.hours} label="HRS" />
            <span className="text-xl font-bold text-primary mb-2">:</span>
            <CountdownUnit value={timeLeft.minutes} label="MIN" />
            <span className="text-xl font-bold text-primary mb-2">:</span>
            <CountdownUnit value={timeLeft.seconds} label="SEC" />
          </div>
        </div>
      </div>

      {/* Products carousel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div
          className="flex gap-3
                        pl-4 md:pl-[max(1rem,calc((100vw-80rem)/2))] pr-4"
        >
          {products.map((product, i) => (
            <div
              key={product.publicId}
              className="flex-[0_0_200px] sm:flex-[0_0_220px]"
            >
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
