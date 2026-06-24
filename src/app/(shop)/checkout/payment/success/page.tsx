"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hook";
import { resetCheckout } from "@/store/slices/checkoutSlice";
import { clearCart } from "@/store/slices/cartSlice";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false },
);

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  /* Support both ?order=X and ?orders=X,Y,Z */
  const ordersParam =
    searchParams.get("orders") ?? searchParams.get("order") ?? "";
  const orderNumbers = ordersParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  useEffect(() => {
    dispatch(resetCheckout());
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div
      className="container-elite py-16 flex flex-col items-center
                    justify-center min-h-[70vh] gap-6 text-center"
    >
      <Player
        autoplay
        keepLastFrame
        src="https://assets9.lottiefiles.com/packages/lf20_jbrw3hcz.json"
        style={{ height: 200, width: 200 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">
          {orderNumbers.length > 1 ? "Orders Placed! 🎉" : "Order Placed! 🎉"}
        </h1>

        {orderNumbers.length === 1 && (
          <p className="text-gray-500 mb-1">
            Order Number:{" "}
            <span className="font-bold text-primary font-mono">
              {orderNumbers[0]}
            </span>
          </p>
        )}

        {orderNumbers.length > 1 && (
          <div className="space-y-1 mb-3">
            {orderNumbers.map((num, i) => (
              <p key={i} className="text-gray-500 text-sm">
                Order {i + 1}:{" "}
                <span className="font-bold text-primary font-mono">{num}</span>
              </p>
            ))}
          </div>
        )}

        <p className="text-gray-500 text-sm max-w-sm">
          Thank you for your order! You will receive a confirmation notification
          shortly.
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link href="/account/orders" className="btn-primary px-8 py-3">
          Track My Order{orderNumbers.length > 1 ? "s" : ""}
        </Link>
        <Link href="/products" className="btn-secondary px-8 py-3">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
