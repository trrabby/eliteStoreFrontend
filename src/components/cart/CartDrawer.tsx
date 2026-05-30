"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, LogIn } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { toggleCart } from "@/store/slices/uiSlice";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/hooks/useCart";
import { formatBDT } from "@/lib/utils/currency";

function GuestCartSummary() {
  const { subtotal, itemCount } = useCart();
  const dispatch = useDispatch();
  const router = useRouter();

  const shippingFee = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + shippingFee;

  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatBDT(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>
            {subtotal >= 1000 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              formatBDT(shippingFee)
            )}
          </span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
          <span>Total</span>
          <span className="text-primary">{formatBDT(total)}</span>
        </div>
      </div>

      <div className="bg-primary-pale rounded-xl p-3 text-xs text-gray-600 text-center">
        Login to sync your cart and checkout
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          dispatch(toggleCart());
          router.push("/login?redirect=/checkout");
        }}
        className="w-full btn-primary flex items-center justify-center gap-2 py-3.5"
      >
        <LogIn size={16} />
        Login to Checkout
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

// ── Dynamic import — prevents "document is not defined" on SSR ──
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false },
);

export function CartDrawer() {
  const dispatch = useDispatch();
  const { isCartOpen } = useSelector((s: RootState) => s.ui);
  const { items } = useSelector((s: RootState) => s.cart);
  const user = useSelector((s: RootState) => s.auth.user);
  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(toggleCart());
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dispatch, items.length]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(toggleCart())}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md
                       bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4
                            border-b border-gray-100"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg bg-primary-pale
                                flex items-center justify-center"
                >
                  <ShoppingBag size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-gray-900">
                    Your Cart
                  </h2>
                  <p className="text-xs text-gray-400">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(toggleCart())}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400
                           hover:text-gray-700 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center
                                h-full gap-4 py-12"
                >
                  {/* Lottie — dynamically imported, safe from SSR */}
                  <Player
                    autoplay
                    keepLastFrame
                    src="https://assets10.lottiefiles.com/packages/lf20_2LdLki.json"
                    style={{ height: 180, width: 180 }}
                  />
                  <div className="text-center">
                    <p className="font-semibold text-gray-700 mb-1">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-gray-400">
                      Explore our products and add something you love!
                    </p>
                  </div>
                  <Link
                    href="/products"
                    onClick={() => dispatch(toggleCart())}
                    className="btn-primary px-8"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="py-2">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItem
                        key={item.variantId}
                        item={{
                          ...item,
                          price: item?.variant?.price || 0,
                          comparePrice: item?.variant?.comparePrice || 0,
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="px-5 pb-6 pt-3">
                {user ? <CartSummary /> : <GuestCartSummary />}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
