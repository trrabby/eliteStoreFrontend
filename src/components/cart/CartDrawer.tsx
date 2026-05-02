"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { toggleCart } from "@/store/slices/uiSlice";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { useEffect } from "react";
import Link from "next/link";

// ── Dynamic import — prevents "document is not defined" on SSR ──
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false },
);

export function CartDrawer() {
  const dispatch = useDispatch();
  const { isCartOpen } = useSelector((s: RootState) => s.ui);
  const { items } = useSelector((s: RootState) => s.cart);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(toggleCart());
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dispatch]);

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
                      <CartItem key={item.variantId} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="px-5 pb-6 pt-3">
                <CartSummary />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
