/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/lib/hooks/useCart";
import { computeVariantPrice, formatBDT } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import {
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Clock,
  Tag,
  Zap,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Variant {
  id: number;
  name: string;
  price: string;
  comparePrice?: string | null;
  stock: number;
  isDefault: boolean;
  optionValues: Array<{
    value: {
      id: number;
      option: {
        id: any;
        name: string;
      };
      value: string;
    };
  }>;
}

interface Product {
  id: number;
  name: string;
  variants: Variant[];
}

interface FlashOffer {
  id: number;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: string;
  maxDiscount?: string | null;
  salePrice: string;
  originalPrice: string;
  stock: number;
  soldCount: number;
  flashSale: {
    title: string;
    endsAt: string;
    status: string;
    description: string;
    slug: string;
    banner: string;
  };
}

interface AddToCartSectionProps {
  product: Product;
  defaultVariant: Variant;
  flashOffer: FlashOffer | null;
  onVariantChange?: (variant: Variant) => void;
}

export function AddToCartSection({
  product,
  defaultVariant,
  flashOffer,
  onVariantChange,
}: AddToCartSectionProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Ticking countdown effect for the Flash Sale
  useEffect(() => {
    if (!flashOffer?.flashSale?.endsAt) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(flashOffer.flashSale.endsAt) - +new Date();
      if (difference <= 0) return "Ended";

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(seconds).padStart(2, "0")}`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

    return () => clearInterval(timer);
  }, [flashOffer]);

  // Build options structure
  const options = useMemo(() => {
    const optionMap: Record<
      string,
      {
        optionId: number;
        values: Record<number, { value: string; variantIds: number[] }>;
      }
    > = {};

    product.variants.forEach((variant) => {
      variant.optionValues.forEach((ov) => {
        const optionName = ov.value.option.name;
        const optionId = ov.value.option.id;
        const valueId = ov.value.id;
        const value = ov.value.value;

        if (!optionMap[optionName]) {
          optionMap[optionName] = { optionId, values: {} };
        }
        if (!optionMap[optionName].values[valueId]) {
          optionMap[optionName].values[valueId] = { value, variantIds: [] };
        }
        optionMap[optionName].values[valueId].variantIds.push(variant.id);
      });
    });

    return optionMap;
  }, [product.variants]);

  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, number>
  >(() => {
    const initial: Record<string, number> = {};
    defaultVariant.optionValues.forEach((ov) => {
      const optionName = ov.value.option.name;
      initial[optionName] = ov.value.id;
    });
    return initial;
  });

  // Find selected variant
  const selectedVariant = useMemo(() => {
    const matchingVariants = product.variants.filter((variant) => {
      return Object.entries(selectedOptions).every(([optionName, valueId]) => {
        return variant.optionValues.some(
          (ov) =>
            ov.value.option.name === optionName && ov.value.id === valueId,
        );
      });
    });
    return matchingVariants[0] || defaultVariant;
  }, [selectedOptions, product.variants, defaultVariant]);

  // Notify parent when variant changes
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  // ---- Discount Logic ----
  // Run the computation
  const pricing = useMemo(() => {
    const variantPrice = Number(selectedVariant.price);
    const comparePrice = selectedVariant.comparePrice
      ? Number(selectedVariant.comparePrice)
      : null;

    // Verify campaign safety lifecycle
    const isFlashActive = flashOffer?.flashSale?.endsAt
      ? new Date() < new Date(flashOffer.flashSale.endsAt)
      : false;

    return computeVariantPrice(
      variantPrice,
      comparePrice,
      isFlashActive ? flashOffer : null,
    );
  }, [selectedVariant, flashOffer]);

  // ---- Handlers ----
  const handleOptionSelect = (optionName: string, valueId: number) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: valueId }));
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (selectedVariant.stock < 1) {
      toast.error("This variant is out of stock.");
      return;
    }
    if (quantity > selectedVariant.stock) {
      toast.error(`Only ${selectedVariant.stock} left in stock.`);
      return;
    }
    setAdding(true);
    await addToCart(selectedVariant.id, product.id, quantity);
    setAdding(false);
  };

  const optionNames = Object.keys(options);
  const flashProgressPercent = flashOffer
    ? Math.round((flashOffer.soldCount / flashOffer.stock) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Classy & High-End Flash Sale Offer Card */}

      {flashOffer && timeLeft && timeLeft !== "Ended" && (
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-[#ff3e9b] to-pink-600 rounded-2xl p-5 shadow-md transition-all hover:shadow-lg">
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {/* Live dot + Flash Sale badge */}
                  <span className="flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-dark opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-dark "></span>
                    </span>
                    Flash Sale
                  </span>
                  <h4 className="text-sm font-bold text-white drop-shadow-sm group">
                    <Link
                      href={`/flash-sales/${flashOffer.flashSale.slug ?? ""}`}
                      className="inline-flex items-center gap-0.5 hover:underline underline-offset-2 decoration-white/30 transition"
                    >
                      <span>{flashOffer.flashSale.title}</span>
                      <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 text-xs">
                        →
                      </span>
                    </Link>
                  </h4>
                </div>
                {flashOffer.flashSale.description && (
                  <p className="text-xs text-white/80 mt-1.5 leading-relaxed max-w-md">
                    {flashOffer.flashSale.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full text-xs font-mono font-semibold text-white backdrop-blur-sm shrink-0">
                <Clock size={12} />
                <span>{timeLeft}</span>
              </div>
            </div>

            {flashOffer.stock && flashOffer.soldCount !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/70 font-medium">
                  <span>Few stock left</span>
                  <span>
                    {flashOffer.soldCount} / {flashOffer.stock} claimed
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-white/80 to-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, flashProgressPercent)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Display Block */}
      <div className="space-y-2">
        <div className="flex items-baseline flex-wrap gap-2.5">
          {/* Final Dynamic Price */}
          <span className="font-display text-3xl md:text-4xl font-black text-[#ff3e9b] tracking-tight">
            {formatBDT(pricing.salePrice)}
          </span>

          {/* Strike-Through Base Price */}
          {pricing.hasDiscount && (
            <>
              <span className="text-base md:text-lg text-slate-400 font-medium line-through decoration-1">
                {formatBDT(pricing.basePrice)}
              </span>
              <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-lg text-xs font-extrabold tracking-wide">
                {pricing.totalDiscountPercent}% OFF
              </span>
            </>
          )}
        </div>

        {/* Granular Discount Breakdown Label */}
        {pricing.hasDiscount && (
          <div className="text-xs text-slate-500 font-medium space-x-1 flex flex-wrap items-center gap-1.5">
            <span>Discount breakdown:</span>

            {/* Base Store discount pill flag if active */}
            {pricing.breakdown.standardDiscountPercent > 0 && (
              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold text-[11px]">
                Standard: {pricing.breakdown.standardDiscountPercent}%
              </span>
            )}

            {/* Append dynamic connection string when both active */}
            {pricing.breakdown.standardDiscountPercent > 0 &&
              pricing.breakdown.flashDiscountPercent > 0 && (
                <span className="text-slate-300 font-normal">+</span>
              )}

            {/* Campaign live promotion flag if active */}
            {pricing.breakdown.flashDiscountPercent > 0 && (
              <span className="bg-rose-500/10 text-rose-600 px-1.5 py-0.5 rounded font-bold text-[11px]">
                Flash Sale: {pricing.breakdown.flashDiscountPercent}%
              </span>
            )}

            <span className="text-emerald-600 font-bold pl-1">
              (Saved {formatBDT(pricing.totalDiscountAmount)})
            </span>
          </div>
        )}
      </div>

      {/* Option Modifiers */}
      {optionNames.length > 0 ? (
        <div className="space-y-4">
          {optionNames.map((optionName) => {
            const option = options[optionName];
            const selectedValueId = selectedOptions[optionName];

            return (
              <div key={optionName} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select {optionName}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(option.values).map(
                    ([valueIdStr, { value, variantIds }]) => {
                      const valueId = Number(valueIdStr);
                      const isSelected = selectedValueId === valueId;
                      const variantsWithValue = product.variants.filter((v) =>
                        variantIds.includes(v.id),
                      );
                      const hasStock = variantsWithValue.some(
                        (v) => v.stock > 0,
                      );

                      return (
                        <button
                          key={valueId}
                          onClick={() =>
                            handleOptionSelect(optionName, valueId)
                          }
                          disabled={!hasStock}
                          className={cn(
                            "px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 active:scale-95",
                            isSelected
                              ? "border-[#ff3e9b] bg-[#ff3e9b]/5 text-[#ff3e9b] shadow-sm"
                              : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-700 hover:border-slate-200",
                            !hasStock &&
                              "opacity-40 cursor-not-allowed line-through bg-slate-100 border-transparent text-slate-400 hover:border-transparent",
                          )}
                        >
                          {value}
                          {!hasStock && " (Sold Out)"}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Configured:{" "}
          <span className="text-slate-800 normal-case font-semibold">
            {selectedVariant.name}
          </span>
        </div>
      )}

      {/* Action Controls Footer */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl overflow-hidden p-1 shadow-sm flex-shrink-0">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="p-2 text-slate-600 hover:bg-white rounded-lg disabled:opacity-40 hover:text-black transition active:scale-90"
          >
            <Minus size={15} strokeWidth={2.5} />
          </button>
          <span className="w-9 text-center font-bold text-sm tracking-tight text-slate-800 tabular-nums">
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity((q) => Math.min(q + 1, selectedVariant.stock))
            }
            disabled={quantity >= selectedVariant.stock}
            className="p-2 text-slate-600 hover:bg-white rounded-lg disabled:opacity-40 hover:text-black transition active:scale-90"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={adding || selectedVariant.stock < 1}
          className="flex-1 px-6 py-3.5 bg-[#ff3e9b] hover:bg-[#d4006f] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#ff3e9b]/10 hover:shadow-lg active:scale-[0.99] transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {adding ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingBag size={16} strokeWidth={2.5} />
              Add to Bag
            </>
          )}
        </button>
      </div>

      {/* Confidence Indicators Footer */}
      <div className="flex items-center justify-center gap-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-50">
        <span className="flex items-center gap-1.5">
          <Tag size={13} className="text-slate-400" /> Best price
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={13} className="text-slate-400" /> Quality assured
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} className="text-slate-400" /> Fast delivery
        </span>
      </div>
    </div>
  );
}
