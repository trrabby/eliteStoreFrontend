"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/hooks/useCart";
import { formatBDT } from "@/lib/utils/currency";
import type { DisplayCartItem } from "@/lib/hooks/useCartDisplay";

type Props = { item: DisplayCartItem };

export function CartItem({ item }: Props) {
  const { removeFromCart, updateQty } = useCart();

  const canIncrease = item.quantity < item.stock;
  const canDecrease = item.quantity > 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-3 py-4 border-b border-gray-100 last:border-0"
    >
      {/* Image */}
      <Link
        href={`/products/${item.productSlug}`}
        className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-primary-pale"
      >
        <Image
          src={item.imageUrl || "/placeholder.png"}
          alt={item.productName}
          fill
          className="object-cover"
          sizes="80px"
        />

        {/* Flash sale badge */}
        {item.flashSaleLabel && (
          <div
            className="absolute top-0 left-0 bg-orange-500 text-white
                          text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg
                          flex items-center gap-0.5"
          >
            <Zap size={8} className="fill-white" />
            {item.flashSaleLabel}
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.productSlug}`}>
          <h4
            className="text-sm font-semibold text-gray-900 line-clamp-1
                         hover:text-primary transition-colors"
          >
            {item.productName}
          </h4>
        </Link>

        {item.variantName && (
          <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>
        )}

        {/* Price row */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Sale price (final) */}
          <span className="text-sm font-bold text-primary">
            {formatBDT(item.salePrice * item.quantity)}
          </span>

          {/* Original sticker price crossed out */}
          {item.hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatBDT(item.basePrice * item.quantity)}
            </span>
          )}

          {/* Discount percent badge */}
          {item.totalDiscountPercent > 0 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                              ${
                                item.flashSaleLabel
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-green-100 text-green-600"
                              }`}
            >
              -{item.totalDiscountPercent}%
            </span>
          )}
        </div>

        {/* Per-unit price if qty > 1 */}
        {item.quantity > 1 && item.salePrice !== item.basePrice && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {formatBDT(item.salePrice)} each
          </p>
        )}

        {/* Qty controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                canDecrease
                  ? updateQty(item.variantId, item.quantity - 1)
                  : removeFromCart(item.variantId)
              }
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center
                         hover:border-primary hover:text-primary transition-all text-gray-600"
            >
              <Minus size={12} />
            </button>

            <span className="w-8 text-center text-sm font-semibold text-gray-900">
              {item.quantity}
            </span>

            <button
              onClick={() =>
                canIncrease && updateQty(item.variantId, item.quantity + 1)
              }
              disabled={!canIncrease}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center
                         hover:border-primary hover:text-primary disabled:opacity-40
                         disabled:cursor-not-allowed transition-all text-gray-600"
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item.variantId)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
