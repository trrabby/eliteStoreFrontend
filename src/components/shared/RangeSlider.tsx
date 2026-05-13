"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

type RangeSliderProps = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  prefix?: string;
};

export function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  prefix = "৳",
}: RangeSliderProps) {
  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;

  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), value[1] - step);
    onChange([v, value[1]]);
  };

  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), value[0] + step);
    onChange([value[0], v]);
  };

  const leftPct = toPercent(value[0]);
  const rightPct = toPercent(value[1]);

  return (
    <div className="space-y-4">
      {/* Track */}
      <div className="relative h-1.5 bg-gray-200 rounded-full">
        {/* Active range */}
        <div
          className="absolute h-full bg-gradient-primary rounded-full"
          style={{
            left: `${leftPct}%`,
            right: `${100 - rightPct}%`,
          }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleMin}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: leftPct > 90 ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={handleMax}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: 4 }}
        />
        {/* Visual thumbs */}
        {[leftPct, rightPct].map((pct, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                       w-4 h-4 bg-white border-2 border-primary rounded-full
                       shadow-sm pointer-events-none"
            style={{ left: `${pct}%`, zIndex: 2 }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-primary">
          {prefix}
          {value[0].toLocaleString()}
        </span>
        <span className="text-gray-400 text-xs">to</span>
        <span className="font-semibold text-primary">
          {prefix}
          {value[1].toLocaleString()}
        </span>
      </div>
    </div>
  );
}
