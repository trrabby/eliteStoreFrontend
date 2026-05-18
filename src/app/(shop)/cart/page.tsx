/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Trash2, RefreshCw } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { CartItem } from "@/components/cart/CartItem";
import { formatBDT } from "@/lib/utils/currency";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { motion as m } from "framer-motion";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false },
);

export default function CartPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const { items, subtotal, savings, itemCount, clearCart, fetchCart } =
    useCart();

  // guard
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }
    fetchCart();
  }, [user]);

  if (!user) return null;

  const shippingFee = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + shippingFee;
  const freeShipping = subtotal >= 1000;

  if (items.length === 0) {
    return (
      <div
        className="container-elite py-12 flex flex-col items-center
                      justify-center min-h-[60vh] gap-6"
      >
        <Player
          autoplay
          keepLastFrame
          src="https://assets10.lottiefiles.com/packages/lf20_2LdLki.json"
          style={{ height: 220, width: 220 }}
        />
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything yet.
          </p>
          <Link href="/products" className="btn-primary px-8 py-3">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-elite py-6">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Cart" }]}
        className="mb-5"
      />

      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart
        <span className="text-base font-normal text-gray-400 ml-3">
          ({itemCount} items)
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {/* Bulk actions */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={fetchCart}
              className="flex items-center gap-1.5 text-sm text-gray-500
                         hover:text-primary transition-colors"
            >
              <RefreshCw size={14} />
              Refresh cart
            </button>
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-sm text-red-500
                         hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
              Clear all
            </button>
          </div>

          <div className="card overflow-hidden">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <CartItem key={item.variantId} item={item} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 sticky top-28 space-y-4"
          >
            <h2 className="font-display font-semibold text-gray-900 text-lg">
              Order Summary
            </h2>

            {/* Free shipping bar */}
            {!freeShipping && (
              <div className="bg-primary-pale rounded-xl p-3">
                <p className="text-xs text-gray-600 mb-1.5">
                  Add{" "}
                  <span className="font-bold text-primary">
                    {formatBDT(1000 - subtotal)}
                  </span>{" "}
                  more for free shipping!
                </p>
                <div className="h-1.5 bg-white rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((subtotal / 1000) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {freeShipping && (
              <div
                className="flex items-center gap-2 text-xs text-green-600
                              bg-green-50 rounded-xl p-3"
              >
                🎉{" "}
                <span className="font-medium">
                  You've unlocked free shipping!
                </span>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-2 text-sm">
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
                {freeShipping ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  <span>{formatBDT(shippingFee)}</span>
                )}
              </div>
              <div
                className="flex justify-between font-bold text-gray-900
                              text-base pt-2 border-t border-gray-100"
              >
                <span>Total</span>
                <span className="text-primary">{formatBDT(total)}</span>
              </div>
            </div>

            {/* Checkout */}
            <MagneticButton
              strength={0.25}
              onClick={() => router.push("/checkout")}
              className="w-full btn-primary py-3.5 flex items-center
                         justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </MagneticButton>

            <Link
              href="/products"
              className="block text-center text-sm text-gray-500
                         hover:text-primary transition-colors"
            >
              Continue Shopping
            </Link>

            {/* Payment methods */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-2">
                We accept
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {["SSLCommerz", "bKash", "Nagad", "COD"].map((m) => (
                  <span
                    key={m}
                    className="text-xs bg-gray-100 text-gray-600
                               px-2 py-0.5 rounded-md"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
