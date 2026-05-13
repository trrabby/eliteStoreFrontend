"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

type RatingBreakdownProps = {
  averageRating: number;
  reviewCount: number;
  breakdown: Record<number, number>; // { 5: 40, 4: 20, ... }
};

export function RatingBreakdown({
  averageRating,
  reviewCount,
  breakdown,
}: RatingBreakdownProps) {
  return (
    <div className="flex gap-8 items-center">
      {/* Big score */}
      <div className="text-center flex-shrink-0">
        <div className="font-display text-5xl font-bold text-gray-900">
          {Number(averageRating).toFixed(1)}
        </div>
        <div className="flex justify-center mt-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={
                i < Math.round(averageRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-200 fill-gray-200"
              }
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">{reviewCount} reviews</p>
      </div>

      {/* Bars */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = breakdown[rating] ?? 0;
          const percent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 w-10 flex-shrink-0">
                <span className="text-xs text-gray-600">{rating}</span>
                <Star size={10} className="fill-amber-400 text-amber-400" />
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (5 - rating) * 0.08 }}
                  className="h-full bg-amber-400 rounded-full"
                />
              </div>
              <span className="text-xs text-gray-400 w-6 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
