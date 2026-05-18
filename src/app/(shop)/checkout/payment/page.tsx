"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Tag, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
  selectCheckout,
  setPaymentMethod,
  applyCouponSuccess,
  removeCoupon,
} from "@/store/slices/checkoutSlice";
import { useCart } from "@/lib/hooks/useCart";
import { applyCoupon } from "@/services/coupon.service";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { formatBDT } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

const PAYMENT_METHODS = [
  {
    id: "CASH_ON_DELIVERY",
    label: "Cash on Delivery",
    desc: "Pay when your order arrives",
    icon: "💵",
    badge: "Most Popular",
  },
  {
    id: "SSLCOMMERZ",
    label: "Card / Net Banking",
    desc: "Visa, Mastercard, all banks",
    icon: "💳",
    badge: null,
  },
  {
    id: "BKASH",
    label: "bKash",
    desc: "Pay with your bKash account",
    icon: "📱",
    badge: null,
  },
  {
    id: "NAGAD",
    label: "Nagad",
    desc: "Pay with your Nagad account",
    icon: "📱",
    badge: null,
  },
];

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const checkout = useAppSelector(selectCheckout);
  const { subtotal, savings } = useCart();

  const [method, setMethod] = useState<string>(
    checkout.paymentMethod ?? "CASH_ON_DELIVERY",
  );
  const [couponInput, setCouponInput] = useState(checkout.couponCode ?? "");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout/payment");
      return;
    }
    if (!checkout.selectedAddressId) {
      router.push("/checkout");
      return;
    }
  }, [user, checkout.selectedAddressId]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplying(true);
    try {
      const fd = new FormData();
      fd.append(
        "data",
        JSON.stringify({
          code: couponInput.trim(),
          orderSubtotal: subtotal,
        }),
      );
      const res = await applyCoupon(fd);

      if (!res?.success) {
        toast.error(res?.message ?? "Invalid or expired coupon.");
        return;
      }

      dispatch(
        applyCouponSuccess({
          code: couponInput.trim(),
          discount: res.data.discountAmount ?? 0,
          couponId: res.data.couponId,
        }),
      );
      toast.success(
        `Coupon applied! You save ${formatBDT(res.data.discountAmount)}`,
      );
    } catch {
      toast.error("Failed to apply coupon.");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponInput("");
  };

  const handleContinue = () => {
    dispatch(setPaymentMethod(method));
    router.push("/checkout/review");
  };

  const shippingFee = subtotal >= 1000 ? 0 : 60;
  const discount = checkout.couponDiscount ?? 0;
  const total = subtotal + shippingFee - discount;

  if (!user) return null;

  return (
    <div className="container-elite py-6 max-w-2xl">
      <CheckoutProgress />

      <div className="space-y-4">
        {/* Payment method */}
        <div className="card p-6">
          <h2
            className="font-display text-xl font-bold text-gray-900 mb-5
                         flex items-center gap-2"
          >
            💳 Payment Method
          </h2>

          <div className="space-y-3">
            {PAYMENT_METHODS.map((pm) => (
              <motion.button
                key={pm.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMethod(pm.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border-2 transition-all",
                  method === pm.id
                    ? "border-primary bg-primary-pale"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pm.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {pm.label}
                        </span>
                        {pm.badge && (
                          <span
                            className="text-xs bg-primary text-white
                                           px-2 py-0.5 rounded-full"
                          >
                            {pm.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center",
                      "justify-center flex-shrink-0 transition-all",
                      method === pm.id
                        ? "border-primary bg-primary"
                        : "border-gray-300",
                    )}
                  >
                    {method === pm.id && (
                      <Check size={11} className="text-white" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Coupon */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag size={16} className="text-primary" />
            Promo Code
          </h3>

          {checkout.couponCode ? (
            <div
              className="flex items-center justify-between bg-green-50
                            border border-green-200 rounded-xl p-3"
            >
              <div>
                <p className="text-sm font-semibold text-green-700">
                  {checkout.couponCode}
                </p>
                <p className="text-xs text-green-600">
                  You save {formatBDT(checkout.couponDiscount)}
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="p-1.5 text-red-400 hover:text-red-600
                           hover:bg-red-50 rounded-lg transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                placeholder="Enter coupon code"
                className="flex-1 border border-gray-200 rounded-xl px-4
                           py-3 text-sm outline-none focus:border-primary
                           focus:ring-2 focus:ring-primary/20 uppercase
                           tracking-wider"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={applying || !couponInput.trim()}
                className="btn-primary px-5 py-3 text-sm disabled:opacity-60"
              >
                {applying ? "..." : "Apply"}
              </button>
            </div>
          )}
        </div>

        {/* Price summary */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Price Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatBDT(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Product discount</span>
                <span>-{formatBDT(savings)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon discount</span>
                <span>-{formatBDT(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              {subtotal >= 1000 ? (
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
              <span className="text-primary">
                {formatBDT(Math.max(0, total))}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/checkout")}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl
                       border-2 border-gray-200 text-sm font-medium
                       text-gray-600 hover:border-gray-300 transition-all"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <MagneticButton
            onClick={handleContinue}
            strength={0.25}
            className="flex-1 btn-primary py-3.5 flex items-center
                       justify-center gap-2"
          >
            Review Order
            <ChevronRight size={16} />
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
