/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useCartDisplay } from "@/lib/hooks/useCartDisplay";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { CartItem } from "@/components/cart/CartItem";
import { formatBDT } from "@/lib/utils/currency";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false },
);

const FREE_SHIPPING_THRESHOLD = 1000;

export default function CartPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const { itemCount, clearCart, fetchCart } = useCart();
  const { displayItems, loading, subtotal, savings } = useCartDisplay();

  useEffect(() => {
    // Sync with server on mount (auth only)
    if (user) fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 60;
  const total = subtotal + shippingFee;
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  if (itemCount === 0) {
    return (
      <div className="container-elite py-12 flex flex-col items-center justify-center min-h-[60vh] gap-6">
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

      {/* Guest notice */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between gap-3
                     bg-primary-pale border border-primary/20 rounded-2xl px-4 py-3"
        >
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-primary">
              You're not logged in.
            </span>{" "}
            Your cart is saved locally. Login to sync across devices.
          </p>
          <Link
            href="/login?redirect=/cart"
            className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <LogIn size={14} /> Login
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-2">
            {user && (
              <button
                onClick={fetchCart}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
              >
                <RefreshCw size={14} /> Refresh cart
              </button>
            )}
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors ml-auto"
            >
              <Trash2 size={14} /> Clear all
            </button>
          </div>

          <div className="card overflow-hidden">
            {loading && displayItems.length === 0 ? (
              <div className="space-y-4 p-4">
                {Array.from({ length: Math.min(itemCount, 4) }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton w-20 h-20 rounded-xl" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="skeleton h-3 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                      <div className="skeleton h-3 w-1/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {displayItems.map((item) => (
                  <CartItem key={item.variantId} item={item} />
                ))}
              </AnimatePresence>
            )}
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
                🎉{" "}
                <span className="font-medium">
                  You've unlocked free shipping!
                </span>
              </div>
            )}

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
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-primary">{formatBDT(total)}</span>
              </div>
            </div>

            {user ? (
              <MagneticButton
                strength={0.25}
                onClick={() => router.push("/checkout")}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </MagneticButton>
            ) : (
              <div className="space-y-2">
                <MagneticButton
                  strength={0.25}
                  onClick={() => router.push("/login?redirect=/checkout")}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
                >
                  <LogIn size={16} /> Login to Checkout
                </MagneticButton>
                <p className="text-xs text-center text-gray-400">
                  Cart items will sync after login
                </p>
              </div>
            )}

            <Link
              href="/products"
              className="block text-center text-sm text-gray-500 hover:text-primary transition-colors"
            >
              Continue Shopping
            </Link>

            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-2">
                We accept
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {["SSLCommerz", "bKash", "Nagad", "COD"].map((m) => (
                  <span
                    key={m}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
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
