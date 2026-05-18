"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useAppSelector } from "@/store/hook";
import { selectCheckout } from "@/store/slices/checkoutSlice";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const checkout = useAppSelector(selectCheckout);

  return (
    <div
      className="container-elite py-16 flex flex-col items-center
                    justify-center min-h-[70vh] gap-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-24 h-24 rounded-full bg-red-100 flex items-center
                   justify-center"
      >
        <AlertCircle size={48} className="text-red-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-500 max-w-sm">
          Your payment could not be processed. Your order has not been placed.
          Please try again.
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        {checkout.orderId && (
          <Link href="/checkout/review" className="btn-primary px-8 py-3">
            Try Again
          </Link>
        )}
        <Link href="/products" className="btn-secondary px-8 py-3">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
