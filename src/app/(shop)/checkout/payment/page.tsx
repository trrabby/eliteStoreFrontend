/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
  selectCheckout,
  setPaymentMethod,
  resetCheckout,
} from "@/store/slices/checkoutSlice";
import { clearCart } from "@/store/slices/cartSlice";
import { initiatePayment } from "@/services/payment.service";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { cn } from "@/lib/utils/cn";

const PAYMENT_METHODS = [
  {
    id: "CASH_ON_DELIVERY",
    label: "Cash on Delivery",
    desc: "Pay securely when your order arrives",
    icon: Banknote,
    badge: "No Extra Fee",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "CREDIT_CARD",
    label: "Card Payment",
    desc: "Visa, Mastercard, Amex & more",
    icon: CreditCard,
    badge: "Secure",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "MOBILE_BANKING",
    label: "bKash / Nagad",
    desc: "Pay with mobile wallet",
    icon: Smartphone,
    badge: "Fast",
    color: "from-pink-500 to-rose-600",
  },
];

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const checkout = useAppSelector(selectCheckout);

  const [method, setMethod] = useState<string>("CASH_ON_DELIVERY");
  const [mobileNumber, setMobileNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [mobileError, setMobileError] = useState("");

  /* ── Determine order IDs to process ── */
  const orderIds = checkout.orderIds?.length
    ? checkout.orderIds
    : checkout.orderId
    ? [checkout.orderId]
    : [];
  const orderNumbers = checkout.orderNumbers?.length
    ? checkout.orderNumbers
    : checkout.orderNumber
    ? [checkout.orderNumber]
    : [];

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout/payment");
      return;
    }
    if (!checkout.selectedAddressId) {
      router.push("/checkout");
      return;
    }
    if (!orderIds.length) {
      toast.error("No orders found. Please create an order first.");
      router.push("/checkout/review");
    }
  }, [user, checkout.selectedAddressId, orderIds.length]);

  const validateMobileNumber = (num: string) => {
    const ok = /^01[3-9]\d{8}$/.test(num);
    setMobileError(
      ok ? "" : "Enter a valid Bangladesh mobile number (01XXXXXXXXX)",
    );
    return ok;
  };

  const handlePayNow = async () => {
    if (!orderIds.length) {
      toast.error("Order not found.");
      router.push("/checkout/review");
      return;
    }

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

    dispatch(setPaymentMethod(method));
    setProcessing(true);

    try {
      if (method === "CASH_ON_DELIVERY") {
        /* ── COD: call initiatePayment for each order ── */
        for (const orderId of orderIds) {
          const fd = new FormData();
          fd.append(
            "data",
            JSON.stringify({ orderId, method: "CASH_ON_DELIVERY" }),
          );
          const res = await initiatePayment(fd);
          if (!res?.success) {
            toast.error(
              res?.message ?? "Payment initiation failed for one order.",
            );
            setProcessing(false);
            return;
          }
        }

        dispatch(clearCart());
        dispatch(resetCheckout());
        router.push(
          `/checkout/payment/success?orders=${orderNumbers.join(",")}`,
        );
      } else {
        /* ── Online: initiate on first order, redirect to gateway ── */
        const primaryOrderId = orderIds[0];
        const fd = new FormData();
        fd.append(
          "data",
          JSON.stringify({
            orderId: primaryOrderId,
            method,
            ...(mobileNumber ? { mobileNumber } : {}),
          }),
        );

        const res = await initiatePayment(fd);
        if (!res?.success) {
          toast.error(res?.message ?? "Payment initiation failed.");
          setProcessing(false);
          return;
        }

        const redirectUrl =
          res.data?.redirectUrl ||
          res.data?.gatewayUrl ||
          res.data?.bkashURL ||
          res.data?.callBackUrl ||
          null;

        dispatch(clearCart());

        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          dispatch(resetCheckout());
          router.push(
            `/checkout/payment/success?orders=${orderNumbers.join(",")}`,
          );
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  if (!user) return null;

  const orderCount = orderIds.length;

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="container-elite py-6 max-w-2xl">
        <CheckoutProgress />

        <div className="space-y-5">
          {/* ── Order banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl bg-linear-to-r from-primary/10 to-primary/5 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">
                  {orderCount === 1 ? "Order" : `${orderCount} Orders`}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 font-mono">
                  {orderNumbers.slice(0, 2).join(" · ")}
                  {orderNumbers.length > 2 &&
                    ` +${orderNumbers.length - 2} more`}
                </p>
              </div>
              {orderCount > 1 && (
                <div className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium">
                  Multi-vendor
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Payment methods ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 bg-linear-to-r from-gray-50 to-white p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-primary/10 p-2">
                  <CreditCard size={18} className="text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold text-gray-900">
                  Select Payment Method
                </h2>
              </div>
              {orderCount > 1 && (
                <p className="mt-2 text-xs text-gray-500 bg-amber-50 rounded-xl px-3 py-2">
                  ⚠️ For online payment, you will be redirected for your primary
                  order. COD will confirm all {orderCount} orders
                  simultaneously.
                </p>
              )}
            </div>

            <div className="p-6 pt-4">
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm, i) => (
                  <motion.button
                    key={pm.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setMethod(pm.id)}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition-all",
                      method === pm.id
                        ? "border-primary/50 bg-linear-to-r from-primary/5 to-transparent shadow-md"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                        method === pm.id
                          ? "border-primary bg-primary"
                          : "border-gray-300",
                      )}
                    >
                      {method === pm.id && (
                        <Check size={10} className="text-white" />
                      )}
                    </div>

                    <div className="flex items-start gap-3 pr-6">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl transition-all",
                          method === pm.id
                            ? `bg-linear-to-br ${pm.color} text-white shadow-sm`
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
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {pm.desc}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Mobile number for mobile banking */}
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
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm
                                   outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                      {mobileError && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {mobileError}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Trust badges ── */}
          <div className="flex items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-green-600" />
              <span className="text-xs text-gray-600">Secure Payment</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-primary" />
              <span className="text-xs text-gray-600">Fast Delivery</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span className="text-xs text-gray-600">
                Instant Confirmation
              </span>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/checkout/review")}
              className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white
                         px-6 py-3.5 text-sm font-medium text-gray-600 hover:border-gray-300 transition-all"
            >
              <ChevronLeft size={16} />
              Back
            </motion.button>

            <MagneticButton
              onClick={handlePayNow}
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
                    className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white mr-2"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <span>
                    {method === "CASH_ON_DELIVERY"
                      ? "Confirm Order"
                      : "Pay Now"}
                    {orderCount > 1 ? ` (${orderCount} orders)` : ""}
                  </span>
                  <ArrowRight
                    size={16}
                    className="ml-2 transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </MagneticButton>
          </div>

          <p className="text-center text-xs text-gray-400">
            🔒 Your payment is protected with 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}
