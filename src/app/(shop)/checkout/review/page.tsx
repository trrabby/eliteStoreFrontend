/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Tag,
  X,
  Shield,
  Truck,
  CreditCard,
  MapPin,
  Package,
  Sparkles,
  Gift,
  ArrowRight,
  ShoppingBag,
  Home,
  Building,
  CheckCircle2,
  Edit2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
  selectCheckout,
  setAddress,
  applyCouponSuccess,
  removeCoupon,
  setNotes,
} from "@/store/slices/checkoutSlice";
import { useCart } from "@/lib/hooks/useCart";
import { applyCoupon } from "@/services/coupon.service";
import { getMyAddresses } from "@/services/user.service";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { formatBDT } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import type { IAddress } from "@/types/user.types";
import Image from "next/image";

// Helper to get address icon
const getAddressIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "home":
      return <Home size={16} />;
    case "office":
    case "work":
      return <Building size={16} />;
    default:
      return <MapPin size={16} />;
  }
};

export default function CheckoutReviewPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const checkout = useAppSelector(selectCheckout);
  const { items, subtotal: cartSubtotal, savings } = useCart();

  const [address, setAddressState] = useState<IAddress | null>(null);
  const [couponInput, setCouponInput] = useState(checkout.couponCode ?? "");
  const [applying, setApplying] = useState(false);
  const [focused, setFocused] = useState(false);
  const [notes, setNotesState] = useState(checkout.notes ?? "");
  const [loading, setLoading] = useState(true);

  // Calculate subtotal from cart items (ensure it's a number)
  const subtotal = Number(cartSubtotal) || 0;

  // Calculate shipping fee
  const shippingFee = subtotal >= 1000 ? 0 : 60;

  // Get discount from checkout state
  const discount = Number(checkout.couponDiscount) || 0;

  // Calculate total
  const total = Math.max(0, subtotal + shippingFee - discount);

  const loadAddress = useCallback(async () => {
    if (!checkout.selectedAddressId) return;

    try {
      const res = await getMyAddresses();
      if (res?.success) {
        const addr =
          res.data?.find(
            (a: IAddress) => a.id === checkout.selectedAddressId,
          ) ?? null;
        setAddressState(addr);
      }
    } catch {
      toast.error("Failed to load address.");
    } finally {
      setLoading(false);
    }
  }, [checkout.selectedAddressId]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!checkout.selectedAddressId) {
      router.push("/checkout");
      return;
    }
    loadAddress();
  }, [user, checkout.selectedAddressId, router, loadAddress]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setApplying(true);
    try {
      const fd = new FormData();
      fd.append(
        "data",
        JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          orderAmount: subtotal, // Send orderAmount parameter
        }),
      );

      const res = await applyCoupon(fd);

      if (!res?.success) {
        toast.error(res?.message ?? "Invalid or expired coupon.");
        setCouponInput("");
        return;
      }

      // Extract discount amount from response
      const discountAmount =
        Number(res.data?.discountAmount) || Number(res.data?.discount) || 0;

      dispatch(
        applyCouponSuccess({
          code: couponInput.trim().toUpperCase(),
          discount: discountAmount,
          couponId: res.data?.couponId || res.data?.id,
        }),
      );

      toast.success(`Coupon applied! You save ${formatBDT(discountAmount)}`);
      setCouponInput("");
    } catch (error) {
      console.error("Coupon error:", error);
      toast.error("Failed to apply coupon. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.info("Coupon removed");
  };

  const handleSaveNotes = () => {
    dispatch(setNotes(notes));
    if (notes) {
      toast.success("Notes saved");
    }
  };

  const handleProceedToPayment = () => {
    // Save notes before proceeding
    dispatch(setNotes(notes));
    router.push("/checkout/payment");
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container-elite py-6 max-w-2xl">
          <CheckoutProgress />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 rounded-3xl bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container-elite py-6 max-w-2xl">
        <CheckoutProgress />

        <div className="space-y-5">
          {/* Order Items Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <ShoppingBag size={18} className="text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-gray-900">
                    Order Items
                  </h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {items.map((item, index) => {
                  const itemPrice = Number(item.variant.price) || 0;
                  const itemTotal = itemPrice * (item.quantity || 0);

                  return (
                    <motion.div
                      key={item.variantId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm">
                        <Image
                          src={
                            item.product.images?.[0]?.url ?? "/placeholder.png"
                          }
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                              {item.product.name}
                            </h4>
                            {item.variant.name && (
                              <p className="mt-0.5 text-xs text-gray-500">
                                {item.variant.name}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-bold text-primary whitespace-nowrap">
                            {formatBDT(itemTotal)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Package size={12} />
                            <span>Qty: {item.quantity}</span>
                          </div>
                          <div className="h-3 w-px bg-gray-200" />
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>Unit: {formatBDT(itemPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Delivery Address Section */}
          {address && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-primary/10 p-2">
                      <Truck size={18} className="text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-gray-900">
                      Delivery Address
                    </h3>
                  </div>
                  <button
                    onClick={() => router.push("/checkout")}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Edit2 size={12} />
                    Change
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    {getAddressIcon(address.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-gray-900">
                        {address.fullName}
                      </p>
                      {address.isDefault && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Default
                        </span>
                      )}
                      {address.label && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {address.label}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-700">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city_district}, {address.country}
                        {address.postalCode && ` - ${address.postalCode}`}
                      </p>
                      {address.landmark && (
                        <p className="text-xs text-gray-500">
                          📍 Near {address.landmark}
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📞</span>
                        <span>{address.phone}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Coupon Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-amber-50 p-2">
                  <Tag size={18} className="text-amber-600" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  Apply Promo Code
                </h3>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Save more with exclusive coupons
              </p>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {checkout.couponCode ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4"
                  >
                    <div className="absolute right-0 top-0 opacity-10">
                      <Gift size={80} />
                    </div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-green-600" />
                          <p className="text-sm font-bold text-green-700 uppercase">
                            {checkout.couponCode}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-green-600">
                          You save {formatBDT(discount)}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="rounded-lg p-2 text-red-400 transition-all hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          value={couponInput}
                          onChange={(e) =>
                            setCouponInput(e.target.value.toUpperCase())
                          }
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleApplyCoupon()
                          }
                          placeholder="Enter coupon code"
                          className={cn(
                            "w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-all uppercase tracking-wider",
                            focused
                              ? "border-primary/50 bg-white shadow-md"
                              : "border-gray-200 bg-gray-50/50 hover:border-gray-300",
                          )}
                        />
                        {couponInput && (
                          <button
                            onClick={() => setCouponInput("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applying || !couponInput.trim()}
                        className="btn-primary px-6 py-3 text-sm disabled:opacity-50"
                      >
                        {applying ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      🎁 Enter a valid coupon code to get instant discount
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Order Notes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-purple-50 p-2">
                  <MessageSquare size={18} className="text-purple-600" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  Order Notes (Optional)
                </h3>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Any special instructions for delivery?
              </p>
            </div>

            <div className="p-6">
              <textarea
                value={notes}
                onChange={(e) => setNotesState(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="e.g., Leave at the front door, Call before delivery, etc."
                rows={3}
                className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm outline-none transition-all focus:border-primary/50 focus:bg-white focus:shadow-md"
              />
              <p className="mt-2 text-xs text-gray-400">
                💡 You can add delivery instructions here
              </p>
            </div>
          </motion.div>

          {/* Price Summary Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-primary/10 p-2">
                  <CreditCard size={18} className="text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  Order Summary
                </h3>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatBDT(subtotal)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Product savings</span>
                    <span className="font-medium">-{formatBDT(savings)}</span>
                  </div>
                )}

                {discount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex justify-between text-green-600"
                  >
                    <div className="flex items-center gap-1">
                      <Sparkles size={14} />
                      <span>Coupon discount</span>
                    </div>
                    <span className="font-medium">-{formatBDT(discount)}</span>
                  </motion.div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  {subtotal >= 1000 ? (
                    <span className="font-medium text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      FREE
                    </span>
                  ) : (
                    <span className="font-medium">
                      {formatBDT(shippingFee)}
                    </span>
                  )}
                </div>

                {subtotal < 1000 && (
                  <div className="rounded-xl bg-amber-50 p-3">
                    <p className="text-xs text-amber-700">
                      🚚 Add {formatBDT(1000 - subtotal)} more to get FREE
                      delivery!
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                  <div>
                    <span className="text-base font-bold text-gray-900">
                      Total Amount
                    </span>
                    <p className="text-xs text-gray-400">
                      Inclusive of all taxes
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">
                      {formatBDT(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-green-600" />
              <span className="text-xs text-gray-600">Secure Transaction</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-primary" />
              <span className="text-xs text-gray-600">Fast Delivery</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Package size={16} className="text-blue-600" />
              <span className="text-xs text-gray-600">Easy Returns</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/checkout")}
              className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:shadow-sm whitespace-nowrap"
            >
              <ChevronLeft size={16} />
              Back to Address
            </motion.button>

            <MagneticButton
              onClick={handleProceedToPayment}
              strength={0.05}
              className="flex w-full justify-center items-center btn-primary group py-3.5 text-base"
            >
              <span>Proceed to Payment</span>
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </MagneticButton>
          </div>

          {/* Security Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-gray-400"
          >
            🔒 Your payment information is protected with 256-bit SSL encryption
          </motion.p>
        </div>
      </div>
    </div>
  );
}
