"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingBag, Tag } from "lucide-react";
import { useDispatch } from "react-redux";
import { formatBDT } from "@/lib/utils/currency";
import { toggleCart } from "@/store/slices/uiSlice";
import { useCart } from "@/lib/hooks/useCart";

type Props = {
  subtotal: number;
  savings: number;
};

const FREE_SHIPPING_THRESHOLD = 1000;

export function CartSummary({ subtotal, savings }: Props) {
  const { itemCount } = useCart();
  const dispatch = useDispatch();
  const router = useRouter();

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = freeShipping ? 0 : 60;
  const total = subtotal + shippingFee;

  const handleCheckout = () => {
    dispatch(toggleCart());
    router.push("/checkout");
  };

  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      {/* Free shipping progress */}
      {!freeShipping && (
        <div className="bg-primary-pale rounded-xl p-3">
          <p className="text-xs text-gray-600 mb-1.5">
            Add{" "}
            <span className="font-bold text-primary">
              {formatBDT(FREE_SHIPPING_THRESHOLD - subtotal)}
            </span>{" "}
            more for free shipping!
          </p>
          <div className="h-1.5 bg-white rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                  100,
                )}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {freeShipping && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-xl p-3">
          🎉 <span className="font-medium">Free shipping unlocked!</span>
        </div>
      )}

      {savings > 0 && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-green-600">
            <Tag size={12} />
            <span>You save</span>
          </div>
          <span className="font-semibold text-green-600">
            {formatBDT(savings)}
          </span>
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatBDT(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          {freeShipping ? (
            <span className="text-green-600 font-medium">FREE</span>
          ) : (
            <span>{formatBDT(shippingFee)}</span>
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
