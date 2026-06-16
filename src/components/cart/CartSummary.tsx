"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useDispatch } from "react-redux";
import { formatBDT } from "@/lib/utils/currency";
import { toggleCart } from "@/store/slices/uiSlice";
import { useCart } from "@/lib/hooks/useCart";
import { DisplayCartItem } from "@/lib/hooks/useCartDisplay";
import { computeVendorShipping } from "@/lib/utils/cart";

type Props = {
  items: DisplayCartItem[];
  subtotal: number;
  savings: number;
  baseRate: number;
  threshold?: number;
};

export function CartSummary({
  items,
  subtotal,
  savings,
  baseRate,
  threshold = 4000,
}: Props) {
  const { itemCount } = useCart();
  const dispatch = useDispatch();
  const router = useRouter();

  const { totalShipping, vendorCount } = computeVendorShipping(
    items,
    baseRate,
    threshold,
  );
  const total = subtotal + totalShipping;

  const handleCheckout = () => {
    dispatch(toggleCart());
    router.push("/checkout");
  };

  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      {vendorCount > 1 && (
        <div className="bg-blue-50 text-blue-700 rounded-xl p-2.5 text-xs">
          Items from {vendorCount} vendors – shipping charges applied per
          vendor.
        </div>
      )}

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatBDT(subtotal)}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-green-600">
            <span>You save</span>
            <span>-{formatBDT(savings)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          {totalShipping === 0 ? (
            <span className="text-green-600 font-medium">FREE</span>
          ) : (
            <span>{formatBDT(totalShipping)}</span>
          )}
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
          <span>Total</span>
          <span className="text-primary">{formatBDT(total)}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCheckout}
        className="w-full btn-primary flex items-center justify-center gap-2 py-3.5"
      >
        <ShoppingBag size={18} />
        Proceed to Checkout
      </motion.button>

      <button
        onClick={() => dispatch(toggleCart())}
        className="w-full text-sm text-center text-gray-500 hover:text-primary transition-colors py-1"
      >
        Continue Shopping
      </button>
    </div>
  );
}
