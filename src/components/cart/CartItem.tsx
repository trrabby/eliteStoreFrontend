"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/hooks/useCart";
import { formatBDT } from "@/lib/utils/currency";

type CartItemProps = {
  item: {
    variantId: number;
    productName: string;
    variantName: string;
    sku: string;
    price: number;
    comparePrice: number | null;
    image: string;
    quantity: number;
    stock: number;
  };
};

export function CartItem({ item }: CartItemProps) {
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
      {/* Product Image */}
      <div
        className="relative w-20 h-20 rounded-xl overflow-hidden
                      shrink-0 bg-primary-pale"
      >
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.productName}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
          {item.productName}
        </h4>
        {item.variantName && (
          <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-primary">
            {formatBDT(item.price * item.quantity)}
          </span>
          {item.comparePrice && item.comparePrice > item.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatBDT(item.comparePrice * item.quantity)}
            </span>
          )}
        </div>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                canDecrease
                  ? updateQty(item.variantId, item.quantity - 1)
                  : removeFromCart(item.variantId)
              }
              className="w-7 h-7 rounded-lg border border-gray-200
                         flex items-center justify-center
                         hover:border-primary hover:text-primary
                         transition-all duration-150 text-gray-600"
            >
              <Minus size={12} />
            </button>

            <span
              className="w-8 text-center text-sm font-semibold
                             text-gray-900"
            >
              {item.quantity}
            </span>

            <button
              onClick={() =>
                canIncrease && updateQty(item.variantId, item.quantity + 1)
              }
              disabled={!canIncrease}
              className="w-7 h-7 rounded-lg border border-gray-200
                         flex items-center justify-center
                         hover:border-primary hover:text-primary
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-150 text-gray-600"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => removeFromCart(item.variantId)}
            className="p-1.5 text-gray-400 hover:text-red-500
                       transition-colors rounded-lg hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
