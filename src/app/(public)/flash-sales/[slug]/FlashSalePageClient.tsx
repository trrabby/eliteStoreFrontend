/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils/cn";

type Props = { sale: any };

function Countdown({ endsAt }: { endsAt: string }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
      setT({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const units = [
    { v: t.d, l: "Days" },
    { v: t.h, l: "Hours" },
    { v: t.m, l: "Minutes" },
    { v: t.s, l: "Seconds" },
  ];

  return (
    <div className="flex items-center gap-3 justify-center">
      {units.map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-3">
          {i > 0 && (
            <span className="text-2xl font-bold text-white/60 -mt-3">:</span>
          )}
          <div className="text-center">
            <motion.div
              key={v}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl
                         flex items-center justify-center"
            >
              <span className="font-display text-2xl font-bold text-white">
                {String(v).padStart(2, "0")}
              </span>
            </motion.div>
            <p className="text-xs text-white/70 mt-1 font-medium">{l}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FlashSalePageClient({ sale }: Props) {
  const isEnded = new Date(sale.endsAt) < new Date();
  const isNotStart = sale.startsAt && new Date(sale.startsAt) > new Date();

  // Transform flash sale items to ProductCard-compatible format
  const products = (sale.items ?? []).map((item: any) => ({
    ...item.product,
    flashSaleItem: {
      salePrice: item.salePrice,
      discountType: item.discountType,
      discountValue: item.discountValue,
      flashSale: {
        title: sale.title,
        endsAt: sale.endsAt,
      },
    },
  }));

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 via-primary to-pink-600 py-14 px-4">
        <div className="container-elite text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Zap size={28} className="text-yellow-300 fill-yellow-300" />
              </motion.div>
              <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">
                Flash Sale
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mb-3">
              {sale.title}
            </h1>
            {sale.description && (
              <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto">
                {sale.description}
              </p>
            )}
          </motion.div>

          {/* Countdown */}
          {!isEnded && !isNotStart && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock size={16} className="text-white/70" />
                <span className="text-white/70 text-sm">Ends in</span>
              </div>
              <Countdown endsAt={sale.endsAt} />
            </motion.div>
          )}

          {isEnded && (
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 text-white text-sm">
              This flash sale has ended
            </div>
          )}

          {isNotStart && (
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 text-white text-sm">
              Starts on {new Date(sale.startsAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="container-elite py-10">
        <SectionHeader
          title={`${products.length} Items on Sale`}
          subtitle="Grab them before time runs out!"
        />

        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Zap size={48} className="mx-auto mb-3 opacity-20" />
            <p>No products in this flash sale.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
            {products.map((product: any, i: number) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
