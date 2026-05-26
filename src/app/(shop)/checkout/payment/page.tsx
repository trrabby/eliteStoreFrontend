/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Shield,
  CreditCard,
  Smartphone,
  Banknote,
  Check,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
  selectCheckout,
  setPaymentMethod,
  setPlacedOrder,
  resetCheckout,
} from "@/store/slices/checkoutSlice";
import { clearCart } from "@/store/slices/cartSlice";
import { useCart } from "@/lib/hooks/useCart";
import { createOrder } from "@/services/order.service";
import { initiatePayment } from "@/services/payment.service";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { formatBDT } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

const PAYMENT_METHODS = [
  {
    id: "CASH_ON_DELIVERY",
    label: "Cash on Delivery",
    desc: "Pay securely when your order arrives",
    icon: Banknote,
    badge: "No Extra Fee",
    color: "from-green-500 to-emerald-600",
    bgLight: "bg-green-50",
  },
  {
    id: "CREDIT_CARD",
    label: "Card Payment",
    desc: "Visa, Mastercard, Amex & more",
    icon: CreditCard,
    badge: "Secure",
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
  },
  {
    id: "MOBILE_BANKING",
    label: "bKash / Nagad",
    desc: "Pay with mobile wallet",
    icon: Smartphone,
    badge: "Fast",
    color: "from-pink-500 to-rose-600",
    bgLight: "bg-pink-50",
  },
];

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const checkout = useAppSelector(selectCheckout);
  const { items, subtotal } = useCart();

  const [method, setMethod] = useState<string>("CASH_ON_DELIVERY");
  const [mobileNumber, setMobileNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [mobileError, setMobileError] = useState("");

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

  const validateMobileNumber = (number: string) => {
    const bangladeshMobileRegex = /^(01[3-9]\d{8})$/;
    if (!bangladeshMobileRegex.test(number)) {
      setMobileError(
        "Enter a valid Bangladesh mobile number (e.g., 01XXXXXXXXX)",
      );
      return false;
    }
    setMobileError("");
    return true;
  };

  const handlePlaceOrderAndPay = async () => {
    if (!checkout.selectedAddressId) {
      toast.error("Address not selected");
      router.push("/checkout");
      return;
    }

    // Validate mobile number for mobile banking
    if (method === "MOBILE_BANKING") {
      if (!mobileNumber) {
        toast.error("Please enter your mobile number");
        return;
      }
      if (!validateMobileNumber(mobileNumber)) {
        toast.error(mobileError);
        return;
      }
    }

    setProcessing(true);

    try {
      // Step 1: Create order
      const orderFd = new FormData();
      orderFd.append(
        "data",
        JSON.stringify({
          shippingAddressId: checkout.selectedAddressId,
          couponCode: checkout.couponCode ?? undefined,
          notes: checkout.notes || undefined,
        }),
      );

      const orderRes = await createOrder(orderFd);

      if (!orderRes?.success) {
        toast.error(orderRes?.message ?? "Failed to create order.");
        setProcessing(false);
        return;
      }

      const { id: orderId, publicId, orderNumber } = orderRes.data;

      // Step 2: Initiate payment
      const payFd = new FormData();
      const paymentPayload: any = {
        orderId,
        method: method,
      };

      if (method === "MOBILE_BANKING" && mobileNumber) {
        paymentPayload.mobileNumber = mobileNumber;
      }

      payFd.append("data", JSON.stringify(paymentPayload));

      const payRes = await initiatePayment(payFd);

      if (!payRes?.success) {
        toast.error(payRes?.message ?? "Payment initiation failed.");
        setProcessing(false);
        return;
      }

      // Store order info
      dispatch(
        setPlacedOrder({ orderId, orderPublicId: publicId, orderNumber }),
      );

      // Clear cart and checkout state
      dispatch(clearCart());
      dispatch(resetCheckout());

      // Handle based on payment method
      if (method === "CASH_ON_DELIVERY") {
        router.push(`/payment/success?order=${orderNumber}`);
      } else if (payRes.data?.redirectUrl) {
        window.location.href = payRes.data.redirectUrl;
      } else {
        router.push(`/payment/success?order=${orderNumber}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const shippingFee = subtotal >= 1000 ? 0 : 60;
  const discount = checkout.couponDiscount ?? 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container-elite py-6 max-w-2xl">
        <CheckoutProgress />

        <div className="space-y-5">
          {/* Order Summary Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 to-primary/5 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Order Total</p>
                <p className="text-2xl font-bold text-primary">
                  {formatBDT(total)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">{items.length} items</p>
                {discount > 0 && (
                  <p className="text-xs text-green-600">
                    Saved {formatBDT(discount)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Payment Method Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-primary/10 p-2">
                  <CreditCard size={18} className="text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold text-gray-900">
                  Select Payment Method
                </h2>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Choose how you'd like to pay for your order
              </p>
            </div>

            <div className="p-6 pt-4">
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm, index) => (
                  <motion.button
                    key={pm.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setMethod(pm.id)}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200",
                      method === pm.id
                        ? "border-primary/50 bg-gradient-to-r from-primary/5 to-transparent shadow-md"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                        method === pm.id
                          ? "border-primary bg-primary"
                          : "border-gray-300 bg-white",
                      )}
                    >
                      {method === pm.id && (
                        <Check size={10} className="text-white" />
                      )}
                    </div>

                    <div className="flex items-start gap-3 pr-6">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
                          method === pm.id
                            ? `bg-gradient-to-br ${pm.color} text-white shadow-sm`
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200",
                        )}
                      >
                        <pm.icon size={20} />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-gray-900">
                            {pm.label}
                          </span>
                          {pm.badge && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                method === pm.id
                                  ? "bg-primary/10 text-primary"
                                  : "bg-gray-100 text-gray-600",
                              )}
                            >
                              {pm.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {pm.desc}
                        </p>
                      </div>
                    </div>

                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </motion.button>
                ))}
              </div>

              {/* Mobile Number Input for Mobile Banking */}
              <AnimatePresence>
                {method === "MOBILE_BANKING" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="rounded-xl bg-gray-50 p-4">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Mobile Number (bKash/Nagad)
                      </label>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => {
                          setMobileNumber(e.target.value);
                          if (mobileError) validateMobileNumber(e.target.value);
                        }}
                        placeholder="01XXXXXXXXX"
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                      {mobileError && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {mobileError}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        You'll receive a payment request on this number
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-green-600" />
              <span className="text-xs text-gray-600">Secure Payment</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span className="text-xs text-gray-600">
                Instant Confirmation
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/checkout/review")}
              className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:shadow-sm whitespace-nowrap"
            >
              <ChevronLeft size={16} />
              Back to Review
            </motion.button>

            <MagneticButton
              onClick={handlePlaceOrderAndPay}
              disabled={processing}
              strength={0.05}
              className="flex w-full justify-center items-center btn-primary group py-3.5 text-base disabled:opacity-70"
            >
              {processing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Pay {formatBDT(total)}</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </MagneticButton>
          </div>

          {/* Security Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-gray-400"
          >
            🔒 Your payment information is protected with 256-bit SSL encryption
          </motion.p>
        </div>
      </div>
    </div>
  );
}
