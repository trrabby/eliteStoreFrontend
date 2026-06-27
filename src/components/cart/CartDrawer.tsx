/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, LogIn, StoreIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useMemo } from "react";
import { RootState } from "@/store";
import { toggleCart } from "@/store/slices/uiSlice";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { DisplayCartItem, useCartDisplay } from "@/lib/hooks/useCartDisplay";
import { useCart } from "@/lib/hooks/useCart";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { formatBDT } from "@/lib/utils/currency";
import { computeVendorShipping } from "@/lib/utils/cart";
import { getBaseShippingRate } from "@/lib/utils/shipping";
import { useUsers } from "@/lib/hooks/useUser";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false },
);

export function CartDrawer() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isCartOpen = useSelector((s: RootState) => s.ui.isCartOpen);
  const cart = useSelector((state: RootState) => state.cart);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const { displayItems, loading, subtotal, savings } = useCartDisplay();
  const defaultAddress = user?.defaultAddress;
  const baseRate = getBaseShippingRate(defaultAddress);
  const { userAndNoAccesstoken } = useUsers();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(toggleCart());
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dispatch]);

  // Lock body scroll
  useEffect(() => {
    // console.log({ CartDrawer: displayItems, itemCount });
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const groupedItems = useMemo(() => {
    const groups: Record<
      number,
      { vendorId: number; vendorName: string; items: typeof displayItems }
    > = {};
    for (const item of displayItems) {
      const key = item.vendorId;
      if (!groups[key]) {
        groups[key] = {
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          items: [],
        };
      }
      groups[key].items.push(item);
    }
    return Object.values(groups);
  }, [displayItems]);

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
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-pale flex items-center justify-center">
                  <ShoppingBag size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-gray-900">
                    Your Cart
                  </h2>
                  <p className="text-xs text-gray-400">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(toggleCart())}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Guest notice */}
            {(!user && itemCount > 0) ||
              (userAndNoAccesstoken && itemCount > 0 && (
                <div
                  className="mx-5 mt-3 flex items-center justify-between gap-2
                              bg-primary-pale rounded-xl px-3 py-2 text-xs"
                >
                  <span className="text-gray-600">
                    <span className="font-semibold text-primary">
                      Not logged in.
                    </span>{" "}
                    Cart saved locally.
                  </span>
                  <button
                    onClick={() => {
                      dispatch(toggleCart());
                      router.push("/login?redirect=/cart");
                    }}
                    className="shrink-0 flex items-center gap-1 text-primary font-medium hover:underline"
                  >
                    <LogIn size={12} />
                    Login
                  </button>
                </div>
              ))}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5">
              {itemCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
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
              ) : loading && displayItems.length === 0 ? (
                /* Skeleton while first fetch */
                <div className="space-y-4 py-4">
                  {Array.from({ length: Math.min(itemCount, 3) }).map(
                    (_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="skeleton w-20 h-20 rounded-xl" />
                        <div className="flex-1 space-y-2 pt-1">
                          <div className="skeleton h-3 w-3/4 rounded" />
                          <div className="skeleton h-3 w-1/2 rounded" />
                          <div className="skeleton h-3 w-1/4 rounded" />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                // In the items section, replace the direct mapping with grouped rendering:
                <div className="py-2">
                  {groupedItems.map((group: any) => (
                    <div key={group.vendorId} className="mb-3">
                      <div className="flex items-center gap-2 px-1 py-1 text-xs font-medium text-gray-600">
                        <StoreIcon size={14} className="text-primary" />
                        <span>{group.vendorName}</span>
                        <span className="text-gray-400 ml-auto">
                          {group.items.reduce(
                            (sum: any, i: any) => sum + i.quantity,
                            0,
                          )}{" "}
                          items
                        </span>
                      </div>
                      <AnimatePresence mode="popLayout">
                        {group.items.map((item: any) => (
                          <CartItem key={item.variantId} item={item} />
                        ))}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary / CTA */}
            {itemCount > 0 && displayItems.length > 0 && (
              <div className="px-5 pb-6 pt-3">
                {user && !userAndNoAccesstoken ? (
                  <CartSummary
                    items={displayItems}
                    subtotal={subtotal}
                    savings={savings}
                    baseRate={baseRate}
                  />
                ) : (
                  <GuestCartCTA
                    items={displayItems}
                    subtotal={subtotal}
                    baseRate={baseRate}
                  />
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function GuestCartCTA({
  items,
  subtotal,
  baseRate,
}: {
  items: DisplayCartItem[];
  subtotal: number;
  baseRate: number;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { itemCount } = useCart();
  const { totalShipping } = computeVendorShipping(items, baseRate, 4000);
  const total = subtotal + totalShipping;

  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatBDT(subtotal)}</span>
        </div>
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

      <div className="bg-primary-pale rounded-xl p-2.5 text-xs text-gray-600 text-center">
        Login to sync cart across devices & checkout
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
