"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/hooks/useCart";
import { formatBDT } from "@/lib/utils/currency";

type CartVariant = {
  id: number;
  name: string;
  sku: string;
  price: string | number;
  comparePrice: string | number | null;
  stock: number;
  isActive: boolean;
};

type CartProduct = {
  id: number;
  name: string;
  slug: string;
  status: string;
  publicId: string;
  images: {
    url: string;
    altText: string;
  }[];
};

type CartItem = {
  id: number;
  cartId: number;
  productId: number;
  variantId: number;
  quantity: number;
  addedAt: string;
  product: CartProduct;
  variant: CartVariant;
};

type CartItemProps = {
  item: CartItem;
};

export function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQty } = useCart();

  // Helper to get numeric price
  const getPrice = (price: string | number): number => {
    return typeof price === "string" ? parseFloat(price) : price;
  };

  const currentPrice = getPrice(item.variant.price);
  const comparePriceValue = item.variant.comparePrice
    ? getPrice(item.variant.comparePrice)
    : null;

  const canIncrease = item.quantity < item.variant.stock;
  const canDecrease = item.quantity > 1;

  const handleUpdateQuantity = (newQuantity: number) => {
    updateQty(item.variantId, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item.variantId);
  };

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
          src={item.product.images[0]?.url || "/placeholder.png"}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
          {item.product.name}
        </h4>
        {item.variant.name && (
          <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-primary">
            {formatBDT(currentPrice * item.quantity)}
          </span>
          {comparePriceValue && comparePriceValue > currentPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatBDT(comparePriceValue * item.quantity)}
            </span>
          )}
        </div>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                canDecrease
                  ? handleUpdateQuantity(item.quantity - 1)
                  : handleRemove()
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
                canIncrease && handleUpdateQuantity(item.quantity + 1)
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
            onClick={handleRemove}
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
