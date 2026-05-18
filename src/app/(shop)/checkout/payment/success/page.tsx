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
  const orderNumber = searchParams.get("order");
  const dispatch = useAppDispatch();

  useEffect(() => {
    // ensure cleanup on success
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
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Order Placed! 🎉
        </h1>
        {orderNumber && (
          <p className="text-gray-500 mb-1">
            Order Number:{" "}
            <span className="font-bold text-primary">{orderNumber}</span>
          </p>
        )}
        <p className="text-gray-500 text-sm max-w-sm">
          Thank you for your order! You will receive a confirmation notification
          shortly.
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link href="/account/orders" className="btn-primary px-8 py-3">
          Track My Order
        </Link>
        <Link href="/products" className="btn-secondary px-8 py-3">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
