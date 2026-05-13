"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type FlashSaleBadgeProps = {
  saleTitle: string;
  endsAt: string;
  discountType: string;
  discountValue: number;
};

export function FlashSaleBadge({
  saleTitle,
  endsAt,
  discountType,
  discountValue,
}: FlashSaleBadgeProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const end = new Date(endsAt).getTime();
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

  const discountLabel =
    discountType === "PERCENTAGE"
      ? `${discountValue}% OFF`
      : `৳${discountValue} OFF`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 bg-gradient-to-r
                 from-orange-500 to-primary rounded-2xl p-3
                 text-white"
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="flex-shrink-0"
      >
        <Zap size={20} className="fill-white" />
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold opacity-90">{saleTitle}</p>
        <p className="text-lg font-bold">{discountLabel}</p>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {[
          { v: timeLeft.hours, l: "h" },
          { v: timeLeft.minutes, l: "m" },
          { v: timeLeft.seconds, l: "s" },
        ].map(({ v, l }, i) => (
          <div key={l} className="flex items-center gap-0.5">
            {i > 0 && <span className="text-xs opacity-70">:</span>}
            <div
              className="bg-white/20 rounded-lg px-1.5 py-0.5 min-w-[28px]
                            text-center"
            >
              <span className="font-bold text-sm font-mono">
                {String(v).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
