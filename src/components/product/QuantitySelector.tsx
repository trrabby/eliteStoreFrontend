"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

type QuantitySelectorProps = {
  value: number;
  onChange: (v: number) => void;
  max: number;
  min?: number;
};

export function QuantitySelector({
  value,
  onChange,
  max,
  min = 1,
}: QuantitySelectorProps) {
  return (
    <div
      className="flex items-center gap-0 border-2 border-gray-200
                    rounded-xl overflow-hidden w-fit"
    >
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center
                   text-gray-600 hover:bg-primary-pale hover:text-primary
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all"
      >
        <Minus size={16} />
      </motion.button>

      <span
        className="w-12 text-center font-bold text-gray-900 text-sm
                       border-x-2 border-gray-200 h-10 flex items-center
                       justify-center"
      >
        {value}
      </span>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center
                   text-gray-600 hover:bg-primary-pale hover:text-primary
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all"
      >
        <Plus size={16} />
      </motion.button>
    </div>
  );
}
