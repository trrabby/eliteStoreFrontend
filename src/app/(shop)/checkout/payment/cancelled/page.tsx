/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <div
      className="container-elite py-16 flex flex-col items-center
                    justify-center min-h-[70vh] gap-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-24 h-24 rounded-full bg-gray-100 flex items-center
                   justify-center"
      >
        <XCircle size={48} className="text-gray-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-500 max-w-sm">
          You cancelled the payment. Your cart is still saved — you can complete
          your purchase whenever you're ready.
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/cart" className="btn-primary px-8 py-3">
          Return to Cart
        </Link>
        <Link href="/products" className="btn-secondary px-8 py-3">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
